import { useState } from "react";
import { Button, Input, Card } from "../components/ui/index";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email || !password) {
      setError("Please enter an email and password.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error, needsConfirmation } = await signUp(email, password);
        if (error) setError(error);
        else if (needsConfirmation) setInfo("Account created! Check your email to confirm, then sign in.");
        // otherwise onAuthStateChange takes over automatically
      } else {
        const { error } = await signIn(email, password);
        if (error) setError(error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-[#F3F0FF] via-[#F7F6F3] to-[#F7F6F3] p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#7C5CFC] flex items-center justify-center text-white text-lg font-bold shadow-[0_2px_8px_rgba(124,92,252,0.35)]">
            A
          </div>
          <div>
            <p className="font-display font-bold text-[#1C1B29] leading-tight">Ala SLP</p>
            <p className="text-[10px] text-[#9898A8] leading-tight">Activities</p>
          </div>
        </div>

        <Card className="animate-scale-in">
          <h1 className="font-display font-bold text-xl text-[#1C1B29] mb-1">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-[#6B6B80] mb-5">
            {mode === "signup" ? "Set up a free account to save and sync your activities." : "Sign in to access your activities."}
          </p>

          {error && (
            <div className="mb-4 text-sm font-medium text-[#DC2626] bg-[#FEF2F2] rounded-lg px-3 py-2">{error}</div>
          )}
          {info && (
            <div className="mb-4 text-sm font-medium text-[#16A34A] bg-[#F0FDF4] rounded-lg px-3 py-2">{info}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Button type="submit" fullWidth size="lg" loading={loading}>
              {mode === "signup" ? "Sign up" : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-[#6B6B80] mt-5">
            {mode === "signup" ? (
              <>Already have an account?{" "}
                <button onClick={() => { setMode("signin"); setError(null); setInfo(null); }} className="text-[#7C5CFC] font-semibold hover:underline">
                  Sign in
                </button>
              </>
            ) : (
              <>New here?{" "}
                <button onClick={() => { setMode("signup"); setError(null); setInfo(null); }} className="text-[#7C5CFC] font-semibold hover:underline">
                  Create an account
                </button>
              </>
            )}
          </p>
        </Card>
      </div>
    </div>
  );
}
