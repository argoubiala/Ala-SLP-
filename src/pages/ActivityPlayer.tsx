import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "../components/ui/index";
import { fetchCustomDeckById, getSignedMediaUrl } from "../lib/decks";
import { getBuiltinDeckById } from "../data/builtinDecks";
import type { AnyDeck, DeckCard } from "../lib/types";

type AnswerState = "idle" | "correct" | "incorrect";

function Confetti() {
  const pieces = Array.from({ length: 20 }, (_, i) => i);
  const colors = ["#7C5CFC", "#F59E0B", "#22C55E", "#F43F5E", "#3B82F6", "#14B8A6"];
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-10">
      {pieces.map(i => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: `${(i * 5.2) % 100}%`,
            top: "-20px",
            backgroundColor: colors[i % colors.length],
            animation: `confetti-fall ${1.5 + i * 0.1}s ease-in ${i * 0.05}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

export default function ActivityPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deck, setDeck] = useState<AnyDeck | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);

    if (id.startsWith("builtin:")) {
      const b = getBuiltinDeckById(id);
      if (b) setDeck(b);
      else setLoadError("That activity couldn't be found.");
      setLoading(false);
      return;
    }

    fetchCustomDeckById(id)
      .then(d => {
        if (d) setDeck(d);
        else setLoadError("That activity couldn't be found.");
      })
      .catch(e => setLoadError(e.message || "Couldn't load that activity."))
      .finally(() => setLoading(false));
  }, [id]);

  const cards: DeckCard[] = deck?.cards || [];
  const card = cards[currentIdx];
  const progress = cards.length ? (currentIdx / cards.length) * 100 : 0;

  useEffect(() => {
    objectUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
    objectUrlsRef.current = [];
    setImageUrl(null);
    if (card?.imagePath) {
      getSignedMediaUrl(card.imagePath).then(url => setImageUrl(url));
    }
  }, [currentIdx, deck]);

  function playSound() {
    if (!card?.soundPath) return;
    getSignedMediaUrl(card.soundPath).then(url => {
      if (url) new Audio(url).play().catch(() => {});
    });
  }

  function handleAnswer(i: number) {
    if (answerState !== "idle" || !card) return;
    setSelectedAnswer(i);
    const isCorrect = i === card.correct;
    setAnswerState(isCorrect ? "correct" : "incorrect");
    if (isCorrect) {
      setScore(s => s + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    }
    setTimeout(next, 1200);
  }

  function next() {
    if (currentIdx >= cards.length - 1) {
      setFinished(true);
    } else {
      setCurrentIdx(i => i + 1);
      setAnswerState("idle");
      setSelectedAnswer(null);
    }
  }

  const accuracy = cards.length ? Math.round((score / cards.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-[#F3F0FF] to-[#F7F6F3]">
        <div className="w-8 h-8 border-3 border-[#EAE4FF] border-t-[#7C5CFC] rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError || !deck || cards.length === 0) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#F3F0FF] to-[#F7F6F3] gap-3 p-6 text-center">
        <p className="text-4xl">🙁</p>
        <p className="text-[#1C1B29] font-semibold">{loadError || "This activity doesn't have any cards yet."}</p>
        <Button variant="secondary" onClick={() => navigate("/my-decks")}>← Back to My Decks</Button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-[#F3F0FF] to-[#EAE4FF] p-6">
        <Confetti />
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-bounce-in">
          <div className="text-7xl mb-4">{accuracy >= 80 ? "🏆" : accuracy >= 60 ? "🌟" : "💪"}</div>
          <h2 className="font-display font-bold text-3xl text-[#1C1B29] mb-2">
            {accuracy >= 80 ? "Amazing job!" : accuracy >= 60 ? "Great work!" : "Keep practicing!"}
          </h2>
          <p className="text-[#6B6B80] mb-6">{deck.title}</p>
          <div className="bg-[#F3F0FF] rounded-2xl p-5 mb-6">
            <div className="text-5xl font-bold text-[#7C5CFC] mb-1">{accuracy}%</div>
            <p className="text-sm text-[#6B6B80]">accuracy</p>
            <div className="flex justify-around mt-4 text-sm">
              <div><span className="font-bold text-[#22C55E] text-lg">{score}</span><p className="text-[#9898A8]">Correct</p></div>
              <div><span className="font-bold text-[#EF4444] text-lg">{cards.length - score}</span><p className="text-[#9898A8]">Missed</p></div>
              <div><span className="font-bold text-[#1C1B29] text-lg">{cards.length}</span><p className="text-[#9898A8]">Total</p></div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              fullWidth
              size="lg"
              onClick={() => { setCurrentIdx(0); setScore(0); setFinished(false); setAnswerState("idle"); setSelectedAnswer(null); }}
            >
              🔄 Play Again
            </Button>
            <Button variant="secondary" fullWidth size="lg" onClick={() => navigate("/my-decks")}>
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-gradient-to-br from-[#F3F0FF] to-[#F7F6F3]">
      {showConfetti && <Confetti />}

      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between bg-white/80 backdrop-blur border-b border-[#F0EFF9]">
        <button onClick={() => navigate(-1)} className="text-[#6B6B80] text-sm hover:text-[#1C1B29] transition-colors">✕ Exit</button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#1C1B29]">{currentIdx + 1} / {cards.length}</span>
          <div className="w-32 h-2 bg-[#E8E7F0] rounded-full overflow-hidden">
            <div className="h-full bg-[#7C5CFC] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-[#F3F0FF] px-3 py-1 rounded-full">
          <span className="text-[#7C5CFC] text-sm">⭐</span>
          <span className="font-bold text-[#7C5CFC] text-sm">{score}</span>
        </div>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl">
          <div
            className={`bg-white rounded-3xl shadow-xl border-4 transition-all duration-300 overflow-hidden mb-6 ${answerState === "correct" ? "border-[#22C55E] shadow-[0_0_30px_rgba(34,197,94,0.2)]" : answerState === "incorrect" ? "border-[#EF4444] shadow-[0_0_30px_rgba(239,68,68,0.2)]" : "border-[#EAE4FF]"}`}
          >
            <div className="p-8 text-center">
              {imageUrl ? (
                <img src={imageUrl} alt="" className="max-h-40 mx-auto mb-5 rounded-xl object-contain animate-bounce-in" />
              ) : (
                <div className="text-6xl mb-5 animate-bounce-in">🗂️</div>
              )}
              <h2 className="font-display font-bold text-xl sm:text-2xl text-[#1C1B29] leading-snug mb-2">
                {card.question}
              </h2>
              {card.soundPath && (
                <button onClick={playSound} className="mx-auto flex items-center gap-2 bg-[#F3F0FF] hover:bg-[#EAE4FF] text-[#7C5CFC] px-4 py-2 rounded-full text-sm font-medium mt-3 transition-colors">
                  🔊 Listen
                </button>
              )}
            </div>

            {answerState !== "idle" && (
              <div className={`px-6 py-3 text-center text-sm font-bold ${answerState === "correct" ? "bg-[#F0FDF4] text-[#16A34A]" : "bg-[#FEF2F2] text-[#DC2626]"}`}>
                {answerState === "correct" ? "🎉 Correct! Great job!" : "✗ Not quite — try again next time!"}
              </div>
            )}
          </div>

          {/* Answer options */}
          <div className="grid grid-cols-2 gap-3">
            {card.answers.map((opt, i) => {
              let btnClass = "bg-white border-2 border-[#E8E7F0] text-[#1C1B29] hover:border-[#7C5CFC] hover:bg-[#F3F0FF]";
              if (answerState !== "idle") {
                if (i === card.correct) btnClass = "bg-[#F0FDF4] border-2 border-[#22C55E] text-[#16A34A]";
                else if (selectedAnswer === i) btnClass = "bg-[#FEF2F2] border-2 border-[#EF4444] text-[#DC2626]";
                else btnClass = "bg-white border-2 border-[#E8E7F0] text-[#9898A8] opacity-50";
              }
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={answerState !== "idle"}
                  className={`rounded-2xl py-4 px-4 text-base font-semibold transition-all active:scale-95 cursor-pointer ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center mt-5">
            <button onClick={next} className="text-sm text-[#9898A8] hover:text-[#6B6B80] transition-colors">
              Skip →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
