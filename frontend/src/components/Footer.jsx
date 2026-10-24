import { GITHUB_REPO_URL } from "../config.js";

export default function Footer() {
  const isPlaceholder = GITHUB_REPO_URL.includes("YOUR-USERNAME");
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <strong>VentureMap</strong> - academic project for a Programming for AI course.
          <br />
          Data: World Bank World Development Indicators. For education only, not investment or business advice.
        </div>
        <div>
          <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer">View source on GitHub</a>
          {isPlaceholder && <div className="footer-note">Placeholder link: set GITHUB_REPO_URL in frontend/src/config.js</div>}
        </div>
      </div>
    </footer>
  );
}
