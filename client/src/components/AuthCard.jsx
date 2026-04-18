export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="w-full max-w-md rounded-3xl border border-white/40 bg-white/80 p-8 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
