import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Input, Tag, Button, Card, SectionHeader, DropdownMenu, Badge } from "../components/ui/index";
import { fetchCustomDecks, deleteDeck } from "../lib/decks";
import { categoryInfo } from "../data/builtinDecks";
import type { CustomDeck, CategoryKey, Visibility } from "../lib/types";

const CATEGORY_FILTERS: ("All" | CategoryKey)[] = ["All", "articulation", "phonology", "language", "literacy", "cognitive", "aac"];

function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  if (visibility === "public") return <Badge color="success">Public</Badge>;
  if (visibility === "unlisted") return <Badge color="warning">Unlisted</Badge>;
  return <Badge color="neutral">Private</Badge>;
}

interface DeckMenuProps {
  deck: CustomDeck;
  onDelete: (id: string) => void;
}

function DeckMenu({ deck, onDelete }: DeckMenuProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F0EFF9] text-[#9898A8] text-lg transition-colors"
      >
        ⋮
      </button>
      <DropdownMenu
        open={open}
        onClose={() => setOpen(false)}
        className="right-0 top-9"
        items={[
          { icon: "▶", label: "Play", onClick: () => navigate(`/play/${deck.id}`) },
          { icon: "✏", label: "Edit", onClick: () => navigate(`/create?edit=${deck.id}`) },
          { icon: "🗑", label: "Delete", onClick: () => onDelete(deck.id), danger: true },
        ]}
      />
    </div>
  );
}

export default function MyDecks() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | CategoryKey>("All");
  const [myDecks, setMyDecks] = useState<CustomDeck[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    load();
  }, []);

  function load() {
    setError(null);
    fetchCustomDecks()
      .then(setMyDecks)
      .catch(e => setError(e.message || "Couldn't load your decks"));
  }

  const decks = myDecks || [];
  const filtered = decks.filter(d => {
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "All" || d.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  async function handleDelete(id: string) {
    if (!confirm("Delete this activity? This can't be undone.")) return;
    try {
      await deleteDeck(id);
      setMyDecks(d => (d || []).filter(a => a.id !== id));
    } catch (e: any) {
      alert("Couldn't delete: " + (e.message || e));
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#1C1B29]">My Decks</h1>
          <p className="text-[#6B6B80] text-sm mt-1">{myDecks === null ? "Loading…" : `${decks.length} ${decks.length === 1 ? "activity" : "activities"} in your library`}</p>
        </div>
        <Button onClick={() => navigate("/create")} icon={<span>+</span>}>New Activity</Button>
      </div>

      {error && <div className="mb-5 text-sm font-medium text-[#DC2626] bg-[#FEF2F2] rounded-lg px-3 py-2">{error}</div>}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card padding="sm">
          <p className="text-2xl font-bold text-[#7C5CFC]">{decks.length}</p>
          <p className="text-xs text-[#9898A8] font-medium">Total Activities</p>
        </Card>
        <Card padding="sm">
          <p className="text-2xl font-bold text-[#14B8A6]">{decks.reduce((s, d) => s + d.cards.length, 0)}</p>
          <p className="text-xs text-[#9898A8] font-medium">Total Cards</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex-1 min-w-48">
          <Input
            placeholder="Search your decks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<span className="text-sm">🔍</span>}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORY_FILTERS.map(c => (
            <Tag key={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)}>
              {c === "All" ? "All" : `${categoryInfo[c].emoji} ${categoryInfo[c].name}`}
            </Tag>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-[#F0EFF9] rounded-lg p-1">
          <button onClick={() => setViewMode("grid")} className={`px-2.5 py-1 rounded-md text-sm transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-[#7C5CFC]" : "text-[#9898A8]"}`}>⊞</button>
          <button onClick={() => setViewMode("list")} className={`px-2.5 py-1 rounded-md text-sm transition-all ${viewMode === "list" ? "bg-white shadow-sm text-[#7C5CFC]" : "text-[#9898A8]"}`}>☰</button>
        </div>
      </div>

      {/* Deck grid/list */}
      {myDecks === null ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-3 border-[#EAE4FF] border-t-[#7C5CFC] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <p className="text-5xl mb-4">📭</p>
          <h3 className="font-bold text-[#1C1B29] text-lg mb-2">No activities found</h3>
          <p className="text-[#6B6B80] text-sm mb-6">Try a different search or create a new one</p>
          <Button onClick={() => navigate("/create")}>+ Create Activity</Button>
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-3">
          {filtered.map(d => (
            <Card key={d.id} hover padding="none">
              <div className="flex items-center gap-4 p-4">
                <div className="w-14 h-14 rounded-xl bg-[#F3F0FF] flex items-center justify-center text-3xl shrink-0">
                  {categoryInfo[d.category]?.emoji || "🗂️"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#1C1B29] text-sm truncate">{d.title}</h3>
                    <VisibilityBadge visibility={d.visibility} />
                  </div>
                  <p className="text-xs text-[#9898A8]">{d.cards.length} cards · {categoryInfo[d.category]?.name}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" onClick={() => navigate(`/play/${d.id}`)}>▶ Play</Button>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/create?edit=${d.id}`)}>✏ Edit</Button>
                  <DeckMenu deck={d} onDelete={handleDelete} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(d => (
            <Card key={d.id} hover padding="none" className="group overflow-hidden">
              <div
                className="relative h-36 flex items-center justify-center text-5xl cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${categoryInfo[d.category]?.color}22, ${categoryInfo[d.category]?.color}11)` }}
                onClick={() => navigate(`/create?edit=${d.id}`)}
              >
                {categoryInfo[d.category]?.emoji || "🗂️"}
                <div className="absolute top-2 right-2">
                  <DeckMenu deck={d} onDelete={handleDelete} />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-[#1C1B29] text-sm leading-snug mb-1 truncate">{d.title}</h3>
                <div className="mb-1"><VisibilityBadge visibility={d.visibility} /></div>
                <p className="text-xs text-[#9898A8] mb-3">{d.cards.length} cards · {categoryInfo[d.category]?.name}</p>
                <div className="flex gap-2">
                  <Button size="sm" fullWidth onClick={() => navigate(`/play/${d.id}`)}>▶ Play</Button>
                  <Button size="sm" variant="outline" fullWidth onClick={() => navigate(`/create?edit=${d.id}`)}>✏ Edit</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
