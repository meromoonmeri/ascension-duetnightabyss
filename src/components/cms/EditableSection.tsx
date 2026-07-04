"use client";

import { useState, useRef, useCallback, type ReactNode, type CSSProperties } from "react";
import { useCms, type CmsBackgroundConfig } from "@/store/cmsStore";
import { Video, Image, Film, Paintbrush, X, Trash2, Link, Upload, PaintBucket } from "lucide-react";

interface EditableSectionProps {
  page: string;
  elementKey: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  defaultBackground?: CmsBackgroundConfig;
}

export default function EditableSection({
  page,
  elementKey,
  children,
  className = "",
  style,
  defaultBackground,
}: EditableSectionProps) {
  const { isEditMode, contentMap, updateLocalContent, selectElement, selectedElement } = useCms();
  const [showPanel, setShowPanel] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contentKey = `${page}:${elementKey}`;
  const savedBg = contentMap[contentKey];
  const bgConfig: CmsBackgroundConfig = savedBg?.type === "background"
    ? JSON.parse(savedBg.value)
    : defaultBackground || { type: "none" as const };

  const isSelected = selectedElement?.elementKey === elementKey && selectedElement?.page === page;

  const handleSelect = useCallback(() => {
    if (!isEditMode) return;
    selectElement({ page, elementKey, type: "background", rect: undefined });
  }, [isEditMode, page, elementKey, selectElement]);

  const saveBgConfig = useCallback(
    (config: CmsBackgroundConfig) => {
      updateLocalContent(page, elementKey, JSON.stringify(config), "background");
    },
    [page, elementKey, updateLocalContent]
  );

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/cms/upload", { method: "POST", body: formData });
        if (res.ok) {
          const { media } = await res.json();
          const isVideo = media.mimeType.startsWith("video");
          const newConfig: CmsBackgroundConfig = {
            type: isVideo ? "video" : media.mimeType === "image/gif" ? "gif" : "image",
            url: media.url,
            opacity: bgConfig.opacity ?? 0.35,
            blur: bgConfig.blur ?? 0,
            cover: true,
          };
          saveBgConfig(newConfig);
          setShowPanel(false);
        }
      } catch (err) {
        console.error("[CMS] Upload failed:", err);
      }
    },
    [bgConfig.opacity, bgConfig.blur, saveBgConfig]
  );

  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) return;
    const url = urlInput.trim().toLowerCase();
    const isVideo = url.endsWith(".mp4") || url.endsWith(".webm");
    const isGif = url.endsWith(".gif");
    const newConfig: CmsBackgroundConfig = {
      type: isVideo ? "video" : isGif ? "gif" : "image",
      url: urlInput.trim(),
      opacity: bgConfig.opacity ?? 0.35,
      blur: bgConfig.blur ?? 0,
      cover: true,
    };
    saveBgConfig(newConfig);
    setUrlInput("");
    setShowPanel(false);
  }, [urlInput, bgConfig.opacity, bgConfig.blur, saveBgConfig]);

  const handleRemove = useCallback(() => {
    saveBgConfig({ type: "none" });
    setShowPanel(false);
  }, [saveBgConfig]);

  const handleOpacityChange = useCallback(
    (val: number) => {
      saveBgConfig({ ...bgConfig, opacity: val });
    },
    [bgConfig, saveBgConfig]
  );

  // Build background style
  const getBgStyle = (): CSSProperties => {
    if (bgConfig.type === "none") return {};

    if (bgConfig.type === "gradient") {
      return { background: bgConfig.gradient || "linear-gradient(135deg, #1a1a2e, #16213e)" };
    }

    if (bgConfig.type === "video" || bgConfig.type === "gif") {
      return {};
    }

    // image
    return {
      backgroundImage: `url(${bgConfig.url})`,
      backgroundSize: bgConfig.cover !== false ? "cover" : "contain",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  };

  if (!isEditMode) {
    return (
      <section className={`${className} cms-section`} style={{ ...style, ...getBgStyle(), position: "relative" }}>
        {/* Video background layer */}
        {(bgConfig.type === "video" || bgConfig.type === "gif") && bgConfig.url && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <video
              src={bgConfig.url}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: bgConfig.opacity ?? 0.35, filter: bgConfig.blur ? `blur(${bgConfig.blur}px)` : "none" }}
            />
          </div>
        )}
        {/* Image bg with opacity */}
        {bgConfig.type === "image" && bgConfig.url && (bgConfig.opacity !== undefined && bgConfig.opacity < 1) && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ ...getBgStyle(), opacity: bgConfig.opacity, filter: bgConfig.blur ? `blur(${bgConfig.blur}px)` : "none" }}
            aria-hidden="true"
          />
        )}
        {children}
      </section>
    );
  }

  // Edit mode
  return (
    <section
      className={`${className} cms-section`}
      style={{
        ...style,
        ...getBgStyle(),
        position: "relative",
        outline: isHovered || isSelected ? "2px dashed rgba(59,130,246,0.4)" : "none",
        outlineOffset: "-2px",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSelect}
      data-cms-key={elementKey}
      data-cms-type="background"
      data-cms-page={page}
    >
      {/* Video background layer */}
      {(bgConfig.type === "video" || bgConfig.type === "gif") && bgConfig.url && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <video
            src={bgConfig.url}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: bgConfig.opacity ?? 0.35, filter: bgConfig.blur ? `blur(${bgConfig.blur}px)` : "none" }}
          />
        </div>
      )}

      {/* Edit mode hover overlay */}
      {isHovered && !showPanel && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer"
          style={{ background: "rgba(0,0,0,0.3)" }}
          onClick={(e) => {
            e.stopPropagation();
            setShowPanel(true);
            setIsHovered(false);
          }}
        >
          <div className="flex flex-col items-center gap-1 text-white text-xs bg-black/60 px-4 py-3 rounded-lg">
            <Paintbrush size={18} />
            <span>Modifier le fond</span>
          </div>
        </div>
      )}

      {/* Background editor panel */}
      {showPanel && (
        <div
          className="absolute z-[100] top-4 right-4 w-80 p-4 rounded-lg"
          style={{
            background: "rgba(10,10,18,0.97)",
            border: "1px solid rgba(59,130,246,0.3)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
            backdropFilter: "blur(24px)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-display text-xs tracking-wider text-white">FOND DE SECTION</span>
            <button
              onClick={() => setShowPanel(false)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Type selection */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center gap-1 p-2 rounded-md text-[10px] transition-colors ${
                bgConfig.type === "image" ? "bg-blue-500/20 text-blue-400" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Image size={16} />
              Image
            </button>
            <button
              onClick={() => {
                const newConfig: CmsBackgroundConfig = { ...bgConfig, type: "video", opacity: bgConfig.opacity ?? 0.35 };
                saveBgConfig(newConfig);
                fileInputRef.current?.click();
              }}
              className={`flex flex-col items-center gap-1 p-2 rounded-md text-[10px] transition-colors ${
                bgConfig.type === "video" ? "bg-purple-500/20 text-purple-400" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Video size={16} />
              Vidéo
            </button>
            <button
              onClick={() => {
                const newConfig: CmsBackgroundConfig = { ...bgConfig, type: "gif", opacity: bgConfig.opacity ?? 0.35 };
                saveBgConfig(newConfig);
                fileInputRef.current?.click();
              }}
              className={`flex flex-col items-center gap-1 p-2 rounded-md text-[10px] transition-colors ${
                bgConfig.type === "gif" ? "bg-green-500/20 text-green-400" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Film size={16} />
              GIF
            </button>
            <button
              onClick={() => saveBgConfig({ type: "gradient", gradient: "linear-gradient(135deg, #1a1a2e, #16213e)" })}
              className={`flex flex-col items-center gap-1 p-2 rounded-md text-[10px] transition-colors ${
                bgConfig.type === "gradient" ? "bg-amber-500/20 text-amber-400" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Paintbrush size={16} />
              Dégradé
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm,image/gif"
            className="hidden"
            onChange={handleUpload}
          />

          {/* URL input */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md bg-white/5">
              <Link size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                placeholder="URL image, GIF ou vidéo..."
                className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-gray-500"
              />
            </div>
            <button
              onClick={handleUrlSubmit}
              className="px-2 py-2 rounded-md bg-blue-500/20 text-blue-400 text-xs hover:bg-blue-500/30 transition-colors"
            >
              OK
            </button>
          </div>

          {/* Opacity slider (for image/video/gif) */}
          {(bgConfig.type === "image" || bgConfig.type === "video" || bgConfig.type === "gif") && (
            <div className="mb-4 px-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <PaintBucket size={10} /> Opacité
                </span>
                <span className="text-[10px] text-gray-300">{Math.round((bgConfig.opacity ?? 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bgConfig.opacity ?? 1}
                onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, transparent, rgba(59,130,246,${bgConfig.opacity ?? 1}))`,
                  accentColor: "#3B82F6",
                }}
              />
            </div>
          )}

          {/* Gradient editor */}
          {bgConfig.type === "gradient" && (
            <div className="mb-4">
              <label className="text-[10px] text-gray-400 block mb-1">CSS Gradient</label>
              <input
                type="text"
                value={bgConfig.gradient || ""}
                onChange={(e) => saveBgConfig({ ...bgConfig, gradient: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-white/5 text-xs text-white outline-none"
                placeholder="linear-gradient(135deg, #1a1a2e, #16213e)"
              />
              <div className="flex gap-1 mt-2">
                {[
                  "linear-gradient(135deg, #1a1a2e, #16213e)",
                  "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
                  "linear-gradient(135deg, #141e30, #243b55)",
                  "linear-gradient(135deg, #1a002e, #0a0a18)",
                  "linear-gradient(180deg, #2d1b00, #0a0a18)",
                  "radial-gradient(ellipse at center, #1a1a2e, #0a0a18)",
                ].map((g) => (
                  <button
                    key={g}
                    onClick={() => saveBgConfig({ ...bgConfig, gradient: g })}
                    className="w-8 h-8 rounded border border-white/10 hover:border-white/30 transition-colors"
                    style={{ background: g }}
                    title={g}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Remove */}
          {bgConfig.type !== "none" && (
            <button
              onClick={handleRemove}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-colors"
            >
              <Trash2 size={12} />
              Supprimer le fond
            </button>
          )}
        </div>
      )}

      {children}
    </section>
  );
}