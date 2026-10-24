import json
import sqlite3
from pathlib import Path

from src import config
from src.load import (build_dashboard_json, count_rows, export_csv,
                      load_to_sqlite, write_json)
from tests.synthetic_data import make_valid_records

SUMMARY = {"records_fetched": 10, "records_cleaned": 2, "records_rejected": 0, "records_loaded": 2}


def test_loading_twice_does_not_create_duplicates(tmp_path):
    db_path = tmp_path / "test.db"
    load_to_sqlite(make_valid_records(), db_path)
    load_to_sqlite(make_valid_records(), db_path)       # run it again
    assert count_rows(db_path) == 2


def test_duplicate_inside_one_batch_keeps_one_row(tmp_path):
    db_path = tmp_path / "test.db"
    records = make_valid_records() + make_valid_records()[:1]
    assert load_to_sqlite(records, db_path) == 2


def test_missing_values_are_stored_as_sql_null(tmp_path):
    db_path = tmp_path / "test.db"
    load_to_sqlite(make_valid_records(), db_path)
    connection = sqlite3.connect(db_path)
    value = connection.execute(
        "SELECT gdp_per_capita_usd FROM country_economics WHERE country_code = 'BBB'").fetchone()[0]
    connection.close()
    assert value is None


def test_csv_has_the_expected_columns(tmp_path):
    csv_path = tmp_path / "clean.csv"
    export_csv(make_valid_records(), csv_path)
    assert csv_path.read_text().splitlines()[0] == ",".join(config.FINAL_COLUMNS)


def test_dashboard_json_is_valid_json_with_expected_fields(tmp_path):
    json_path = tmp_path / "venturemap.json"
    write_json(build_dashboard_json(make_valid_records(), SUMMARY), json_path)

    data = json.loads(json_path.read_text())           # fails if the file is not valid JSON
    assert set(data) == {"metadata", "pipeline_summary", "records"}
    assert set(data["records"][0]) == set(config.FINAL_COLUMNS)
    assert data["records"][1]["gdp_per_capita_usd"] is None
    assert data["metadata"]["years"] == [2020]


def test_frontend_knows_every_json_field():
    """The React app must mention each field name that the pipeline writes."""
    frontend_config = Path(config.PROJECT_ROOT / "frontend" / "src" / "config.js").read_text()
    for field in config.FINAL_COLUMNS:
        assert field in frontend_config, f"{field} is missing in frontend/src/config.js"
