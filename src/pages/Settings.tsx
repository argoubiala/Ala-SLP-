import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, Button, Input, SectionHeader } from "../components/ui/index";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";

const disabledSections = [
  { id: "profile", label: "Public Profile", icon: "👤" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "subscription", label: "Subscription", icon: "⭐" },
];

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  async function handlePasswordUpdate() {
    setPwError(null);
    setPwSuccess(false);
    if (newPassword.length < 6) {
      setPwError("Password should be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords don't match.");
      return;
    }
    setPwSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) setPwError(error.message);
      else {
        setPwSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
      }
    } finally {
      setPwSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-[#1C1B29]">Settings & Profile</h1>
        <p className="text-[#6B6B80] text-sm mt-1">Manage your account</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        {/* Sidebar nav */}
        <div className="lg:col-span-1">
          <Card padding="sm">
            <nav className="space-y-0.5">
              <div className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium bg-[#F3F0FF] text-[#7C5CFC]">
                <span>⚙</span> Account
              </div>
              {disabledSections.map(s => (
                <div
                  key={s.id}
                  title="Coming soon"
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-[#C0BFD0] cursor-not-allowed"
                >
                  <span>{s.icon}</span> {s.label}
                  <span className="ml-auto text-[9px] bg-[#F0EFF9] text-[#9898A8] px-1.5 py-0.5 rounded">Soon</span>
                </div>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-5">
          <Card>
            <SectionHeader title="Account" subtitle="Your sign-in details" />
            <div className="mt-5 space-y-4">
              <Input label="Email Address" type="email" value={user?.email || ""} disabled />

              <div className="border-t border-[#F0EFF9] pt-4">
                <h3 className="font-semibold text-[#1C1B29] mb-3">Change Password</h3>
                {pwError && <div className="mb-3 text-sm font-medium text-[#DC2626] bg-[#FEF2F2] rounded-lg px-3 py-2">{pwError}</div>}
                {pwSuccess && <div className="mb-3 text-sm font-medium text-[#16A34A] bg-[#F0FDF4] rounded-lg px-3 py-2">Password updated.</div>}
                <div className="space-y-3">
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="flex justify-end pt-3">
                  <Button onClick={handlePasswordUpdate} loading={pwSaving}>Update Password</Button>
                </div>
              </div>

              <div className="border-t border-[#F0EFF9] pt-4 flex justify-between items-center">
                <p className="text-sm text-[#6B6B80]">Signed in as {user?.email}</p>
                <Button variant="secondary" onClick={handleSignOut}>Log out</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
