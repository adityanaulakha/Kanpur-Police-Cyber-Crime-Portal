import Papa from 'papaparse'

function buildCsvUrl({ spreadsheetId, sheetName, gid }) {
  if (!spreadsheetId) throw new Error('Missing spreadsheetId')

  // Prefer sheet name (more readable), else fallback to gid.
  if (sheetName) {
    // gviz endpoint often works well for public sheets
    const encoded = encodeURIComponent(sheetName)
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encoded}`
  }

  if (gid !== undefined && gid !== null && `${gid}` !== '') {
    const encodedGid = encodeURIComponent(String(gid))
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${encodedGid}`
  }

  // Default export (usually the first sheet/tab)
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`
}

export async function fetchSheetAsTable(source) {
  const url = buildCsvUrl(source)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`शीट लोड नहीं हो पाई (${res.status})`)

  const text = await res.text()

  // Heuristic: if the sheet isn't public, Google may return an HTML page.
  if (text.trim().startsWith('<!doctype html') || text.includes('<html')) {
    throw new Error(
      'CSV के माध्यम से Google Sheet उपलब्ध नहीं है. कृपया शीट को public/published करें (या API-based तरीका इस्तेमाल करें).',
    )
  }

  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  })

  if (parsed.errors?.length) {
    const first = parsed.errors[0]
    throw new Error(first?.message || 'Google Sheets से CSV पढ़ने में समस्या हुई')
  }

  const rows = Array.isArray(parsed.data) ? parsed.data : []
  const columns = parsed.meta?.fields?.length ? parsed.meta.fields : Object.keys(rows[0] || {})

  return { columns, rows }
}
