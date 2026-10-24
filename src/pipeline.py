"""
pipeline.py - runs Extract -> Transform -> Validate -> Load in order.
"""

import json
import logging
import shutil
from pathlib import Path

from src import config
from src.extract import fetch_all_indicators, save_raw
from src.load import (build_dashboard_json, count_rows, export_csv,
                      load_to_sqlite, write_json)
from src.transform import build_analytical_table, table_to_records
from src.validate import validate_records

log = logging.getLogger(__name__)


class PipelineError(Exception):
    """Raised when the pipeline cannot produce a usable dataset."""


def run_pipeline(data_dir=config.DATA_DIR, frontend_json_path=config.FRONTEND_JSON_PATH):
    data_dir = Path(data_dir)
    data_dir.mkdir(parents=True, exist_ok=True)

    # 1. EXTRACT
    log.info("Step 1/4: extracting from the World Bank API")
    raw_by_field = fetch_all_indicators()
    save_raw(raw_by_field, data_dir / "raw")
    fetched_count = sum(len(items) for items in raw_by_field.values())

    # 2. TRANSFORM
    log.info("Step 2/4: transforming")
    table = build_analytical_table(raw_by_field)
    records = table_to_records(table)

    # 3. VALIDATE
    log.info("Step 3/4: validating")
    valid_records, rejected_records = validate_records(records)
    (data_dir / "rejected_records.json").write_text(
        json.dumps(rejected_records, indent=2, default=str), encoding="utf-8"
    )
    if not valid_records:
        # stop here so we never overwrite a good dashboard file with an empty one
        raise PipelineError("No valid records were produced. Nothing was written to the dashboard file.")

    # 4. LOAD
    log.info("Step 4/4: loading")
    db_path = data_dir / config.DB_FILE_NAME
    load_to_sqlite(valid_records, db_path)
    export_csv(valid_records, data_dir / config.CSV_FILE_NAME)

    summary = {
        "records_fetched": fetched_count,               # raw observations from the API (all 4 indicators)
        "records_fetched_by_indicator": {name: len(items) for name, items in raw_by_field.items()},
        "records_cleaned": len(records),                # country-year rows after transform
        "records_rejected": len(rejected_records),      # failed Pydantic validation
        "records_loaded": count_rows(db_path),          # rows now in SQLite
    }

    dashboard = build_dashboard_json(valid_records, summary)
    json_path = data_dir / config.JSON_FILE_NAME
    write_json(dashboard, json_path)
    (data_dir / "pipeline_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")

    # copy the dashboard file to where the website reads it
    if frontend_json_path is not None:
        frontend_json_path = Path(frontend_json_path)
        frontend_json_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(json_path, frontend_json_path)

    log.info("Pipeline summary: %s", summary)
    return summary
