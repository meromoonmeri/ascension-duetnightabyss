"use client";

import { useRef, useState, useCallback, useEffect, type ReactNode, type CSSProperties } from "react";
import { useCms, type CmsStyleOverride } from "@/store/cmsStore";

interface EditableTextProps {
  page: string;
  elementKey: string;
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div" | "button" | "a";
  className?: string;
  style?: CSSProperties;
  placeholder?: string;
  multiline?: boolean;
  tag?: string; // HTML tag name hint for the toolbar
}

export default function EditableText({
  page,
  elementKey,
  children,
  as: Tag = "div",
  className = "",
  style,
  placeholder = "Cliquez pour éditer...",
  multiline = true,
  tag,
}: EditableTextProps) {
  const { isEditMode, contentMap, updateLocalContent, loadFont, selectElement, selectedElement } = useCms();
  const ref = useRef<HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const contentKey = `${page}:${elementKey}`;
  const savedContent = contentMap[contentKey];
  const savedStyle = savedContent?.metadata ? (JSON.parse(savedContent.metadata) as CmsStyleOverride) : null;
  const savedText = savedContent?.type === "text" ? savedContent.value : undefined;

  const isSelected = selectedElement?.elementKey === elementKey && selectedElement?.page === page;

  // Load any custom font from style
  useEffect(() => {
    if (savedStyle?.fontFamily) {
      loadFont(savedStyle.fontFamily);
    }
  }, [savedStyle?.fontFamily, loadFont]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    selectElement({ page, elementKey, type: "text", rect: ref.current?.getBoundingClientRect() });

    // Focus and select text
    setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }, 0);
  }, [isEditMode, page, elementKey, selectElement]);

  const handleBlur = useCallback(() => {
    if (!isEditing) return;
    setIsEditing(false);
    const el = ref.current;
    if (el) {
      const text = el.innerText.trim();
      if (text && text !== savedText) {
        updateLocalContent(page, elementKey, text, "text");
      }
    }
  }, [isEditing, page, elementKey, savedText, updateLocalContent]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditing(false);
        ref.current?.blur();
      }
      if (e.key === "Enter" && !multiline) {
        e.preventDefault();
        setIsEditing(false);
        ref.current?.blur();
      }
    },
    [multiline]
  );

  // Merge saved style overrides
  const mergedStyle: CSSProperties = {
    ...style,
    ...(savedStyle as CSSProperties || {}),
  };

  if (!isEditMode) {
    // Normal mode — just render, possibly with saved content
    if (savedText !== undefined) {
      return (
        <Tag className={className} style={mergedStyle}>
          {savedText}
        </Tag>
      );
    }
    return (
      <Tag className={className} style={style}>
        {children}
      </Tag>
    );
  }

  // Edit mode
  return (
    <Tag
      ref={ref as React.RefObject<never>}
      className={`${className} cms-editable-text`}
      style={{
        ...mergedStyle,
        outline: isEditing
          ? "2px solid #3B82F6"
          : isHovered || isSelected
            ? "2px dashed rgba(59,130,246,0.5)"
            : "none",
        outlineOffset: "2px",
        borderRadius: "3px",
        cursor: "text",
        minHeight: "1em",
        transition: "outline 0.15s ease",
        position: "relative",
      }}
      contentEditable={isEditMode}
      suppressContentEditableWarning
      onClick={handleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-cms-key={elementKey}
      data-cms-type="text"
      data-cms-page={page}
      dangerouslySetInnerHTML={
        savedText !== undefined
          ? { __html: savedText.replace(/\n/g, "<br/>") }
          : undefined
      }
    >
      {savedText === undefined && (
        <span style={{ opacity: 0.4, pointerEvents: "none" }}>{placeholder}</span>
      )}
    </Tag>
  );
}