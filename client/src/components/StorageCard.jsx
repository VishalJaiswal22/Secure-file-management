import { formatBytes } from "../utils/formatters";

export default function StorageCard({ stats }) {
  const percentage = Math.min(100, Math.round(((stats.storageUsed || 0) / Math.max(stats.storageLimit || 1, 1)) * 100));

  return (
    <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Storage Usage</p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {formatBytes(stats.storageUsed)} of {formatBytes(stats.storageLimit)}
          </h3>
        </div>
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-200">
          {percentage}%
        </span>
      </div>
      <div className="mt-4 h-3 rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="h-3 rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
