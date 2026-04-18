import { AlertCircle, CheckCircle2, X } from "lucide-react";

export default function Notifications({ items, dismiss }) {
  if (!items.length) return null;

  return (
    <div className="fixed right-4 top-4 z-50 space-y-3">
      {items.map((item) => (
        <div key={item.id} className={`flex min-w-72 items-start gap-3 rounded-2xl border px-4 py-3 shadow-soft backdrop-blur-xl ${item.type === "error" ? "border-rose-200 bg-rose-50/95 text-rose-700" : "border-emerald-200 bg-white/95 text-slate-700"}`}>
          {item.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <div className="flex-1">
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="text-xs opacity-80">{item.message}</p>
          </div>
          <button type="button" onClick={() => dismiss(item.id)}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
