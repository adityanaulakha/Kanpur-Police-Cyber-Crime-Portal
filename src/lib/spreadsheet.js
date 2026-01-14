import * as XLSX from 'xlsx'
import Papa from 'papaparse'

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
    reader.onload = () => resolve(reader.result)
    reader.readAsArrayBuffer(file)
  })
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
    reader.onload = () => resolve(reader.result)
    reader.readAsText(file)
  })
}

function normalizeHeader(headerValue, index) {
  const value = (headerValue ?? '').toString().trim()
  if (value) return value
  return `Column ${index + 1}`
}

function sheetToRowsAndColumns(worksheet) {
  const matrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true })
  const headerRow = Array.isArray(matrix[0]) ? matrix[0] : []
  const columns = headerRow.map((h, i) => normalizeHeader(h, i))

  const rows = []
  for (let rowIndex = 1; rowIndex < matrix.length; rowIndex += 1) {
    const rowArr = Array.isArray(matrix[rowIndex]) ? matrix[rowIndex] : []
    const rowObj = {}

    for (let colIndex = 0; colIndex < columns.length; colIndex += 1) {
      rowObj[columns[colIndex]] = rowArr[colIndex] ?? ''
    }

    // Skip completely empty rows
    const hasAnyValue = Object.values(rowObj).some((v) => `${v}`.trim() !== '')
    if (hasAnyValue) rows.push(rowObj)
  }

  return { columns, rows }
}

function parseCsvToRowsAndColumns(csvText) {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  })

  if (parsed.errors?.length) {
    const first = parsed.errors[0]
    throw new Error(first?.message || 'Failed to parse CSV')
  }

  const rows = Array.isArray(parsed.data) ? parsed.data : []
  const columns = parsed.meta?.fields?.length ? parsed.meta.fields : Object.keys(rows[0] || {})

  return { columns, rows }
}

export async function parseSpreadsheetFile(file) {
  const lower = file.name.toLowerCase()

  if (lower.endsWith('.csv')) {
    const text = await readFileAsText(file)
    const { columns, rows } = parseCsvToRowsAndColumns(text)
    return {
      fileName: file.name,
      sheets: [
        {
          sheetName: 'CSV',
          columns,
          rows,
        },
      ],
    }
  }

  const buffer = await readFileAsArrayBuffer(file)
  const workbook = XLSX.read(buffer, { type: 'array' })

  const sheets = workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName]
    const { columns, rows } = sheetToRowsAndColumns(worksheet)
    return { sheetName, columns, rows }
  })

  return {
    fileName: file.name,
    sheets,
  }
}

export function inferColumnTypes(rows, columns) {
  const numericColumns = []
  const textColumns = []

  for (const col of columns) {
    let numericCount = 0
    let nonEmptyCount = 0

    for (const row of rows) {
      const value = row?.[col]
      if (value === null || value === undefined || `${value}`.trim() === '') continue
      nonEmptyCount += 1

      const n = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''))
      if (!Number.isNaN(n) && Number.isFinite(n)) numericCount += 1
    }

    // Consider a column numeric if most non-empty values are numeric
    if (nonEmptyCount > 0 && numericCount / nonEmptyCount >= 0.8) numericColumns.push(col)
    else textColumns.push(col)
  }

  return { numericColumns, textColumns }
}
