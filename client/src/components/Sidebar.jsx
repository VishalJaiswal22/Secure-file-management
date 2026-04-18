import { Activity, FolderKanban, LayoutDashboard, Settings, Share2 } from "lucide-react";

const items = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "myFiles", label: "My Files", icon: FolderKanban },
  { key: "sharedFiles", label: "Shared Files", icon: Share2 },
  { key: "activity", label: "Activity Log", icon: Activity },
  { key: "settings", label: "Settings", icon: Settings }
];

export default function Sidebar({ current, setCurrent }) {
  return (
    <aside className="w-full rounded-3xl border border-white/50 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75 lg:w-72">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="rounded-2xl bg-brand-500 p-3 text-white shadow-lg">SFM</div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white">Secure Vault</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Encrypted Workspace</p>
        </div>
      </div>
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = current === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setCurrent(item.key)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                active
                  ? "bg-brand-500 text-white shadow-lg"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Icon size={18} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
