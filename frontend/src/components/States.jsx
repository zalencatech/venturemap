export function LoadingState() {
  return (
    <div className="container state-box" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p>Loading dataset…</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="container">
      <div className="glass state-card state-error" role="alert">
        <h2>The dataset could not be loaded</h2>
        <p>{message}</p>
        <button className="button" onClick={onRetry}>Try again</button>
      </div>
    </div>
  );
}

export function SetupState() {
  return (
    <div className="container">
      <div className="glass state-card">
        <h2>No dataset found yet</h2>
        <p>
          This website only shows real results produced by the Python pipeline, and the file
          <code>frontend/public/data/venturemap.json</code> does not exist yet. No sample data is shown.
        </p>
        <p>To create it, run in the project folder:</p>
        <pre>{`pip install -r requirements.txt
python main.py`}</pre>
        <p>
          The pipeline copies the file into <code>frontend/public/data/</code>. Commit it to GitHub and
          the website will show it after the next deployment. See the README for the full steps.
        </p>
      </div>
    </div>
  );
}

export function EmptyDatasetState() {
  return (
    <div className="container">
      <div className="glass state-card">
        <h2>The dataset is empty</h2>
        <p>The data file exists but contains no records. Re-run <code>python main.py</code> and check the log for errors.</p>
      </div>
    </div>
  );
}

export function EmptyNote({ children }) {
  return <p className="empty-note">{children}</p>;
}
