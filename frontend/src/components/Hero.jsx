export default function Hero({ metadata, recordCount, countryCount }) {
  const generated = metadata?.generated_at_utc ? new Date(metadata.generated_at_utc).toUTCString() : null;
  return (
    <section id="top" className="hero">
      <div className="container">
        <p className="eyebrow">Global business opportunity &amp; economic intelligence</p>
        <h1>VentureMap</h1>
        <p className="hero-text">
          An interactive look at growth, inflation, income and digital adoption across {countryCount} countries,
          built from World Bank data processed by a reproducible Python ETL pipeline.
        </p>
        <p className="hero-meta">
          {recordCount} country-year records · Source: {metadata?.source ?? "World Bank"}
          {generated && <> · Data generated {generated}</>}
        </p>
      </div>
    </section>
  );
}
