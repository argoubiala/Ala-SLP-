import { useEffect, useMemo, useState } from "react";
import { Input, Tag, SectionHeader } from "../components/ui/index";
import ActivityCard from "../components/ActivityCard";
import { fetchExploreDecks } from "../lib/community";
import { categoryInfo } from "../data/builtinDecks";
import type { CategoryKey, ExploreDeck, SortOption } from "../lib/types";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "recent", label: "Recently Published" },
  { value: "rating", label: "Highest Rated" },
  { value: "most_used", label: "Most Used" },
];

export default function Explore() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | CategoryKey>("All");
  const [ageRange, setAgeRange] = useState("All");
  const [language, setLanguage] = useState("All");
  const [sort, setSort] = useState<SortOption>("popular");

  const [decks, setDecks] = useState<ExploreDeck[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    fetchExploreDecks({ search, category, ageRange, language, sort })
      .then(setDecks)
      .catch(e => setError(e.message || "Couldn't load Explore"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, ageRange, language, sort]);

  const ageOptions = useMemo(() => {
    const s = new Set<string>();
    (decks || []).forEach(d => d.age_range && s.add(d.age_range));
    return ["All", ...Array.from(s).sort()];
  }, [decks]);

  const languageOptions = useMemo(() => {
    const s = new Set<string>();
    (decks || []).forEach(d => d.language && s.add(d.language));
    return ["All", ...Array.from(s).sort()];
  }, [decks]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-[#1C1B29]">Explore Activities</h1>
        <p className="text-[#6B6B80] text-sm mt-1">Discover and use activities published by other therapists</p>
      </div>

      <Input
        placeholder="Search activities, tags, or keywords…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        icon={<span className="text-sm">🔍</span>}
        className="text-base py-3 pl-10"
      />

      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-[#9898A8] uppercase tracking-wider mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            <Tag active={category === "All"} onClick={() => setCategory("All")}>All</Tag>
            {Object.entries(categoryInfo).map(([k, v]) => (
              <Tag key={k} active={category === k} onClick={() => setCategory(k as CategoryKey)}>{v.emoji} {v.name}</Tag>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xs font-semibold text-[#9898A8] uppercase tracking-wider mb-2">Age Range</p>
            <div className="flex flex-wrap gap-2">
              {ageOptions.map(a => <Tag key={a} active={ageRange === a} onClick={() => setAgeRange(a)}>{a}</Tag>)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#9898A8] uppercase tracking-wider mb-2">Language</p>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map(l => <Tag key={l} active={language === l} onClick={() => setLanguage(l)}>{l}</Tag>)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#9898A8] uppercase tracking-wider mb-2">Sort by</p>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map(s => <Tag key={s.value} active={sort === s.value} onClick={() => setSort(s.value)}>{s.label}</Tag>)}
            </div>
          </div>
        </div>
      </div>

      {error && <div className="text-sm font-medium text-[#DC2626] bg-[#FEF2F2] rounded-lg px-3 py-2">{error}</div>}

      <section>
        <SectionHeader
          title={search ? `Results for "${search}"` : "All Activities"}
          subtitle={decks === null ? "Loading…" : `${decks.length} ${decks.length === 1 ? "activity" : "activities"} found`}
        />
        {decks === null ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-3 border-[#EAE4FF] border-t-[#7C5CFC] rounded-full animate-spin" />
          </div>
        ) : decks.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="font-bold text-[#1C1B29] text-lg mb-2">No activities found yet</h3>
            <p className="text-[#6B6B80] text-sm">Be the first to publish one from My Decks, or try different filters</p>
          </div>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {decks.map(a => <ActivityCard key={a.id} activity={a} />)}
          </div>
        )}
      </section>
    </div>
  );
}
