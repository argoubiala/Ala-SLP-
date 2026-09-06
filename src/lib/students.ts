import { supabase } from "./supabase";
import type { Assignment, Goal, PracticeSession, Student } from "./types";

// ───────────────────────── Students ─────────────────────────

export async function fetchStudents(): Promise<Student[]> {
  const { data, error } = await supabase.from("students").select("*").order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []) as Student[];
}

export async function fetchStudentById(id: string): Promise<Student | null> {
  const { data, error } = await supabase.from("students").select("*").eq("id", id).single();
  if (error || !data) return null;
  return data as Student;
}

export interface StudentInput {
  name: string;
  age: number | null;
  grade: string;
  notes: string;
}

export async function createStudent(userId: string, input: StudentInput): Promise<Student> {
  const { data, error } = await supabase
    .from("students")
    .insert({ user_id: userId, name: input.name, age: input.age, grade: input.grade, notes: input.notes })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Student;
}

export async function updateStudent(id: string, input: StudentInput): Promise<void> {
  const { error } = await supabase
    .from("students")
    .update({ name: input.name, age: input.age, grade: input.grade, notes: input.notes })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ───────────────────────── Goals ─────────────────────────

export async function fetchGoals(studentId: string): Promise<Goal[]> {
  const { data, error } = await supabase.from("goals").select("*").eq("student_id", studentId).order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []) as Goal[];
}

export interface GoalInput {
  text: string;
  target: number;
  current: number;
  unit: string;
  category: string;
}

export async function createGoal(userId: string, studentId: string, input: GoalInput): Promise<Goal> {
  const { data, error } = await supabase
    .from("goals")
    .insert({ user_id: userId, student_id: studentId, ...input, achieved: input.current >= input.target })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Goal;
}

export async function updateGoalProgress(id: string, current: number, target: number): Promise<void> {
  const { error } = await supabase.from("goals").update({ current, achieved: current >= target }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ───────────────────────── Sessions ─────────────────────────

export interface LogSessionInput {
  studentId: string;
  deckId: string | null;
  deckTitle: string;
  score: number;
  total: number;
}

export async function logSession(userId: string, input: LogSessionInput): Promise<PracticeSession> {
  const accuracy = input.total > 0 ? Math.round((input.score / input.total) * 100) : 0;
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      user_id: userId,
      student_id: input.studentId,
      deck_id: input.deckId,
      deck_title: input.deckTitle,
      score: input.score,
      total: input.total,
      accuracy,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as PracticeSession;
}

export async function fetchSessions(studentId?: string, limit = 100): Promise<PracticeSession[]> {
  let query = supabase.from("sessions").select("*").order("created_at", { ascending: false }).limit(limit);
  if (studentId) query = query.eq("student_id", studentId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as PracticeSession[];
}

// ───────────────────────── Assignments ─────────────────────────

export async function fetchAssignments(studentId: string): Promise<Assignment[]> {
  const { data, error } = await supabase.from("assignments").select("*").eq("student_id", studentId).order("assigned_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as Assignment[];
}

export async function assignDeck(userId: string, studentId: string, deckId: string, deckTitle: string): Promise<void> {
  const { error } = await supabase.from("assignments").insert({ user_id: userId, student_id: studentId, deck_id: deckId, deck_title: deckTitle });
  if (error) throw new Error(error.message);
}

export async function setAssignmentCompleted(id: string, completed: boolean): Promise<void> {
  const { error } = await supabase.from("assignments").update({ completed }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteAssignment(id: string): Promise<void> {
  const { error } = await supabase.from("assignments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ───────────────────────── Aggregates ─────────────────────────

export interface StudentSummary extends Student {
  accuracy: number;
  sessionsThisWeek: number;
  totalSessions: number;
  lastSessionDate: string | null;
  goals: Goal[];
}

async function fetchAllGoals(): Promise<Goal[]> {
  const { data, error } = await supabase.from("goals").select("*");
  if (error) throw new Error(error.message);
  return (data || []) as Goal[];
}

export async function fetchStudentsWithSummary(): Promise<StudentSummary[]> {
  const [students, allSessions, allGoals] = await Promise.all([
    fetchStudents(),
    fetchSessions(undefined, 1000),
    fetchAllGoals(),
  ]);

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return students.map(s => {
    const sessions = allSessions.filter(sess => sess.student_id === s.id);
    const recentSessions = sessions.slice(0, 10);
    const accuracy = recentSessions.length ? Math.round(recentSessions.reduce((sum, x) => sum + x.accuracy, 0) / recentSessions.length) : 0;
    const sessionsThisWeek = sessions.filter(x => new Date(x.created_at).getTime() >= weekAgo).length;
    return {
      ...s,
      accuracy,
      sessionsThisWeek,
      totalSessions: sessions.length,
      lastSessionDate: sessions[0]?.created_at || null,
      goals: allGoals.filter(g => g.student_id === s.id),
    };
  });
}

export interface WeeklyPoint {
  label: string;
  accuracy: number;
  sessions: number;
}

export async function fetchWeeklyProgress(weeks = 8, studentId?: string): Promise<WeeklyPoint[]> {
  const sessions = await fetchSessions(studentId, 1000);
  const now = new Date();
  const points: WeeklyPoint[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - i * 7 - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const weekSessions = sessions.filter(s => {
      const t = new Date(s.created_at).getTime();
      return t >= weekStart.getTime() && t < weekEnd.getTime();
    });
    const accuracy = weekSessions.length ? Math.round(weekSessions.reduce((sum, s) => sum + s.accuracy, 0) / weekSessions.length) : 0;

    points.push({
      label: weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      accuracy,
      sessions: weekSessions.length,
    });
  }
  return points;
}
