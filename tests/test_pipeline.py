"""End-to-end run of the pipeline with a FAKE API (synthetic data, no internet needed)."""

import json

from src import config, pipeline
from tests.synthetic_data import make_raw_by_field


def test_pipeline_end_to_end_with_fake_api(tmp_path, monkeypatch):
    raw = make_raw_by_field()
    monkeypatch.setattr(pipeline, "fetch_all_indicators", lambda *args, **kwargs: raw)

    frontend_json = tmp_path / "frontend" / "venturemap.json"
    summary = pipeline.run_pipeline(data_dir=tmp_path / "data", frontend_json_path=frontend_json)

    assert summary["records_fetched"] == 12
    assert summary["records_cleaned"] == 3
    assert summary["records_rejected"] == 0
    assert summary["records_loaded"] == 3

    for name in [config.DB_FILE_NAME, config.CSV_FILE_NAME, config.JSON_FILE_NAME]:
        assert (tmp_path / "data" / name).exists()
    assert json.loads(frontend_json.read_text())["pipeline_summary"] == summary
