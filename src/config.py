"""
config.py - every setting of the project lives here.

If you want to change the countries or the years, this is the only file
you need to edit. All other modules import their settings from here.
"""

from pathlib import Path

# ---------------------------------------------------------------- paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
REPORTS_DIR = PROJECT_ROOT / "reports"
FRONTEND_JSON_PATH = PROJECT_ROOT / "frontend" / "public" / "data" / "venturemap.json"

# ---------------------------------------------------------------- API
API_BASE_URL = "https://api.worldbank.org/v2"
SOURCE_NAME = "World Bank World Development Indicators (WDI) API"
SOURCE_URL = "https://api.worldbank.org/v2/"

REQUEST_TIMEOUT_SECONDS = 30   # give up on one request after 30 s
MAX_RETRIES = 3                # try each request up to 3 times
RETRY_WAIT_SECONDS = 2         # wait between attempts
PER_PAGE = 1000                # records per API page (the API default is only 50)

# ---------------------------------------------------------------- period
START_YEAR = 2015
END_YEAR = 2024

# ---------------------------------------------------------------- countries
# ISO-3 codes of 25 countries from different regions and income levels.
# The country names are NOT typed here: they come from the API response.
COUNTRY_CODES = [
    "USA", "CAN", "MEX", "BRA", "ARG",
    "GBR", "DEU", "FRA", "NLD", "TUR",
    "SAU", "ARE", "EGY", "NGA", "ZAF",
    "IND", "PAK", "BGD", "CHN", "JPN",
    "KOR", "IDN", "VNM", "SGP", "AUS",
]

# ---------------------------------------------------------------- indicators
# key = column name used everywhere in the project
# code = official World Bank indicator code
INDICATORS = {
    "gdp_growth_pct": {
        "code": "NY.GDP.MKTP.KD.ZG",
        "label": "GDP growth",
        "unit": "% per year",
    },
    "inflation_pct": {
        "code": "FP.CPI.TOTL.ZG",
        "label": "Inflation (consumer prices)",
        "unit": "% per year",
    },
    "gdp_per_capita_usd": {
        "code": "NY.GDP.PCAP.CD",
        "label": "GDP per capita",
        "unit": "current US$",
    },
    "internet_users_pct": {
        "code": "IT.NET.USER.ZS",
        "label": "Internet users",
        "unit": "% of population",
    },
}

INDICATOR_FIELDS = list(INDICATORS)                       # the 4 value columns
KEY_COLUMNS = ["country_code", "year"]                    # identifies one row
FINAL_COLUMNS = ["country_code", "country_name", "year"] + INDICATOR_FIELDS

# ---------------------------------------------------------------- file names
DB_FILE_NAME = "venturemap.db"
CSV_FILE_NAME = "venturemap_clean.csv"
JSON_FILE_NAME = "venturemap.json"
