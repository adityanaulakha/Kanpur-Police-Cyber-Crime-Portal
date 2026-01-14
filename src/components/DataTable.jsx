import { useMemo, useState } from 'react'

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

export default function DataTable({ columns, rows, pageSize = 10 }) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const currentPage = clamp(page, 1, totalPages)

  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [rows, currentPage, pageSize])

  const shownColumns = columns

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div className="text-sm font-semibold text-slate-800">रिकॉर्ड</div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span>
            पेज {currentPage} / {totalPages}
          </span>
          <button
            className="rounded-lg border border-slate-200 px-2 py-1 text-slate-700 disabled:opacity-50"
            onClick={() => setPage((p) => clamp(p - 1, 1, totalPages))}
            disabled={currentPage <= 1}
          >
            पिछला
          </button>
          <button
            className="rounded-lg border border-slate-200 px-2 py-1 text-slate-700 disabled:opacity-50"
            onClick={() => setPage((p) => clamp(p + 1, 1, totalPages))}
            disabled={currentPage >= totalPages}
          >
            अगला
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-xs">
          <thead className="bg-slate-50">
            <tr>
              {shownColumns.map((c) => (
                <th
                  key={c}
                  className="whitespace-nowrap border-b border-slate-200 px-3 py-2 font-semibold text-slate-700"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, idx) => (
              <tr key={idx} className={idx % 2 ? 'bg-white' : 'bg-slate-50/40'}>
                {shownColumns.map((c) => (
                  <td key={c} className="whitespace-nowrap border-b border-slate-100 px-3 py-2 text-slate-700">
                    {String(row?.[c] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
            {pageRows.length === 0 ? (
              <tr>
                <td
                  className="px-3 py-6 text-center text-slate-500"
                  colSpan={shownColumns.length || 1}
                >
                  डेटा उपलब्ध नहीं
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
