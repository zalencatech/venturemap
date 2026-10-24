import { INDICATORS } from "../config.js";
import { formatValue, isNum, median } from "../utils.js";

export default function SummaryCards({ metadata, records, countryCount, yearRows, year }) {
  const years = metadata.years ?? [];
  const firstYear = years[0];
  const lastYear = years[years.length - 1];

  return (
    <section id="overview" className="section">
      <div className="container">
        <h2>Overview</h2>
        <p className="section-lead">Coverage of the generated dataset, and median values for the selected year and countries.</p>

        <div className="grid-4">
          <Card label="Countries" value={countryCount} note="with at least one valid record" />
          <Card label="Years covered" value={`${firstYear}–${lastYear}`} note={`${years.length} years`} />
          <Card label="Country-year records" value={records.length} note="one row per country and year" />
          <Card label="Indicators" value={INDICATORS.length} note="World Bank WDI" />
        </div>

        <h3 className="subheading">Median across selected countries, {year}</h3>
        <div className="grid-4">
          {INDICATORS.map((indicator) => {
            const values = yearRows.map((r) => r[indicator.key]).filter(isNum);
            return (
              <Card
                key={indicator.key}
                label={indicator.label}
                value={formatValue(median(values), indicator.key)}
                note={`${indicator.unit} · n = ${values.length} of ${yearRows.length} countries`}
                accent
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Card({ label, value, note, accent }) {
  return (
    <div className={`card stat-card${accent ? " stat-accent" : ""}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </div>
  );
}
