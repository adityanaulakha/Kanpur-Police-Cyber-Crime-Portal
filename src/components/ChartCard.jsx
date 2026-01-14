export default function ChartCard({ title, children, right }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="text-sm font-semibold text-slate-800">{title}</div>
        {right ? <div className="text-xs text-slate-500">{right}</div> : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
