import { NavLink, Outlet, useNavigate } from "react-router";
import { useState } from "react";
import { useAuth } from "../../lib/auth";

const navItems = [
  { to: "/", label: "Home", icon: "⊞", exact: true },
  { to: "/explore", label: "Explore", icon: "🔍" },
  { to: "/my-decks", label: "My Decks", icon: "📚" },
  { to: "/students", label: "Students", icon: "👥" },
  { to: "/progress", label: "Progress", icon: "📈" },
];

function initialsFromEmail(email: string | undefined): string {
  if (!email) return "?";
  const name = email.split("@")[0];
  return name.slice(0, 2).toUpperCase();
}

export default function Shell() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    setSidebarOpen(false);
    await signOut();
    navigate("/login");
  }

  return (
    <div className="flex h-full bg-[#F7F6F3]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#F0EFF9] flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#F0EFF9]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#7C5CFC] flex items-center justify-center text-white text-lg font-bold shadow-[0_2px_8px_rgba(124,92,252,0.35)]">
              A
            </div>
            <div>
              <p className="font-display font-bold text-[#1C1B29] text-sm leading-tight">Ala SLP</p>
              <p className="text-[10px] text-[#9898A8] leading-tight">Activities</p>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <div className="px-4 py-4">
          <button
            onClick={() => { navigate("/create"); setSidebarOpen(false); }}
            className="w-full flex items-center justify-center gap-2 bg-[#7C5CFC] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#6244e8] transition-all shadow-[0_2px_8px_rgba(124,92,252,0.3)] active:scale-95"
          >
            <span className="text-lg">+</span>
            Create Activity
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-[#F3F0FF] text-[#7C5CFC]" : "text-[#6B6B80] hover:bg-[#F7F6F3] hover:text-[#1C1B29]"}`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Profile */}
        <div className="border-t border-[#F0EFF9] p-4 space-y-1">
          <NavLink
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isActive ? "bg-[#F3F0FF]" : "hover:bg-[#F7F6F3]"}`
            }
          >
            <div className="w-8 h-8 rounded-full bg-[#7C5CFC] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initialsFromEmail(user?.email)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1C1B29] truncate">{user?.email || "Account"}</p>
              <p className="text-xs text-[#9898A8] truncate">Settings</p>
            </div>
            <span className="text-[#9898A8] text-sm">⚙</span>
          </NavLink>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#6B6B80] hover:bg-[#F7F6F3] hover:text-[#1C1B29] transition-all"
          >
            <span className="w-8 flex justify-center">↪</span>
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-[#F0EFF9] px-4 py-3 flex items-center justify-between shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F7F6F3]">
            <span className="text-xl">☰</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#7C5CFC] flex items-center justify-center text-white text-sm font-bold">A</div>
            <span className="font-display font-bold text-[#1C1B29] text-sm">Ala SLP</span>
          </div>
          <button onClick={() => navigate("/create")} className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#7C5CFC] text-white text-lg font-bold">
            +
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden bg-white border-t border-[#F0EFF9] flex shrink-0 safe-b">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${isActive ? "text-[#7C5CFC]" : "text-[#9898A8]"}`
              }
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
