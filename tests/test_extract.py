import pytest

from src import extract
from tests.synthetic_data import make_observation


def test_parse_payload_returns_pages_and_observations():
    payload = [{"page": 1, "pages": 3}, [make_observation("AAA", "Alphaland", 2020, 1.0)]]
    pages, observations = extract.parse_payload(payload)
    assert pages == 3
    assert len(observations) == 1


def test_parse_payload_error_message_raises():
    payload = [{"message": [{"id": "120", "key": "Invalid value", "value": "bad indicator"}]}]
    with pytest.raises(extract.ExtractError):
        extract.parse_payload(payload)


def test_parse_payload_malformed_raises():
    with pytest.raises(extract.ExtractError):
        extract.parse_payload({"not": "a list"})


def test_parse_payload_without_observations_is_empty():
    pages, observations = extract.parse_payload([{"page": 1, "pages": 1}, None])
    assert observations == []


def test_fetch_indicator_reads_every_page(monkeypatch):
    """Pagination: the function must keep requesting pages until the last one."""
    pages = {
        1: [{"pages": 2}, [make_observation("AAA", "Alphaland", 2020, 1.0)]],
        2: [{"pages": 2}, [make_observation("AAA", "Alphaland", 2021, 2.0)]],
    }
    monkeypatch.setattr(extract, "get_json", lambda url, params: pages[params["page"]])
    result = extract.fetch_indicator("TEST", ["AAA"], 2020, 2021)
    assert [obs["date"] for obs in result] == ["2020", "2021"]
