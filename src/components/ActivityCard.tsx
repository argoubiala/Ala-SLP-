import { useNavigate } from "react-router";
import { Button, StarRating, Card } from "./ui/index";
import { categoryInfo } from "../data/builtinDecks";
import type { ExploreDeck } from "../lib/types";

interface ActivityCardProps {
  activity: ExploreDeck;
  variant?: "grid" | "list";
}

export default function ActivityCard({ activity, variant = "grid" }: ActivityCardProps) {
  const navigate = useNavigate();
  const info = categoryInfo[activity.category];

  if (variant === "list") {
    return (
      <Card hover onClick={() => navigate(`/activity/${activity.id}`)} padding="none">
        <div className="flex items-center gap-4 p-4">
          <div className="w-14 h-14 rounded-xl bg-[#F3F0FF] flex items-center justify-center text-3xl shrink-0">{info?.emoji || "🗂️"}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#1C1B29] text-sm truncate">{activity.title}</h3>
            <p className="text-xs text-[#9898A8] mt-0.5 truncate">{activity.creator_name || "SLP"} · {activity.cards.length} cards</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${info?.color}18`, color: info?.color }}>{info?.name}</span>
              {activity.rating_count > 0 && <StarRating rating={activity.avg_rating} count={activity.rating_count} />}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card hover padding="none" className="group overflow-hidden">
      <div className="relative cursor-pointer" onClick={() => navigate(`/activity/${activity.id}`)}>
        <div className="h-40 bg-gradient-to-br from-[#F3F0FF] to-[#EAE4FF] flex items-center justify-center text-6xl">{info?.emoji || "🗂️"}</div>
        <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
          {activity.cards.length} cards
        </div>
      </div>

      <div className="p-4 cursor-pointer" onClick={() => navigate(`/activity/${activity.id}`)}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${info?.color}18`, color: info?.color }}>{info?.name}</span>
          {activity.age_range && <span className="text-xs text-[#9898A8]">Ages {activity.age_range}</span>}
        </div>
        <h3 className="font-bold text-[#1C1B29] text-sm leading-snug mb-1 line-clamp-2">{activity.title}</h3>

        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-5 h-5 rounded-full bg-[#7C5CFC] flex items-center justify-center text-white text-[9px] font-bold shrink-0">
            {(activity.creator_name || "S")[0].toUpperCase()}
          </div>
          <span className="text-xs text-[#6B6B80] truncate">{activity.creator_name || "SLP"}</span>
        </div>

        <div className="flex items-center justify-between">
          {activity.rating_count > 0 ? <StarRating rating={activity.avg_rating} count={activity.rating_count} /> : <span className="text-xs text-[#9898A8]">No ratings yet</span>}
          <span className="text-xs text-[#9898A8]">❤ {activity.favorite_count}</span>
        </div>
      </div>

      <div className="px-4 pb-4 flex gap-2" onClick={e => e.stopPropagation()}>
        <Button size="sm" variant="secondary" fullWidth onClick={() => navigate(`/activity/${activity.id}`)}>Preview</Button>
        <Button size="sm" fullWidth onClick={() => navigate(`/play/${activity.id}`)}>▶ Play</Button>
      </div>
    </Card>
  );
}
