const LINKS = [
  ["#overview", "Overview"],
  ["#countries", "Countries"],
  ["#charts", "Charts"],
  ["#scatter", "Internet vs income"],
  ["#compare", "Compare"],
  ["#quality", "Data quality"],
  ["#methodology", "Methodology"],
  ["#limitations", "Limitations"],
];

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="#top" className="brand">
          <span className="brand-mark" aria-hidden="true">V</span>
          <span>VentureMap</span>
        </a>
        <nav aria-label="Sections" className="nav">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </nav>
      </div>
    </header>
  );
}
