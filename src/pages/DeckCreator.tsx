import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button, Select, Textarea, Modal, Input } from "../components/ui/index";
import { useAuth } from "../lib/auth";
import { categoryInfo } from "../data/builtinDecks";
import {
  fetchCustomDeckById,
  createDeck,
  updateDeck,
  uploadMediaFile,
  deleteMediaFile,
  getSignedMediaUrl,
} from "../lib/decks";
import { updateDeckPublishing } from "../lib/community";
import type { CategoryKey, DeckCard, Visibility } from "../lib/types";

const MAX_MEDIA_BYTES = 8 * 1024 * 1024; // 8MB

const OTHER_TYPES = [
  { label: "Image Choice", icon: "🖼" },
  { label: "Yes / No", icon: "⬛" },
  { label: "Text Answer", icon: "✏" },
  { label: "Listening", icon: "🎧" },
  { label: "Matching", icon: "🔗" },
];

interface EditableCard {
  uid: string;
  question: string;
  answers: string[];
  correct: number;
  imagePath: string | null; // already-uploaded path, if any
  imageFile: File | null; // newly staged file, not yet uploaded
  imageRemoved: boolean;
  imagePreviewUrl: string | null;
  soundPath: string | null;
  soundFile: File | null;
  soundRemoved: boolean;
  soundPreviewUrl: string | null;
}

function makeCard(): EditableCard {
  return {
    uid: Math.random().toString(36).slice(2),
    question: "",
    answers: ["", ""],
    correct: 0,
    imagePath: null,
    imageFile: null,
    imageRemoved: false,
    imagePreviewUrl: null,
    soundPath: null,
    soundFile: null,
    soundRemoved: false,
    soundPreviewUrl: null,
  };
}

export default function DeckCreator() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [deckId, setDeckId] = useState<string | null>(editId);
  const [title, setTitle] = useState("Untitled Activity");
  const [editingTitle, setEditingTitle] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryKey>("articulation");
  const [cards, setCards] = useState<EditableCard[]>([makeCard()]);
  const [selectedCard, setSelectedCard] = useState(0);
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [publishOpen, setPublishOpen] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [allowCopy, setAllowCopy] = useState(true);
  const [ageRange, setAgeRange] = useState("");
  const [language, setLanguage] = useState("English");
  const [tagsText, setTagsText] = useState("");
  const [publishing, setPublishing] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const soundInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!editId) return;
    setLoading(true);
    fetchCustomDeckById(editId)
      .then(async deck => {
        if (!deck) {
          setLoadError("That activity couldn't be found.");
          return;
        }
        setDeckId(deck.id);
        setTitle(deck.title);
        setDescription(deck.description || "");
        setCategory(deck.category);
        setVisibility(deck.visibility || "private");
        setAllowCopy(deck.allow_copy ?? true);
        setAgeRange(deck.age_range || "");
        setLanguage(deck.language || "English");
        setTagsText((deck.tags || []).join(", "));
        const loaded: EditableCard[] = await Promise.all(
          deck.cards.map(async (c: DeckCard) => {
            const card = makeCard();
            card.question = c.question;
            card.answers = c.answers.length >= 2 ? c.answers : [...c.answers, ""];
            card.correct = c.correct;
            card.imagePath = c.imagePath || null;
            card.soundPath = c.soundPath || null;
            if (c.imagePath) card.imagePreviewUrl = await getSignedMediaUrl(c.imagePath);
            if (c.soundPath) card.soundPreviewUrl = await getSignedMediaUrl(c.soundPath);
            return card;
          })
        );
        setCards(loaded.length ? loaded : [makeCard()]);
      })
      .catch(e => setLoadError(e.message || "Couldn't load that activity."))
      .finally(() => setLoading(false));
  }, [editId]);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
    };
  }, []);

  const card = cards[selectedCard];

  function updateCard(patch: Partial<EditableCard>) {
    setCards(cs => cs.map((c, i) => (i === selectedCard ? { ...c, ...patch } : c)));
  }

  function addCard() {
    const next = [...cards, makeCard()];
    setCards(next);
    setSelectedCard(next.length - 1);
  }

  function deleteCard(idx: number) {
    if (cards.length <= 1) return;
    const next = cards.filter((_, i) => i !== idx);
    setCards(next);
    setSelectedCard(Math.min(selectedCard, next.length - 1));
  }

  function duplicateCard(idx: number) {
    const dup = { ...cards[idx], uid: Math.random().toString(36).slice(2) };
    const next = [...cards.slice(0, idx + 1), dup, ...cards.slice(idx + 1)];
    setCards(next);
    setSelectedCard(idx + 1);
  }

  function moveCard(dir: -1 | 1) {
    const target = selectedCard + dir;
    if (target < 0 || target >= cards.length) return;
    const next = [...cards];
    [next[selectedCard], next[target]] = [next[target], next[selectedCard]];
    setCards(next);
    setSelectedCard(target);
  }

  function handlePickImage(file: File) {
    if (file.size > MAX_MEDIA_BYTES) {
      alert("That image is a bit large — please choose one under 8MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    updateCard({ imageFile: file, imageRemoved: false, imagePreviewUrl: url });
  }
  function handlePickSound(file: File) {
    if (file.size > MAX_MEDIA_BYTES) {
      alert("That audio file is a bit large — please choose one under 8MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    updateCard({ soundFile: file, soundRemoved: false, soundPreviewUrl: url });
  }
  function removeImage() {
    updateCard({ imageFile: null, imageRemoved: true, imagePreviewUrl: null });
  }
  function removeSound() {
    updateCard({ soundFile: null, soundRemoved: true, soundPreviewUrl: null });
  }

  function updateAnswer(i: number, value: string) {
    if (!card) return;
    const next = [...card.answers];
    next[i] = value;
    updateCard({ answers: next });
  }
  function addAnswer() {
    if (!card || card.answers.length >= 6) return;
    updateCard({ answers: [...card.answers, ""] });
  }
  function removeAnswer(i: number) {
    if (!card || card.answers.length <= 2) return;
    const next = card.answers.filter((_, idx) => idx !== i);
    let correct = card.correct;
    if (i === card.correct) correct = 0;
    else if (i < card.correct) correct = card.correct - 1;
    updateCard({ answers: next, correct });
  }

  async function handleSave(): Promise<string | null> {
    if (!user) return null;
    if (!title.trim()) {
      alert("Please give the activity a title.");
      return null;
    }
    for (const c of cards) {
      const filled = c.answers.map(a => a.trim()).filter(Boolean);
      if (!c.question.trim() || filled.length < 2 || c.correct >= c.answers.length || !c.answers[c.correct]?.trim()) {
        alert("Every card needs a question, at least 2 filled-in answers, and a correct answer selected.");
        return null;
      }
    }

    setSaving(true);
    try {
      const finalCards: DeckCard[] = [];
      for (const c of cards) {
        let imagePath = c.imagePath;
        let soundPath = c.soundPath;

        if (c.imageFile) {
          if (imagePath) await deleteMediaFile(imagePath);
          imagePath = await uploadMediaFile(user.id, c.imageFile);
        } else if (c.imageRemoved) {
          if (imagePath) await deleteMediaFile(imagePath);
          imagePath = null;
        }
        if (c.soundFile) {
          if (soundPath) await deleteMediaFile(soundPath);
          soundPath = await uploadMediaFile(user.id, c.soundFile);
        } else if (c.soundRemoved) {
          if (soundPath) await deleteMediaFile(soundPath);
          soundPath = null;
        }

        const trimmedAnswers = c.answers.map(a => a.trim());
        const correctText = trimmedAnswers[c.correct];
        const nonEmptyAnswers = trimmedAnswers.filter(a => a.length > 0);
        const newCorrectIndex = nonEmptyAnswers.indexOf(correctText);

        finalCards.push({
          question: c.question.trim(),
          answers: nonEmptyAnswers,
          correct: newCorrectIndex,
          imagePath,
          soundPath,
        });
      }

      let resultId = deckId;
      if (deckId) {
        await updateDeck(deckId, { category, title: title.trim(), description: description.trim(), cards: finalCards });
      } else {
        const created = await createDeck({
          userId: user.id,
          category,
          title: title.trim(),
          description: description.trim(),
          cards: finalCards,
        });
        resultId = created.id;
        setDeckId(created.id);
        setSearchParams({ edit: created.id }, { replace: true });
      }

      // Reflect uploaded paths back into local state so re-saving doesn't re-upload.
      setCards(cs =>
        cs.map((c, i) => ({
          ...c,
          imagePath: finalCards[i].imagePath ?? null,
          soundPath: finalCards[i].soundPath ?? null,
          imageFile: null,
          soundFile: null,
          imageRemoved: false,
          soundRemoved: false,
        }))
      );

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
      return resultId;
    } catch (e: any) {
      alert("Couldn't save: " + (e.message || e));
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handlePreview() {
    const id = deckId || (await handleSave());
    if (id) navigate(`/play/${id}`);
  }

  async function handleOpenPublish() {
    const id = deckId || (await handleSave());
    if (!id) return;
    setPublishOpen(true);
  }

  async function handlePublish() {
    if (!deckId) return;
    setPublishing(true);
    try {
      const tags = tagsText
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);
      await updateDeckPublishing(deckId, { visibility, allow_copy: allowCopy, age_range: ageRange, language, tags });
      setPublishOpen(false);
    } catch (e: any) {
      alert("Couldn't update publishing settings: " + (e.message || e));
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F7F6F3]">
        <div className="w-8 h-8 border-3 border-[#EAE4FF] border-t-[#7C5CFC] rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#F7F6F3] gap-3">
        <p className="text-[#DC2626] font-medium">{loadError}</p>
        <Button variant="secondary" onClick={() => navigate("/my-decks")}>← Back to My Decks</Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F7F6F3]">
      {/* Top bar */}
      <header className="bg-white border-b border-[#F0EFF9] px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate("/my-decks")} className="text-[#6B6B80] hover:text-[#1C1B29] transition-colors text-sm">← Back</button>
        <div className="flex-1 flex items-center justify-center">
          {editingTitle ? (
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={e => e.key === "Enter" && setEditingTitle(false)}
              className="text-center font-bold text-[#1C1B29] bg-[#F3F0FF] rounded-lg px-3 py-1 outline-none border-2 border-[#7C5CFC] text-sm"
            />
          ) : (
            <button onClick={() => setEditingTitle(true)} className="font-bold text-[#1C1B29] hover:text-[#7C5CFC] transition-colors text-sm flex items-center gap-1">
              {title} <span className="text-xs opacity-50">✏</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePreview}>👁 Preview</Button>
          <Button variant="secondary" size="sm" onClick={handleSave} loading={saving}>
            {saveState === "saved" ? "✓ Saved!" : "💾 Save"}
          </Button>
          <Button size="sm" onClick={handleOpenPublish}>🌐 Publish</Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - card list */}
        <div className="w-48 lg:w-56 bg-white border-r border-[#F0EFF9] flex flex-col overflow-hidden shrink-0">
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cards.map((c, i) => (
              <div
                key={c.uid}
                onClick={() => setSelectedCard(i)}
                className={`relative group rounded-xl border-2 cursor-pointer transition-all overflow-hidden ${i === selectedCard ? "border-[#7C5CFC] bg-[#F3F0FF]" : "border-transparent bg-[#F7F6F3] hover:border-[#D5C9FF]"}`}
              >
                <div className="h-24 flex flex-col items-center justify-center p-2 gap-1">
                  <span className="text-xs font-semibold text-[#9898A8]">#{i + 1}</span>
                  <span className="text-2xl">{c.imagePreviewUrl ? "🖼" : "☑"}</span>
                  <span className="text-[10px] text-[#6B6B80] text-center truncate w-full px-1">{c.question || "Empty card"}</span>
                </div>
                <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
                  <button onClick={e => { e.stopPropagation(); duplicateCard(i); }} className="w-5 h-5 bg-white rounded text-[10px] flex items-center justify-center shadow-sm hover:bg-[#F0EFF9]">⧉</button>
                  <button onClick={e => { e.stopPropagation(); deleteCard(i); }} className="w-5 h-5 bg-white rounded text-[10px] flex items-center justify-center shadow-sm hover:bg-red-50 text-red-400">✕</button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-[#F0EFF9]">
            <button
              onClick={addCard}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-[#D5C9FF] text-[#7C5CFC] rounded-xl text-xs font-semibold hover:bg-[#F3F0FF] transition-colors"
            >
              + Add Card
            </button>
          </div>
        </div>

        {/* Center - card editor */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
          {/* Type selector — only Multiple Choice is functional today */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#7C5CFC] text-white">
              ☑ Multiple Choice
            </span>
            {OTHER_TYPES.map(t => (
              <span
                key={t.label}
                title="Coming soon"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#C0BFD0] border border-[#E8E7F0] cursor-not-allowed opacity-60"
              >
                {t.icon} {t.label} <span className="text-[9px] bg-[#F0EFF9] text-[#9898A8] px-1 rounded">Soon</span>
              </span>
            ))}
          </div>

          {card && (
            <div className="w-full max-w-xl">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-[#EAE4FF] overflow-hidden">
                <div className="bg-gradient-to-r from-[#7C5CFC] to-[#9C7FFF] px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm">☑</span>
                    <span className="text-white/80 text-xs font-medium">Multiple Choice</span>
                  </div>
                  <span className="text-white/60 text-xs">Card {selectedCard + 1} of {cards.length}</span>
                </div>

                <div className="p-6">
                  {/* Question */}
                  <div className="mb-5">
                    <Textarea
                      value={card.question}
                      onChange={e => updateCard({ question: e.target.value })}
                      placeholder="Enter your question here…"
                      rows={2}
                      className="text-base font-medium bg-[#F7F6F3] border-[#E8E7F0] focus:bg-white resize-none"
                    />
                  </div>

                  {/* Image upload */}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handlePickImage(f); e.target.value = ""; }}
                  />
                  {card.imagePreviewUrl ? (
                    <div className="mb-5 relative rounded-xl overflow-hidden border-2 border-[#EAE4FF]">
                      <img src={card.imagePreviewUrl} alt="" className="w-full max-h-48 object-contain bg-[#F7F6F3]" />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center text-[#6B6B80] hover:text-red-500 text-sm"
                      >✕</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full mb-5 border-2 border-dashed border-[#D5C9FF] rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer hover:bg-[#F3F0FF] transition-colors group"
                    >
                      <span className="text-2xl">🖼</span>
                      <div className="text-center">
                        <p className="text-sm font-medium text-[#6B6B80] group-hover:text-[#7C5CFC]">Click to add image</p>
                        <p className="text-xs text-[#9898A8]">PNG, JPG up to 8MB</p>
                      </div>
                    </button>
                  )}

                  {/* Answers */}
                  <div className="grid grid-cols-2 gap-2">
                    {card.answers.map((opt, i) => (
                      <div key={i} className={`relative flex items-center gap-2 border-2 rounded-xl p-2 transition-all ${card.correct === i ? "border-[#22C55E] bg-[#F0FDF4]" : "border-[#E8E7F0]"}`}>
                        <button
                          onClick={() => updateCard({ correct: i })}
                          className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center text-xs transition-all ${card.correct === i ? "border-[#22C55E] bg-[#22C55E] text-white" : "border-[#D1D0DC]"}`}
                        >
                          {card.correct === i ? "✓" : ""}
                        </button>
                        <input
                          value={opt}
                          onChange={e => updateAnswer(i, e.target.value)}
                          placeholder={`Option ${i + 1}`}
                          className="flex-1 min-w-0 text-sm outline-none bg-transparent text-[#1C1B29] placeholder-[#C0BFD0]"
                        />
                        {card.answers.length > 2 && (
                          <button onClick={() => removeAnswer(i)} className="text-[#C0BFD0] hover:text-red-400 text-xs shrink-0">✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                  {card.answers.length < 6 && (
                    <button onClick={addAnswer} className="mt-2 text-xs font-semibold text-[#7C5CFC] hover:underline">+ Add answer choice</button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right panel - settings */}
        <div className="w-56 lg:w-64 bg-white border-l border-[#F0EFF9] overflow-y-auto shrink-0 p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-[#9898A8] uppercase tracking-wider mb-2">Audio</p>
            <input
              ref={soundInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handlePickSound(f); e.target.value = ""; }}
            />
            {card?.soundPreviewUrl ? (
              <div className="border border-[#E8E7F0] rounded-xl p-2 flex items-center gap-2">
                <audio controls src={card.soundPreviewUrl} className="w-full h-8" />
                <button onClick={removeSound} className="text-[#9898A8] hover:text-red-400 text-xs shrink-0">✕</button>
              </div>
            ) : (
              <button
                onClick={() => soundInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[#D5C9FF] rounded-xl p-3 text-center text-xs text-[#6B6B80] hover:bg-[#F3F0FF] transition-colors"
              >
                🎵 Add audio prompt
              </button>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-[#9898A8] uppercase tracking-wider mb-2">Card Order</p>
            <div className="flex flex-col gap-1">
              <button onClick={() => moveCard(-1)} className="text-xs text-[#6B6B80] hover:text-[#7C5CFC] flex items-center gap-1 transition-colors py-1">↑ Move up</button>
              <button onClick={() => moveCard(1)} className="text-xs text-[#6B6B80] hover:text-[#7C5CFC] flex items-center gap-1 transition-colors py-1">↓ Move down</button>
              <button onClick={() => duplicateCard(selectedCard)} className="text-xs text-[#6B6B80] hover:text-[#7C5CFC] flex items-center gap-1 transition-colors py-1">⧉ Duplicate</button>
              <button onClick={() => deleteCard(selectedCard)} className="text-xs text-red-400 hover:text-red-500 flex items-center gap-1 transition-colors py-1">🗑 Delete card</button>
            </div>
          </div>

          <div className="border-t border-[#F0EFF9] pt-4">
            <p className="text-xs font-semibold text-[#9898A8] uppercase tracking-wider mb-2">Deck Info</p>
            <div className="space-y-3">
              <Select
                label="Category"
                value={category}
                onChange={e => setCategory(e.target.value as CategoryKey)}
                options={Object.entries(categoryInfo).map(([k, v]) => ({ value: k, label: `${v.emoji} ${v.name}` }))}
              />
              <Textarea
                label="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Shown in your deck list"
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>

      <Modal open={publishOpen} onClose={() => setPublishOpen(false)} title="Publish this activity" size="md">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-[#1C1B29] mb-2">Visibility</p>
            <div className="space-y-2">
              {([
                { value: "private", label: "Private", desc: "Only you can see and use this" },
                { value: "unlisted", label: "Unlisted", desc: "Anyone with a direct link can view it, but it won't appear in Explore" },
                { value: "public", label: "Public", desc: "Listed in Explore for any therapist to find" },
              ] as { value: Visibility; label: string; desc: string }[]).map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${visibility === opt.value ? "border-[#7C5CFC] bg-[#F3F0FF]" : "border-[#E8E7F0]"}`}
                >
                  <input type="radio" name="visibility" className="mt-1" checked={visibility === opt.value} onChange={() => setVisibility(opt.value)} />
                  <div>
                    <p className="text-sm font-semibold text-[#1C1B29]">{opt.label}</p>
                    <p className="text-xs text-[#9898A8]">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Age range" placeholder="e.g. 4-7" value={ageRange} onChange={e => setAgeRange(e.target.value)} />
            <Input label="Language" placeholder="English" value={language} onChange={e => setLanguage(e.target.value)} />
          </div>
          <Input label="Tags" placeholder="comma, separated, tags" value={tagsText} onChange={e => setTagsText(e.target.value)} />

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={allowCopy} onChange={e => setAllowCopy(e.target.checked)} />
            <span className="text-sm text-[#1C1B29]">Allow other therapists to copy this activity</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setPublishOpen(false)}>Cancel</Button>
            <Button onClick={handlePublish} loading={publishing}>Save Publishing Settings</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
