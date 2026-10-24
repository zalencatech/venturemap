import { INDICATORS } from "./config.js";

export const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function median(values) {
  const nums = values.filter(isNum).sort((a, b) => a - b);
  if (nums.length === 0) return null;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}

// Pearson correlation of two equally long arrays (returns null if not computable)
export function pearson(xs, ys) {
  const n = xs.length;
  if (n < 5) return null;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let sumXY = 0, sumXX = 0, sumYY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    sumXY += dx * dy;
    sumXX += dx * dx;
    sumYY += dy * dy;
  }
  if (sumXX === 0 || sumYY === 0) return null;
  return sumXY / Math.sqrt(sumXX * sumYY);
}

// Format a value for display. Missing values show as an em dash, never as 0.
export function formatValue(value, key) {
  if (!isNum(value)) return "—";
  if (key === "gdp_per_capita_usd") return "$" + Math.round(value).toLocaleString("en-US");
  return value.toFixed(1) + "%";
}

export function indicatorInfo(key) {
  return INDICATORS.find((item) => item.key === key);
}

// Latest year in which at least half of the countries have GDP growth data
// (same rule as choose_year() in the Python analysis).
export function pickDefaultYear(records, years, countryCount) {
  let best = years[years.length - 1];
  for (let i = years.length - 1; i >= 0; i--) {
    const count = records.filter((r) => r.year === years[i] && isNum(r.gdp_growth_pct)).length;
    if (count >= countryCount / 2) {
      best = years[i];
      break;
    }
  }
  return best;
}
