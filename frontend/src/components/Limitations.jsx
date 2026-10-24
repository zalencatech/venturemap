const NOTES = [
  ["Correlation is not causation", "Charts and correlations show that two indicators move together in this sample. They do not show that one causes the other."],
  ["Missing data", "Coverage differs by country and year, and the most recent years are often incomplete. Comparisons only use observations that exist."],
  ["National averages hide detail", "A country-level figure says little about a particular city, sector or company."],
  ["Not a startup ranking", "Four economic indicators cannot say where a startup would succeed. Funding, talent, regulation, market access, infrastructure and sector all matter, and none are measured here. No country is labelled the best for startups."],
  ["Limited sample", "Only a small set of representative countries is included, so results do not describe the whole world."],
  ["Mixed measures", "GDP per capita is in current US dollars, so it moves with exchange rates and prices. Inflation can be extreme in a few countries and year-to-year growth can be volatile."],
  ["Data revisions", "The World Bank revises its series. Re-running the pipeline later may produce different numbers."],
];

export default function Limitations() {
  return (
    <section id="limitations" className="section section-alt">
      <div className="container">
        <h2>Limitations and interpretation notes</h2>
        <div className="grid-2">
          {NOTES.map(([title, text]) => (
            <div key={title} className="card note-card">
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
