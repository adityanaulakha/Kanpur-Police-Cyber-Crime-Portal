export default function TopBar({ title, subtitle, controls, centerTitle = false }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-gradient-to-r from-indigo-800 to-sky-600">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div
          className={
            centerTitle
              ? 'grid grid-cols-1 items-center gap-3 md:grid-cols-[1fr_auto_1fr]'
              : 'flex flex-col gap-3 md:flex-row md:items-center md:justify-between'
          }
        >
          {centerTitle ? <div className="hidden md:block" /> : null}

          <div className={centerTitle ? 'text-center' : ''}>
            <div
              className={
                centerTitle
                  ? 'text-xl font-extrabold tracking-wide text-white md:text-3xl'
                  : 'text-xl font-bold tracking-tight text-white md:text-2xl'
              }
            >
              {title}
            </div>
            {subtitle ? (
              <div className="mt-0.5 text-xs text-white/80 md:text-sm">{subtitle}</div>
            ) : null}
          </div>

          <div
            className={
              centerTitle
                ? 'flex flex-wrap items-center justify-center gap-2 md:justify-end'
                : 'flex flex-wrap items-center justify-start gap-2 md:justify-end'
            }
          >
            {controls}
          </div>
        </div>
      </div>
    </header>
  )
}
