import { useNavigate } from "react-router";
import type { Activity } from "../data/mockData";
import { Badge, Button, StarRating, CategoryBadge, Card } from "./ui/index";

interface ActivityCardProps {
  activity: Activity;
  onFavorite?: (id: string) => void;
  showActions?: boolean;
  variant?: "grid" | "list";
}

const statusBadge = {
  draft: { label: "Draft", color: "warning" as const },
  private: { label: "Private", color: "neutral" as const },
  public: { label: "Public", color: "success" as const },
};

export default function ActivityCard({ activity, onFavorite, showActions, variant = "grid" }: ActivityCardProps) {
  const navigate = useNavigate();

  if (variant === "list") {
    return (
      <Card hover onClick={() => navigate(`/activity/${activity.id}`)} padding="none">
        <div className="flex items-center gap-4 p-4">
          <div className="w-14 h-14 rounded-xl bg-[#F3F0FF] flex items-center justify-center text-3xl shrink-0">
            {activity.thumbnail}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-[#1C1B29] text-sm truncate">{activity.title}</h3>
                <p className="text-xs text-[#9898A8] mt-0.5 truncate">{activity.creator.name} · {activity.cardCount} cards</p>
              </div>
              <Badge color={statusBadge[activity.status].color} className="shrink-0">{statusBadge[activity.status].label}</Badge>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <CategoryBadge category={activity.category} />
              {activity.rating > 0 && <StarRating rating={activity.rating} count={activity.ratingCount} />}
            </div>
          </div>
          {showActions && (
            <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
              <button onClick={() => navigate(`/play/${activity.id}`)} className="px-3 py-1.5 bg-[#7C5CFC] text-white rounded-lg text-xs font-semibold hover:bg-[#6244e8] transition-colors">▶ Play</button>
              <button onClick={() => navigate(`/create?edit=${activity.id}`)} className="px-3 py-1.5 bg-[#F0EFF9] text-[#7C5CFC] rounded-lg text-xs font-semibold hover:bg-[#EAE4FF] transition-colors">✏ Edit</button>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card hover padding="none" className="group overflow-hidden">
      {/* Thumbnail */}
      <div
        className="relative cursor-pointer"
        onClick={() => navigate(`/activity/${activity.id}`)}
      >
        <div className="h-40 bg-gradient-to-br from-[#F3F0FF] to-[#EAE4FF] flex items-center justify-center text-6xl">
          {activity.thumbnail}
        </div>
        {/* Favorite button */}
        <button
          onClick={e => { e.stopPropagation(); onFavorite?.(activity.id); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-sm shadow-sm hover:scale-110 transition-transform"
        >
          {activity.isFavorited ? "❤️" : "🤍"}
        </button>
        {/* Card count */}
        <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
          {activity.cardCount} cards
        </div>
      </div>

      {/* Content */}
      <div className="p-4 cursor-pointer" onClick={() => navigate(`/activity/${activity.id}`)}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CategoryBadge category={activity.category} />
          {activity.ageRange !== "All" && (
            <span className="text-xs text-[#9898A8]">Ages {activity.ageRange}</span>
          )}
        </div>
        <h3 className="font-bold text-[#1C1B29] text-sm leading-snug mb-1 line-clamp-2">{activity.title}</h3>

        {/* Creator */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-5 h-5 rounded-full bg-[#7C5CFC] flex items-center justify-center text-white text-[9px] font-bold">
            {activity.creator.avatar[0]}
          </div>
          <span className="text-xs text-[#6B6B80] truncate">{activity.creator.name}</span>
        </div>

        {/* Rating & favorites */}
        <div className="flex items-center justify-between">
          {activity.rating > 0
            ? <StarRating rating={activity.rating} count={activity.ratingCount} />
            : <span className="text-xs text-[#9898A8]">No ratings yet</span>}
          <span className="text-xs text-[#9898A8]">❤ {activity.favorites}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2" onClick={e => e.stopPropagation()}>
        <Button size="sm" variant="secondary" fullWidth onClick={() => navigate(`/activity/${activity.id}`)}>Preview</Button>
        <Button size="sm" fullWidth onClick={() => navigate(`/play/${activity.id}`)}>▶ Use Deck</Button>
      </div>
    </Card>
  );
}
