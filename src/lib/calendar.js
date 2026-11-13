// shortcut: columns are 7-day chunks, not Sunday-aligned weeks; align them if the wall ever looks off
export function calendarWeeks(days, weeks = 13) {
  const n = weeks * 7;
  const counts = days.slice(-n).map(d => d.count);
  while (counts.length < n) counts.unshift(0);
  const max = Math.max(...counts);
  const grid = [];
  for (let w = 0; w < weeks; w++) {
    grid.push(counts.slice(w * 7, w * 7 + 7).map(c => (c === 0 ? 0 : Math.ceil((c / max) * 4))));
  }
  return { grid, total: counts.reduce((a, b) => a + b, 0) };
}
