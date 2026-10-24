export default function Methodology({ metadata }) {
  const indicators = Object.values(metadata.indicators ?? {});
  return (
    <section id="methodology" className="section">
      <div className="container">
        <h2>Methodology and data sources</h2>
        <div className="grid-2">
          <div className="card prose">
            <h3>How the data was produced</h3>
            <ol>
              <li><strong>Extract</strong> - a Python script downloads each indicator from the World Bank API, page by page, with timeouts and retries.</li>
              <li><strong>Transform</strong> - pandas standardises columns and types, removes duplicate country-years and merges the indicators into one row per country and year. Missing values stay missing.</li>
              <li><strong>Validate</strong> - a Pydantic model checks country codes, years, non-negative GDP per capita and internet use between 0 and 100. Rejected rows are logged.</li>
              <li><strong>Load</strong> - results go to SQLite, CSV and the JSON file that this website reads. Nothing on this page is typed by hand.</li>
            </ol>
          </div>
          <div className="card prose">
            <h3>Source and indicators</h3>
            <p>
              Source: <a href={metadata.source_url ?? "https://api.worldbank.org/v2/"} target="_blank" rel="noreferrer">{metadata.source ?? "World Bank API"}</a>.
              Period requested: {metadata.start_year}–{metadata.end_year}.
            </p>
            <ul>
              {indicators.map((info) => (
                <li key={info.code}>
                  {info.label} ({info.unit}) -{" "}
                  <a href={`https://data.worldbank.org/indicator/${info.code}`} target="_blank" rel="noreferrer"><code>{info.code}</code></a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
