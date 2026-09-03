import { useState } from "react";
import { activities, categories, ageRanges, languages } from "../data/mockData";
import { Input, Tag, SectionHeader, Button, Badge } from "../components/ui/index";
import ActivityCard from "../components/ActivityCard";

export default function Explore() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedAge, setSelectedAge] = useState("All Ages");
  const [selectedLang, setSelectedLang] = useState("All Languages");
  const [favs, setFavs] = useState<Set<string>>(new Set());

  const publicActivities = activities.filter(a => a.status === "public");

  const filtered = publicActivities.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()) || a.tags.some(t => t.includes(search.toLowerCase()));
    const matchCat = selectedCategory === "All" || a.category === selectedCategory;
    const matchLang = selectedLang === "All Languages" || a.language === selectedLang || (selectedLang === "Bilingual" && a.language === "Bilingual");
    return matchSearch && matchCat && matchLang;
  });

  const featured = publicActivities.filter(a => a.rating >= 4.8).slice(0, 3);

  const toggleFav = (id: string) => {
    setFavs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const withFavs = filtered.map(a => ({ ...a, isFavorited: favs.has(a.id) }));

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-[#1C1B29]">Explore Activities</h1>
        <p className="text-[#6B6B80] text-sm mt-1">Discover and use activities created by the SLP community</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Input
          placeholder="Search activities, skills, or keywords…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={<span className="text-sm">🔍</span>}
          className="text-base py-3 pl-10"
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-[#9898A8] uppercase tracking-wider mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <Tag key={c} active={selectedCategory === c} onClick={() => setSelectedCategory(c)}>{c}</Tag>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold text-[#9898A8] uppercase tracking-wider mb-2">Age Range</p>
            <div className="flex flex-wrap gap-2">
              {ageRanges.map(a => (
                <Tag key={a} active={selectedAge === a} onClick={() => setSelectedAge(a)}>{a}</Tag>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#9898A8] uppercase tracking-wider mb-2">Language</p>
            <div className="flex flex-wrap gap-2">
              {languages.map(l => (
                <Tag key={l} active={selectedLang === l} onClick={() => setSelectedLang(l)}>{l}</Tag>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured */}
      {!search && selectedCategory === "All" && (
        <section>
          <SectionHeader title="⭐ Featured This Week" subtitle="Top-rated activities from the community" />
          <div className="mt-4 grid sm:grid-cols-3 gap-4">
            {featured.map(a => (
              <div key={a.id} className="relative">
                <div className="absolute top-3 left-3 z-10 bg-[#F59E0B] text-white text-xs font-bold px-2 py-0.5 rounded-full">Featured</div>
                <ActivityCard activity={{ ...a, isFavorited: favs.has(a.id) }} onFavorite={toggleFav} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Results */}
      <section>
        <SectionHeader
          title={search ? `Results for "${search}"` : "All Activities"}
          subtitle={`${withFavs.length} ${withFavs.length === 1 ? "activity" : "activities"} found`}
        />
        {withFavs.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="font-bold text-[#1C1B29] text-lg mb-2">No activities found</h3>
            <p className="text-[#6B6B80] text-sm">Try different keywords or filters</p>
          </div>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {withFavs.map(a => (
              <ActivityCard key={a.id} activity={a} onFavorite={toggleFav} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
