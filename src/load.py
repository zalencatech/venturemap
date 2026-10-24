"""
load.py - LOAD stage of the ETL pipeline.

Writes the validated records to:
  * a SQLite database  (table country_economics)
  * a CSV file
  * a JSON file that the website reads
"""

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

from src import config

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS country_economics (
    country_code        TEXT    NOT NULL,
    country_name        TEXT    NOT NULL,
    year                INTEGER NOT NULL,
    gdp_growth_pct      REAL,
    inflation_pct       REAL,
    gdp_per_capita_usd  REAL,
    internet_users_pct  REAL,
    PRIMARY KEY (country_code, year)
)
"""

INSERT_SQL = """
INSERT OR REPLACE INTO country_economics
    (country_code, country_name, year,
     gdp_growth_pct, inflation_pct, gdp_per_capita_usd, internet_users_pct)
VALUES
    (:country_code, :country_name, :year,
     :gdp_growth_pct, :inflation_pct, :gdp_per_capita_usd, :internet_users_pct)
"""


def load_to_sqlite(records, db_path):
    """
    Full refresh of the table, so running the pipeline twice never creates duplicates:
      1. delete the old rows
      2. insert the new ones (INSERT OR REPLACE + primary key = one row per country-year)
    """
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(db_path)
    try:
        with connection:                      # one transaction: all-or-nothing
            connection.execute(CREATE_TABLE_SQL)
            connection.execute("DELETE FROM country_economics")
            connection.executemany(INSERT_SQL, records)
        return count_rows(db_path)
    finally:
        connection.close()


def count_rows(db_path):
    connection = sqlite3.connect(db_path)
    try:
        return connection.execute("SELECT COUNT(*) FROM country_economics").fetchone()[0]
    finally:
        connection.close()


def export_csv(records, csv_path):
    """Save the clean data. Missing values become empty cells."""
    Path(csv_path).parent.mkdir(parents=True, exist_ok=True)
    pd.DataFrame(records, columns=config.FINAL_COLUMNS).to_csv(csv_path, index=False)


def build_dashboard_json(records, summary):
    """Build the dictionary that becomes venturemap.json (read by the website)."""
    years = sorted({record["year"] for record in records})
    countries = sorted({record["country_code"] for record in records})
    return {
        "metadata": {
            "generated_at_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "source": config.SOURCE_NAME,
            "source_url": config.SOURCE_URL,
            "start_year": config.START_YEAR,
            "end_year": config.END_YEAR,
            "years": years,
            "countries": countries,
            "indicators": config.INDICATORS,
        },
        "pipeline_summary": summary,
        "records": records,
    }


def write_json(data, json_path):
    """allow_nan=False makes Python raise an error instead of writing invalid JSON."""
    Path(json_path).parent.mkdir(parents=True, exist_ok=True)
    with open(json_path, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=1, allow_nan=False)
