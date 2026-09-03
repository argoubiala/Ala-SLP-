import { useParams, useNavigate } from "react-router";
import { creators, activities } from "../data/mockData";
import { Card, Button, Badge, StarRating, SectionHeader, CategoryBadge } from "../components/ui/index";
import ActivityCard from "../components/ActivityCard";

export default function CreatorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const creator = creators.find(c => c.id === id) || creators[0];
  const creatorActivities = activities.filter(a => a.creator.id === creator.id && a.status === "public");

  const avatarColors = ["bg-[#7C5CFC]", "bg-[#14B8A6]", "bg-[#F43F5E]", "bg-[#F59E0B]"];
  const colorIdx = creator.id.charCodeAt(1) % avatarColors.length;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-[#6B6B80] text-sm hover:text-[#1C1B29] mb-5 transition-colors">← Back</button>

      {/* Profile hero */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className={`w-20 h-20 rounded-2xl ${avatarColors[colorIdx]} flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0`}>
            {creator.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-display font-bold text-2xl text-[#1C1B29]">{creator.name}</h1>
                <p className="text-[#6B6B80] text-sm">{creator.title}</p>
                <p className="text-[#9898A8] text-xs mt-0.5">📍 {creator.location}</p>
              </div>
              <Button variant="secondary">Follow</Button>
            </div>
            <p className="text-sm text-[#6B6B80] leading-relaxed mt-3 max-w-2xl">{creator.bio}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {creator.specialties.map(s => <CategoryBadge key={s} category={s} />)}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-[#F0EFF9]">
          {[
            { label: "Activities", value: creator.published },
            { label: "Followers", value: creator.followers.toLocaleString() },
            { label: "Rating", value: creator.rating.toFixed(1) + " ⭐" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-[#7C5CFC]">{s.value}</p>
              <p className="text-xs text-[#9898A8] font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Activities */}
      <section>
        <SectionHeader title={`Activities by ${creator.name.split(" ")[0]}`} subtitle={`${creatorActivities.length} published activities`} />
        {creatorActivities.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-[#6B6B80]">No public activities yet</p>
          </div>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {creatorActivities.map(a => <ActivityCard key={a.id} activity={a} />)}
          </div>
        )}
      </section>
    </div>
  );
}
