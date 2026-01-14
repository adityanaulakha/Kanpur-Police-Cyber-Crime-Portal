export default function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="px-4 py-3">
        <div className="text-xs font-semibold tracking-wide text-slate-500">
          {title}
        </div>
        <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
        {subtitle ? (
          <div className="mt-1 text-xs text-slate-500">{subtitle}</div>
        ) : null}
      </div>
      <div className="h-1 w-full rounded-b-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400" />
    </div>
  )
}
