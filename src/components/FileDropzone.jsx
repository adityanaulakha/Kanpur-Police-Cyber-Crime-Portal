export default function FileDropzone({ onFiles, accept }) {
  return (
    <label className="group block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-left shadow-sm transition hover:border-sky-400 hover:bg-white">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-800">
            Upload spreadsheets
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            Select multiple files (Excel .xlsx/.xls or .csv). Each worksheet becomes its own dashboard section.
          </div>
        </div>
        <div className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition group-hover:bg-slate-800">
          Choose files
        </div>
      </div>

      <input
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const list = e.target.files
          if (!list || list.length === 0) return
          onFiles(Array.from(list))
          e.target.value = ''
        }}
      />
    </label>
  )
}
