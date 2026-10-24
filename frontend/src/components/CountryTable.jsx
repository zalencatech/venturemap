import { useMemo, useState } from "react";
import { INDICATORS } from "../config.js";
import { formatValue, isNum } from "../utils.js";
import { EmptyNote } from "./States.jsx";

const COLUMNS = [{ key: "country_name", label: "Country" }, ...INDICATORS.map((i) => ({ key: i.key, label: i.short }))];

export default function CountryTable({ rows, year }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("country_name");
  const [direction, setDirection] = useState("asc");

  const visibleRows = useMemo(() => {
    const text = search.trim().toLowerCase();
    const filtered = rows.filter((r) => r.country_name.toLowerCase().includes(text));
    const factor = direction === "asc" ? 1 : -1;

    return [...filtered].sort((a, b) => {
      const x = a[sortKey];
      const y = b[sortKey];
      if (sortKey === "country_name") return x.localeCompare(y) * factor;
      // missing values always go to the bottom
      if (!isNum(x) && !isNum(y)) return 0;
      if (!isNum(x)) return 1;
      if (!isNum(y)) return -1;
      return (x - y) * factor;
    });
  }, [rows, search, sortKey, direction]);

  function changeSort(key) {
    if (key === sortKey) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setDirection(key === "country_name" ? "asc" : "desc");
    }
  }

  return (
    <section id="countries" className="section section-alt">
      <div className="container">
        <h2>Country comparison, {year}</h2>
        <p className="section-lead">Click a column heading to sort. A dash (—) means no value is available.</p>

        <div className="table-tools">
          <input
            type="search"
            className="search"
            placeholder="Search country…"
            aria-label="Search country"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <span className="muted">{visibleRows.length} of {rows.length} countries</span>
        </div>

        {rows.length === 0 ? (
          <EmptyNote>No data for the selected year and countries. Select at least one country.</EmptyNote>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      className={column.key === "country_name" ? "" : "num"}
                      aria-sort={sortKey === column.key ? (direction === "asc" ? "ascending" : "descending") : "none"}
                    >
                      <button type="button" className="sort-button" onClick={() => changeSort(column.key)}>
                        {column.label}
                        <span aria-hidden="true">{sortKey === column.key ? (direction === "asc" ? " ▲" : " ▼") : ""}</span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row.country_code}>
                    <td>{row.country_name}</td>
                    {INDICATORS.map((i) => (
                      <td key={i.key} className={`num${isNum(row[i.key]) ? "" : " missing"}`}>{formatValue(row[i.key], i.key)}</td>
                    ))}
                  </tr>
                ))}
                {visibleRows.length === 0 && (
                  <tr><td colSpan={COLUMNS.length} className="empty-cell">No country matches “{search}”.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
