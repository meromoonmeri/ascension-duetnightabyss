"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";

/* ─── DNA Design Tokens ─── */
const GOLD = "#E0DABB";
const GOLD_BORDER = "rgba(224, 218, 187, 0.15)";
const GOLD_BORDER_HOVER = "rgba(224, 218, 187, 0.35)";
const TEXT_BODY = "#C1B8A2";
const TEXT_TERTIARY = "#A4A4A4";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  accentColor?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Rechercher...",
  accentColor,
}: SearchBarProps) {
  const gold = accentColor || GOLD;
  const [local, setLocal] = useState(value);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = useCallback(
    (v: string) => {
      setLocal(v);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onChange(v), 350);
    },
    [onChange]
  );

  const handleClear = () => {
    setLocal("");
    onChange("");
  };

  return (
    <div
      className="relative flex items-center transition-all"
      style={{
        background: "transparent",
        borderBottom: `1px solid ${focused ? GOLD_BORDER_HOVER : GOLD_BORDER}`,
      }}
    >
      <Search
        size={15}
        className="ml-1 shrink-0"
        style={{ color: focused ? gold : TEXT_TERTIARY }}
      />
      <input
        type="text"
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none px-3 py-2.5 text-sm"
        style={{
          color: TEXT_BODY,
          fontFamily: "'Gloock', serif",
        }}
      />
      {local && (
        <button
          onClick={handleClear}
          className="mr-1 p-1 cursor-pointer"
          style={{ color: TEXT_TERTIARY }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}