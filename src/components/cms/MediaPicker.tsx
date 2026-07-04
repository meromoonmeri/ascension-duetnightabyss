"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Image, Video, Film, Search, Upload, Loader2 } from "lucide-react";

interface MediaFile {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string | null;
  createdAt: string;
}

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, mimeType: string) => void;
  accept?: "image" | "video" | "all";
}

export default function MediaPicker({ open, onClose, onSelect, accept = "all" }: MediaPickerProps) {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const typeParam = accept === "all" ? "" : `&type=${accept}`;
      const res = await fetch(`/api/cms/media?limit=50${typeParam}`);
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media || []);
      }
    } catch (err) {
      console.error("[CMS] Failed to load media:", err);
    } finally {
      setLoading(false);
    }
  }, [accept]);

  useEffect(() => {
    if (open) loadMedia();
  }, [open, loadMedia]);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/cms/upload", { method: "POST", body: formData });
        if (res.ok) {
          const { media: m } = await res.json();
          setMedia((prev) => [m, ...prev]);
        }
      } catch (err) {
        console.error("[CMS] Upload failed:", err);
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const filtered = search
    ? media.filter((m) => m.filename.toLowerCase().includes(search.toLowerCase()))
    : media;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9100] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] mx-4 rounded-xl overflow-hidden flex flex-col"
        style={{
          background: "rgba(10,10,18,0.98)",
          border: "1px solid rgba(59,130,246,0.2)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="font-display text-sm tracking-wider text-white">MÉDIATHÈQUE</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              Uploader
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept === "video" ? "video/*" : accept === "image" ? "image/*" : "image/*,video/*,image/gif"}
              className="hidden"
              onChange={handleUpload}
            />
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-white/5"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-white/5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/5">
            <Search size={14} className="text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm">
              <Image size={32} className="mx-auto mb-3 opacity-30" />
              <p>Aucun média trouvé</p>
              <p className="text-xs mt-1 text-gray-600">Uploadez des images, GIFs ou vidéos</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {filtered.map((m) => {
                const isVideo = m.mimeType.startsWith("video");
                const isGif = m.mimeType === "image/gif";
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelect(m.url, m.mimeType);
                      onClose();
                    }}
                    className="group relative aspect-square rounded-lg overflow-hidden border border-white/5 hover:border-blue-500/40 transition-all hover:scale-[1.02]"
                  >
                    {isVideo ? (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        <Video size={24} className="text-gray-500" />
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.url}
                        alt={m.alt || m.filename}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                      <div className="text-[9px] text-white truncate w-full">
                        {m.filename}
                        {isGif && (
                          <Film size={8} className="inline ml-1 text-green-400" />
                        )}
                        <span className="block text-gray-400">{formatSize(m.size)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}