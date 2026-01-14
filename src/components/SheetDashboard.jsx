import { useMemo, useState } from 'react'
import { Bar, Pie } from 'react-chartjs-2'
import ChartCard from './ChartCard.jsx'
import DataTable from './DataTable.jsx'
import DateRangePicker from './DateRangePicker.jsx'
import StatCard from './StatCard.jsx'
import { inferColumnTypes } from '../lib/spreadsheet.js'
import { aggregateByKey, aggregateByKeyWithOthers, palette } from '../lib/chartData.js'
import { countDistinct, formatCompactNumber, formatNumber, summarizeNumeric } from '../lib/metrics.js'
import { getPresetRange, tryParseDate, withinRange } from '../lib/date.js'

function findMatchingColumns(columns, regex) {
  return columns.filter((c) => regex.test(String(c)))
}

function Select({ label, value, onChange, options, disabled }) {
  return (
    <label className="flex w-full items-center gap-1 sm:w-auto sm:gap-2">
      <span className="whitespace-nowrap text-xs font-medium text-white/90">{label}</span>
      <select
        className="h-8 flex-1 rounded-lg border border-white/15 bg-white/10 px-2 text-xs text-white outline-none backdrop-blur disabled:opacity-50 sm:h-9 sm:flex-initial sm:rounded-xl sm:px-3"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-slate-900">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function SectionHeader({ title, subtitle, children }) {
  return (
    <div className="w-full max-w-full overflow-hidden rounded-xl border border-white/10 bg-linear-to-r from-slate-900 via-slate-900 to-slate-800 px-3 py-3 shadow-sm sm:rounded-2xl sm:px-4 sm:py-4">
      <div className="flex flex-col gap-2 sm:gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-white sm:text-base md:text-lg">{title}</div>
          {subtitle ? <div className="mt-0.5 truncate text-xs text-white/70">{subtitle}</div> : null}
        </div>
        <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function SheetDashboard({
  fileName,
  sheetName,
  columns,
  rows,
  formLink,
  globalDateRange = { preset: 'all', start: null, end: null },
  onGlobalDateRangeChange,
  globalSearch = '',
}) {
  const { numericColumns, textColumns } = useMemo(
    () => inferColumnTypes(rows, columns),
    [rows, columns],
  )

  const dateCandidates = useMemo(
    () => findMatchingColumns(columns, /(date|दिनांक)/i),
    [columns],
  )
  const thanaCandidates = useMemo(
    () => findMatchingColumns(columns, /(thana|थाना)/i),
    [columns],
  )

  const defaultLabel = textColumns[0] || columns[0] || ''
  const defaultValue = numericColumns[0] || ''
  const defaultDateCol = dateCandidates[0] || ''
  const defaultThanaCol = thanaCandidates[0] || ''

  const [labelCol, setLabelCol] = useState(defaultLabel)
  const [valueCol, setValueCol] = useState(defaultValue)
  const [dateCol, setDateCol] = useState(defaultDateCol)
  const [thanaCol, setThanaCol] = useState(defaultThanaCol)
  const [thanaValue, setThanaValue] = useState('all')
  const [search, setSearch] = useState('')

  const thanaOptions = useMemo(() => {
    if (!thanaCol) return []
    const set = new Set()
    for (const r of rows) {
      const v = String(r?.[thanaCol] ?? '').trim()
      if (v) set.add(v)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'en'))
  }, [rows, thanaCol])

  const filteredRows = useMemo(() => {
    let out = rows

    if (dateCol && globalDateRange?.preset && globalDateRange.preset !== 'all') {
      const { preset, start: customStart, end: customEnd } = globalDateRange
      const resolved =
        preset === 'custom'
          ? { start: customStart ? new Date(customStart) : null, end: customEnd ? new Date(customEnd) : null }
          : getPresetRange(preset)

      const { start, end } = resolved
      out = out.filter((r) => {
        const dt = tryParseDate(r?.[dateCol])
        return dt ? withinRange(dt, start, end) : false
      })
    }

    if (thanaCol && thanaValue !== 'all') {
      out = out.filter((r) => String(r?.[thanaCol] ?? '').trim() === thanaValue)
    }

    const local = search.trim().toLowerCase()
    const global = String(globalSearch || '').trim().toLowerCase()

    if (global) {
      out = out.filter((r) => JSON.stringify(r).toLowerCase().includes(global))
    }
    if (local) {
      out = out.filter((r) => JSON.stringify(r).toLowerCase().includes(local))
    }

    return out
  }, [rows, dateCol, globalDateRange, thanaCol, thanaValue, search, globalSearch])

  const numericSummary = useMemo(() => {
    if (!valueCol) return null
    return summarizeNumeric(filteredRows, valueCol)
  }, [filteredRows, valueCol])

  const distinctLabels = useMemo(() => {
    if (!labelCol) return 0
    return countDistinct(filteredRows, labelCol)
  }, [filteredRows, labelCol])

  const barAgg = useMemo(() => {
    if (!labelCol || !valueCol) return { labels: [], values: [] }
    return aggregateByKey(filteredRows, labelCol, valueCol, 12)
  }, [filteredRows, labelCol, valueCol])

  const pieAgg = useMemo(() => {
    if (!labelCol || !valueCol) return { labels: [], values: [] }
    return aggregateByKeyWithOthers(filteredRows, labelCol, valueCol, 6)
  }, [filteredRows, labelCol, valueCol])

  const barData = useMemo(() => {
    const colors = palette(barAgg.labels.length)
    return {
      labels: barAgg.labels,
      datasets: [
        {
          label: valueCol || 'Value',
          data: barAgg.values,
          backgroundColor: colors,
          borderRadius: 8,
        },
      ],
    }
  }, [barAgg, valueCol])

  const pieData = useMemo(() => {
    const colors = palette(pieAgg.labels.length)
    return {
      labels: pieAgg.labels,
      datasets: [
        {
          data: pieAgg.values,
          backgroundColor: colors,
        },
      ],
    }
  }, [pieAgg])

  const chartOptionsBar = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { ticks: { color: '#334155', font: { size: 11 } }, grid: { display: false } },
      y: { ticks: { color: '#334155', font: { size: 11 } }, grid: { color: '#e2e8f0' } },
    },
  }

  const chartOptionsPie = {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      tooltip: { enabled: true },
    },
  }

  const columnsForTable = useMemo(() => columns.slice(0, 12), [columns])

  return (
    <section className="scroll-mt-24">
      <SectionHeader
        title={sheetName}
        subtitle={`${fileName} • ${filteredRows.length} पंक्तियाँ (फ़िल्टर के बाद)`}
      >
        <div className="flex flex-wrap items-center gap-2">
          {formLink && (
            <a
              href={formLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center justify-center rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 px-3 text-xs font-semibold text-white shadow-sm hover:from-green-700 hover:to-emerald-600 sm:h-9 sm:rounded-xl sm:px-4"
            >
              Form Link
            </a>
          )}
          <DateRangePicker
            value={globalDateRange}
            onChange={(next) => onGlobalDateRangeChange?.(next)}
          />

          <label className="flex w-full items-center gap-2 sm:w-auto">
            <span className="text-xs font-medium text-white/90">खोज</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="फ़िल्टर करने के लिए लिखें"
              className="h-8 flex-1 rounded-lg border border-white/15 bg-white/10 px-2 text-xs text-white outline-none placeholder:text-white/50 backdrop-blur sm:h-9 sm:w-40 sm:rounded-xl sm:px-3 md:w-48"
            />
          </label>

          <Select
            label="Date"
            value={dateCol || 'none'}
            onChange={(v) => setDateCol(v === 'none' ? '' : v)}
            disabled={dateCandidates.length === 0}
            options={[
              { value: 'none', label: dateCandidates.length ? 'None' : 'No date column' },
              ...dateCandidates.map((c) => ({ value: c, label: c })),
            ]}
          />

          <Select
            label="थाना"
            value={thanaCol || 'none'}
            onChange={(v) => {
              const col = v === 'none' ? '' : v
              setThanaCol(col)
              setThanaValue('all')
            }}
            disabled={thanaCandidates.length === 0}
            options={[
              { value: 'none', label: thanaCandidates.length ? 'कोई नहीं' : 'थाना कॉलम नहीं मिला' },
              ...thanaCandidates.map((c) => ({ value: c, label: c })),
            ]}
          />

          <Select
            label="चयन"
            value={thanaValue}
            onChange={setThanaValue}
            disabled={!thanaCol}
            options={[
              { value: 'all', label: 'सभी' },
              ...thanaOptions.map((t) => ({ value: t, label: t })),
            ]}
          />

          <Select
            label="ग्रुप"
            value={labelCol || 'none'}
            onChange={(v) => setLabelCol(v === 'none' ? '' : v)}
            disabled={columns.length === 0}
            options={[
              { value: 'none', label: 'कोई नहीं' },
              ...columns.map((c) => ({ value: c, label: c })),
            ]}
          />

          <Select
            label="मेट्रिक"
            value={valueCol || 'none'}
            onChange={(v) => setValueCol(v === 'none' ? '' : v)}
            disabled={numericColumns.length === 0}
            options={[
              { value: 'none', label: numericColumns.length ? 'कोई नहीं' : 'न्यूमेरिक कॉलम नहीं मिला' },
              ...numericColumns.map((c) => ({ value: c, label: c })),
            ]}
          />
        </div>
      </SectionHeader>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
        <StatCard title="कुल रिकॉर्ड" value={formatNumber(filteredRows.length)} subtitle="फ़िल्टर के बाद" />
        <StatCard
          title="समूह"
          value={formatNumber(distinctLabels)}
          subtitle={labelCol ? `${labelCol} में यूनिक` : 'ग्रुप कॉलम चुनें'}
        />
        <StatCard
          title="योग"
          value={numericSummary ? formatCompactNumber(numericSummary.sum) : '—'}
          subtitle={valueCol ? valueCol : 'मेट्रिक कॉलम चुनें'}
        />
        <StatCard
          title="औसत"
          value={numericSummary ? formatCompactNumber(numericSummary.avg) : '—'}
          subtitle={valueCol ? valueCol : 'मेट्रिक कॉलम चुनें'}
        />
        <StatCard
          title="अधिकतम"
          value={numericSummary ? formatCompactNumber(numericSummary.max) : '—'}
          subtitle={valueCol ? valueCol : 'मेट्रिक कॉलम चुनें'}
        />
        <StatCard
          title="न्यूनतम"
          value={numericSummary ? formatCompactNumber(numericSummary.min) : '—'}
          subtitle={valueCol ? valueCol : 'मेट्रिक कॉलम चुनें'}
        />
        <StatCard
          title="चार्ट श्रेणियाँ"
          value={formatNumber(barAgg.labels.length)}
          subtitle="शीर्ष श्रेणियाँ दिखायी गईं"
        />
        <StatCard
          title="स्रोत"
          value={sheetName}
          subtitle={fileName}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:mt-4 sm:gap-3 xl:grid-cols-2">
        <ChartCard title="बार सारांश" right={labelCol && valueCol ? `${labelCol} → ${valueCol}` : 'कॉलम चुनें'}>
          <div className="h-56 sm:h-72">
            {barAgg.labels.length ? (
              <Bar data={barData} options={chartOptionsBar} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                चार्ट के लिए ग्रुप और न्यूमेरिक मेट्रिक चुनें
              </div>
            )}
          </div>
        </ChartCard>

        <ChartCard title="पाई वितरण" right={labelCol && valueCol ? `${labelCol} → ${valueCol}` : 'कॉलम चुनें'}>
          <div className="h-56 sm:h-72">
            {pieAgg.labels.length ? (
              <Pie data={pieData} options={chartOptionsPie} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                चार्ट के लिए ग्रुप और न्यूमेरिक मेट्रिक चुनें
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      <div className="mt-3 sm:mt-4">
        <DataTable columns={columnsForTable} rows={filteredRows} pageSize={10} />
      </div>
    </section>
  )
}
