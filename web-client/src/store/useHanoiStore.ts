import { create } from 'zustand';

interface GameState {
  // Current game state
  currentMinigameId: string | null; // e.g., 'level1', 'chua_lang1'
  isGameOver: boolean;
  isVictory: boolean;
  
  // Player Stats
  health: number;
  ammo: number;
  cratesCollected: number;
  noiseLevel: number;
  stamina: number;
  
  // Narrative State
  currentDialogue: { speaker: string; text: string } | null;
  activeTrivia: {
    question: string;
    options: string[];
    correctIndex: number;
  } | null;
  
  // Actions
  startGame: (minigameId: string) => void;
  endGame: (victory: boolean) => void;
  setHealth: (health: number) => void;
  setAmmo: (ammo: number) => void;
  addCrate: () => void;
  setNoiseLevel: (level: number) => void;
  setStamina: (stamina: number) => void;
  setDialogue: (dialogue: { speaker: string; text: string } | null) => void;
  setTrivia: (trivia: { question: string; options: string[]; correctIndex: number } | null) => void;
  resetGameStats: () => void;
}

export const useHanoiStore = create<GameState>((set) => ({
  currentMinigameId: null,
  isGameOver: false,
  isVictory: false,
  
  health: 100,
  ammo: 10,
  cratesCollected: 0,
  noiseLevel: 0,
  stamina: 100,
  
  currentDialogue: null,
  activeTrivia: null,
  
  startGame: (minigameId) => set({
    currentMinigameId: minigameId,
    isGameOver: false,
    isVictory: false,
    health: 100,
    ammo: 10,
    cratesCollected: 0,
    noiseLevel: 0,
    stamina: 100,
    currentDialogue: null,
    activeTrivia: null,
  }),
  
  endGame: (victory) => set({ isGameOver: true, isVictory: victory }),
  
  setHealth: (health) => set({ health }),
  setAmmo: (ammo) => set({ ammo }),
  addCrate: () => set((state) => ({ cratesCollected: state.cratesCollected + 1 })),
  setNoiseLevel: (level) => set({ noiseLevel: level }),
  setStamina: (stamina) => set({ stamina }),
  
  setDialogue: (dialogue) => set({ currentDialogue: dialogue }),
  setTrivia: (trivia) => set({ activeTrivia: trivia }),
  
  resetGameStats: () => set({
    health: 100,
    ammo: 10,
    cratesCollected: 0,
    noiseLevel: 0,
    stamina: 100,
  }),
}));
