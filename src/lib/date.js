import * as XLSX from 'xlsx'

export function tryParseDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value

  // Excel serial date (from XLSX with raw:true)
  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = XLSX.SSF?.parse_date_code?.(value)
    if (parsed && parsed.y && parsed.m && parsed.d) {
      const dt = new Date(parsed.y, parsed.m - 1, parsed.d)
      if (!Number.isNaN(dt.getTime())) return dt
    }
  }

  if (typeof value !== 'string') return null
  const s = value.trim()
  if (!s) return null

  // Common formats: dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy
  const m1 = s.match(/^([0-3]?\d)[\/\-.]([0-1]?\d)[\/\-.](\d{4})$/)
  if (m1) {
    const d = Number(m1[1])
    const m = Number(m1[2])
    const y = Number(m1[3])
    const dt = new Date(y, m - 1, d)
    return Number.isNaN(dt.getTime()) ? null : dt
  }

  // ISO or Date.parse compatible
  const t = Date.parse(s)
  if (!Number.isNaN(t)) return new Date(t)

  return null
}

export function withinRange(date, startInclusive, endInclusive) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false
  if (startInclusive && date < startInclusive) return false
  if (endInclusive && date > endInclusive) return false
  return true
}

export function getPresetRange(preset) {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  if (preset === 'today') {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    return { start, end }
  }

  if (preset === 'last7') {
    const start = new Date(now)
    start.setDate(start.getDate() - 6)
    start.setHours(0, 0, 0, 0)
    return { start, end }
  }

  if (preset === 'last30') {
    const start = new Date(now)
    start.setDate(start.getDate() - 29)
    start.setHours(0, 0, 0, 0)
    return { start, end }
  }

  return { start: null, end: null }
}
