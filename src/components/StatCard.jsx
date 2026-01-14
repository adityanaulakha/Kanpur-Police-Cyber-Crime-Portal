export default function StatCard({ title, value, subtitle }) {
  return (
    <div className="w-full max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:rounded-xl">
      <div className="px-3 py-2 sm:px-4 sm:py-3">
        <div className="text-xs font-semibold tracking-wide text-slate-500">
          {title}
        </div>
        <div className="mt-1 break-words text-xl font-bold text-slate-900 sm:text-2xl">{value}</div>
        {subtitle ? (
          <div className="mt-1 text-xs text-slate-500">{subtitle}</div>
        ) : null}
      </div>
      <div className="h-1 w-full rounded-b-lg bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 sm:rounded-b-xl" />
    </div>
  )
}
