export default function Footer() {
  return (
    <>
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
          <div className="flex items-center gap-2 text-slate-600">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Ζωντανά Δεδομένα</span>
          </div>
          <div className="w-px h-4 bg-slate-300"></div>
          <div className="text-sm text-slate-500">
            Με την υποστήριξη του data.gov.gr
          </div>
          <div className="w-px h-4 bg-slate-300"></div>
          <div className="text-sm text-slate-500">
            Ενημερώθηκε: {new Date().toLocaleString("el-GR")}
          </div>
        </div>
      </div>
    </>
  );
}
