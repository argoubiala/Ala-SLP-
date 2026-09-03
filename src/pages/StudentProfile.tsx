import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { students, activities, sessions } from "../data/mockData";
import { Card, Button, Badge, ProgressBar, Avatar, StatCard, SectionHeader, Textarea } from "../components/ui/index";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const student = students.find(s => s.id === id) || students[0];
  const [activeTab, setActiveTab] = useState<"overview" | "activities" | "notes">("overview");
  const [notes, setNotes] = useState(student.notes);

  const studentSessions = sessions.filter(s => s.studentId === student.id);
  const assignedActivities = activities.filter(a => student.assignedActivities.includes(a.id));

  const tabs = ["overview", "activities", "notes"] as const;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate("/students")} className="flex items-center gap-2 text-[#6B6B80] text-sm hover:text-[#1C1B29] mb-5 transition-colors">
        ← Back to Students
      </button>

      {/* Profile header */}
      <Card className="mb-5">
        <div className="flex items-start gap-4">
          <Avatar initials={student.avatar} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-display font-bold text-2xl text-[#1C1B29]">{student.name}</h1>
                <p className="text-[#6B6B80] mt-0.5">{student.grade} · Age {student.age}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => navigate(`/play/${student.assignedActivities[0]}`)}>▶ Start Session</Button>
                <Button variant="outline" size="sm">✏ Edit</Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-[#9898A8]">Last session:</span>
                <span className="font-medium text-[#1C1B29]">{student.lastSession}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#9898A8]">Total sessions:</span>
                <span className="font-medium text-[#1C1B29]">{student.totalSessions}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#9898A8]">This week:</span>
                <span className="font-medium text-[#7C5CFC]">{student.sessionsThisWeek} sessions</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F0EFF9] p-1 rounded-xl mb-5 w-fit">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? "bg-white text-[#7C5CFC] shadow-sm" : "text-[#6B6B80] hover:text-[#1C1B29]"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Progress chart */}
            <Card>
              <SectionHeader title="Accuracy Over Time" subtitle="Last 7 weeks" />
              <div className="mt-4 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={student.progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EFF9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9898A8" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#9898A8" }} domain={[0, 100]} unit="%" />
                    <Tooltip
                      contentStyle={{ background: "white", border: "1px solid #E8E7F0", borderRadius: 10, fontSize: 12 }}
                      formatter={(v) => [`${v}%`, "Accuracy"]}
                    />
                    <Line type="monotone" dataKey="accuracy" stroke="#7C5CFC" strokeWidth={2.5} dot={{ fill: "#7C5CFC", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Recent sessions */}
            <Card>
              <SectionHeader title="Recent Sessions" />
              <div className="mt-4 space-y-2">
                {studentSessions.length === 0 ? (
                  <p className="text-sm text-[#9898A8] py-4 text-center">No sessions yet</p>
                ) : studentSessions.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F7F6F3] transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-[#F3F0FF] flex items-center justify-center text-sm font-bold text-[#7C5CFC]">
                      {s.accuracy}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1C1B29] truncate">{s.activityTitle}</p>
                      <p className="text-xs text-[#9898A8]">{s.date} · {s.duration} min · {s.cardsCompleted}/{s.totalCards} cards</p>
                    </div>
                    <Badge color={s.accuracy >= 80 ? "success" : s.accuracy >= 60 ? "warning" : "error"}>{s.accuracy}%</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Goals */}
            <Card>
              <SectionHeader title="Goals" action={<Button variant="ghost" size="sm">+ Add</Button>} />
              <div className="mt-4 space-y-4">
                {student.goals.map(goal => {
                  const pct = Math.round((goal.current / goal.target) * 100);
                  const color = pct >= 90 ? "#22C55E" : pct >= 70 ? "#F59E0B" : "#EF4444";
                  return (
                    <div key={goal.id}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-[#1C1B29] leading-snug">{goal.text}</p>
                        <span className="text-xs font-bold ml-2 shrink-0" style={{ color }}>{pct}%</span>
                      </div>
                      <ProgressBar value={goal.current} max={goal.target} color={color} size="sm" />
                      <p className="text-[10px] text-[#9898A8] mt-0.5">{goal.current}/{goal.target} {goal.unit}</p>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Assigned activities */}
            <Card>
              <SectionHeader title="Assigned" action={<Button variant="ghost" size="sm">+ Assign</Button>} />
              <div className="mt-3 space-y-2">
                {assignedActivities.map(a => (
                  <div key={a.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-[#F7F6F3] transition-colors cursor-pointer" onClick={() => navigate(`/play/${a.id}`)}>
                    <div className="w-8 h-8 rounded-lg bg-[#F3F0FF] flex items-center justify-center text-base shrink-0">{a.thumbnail}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#1C1B29] truncate">{a.title}</p>
                      <p className="text-[10px] text-[#9898A8]">{a.cardCount} cards</p>
                    </div>
                    <span className="text-[#7C5CFC] text-xs">▶</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "activities" && (
        <div className="space-y-3">
          <SectionHeader
            title="Assigned Activities"
            action={<Button size="sm" variant="secondary">+ Assign Activity</Button>}
          />
          {assignedActivities.map(a => (
            <Card key={a.id} hover onClick={() => navigate(`/play/${a.id}`)} padding="none">
              <div className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 rounded-xl bg-[#F3F0FF] flex items-center justify-center text-2xl shrink-0">{a.thumbnail}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1C1B29] text-sm">{a.title}</h3>
                  <p className="text-xs text-[#9898A8]">{a.cardCount} cards · {a.category}</p>
                </div>
                <Button size="sm" onClick={e => { e.stopPropagation(); navigate(`/play/${a.id}`); }}>▶ Play</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "notes" && (
        <Card>
          <SectionHeader title="Session Notes" subtitle="Keep track of observations and strategies" />
          <div className="mt-4">
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={10} placeholder="Add notes about this student's progress, goals, strategies…" />
            <div className="flex justify-end mt-3">
              <Button size="sm">Save Notes</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
