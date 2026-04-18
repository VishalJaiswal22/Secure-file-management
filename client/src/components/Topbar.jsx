import { Bell, MoonStar, Search, Sun, UserCircle2 } from "lucide-react";

export default function Topbar({ query, setQuery, darkMode, onToggleDarkMode, user, onLogout }) {
  return (
    <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/50 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
        <Search size={18} className="text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search files, activity, or people..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="rounded-2xl border border-slate-200 p-3 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {darkMode ? <Sun size={18} /> : <MoonStar size={18} />}
        </button>
        <button
          type="button"
          className="rounded-2xl border border-slate-200 p-3 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2 dark:border-slate-700">
          <UserCircle2 size={22} className="text-brand-500" />
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:bg-brand-500"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
