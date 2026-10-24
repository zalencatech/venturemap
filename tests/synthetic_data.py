"""
SYNTHETIC test data - NOT real World Bank numbers.

These small fake records only copy the SHAPE of a real API response so that
the unit tests can run offline. They must never be used as project data.
"""


def make_observation(code, name, year, value):
    """One observation shaped like an item of the World Bank API's second list."""
    return {
        "indicator": {"id": "TEST.INDICATOR", "value": "Synthetic indicator"},
        "country": {"id": code[:2], "value": name},
        "countryiso3code": code,
        "date": str(year),
        "value": value,
        "unit": "",
        "obs_status": "",
        "decimal": 1,
    }


def make_raw_by_field():
    """Two fake countries, two years. Includes one missing value and one duplicate."""
    return {
        "gdp_growth_pct": [
            make_observation("AAA", "Alphaland", 2020, 1.5),
            make_observation("AAA", "Alphaland", 2021, 2.5),
            make_observation("BBB", "Betaland", 2020, -3.0),
            make_observation("BBB", "Betaland", 2021, None),          # missing value
        ],
        "inflation_pct": [
            make_observation("AAA", "Alphaland", 2020, 2.0),
            make_observation("AAA", "Alphaland", 2021, 3.0),
            make_observation("AAA", "Alphaland", 2021, 3.0),          # duplicate country-year
            make_observation("BBB", "Betaland", 2020, 40.0),
        ],
        "gdp_per_capita_usd": [
            make_observation("AAA", "Alphaland", 2020, 20000.0),
            make_observation("BBB", "Betaland", 2020, 3000.0),
        ],
        "internet_users_pct": [
            make_observation("AAA", "Alphaland", 2020, 80.0),
            make_observation("BBB", "Betaland", 2020, 35.0),
        ],
    }


def make_valid_records():
    return [
        {"country_code": "AAA", "country_name": "Alphaland", "year": 2020,
         "gdp_growth_pct": 1.5, "inflation_pct": 2.0,
         "gdp_per_capita_usd": 20000.0, "internet_users_pct": 80.0},
        {"country_code": "BBB", "country_name": "Betaland", "year": 2020,
         "gdp_growth_pct": -3.0, "inflation_pct": 40.0,
         "gdp_per_capita_usd": None, "internet_users_pct": None},
    ]
