import { GITHUB_REPO_URL } from "../config.js";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <strong>VentureMap</strong> — academic project for a Programming for AI course.
          <br />
          Data: <a href="https://api.worldbank.org/v2/" target="_blank" rel="noreferrer">World Bank World Development Indicators API</a>.
          For education only, not investment or business advice.
        </div>
        <div>
          <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer">View source on GitHub ↗</a>
        </div>
      </div>
    </footer>
  );
}
