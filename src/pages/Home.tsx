import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, Button, StatCard, SectionHeader } from "../components/ui/index";
import ActivityCard from "../components/ActivityCard";
import { useAuth } from "../lib/auth";
import { fetchCustomDecks } from "../lib/decks";
import { fetchExploreDecks } from "../lib/community";
import { fetchStudentsWithSummary, type StudentSummary } from "../lib/students";
import { categoryInfo } from "../data/builtinDecks";
import type { CustomDeck, ExploreDeck } from "../lib/types";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [decks, setDecks] = useState<CustomDeck[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentSummary[] | null>(null);
  const [picks, setPicks] = useState<ExploreDeck[] | null>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.email ? user.email.split("@")[0] : "there";

  useEffect(() => {
    fetchCustomDecks()
      .then(setDecks)
      .catch(e => setError(e.message || "Couldn't load your decks"));
    fetchStudentsWithSummary()
      .then(setStudents)
      .catch(() => setStudents([]));
    fetchExploreDecks({ sort: "popular" })
      .then(d => setPicks(d.slice(0, 2)))
      .catch(() => setPicks([]));
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
        <StatCard icon="🌐" label="Published" value={decks === null ? "…" : decks.filter(d => d.visibility !== "private").length} sub="public or unlisted" color="#F43F5E" />
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
            <SectionHeader title="Student Progress" action={<Button variant="ghost" size="sm" onClick={() => navigate("/students")}>View all →</Button>} />
            <Card className="mt-4">
              {students === null ? (
                <p className="text-sm text-[#9898A8] text-center py-4">Loading…</p>
              ) : students.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-3xl mb-2">👥</p>
                  <p className="text-sm font-semibold text-[#1C1B29] mb-1">No students yet</p>
                  <p className="text-xs text-[#9898A8] mb-3">Add a student to start tracking progress.</p>
                  <Button size="sm" onClick={() => navigate("/students")}>+ Add Student</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.slice(0, 3).map(s => (
                    <div key={s.id} className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/students/${s.id}`)}>
                      <div className="w-9 h-9 rounded-full bg-[#7C5CFC] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {s.name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1C1B29] truncate">{s.name}</p>
                        <p className="text-xs text-[#9898A8]">{s.sessionsThisWeek} sessions this week</p>
                      </div>
                      <span className="text-sm font-bold" style={{ color: s.accuracy >= 80 ? "#22C55E" : s.accuracy >= 60 ? "#F59E0B" : "#EF4444" }}>{s.accuracy || "—"}{s.accuracy ? "%" : ""}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </section>

          <section>
            <SectionHeader title="Community Picks" action={<Button variant="ghost" size="sm" onClick={() => navigate("/explore")}>Explore →</Button>} />
            <div className="mt-4 space-y-3">
              {picks === null ? (
                <Card><p className="text-sm text-[#9898A8] text-center py-4">Loading…</p></Card>
              ) : picks.length === 0 ? (
                <Card>
                  <div className="text-center py-6">
                    <p className="text-3xl mb-2">🌐</p>
                    <p className="text-sm font-semibold text-[#1C1B29] mb-1">Nothing published yet</p>
                    <p className="text-xs text-[#9898A8]">Be the first to publish an activity from My Decks.</p>
                  </div>
                </Card>
              ) : (
                picks.map(p => <ActivityCard key={p.id} activity={p} variant="list" />)
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
