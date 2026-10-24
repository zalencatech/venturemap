export default function Filters({ years, year, onYearChange, countries, selectedCodes, onSelectedChange }) {
  const selected = new Set(selectedCodes);

  function toggle(code) {
    const next = new Set(selected);
    next.has(code) ? next.delete(code) : next.add(code);
    onSelectedChange(countries.map((c) => c.code).filter((c) => next.has(c)));
  }

  return (
    <section className="filters" aria-label="Filters">
      <div className="container filters-inner">
        <label className="field">
          <span>Year</span>
          <select value={year} onChange={(event) => onYearChange(Number(event.target.value))}>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>

        <details className="country-filter">
          <summary>Countries ({selectedCodes.length} of {countries.length} selected)</summary>
          <div className="country-filter-body">
            <div className="button-row">
              <button type="button" className="button button-small" onClick={() => onSelectedChange(countries.map((c) => c.code))}>Select all</button>
              <button type="button" className="button button-small button-ghost" onClick={() => onSelectedChange([])}>Clear</button>
            </div>
            <div className="checkbox-grid">
              {countries.map((country) => (
                <label key={country.code} className="checkbox">
                  <input type="checkbox" checked={selected.has(country.code)} onChange={() => toggle(country.code)} />
                  <span>{country.name}</span>
                </label>
              ))}
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
