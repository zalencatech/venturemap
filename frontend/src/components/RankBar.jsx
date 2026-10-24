import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatValue, indicatorInfo, isNum } from "../utils.js";
import { EmptyNote } from "./States.jsx";

// Horizontal bars, one per country, sorted from high to low.
export default function RankBar({ rows, field, title }) {
  const info = indicatorInfo(field);
  const data = rows
    .filter((r) => isNum(r[field]))
    .map((r) => ({ name: r.country_name, value: r[field] }))
    .sort((a, b) => b.value - a.value);
  const missingCount = rows.length - data.length;

  return (
    <div className="card chart-card">
      <h3>{title}</h3>
      <p className="chart-sub">{info.unit}</p>
      {data.length === 0 ? (
        <EmptyNote>No values available for this selection.</EmptyNote>
      ) : (
        <div className="chart-scroll">
          <ResponsiveContainer width="100%" height={Math.max(180, data.length * 26 + 40)}>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 8 }}>
              <CartesianGrid horizontal={false} stroke="#E3E6EB" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} interval={0} />
              <Tooltip formatter={(value) => formatValue(value, field)} cursor={{ fill: "rgba(11,31,58,0.05)" }} />
              <Bar dataKey="value" name={info.label} radius={[0, 3, 3, 0]}>
                {data.map((item) => (
                  <Cell key={item.name} fill={item.value < 0 ? "#B4553A" : "#1F8A8A"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {missingCount > 0 && data.length > 0 && (
        <p className="chart-note">{missingCount} selected countr{missingCount === 1 ? "y has" : "ies have"} no value and {missingCount === 1 ? "is" : "are"} not shown.</p>
      )}
    </div>
  );
}
