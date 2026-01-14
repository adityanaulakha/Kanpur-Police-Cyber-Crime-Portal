export default function TopBar({ title, subtitle, controls, centerTitle = false }) {
  return (
    <header className="sticky top-0 z-20 w-full overflow-x-hidden border-b border-white/10 bg-linear-to-r from-indigo-800 to-sky-600">
      <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4 sm:py-4">
        <div
          className={
            centerTitle
              ? 'grid grid-cols-1 items-center gap-2 sm:gap-3 lg:grid-cols-[1fr_auto_1fr]'
              : 'flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between'
          }
        >
          {centerTitle ? <div className="hidden lg:block" /> : null}

          <div className={centerTitle ? 'min-w-0 text-center' : 'min-w-0'}>
            <div
              className={
                centerTitle
                  ? 'break-words text-lg font-extrabold tracking-wide text-white sm:text-xl md:text-2xl lg:text-3xl'
                  : 'break-words text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl'
              }
            >
              {title}
            </div>
            {subtitle ? (
              <div className="mt-0.5 text-xs text-white/80 sm:text-sm">{subtitle}</div>
            ) : null}
          </div>

          <div
            className={
              centerTitle
                ? 'flex flex-wrap items-center justify-center gap-2 lg:justify-end'
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
