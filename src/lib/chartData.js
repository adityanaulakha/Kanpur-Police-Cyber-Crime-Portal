function toNumber(value) {
  if (typeof value === 'number') return value
  if (value === null || value === undefined) return NaN
  const cleaned = String(value).trim().replace(/,/g, '')
  if (!cleaned) return NaN
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : NaN
}

export function aggregateByKey(rows, labelKey, valueKey, limit = 20) {
  const map = new Map()

  for (const row of rows) {
    const label = String(row?.[labelKey] ?? '').trim()
    if (!label) continue

    const value = toNumber(row?.[valueKey])
    if (Number.isNaN(value)) continue

    map.set(label, (map.get(label) ?? 0) + value)
  }

  const entries = Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)

  return {
    labels: entries.map(([k]) => k),
    values: entries.map(([, v]) => v),
  }
}

export function aggregateByKeyWithOthers(rows, labelKey, valueKey, topN = 6) {
  const full = aggregateByKey(rows, labelKey, valueKey, 500)
  const labels = full.labels.slice(0, topN)
  const values = full.values.slice(0, topN)
  const restSum = full.values.slice(topN).reduce((a, b) => a + b, 0)
  if (restSum > 0) {
    labels.push('Others')
    values.push(restSum)
  }
  return { labels, values }
}

export function palette(n) {
  const base = [
    '#2563eb',
    '#16a34a',
    '#f97316',
    '#7c3aed',
    '#dc2626',
    '#0891b2',
    '#ca8a04',
    '#db2777',
    '#4b5563',
    '#0f766e',
  ]

  const colors = []
  for (let i = 0; i < n; i += 1) colors.push(base[i % base.length])
  return colors
}
