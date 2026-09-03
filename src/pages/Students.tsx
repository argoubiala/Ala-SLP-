import { useState } from "react";
import { useNavigate } from "react-router";
import { students } from "../data/mockData";
import { Input, Button, Tag, SectionHeader, StatCard } from "../components/ui/index";
import StudentCard from "../components/StudentCard";
import { Modal, Textarea, Select } from "../components/ui/index";

export default function Students() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = students.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.grade.toLowerCase().includes(search.toLowerCase())
  );

  const avgAccuracy = Math.round(students.reduce((a, s) => a + s.accuracy, 0) / students.length);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#1C1B29]">My Students</h1>
          <p className="text-[#6B6B80] text-sm mt-1">{students.length} students in your caseload</p>
        </div>
        <Button onClick={() => setAddOpen(true)} icon={<span>+</span>}>Add Student</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="👥" label="Total Students" value={students.length} color="#7C5CFC" />
        <StatCard icon="📈" label="Avg. Accuracy" value={`${avgAccuracy}%`} color="#22C55E" trend="up" trendValue="3%" />
        <StatCard icon="🎯" label="Sessions This Week" value={students.reduce((a, s) => a + s.sessionsThisWeek, 0)} color="#14B8A6" />
        <StatCard icon="🏆" label="Goals On Track" value={`${students.filter(s => s.accuracy >= 70).length}/${students.length}`} color="#F59E0B" />
      </div>

      {/* Search */}
      <div className="mb-5">
        <Input
          placeholder="Search students by name or grade…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={<span className="text-sm">🔍</span>}
        />
      </div>

      {/* Student grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <p className="text-5xl mb-4">👤</p>
          <h3 className="font-bold text-[#1C1B29] text-lg mb-2">No students found</h3>
          <p className="text-[#6B6B80] text-sm mb-6">Add your first student to get started</p>
          <Button onClick={() => setAddOpen(true)}>+ Add Student</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => <StudentCard key={s.id} student={s} />)}
        </div>
      )}

      {/* Add student modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Student" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" placeholder="Emma" />
            <Input label="Last Name" placeholder="Rodriguez" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Age" type="number" placeholder="7" />
            <Select
              label="Grade"
              value=""
              onChange={() => {}}
              options={[
                { value: "", label: "Select grade" },
                { value: "prek", label: "Pre-K" },
                { value: "k", label: "Kindergarten" },
                { value: "1", label: "1st Grade" },
                { value: "2", label: "2nd Grade" },
                { value: "3", label: "3rd Grade" },
                { value: "4", label: "4th Grade" },
                { value: "5", label: "5th Grade" },
                { value: "6+", label: "6th Grade+" },
              ]}
            />
          </div>
          <Textarea label="Initial Notes" placeholder="Any relevant background information…" rows={3} />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button fullWidth onClick={() => setAddOpen(false)}>Add Student</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
