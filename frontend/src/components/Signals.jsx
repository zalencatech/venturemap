import { INDICATORS } from "../config.js";
import { formatValue, isNum } from "../utils.js";
import Reveal from "./Reveal.jsx";
import Tilt from "./Tilt.jsx";

// Four "market signal" cards. Each lists the top countries (real data) and explains why
// entrepreneurs look at that indicator. Rankings describe indicators only.
const SIGNALS = [
  {
    key: "gdp_growth_pct", title: "Growth momentum", pick: "high", icon: "▲",
    why: "Faster-growing economies can mean expanding demand and new customers, but growth is volatile and can reflect a rebound from a bad year.",
  },
  {
    key: "internet_users_pct", title: "Digital readiness", pick: "high", icon: "◉",
    why: "A larger online population makes online sales, apps and digital services easier to reach customers with.",
  },
  {
    key: "gdp_per_capita_usd", title: "Income level", pick: "high", icon: "$",
    why: "Higher average income usually means more spending power per customer, though it says nothing about how income is distributed.",
  },
  {
    key: "inflation_pct", title: "Price stability", pick: "abs-low", icon: "≈",
    why: "Stable prices make costs, wages and pricing easier to plan. Here, smaller absolute inflation ranks higher (deflation is also unstable).",
  },
];

function topRows(rows, signal, count = 5) {
  const usable = rows.filter((r) => isNum(r[signal.key]));
  const score = signal.pick === "abs-low" ? (r) => -Math.abs(r[signal.key]) : (r) => r[signal.key];
  return [...usable].sort((a, b) => score(b) - score(a)).slice(0, count);
}

export default function Signals({ rows, year }) {
  return (
    <section id="signals" className="section">
      <div className="container">
        <Reveal>
          <p className="kicker">06 · Entrepreneurship signals</p>
          <h2>What founders read in the numbers</h2>
          <p className="section-lead">
            Top five selected countries in {year} for each indicator. These describe the economy only —
            they are not a ranking of where a startup would succeed.
          </p>
        </Reveal>

        <div className="grid-2">
          {SIGNALS.map((signal, index) => {
            const info = INDICATORS.find((i) => i.key === signal.key);
            const top = topRows(rows, signal);
            const maxValue = Math.max(...top.map((r) => Math.abs(r[signal.key])), 0);
            return (
              <Reveal key={signal.key} delay={index * 90}>
                <Tilt className="glass signal-card" max={5}>
                  <div className="signal-head">
                    <span className="signal-icon" aria-hidden="true">{signal.icon}</span>
                    <div>
                      <h3>{signal.title}</h3>
                      <div className="chart-sub">{info.label} · {info.unit}</div>
                    </div>
                  </div>
                  <p className="signal-why">{signal.why}</p>

                  {top.length === 0 ? (
                    <p className="empty-note">No values for this selection.</p>
                  ) : (
                    <ol className="rank-list">
                      {top.map((row, i) => {
                        const width = maxValue ? (Math.abs(row[signal.key]) / maxValue) * 100 : 0;
                        return (
                          <li key={row.country_code}>
                            <span className="rank-name">{i + 1}. {row.country_name}</span>
                            <span className="rank-track"><span className="rank-fill" style={{ width: `${Math.max(width, 3)}%` }} /></span>
                            <span className="rank-value">{formatValue(row[signal.key], signal.key)}</span>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </Tilt>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
