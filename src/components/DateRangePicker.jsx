import { useEffect, useMemo, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { getPresetRange } from '../lib/date.js'

function startOfDay(d) {
  if (!d) return null
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfDay(d) {
  if (!d) return null
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

function formatShort(d) {
  if (!d) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function DateRangePicker({ value, onChange }) {
  const rootRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [monthCount, setMonthCount] = useState(1)

  const [draftPreset, setDraftPreset] = useState(value?.preset ?? 'all')
  const [draftRange, setDraftRange] = useState({
    from: value?.start ? new Date(value.start) : undefined,
    to: value?.end ? new Date(value.end) : undefined,
  })

  const resolvedDraft = useMemo(() => {
    if (draftPreset === 'custom') {
      return {
        preset: 'custom',
        start: draftRange.from ? startOfDay(draftRange.from) : null,
        end: draftRange.to ? endOfDay(draftRange.to) : null,
      }
    }

    if (draftPreset === 'all') return { preset: 'all', start: null, end: null }

    const { start, end } = getPresetRange(draftPreset)
    return { preset: draftPreset, start, end }
  }, [draftPreset, draftRange])

  const buttonLabel = useMemo(() => {
    const preset = value?.preset ?? 'all'
    if (preset === 'all') return 'Select date range'
    if (preset === 'custom') return `${formatShort(value?.start)} → ${formatShort(value?.end)}`
    if (preset === 'today') return 'Today'
    if (preset === 'last7') return 'Last 7 days'
    if (preset === 'last30') return 'Last 30 days'
    return 'Select date range'
  }, [value])

  useEffect(() => {
    function onDocDown(e) {
      if (!open) return
      const root = rootRef.current
      if (!root) return
      if (root.contains(e.target)) return
      setOpen(false)
    }

    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    setDraftPreset(value?.preset ?? 'all')
    setDraftRange({
      from: value?.start ? new Date(value.start) : undefined,
      to: value?.end ? new Date(value.end) : undefined,
    })
  }, [open, value])

  useEffect(() => {
    // Responsive month count (1 on small screens, 2 on md+)
    const mq = window.matchMedia('(min-width: 768px)')
    const apply = () => setMonthCount(mq.matches ? 2 : 1)
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [])

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        className="inline-flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/10 px-3 text-xs font-semibold text-white outline-none backdrop-blur hover:bg-white/15 sm:w-auto"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate">{buttonLabel}</span>
        <span className="opacity-80">▾</span>
      </button>

      {open ? (
        <div
          className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,700px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-semibold text-slate-900">Date range</div>
            <label className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
              <span className="text-xs font-medium text-slate-600">Auto date range</span>
              <select
                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none sm:w-auto"
                value={draftPreset}
                onChange={(e) => {
                  const p = e.target.value
                  setDraftPreset(p)
                  if (p !== 'custom') {
                    // clear manual range when switching away
                    setDraftRange({ from: undefined, to: undefined })
                  }
                }}
              >
                <option value="all">All</option>
                <option value="today">Today</option>
                <option value="last7">Last 7 days</option>
                <option value="last30">Last 30 days</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-600">Start date</div>
              <div className="mt-1 text-sm font-medium text-slate-900">{formatShort(resolvedDraft.start)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600">End date</div>
              <div className="mt-1 text-sm font-medium text-slate-900">{formatShort(resolvedDraft.end)}</div>
            </div>
          </div>

          <div className="mt-3 max-h-[60vh] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
            <DayPicker
              mode="range"
              numberOfMonths={monthCount}
              selected={draftPreset === 'custom' ? draftRange : undefined}
              onSelect={(range) => {
                setDraftPreset('custom')
                setDraftRange(range || { from: undefined, to: undefined })
              }}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end">
            <button
              type="button"
              className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="h-9 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
              onClick={() => {
                onChange(resolvedDraft)
                setOpen(false)
              }}
            >
              Apply
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
