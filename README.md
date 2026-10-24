# VentureMap — Global Business Opportunity & Economic Intelligence

An academic data-engineering project for the *Programming for AI* course.
A Python **ETL pipeline** downloads economic indicators from the World Bank API, cleans and validates them,
stores them in SQLite / CSV / JSON, and a **React website** presents the real generated results.

> **Status note.** The repository contains no pre-generated data. The dataset is created the first time you run the
> pipeline (see [How to reproduce](#9-how-to-reproduce-the-results)). Until then the website shows a setup message instead of numbers.
> Nothing in this project is hard-coded sample data.

---

## 1. Overview and problem statement

Entrepreneurs, students and analysts often want a quick, evidence-based picture of the economic environment of different
countries: how fast economies grow, how stable prices are, how wealthy people are and how digitally connected a country is.
That information is public but spread across many API pages with missing values, duplicates and inconsistent formats.

**Problem:** build a reproducible pipeline that turns raw World Bank API responses into one clean, validated analytical
dataset, explore it statistically, and present it in an interactive website — while being honest about what national
indicators can and cannot say about business opportunity.

## 2. Objectives

1. Extract four World Bank indicators for 25 countries over 2015–2024 (configurable).
2. Transform them into one row per country-year, preserving missing values.
3. Validate every row with Pydantic and log rejected rows with reasons.
4. Load the result into SQLite (no duplicates when re-run), CSV and JSON.
5. Explore the data (descriptive statistics, missing values, correlations, charts).
6. Present the real results in a responsive website deployed on Vercel.

## 3. Dataset, API and indicators

- Source: **World Bank – World Development Indicators**, via the official API: <https://api.worldbank.org/v2/>
- API documentation: <https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation>

| Column in this project | World Bank code | Meaning |
|---|---|---|
| `gdp_growth_pct` | `NY.GDP.MKTP.KD.ZG` | GDP growth, annual % |
| `inflation_pct` | `FP.CPI.TOTL.ZG` | Inflation, consumer prices, annual % |
| `gdp_per_capita_usd` | `NY.GDP.PCAP.CD` | GDP per capita, current US$ |
| `internet_users_pct` | `IT.NET.USER.ZS` | Individuals using the Internet, % of population |

The optional extension `IC.BUS.NREG` (new businesses registered) was **not** included: its coverage is not guaranteed to be
adequate, and the course version is meant to stay simple.

Countries (ISO-3 codes, in `src/config.py`): USA, CAN, MEX, BRA, ARG, GBR, DEU, FRA, NLD, TUR, SAU, ARE, EGY, NGA, ZAF,
IND, PAK, BGD, CHN, JPN, KOR, IDN, VNM, SGP, AUS. **Coverage varies by country and year; many observations will be missing.**

## 4. Architecture

```
World Bank API
      │  requests (pagination, retries, timeouts)
      ▼
 extract.py ──► raw JSON copies (data/raw/, not committed)
      ▼
 transform.py   pandas: one row per country-year, NaN kept as missing
      ▼
 validate.py    Pydantic: valid rows ─┐   rejected rows ► data/rejected_records.json
      ▼                                 │
 load.py ◄──────────────────────────────┘
      ├─► data/venturemap.db          SQLite  (table country_economics)
      ├─► data/venturemap_clean.csv   clean data
      └─► data/venturemap.json ──copy──► frontend/public/data/venturemap.json
                                                │
                                   React + Vite website (Vercel) reads this file
 analysis.py ◄── data/venturemap_clean.csv ──► reports/eda_summary.txt + reports/charts/*.png
```

Python and the website are separate: the website never calls Python or SQLite. It only reads one static JSON file, so no
backend server is needed. Vercel only builds the `frontend/` folder.

### Folder structure

```
venturemap/
  README.md, SETUP_GUIDE.md, requirements.txt, pytest.ini, .gitignore
  main.py                 run the pipeline:  python main.py
  src/
    config.py             all settings (countries, years, indicators, paths)
    extract.py            EXTRACT  – API calls, pagination, retries
    transform.py          TRANSFORM – clean + merge with pandas
    validate.py           VALIDATE – Pydantic model
    load.py               LOAD – SQLite, CSV, JSON
    pipeline.py           runs the four stages in order
    analysis.py           EDA:  python -m src.analysis
  tests/                  pytest tests (synthetic data only)
  data/                   generated output (CSV + JSON committed, DB and raw ignored)
  reports/                generated EDA summary and charts
  frontend/               React + Vite website
  .github/workflows/      optional button to run the pipeline on GitHub
```

### Module guide (what to explain in the viva)

| File | Important functions | What they do |
|---|---|---|
| `extract.py` | `get_json`, `parse_payload`, `fetch_indicator` | `get_json` calls the API with a timeout and up to 3 tries. `parse_payload` checks the response shape (the API returns `[metadata, observations]`, or `[{"message": ...}]` on error). `fetch_indicator` loops over all pages. |
| `transform.py` | `observations_to_frame`, `remove_duplicates`, `build_analytical_table` | Pulls country code, name, year and value from each observation; keeps `None` as `NaN`; collapses duplicate country-years; merges the 4 indicators with an outer merge on `(country_code, year)`. |
| `validate.py` | `CountryEconomics`, `validate_records` | The Pydantic model defines the rules; `validate_records` splits rows into valid and rejected (with reasons). |
| `load.py` | `load_to_sqlite`, `export_csv`, `build_dashboard_json`, `write_json` | Writes the three outputs. SQLite is refreshed inside one transaction. |
| `pipeline.py` | `run_pipeline` | Runs extract → transform → validate → load and returns the summary counts. |
| `analysis.py` | `correlation`, `screening_table`, `chart_*` | Statistics and charts for the five EDA questions. |

## 5. Dataset schema (`country_economics`)

| Field | Type | Missing allowed? | Rule |
|---|---|---|---|
| `country_code` | text | no | exactly 3 capital letters (e.g. `PAK`) |
| `country_name` | text | no | not empty |
| `year` | integer | no | between 1960 and 2100 |
| `gdp_growth_pct` | real | yes | any finite number (no arbitrary limit) |
| `inflation_pct` | real | yes | any finite number (no arbitrary limit) |
| `gdp_per_capita_usd` | real | yes | ≥ 0 |
| `internet_users_pct` | real | yes | 0 – 100 |

**Pydantic rules** (`validate.py`): country-code pattern `^[A-Z]{3}$`; year range; numeric types; non-negative GDP per capita;
internet use between 0 and 100; `NaN`/infinity rejected. Missing values are allowed (`None`). GDP growth and inflation are
deliberately *not* capped, because large negative growth and hyperinflation do occur.
A country-year in which **all four** indicators are missing is dropped during transformation (it carries no information).

**SQLite design:** one table `country_economics` with primary key `(country_code, year)`. Loading deletes the old rows and
inserts the new ones inside one transaction (`INSERT OR REPLACE`), so re-running never creates duplicates. Missing values are SQL `NULL`.
The `.db` file is generated and not committed to Git.

**Pipeline summary** (`data/pipeline_summary.json`, also shown on the website): `records_fetched` (raw API observations, all
four indicators, including blank ones), `records_cleaned` (country-year rows after transform), `records_rejected` (failed
validation), `records_loaded` (rows in SQLite).

## 6. EDA questions and charts

Run `python -m src.analysis`. It prints the answers, writes `reports/eda_summary.txt` and five charts to `reports/charts/`.

| # | Question | Method | Chart |
|---|---|---|---|
| 1 | Highest GDP growth in a selected year? | sort one year (default: latest year with data for ≥ half of the countries) | `01_top_gdp_growth.png` |
| 2 | Internet usage vs GDP per capita? | Pearson + Spearman on comparable pairs, using log10 of income | `02_internet_vs_gdp_per_capita.png` |
| 3 | How does inflation vary? | per-country summary, yearly median | `03_inflation_heatmap.png` |
| 4 | GDP growth vs inflation? | Pearson + Spearman on comparable pairs | `04_growth_vs_inflation.png` |
| 5 | Which countries combine growth, manageable inflation, income and internet use? | illustrative percentile-rank screening, one year, countries with all four indicators | (table) |
| – | Missing values | counts, percentages, by year | `05_missing_values.png` |

Correlations use only **comparable observations** (rows where both variables exist). Correlation does **not** establish causation,
and country-years from the same country are not independent. The Q5 table is a screening exercise: **no country is
declared "best for startups"**.

## 7. Installation and execution

You need Python 3.10+ (GitHub Codespaces already has it) and, for the website, Node.js 18+.

```bash
python -m venv .venv
source .venv/bin/activate          # run this again every time you open a new terminal
pip install -r requirements.txt

python main.py                     # ETL pipeline  (needs internet)
python -m src.analysis             # EDA, charts in reports/charts/
python -m pytest -q                # tests (synthetic data only, no internet needed)
```

Inspect the output in `data/`: open `venturemap_clean.csv`, or query the database:

```bash
sqlite3 data/venturemap.db "SELECT * FROM country_economics LIMIT 5;"
```

Run the website locally:

```bash
cd frontend
npm install
npm run dev        # opens on port 5173 (Codespaces shows an "Open in Browser" pop-up)
npm run build      # production build check
```

`python main.py` already copies `data/venturemap.json` to `frontend/public/data/venturemap.json`.
To change countries or years, edit `src/config.py` and re-run.

## 8. Deployment (Vercel)

1. Push the repository to GitHub, **including** `frontend/public/data/venturemap.json` (generated by the pipeline).
2. On vercel.com choose **Add New → Project**, import the repository.
3. Set **Root Directory** to `frontend`. Framework preset: **Vite**. Build command `npm run build`, output directory `dist`.
4. Deploy. Vercel only builds the website; it does **not** run Python or keep a database.
5. To update the data: re-run the pipeline, commit the new JSON, push — Vercel redeploys automatically.
6. Set your repository address in `frontend/src/config.js` (`GITHUB_REPO_URL`).

See `SETUP_GUIDE.md` for a click-by-click walkthrough that uses only the GitHub website.

## 9. How to reproduce the results

1. `pip install -r requirements.txt`
2. `python main.py` (fresh download from the API; results can differ slightly if the World Bank has revised its data).
3. `python -m src.analysis`
4. `python -m pytest -q`
5. `cd frontend && npm install && npm run build`

Raw API responses are saved in `data/raw/` for inspection. The `generated_at_utc` timestamp inside `venturemap.json` records when the data was produced.

## 10. Testing

`tests/` contains 26 tests. They use small **synthetic** records (`tests/synthetic_data.py`, clearly labelled) that only copy
the *shape* of API responses; they are never used as project data. They cover: response parsing, pagination, error responses,
transformation, missing values staying missing, duplicate country-years, Pydantic rules, SQLite loading without duplicates,
valid dashboard JSON, a full pipeline run with a fake API, the analysis helpers, and a check that the frontend config knows every JSON field.

The website was additionally smoke-tested in a headless browser during development using a throw-away synthetic file; that file is not part of the repository.

## 11. Limitations

- **Missing data:** coverage differs by country, indicator and year; recent years (especially internet use) are often incomplete.
- **Small sample:** 25 countries are not the whole world; they were chosen for variety, not by a statistical sampling method.
- **National averages** cannot tell whether an individual startup will succeed. Funding, talent, regulation, market access, sector and infrastructure are not measured.
- **Association only:** correlations are descriptive; observations are not independent; outliers (e.g. very high inflation) can dominate.
- **Current-dollar GDP per capita** moves with exchange rates and prices.
- **Data revisions:** re-running later can give different numbers.
- The screening table uses equal weights and percentile ranks chosen for simplicity; other choices would give other orders.
- Only English-language, single-source data (World Bank) is used; no cross-checking with other sources.

## 12. Viva preparation

**What is ETL?** Extract (download raw data), Transform (clean and reshape), Load (store it). Here: API → pandas → SQLite/CSV/JSON.

**Why is the API response a list of two items?** Item 0 is metadata (page number, total pages); item 1 is the list of observations. On errors the API returns a `message` instead, which `parse_payload` detects.

**How do you handle pagination?** `fetch_indicator` reads `pages` from the metadata and keeps requesting `page=1, 2, …` until the last one. I also request 1000 rows per page instead of the default 50.

**What if the API is down or slow?** `get_json` uses a 30-second timeout and retries 3 times, then raises `ExtractError`; `main.py` prints the error and stops without overwriting existing files.

**Why keep missing values as null instead of 0?** Zero is a real value (e.g. 0 % growth). Replacing "unknown" with 0 would distort averages and correlations.

**How do you avoid duplicates?** In pandas: `groupby(country_code, year).first()`. In SQLite: composite primary key plus a full refresh in one transaction.

**Why Pydantic?** It describes the rules for a valid row in one class and gives readable error messages, so rejected rows can be logged with reasons.

**Why no limits on inflation and GDP growth?** Real economies can have −50 % growth or 1000 % inflation; capping would silently delete true data.

**Why a log scale for GDP per capita?** Incomes range from hundreds to tens of thousands of dollars; on a normal axis most points would be squashed together.

**What is the difference between Pearson and Spearman?** Pearson measures linear association; Spearman measures rank (monotonic) association and is less affected by outliers.

**Does a correlation prove causation?** No. Two indicators can move together because of a third factor, or by chance.

**Can you say which country is best for startups?** No. These four national indicators omit funding, talent, regulation and sector. The screening table only shows which countries rank well on these four measures in one year.

**Why a JSON file instead of a backend?** The data changes only when the pipeline runs, so a static file is simpler, free to host and fast. Vercel cannot keep a writable SQLite database anyway.

**How do you update the website?** Re-run the pipeline, commit the new `venturemap.json`, push; Vercel redeploys.

**What would you improve?** More countries and indicators, confidence intervals, a time-series model, and comparison with additional data sources.
