import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, Button, Badge, ProgressBar, Avatar, SectionHeader, Textarea, Modal, Input, Select } from "../components/ui/index";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../lib/auth";
import { categoryInfo } from "../data/builtinDecks";
import { fetchCustomDecks } from "../lib/decks";
import {
  fetchStudentById, updateStudent, deleteStudent,
  fetchGoals, createGoal, deleteGoal,
  fetchAssignments, assignDeck, setAssignmentCompleted, deleteAssignment,
  fetchSessions, fetchWeeklyProgress,
} from "../lib/students";
import type { Student, Goal, Assignment, PracticeSession, CustomDeck } from "../lib/types";

function initialsFor(name: string) {
  return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [student, setStudent] = useState<Student | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [chartData, setChartData] = useState<{ label: string; accuracy: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"overview" | "activities" | "notes">("overview");
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const [goalOpen, setGoalOpen] = useState(false);
  const [goalText, setGoalText] = useState("");
  const [goalTarget, setGoalTarget] = useState("100");
  const [goalCurrent, setGoalCurrent] = useState("0");
  const [goalUnit, setGoalUnit] = useState("%");
  const [savingGoal, setSavingGoal] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);
  const [myDecks, setMyDecks] = useState<CustomDeck[]>([]);
  const [pickedDeckId, setPickedDeckId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!id) return;
    load();
  }, [id]);

  async function load() {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    try {
      const s = await fetchStudentById(id);
      if (!s) {
        setLoadError("That student couldn't be found.");
        return;
      }
      setStudent(s);
      setNotes(s.notes || "");
      const [g, a, sess, chart] = await Promise.all([
        fetchGoals(id),
        fetchAssignments(id),
        fetchSessions(id, 20),
        fetchWeeklyProgress(7, id),
      ]);
      setGoals(g);
      setAssignments(a);
      setSessions(sess);
      setChartData(chart.map(p => ({ label: p.label, accuracy: p.accuracy })));
    } catch (e: any) {
      setLoadError(e.message || "Couldn't load this student.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveNotes() {
    if (!student) return;
    setSavingNotes(true);
    try {
      await updateStudent(student.id, { name: student.name, age: student.age, grade: student.grade || "", notes });
    } catch (e: any) {
      alert("Couldn't save notes: " + (e.message || e));
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleDeleteStudent() {
    if (!student) return;
    if (!confirm(`Remove ${student.name} and all their session history? This can't be undone.`)) return;
    try {
      await deleteStudent(student.id);
      navigate("/students");
    } catch (e: any) {
      alert("Couldn't remove student: " + (e.message || e));
    }
  }

  async function handleAddGoal() {
    if (!user || !student || !goalText.trim()) {
      alert("Please describe the goal.");
      return;
    }
    setSavingGoal(true);
    try {
      const goal = await createGoal(user.id, student.id, {
        text: goalText.trim(),
        target: parseInt(goalTarget, 10) || 100,
        current: parseInt(goalCurrent, 10) || 0,
        unit: goalUnit,
        category: "",
      });
      setGoals(g => [...g, goal]);
      setGoalOpen(false);
      setGoalText(""); setGoalTarget("100"); setGoalCurrent("0"); setGoalUnit("%");
    } catch (e: any) {
      alert("Couldn't add goal: " + (e.message || e));
    } finally {
      setSavingGoal(false);
    }
  }

  async function handleDeleteGoal(goalId: string) {
    try {
      await deleteGoal(goalId);
      setGoals(g => g.filter(x => x.id !== goalId));
    } catch (e: any) {
      alert("Couldn't remove goal: " + (e.message || e));
    }
  }

  async function openAssignModal() {
    setAssignOpen(true);
    if (myDecks.length === 0) {
      try {
        setMyDecks(await fetchCustomDecks());
      } catch {
        // ignore, modal will just show "no decks" state
      }
    }
  }

  async function handleAssign() {
    if (!user || !student || !pickedDeckId) return;
    const deck = myDecks.find(d => d.id === pickedDeckId);
    if (!deck) return;
    setAssigning(true);
    try {
      await assignDeck(user.id, student.id, deck.id, deck.title);
      setAssignments(await fetchAssignments(student.id));
      setAssignOpen(false);
      setPickedDeckId("");
    } catch (e: any) {
      alert("Couldn't assign activity: " + (e.message || e));
    } finally {
      setAssigning(false);
    }
  }

  async function handleToggleComplete(a: Assignment) {
    try {
      await setAssignmentCompleted(a.id, !a.completed);
      setAssignments(list => list.map(x => (x.id === a.id ? { ...x, completed: !x.completed } : x)));
    } catch (e: any) {
      alert("Couldn't update: " + (e.message || e));
    }
  }

  async function handleRemoveAssignment(assignmentId: string) {
    try {
      await deleteAssignment(assignmentId);
      setAssignments(list => list.filter(x => x.id !== assignmentId));
    } catch (e: any) {
      alert("Couldn't remove: " + (e.message || e));
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-3 border-[#EAE4FF] border-t-[#7C5CFC] rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError || !student) {
    return (
      <div className="flex flex-col items-center py-24 text-center gap-3">
        <p className="text-5xl mb-2">🙁</p>
        <p className="text-[#1C1B29] font-semibold">{loadError}</p>
        <Button variant="secondary" onClick={() => navigate("/students")}>← Back to Students</Button>
      </div>
    );
  }

  const totalSessions = sessions.length;
  const sessionsThisWeek = sessions.filter(s => Date.now() - new Date(s.created_at).getTime() < 7 * 86400000).length;
  const lastSession = sessions[0] ? new Date(sessions[0].created_at).toLocaleDateString() : "No sessions yet";
  const tabs = ["overview", "activities", "notes"] as const;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-fade-in">
      <button onClick={() => navigate("/students")} className="flex items-center gap-2 text-[#6B6B80] text-sm hover:text-[#1C1B29] mb-5 transition-colors">
        ← Back to Students
      </button>

      <Card className="mb-5">
        <div className="flex items-start gap-4">
          <Avatar initials={initialsFor(student.name)} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="font-display font-bold text-2xl text-[#1C1B29]">{student.name}</h1>
                <p className="text-[#6B6B80] mt-0.5">{student.grade || "—"}{student.age ? ` · Age ${student.age}` : ""}</p>
              </div>
              <div className="flex gap-2">
                {assignments[0] && (
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/play/${assignments[0].deck_id}?student=${student.id}`)}>▶ Start Session</Button>
                )}
                <Button variant="outline" size="sm" onClick={handleDeleteStudent}>🗑 Remove</Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1.5"><span className="text-[#9898A8]">Last session:</span><span className="font-medium text-[#1C1B29]">{lastSession}</span></div>
              <div className="flex items-center gap-1.5"><span className="text-[#9898A8]">Total sessions:</span><span className="font-medium text-[#1C1B29]">{totalSessions}</span></div>
              <div className="flex items-center gap-1.5"><span className="text-[#9898A8]">This week:</span><span className="font-medium text-[#7C5CFC]">{sessionsThisWeek} sessions</span></div>
            </div>
          </div>
        </div>
      </Card>

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
            <Card>
              <SectionHeader title="Accuracy Over Time" subtitle="Last 7 weeks" />
              <div className="mt-4 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EFF9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9898A8" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#9898A8" }} domain={[0, 100]} unit="%" />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #E8E7F0", borderRadius: 10, fontSize: 12 }} formatter={(v: any) => [`${v}%`, "Accuracy"]} />
                    <Line type="monotone" dataKey="accuracy" stroke="#7C5CFC" strokeWidth={2.5} dot={{ fill: "#7C5CFC", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <SectionHeader title="Recent Sessions" />
              <div className="mt-4 space-y-2">
                {sessions.length === 0 ? (
                  <p className="text-sm text-[#9898A8] py-4 text-center">No sessions yet — start one from an assigned activity</p>
                ) : sessions.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F7F6F3] transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-[#F3F0FF] flex items-center justify-center text-sm font-bold text-[#7C5CFC]">{s.accuracy}%</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1C1B29] truncate">{s.deck_title}</p>
                      <p className="text-xs text-[#9898A8]">{new Date(s.created_at).toLocaleDateString()} · {s.score}/{s.total} cards</p>
                    </div>
                    <Badge color={s.accuracy >= 80 ? "success" : s.accuracy >= 60 ? "warning" : "error"}>{s.accuracy}%</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <SectionHeader title="Goals" action={<Button variant="ghost" size="sm" onClick={() => setGoalOpen(true)}>+ Add</Button>} />
              <div className="mt-4 space-y-4">
                {goals.length === 0 ? (
                  <p className="text-xs text-[#9898A8] text-center py-3">No goals yet</p>
                ) : goals.map(goal => {
                  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
                  const color = pct >= 90 ? "#22C55E" : pct >= 70 ? "#F59E0B" : "#EF4444";
                  return (
                    <div key={goal.id} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-[#1C1B29] leading-snug">{goal.text}</p>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                          <button onClick={() => handleDeleteGoal(goal.id)} className="opacity-0 group-hover:opacity-100 text-[#C0BFD0] hover:text-red-400 text-xs transition-opacity">✕</button>
                        </div>
                      </div>
                      <ProgressBar value={goal.current} max={goal.target} color={color} size="sm" />
                      <p className="text-[10px] text-[#9898A8] mt-0.5">{goal.current}/{goal.target} {goal.unit}</p>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <SectionHeader title="Assigned" action={<Button variant="ghost" size="sm" onClick={openAssignModal}>+ Assign</Button>} />
              <div className="mt-3 space-y-2">
                {assignments.length === 0 ? (
                  <p className="text-xs text-[#9898A8] text-center py-3">Nothing assigned yet</p>
                ) : assignments.map(a => (
                  <div key={a.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-[#F7F6F3] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#F3F0FF] flex items-center justify-center text-base shrink-0 cursor-pointer" onClick={() => navigate(`/play/${a.deck_id}?student=${student.id}`)}>▶</div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/play/${a.deck_id}?student=${student.id}`)}>
                      <p className={`text-xs font-medium truncate ${a.completed ? "text-[#9898A8] line-through" : "text-[#1C1B29]"}`}>{a.deck_title}</p>
                    </div>
                    <input type="checkbox" checked={a.completed} onChange={() => handleToggleComplete(a)} title="Mark completed" />
                    <button onClick={() => handleRemoveAssignment(a.id)} className="text-[#C0BFD0] hover:text-red-400 text-xs">✕</button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "activities" && (
        <div className="space-y-3">
          <SectionHeader title="Assigned Activities" action={<Button size="sm" variant="secondary" onClick={openAssignModal}>+ Assign Activity</Button>} />
          {assignments.length === 0 ? (
            <p className="text-sm text-[#9898A8] text-center py-8">No activities assigned yet</p>
          ) : assignments.map(a => (
            <Card key={a.id} hover onClick={() => navigate(`/play/${a.deck_id}?student=${student.id}`)} padding="none">
              <div className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 rounded-xl bg-[#F3F0FF] flex items-center justify-center text-2xl shrink-0">🗂️</div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-sm ${a.completed ? "text-[#9898A8] line-through" : "text-[#1C1B29]"}`}>{a.deck_title}</h3>
                  <p className="text-xs text-[#9898A8]">{a.completed ? "Completed" : "Not completed yet"}</p>
                </div>
                <Button size="sm" onClick={e => { e.stopPropagation(); navigate(`/play/${a.deck_id}?student=${student.id}`); }}>▶ Play</Button>
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
              <Button size="sm" onClick={handleSaveNotes} loading={savingNotes}>Save Notes</Button>
            </div>
          </div>
        </Card>
      )}

      <Modal open={goalOpen} onClose={() => setGoalOpen(false)} title="Add a Goal" size="md">
        <div className="space-y-4">
          <Input label="Goal description" placeholder="e.g. Produce /r/ in initial position" value={goalText} onChange={e => setGoalText(e.target.value)} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Current" type="number" value={goalCurrent} onChange={e => setGoalCurrent(e.target.value)} />
            <Input label="Target" type="number" value={goalTarget} onChange={e => setGoalTarget(e.target.value)} />
            <Input label="Unit" placeholder="%" value={goalUnit} onChange={e => setGoalUnit(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setGoalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddGoal} loading={savingGoal}>Add Goal</Button>
          </div>
        </div>
      </Modal>

      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign an Activity" size="md">
        <div className="space-y-4">
          {myDecks.length === 0 ? (
            <p className="text-sm text-[#9898A8] text-center py-4">You don't have any decks yet — create one from My Decks first.</p>
          ) : (
            <Select
              label="Choose one of your decks"
              value={pickedDeckId}
              onChange={e => setPickedDeckId(e.target.value)}
              options={[{ value: "", label: "Select a deck…" }, ...myDecks.map(d => ({ value: d.id, label: `${categoryInfo[d.category]?.emoji || ""} ${d.title}` }))]}
            />
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} loading={assigning} disabled={!pickedDeckId}>Assign</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
