"""Tests of the analysis helpers, using a tiny SYNTHETIC table."""

import pandas as pd

from src.analysis import correlation, top_growth


def make_table():
    return pd.DataFrame({
        "country_name": ["A", "B", "C", "D", "E", "F"],
        "year": [2020] * 6,
        "gdp_growth_pct": [1.0, 2.0, 3.0, 4.0, 5.0, None],
        "inflation_pct": [10.0, 8.0, 6.0, 4.0, 2.0, 1.0],
    })


def test_correlation_uses_only_complete_pairs():
    result = correlation(make_table(), "inflation_pct", "gdp_growth_pct")
    assert result["n"] == 5                 # row F has a missing growth value
    assert result["pearson"] == -1.0        # perfectly opposite in this fake data


def test_correlation_with_too_few_rows_is_none():
    assert correlation(make_table().head(3), "inflation_pct", "gdp_growth_pct") is None


def test_top_growth_is_sorted_and_ignores_missing():
    result = top_growth(make_table(), 2020, n=2)
    assert list(result["country_name"]) == ["E", "D"]
