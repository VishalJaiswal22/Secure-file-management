import { Download, Edit3, Grid2x2, List, Lock, Share2, Trash2 } from "lucide-react";
import { formatBytes, formatDate } from "../utils/formatters";

const typeIcon = { pdf: "📄", image: "🖼️", video: "🎬", default: "📁" };

function getTypeLabel(file) {
  if (file.mimeType.includes("pdf")) return typeIcon.pdf;
  if (file.mimeType.includes("image")) return typeIcon.image;
  if (file.mimeType.includes("video")) return typeIcon.video;
  return typeIcon.default;
}

export default function FileTable({ title, files, layout, setLayout, onDownload, onDelete, onRename, onShare, currentUserId, readOnly }) {
  return (
    <section className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{files.length} files available</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
          <button type="button" onClick={() => setLayout("grid")} className={`rounded-xl p-2 ${layout === "grid" ? "bg-white shadow dark:bg-slate-700" : ""}`}>
            <Grid2x2 size={16} />
          </button>
          <button type="button" onClick={() => setLayout("list")} className={`rounded-xl p-2 ${layout === "list" ? "bg-white shadow dark:bg-slate-700" : ""}`}>
            <List size={16} />
          </button>
        </div>
      </div>
      <div className={layout === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
        {files.map((file) => {
          const owned = file.owner === currentUserId || file.owner?._id === currentUserId;
          return (
            <div key={file._id} className={`rounded-3xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 ${layout === "list" ? "flex flex-col gap-4 md:flex-row md:items-center md:justify-between" : ""}`}>
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-slate-100 p-3 text-xl dark:bg-slate-800">{getTypeLabel(file)}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 dark:text-white">{file.fileName}</p>
                    {file.isEncrypted && <Lock size={14} className="text-brand-500" />}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {formatBytes(file.fileSize)} • {file.mimeType} • {formatDate(file.createdAt)}
                  </p>
                  {!owned && file.owner?.name && (
                    <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Shared by {file.owner.name}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => onDownload(file)} className="rounded-2xl bg-brand-500 px-3 py-2 text-xs font-semibold text-white">
                  <span className="flex items-center gap-2"><Download size={14} />Download</span>
                </button>
                {!readOnly && (
                  <>
                    <button type="button" onClick={() => onRename(file)} className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-slate-700">
                      <span className="flex items-center gap-2"><Edit3 size={14} />Rename</span>
                    </button>
                    <button type="button" onClick={() => onShare(file)} className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-slate-700">
                      <span className="flex items-center gap-2"><Share2 size={14} />Share</span>
                    </button>
                  </>
                )}
                {owned && !readOnly && (
                  <button type="button" onClick={() => onDelete(file)} className="rounded-2xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 dark:border-rose-500/40">
                    <span className="flex items-center gap-2"><Trash2 size={14} />Delete</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
