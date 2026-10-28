import { INDICATORS } from "../config.js";
import { isNum } from "../utils.js";

const SUMMARY_ITEMS = [
  ["records_fetched", "Fetched", "raw observations from the API (4 indicators, including blank ones)"],
  ["records_cleaned", "Cleaned", "country-year rows after transformation"],
  ["records_rejected", "Rejected", "rows that failed validation"],
  ["records_loaded", "Loaded", "rows stored in SQLite"],
];

export default function DataQuality({ records, metadata, summary, countryCount }) {
  const years = metadata.years ?? [];
  const possible = countryCount * years.length;

  // share of all possible country-years that have a value
  const coverage = INDICATORS.map((i) => {
    const present = records.filter((r) => isNum(r[i.key])).length;
    return { ...i, present, pct: possible ? (present / possible) * 100 : 0 };
  });

  function yearCoverage(year, key) {
    const present = records.filter((r) => r.year === year && isNum(r[key])).length;
    return countryCount ? (present / countryCount) * 100 : 0;
  }

  return (
    <section id="quality" className="section">
      <div className="container">
        <p className="kicker">08 · Data quality</p>
        <h2>Data quality</h2>
        <p className="section-lead">
          World Bank coverage varies by country, indicator and year. Missing values are kept as missing, never filled with zero.
        </p>

        <h3 className="subheading">Pipeline statistics</h3>
        {summary ? (
          <div className="grid-4">
            {SUMMARY_ITEMS.map(([key, label, note]) => (
              <div key={key} className="glass stat-card">
                <div className="stat-label">{label}</div>
                <div className="stat-value">{summary[key]?.toLocaleString("en-US") ?? "—"}</div>
                <div className="stat-note">{note}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-note">Pipeline statistics are not included in this data file.</p>
        )}

        <h3 className="subheading">Coverage by indicator</h3>
        <div className="glass pad">
          {coverage.map((item) => (
            <div key={item.key} className="bar-row">
              <div className="bar-label">{item.label}</div>
              <div className="bar-track" role="img" aria-label={`${item.label}: ${item.pct.toFixed(0)}% available`}>
                <div className="bar-fill" style={{ width: `${item.pct}%` }} />
              </div>
              <div className="bar-value">
                {item.pct.toFixed(0)}% available · {(100 - item.pct).toFixed(0)}% missing
              </div>
            </div>
          ))}
          <p className="chart-note">Out of {possible} possible country-years ({countryCount} countries × {years.length} years).</p>
        </div>

        <h3 className="subheading">Share of countries with a value, by year</h3>
        <div className="table-wrap glass">
          <table className="heat">
            <thead>
              <tr>
                <th>Year</th>
                {INDICATORS.map((i) => <th key={i.key} className="num">{i.short}</th>)}
              </tr>
            </thead>
            <tbody>
              {years.map((year) => (
                <tr key={year}>
                  <td>{year}</td>
                  {INDICATORS.map((i) => {
                    const pct = yearCoverage(year, i.key);
                    return (
                      <td key={i.key} className="num" style={{ background: `rgba(53, 197, 192, ${0.05 + (pct / 100) * 0.45})` }}>
                        {pct.toFixed(0)}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass pad care-note">
          <h3>Read with care</h3>
          <p>
            Correlation shows association, not causation. Coverage differs by country and year, and national averages say
            little about an individual startup. These indicators do not rank where a business would succeed.
          </p>
        </div>
      </div>
    </section>
  );
}
