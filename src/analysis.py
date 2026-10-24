"""
analysis.py - Exploratory Data Analysis (EDA) on the CLEAN dataset.

Run after the pipeline:   python -m src.analysis

It answers the five project questions, prints the results, saves a text
summary to reports/eda_summary.txt and saves charts to reports/charts/.
Every number is computed from data/venturemap_clean.csv - nothing is typed by hand.
"""

from pathlib import Path

import matplotlib
matplotlib.use("Agg")   # draw charts into files, no window needed (works in Codespaces)
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

from src import config

FIELDS = config.INDICATOR_FIELDS
NICE_NAMES = {name: f"{info['label']} ({info['unit']})" for name, info in config.INDICATORS.items()}
sns.set_theme(style="whitegrid")


# ------------------------------------------------------------------ helpers
def load_clean_data(csv_path):
    return pd.read_csv(csv_path)


def choose_year(df):
    """Latest year in which at least half of the countries have GDP growth data."""
    counts = df.groupby("year")["gdp_growth_pct"].count()
    good_years = counts[counts >= df["country_code"].nunique() / 2]
    return int(good_years.index.max()) if len(good_years) else int(df["year"].max())


def choose_screening_year(df):
    """Latest year with at least 10 countries that have ALL four indicators."""
    complete = df.dropna(subset=FIELDS)
    counts = complete.groupby("year").size()
    good_years = counts[counts >= 10]
    return int(good_years.index.max()) if len(good_years) else None


def strength_word(r):
    size = abs(r)
    if size < 0.2:
        return "very weak"
    if size < 0.4:
        return "weak"
    if size < 0.6:
        return "moderate"
    if size < 0.8:
        return "strong"
    return "very strong"


# ------------------------------------------------------------------ calculations
def descriptive_stats(df):
    return df[FIELDS].describe().T.round(2)


def missing_report(df):
    """Missing count and percentage for each indicator."""
    report = pd.DataFrame({
        "missing": df[FIELDS].isna().sum(),
        "missing_pct": (df[FIELDS].isna().mean() * 100).round(1),
    })
    return report


def missing_by_year(df):
    """Percentage of missing values per indicator per year (rows = year)."""
    return (df.set_index("year")[FIELDS].isna().groupby("year").mean() * 100).round(1)


def top_growth(df, year, n=10):
    subset = df[df["year"] == year].dropna(subset=["gdp_growth_pct"])
    return subset.nlargest(n, "gdp_growth_pct")[["country_name", "gdp_growth_pct"]]


def correlation(df, column_a, column_b):
    """
    Correlation using only rows where BOTH columns have a value
    ("comparable observations"). Returns None if there are too few rows.
    """
    pairs = df[[column_a, column_b]].dropna()
    if len(pairs) < 5:
        return None
    return {
        "n": len(pairs),
        "pearson": round(pairs[column_a].corr(pairs[column_b], method="pearson"), 3),
                   "spearman": round(pairs[column_a].rank().corr(pairs[column_b].rank()), 3),
    }


def inflation_by_country(df):
    return (df.groupby("country_name")["inflation_pct"]
              .agg(["count", "mean", "median", "min", "max"])
              .round(2).sort_values("median", ascending=False))


def screening_table(df, year, n=10):
    """
    Illustrative screening, NOT a ranking of startup attractiveness.
    For the chosen year we keep countries with all four indicators, turn each
    indicator into a percentile rank (0-1) and average the four ranks.
    For inflation a LOWER value gets the higher rank.
    """
    complete = df[df["year"] == year].dropna(subset=FIELDS).copy()
    ranks = pd.DataFrame(index=complete.index)
    ranks["growth"] = complete["gdp_growth_pct"].rank(pct=True)
    ranks["inflation"] = 1 - complete["inflation_pct"].rank(pct=True) + 1 / len(complete)
    ranks["income"] = complete["gdp_per_capita_usd"].rank(pct=True)
    ranks["digital"] = complete["internet_users_pct"].rank(pct=True)
    complete["screening_score"] = ranks.mean(axis=1).round(2)
    columns = ["country_name"] + FIELDS + ["screening_score"]
    return complete.sort_values("screening_score", ascending=False)[columns].head(n)


# ------------------------------------------------------------------ charts
def save_chart(fig, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)


def chart_top_growth(df, year, path):
    data = top_growth(df, year)
    fig, ax = plt.subplots(figsize=(8, 5))
    sns.barplot(data=data, y="country_name", x="gdp_growth_pct", color="#1F8A8A", ax=ax)
    ax.set_title(f"Highest GDP growth, {year}")
    ax.set_xlabel(NICE_NAMES["gdp_growth_pct"])
    ax.set_ylabel("")
    save_chart(fig, path)


def chart_internet_vs_income(df, path):
    data = df.dropna(subset=["gdp_per_capita_usd", "internet_users_pct"])
    fig, ax = plt.subplots(figsize=(8, 5))
    sns.scatterplot(data=data, x="gdp_per_capita_usd", y="internet_users_pct",
                    hue="year", palette="viridis", ax=ax)
    ax.set_xscale("log")   # income spans a huge range, a log axis makes it readable
    ax.set_title("Internet use vs GDP per capita (each dot = one country-year)")
    ax.set_xlabel("GDP per capita, current US$ (log scale)")
    ax.set_ylabel(NICE_NAMES["internet_users_pct"])
    save_chart(fig, path)


def chart_inflation_heatmap(df, path):
    table = df.pivot(index="country_name", columns="year", values="inflation_pct")
    fig, ax = plt.subplots(figsize=(9, 8))
    sns.heatmap(table, cmap="mako_r", annot=True, fmt=".0f", linewidths=0.3,
                cbar_kws={"label": "Inflation, %"}, ax=ax)
    ax.set_title("Inflation by country and year (blank = missing)")
    ax.set_xlabel("")
    ax.set_ylabel("")
    save_chart(fig, path)


def chart_growth_vs_inflation(df, path):
    data = df.dropna(subset=["gdp_growth_pct", "inflation_pct"])
    fig, ax = plt.subplots(figsize=(8, 5))
    sns.scatterplot(data=data, x="inflation_pct", y="gdp_growth_pct", color="#0B1F3A", ax=ax)
    ax.set_xscale("symlog")   # keeps a few very high-inflation points from squashing the rest
    ax.set_title("GDP growth vs inflation (each dot = one country-year)")
    ax.set_xlabel("Inflation, % per year (symlog scale)")
    ax.set_ylabel(NICE_NAMES["gdp_growth_pct"])
    save_chart(fig, path)


def chart_missingness(df, path):
    report = missing_report(df).reset_index().rename(columns={"index": "indicator"})
    report["indicator"] = report["indicator"].map(NICE_NAMES)
    fig, ax = plt.subplots(figsize=(8, 4))
    sns.barplot(data=report, y="indicator", x="missing_pct", color="#8A94A6", ax=ax)
    ax.set_title("Share of missing values per indicator")
    ax.set_xlabel("Missing, %")
    ax.set_ylabel("")
    save_chart(fig, path)


# ------------------------------------------------------------------ report
def describe_correlation(title, result):
    if result is None:
        return [f"{title}: not enough comparable observations."]
    return [
        f"{title}",
        f"  comparable observations (n) : {result['n']}",
        f"  Pearson r  (linear)         : {result['pearson']}  -> {strength_word(result['pearson'])}",
        f"  Spearman rho (rank-based)   : {result['spearman']}  -> {strength_word(result['spearman'])}",
    ]


def run_analysis(csv_path=None, reports_dir=None, year=None):
    csv_path = Path(csv_path or config.DATA_DIR / config.CSV_FILE_NAME)
    reports_dir = Path(reports_dir or config.REPORTS_DIR)
    charts_dir = reports_dir / "charts"

    if not csv_path.exists():
        raise FileNotFoundError(f"{csv_path} not found. Run `python main.py` first.")

    df = load_clean_data(csv_path)
    year = year or choose_year(df)
    lines = []

    lines.append("VENTUREMAP - EXPLORATORY DATA ANALYSIS")
    lines.append(f"Rows (country-years): {len(df)} | countries: {df['country_code'].nunique()} "
                 f"| years: {df['year'].min()}-{df['year'].max()}")

    lines.append("\n== Descriptive statistics ==")
    lines.append(descriptive_stats(df).to_string())

    lines.append("\n== Missing values ==")
    lines.append(missing_report(df).to_string())
    lines.append("\nMissing % by year:")
    lines.append(missing_by_year(df).to_string())

    lines.append(f"\n== Q1. Highest GDP growth in {year} ==")
    lines.append(top_growth(df, year).to_string(index=False))

    lines.append("\n== Q2. Internet usage and GDP per capita ==")
    lines.append("GDP per capita is very skewed, so we also use its logarithm.")
    df["log_gdp_per_capita"] = np.log10(df["gdp_per_capita_usd"].where(df["gdp_per_capita_usd"] > 0))
    lines += describe_correlation("Internet users vs log10(GDP per capita)",
                                  correlation(df, "log_gdp_per_capita", "internet_users_pct"))

    lines.append("\n== Q3. Inflation across countries (all years) ==")
    lines.append(inflation_by_country(df).to_string())
    lines.append("\nMedian inflation across countries, by year:")
    lines.append(df.groupby("year")["inflation_pct"].median().round(2).to_string())

    lines.append("\n== Q4. GDP growth and inflation ==")
    lines += describe_correlation("GDP growth vs inflation",
                                  correlation(df, "inflation_pct", "gdp_growth_pct"))

    screening_year = choose_screening_year(df)
    lines.append("\n== Q5. Illustrative screening (growth, low inflation, income, internet) ==")
    if screening_year is None:
        lines.append("Fewer than 10 countries have all four indicators in any year - screening skipped.")
    else:
        lines.append(f"Year used: {screening_year}. Equal-weight average of percentile ranks.")
        lines.append(screening_table(df, screening_year).to_string(index=False))

    lines.append("\n== How to read these results ==")
    lines.append("* Correlation shows association only. It does NOT show that one variable causes another.")
    lines.append("* Country-years from the same country are not independent, so pooled correlations are rough guides.")
    lines.append("* No country is declared 'best for startups'. National averages say little about")
    lines.append("  a single startup: funding, talent, regulation, market access and sector all matter.")

    chart_top_growth(df, year, charts_dir / "01_top_gdp_growth.png")
    chart_internet_vs_income(df, charts_dir / "02_internet_vs_gdp_per_capita.png")
    chart_inflation_heatmap(df, charts_dir / "03_inflation_heatmap.png")
    chart_growth_vs_inflation(df, charts_dir / "04_growth_vs_inflation.png")
    chart_missingness(df, charts_dir / "05_missing_values.png")
    lines.append(f"\nCharts saved in: {charts_dir}")

    report_text = "\n".join(lines)
    reports_dir.mkdir(parents=True, exist_ok=True)
    (reports_dir / "eda_summary.txt").write_text(report_text, encoding="utf-8")
    print(report_text)
    return report_text


if __name__ == "__main__":
    run_analysis()
