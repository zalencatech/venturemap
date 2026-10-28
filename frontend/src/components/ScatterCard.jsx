import { GRID, TEAL, TICK } from "../theme.js";
import { useState } from "react";
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { isNum, pearson } from "../utils.js";
import { EmptyNote } from "./States.jsx";

function PointTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="tooltip-box">
      <strong>{point.name}</strong> ({point.year})
      <div>GDP per capita: ${Math.round(point.x).toLocaleString("en-US")}</div>
      <div>Internet users: {point.y.toFixed(1)}%</div>
    </div>
  );
}

export default function ScatterCard({ yearRows, rangeRows, year }) {
  const [allYears, setAllYears] = useState(false);
  const source = allYears ? rangeRows : yearRows;

  // Only country-years where BOTH values exist can be plotted (log scale also needs x > 0).
  const points = source
    .filter((r) => isNum(r.gdp_per_capita_usd) && r.gdp_per_capita_usd > 0 && isNum(r.internet_users_pct))
    .map((r) => ({ name: r.country_name, year: r.year, x: r.gdp_per_capita_usd, y: r.internet_users_pct }));

  const r = pearson(points.map((p) => Math.log10(p.x)), points.map((p) => p.y));

  return (
    <section id="scatter" className="section">
      <div className="container">
        <p className="kicker">05 · Internet vs income</p>
        <h2>Internet usage vs GDP per capita</h2>
        <p className="section-lead">
          Each dot is one country{allYears ? "-year" : ` in ${year}`}. The horizontal axis is logarithmic because incomes differ enormously.
        </p>

        <div className="glass chart-card">
          <label className="checkbox toggle">
            <input type="checkbox" checked={allYears} onChange={(event) => setAllYears(event.target.checked)} />
            <span>Show all years instead of only {year}</span>
          </label>

          {points.length === 0 ? (
            <EmptyNote>No country has both values for this selection. Try another year: internet-use data is often published with a delay.</EmptyNote>
          ) : (
            <ResponsiveContainer width="100%" height={380}>
              <ScatterChart margin={{ top: 12, right: 24, bottom: 24, left: 4 }}>
                <CartesianGrid stroke={GRID} />
                <XAxis type="number" dataKey="x" scale="log" domain={["auto", "auto"]} name="GDP per capita"
                       tickFormatter={(v) => "$" + Math.round(v).toLocaleString("en-US")} tick={TICK}
                       label={{ value: "GDP per capita, current US$ (log scale)", position: "insideBottom", offset: -14, fontSize: 12, fill: "#a9b7cf" }} />
                <YAxis type="number" dataKey="y" domain={[0, 100]} name="Internet users" unit="%" tick={TICK} width={48} />
                <Tooltip content={<PointTooltip />} cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={points} fill={TEAL} fillOpacity={0.8} />
              </ScatterChart>
            </ResponsiveContainer>
          )}

          <p className="chart-note">
            n = {points.length} comparable observations.{" "}
            {r === null
              ? "Too few points to compute a correlation."
              : `Pearson correlation between log10(GDP per capita) and internet use: r = ${r.toFixed(2)}.`}{" "}
            Correlation shows association, not causation.
          </p>
        </div>
      </div>
    </section>
  );
}
