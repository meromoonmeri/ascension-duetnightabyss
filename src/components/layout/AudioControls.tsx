"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  Music,
  Music4,
  X,
  ChevronLeft,
  ChevronRight,
  ListMusic,
} from "lucide-react";
import { useAudioStore, PLAYLIST } from "@/store/audioStore";
import {
  initAudio,
  setSfxVolume as setEngineVolume,
  setSfxMuted as setEngineMuted,
} from "@/lib/audioEngine";

/* ── YouTube IFrame API types ── */
interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (v: number) => void;
  getVolume: () => number;
  getPlayerState: () => number;
  destroy: () => void;
  loadVideoById: (
    videoId: string,
    startSeconds?: number,
    suggestedQuality?: string,
  ) => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT: {
      Player: new (
        id: string,
        opts: {
          height: string;
          width: string;
          videoId: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number }) => void;
          };
        },
      ) => YTPlayer;
    };
  }
}

/* ── Component ── */
export default function AudioControls() {
  const {
    sfxEnabled,
    sfxVolume,
    musicEnabled,
    musicVolume,
    currentTrackIndex,
    panelOpen,
    toggleSfx,
    setSfxVolume,
    toggleMusic,
    setMusicVolume,
    setCurrentTrack,
    setPanelOpen,
  } = useAudioStore();

  const [ytReady, setYtReady] = useState(false);
  const [ytPlaying, setYtPlaying] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const playerRef = useRef<YTPlayer | null>(null);
  const apiLoadedRef = useRef(false);
  const firstInteractionRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const playlistRef = useRef<HTMLDivElement>(null);

  const track = PLAYLIST[currentTrackIndex];

  /* ── Create YouTube Player (internal) ── */
  const createPlayer = useCallback(
    (videoId: string, shouldPlay: boolean) => {
      // Destroy existing player if any
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          /* noop */
        }
        playerRef.current = null;
      }

      const container = document.getElementById("yt-player-container");
      if (!container) return;

      // Remove old player div and create fresh one
      const oldDiv = document.getElementById("yt-audio-player");
      if (oldDiv) oldDiv.remove();

      const playerDiv = document.createElement("div");
      playerDiv.id = "yt-audio-player";
      container.appendChild(playerDiv);

      playerRef.current = new window.YT.Player("yt-audio-player", {
        height: "1",
        width: "1",
        videoId,
        playerVars: {
          autoplay: shouldPlay ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          loop: 1,
          playlist: videoId, // loop requires playlist param
          origin: window.location.origin,
        },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            e.target.setVolume(musicVolume);
            setYtReady(true);
            if (shouldPlay) {
              e.target.playVideo();
            }
          },
          onStateChange: (e: { data: number }) => {
            // YT.PlayerState: PLAYING=1, PAUSED=2, ENDED=0, BUFFERING=3
            setYtPlaying(e.data === 1);
          },
        },
      });
    },
    [musicVolume],
  );

  /* ── Load YouTube IFrame API ── */
  const loadYouTubeAPI = useCallback(() => {
    if (apiLoadedRef.current) return;
    apiLoadedRef.current = true;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      createPlayer(PLAYLIST[currentTrackIndex].videoId, musicEnabled);
    };
  }, [createPlayer, currentTrackIndex, musicEnabled]);

  /* ── Handle track change ── */
  const handleTrackChange = useCallback(
    (newIndex: number) => {
      const wasPlaying = musicEnabled && ytPlaying;
      setCurrentTrack(newIndex);
      if (apiLoadedRef.current) {
        createPlayer(PLAYLIST[newIndex].videoId, wasPlaying);
      }
      setShowPlaylist(false);
    },
    [musicEnabled, ytPlaying, setCurrentTrack, createPlayer],
  );

  const handlePrevTrack = useCallback(() => {
    const newIndex =
      (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    handleTrackChange(newIndex);
  }, [currentTrackIndex, handleTrackChange]);

  const handleNextTrack = useCallback(() => {
    const newIndex = (currentTrackIndex + 1) % PLAYLIST.length;
    handleTrackChange(newIndex);
  }, [currentTrackIndex, handleTrackChange]);

  /* ── First interaction handler: init audio + load YT API ── */
  const handleFirstInteraction = useCallback(() => {
    if (firstInteractionRef.current) return;
    firstInteractionRef.current = true;
    initAudio();
    loadYouTubeAPI();
  }, [loadYouTubeAPI]);

  useEffect(() => {
    const events = ["click", "keydown", "touchstart"] as const;
    events.forEach((e) =>
      window.addEventListener(e, handleFirstInteraction, { once: true }),
    );
    return () =>
      events.forEach((e) =>
        window.removeEventListener(e, handleFirstInteraction),
      );
  }, [handleFirstInteraction]);

  /* ── Sync SFX state to engine ── */
  useEffect(() => {
    if (firstInteractionRef.current) {
      setEngineMuted(!sfxEnabled);
      setEngineVolume(sfxVolume);
    }
  }, [sfxEnabled, sfxVolume]);

  /* ── Sync music play/pause ── */
  useEffect(() => {
    if (!playerRef.current || !ytReady) return;
    if (musicEnabled) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [musicEnabled, ytReady]);

  /* ── Sync music volume ── */
  useEffect(() => {
    if (playerRef.current && ytReady) {
      playerRef.current.setVolume(musicVolume);
    }
  }, [musicVolume, ytReady]);

  /* ── Close panel on click outside ── */
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [panelOpen, setPanelOpen]);

  /* ── Close playlist dropdown on click outside ── */
  useEffect(() => {
    if (!showPlaylist) return;
    const handler = (e: MouseEvent) => {
      if (
        playlistRef.current &&
        !playlistRef.current.contains(e.target as Node)
      ) {
        setShowPlaylist(false);
      }
    };
    // Delay to avoid immediate closing from the same click that opened it
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handler);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handler);
    };
  }, [showPlaylist]);

  /* ── Cleanup ── */
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          /* noop */
        }
        playerRef.current = null;
      }
    };
  }, []);

  const anyActive = sfxEnabled || musicEnabled;
  const trackLabel = track.artist
    ? `${track.title} — ${track.artist}`
    : track.title;

  return (
    <>
      {/* Hidden YouTube player container */}
      <div
        id="yt-player-container"
        style={{
          position: "fixed",
          bottom: "0",
          left: "0",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      />

      {/* ── Floating Audio Widget ── */}
      <div
        ref={panelRef}
        className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-2"
      >
        {/* ── Expanded Panel ── */}
        <div
          className={`
            w-72 rounded-lg border border-bdr-accent bg-surface-elevated/95 backdrop-blur-xl
            shadow-2xl overflow-hidden
            transition-all duration-400 ease-out origin-bottom-right
            ${
              panelOpen
                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                : "opacity-0 scale-90 translate-y-3 pointer-events-none"
            }
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-bdr-secondary">
            <div className="flex items-center gap-2">
              <Music4
                size={16}
                className={
                  anyActive ? "text-[var(--gold)]" : "text-txt-tertiary"
                }
              />
              <span className="font-display text-xs tracking-[0.15em] uppercase text-txt-primary">
                Audio
              </span>
            </div>
            <button
              onClick={() => setPanelOpen(false)}
              className="p-1 text-txt-tertiary hover:text-txt-primary transition-colors"
              aria-label="Fermer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-4 space-y-5">
            {/* ── SFX Section ── */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 size={14} className="text-txt-secondary" />
                  <span className="font-body text-sm text-txt-primary">
                    Effets sonores
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleFirstInteraction();
                    toggleSfx();
                  }}
                  className={`
                    relative w-10 h-5 rounded-full transition-colors duration-300
                    ${sfxEnabled ? "bg-[var(--gold)]" : "bg-bdr-accent"}
                  `}
                  role="switch"
                  aria-checked={sfxEnabled}
                  aria-label="Activer/désactiver les effets sonores"
                >
                  <span
                    className={`
                      absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white
                      transition-transform duration-300 shadow-sm
                      ${sfxEnabled ? "translate-x-5" : "translate-x-0"}
                    `}
                  />
                </button>
              </div>

              {/* SFX Volume Slider */}
              <div className="flex items-center gap-3 pl-6">
                <span className="text-[0.6rem] font-mono text-txt-tertiary w-4">
                  0
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(sfxVolume * 100)}
                  onChange={(e) =>
                    setSfxVolume(Number(e.target.value) / 100)
                  }
                  className="audio-slider flex-1"
                  disabled={!sfxEnabled}
                />
                <span className="text-[0.6rem] font-mono text-txt-tertiary w-4 text-right">
                  1
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-bdr-secondary" />

            {/* ── Music Section ── */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music
                    size={14}
                    className={
                      musicEnabled && ytPlaying
                        ? "text-[var(--gold)]"
                        : "text-txt-secondary"
                    }
                  />
                  <span className="font-body text-sm text-txt-primary">
                    Musique de fond
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleFirstInteraction();
                    toggleMusic();
                  }}
                  className={`
                    relative w-10 h-5 rounded-full transition-colors duration-300
                    ${musicEnabled ? "bg-[var(--gold)]" : "bg-bdr-accent"}
                  `}
                  role="switch"
                  aria-checked={musicEnabled}
                  aria-label="Activer/désactiver la musique de fond"
                >
                  <span
                    className={`
                      absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white
                      transition-transform duration-300 shadow-sm
                      ${musicEnabled ? "translate-x-5" : "translate-x-0"}
                    `}
                  />
                </button>
              </div>

              {/* Music Volume Slider */}
              <div className="flex items-center gap-3 pl-6">
                <span className="text-[0.6rem] font-mono text-txt-tertiary w-4">
                  0
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(Number(e.target.value))}
                  className="audio-slider flex-1"
                  disabled={!musicEnabled}
                />
                <span className="text-[0.6rem] font-mono text-txt-tertiary w-4 text-right">
                  {musicVolume}
                </span>
              </div>

              {/* Track Navigation Controls */}
              <div className="pl-6 pt-1 space-y-2">
                <div className="flex items-center gap-2">
                  {/* Previous Track */}
                  <button
                    onClick={() => {
                      handleFirstInteraction();
                      handlePrevTrack();
                    }}
                    className="p-1 text-txt-tertiary hover:text-[var(--gold)] transition-colors"
                    aria-label="Piste précédente"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  {/* Playing indicator */}
                  <div
                    className={`
                      w-1.5 h-1.5 rounded-full shrink-0
                      ${
                        musicEnabled && ytPlaying
                          ? "bg-[var(--gold)] animate-pulse"
                          : "bg-txt-tertiary/30"
                      }
                    `}
                  />

                  {/* Track name (click to toggle playlist) */}
                  <button
                    onClick={() => setShowPlaylist(!showPlaylist)}
                    className="flex items-center gap-1.5 min-w-0 flex-1 group"
                    aria-label="Afficher la liste de lecture"
                  >
                    <span
                      className={`
                        font-body text-xs italic truncate
                        ${
                          musicEnabled && ytPlaying
                            ? "text-txt-secondary group-hover:text-[var(--gold)]"
                            : "text-txt-tertiary group-hover:text-txt-secondary"
                        }
                        transition-colors
                      `}
                    >
                      {musicEnabled && ytPlaying ? trackLabel : "Aucune lecture"}
                    </span>
                    <ListMusic
                      size={10}
                      className="shrink-0 text-txt-tertiary group-hover:text-[var(--gold)] transition-colors"
                    />
                  </button>

                  {/* Next Track */}
                  <button
                    onClick={() => {
                      handleFirstInteraction();
                      handleNextTrack();
                    }}
                    className="p-1 text-txt-tertiary hover:text-[var(--gold)] transition-colors"
                    aria-label="Piste suivante"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Track index */}
                <div className="pl-7">
                  <span className="font-display text-[0.6rem] tracking-[0.15em] text-txt-tertiary/60 uppercase">
                    {currentTrackIndex + 1} / {PLAYLIST.length}
                  </span>
                </div>

                {/* Playlist Dropdown */}
                {showPlaylist && (
                  <div
                    ref={playlistRef}
                    className="ml-1 mt-1 rounded-md border border-bdr-secondary bg-surface-base/95 backdrop-blur-sm overflow-hidden max-h-48 overflow-y-auto custom-scrollbar"
                  >
                    {PLAYLIST.map((t, i) => (
                      <button
                        key={t.videoId}
                        onClick={() => {
                          handleFirstInteraction();
                          handleTrackChange(i);
                        }}
                        className={`
                          w-full text-left px-3 py-2 text-xs font-body transition-colors
                          flex items-center gap-2
                          ${
                            i === currentTrackIndex
                              ? "bg-[var(--gold)]/10 text-[var(--gold)]"
                              : "text-txt-secondary hover:bg-bdr-secondary/50 hover:text-txt-primary"
                          }
                        `}
                      >
                        {/* Active indicator */}
                        {i === currentTrackIndex && musicEnabled && ytPlaying ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse shrink-0" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full shrink-0 border border-current opacity-30" />
                        )}
                        <span className="truncate">
                          {t.artist ? `${t.title} — ${t.artist}` : t.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Toggle Button ── */}
        <button
          onClick={() => {
            handleFirstInteraction();
            setPanelOpen(!panelOpen);
          }}
          className={`
            relative w-11 h-11 rounded-full border flex items-center justify-center
            transition-all duration-300 shadow-lg
            ${
              anyActive
                ? "border-[var(--gold)]/40 bg-surface-elevated/90 hover:bg-surface-elevated hover:border-[var(--gold)]/60"
                : "border-bdr-secondary bg-surface-elevated/90 hover:bg-surface-elevated"
            }
            ${panelOpen ? "ring-1 ring-[var(--gold)]/20" : ""}
          `}
          aria-label={
            panelOpen
              ? "Fermer les paramètres audio"
              : "Ouvrir les paramètres audio"
          }
        >
          {anyActive ? (
            <Music4 size={18} className="text-[var(--gold)]" />
          ) : (
            <VolumeX size={18} className="text-txt-tertiary" />
          )}

          {/* Active indicator glow */}
          {anyActive && (
            <span className="absolute inset-0 rounded-full bg-[var(--gold)]/5 animate-pulse pointer-events-none" />
          )}
        </button>
      </div>
    </>
  );
}