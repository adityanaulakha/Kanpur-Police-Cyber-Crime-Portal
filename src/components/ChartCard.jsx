export default function ChartCard({ title, children, right }) {
  return (
    <div className="w-full max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:rounded-xl">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3">
        <div className="text-xs font-semibold text-slate-800 sm:text-sm">{title}</div>
        {right ? <div className="truncate text-xs text-slate-500">{right}</div> : null}
      </div>
      <div className="w-full max-w-full overflow-hidden p-3 sm:p-4">{children}</div>
    </div>
  )
}
