import { useEffect, useState } from "react";

const LINKS = [
  ["overview", "Overview"],
  ["skyline", "3D Skyline"],
  ["countries", "Countries"],
  ["charts", "Charts"],
  ["scatter", "Internet vs income"],
  ["signals", "Signals"],
  ["compare", "Compare"],
  ["quality", "Data quality"],
  ["group", "Group info"],
];

export default function Header() {
  const [active, setActive] = useState("");

  // highlight the link of the section that is currently on screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    LINKS.forEach(([id]) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  });

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="#top" className="brand">
          <span className="brand-mark" aria-hidden="true">V</span>
          <span className="brand-name">VentureMap</span>
        </a>
        <nav aria-label="Sections" className="nav">
          {LINKS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? "active" : ""}>{label}</a>
          ))}
        </nav>
      </div>
    </header>
  );
}
