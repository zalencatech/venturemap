import { INDICATORS } from "../config.js";
import { formatValue, isNum, median } from "../utils.js";
import Counter from "./Counter.jsx";
import Reveal from "./Reveal.jsx";
import Tilt from "./Tilt.jsx";

export default function SummaryCards({ metadata, records, countryCount, yearRows, year }) {
  const years = metadata.years ?? [];

  return (
    <section id="overview" className="section">
      <div className="container">
        <Reveal>
          <p className="kicker">01 · Overview</p>
          <h2>The dataset at a glance</h2>
          <p className="section-lead">Coverage of the generated dataset, and median values for the selected year and countries.</p>
        </Reveal>

        <div className="grid-4">
          <Card delay={0} label="Countries" value={<Counter value={countryCount} />} note="with at least one valid record" />
          <Card delay={80} label="Years covered" value={`${years[0]}–${years[years.length - 1]}`} note={`${years.length} years`} />
          <Card delay={160} label="Country-year records" value={<Counter value={records.length} />} note="one row per country and year" />
          <Card delay={240} label="Indicators" value={<Counter value={INDICATORS.length} />} note="World Bank WDI" />
        </div>

        <Reveal><h3 className="subheading">Median across selected countries, {year}</h3></Reveal>
        <div className="grid-4">
          {INDICATORS.map((indicator, index) => {
            const values = yearRows.map((r) => r[indicator.key]).filter(isNum);
            return (
              <Card
                key={indicator.key}
                delay={index * 80}
                accent
                label={indicator.label}
                value={formatValue(median(values), indicator.key)}
                note={`${indicator.unit} · n = ${values.length} of ${yearRows.length} countries`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Card({ label, value, note, accent, delay }) {
  return (
    <Reveal delay={delay}>
      <Tilt className={`glass stat-card${accent ? " stat-accent" : ""}`}>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-note">{note}</div>
      </Tilt>
    </Reveal>
  );
}
