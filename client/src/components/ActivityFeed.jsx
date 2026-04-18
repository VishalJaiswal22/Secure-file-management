import { formatDate } from "../utils/formatters";

export default function ActivityFeed({ activities }) {
  return (
    <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75">
      <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Activity Log</h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity._id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="font-semibold text-slate-900 dark:text-white">{activity.action}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{activity.details}</p>
            <p className="mt-2 text-xs text-slate-400">{formatDate(activity.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
