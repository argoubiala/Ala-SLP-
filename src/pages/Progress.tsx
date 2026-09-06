import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, StatCard, SectionHeader, Badge, Avatar } from "../components/ui/index";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchStudentsWithSummary, fetchSessions, fetchWeeklyProgress, type StudentSummary } from "../lib/students";
import type { PracticeSession } from "../lib/types";

function initialsFor(name: string) {
  return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default function Progress() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentSummary[] | null>(null);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [weekly, setWeekly] = useState<{ label: string; accuracy: number; sessions: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchStudentsWithSummary(), fetchSessions(undefined, 500), fetchWeeklyProgress(8)])
      .then(([s, sess, w]) => {
        setStudents(s);
        setSessions(sess);
        setWeekly(w);
      })
      .catch(e => setError(e.message || "Couldn't load progress data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-3 border-[#EAE4FF] border-t-[#7C5CFC] rounded-full animate-spin" />
      </div>
    );
  }
  if (error) {
    return <div className="p-6 text-sm font-medium text-[#DC2626] bg-[#FEF2F2] rounded-lg mx-6 mt-6">{error}</div>;
  }

  const totalSessions = sessions.length;
  const avgAccuracy = totalSessions ? Math.round(sessions.reduce((a, s) => a + s.accuracy, 0) / totalSessions) : 0;
  const totalCards = sessions.reduce((a, s) => a + s.total, 0);

  const byActivity = new Map<string, { total: number; count: number }>();
  sessions.forEach(s => {
    const cur = byActivity.get(s.deck_title) || { total: 0, count: 0 };
    cur.total += s.accuracy;
    cur.count += 1;
    byActivity.set(s.deck_title, cur);
  });
  const activityPerformance = Array.from(byActivity.entries())
    .map(([name, v]) => ({ name: name.length > 18 ? name.slice(0, 18) + "…" : name, accuracy: Math.round(v.total / v.count), sessions: v.count }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 6);

  const goalRows = (students || []).flatMap(s => s.goals.map(g => ({ student: s, goal: g, pct: Math.min(100, Math.round((g.current / g.target) * 100)) })));

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-[#1C1B29]">Progress Dashboard</h1>
        <p className="text-[#6B6B80] text-sm mt-1">Overview of all student sessions and activity performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="🎮" label="Total Sessions" value={totalSessions} sub="all time" color="#7C5CFC" />
        <StatCard icon="⭐" label="Avg Accuracy" value={`${avgAccuracy}%`} sub="across all students" color="#22C55E" />
        <StatCard icon="🃏" label="Cards Completed" value={totalCards} sub="all time" color="#14B8A6" />
        <StatCard icon="👥" label="Active Students" value={(students || []).length} sub="in caseload" color="#F59E0B" />
      </div>

      {totalSessions === 0 ? (
        <Card>
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📊</p>
            <h3 className="font-bold text-[#1C1B29] text-lg mb-2">No sessions logged yet</h3>
            <p className="text-[#6B6B80] text-sm">Start a session with a student from their profile page to see progress here.</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-5 mb-5">
            <Card>
              <SectionHeader title="Sessions Per Week" subtitle="Last 8 weeks" />
              <div className="mt-4 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekly} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EFF9" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9898A8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9898A8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #E8E7F0", borderRadius: 10, fontSize: 12 }} />
                    <Bar dataKey="sessions" fill="#7C5CFC" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <SectionHeader title="Accuracy Trend" subtitle="Average accuracy per week" />
              <div className="mt-4 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weekly.filter(d => d.sessions > 0)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EFF9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9898A8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9898A8" }} domain={[0, 100]} unit="%" axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #E8E7F0", borderRadius: 10, fontSize: 12 }} formatter={(v: any) => [`${v}%`, "Accuracy"]} />
                    <Line type="monotone" dataKey="accuracy" stroke="#22C55E" strokeWidth={2.5} dot={{ fill: "#22C55E", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {activityPerformance.length > 0 && (
            <Card className="mb-5">
              <SectionHeader title="Activity Performance" subtitle="Accuracy by activity" />
              <div className="mt-4 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityPerformance} layout="vertical" barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EFF9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#9898A8" }} unit="%" domain={[0, 100]} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#9898A8" }} width={110} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #E8E7F0", borderRadius: 10, fontSize: 12 }} formatter={(v: any) => [`${v}%`, "Accuracy"]} />
                    <Bar dataKey="accuracy" fill="#7C5CFC" radius={[0, 6, 6, 0]} background={{ fill: "#F0EFF9", radius: 6 } as any} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </>
      )}

      {goalRows.length > 0 && (
        <Card>
          <SectionHeader title="Goal Progress" subtitle="Current status across all students" />
          <div className="mt-4 space-y-1">
            <div className="grid grid-cols-5 gap-4 px-3 py-2 text-xs font-semibold text-[#9898A8] uppercase tracking-wider">
              <span className="col-span-2">Student</span>
              <span>Goal</span>
              <span>Progress</span>
              <span className="text-right">Status</span>
            </div>
            {goalRows.map((item, i) => (
              <div key={i} className="grid grid-cols-5 gap-4 items-center px-3 py-3 rounded-xl hover:bg-[#F7F6F3] transition-colors cursor-pointer" onClick={() => navigate(`/students/${item.student.id}`)}>
                <div className="col-span-2 flex items-center gap-2 min-w-0">
                  <Avatar initials={initialsFor(item.student.name)} size="xs" />
                  <span className="text-sm font-medium text-[#1C1B29] truncate">{item.student.name}</span>
                </div>
                <span className="text-xs text-[#6B6B80] truncate">{item.goal.text}</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#F0EFF9] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.pct >= 90 ? "#22C55E" : item.pct >= 70 ? "#F59E0B" : "#EF4444" }} />
                  </div>
                  <span className="text-xs font-medium text-[#1C1B29] w-8 text-right">{item.pct}%</span>
                </div>
                <div className="text-right">
                  <Badge color={item.pct >= 90 ? "success" : item.pct >= 70 ? "warning" : "error"}>
                    {item.pct >= 90 ? "Met" : item.pct >= 70 ? "On Track" : "Needs Work"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
