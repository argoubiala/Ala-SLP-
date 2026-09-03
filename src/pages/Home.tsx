import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, Button, StatCard, SectionHeader } from "../components/ui/index";
import { useAuth } from "../lib/auth";
import { fetchCustomDecks } from "../lib/decks";
import { categoryInfo } from "../data/builtinDecks";
import type { CustomDeck } from "../lib/types";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [decks, setDecks] = useState<CustomDeck[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.email ? user.email.split("@")[0] : "there";

  useEffect(() => {
    fetchCustomDecks()
      .then(setDecks)
      .catch(e => setError(e.message || "Couldn't load your decks"));
  }, []);

  const totalCards = (decks || []).reduce((sum, d) => sum + d.cards.length, 0);
  const categoriesUsed = new Set((decks || []).map(d => d.category)).size;
  const recent = [...(decks || [])].sort((a, b) => (b.created_at || "").localeCompare(a.created_at || "")).slice(0, 4);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Hero greeting */}
      <div className="bg-gradient-to-br from-[#7C5CFC] to-[#9C7FFF] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -right-4 -bottom-12 w-56 h-56 bg-white/5 rounded-full" />
        <div className="relative">
          <p className="text-white/80 text-sm font-medium mb-1">{greeting}, {firstName}! 👋</p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl mb-2">Ready to make therapy fun?</h1>
          <p className="text-white/70 text-sm mb-5">
            {decks === null ? "Loading your activities…" : `You have ${decks.length} ${decks.length === 1 ? "activity" : "activities"} in your library.`}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="md" onClick={() => navigate("/create")} className="bg-white text-[#7C5CFC] border-white hover:bg-white/90">
              + Create Activity
            </Button>
            <Button size="md" onClick={() => navigate("/my-decks")} className="bg-white/20 text-white border border-white/30 hover:bg-white/30">
              My Decks
            </Button>
          </div>
        </div>
      </div>

      {error && <div className="text-sm font-medium text-[#DC2626] bg-[#FEF2F2] rounded-lg px-3 py-2">{error}</div>}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📚" label="Your Activities" value={decks === null ? "…" : decks.length} color="#7C5CFC" />
        <StatCard icon="🃏" label="Total Cards" value={decks === null ? "…" : totalCards} color="#14B8A6" />
        <StatCard icon="🗂️" label="Categories Used" value={decks === null ? "…" : categoriesUsed} sub="out of 6" color="#F59E0B" />
        <StatCard icon="🔒" label="Visibility" value="Private" sub="publishing coming soon" color="#F43F5E" />
      </div>

      {/* Main 2-col layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <SectionHeader
              title="My Recent Activities"
              subtitle="Your latest created decks"
              action={<Button variant="ghost" size="sm" onClick={() => navigate("/my-decks")}>View all →</Button>}
            />
            <div className="mt-4 space-y-3">
              {decks === null ? (
                <Card><p className="text-sm text-[#9898A8] text-center py-4">Loading…</p></Card>
              ) : recent.length === 0 ? (
                <Card>
                  <div className="text-center py-6">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="text-sm text-[#6B6B80] mb-4">You haven't created any activities yet.</p>
                    <Button size="sm" onClick={() => navigate("/create")}>+ Create your first activity</Button>
                  </div>
                </Card>
              ) : (
                recent.map(d => (
                  <Card key={d.id} hover onClick={() => navigate(`/create?edit=${d.id}`)} padding="none">
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-12 h-12 rounded-xl bg-[#F3F0FF] flex items-center justify-center text-2xl shrink-0">
                        {categoryInfo[d.category]?.emoji || "🗂️"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#1C1B29] text-sm truncate">{d.title}</h3>
                        <p className="text-xs text-[#9898A8]">{d.cards.length} cards · {categoryInfo[d.category]?.name}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); navigate(`/play/${d.id}`); }}>▶ Play</Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right - 1/3 */}
        <div className="space-y-6">
          <section>
            <SectionHeader title="Student Progress" />
            <Card className="mt-4">
              <div className="text-center py-6">
                <p className="text-3xl mb-2">👥</p>
                <p className="text-sm font-semibold text-[#1C1B29] mb-1">Coming soon</p>
                <p className="text-xs text-[#9898A8]">Track students and their progress right here.</p>
              </div>
            </Card>
          </section>

          <section>
            <SectionHeader title="Community Picks" />
            <Card className="mt-4">
              <div className="text-center py-6">
                <p className="text-3xl mb-2">🌐</p>
                <p className="text-sm font-semibold text-[#1C1B29] mb-1">Coming soon</p>
                <p className="text-xs text-[#9898A8]">Discover activities made by other therapists.</p>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
