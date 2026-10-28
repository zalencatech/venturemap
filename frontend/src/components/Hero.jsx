import Counter from "./Counter.jsx";

// Letters float in 3D; the whole block drifts and tilts as you scroll (CSS variable --hero-p).
export default function Hero({ metadata, recordCount, countryCount }) {
  const years = metadata?.years ?? [];
  const generated = metadata?.generated_at_utc ? new Date(metadata.generated_at_utc).toUTCString() : null;
  const letters = "VentureMap".split("");

  return (
    <section id="top" className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Global business opportunity &amp; economic intelligence</p>
          <h1 aria-label="VentureMap" className="hero-title">
            {letters.map((letter, index) => (
              <span key={index} className="letter" style={{ "--i": index }} aria-hidden="true">{letter}</span>
            ))}
          </h1>
          <p className="hero-text">
            Scroll through the economic landscape of {countryCount ? `${countryCount} countries` : "the world"}:
            growth, inflation, income and digital adoption — the signals entrepreneurs read before choosing where to build.
          </p>

          {recordCount ? (
            <ul className="hero-stats">
              <li><strong><Counter value={countryCount} /></strong><span>countries</span></li>
              <li><strong>{years[0]}–{years[years.length - 1]}</strong><span>period</span></li>
              <li><strong><Counter value={recordCount} /></strong><span>country-year records</span></li>
            </ul>
          ) : null}

          <p className="hero-meta">
            Source: {metadata?.source ?? "World Bank World Development Indicators"}
            {generated && <> · Data generated {generated}</>}
          </p>
        </div>
      </div>
      <a href="#overview" className="scroll-hint" aria-label="Scroll to the overview">
        <span>Scroll</span>
        <i />
      </a>
    </section>
  );
}
