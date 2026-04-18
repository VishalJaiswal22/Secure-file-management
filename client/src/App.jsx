import { useEffect, useState } from "react";
import AuthCard from "./components/AuthCard";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import StatsCards from "./components/StatsCards";
import StorageCard from "./components/StorageCard";
import FileUploader from "./components/FileUploader";
import FileTable from "./components/FileTable";
import ActivityFeed from "./components/ActivityFeed";
import Notifications from "./components/Notifications";
import SettingsPanel from "./components/SettingsPanel";
import api from "./lib/api";

const initialDashboard = {
  stats: { myFilesCount: 0, sharedFilesCount: 0, storageUsed: 0, storageLimit: 50 * 1024 * 1024 },
  recentFiles: [],
  activities: [],
  sessions: []
};

export default function App() {
  const [mode, setMode] = useState("login");
  const [otpSessionId, setOtpSessionId] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", otp: "" });
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [files, setFiles] = useState({ myFiles: [], sharedFiles: [] });
  const [section, setSection] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [layout, setLayout] = useState("grid");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("sfm_theme") === "dark");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("sfm_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    if (localStorage.getItem("sfm_token")) {
      fetchAppData();
    }
  }, []);

  function notify(type, title, message) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setNotifications((current) => [...current, { id, type, title, message }]);
    setTimeout(() => {
      setNotifications((current) => current.filter((item) => item.id !== id));
    }, 4000);
  }

  async function fetchAppData() {
    try {
      // Keep the dashboard hydrated from the same API surface the app uses in production.
      const [profileResponse, dashboardResponse, fileResponse] = await Promise.all([
        api.get("/auth/me"),
        api.get("/dashboard"),
        api.get("/files")
      ]);
      setUser(profileResponse.data.user);
      setDashboard(dashboardResponse.data);
      setFiles(fileResponse.data);
    } catch (_error) {
      localStorage.removeItem("sfm_token");
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    try {
      await api.post("/auth/register", { name: form.name, email: form.email, password: form.password });
      notify("success", "Registration complete", "You can sign in with your new account.");
      setMode("login");
    } catch (error) {
      notify("error", "Registration failed", error.response?.data?.message || "Try again.");
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    try {
      const response = await api.post("/auth/login", { email: form.email, password: form.password });
      if (response.data.requiresTwoFactor) {
        setOtpSessionId(response.data.sessionId);
        setDemoOtp(response.data.demoOtp);
        setMode("otp");
        notify("success", "OTP sent", `Use demo OTP ${response.data.demoOtp} for local testing.`);
        return;
      }
      localStorage.setItem("sfm_token", response.data.token);
      setUser(response.data.user);
      await fetchAppData();
    } catch (error) {
      notify("error", "Login failed", error.response?.data?.message || "Try again.");
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    try {
      const response = await api.post("/auth/verify-otp", { sessionId: otpSessionId, otp: form.otp });
      localStorage.setItem("sfm_token", response.data.token);
      setUser(response.data.user);
      await fetchAppData();
    } catch (error) {
      notify("error", "OTP failed", error.response?.data?.message || "Try again.");
    }
  }

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch (_error) {
      // Ignore API logout failures.
    } finally {
      localStorage.removeItem("sfm_token");
      setUser(null);
      setDashboard(initialDashboard);
      setFiles({ myFiles: [], sharedFiles: [] });
      setMode("login");
    }
  }

  async function handleUpload(file) {
    const data = new FormData();
    data.append("file", file);
    setUploading(true);
    setUploadProgress(0);
    try {
      await api.post("/files/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          const nextProgress = event.total ? Math.round((event.loaded / event.total) * 100) : 0;
          setUploadProgress(nextProgress);
        }
      });
      notify("success", "Upload complete", `${file.name} was encrypted and stored securely.`);
      await fetchAppData();
    } catch (error) {
      notify("error", "Upload failed", error.response?.data?.message || "Try a different file.");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  }

  async function handleDownload(file) {
    try {
      const response = await api.get(`/files/${file._id}/download`, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.fileName;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
      notify("success", "Download ready", `${file.fileName} was decrypted and downloaded.`);
    } catch (error) {
      notify("error", "Download failed", error.response?.data?.message || "Try again.");
    }
  }

  async function handleDelete(file) {
    if (!window.confirm(`Delete ${file.fileName}?`)) return;
    try {
      await api.delete(`/files/${file._id}`);
      notify("success", "File deleted", `${file.fileName} was removed.`);
      await fetchAppData();
    } catch (error) {
      notify("error", "Delete failed", error.response?.data?.message || "Try again.");
    }
  }

  async function handleRename(file) {
    const fileName = window.prompt("New file name", file.fileName);
    if (!fileName) return;
    try {
      await api.patch(`/files/${file._id}/rename`, { fileName });
      notify("success", "File renamed", `Updated to ${fileName}.`);
      await fetchAppData();
    } catch (error) {
      notify("error", "Rename failed", error.response?.data?.message || "Try again.");
    }
  }

  async function handleShare(file) {
    const email = window.prompt("Share with email");
    if (!email) return;
    try {
      await api.post(`/files/${file._id}/share`, { email, access: ["view", "edit", "share"] });
      notify("success", "File shared", `${file.fileName} was shared with ${email}.`);
      await fetchAppData();
    } catch (error) {
      notify("error", "Share failed", error.response?.data?.message || "Try again.");
    }
  }

  const filteredMyFiles = files.myFiles.filter((file) => file.fileName.toLowerCase().includes(search.toLowerCase()));
  const filteredSharedFiles = files.sharedFiles.filter((file) => file.fileName.toLowerCase().includes(search.toLowerCase()));

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Notifications items={notifications} dismiss={(id) => setNotifications((current) => current.filter((item) => item.id !== id))} />
        {mode === "otp" ? (
          <AuthCard title="Two-Factor Verification" subtitle="Enter the OTP to complete a secure sign-in.">
            <form className="space-y-4" onSubmit={handleVerifyOtp}>
              <div className="rounded-2xl bg-brand-50 p-4 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-200">
                Demo OTP for local testing: <span className="font-bold">{demoOtp}</span>
              </div>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950"
                placeholder="6-digit OTP"
                value={form.otp}
                onChange={(event) => setForm({ ...form, otp: event.target.value })}
              />
              <button className="w-full rounded-2xl bg-brand-500 px-4 py-3 font-semibold text-white">Verify OTP</button>
            </form>
          </AuthCard>
        ) : (
          <AuthCard title={mode === "login" ? "Welcome back" : "Create secure account"} subtitle="Enterprise-style file protection with a polished, Drive-inspired workspace.">
            <form className="space-y-4" onSubmit={mode === "login" ? handleLogin : handleRegister}>
              {mode === "register" && (
                <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950" placeholder="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              )}
              <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950" placeholder="Email address" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              <input type="password" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
              <button className="w-full rounded-2xl bg-brand-500 px-4 py-3 font-semibold text-white">{mode === "login" ? "Login" : "Register"}</button>
            </form>
            <button type="button" className="mt-4 text-sm font-semibold text-brand-600 dark:text-brand-300" onClick={() => setMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "Need an account? Register" : "Already have an account? Login"}
            </button>
          </AuthCard>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <Notifications items={notifications} dismiss={(id) => setNotifications((current) => current.filter((item) => item.id !== id))} />
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <Sidebar current={section} setCurrent={setSection} />
        <main className="flex-1">
          <Topbar query={search} setQuery={setSearch} darkMode={darkMode} onToggleDarkMode={() => setDarkMode((current) => !current)} user={user} onLogout={handleLogout} />
          <div className="space-y-6">
            {(section === "dashboard" || section === "myFiles") && (
              <>
                <StatsCards stats={dashboard.stats} />
                <div className="grid gap-6 xl:grid-cols-[1.4fr,0.8fr]">
                  <FileUploader onUpload={handleUpload} uploading={uploading} progress={uploadProgress} />
                  <StorageCard stats={dashboard.stats} />
                </div>
              </>
            )}

            {(section === "dashboard" || section === "myFiles") && (
              <FileTable title="My Encrypted Files" files={filteredMyFiles} layout={layout} setLayout={setLayout} onDownload={handleDownload} onDelete={handleDelete} onRename={handleRename} onShare={handleShare} currentUserId={user.id || user._id} />
            )}

            {(section === "dashboard" || section === "sharedFiles") && (
              <FileTable title="Shared With Me" files={filteredSharedFiles} layout={layout} setLayout={setLayout} onDownload={handleDownload} onDelete={() => {}} onRename={handleRename} onShare={handleShare} currentUserId={user.id || user._id} readOnly={section === "sharedFiles"} />
            )}

            {(section === "dashboard" || section === "activity") && <ActivityFeed activities={dashboard.activities} />}
            {section === "settings" && <SettingsPanel user={user} />}
          </div>
        </main>
      </div>
    </div>
  );
}
