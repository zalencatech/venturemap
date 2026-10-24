"""
transform.py - TRANSFORM stage of the ETL pipeline.

Input : raw API observations, one list per indicator.
Output: ONE table with one row per country-year and one column per indicator.
"""

import logging
from functools import reduce

import pandas as pd

from src import config

log = logging.getLogger(__name__)


def observations_to_frame(observations, value_column):
    """Turn raw API observations of ONE indicator into a small table."""
    rows = []
    skipped = 0

    for obs in observations:
        try:
            country_code = obs["countryiso3code"]    # 3-letter code, e.g. "PAK"
            country_name = obs["country"]["value"]
            year = int(obs["date"])                  # the API sends the year as text
        except (KeyError, TypeError, ValueError):
            skipped += 1
            continue
        if not country_code:                          # empty code -> cannot identify the country
            skipped += 1
            continue

        # obs.get("value") is None when the World Bank has no number for that year.
        # We keep it as missing (NaN) - we never replace it with 0.
        rows.append({
            "country_code": country_code,
            "country_name": country_name,
            "year": year,
            value_column: obs.get("value"),
        })

    if skipped:
        log.warning("%s: skipped %d malformed observations", value_column, skipped)

    frame = pd.DataFrame(rows, columns=["country_code", "country_name", "year", value_column])
    frame["year"] = frame["year"].astype("int64")
    frame[value_column] = pd.to_numeric(frame[value_column], errors="coerce").astype("float64")
    return frame


def remove_duplicates(frame, value_column):
    """
    Make sure there is only one row per country-year.
    If duplicates exist, groupby().first() keeps the first NON-missing value.
    """
    duplicate_count = frame.duplicated(subset=config.KEY_COLUMNS).sum()
    if duplicate_count:
        log.warning("%s: found %d duplicate country-year rows", value_column, duplicate_count)

    return frame.groupby(config.KEY_COLUMNS, as_index=False).agg(
        {"country_name": "first", value_column: "first"}
    )


def build_analytical_table(raw_by_field):
    """Combine all indicators into the final analytical table."""
    value_frames = []
    country_names = {}

    for field_name, observations in raw_by_field.items():
        frame = observations_to_frame(observations, field_name)
        frame = remove_duplicates(frame, field_name)

        for code, name in zip(frame["country_code"], frame["country_name"]):
            country_names.setdefault(code, name)

        value_frames.append(frame[config.KEY_COLUMNS + [field_name]])

    # outer merge: a country-year is kept if ANY indicator has a row for it
    table = reduce(
        lambda left, right: left.merge(right, on=config.KEY_COLUMNS, how="outer"),
        value_frames,
    )
    table["country_name"] = table["country_code"].map(country_names)

    # A country-year where all four indicators are missing carries no information.
    before = len(table)
    table = table.dropna(subset=config.INDICATOR_FIELDS, how="all")
    if before != len(table):
        log.info("Dropped %d country-years with no data at all", before - len(table))

    table = table[config.FINAL_COLUMNS].sort_values(config.KEY_COLUMNS).reset_index(drop=True)
    return table


def table_to_records(table):
    """Convert the table to a list of dictionaries, with missing values as None (JSON null)."""
    as_objects = table.astype(object)
    cleaned = as_objects.where(table.notna(), None)
    return cleaned.to_dict(orient="records")
