import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button, StarRating, Card, Tag } from "../components/ui/index";
import ActivityCard from "../components/ActivityCard";
import { useAuth } from "../lib/auth";
import { categoryInfo } from "../data/builtinDecks";
import {
  fetchDeckDetail,
  fetchCreatorPublicDecks,
  fetchMyInteraction,
  rateDeck,
  setFavorite,
  useThisDeck,
  type DeckDetail,
} from "../lib/community";
import type { ExploreDeck } from "../lib/types";

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [detail, setDetail] = useState<DeckDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [moreFromCreator, setMoreFromCreator] = useState<ExploreDeck[]>([]);
  const [currentCard, setCurrentCard] = useState(0);

  const [myRating, setMyRating] = useState<number | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    fetchDeckDetail(id)
      .then(async d => {
        if (!d) {
          setLoadError("That activity couldn't be found, or isn't shared publicly.");
          return;
        }
        setDetail(d);
        const more = await fetchCreatorPublicDecks(d.deck.user_id, d.deck.id);
        setMoreFromCreator(more.slice(0, 3));
        if (user) {
          const interaction = await fetchMyInteraction(id, user.id);
          setMyRating(interaction.myRating);
          setFavorited(interaction.isFavorited);
        }
      })
      .catch(e => setLoadError(e.message || "Couldn't load that activity."))
      .finally(() => setLoading(false));
  }, [id, user]);

  async function handleRate(stars: number) {
    if (!user || !id) return;
    setMyRating(stars);
    try {
      await rateDeck(id, user.id, stars);
    } catch (e: any) {
      alert("Couldn't save your rating: " + (e.message || e));
    }
  }

  async function handleToggleFavorite() {
    if (!user || !id) return;
    const next = !favorited;
    setFavorited(next);
    try {
      await setFavorite(id, user.id, next);
    } catch (e: any) {
      setFavorited(!next);
      alert("Couldn't update favorite: " + (e.message || e));
    }
  }

  async function handleUseThisDeck() {
    if (!user || !detail) return;
    setCopying(true);
    try {
      const newId = await useThisDeck(detail.deck, user.id);
      navigate(`/create?edit=${newId}`);
    } catch (e: any) {
      alert("Couldn't copy this activity: " + (e.message || e));
    } finally {
      setCopying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-3 border-[#EAE4FF] border-t-[#7C5CFC] rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError || !detail) {
    return (
      <div className="flex flex-col items-center py-24 text-center gap-3">
        <p className="text-5xl mb-2">🙁</p>
        <p className="text-[#1C1B29] font-semibold">{loadError}</p>
        <Button variant="secondary" onClick={() => navigate("/explore")}>← Back to Explore</Button>
      </div>
    );
  }

  const { deck, creator, avgRating, ratingCount, favoriteCount } = detail;
  const info = categoryInfo[deck.category];
  const card = deck.cards[currentCard];
  const isOwn = user?.id === deck.user_id;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#6B6B80] text-sm hover:text-[#1C1B29] transition-colors mb-6">
        ← Back
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card padding="none" className="overflow-hidden">
            <div className="h-56 bg-gradient-to-br from-[#F3F0FF] to-[#EAE4FF] flex items-center justify-center text-8xl">{info?.emoji || "🗂️"}</div>
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: `${info?.color}18`, color: info?.color }}>{info?.name}</span>
                {deck.language && deck.language !== "English" && <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB]">{deck.language}</span>}
                {deck.age_range && <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280]">Ages {deck.age_range}</span>}
                {deck.visibility === "unlisted" && <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706]">Unlisted</span>}
              </div>
              <h1 className="font-display font-bold text-2xl text-[#1C1B29] mb-1">{deck.title}</h1>
              <p className="text-[#6B6B80] text-sm leading-relaxed">{deck.description}</p>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#F0EFF9]">
                <StarRating rating={avgRating} count={ratingCount} size="md" />
                <span className="text-sm text-[#6B6B80]">❤ {favoriteCount}</span>
                <span className="text-sm text-[#6B6B80]">▶ {deck.use_count} uses</span>
              </div>

              {user && !isOwn && (
                <div className="mt-4 pt-4 border-t border-[#F0EFF9]">
                  <p className="text-xs font-semibold text-[#9898A8] uppercase tracking-wider mb-2">Your rating</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} onClick={() => handleRate(s)} className="text-2xl leading-none">
                        <span className={s <= (myRating || 0) ? "text-[#F59E0B]" : "text-[#E5E7EB]"}>★</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="font-bold text-[#1C1B29] mb-4">Card Preview</h2>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {deck.cards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentCard(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${i === currentCard ? "bg-[#7C5CFC] text-white" : "bg-[#F0EFF9] text-[#6B6B80] hover:bg-[#EAE4FF]"}`}
                >
                  {i + 1}
                </button>
              ))}
              <span className="text-xs text-[#9898A8] ml-1">of {deck.cards.length} cards</span>
            </div>

            {card && (
              <div className="bg-gradient-to-br from-[#F3F0FF] to-white border-2 border-[#EAE4FF] rounded-xl p-6 min-h-[180px] flex flex-col justify-between">
                <p className="text-base font-semibold text-[#1C1B29] mb-4">{card.question}</p>
                <div className="grid grid-cols-2 gap-2">
                  {card.answers.map((opt, i) => (
                    <div key={i} className="bg-white border-2 border-[#E8E7F0] rounded-xl px-4 py-3 text-sm font-medium text-[#1C1B29]">{opt}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between mt-3">
              <Button size="sm" variant="ghost" disabled={currentCard === 0} onClick={() => setCurrentCard(c => c - 1)}>← Prev</Button>
              <Button size="sm" variant="ghost" disabled={currentCard === deck.cards.length - 1} onClick={() => setCurrentCard(c => c + 1)}>Next →</Button>
            </div>
          </Card>

          {deck.tags && deck.tags.length > 0 && (
            <Card>
              <h3 className="font-semibold text-[#1C1B29] mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">{deck.tags.map(t => <Tag key={t}>#{t}</Tag>)}</div>
            </Card>
          )}

          {moreFromCreator.length > 0 && (
            <section>
              <h2 className="font-bold text-[#1C1B29] text-lg mb-4">More from {creator?.display_name || "this creator"}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {moreFromCreator.map(a => <ActivityCard key={a.id} activity={a} />)}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-bold text-[#1C1B29]">{deck.cards.length} cards</p>
                <p className="text-xs text-[#9898A8]">Interactive activity</p>
              </div>
            </div>
            <Button fullWidth size="lg" onClick={() => navigate(`/play/${deck.id}`)} className="mb-2">▶ Preview / Play</Button>
            {!isOwn && deck.allow_copy && (
              <Button fullWidth size="md" variant="secondary" onClick={handleUseThisDeck} loading={copying}>+ Use This Deck</Button>
            )}
            {!isOwn && user && (
              <button
                onClick={handleToggleFavorite}
                className={`w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${favorited ? "bg-[#FFF1F2] text-[#E11D48]" : "bg-[#F7F6F3] text-[#6B6B80] hover:bg-[#F0EFF9]"}`}
              >
                {favorited ? "❤️ Saved" : "🤍 Save"}
              </button>
            )}
            {isOwn && (
              <Button fullWidth size="md" variant="secondary" onClick={() => navigate(`/create?edit=${deck.id}`)}>✏ Edit</Button>
            )}
          </Card>

          {creator && (
            <Card>
              <h3 className="font-semibold text-[#1C1B29] mb-3">About the Creator</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-[#7C5CFC] flex items-center justify-center text-white text-xl shrink-0">{creator.avatar_emoji || "🧑‍⚕️"}</div>
                <div className="min-w-0">
                  <p className="font-bold text-[#1C1B29] truncate">{creator.display_name || "SLP"}</p>
                  {creator.profession && <p className="text-xs text-[#9898A8] truncate">{creator.profession}</p>}
                </div>
              </div>
              {creator.bio && <p className="text-sm text-[#6B6B80] leading-relaxed mb-3 line-clamp-3">{creator.bio}</p>}
              <Button variant="outline" fullWidth size="sm" onClick={() => navigate(`/creator/${deck.user_id}`)}>View Profile</Button>
            </Card>
          )}

          <Card>
            <h3 className="font-semibold text-[#1C1B29] mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              {[
                { label: "Category", value: info?.name || deck.category },
                { label: "Age Range", value: deck.age_range || "Not specified" },
                { label: "Language", value: deck.language },
                { label: "Cards", value: `${deck.cards.length}` },
                { label: "Uses", value: `${deck.use_count}` },
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
