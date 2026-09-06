import { useEffect, useState } from "react";
import { Input, Button, Modal, Textarea } from "../components/ui/index";
import StudentCard from "../components/StudentCard";
import { useAuth } from "../lib/auth";
import { fetchStudentsWithSummary, createStudent, type StudentSummary } from "../lib/students";

export default function Students() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setError(null);
    fetchStudentsWithSummary()
      .then(setStudents)
      .catch(e => setError(e.message || "Couldn't load your students"));
  }

  async function handleAddStudent() {
    if (!user || !name.trim()) {
      alert("Please give the student a name.");
      return;
    }
    setSaving(true);
    try {
      await createStudent(user.id, { name: name.trim(), age: age ? parseInt(age, 10) : null, grade: grade.trim(), notes: notes.trim() });
      setAddOpen(false);
      setName(""); setAge(""); setGrade(""); setNotes("");
      load();
    } catch (e: any) {
      alert("Couldn't add student: " + (e.message || e));
    } finally {
      setSaving(false);
    }
  }

  const filtered = (students || []).filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#1C1B29]">Students</h1>
          <p className="text-[#6B6B80] text-sm mt-1">{students === null ? "Loading…" : `${students.length} in your caseload`}</p>
        </div>
        <Button onClick={() => setAddOpen(true)} icon={<span>+</span>}>Add Student</Button>
      </div>

      {error && <div className="mb-5 text-sm font-medium text-[#DC2626] bg-[#FEF2F2] rounded-lg px-3 py-2">{error}</div>}

      <div className="mb-5 max-w-sm">
        <Input placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} icon={<span className="text-sm">🔍</span>} />
      </div>

      {students === null ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-3 border-[#EAE4FF] border-t-[#7C5CFC] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <p className="text-5xl mb-4">👥</p>
          <h3 className="font-bold text-[#1C1B29] text-lg mb-2">{search ? "No students found" : "No students yet"}</h3>
          <p className="text-[#6B6B80] text-sm mb-6">{search ? "Try a different search" : "Add your first student to start tracking their progress"}</p>
          {!search && <Button onClick={() => setAddOpen(true)}>+ Add Student</Button>}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => <StudentCard key={s.id} student={s} />)}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add a Student" size="md">
        <div className="space-y-4">
          <Input label="Name" placeholder="e.g. Jordan Lee" value={name} onChange={e => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Age" type="number" placeholder="7" value={age} onChange={e => setAge(e.target.value)} />
            <Input label="Grade" placeholder="e.g. 2nd Grade" value={grade} onChange={e => setGrade(e.target.value)} />
          </div>
          <Textarea label="Notes" placeholder="Anything worth remembering about this student" value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddStudent} loading={saving}>Add Student</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
