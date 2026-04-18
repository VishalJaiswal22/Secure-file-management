import { FolderLock, HardDriveUpload, ShieldCheck, Share2 } from "lucide-react";
import { formatBytes } from "../utils/formatters";

export default function StatsCards({ stats }) {
  const cards = [
    { label: "My Files", value: stats.myFilesCount, icon: FolderLock, accent: "from-brand-500 to-cyan-500" },
    { label: "Shared Files", value: stats.sharedFilesCount, icon: Share2, accent: "from-emerald-500 to-lime-500" },
    { label: "Storage Used", value: formatBytes(stats.storageUsed), icon: HardDriveUpload, accent: "from-amber-500 to-orange-500" },
    { label: "Encrypted", value: "AES-256", icon: ShieldCheck, accent: "from-violet-500 to-fuchsia-500" }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="animate-floatIn rounded-3xl border border-white/50 bg-white/80 p-5 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75">
            <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-r ${card.accent} p-3 text-white`}>
              <Icon size={18} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
