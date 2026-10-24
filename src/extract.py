"""
extract.py - EXTRACT stage of the ETL pipeline.

Downloads data from the World Bank API. The API answers with a JSON list of
exactly two items:

    [
      {"page": 1, "pages": 1, "per_page": 1000, "total": 250, ...},   # item 0: metadata
      [ {"countryiso3code": "USA", "date": "2020", "value": -2.2,
         "country": {"id": "US", "value": "United States"}, ...},     # item 1: observations
        ... ]
    ]

When something is wrong (for example a bad indicator code) the API still
answers with HTTP 200, but item 0 contains a "message" and there is no item 1.
parse_payload() checks for all these cases.
"""

import json
import logging
import time
from pathlib import Path

import requests

from src import config

log = logging.getLogger(__name__)


class ExtractError(Exception):
    """Raised when data cannot be downloaded or the response makes no sense."""


def get_json(url, params):
    """Call the API and return decoded JSON. Retries a few times on failure."""
    last_error = None
    for attempt in range(1, config.MAX_RETRIES + 1):
        try:
            response = requests.get(url, params=params, timeout=config.REQUEST_TIMEOUT_SECONDS)
            response.raise_for_status()      # turns HTTP 4xx / 5xx into an exception
            return response.json()           # raises ValueError if body is not JSON
        except (requests.RequestException, ValueError) as error:
            last_error = error
            log.warning("Request failed (attempt %d of %d): %s", attempt, config.MAX_RETRIES, error)
            if attempt < config.MAX_RETRIES:
                time.sleep(config.RETRY_WAIT_SECONDS)
    raise ExtractError(f"Could not fetch {url} after {config.MAX_RETRIES} attempts: {last_error}")


def parse_payload(payload):
    """
    Check the shape of one API page.
    Returns (total_pages, list_of_observations).
    """
    if not isinstance(payload, list) or len(payload) == 0 or not isinstance(payload[0], dict):
        raise ExtractError("Unexpected response: expected a JSON list starting with a metadata object.")

    metadata = payload[0]

    if "message" in metadata:                # the API's way of reporting an error
        raise ExtractError(f"World Bank API returned an error message: {metadata['message']}")

    if len(payload) < 2 or payload[1] is None:
        return 1, []                         # valid answer, but no observations at all

    observations = payload[1]
    if not isinstance(observations, list):
        raise ExtractError("Unexpected response: observations are not a list.")

    try:
        total_pages = int(metadata.get("pages", 1))
    except (TypeError, ValueError):
        raise ExtractError("Unexpected response: 'pages' is not a number.")

    return total_pages, observations


def fetch_indicator(indicator_code, country_codes, start_year, end_year):
    """Download ALL pages of one indicator for the given countries and years."""
    url = f"{config.API_BASE_URL}/country/{';'.join(country_codes)}/indicator/{indicator_code}"
    all_observations = []
    page = 1
    total_pages = 1

    while page <= total_pages:
        params = {
            "format": "json",
            "date": f"{start_year}:{end_year}",
            "per_page": config.PER_PAGE,
            "page": page,
        }
        payload = get_json(url, params)
        total_pages, observations = parse_payload(payload)
        all_observations.extend(observations)
        page += 1

    log.info("Fetched %d observations for %s", len(all_observations), indicator_code)
    return all_observations


def fetch_all_indicators(country_codes=None, start_year=None, end_year=None):
    """
    Fetch every indicator listed in config.INDICATORS.
    Returns a dictionary:  {"gdp_growth_pct": [observations...], ...}
    """
    country_codes = country_codes or config.COUNTRY_CODES
    start_year = start_year or config.START_YEAR
    end_year = end_year or config.END_YEAR

    raw_by_field = {}
    for field_name, info in config.INDICATORS.items():
        raw_by_field[field_name] = fetch_indicator(info["code"], country_codes, start_year, end_year)
    return raw_by_field


def save_raw(raw_by_field, raw_dir):
    """Keep a copy of exactly what the API returned (reproducibility). Not committed to Git."""
    raw_dir = Path(raw_dir)
    raw_dir.mkdir(parents=True, exist_ok=True)
    for field_name, observations in raw_by_field.items():
        file_path = raw_dir / f"{config.INDICATORS[field_name]['code']}.json"
        file_path.write_text(json.dumps(observations, indent=2), encoding="utf-8")
