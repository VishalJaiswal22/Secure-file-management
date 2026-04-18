export default function SettingsPanel({ user }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Security Settings</h3>
        <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>Two-factor authentication: {user?.twoFactorEnabled ? "Enabled" : "Disabled"}</p>
          <p>Role: {user?.role}</p>
          <p>Encryption standard: AES-256-CBC</p>
          <p>Transport protection: Helmet and CORS, ready for HTTPS deployment</p>
        </div>
      </div>
      <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Profile</h3>
        <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>Name: {user?.name}</p>
          <p>Email: {user?.email}</p>
          <p>Role-based access: {user?.role === "admin" ? "Full controls" : "Standard user controls"}</p>
        </div>
      </div>
    </div>
  );
}
