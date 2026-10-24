from src.validate import validate_records
from tests.synthetic_data import make_valid_records


def good_record(**changes):
    record = dict(make_valid_records()[0])
    record.update(changes)
    return record


def test_valid_records_pass_and_missing_values_are_allowed():
    valid, rejected = validate_records(make_valid_records())   # second record has None values
    assert len(valid) == 2
    assert rejected == []


def test_negative_growth_and_huge_inflation_are_allowed():
    valid, rejected = validate_records([good_record(gdp_growth_pct=-25.0, inflation_pct=500.0)])
    assert len(valid) == 1


def test_bad_country_code_is_rejected():
    valid, rejected = validate_records([good_record(country_code="us")])
    assert valid == []
    assert "country_code" in rejected[0]["reasons"][0]


def test_negative_gdp_per_capita_is_rejected():
    valid, rejected = validate_records([good_record(gdp_per_capita_usd=-1.0)])
    assert len(rejected) == 1


def test_internet_percentage_must_be_between_0_and_100():
    valid, rejected = validate_records([good_record(internet_users_pct=101.0),
                                        good_record(internet_users_pct=-1.0)])
    assert len(rejected) == 2


def test_nan_is_rejected():
    valid, rejected = validate_records([good_record(inflation_pct=float("nan"))])
    assert len(rejected) == 1


def test_year_must_be_a_number():
    valid, rejected = validate_records([good_record(year="twenty")])
    assert len(rejected) == 1
