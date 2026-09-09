import { useEffect, useRef, useState } from "react";
import { Button, Input, Select, Modal, Tag } from "./ui/index";
import { useAuth } from "../lib/auth";
import {
  fetchCategories, fetchAssets, fetchMyMedia, createMyMediaAsset, getAssetUrl, computeFileHash,
} from "../lib/assets";
import type { Asset, AssetCategory, AssetType } from "../lib/types";

interface AssetPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: Asset) => void;
  assetType: AssetType; // "image" or "audio" — the picker only shows/accepts this type
}

function nameFromFilename(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim() || "Untitled";
}

export default function AssetPicker({ open, onClose, onSelect, assetType }: AssetPickerProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<"library" | "my-media" | "upload">("library");
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [libraryAssets, setLibraryAssets] = useState<Asset[] | null>(null);
  const [myMedia, setMyMedia] = useState<Asset[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({});

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!open) return;
    fetchCategories().then(setCategories).catch(() => {});
    setTab("library");
    setSearch("");
    setCategoryFilter("All");
    resetUploadForm();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryFilter, tab]);

  function load() {
    setError(null);
    if (tab === "library") {
      fetchAssets({ search, categoryId: categoryFilter, assetType })
        .then(async rows => {
          setLibraryAssets(rows);
          resolveThumbs(rows);
        })
        .catch(e => setError(e.message || "Couldn't load the library"));
    } else if (tab === "my-media" && user) {
      fetchMyMedia(user.id, { search, categoryId: categoryFilter, assetType })
        .then(async rows => {
          setMyMedia(rows);
          resolveThumbs(rows);
        })
        .catch(e => setError(e.message || "Couldn't load your media"));
    }
  }

  async function resolveThumbs(rows: Asset[]) {
    for (const a of rows) {
      if (thumbUrls[a.id]) continue;
      const url = await getAssetUrl(a);
      if (url) setThumbUrls(prev => ({ ...prev, [a.id]: url }));
    }
  }

  function resetUploadForm() {
    setUploadFile(null);
    setUploadPreview(null);
    setUploadName("");
    setUploadCategory("");
    setUploadError(null);
  }

  function handlePickFile(file: File) {
    setUploadFile(file);
    setUploadName(nameFromFilename(file.name));
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.push(url);
      setUploadPreview(url);
    } else {
      setUploadPreview(null);
    }
  }

  async function handleUploadAndUse() {
    if (!user || !uploadFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      const hash = await computeFileHash(uploadFile);
      const result = await createMyMediaAsset(
        user.id,
        uploadFile,
        {
          name: uploadName.trim() || nameFromFilename(uploadFile.name),
          categoryId: uploadCategory || null,
          tags: [],
          assetType,
          source: "",
          license: "",
          attribution: "",
        },
        hash
      );
      if (result.status === "duplicate") {
        // Already have this exact file — just use the existing one instead
        // of erroring, since from the therapist's point of view the goal
        // ("use this image") is satisfied either way.
        onSelect(result.existing);
      } else {
        onSelect(result.asset);
      }
      onClose();
    } catch (e: any) {
      setUploadError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleClose() {
    objectUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
    objectUrlsRef.current = [];
    onClose();
  }

  const currentList = tab === "library" ? libraryAssets : tab === "my-media" ? myMedia : null;

  return (
    <Modal open={open} onClose={handleClose} title={`Choose ${assetType === "audio" ? "Audio" : "Image"}`} size="lg">
      <div className="space-y-4">
        <div className="flex gap-1 bg-[#F0EFF9] p-1 rounded-xl w-fit">
          {(["library", "my-media", "upload"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === t ? "bg-white text-[#7C5CFC] shadow-sm" : "text-[#6B6B80] hover:text-[#1C1B29]"}`}
            >
              {t === "library" ? "Library" : t === "my-media" ? "My Media" : "Upload New"}
            </button>
          ))}
        </div>

        {tab !== "upload" && (
          <>
            <Input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} icon={<span className="text-sm">🔍</span>} />
            <div className="flex flex-wrap gap-2">
              <Tag active={categoryFilter === "All"} onClick={() => setCategoryFilter("All")}>All</Tag>
              {categories.map(c => <Tag key={c.id} active={categoryFilter === c.id} onClick={() => setCategoryFilter(c.id)}>{c.name}</Tag>)}
            </div>

            {error && <div className="text-sm font-medium text-[#DC2626] bg-[#FEF2F2] rounded-lg px-3 py-2">{error}</div>}

            {currentList === null ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-[#EAE4FF] border-t-[#7C5CFC] rounded-full animate-spin" />
              </div>
            ) : currentList.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">{tab === "my-media" ? "📤" : "🗂️"}</p>
                <p className="text-sm text-[#6B6B80]">
                  {tab === "my-media" ? "You haven't uploaded any of your own media yet — try the Upload New tab." : "Nothing here yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
                {currentList.map(asset => {
                  const url = thumbUrls[asset.id];
                  return (
                    <button
                      key={asset.id}
                      onClick={() => { onSelect(asset); handleClose(); }}
                      className="group border-2 border-[#E8E7F0] hover:border-[#7C5CFC] rounded-xl overflow-hidden text-left transition-colors"
                    >
                      <div className="h-20 bg-[#F7F6F3] flex items-center justify-center">
                        {assetType === "image" ? (
                          url ? <img src={url} alt={asset.name} className="max-h-full max-w-full object-contain" /> : <span className="text-2xl">🖼️</span>
                        ) : (
                          <span className="text-2xl">🔊</span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-[#1C1B29] px-2 py-1.5 truncate">{asset.name}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === "upload" && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept={assetType === "audio" ? "audio/*" : "image/*"}
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handlePickFile(f); e.target.value = ""; }}
            />
            {uploadFile ? (
              <div className="flex items-center gap-3 p-3 bg-[#F7F6F3] rounded-xl">
                <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0">
                  {uploadPreview ? <img src={uploadPreview} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl">🔊</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1C1B29] truncate">{uploadFile.name}</p>
                  <button onClick={() => fileInputRef.current?.click()} className="text-xs text-[#7C5CFC] hover:underline">Choose a different file</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[#D5C9FF] rounded-xl p-6 text-center hover:bg-[#F3F0FF] transition-colors"
              >
                <p className="text-2xl mb-1">{assetType === "audio" ? "🔊" : "🖼️"}</p>
                <p className="text-sm font-medium text-[#6B6B80]">Click to choose {assetType === "audio" ? "an audio file" : "an image"}</p>
                <p className="text-xs text-[#9898A8]">Up to 5MB · Saved to your private My Media</p>
              </button>
            )}

            {uploadFile && (
              <>
                <Input label="Name" value={uploadName} onChange={e => setUploadName(e.target.value)} />
                <Select
                  label="Category (optional)"
                  value={uploadCategory}
                  onChange={e => setUploadCategory(e.target.value)}
                  options={[{ value: "", label: "Uncategorized" }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
                />
              </>
            )}

            {uploadError && <div className="text-sm font-medium text-[#DC2626] bg-[#FEF2F2] rounded-lg px-3 py-2">{uploadError}</div>}

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleUploadAndUse} loading={uploading} disabled={!uploadFile}>Upload & Use</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
