"""
validate.py - VALIDATE stage of the ETL pipeline.

A Pydantic model describes what ONE valid row looks like. Every row is
checked against it; rows that break a rule are rejected and the reasons are kept.
"""

import logging
from typing import Optional

from pydantic import BaseModel, Field, ValidationError

log = logging.getLogger(__name__)


class CountryEconomics(BaseModel):
    # exactly 3 capital letters, e.g. "PAK"
    country_code: str = Field(pattern=r"^[A-Z]{3}$")
    country_name: str = Field(min_length=1)
    year: int = Field(ge=1960, le=2100)

    # Indicators may be missing (None). allow_inf_nan=False rejects NaN / infinity.
    # We deliberately put NO limits on GDP growth or inflation: very large or
    # negative values do happen in real economies.
    gdp_growth_pct: Optional[float] = Field(default=None, allow_inf_nan=False)
    inflation_pct: Optional[float] = Field(default=None, allow_inf_nan=False)
    gdp_per_capita_usd: Optional[float] = Field(default=None, ge=0, allow_inf_nan=False)
    internet_users_pct: Optional[float] = Field(default=None, ge=0, le=100, allow_inf_nan=False)


def explain_error(error):
    """Turn a Pydantic error into short readable sentences."""
    return [f"{'.'.join(str(part) for part in item['loc'])}: {item['msg']}" for item in error.errors()]


def validate_records(records):
    """
    Check every record.
    Returns (valid_records, rejected_records).
    Each rejected item looks like {"record": {...}, "reasons": ["year: ...", ...]}.
    """
    valid = []
    rejected = []

    for record in records:
        try:
            valid.append(CountryEconomics(**record).model_dump())
        except (ValidationError, TypeError) as error:
            reasons = explain_error(error) if isinstance(error, ValidationError) else [str(error)]
            rejected.append({"record": record, "reasons": reasons})
            log.warning("Rejected %s %s: %s", record.get("country_code"), record.get("year"), "; ".join(reasons))

    log.info("Validation finished: %d valid, %d rejected", len(valid), len(rejected))
    return valid, rejected
