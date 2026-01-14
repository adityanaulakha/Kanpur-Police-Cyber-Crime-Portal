import { useEffect, useMemo, useState } from 'react'
import SheetDashboard from './components/SheetDashboard.jsx'
import DateRangePicker from './components/DateRangePicker.jsx'
import TopBar from './components/TopBar.jsx'
import { ensureChartsRegistered } from './lib/chartSetup.js'
import { fetchSheetAsTable } from './lib/googleSheets.js'
import { DASHBOARD_SECTIONS } from './data/sections.js'

ensureChartsRegistered()

function makeId(prefix) {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`
}

export default function App() {
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const [globalDateRange, setGlobalDateRange] = useState({ preset: 'all', start: null, end: null })
  const [globalSearch, setGlobalSearch] = useState('')
  const [jumpTo, setJumpTo] = useState('')

  const jumpOptions = useMemo(() => {
    return items.map((it) => ({
      value: it.id,
      label: `${it.sheetName} (${it.fileName})`,
    }))
  }, [items])

  async function loadAll() {
    setBusy(true)
    setError('')
    try {
      const results = await Promise.allSettled(
        DASHBOARD_SECTIONS.map(async (section) => {
          const { columns, rows } = await fetchSheetAsTable(section.source)
          return {
            id: makeId('section'),
            key: section.key,
            fileName: 'Google Sheet',
            sheetName: section.title,
            columns,
            rows,
          }
        }),
      )

      const next = []
      const errors = []

      for (const r of results) {
        if (r.status === 'rejected') {
          errors.push(String(r.reason?.message || r.reason || 'Failed to load a section'))
          continue
        }
        next.push(r.value)
      }

      setItems(next)
      if (errors.length) setError(errors.slice(0, 3).join(' • '))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function scrollToSection(id) {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <TopBar
        title="Kanpur Police Cyber Crime Portal"
        centerTitle
        controls={
          <>
            <label className="flex items-center gap-2">
              <span className="text-xs font-medium text-white/90">सेक्शन</span>
              <select
                className="h-10 w-56 rounded-xl border border-white/15 bg-white/10 px-3 text-xs text-white outline-none backdrop-blur disabled:opacity-50"
                value={jumpTo}
                onChange={(e) => {
                  const v = e.target.value
                  setJumpTo(v)
                  if (v) scrollToSection(v)
                }}
                disabled={jumpOptions.length === 0}
              >
                <option className="text-slate-900" value="">
                  {jumpOptions.length ? 'सेक्शन चुनें' : 'अभी कोई सेक्शन नहीं'}
                </option>
                {jumpOptions.map((o) => (
                  <option key={o.value} className="text-slate-900" value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-base font-semibold text-slate-900">Google Sheets से लाइव डेटा</div>
                <div className="mt-1 text-sm text-slate-600">
                  कुल सेक्शन: {DASHBOARD_SECTIONS.length}. यह केवल देखने हेतु है.
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  यदि डेटा नहीं दिख रहा है, तो संबंधित Google Sheet को public/published करें.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                  onClick={loadAll}
                  disabled={busy}
                >
                  रीफ़्रेश
                </button>
              </div>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          ) : null}

          {busy ? (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              सेक्शन लोड हो रहे हैं…
            </div>
          ) : null}

          {items.length === 0 && !busy ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm">
              <div className="text-base font-semibold text-slate-900">
                कोई डेटा उपलब्ध नहीं
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Google Sheet की access setting (public/published) और कॉन्फ़िग जाँचें.
              </div>
              <div className="mt-3 text-xs text-slate-500">
                Tip: For charts, choose a “Group” column (text) and a “Metric” column (numeric) in each section.
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-6">
            {items.map((it) => (
              <div key={it.id} id={it.id} className="rounded-3xl">
                <SheetDashboard
                  fileName={it.fileName}
                  sheetName={it.sheetName}
                  columns={it.columns}
                  rows={it.rows}
                  globalDateRange={globalDateRange}
                  onGlobalDateRangeChange={setGlobalDateRange}
                  globalSearch={globalSearch}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
