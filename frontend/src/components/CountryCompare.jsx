import { useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { INDICATORS } from "../config.js";
import { formatValue, indicatorInfo, median } from "../utils.js";

export default function CountryCompare({ countries, rangeRows, allRecords, year, selectedCodes }) {
  const [codeA, setCodeA] = useState(selectedCodes[0] ?? countries[0]?.code);
  const [codeB, setCodeB] = useState(selectedCodes[1] ?? countries[1]?.code ?? countries[0]?.code);
  const [field, setField] = useState("gdp_growth_pct");

  const nameOf = (code) => countries.find((c) => c.code === code)?.name ?? code;
  const valueFor = (code, key) => allRecords.find((r) => r.country_code === code && r.year === year)?.[key];
  const medianFor = (key) => median(rangeRows.filter((r) => r.year === year).map((r) => r[key]));

  const years = [...new Set(allRecords.map((r) => r.year))].sort((a, b) => a - b);
  const lineData = years.map((y) => ({
    year: y,
    a: allRecords.find((r) => r.country_code === codeA && r.year === y)?.[field] ?? null,
    b: allRecords.find((r) => r.country_code === codeB && r.year === y)?.[field] ?? null,
  }));
  const info = indicatorInfo(field);

  return (
    <section id="compare" className="section">
      <div className="container">
        <h2>Country-level comparison</h2>
        <p className="section-lead">Pick two countries (any countries, regardless of the filter above) to compare side by side.</p>

        <div className="compare-controls">
          <CountrySelect label="Country A" value={codeA} onChange={setCodeA} countries={countries} />
          <CountrySelect label="Country B" value={codeB} onChange={setCodeB} countries={countries} />
        </div>

        <div className="grid-2">
          <div className="card">
            <h3>Indicators in {year}</h3>
            <div className="table-wrap">
              <table className="compact">
                <thead>
                  <tr>
                    <th>Indicator</th>
                    <th className="num">{nameOf(codeA)}</th>
                    <th className="num">{nameOf(codeB)}</th>
                    <th className="num">Selected median</th>
                  </tr>
                </thead>
                <tbody>
                  {INDICATORS.map((i) => (
                    <tr key={i.key}>
                      <td>{i.short}</td>
                      <td className="num">{formatValue(valueFor(codeA, i.key), i.key)}</td>
                      <td className="num">{formatValue(valueFor(codeB, i.key), i.key)}</td>
                      <td className="num">{formatValue(medianFor(i.key), i.key)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card chart-card">
            <div className="chart-head">
              <h3>Over time</h3>
              <select value={field} onChange={(event) => setField(event.target.value)} aria-label="Indicator">
                {INDICATORS.map((i) => <option key={i.key} value={i.key}>{i.label}</option>)}
              </select>
            </div>
            <p className="chart-sub">{info.unit}</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lineData} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid stroke="#E3E6EB" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} width={52} />
                <Tooltip formatter={(value) => formatValue(value, field)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="a" name={nameOf(codeA)} stroke="#0B1F3A" strokeWidth={2} dot={{ r: 2 }} connectNulls={false} />
                <Line type="monotone" dataKey="b" name={nameOf(codeB)} stroke="#1F8A8A" strokeWidth={2} dot={{ r: 2 }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

function CountrySelect({ label, value, onChange, countries }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
      </select>
    </label>
  );
}
