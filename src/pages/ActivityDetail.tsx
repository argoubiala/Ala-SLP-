import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { activities } from "../data/mockData";
import { Button, Badge, StarRating, CategoryBadge, Card, Tag, Avatar } from "../components/ui/index";
import ActivityCard from "../components/ActivityCard";

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const activity = activities.find(a => a.id === id) || activities[0];
  const [favorited, setFavorited] = useState(activity.isFavorited);
  const [currentCard, setCurrentCard] = useState(0);

  const moreFromCreator = activities
    .filter(a => a.creator.id === activity.creator.id && a.id !== activity.id && a.status === "public")
    .slice(0, 3);

  const previewCards = activity.previewCards.length > 0
    ? activity.previewCards
    : [{ id: "p1", type: "multiple-choice" as const, prompt: "Sample card preview", options: ["Option A", "Option B", "Option C", "Option D"], correctAnswer: 0 }];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#6B6B80] text-sm hover:text-[#1C1B29] transition-colors mb-6">
        ← Back to Explore
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - main info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Hero */}
          <Card padding="none" className="overflow-hidden">
            <div className="h-56 bg-gradient-to-br from-[#F3F0FF] to-[#EAE4FF] flex items-center justify-center text-8xl">
              {activity.thumbnail}
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <CategoryBadge category={activity.category} />
                    {activity.language !== "English" && (
                      <Badge color="info">{activity.language}</Badge>
                    )}
                    <Badge color="neutral">Ages {activity.ageRange}</Badge>
                  </div>
                  <h1 className="font-display font-bold text-2xl text-[#1C1B29] mb-1">{activity.title}</h1>
                  <p className="text-[#6B6B80] text-sm leading-relaxed">{activity.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F0EFF9]">
                <div className="flex items-center gap-4">
                  <StarRating rating={activity.rating} count={activity.ratingCount} size="md" />
                  <span className="text-sm text-[#6B6B80]">❤ {favorited ? activity.favorites + 1 : activity.favorites}</span>
                  <span className="text-sm text-[#6B6B80]">🎮 {activity.plays.toLocaleString()} plays</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Preview cards */}
          <Card>
            <h2 className="font-bold text-[#1C1B29] mb-4">Card Preview</h2>
            {/* Card navigation */}
            <div className="flex items-center gap-2 mb-4">
              {previewCards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentCard(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${i === currentCard ? "bg-[#7C5CFC] text-white" : "bg-[#F0EFF9] text-[#6B6B80] hover:bg-[#EAE4FF]"}`}
                >
                  {i + 1}
                </button>
              ))}
              <span className="text-xs text-[#9898A8] ml-1">of {activity.cardCount} cards</span>
            </div>

            {/* Card preview */}
            <div className="bg-gradient-to-br from-[#F3F0FF] to-white border-2 border-[#EAE4FF] rounded-xl p-6 min-h-[200px] flex flex-col justify-between">
              <p className="text-base font-semibold text-[#1C1B29] mb-4">{previewCards[currentCard]?.prompt}</p>
              {previewCards[currentCard]?.options && (
                <div className="grid grid-cols-2 gap-2">
                  {previewCards[currentCard].options!.map((opt, i) => (
                    <div key={i} className="bg-white border-2 border-[#E8E7F0] rounded-xl px-4 py-3 text-sm font-medium text-[#1C1B29] hover:border-[#7C5CFC] transition-colors cursor-default">
                      {opt}
                    </div>
                  ))}
                </div>
              )}
              {previewCards[currentCard]?.type === "yes-no" && (
                <div className="flex gap-3">
                  <div className="flex-1 bg-[#F0FDF4] border-2 border-[#86EFAC] rounded-xl px-4 py-3 text-center text-sm font-bold text-[#16A34A]">✓ Yes</div>
                  <div className="flex-1 bg-[#FEF2F2] border-2 border-[#FCA5A5] rounded-xl px-4 py-3 text-center text-sm font-bold text-[#DC2626]">✗ No</div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-3">
              <Button size="sm" variant="ghost" disabled={currentCard === 0} onClick={() => setCurrentCard(c => c - 1)}>← Prev</Button>
              <Button size="sm" variant="ghost" disabled={currentCard === previewCards.length - 1} onClick={() => setCurrentCard(c => c + 1)}>Next →</Button>
            </div>
          </Card>

          {/* Tags */}
          <Card>
            <h3 className="font-semibold text-[#1C1B29] mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {activity.tags.map(t => <Tag key={t}>#{t}</Tag>)}
            </div>
          </Card>

          {/* More from creator */}
          {moreFromCreator.length > 0 && (
            <section>
              <h2 className="font-bold text-[#1C1B29] text-lg mb-4">More from {activity.creator.name}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {moreFromCreator.map(a => <ActivityCard key={a.id} activity={a} />)}
              </div>
            </section>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Action card */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-bold text-[#1C1B29]">{activity.cardCount} cards</p>
                <p className="text-xs text-[#9898A8]">Interactive activities</p>
              </div>
            </div>
            <Button fullWidth size="lg" onClick={() => navigate(`/play/${activity.id}`)} className="mb-2">
              ▶ Use This Deck
            </Button>
            <Button fullWidth size="md" variant="secondary" onClick={() => navigate("/create")}>
              + Add to My Decks
            </Button>
            <button
              onClick={() => setFavorited(!favorited)}
              className={`w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${favorited ? "bg-[#FFF1F2] text-[#E11D48]" : "bg-[#F7F6F3] text-[#6B6B80] hover:bg-[#F0EFF9]"}`}
            >
              {favorited ? "❤️ Saved" : "🤍 Save"}
            </button>
          </Card>

          {/* Creator */}
          <Card>
            <h3 className="font-semibold text-[#1C1B29] mb-3">About the Creator</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-[#7C5CFC] flex items-center justify-center text-white font-bold">
                {activity.creator.avatar}
              </div>
              <div>
                <p className="font-bold text-[#1C1B29]">{activity.creator.name}</p>
                <p className="text-xs text-[#9898A8]">{activity.creator.title}</p>
              </div>
            </div>
            <p className="text-sm text-[#6B6B80] leading-relaxed mb-3">{activity.creator.bio.slice(0, 120)}…</p>
            <div className="flex items-center justify-between text-xs text-[#9898A8] mb-3">
              <span>📚 {activity.creator.published} activities</span>
              <span>⭐ {activity.creator.rating}</span>
              <span>👥 {activity.creator.followers.toLocaleString()}</span>
            </div>
            <Button variant="outline" fullWidth size="sm" onClick={() => navigate(`/creator/${activity.creator.id}`)}>
              View Profile
            </Button>
          </Card>

          {/* Details */}
          <Card>
            <h3 className="font-semibold text-[#1C1B29] mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              {[
                { label: "Skill", value: activity.skill },
                { label: "Age Range", value: `${activity.ageRange} years` },
                { label: "Language", value: activity.language },
                { label: "Category", value: activity.category },
                { label: "Cards", value: `${activity.cardCount} cards` },
                { label: "Added", value: activity.createdAt },
              ].map(d => (
                <div key={d.label} className="flex justify-between">
                  <span className="text-[#9898A8]">{d.label}</span>
                  <span className="font-medium text-[#1C1B29]">{d.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
