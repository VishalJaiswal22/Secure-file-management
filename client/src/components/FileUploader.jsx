import { useRef, useState } from "react";
import { Lock, UploadCloud } from "lucide-react";

export default function FileUploader({ onUpload, uploading, progress }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(files) {
    const file = files?.[0];
    if (file) onUpload(file);
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      className={`rounded-3xl border-2 border-dashed p-8 text-center transition ${
        dragging ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-slate-300 bg-white/70 dark:border-slate-700 dark:bg-slate-900/70"
      }`}
    >
      <div className="mx-auto mb-4 inline-flex rounded-3xl bg-brand-500 p-4 text-white shadow-lg">
        <UploadCloud size={24} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Drag & drop files securely</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Files are validated, malware-scanned, and AES encrypted before storage.
      </p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-500"
      >
        {uploading ? "Uploading..." : "Select File"}
      </button>
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Lock size={14} />
        Safe formats only. Max 10 MB.
      </div>
      <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{progress}% uploaded</p>
      <input ref={inputRef} type="file" className="hidden" onChange={(event) => handleFiles(event.target.files)} />
    </div>
  );
}
