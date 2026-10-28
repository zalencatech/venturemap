import { useState } from "react";
import { INDICATORS } from "../config.js";
import { formatValue } from "../utils.js";
import Skyline from "../three/Skyline.jsx";
import Reveal from "./Reveal.jsx";
import WebGLBoundary from "./WebGLBoundary.jsx";

// A 3D bar city: one bar per country, built from the real records of the selected year.
export default function SkylineSection({ rows, year }) {
  const [metric, setMetric] = useState("gdp_growth_pct");
  const [hovered, setHovered] = useState(null);
  const sorted = [...rows].sort((a, b) => a.country_name.localeCompare(b.country_name));
  const info = INDICATORS.find((i) => i.key === metric);

  return (
    <section id="skyline" className="section">
      <div className="container">
        <Reveal>
          <p className="kicker">02 · 3D Skyline</p>
          <h2>Every country as a bar, {year}</h2>
          <p className="section-lead">
            Drag the page or move the mouse to rotate the city. Hover (or tap) a bar to read the exact values.
            Bar height uses a square-root scale so one extreme value does not flatten the others; grey tiles mean no data;
            orange bars are negative.
          </p>
        </Reveal>

        <Reveal>
          <div className="glass skyline-card">
            <div className="segmented" role="tablist" aria-label="Indicator shown by the bars">
              {INDICATORS.map((i) => (
                <button key={i.key} type="button" role="tab" aria-selected={metric === i.key}
                        className={metric === i.key ? "on" : ""} onClick={() => setMetric(i.key)}>
                  {i.short}
                </button>
              ))}
            </div>

            <div className="skyline-stage">
              <WebGLBoundary fallback={<p className="empty-note">Your browser cannot show 3D graphics (WebGL). The tables and charts below show the same data.</p>}>
                {sorted.length === 0
                  ? <p className="empty-note">No data for the selected year and countries.</p>
                  : <Skyline rows={sorted} metric={metric} onHover={setHovered} />}
              </WebGLBoundary>

              <div className={`skyline-tip${hovered ? " show" : ""}`} aria-live="polite">
                {hovered ? (
                  <>
                    <strong>{hovered.country_name}</strong>
                    {INDICATORS.map((i) => (
                      <div key={i.key} className={i.key === metric ? "hl" : ""}>
                        <span>{i.short}</span><span>{formatValue(hovered[i.key], i.key)}</span>
                      </div>
                    ))}
                  </>
                ) : <span>Bars show: {info.label} ({info.unit})</span>}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
