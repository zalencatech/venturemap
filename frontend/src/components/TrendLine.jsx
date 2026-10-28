import { GRID, LEGEND_STYLE, TICK, TOOLTIP } from "../theme.js";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatValue, indicatorInfo, median } from "../utils.js";
import { EmptyNote } from "./States.jsx";

const COLORS = ["#35c5c0", "#e3b45c", "#ff8a5c", "#a78bfa", "#7dd3fc", "#f472b6"];
const MAX_LINES = 6;

// A few countries -> one line each. Many countries -> one line with the median.
export default function TrendLine({ rows, field, title, countries, selectedCodes }) {
  const info = indicatorInfo(field);
  const years = [...new Set(rows.map((r) => r.year))].sort((a, b) => a - b);
  const showMedian = selectedCodes.length > MAX_LINES;

  let data;
  let lines;
  if (showMedian) {
    data = years.map((year) => ({ year, median: median(rows.filter((r) => r.year === year).map((r) => r[field])) }));
    lines = [{ key: "median", name: `Median of ${selectedCodes.length} countries`, color: COLORS[1] }];
  } else {
    const nameOf = new Map(countries.map((c) => [c.code, c.name]));
    data = years.map((year) => {
      const point = { year };
      rows.filter((r) => r.year === year).forEach((r) => { point[r.country_code] = r[field]; });
      return point;
    });
    lines = selectedCodes.map((code, index) => ({ key: code, name: nameOf.get(code), color: COLORS[index % COLORS.length] }));
  }

  return (
    <div className="glass chart-card">
      <h3>{title}</h3>
      <p className="chart-sub">
        {info.unit}
        {showMedian ? ` · select ${MAX_LINES} or fewer countries to see individual lines` : ""}
      </p>
      {rows.length === 0 ? (
        <EmptyNote>No data for the selected countries.</EmptyNote>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={GRID} />
            <XAxis dataKey="year" tick={TICK} />
            <YAxis tick={TICK} width={44} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.35)" />
            <Tooltip {...TOOLTIP} formatter={(value) => formatValue(value, field)} />
            <Legend wrapperStyle={LEGEND_STYLE} />
            {lines.map((line) => (
              <Line key={line.key} type="monotone" dataKey={line.key} name={line.name} stroke={line.color}
                    strokeWidth={2} dot={{ r: 2 }} connectNulls={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
