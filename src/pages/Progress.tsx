import { useNavigate } from "react-router";
import { students, sessions, weeklyProgress } from "../data/mockData";
import { Card, StatCard, SectionHeader, Badge, Avatar } from "../components/ui/index";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const PIE_COLORS = ["#7C5CFC", "#14B8A6", "#F59E0B", "#F43F5E", "#3B82F6", "#22C55E"];

const activityPerformance = [
  { name: "R Sound", accuracy: 74, sessions: 8 },
  { name: "Directions", accuracy: 81, sessions: 5 },
  { name: "Vocabulary", accuracy: 68, sessions: 6 },
  { name: "S Blends", accuracy: 54, sessions: 4 },
  { name: "Social", accuracy: 82, sessions: 3 },
];

const categoryData = [
  { name: "Articulation", value: 45 },
  { name: "Language", value: 30 },
  { name: "Social Skills", value: 15 },
  { name: "Early Int.", value: 10 },
];

export default function Progress() {
  const navigate = useNavigate();
  const totalSessions = sessions.length;
  const avgAccuracy = Math.round(sessions.reduce((a, s) => a + s.accuracy, 0) / sessions.length);
  const totalCards = sessions.reduce((a, s) => a + s.cardsCompleted, 0);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-[#1C1B29]">Progress Dashboard</h1>
        <p className="text-[#6B6B80] text-sm mt-1">Overview of all student sessions and activity performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="🎮" label="Total Sessions" value={totalSessions} sub="this month" color="#7C5CFC" trend="up" trendValue="12%" />
        <StatCard icon="⭐" label="Avg Accuracy" value={`${avgAccuracy}%`} sub="across all students" color="#22C55E" trend="up" trendValue="4%" />
        <StatCard icon="🃏" label="Cards Completed" value={totalCards} sub="this month" color="#14B8A6" />
        <StatCard icon="👥" label="Active Students" value={students.length} sub="in caseload" color="#F59E0B" />
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Weekly sessions */}
        <Card>
          <SectionHeader title="Sessions This Week" subtitle="Daily session count" />
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProgress} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EFF9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9898A8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9898A8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #E8E7F0", borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="sessions" fill="#7C5CFC" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Weekly accuracy */}
        <Card>
          <SectionHeader title="Accuracy Trend" subtitle="Average accuracy per day" />
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyProgress.filter(d => d.accuracy > 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EFF9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9898A8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9898A8" }} domain={[0, 100]} unit="%" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #E8E7F0", borderRadius: 10, fontSize: 12 }} formatter={(v) => [`${v}%`, "Accuracy"]} />
                <Line type="monotone" dataKey="accuracy" stroke="#22C55E" strokeWidth={2.5} dot={{ fill: "#22C55E", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        {/* Activity performance */}
        <Card className="lg:col-span-2">
          <SectionHeader title="Activity Performance" subtitle="Accuracy by activity" />
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityPerformance} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EFF9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9898A8" }} unit="%" domain={[0, 100]} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#9898A8" }} width={80} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #E8E7F0", borderRadius: 10, fontSize: 12 }} formatter={(v) => [`${v}%`, "Accuracy"]} />
                <Bar dataKey="accuracy" fill="#7C5CFC" radius={[0, 6, 6, 0]} background={{ fill: "#F0EFF9", radius: 6 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category distribution */}
        <Card>
          <SectionHeader title="By Category" subtitle="Session distribution" />
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "white", border: "1px solid #E8E7F0", borderRadius: 10, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Student goal progress */}
      <Card>
        <SectionHeader title="Goal Progress" subtitle="Current status across all students" />
        <div className="mt-4 space-y-1">
          <div className="grid grid-cols-5 gap-4 px-3 py-2 text-xs font-semibold text-[#9898A8] uppercase tracking-wider">
            <span className="col-span-2">Student</span>
            <span>Goal</span>
            <span>Progress</span>
            <span className="text-right">Status</span>
          </div>
          {students.flatMap(s => s.goals.map(g => ({
            student: s,
            goal: g,
            pct: Math.round((g.current / g.target) * 100),
          }))).map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-5 gap-4 items-center px-3 py-3 rounded-xl hover:bg-[#F7F6F3] transition-colors cursor-pointer"
              onClick={() => navigate(`/students/${item.student.id}`)}
            >
              <div className="col-span-2 flex items-center gap-2 min-w-0">
                <Avatar initials={item.student.avatar} size="xs" />
                <span className="text-sm font-medium text-[#1C1B29] truncate">{item.student.name}</span>
              </div>
              <span className="text-xs text-[#6B6B80] truncate">{item.goal.category}</span>
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
    </div>
  );
}
