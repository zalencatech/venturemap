// ---------------------------------------------------------------------------
// config.js - the few settings of the website.
// ---------------------------------------------------------------------------

// >>> CHANGE THIS to your own repository address <<<
export const GITHUB_REPO_URL = "https://github.com/YOUR-USERNAME/venturemap";

// The file written by the Python pipeline (frontend/public/data/venturemap.json)
export const DATA_URL = "/data/venturemap.json";

// Field names of each record in venturemap.json.
// They must match the Python pipeline (src/config.py -> FINAL_COLUMNS).
// country_code, country_name, year are the identifying fields:
export const ID_FIELDS = ["country_code", "country_name", "year"];

// The four indicator fields: gdp_growth_pct, inflation_pct, gdp_per_capita_usd, internet_users_pct
export const INDICATORS = [
  { key: "gdp_growth_pct",     label: "GDP growth",       short: "GDP growth",     unit: "% per year" },
  { key: "inflation_pct",      label: "Inflation",        short: "Inflation",      unit: "% per year" },
  { key: "gdp_per_capita_usd", label: "GDP per capita",   short: "GDP per capita", unit: "current US$" },
  { key: "internet_users_pct", label: "Internet users",   short: "Internet use",   unit: "% of population" },
];

export const INDICATOR_KEYS = INDICATORS.map((item) => item.key);
