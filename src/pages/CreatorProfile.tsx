import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, SectionHeader } from "../components/ui/index";
import ActivityCard from "../components/ActivityCard";
import { fetchProfile, fetchCreatorPublicDecks } from "../lib/community";
import type { Profile, ExploreDeck } from "../lib/types";

const avatarColors = ["bg-[#7C5CFC]", "bg-[#14B8A6]", "bg-[#F43F5E]", "bg-[#F59E0B]"];

export default function CreatorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [decks, setDecks] = useState<ExploreDeck[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchProfile(id), fetchCreatorPublicDecks(id)])
      .then(([p, d]) => {
        if (!p) {
          setLoadError("This creator doesn't have a public profile yet.");
          return;
        }
        setProfile(p);
        setDecks(d);
      })
      .catch(e => setLoadError(e.message || "Couldn't load this profile."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-3 border-[#EAE4FF] border-t-[#7C5CFC] rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="flex flex-col items-center py-24 text-center gap-3">
        <p className="text-5xl mb-2">👤</p>
        <p className="text-[#1C1B29] font-semibold">{loadError}</p>
      </div>
    );
  }

  const colorIdx = (profile.id.charCodeAt(1) || 0) % avatarColors.length;
  const avgRating = decks && decks.length ? decks.reduce((s, d) => s + d.avg_rating, 0) / decks.length : 0;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-[#6B6B80] text-sm hover:text-[#1C1B29] mb-5 transition-colors">← Back</button>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className={`w-20 h-20 rounded-2xl ${avatarColors[colorIdx]} flex items-center justify-center text-white text-3xl shadow-lg shrink-0`}>
            {profile.avatar_emoji || "🧑‍⚕️"}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-2xl text-[#1C1B29]">{profile.display_name || "SLP"}</h1>
            {profile.profession && <p className="text-[#6B6B80] text-sm">{profile.profession}</p>}
            {profile.bio && <p className="text-sm text-[#6B6B80] leading-relaxed mt-3 max-w-2xl">{profile.bio}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-[#F0EFF9]">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#7C5CFC]">{decks?.length ?? 0}</p>
            <p className="text-xs text-[#9898A8] font-medium">Public Activities</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#7C5CFC]">{avgRating > 0 ? avgRating.toFixed(1) + " ⭐" : "—"}</p>
            <p className="text-xs text-[#9898A8] font-medium">Avg Rating</p>
          </div>
        </div>
      </Card>

      <section>
        <SectionHeader
          title={`Activities by ${(profile.display_name || "this creator").split(" ")[0]}`}
          subtitle={`${decks?.length ?? 0} published activities`}
        />
        {!decks || decks.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-[#6B6B80]">No public activities yet</p>
          </div>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map(a => <ActivityCard key={a.id} activity={a} />)}
          </div>
        )}
      </section>
    </div>
  );
}
