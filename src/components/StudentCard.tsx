import { useNavigate } from "react-router";
import type { Student } from "../data/mockData";
import { Avatar, ProgressBar, Card } from "./ui/index";

interface StudentCardProps {
  student: Student;
}

function getAccuracyColor(acc: number) {
  if (acc >= 80) return "#22C55E";
  if (acc >= 60) return "#F59E0B";
  return "#EF4444";
}

export default function StudentCard({ student }: StudentCardProps) {
  const navigate = useNavigate();
  const color = getAccuracyColor(student.accuracy);

  return (
    <Card hover onClick={() => navigate(`/students/${student.id}`)} className="group">
      <div className="flex items-start gap-3 mb-4">
        <Avatar initials={student.avatar} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#1C1B29] text-sm leading-tight">{student.name}</h3>
          <p className="text-xs text-[#9898A8] mt-0.5">{student.grade} · Age {student.age}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xl font-bold" style={{ color }}>{student.accuracy}%</span>
          <span className="text-[10px] text-[#9898A8]">accuracy</span>
        </div>
      </div>

      {/* Goals */}
      <div className="space-y-2.5 mb-4">
        {student.goals.slice(0, 2).map(goal => (
          <ProgressBar
            key={goal.id}
            value={goal.current}
            max={goal.target}
            color={getAccuracyColor((goal.current / goal.target) * 100)}
            size="sm"
            showLabel
            label={goal.text.length > 30 ? goal.text.slice(0, 30) + "…" : goal.text}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#F0EFF9]">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[#9898A8]">📅 Last: {student.lastSession}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-[#7C5CFC]">{student.sessionsThisWeek} sessions</span>
          <span className="text-xs text-[#9898A8]">this week</span>
        </div>
      </div>
    </Card>
  );
}
