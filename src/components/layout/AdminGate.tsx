import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../lib/auth";
import { checkIsAdmin } from "../../lib/assets";

export default function AdminGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    checkIsAdmin(user.id)
      .then(setIsAdmin)
      .finally(() => setChecking(false));
  }, [user]);

  if (checking) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-3 border-[#EAE4FF] border-t-[#7C5CFC] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center py-24 text-center gap-3 px-6">
        <p className="text-5xl mb-2">🔒</p>
        <h2 className="font-display font-bold text-xl text-[#1C1B29]">Admins only</h2>
        <p className="text-[#6B6B80] text-sm max-w-sm">This area manages the shared asset library and is limited to platform administrators.</p>
        <button onClick={() => navigate("/")} className="text-sm font-semibold text-[#7C5CFC] hover:underline mt-2">← Back to Home</button>
      </div>
    );
  }

  return <>{children}</>;
}
