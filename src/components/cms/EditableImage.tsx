"use client";

import { useState, useRef, useCallback, type CSSProperties } from "react";
import { useCms } from "@/store/cmsStore";
import { ImageIcon, Upload, Link, X, Trash2, Film } from "lucide-react";

interface EditableImageProps {
  page: string;
  elementKey: string;
  src: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  width?: number;
  height?: number;
  objectFit?: string;
  priority?: boolean;
  unoptimized?: boolean;
  /** Render mode: "img" uses <img>, "bg" uses background-image */
  mode?: "img" | "bg";
  children?: React.ReactNode;
}

export default function EditableImage({
  page,
  elementKey,
  src: defaultSrc,
  alt = "",
  className = "",
  style,
  width,
  height,
  objectFit = "cover",
  priority,
  unoptimized,
  mode = "img",
  children,
}: EditableImageProps) {
  const { isEditMode, contentMap, updateLocalContent, selectElement, selectedElement } = useCms();
  const [isHovered, setIsHovered] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const contentKey = `${page}:${elementKey}`;
  const savedContent = contentMap[contentKey];
  const currentSrc = savedContent?.type === "image" ? savedContent.value : defaultSrc;

  const isSelected = selectedElement?.elementKey === elementKey && selectedElement?.page === page;

  const handleSelect = useCallback(() => {
    if (!isEditMode) return;
    selectElement({ page, elementKey, type: "image", rect: wrapperRef.current?.getBoundingClientRect() });
  }, [isEditMode, page, elementKey, selectElement]);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("alt", alt);

      try {
        const res = await fetch("/api/cms/upload", { method: "POST", body: formData });
        if (res.ok) {
          const { media } = await res.json();
          updateLocalContent(page, elementKey, media.url, "image");
          setShowPanel(false);
        }
      } catch (err) {
        console.error("[CMS] Upload failed:", err);
      }
    },
    [alt, page, elementKey, updateLocalContent]
  );

  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) return;
    updateLocalContent(page, elementKey, urlInput.trim(), "image");
    setUrlInput("");
    setShowPanel(false);
  }, [urlInput, page, elementKey, updateLocalContent]);

  const handleReset = useCallback(() => {
    // Reset to default by deleting the override
    fetch("/api/cms/content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page, elementKey }),
    }).then(() => {
      // Remove from local store
      const map = { ...useCms.getState().contentMap };
      delete map[contentKey];
      useCms.setState({ contentMap: map });
      setShowPanel(false);
    });
  }, [page, elementKey, contentKey]);

  if (!isEditMode) {
    if (mode === "bg") {
      return (
        <div
          className={className}
          style={{
            ...style,
            backgroundImage: `url(${currentSrc})`,
            backgroundSize: objectFit === "contain" ? "contain" : "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {children}
        </div>
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={currentSrc}
        alt={alt}
        className={className}
        style={style}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  // Edit mode
  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSelect}
      data-cms-key={elementKey}
      data-cms-type="image"
      data-cms-page={page}
    >
      {/* The actual image */}
      {mode === "bg" ? (
        <div
          className={className}
          style={{
            ...style,
            backgroundImage: `url(${currentSrc})`,
            backgroundSize: objectFit === "contain" ? "contain" : "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            outline: isHovered || isSelected ? "2px dashed rgba(59,130,246,0.5)" : "none",
            outlineOffset: "2px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {children}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentSrc}
          alt={alt}
          className={className}
          style={{
            ...style,
            outline: isHovered || isSelected ? "2px dashed rgba(59,130,246,0.5)" : "none",
            outlineOffset: "2px",
            cursor: "pointer",
          }}
          width={width}
          height={height}
        />
      )}

      {/* Hover overlay */}
      {(isHovered || isSelected) && (
        <div
          className="absolute inset-0 flex items-center justify-center gap-2"
          style={{
            background: "rgba(0,0,0,0.5)",
            borderRadius: "4px",
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowPanel(true);
          }}
        >
          <div className="flex flex-col items-center gap-1 text-white text-xs">
            <ImageIcon size={24} />
            <span>Changer l&apos;image</span>
          </div>
        </div>
      )}

      {/* Edit panel */}
      {showPanel && (
        <div
          className="absolute z-[100] left-1/2 -translate-x-1/2 top-full mt-2 w-72 p-4 rounded-lg"
          style={{
            background: "rgba(10,10,18,0.97)",
            border: "1px solid rgba(59,130,246,0.3)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
            backdropFilter: "blur(24px)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-display text-xs tracking-wider text-white">MODIFIER L&apos;IMAGE</span>
            <button
              onClick={() => setShowPanel(false)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md mb-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Upload size={16} className="text-blue-400" />
            <span>Uploader un fichier</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm,image/gif"
            className="hidden"
            onChange={handleUpload}
          />

          {/* URL input */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md bg-white/5">
              <Link size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                placeholder="Coller une URL..."
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
              />
            </div>
            <button
              onClick={handleUrlSubmit}
              className="px-3 py-2 rounded-md bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors"
            >
              OK
            </button>
          </div>

          {/* GIF/Video hint */}
          <p className="text-[10px] text-gray-500 mb-3 px-1">
            <Film size={10} className="inline mr-1" />
            Supporte images, GIFs, et vidéos MP4/WebM
          </p>

          {/* Reset */}
          {savedContent && (
            <button
              onClick={handleReset}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-colors"
            >
              <Trash2 size={14} />
              <span>Réinitialiser</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}