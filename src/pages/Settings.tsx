import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, Button, Input, Textarea, SectionHeader } from "../components/ui/index";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { fetchProfile, upsertProfile } from "../lib/community";

const disabledSections = [
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "subscription", label: "Subscription", icon: "⭐" },
];

const AVATAR_CHOICES = ["🧑‍⚕️", "👩‍⚕️", "👨‍⚕️", "🧑‍🏫", "👩‍🏫", "👨‍🏫", "🧑", "👩", "👨"];

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"account" | "profile">("account");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profession, setProfession] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState(AVATAR_CHOICES[0]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id)
      .then(p => {
        if (p) {
          setDisplayName(p.display_name || "");
          setBio(p.bio || "");
          setProfession(p.profession || "");
          setAvatarEmoji(p.avatar_emoji || AVATAR_CHOICES[0]);
        }
      })
      .finally(() => setProfileLoading(false));
  }, [user]);

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

  async function handleProfileSave() {
    if (!user) return;
    setProfileSaving(true);
    setProfileSaved(false);
    try {
      await upsertProfile(user.id, { display_name: displayName.trim(), bio: bio.trim(), profession: profession.trim(), avatar_emoji: avatarEmoji });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (e: any) {
      alert("Couldn't save your profile: " + (e.message || e));
    } finally {
      setProfileSaving(false);
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
        <p className="text-[#6B6B80] text-sm mt-1">Manage your account and public profile</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        <div className="lg:col-span-1">
          <Card padding="sm">
            <nav className="space-y-0.5">
              <button
                onClick={() => setTab("account")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === "account" ? "bg-[#F3F0FF] text-[#7C5CFC]" : "text-[#6B6B80] hover:bg-[#F7F6F3]"}`}
              >
                <span>⚙</span> Account
              </button>
              <button
                onClick={() => setTab("profile")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === "profile" ? "bg-[#F3F0FF] text-[#7C5CFC]" : "text-[#6B6B80] hover:bg-[#F7F6F3]"}`}
              >
                <span>👤</span> Public Profile
              </button>
              {disabledSections.map(s => (
                <div key={s.id} title="Coming soon" className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-[#C0BFD0] cursor-not-allowed">
                  <span>{s.icon}</span> {s.label}
                  <span className="ml-auto text-[9px] bg-[#F0EFF9] text-[#9898A8] px-1.5 py-0.5 rounded">Soon</span>
                </div>
              ))}
            </nav>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-5">
          {tab === "account" ? (
            <Card>
              <SectionHeader title="Account" subtitle="Your sign-in details" />
              <div className="mt-5 space-y-4">
                <Input label="Email Address" type="email" value={user?.email || ""} disabled />

                <div className="border-t border-[#F0EFF9] pt-4">
                  <h3 className="font-semibold text-[#1C1B29] mb-3">Change Password</h3>
                  {pwError && <div className="mb-3 text-sm font-medium text-[#DC2626] bg-[#FEF2F2] rounded-lg px-3 py-2">{pwError}</div>}
                  {pwSuccess && <div className="mb-3 text-sm font-medium text-[#16A34A] bg-[#F0FDF4] rounded-lg px-3 py-2">Password updated.</div>}
                  <div className="space-y-3">
                    <Input label="New Password" type="password" placeholder="At least 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    <Input label="Confirm Password" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
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
          ) : (
            <Card>
              <SectionHeader title="Public Profile" subtitle="Shown to other therapists on your published activities" />
              {profileLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-[#EAE4FF] border-t-[#7C5CFC] rounded-full animate-spin" />
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-[#1C1B29] mb-2">Avatar</p>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_CHOICES.map(e => (
                        <button
                          key={e}
                          onClick={() => setAvatarEmoji(e)}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl border-2 transition-all ${avatarEmoji === e ? "border-[#7C5CFC] bg-[#F3F0FF]" : "border-[#E8E7F0] hover:border-[#D5C9FF]"}`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Input label="Display Name" placeholder="e.g. Dr. Maria Santos" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                  <Input label="Profession / Title" placeholder="e.g. Pediatric SLP" value={profession} onChange={e => setProfession(e.target.value)} />
                  <Textarea label="Bio" placeholder="A short introduction shown on your public profile" value={bio} onChange={e => setBio(e.target.value)} rows={4} />
                  {profileSaved && <div className="text-sm font-medium text-[#16A34A] bg-[#F0FDF4] rounded-lg px-3 py-2">Profile saved.</div>}
                  <div className="flex justify-end">
                    <Button onClick={handleProfileSave} loading={profileSaving}>Save Profile</Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
