import math

from src import config
from src.transform import build_analytical_table, table_to_records
from tests.synthetic_data import make_raw_by_field


def test_one_row_per_country_year_with_expected_columns():
    table = build_analytical_table(make_raw_by_field())
    assert list(table.columns) == config.FINAL_COLUMNS
    assert not table.duplicated(subset=["country_code", "year"]).any()
    assert len(table) == 3     # AAA-2020, AAA-2021, BBB-2020 (BBB-2021 has only a missing value, so it is dropped)


def test_missing_value_stays_missing_not_zero():
    table = build_analytical_table(make_raw_by_field())
    row = table[(table["country_code"] == "AAA") & (table["year"] == 2021)].iloc[0]
    assert math.isnan(row["gdp_per_capita_usd"])    # no data was given -> NaN, never 0


def test_duplicate_country_year_is_collapsed():
    table = build_analytical_table(make_raw_by_field())
    row = table[(table["country_code"] == "AAA") & (table["year"] == 2021)]
    assert len(row) == 1
    assert row.iloc[0]["inflation_pct"] == 3.0


def test_records_use_none_for_missing_values():
    records = table_to_records(build_analytical_table(make_raw_by_field()))
    aaa_2021 = [r for r in records if r["country_code"] == "AAA" and r["year"] == 2021][0]
    assert aaa_2021["internet_users_pct"] is None
    assert isinstance(aaa_2021["year"], int)
