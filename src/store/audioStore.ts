import { create } from "zustand";

/* ── Playlist ── */

export interface PlaylistTrack {
  videoId: string;
  title: string;
  artist?: string;
}

export const PLAYLIST: PlaylistTrack[] = [
  { videoId: "EoBHRvbKrCQ", title: "Ambient Fantasy OST", artist: "Genshin Impact" },
  { videoId: "qCYbS9GrnKE", title: "That Time I Got Reincarnated as a Slime OST", artist: "TenSura" },
  { videoId: "xVNK0tRzDQc", title: "Epic Dark Fantasy Ambience", artist: "Background Music" },
  { videoId: "4xDzrJKXOOY", title: "Emotional Orchestral Music", artist: "Epic Music World" },
];

/* ── Store ── */

interface AudioState {
  // SFX
  sfxEnabled: boolean;
  sfxVolume: number; // 0-1
  // Music
  musicEnabled: boolean;
  musicVolume: number; // 0-100 (YouTube API uses 0-100)
  // Playlist
  currentTrackIndex: number;
  // UI
  panelOpen: boolean;
  // Actions (pure state, no side effects)
  toggleSfx: () => void;
  setSfxVolume: (v: number) => void;
  toggleMusic: () => void;
  setMusicVolume: (v: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setCurrentTrack: (index: number) => void;
  setPanelOpen: (open: boolean) => void;
  // Helpers
  currentTrack: () => PlaylistTrack;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  sfxEnabled: true,
  sfxVolume: 0.25,
  musicEnabled: false,
  musicVolume: 30,
  currentTrackIndex: 0,
  panelOpen: false,

  toggleSfx: () => set({ sfxEnabled: !get().sfxEnabled }),
  setSfxVolume: (v: number) => set({ sfxVolume: Math.max(0, Math.min(1, v)) }),
  toggleMusic: () => set({ musicEnabled: !get().musicEnabled }),
  setMusicVolume: (v: number) => set({ musicVolume: Math.max(0, Math.min(100, v)) }),
  nextTrack: () =>
    set({ currentTrackIndex: (get().currentTrackIndex + 1) % PLAYLIST.length }),
  prevTrack: () =>
    set({
      currentTrackIndex:
        (get().currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length,
    }),
  setCurrentTrack: (index: number) =>
    set({ currentTrackIndex: Math.max(0, Math.min(PLAYLIST.length - 1, index)) }),
  setPanelOpen: (open: boolean) => set({ panelOpen: open }),
  currentTrack: () => PLAYLIST[get().currentTrackIndex],
}));