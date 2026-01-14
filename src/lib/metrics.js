function toNumber(value) {
  if (typeof value === 'number') return value
  if (value === null || value === undefined) return NaN
  const cleaned = String(value).trim().replace(/,/g, '')
  if (!cleaned) return NaN
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : NaN
}

export function summarizeNumeric(rows, valueKey) {
  let count = 0
  let sum = 0
  let min = Infinity
  let max = -Infinity

  for (const row of rows) {
    const n = toNumber(row?.[valueKey])
    if (Number.isNaN(n)) continue
    count += 1
    sum += n
    if (n < min) min = n
    if (n > max) max = n
  }

  const avg = count ? sum / count : 0

  return {
    count,
    sum,
    avg,
    min: Number.isFinite(min) ? min : 0,
    max: Number.isFinite(max) ? max : 0,
  }
}

export function countDistinct(rows, key) {
  const set = new Set()
  for (const row of rows) {
    const v = row?.[key]
    const s = String(v ?? '').trim()
    if (s) set.add(s)
  }
  return set.size
}

export function formatCompactNumber(n) {
  if (!Number.isFinite(n)) return '0'
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatNumber(n, fractionDigits = 0) {
  if (!Number.isFinite(n)) return '0'
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(n)
}
