"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { X, LogIn, Sparkles } from "lucide-react";

interface SignInDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function SignInDialog({ open, onClose }: SignInDialogProps) {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"choose" | "local">("choose");

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Entre un nom d'utilisateur");
      return;
    }
    setIsLoading(true);
    try {
      const result = await signIn("ascension", {
        username: username.trim(),
        redirect: false,
      });
      if (result?.error) {
        toast.error(`Erreur: ${result.error}`);
      } else if (result?.ok) {
        toast.success(`Bienvenue, ${username.trim()} !`);
        onClose();
        setUsername("");
        setMode("choose");
        // Force session refresh
        window.location.reload();
      }
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscordLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("discord", {
        callbackUrl: "/",
      });
    } catch {
      toast.error("Impossible de se connecter à Discord. Utilise la connexion locale.");
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        style={{ animation: "fadeIn 0.2s ease-out" }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-xl p-6 sm:p-8"
        style={{
          background: "linear-gradient(160deg, rgba(20,20,30,0.98) 0%, rgba(10,10,18,0.98) 100%)",
          border: "1px solid rgba(212,175,55,0.2)",
          boxShadow: "0 0 60px rgba(0,0,0,0.6), 0 0 30px rgba(212,175,55,0.05)",
          animation: "modalIn 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full transition-colors hover:bg-white/10 cursor-pointer"
          style={{ color: "var(--text-tertiary)" }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.05) 100%)",
                border: "1px solid rgba(212,175,55,0.3)",
              }}
            >
              <Sparkles className="w-5 h-5" style={{ color: "var(--gold)" }} />
            </div>
          </div>
          <h2
            className="font-display text-lg sm:text-xl tracking-[0.15em] uppercase"
            style={{ color: "var(--gold)" }}
          >
            Connexion
          </h2>
          <p className="font-body text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
            Accède à ton profil et à la boutique Éther
          </p>
        </div>

        {/* Content */}
        {mode === "choose" && (
          <div className="flex flex-col gap-3">
            {/* Discord button */}
            <button
              onClick={handleDiscordLogin}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 w-full py-3.5 rounded-lg font-display text-sm tracking-[0.1em] uppercase text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #5865F2 0%, #4752C4 100%)",
                boxShadow: "0 0 20px rgba(88,101,242,0.3), 0 4px 15px rgba(0,0,0,0.3)",
              }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              {isLoading ? "Connexion..." : "Connexion Discord"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px" style={{ background: "rgba(212,175,55,0.15)" }} />
              <span className="font-body text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                ou
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(212,175,55,0.15)" }} />
            </div>

            {/* Local login button */}
            <button
              onClick={() => setMode("local")}
              className="flex items-center justify-center gap-3 w-full py-3.5 rounded-lg font-display text-sm tracking-[0.1em] uppercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={{
                border: "1px solid rgba(212,175,55,0.3)",
                color: "var(--gold)",
                background: "rgba(212,175,55,0.05)",
              }}
            >
              <LogIn size={18} />
              Connexion Locale
            </button>
          </div>
        )}

        {mode === "local" && (
          <form onSubmit={handleLocalLogin} className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm font-body" style={{ color: "var(--text-tertiary)" }}>
              <button
                type="button"
                onClick={() => { setMode("choose"); setUsername(""); }}
                className="hover:underline cursor-pointer"
                style={{ color: "var(--gold)" }}
              >
                ← Retour
              </button>
            </div>

            <div>
              <label
                htmlFor="ascension-username"
                className="block font-display text-xs tracking-[0.1em] uppercase mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Nom d&apos;utilisateur
              </label>
              <input
                id="ascension-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: Meromoon"
                maxLength={32}
                autoFocus
                className="w-full px-4 py-3 rounded-lg font-body text-sm outline-none transition-all duration-200 focus:ring-2"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(212,175,55,0.15)",
                  color: "var(--text-primary)",
                  caretColor: "var(--gold)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(212,175,55,0.5)";
                  e.currentTarget.style.boxShadow = "0 0 15px rgba(212,175,55,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(212,175,55,0.15)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !username.trim()}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg font-display text-sm tracking-[0.1em] uppercase text-black transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)",
                boxShadow: "0 0 20px rgba(212,175,55,0.3), 0 4px 15px rgba(0,0,0,0.3)",
              }}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {isLoading ? "Connexion..." : "Entrer dans Ascension"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}