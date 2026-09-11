import { createContext, useContext, useState, ReactNode } from 'react';
import { ActId } from '@/content/types';

export interface VisitorState {
  chosenDoorway: string | null;
  visitedDiscoveries: string[];
  timestamps: Record<ActId, number | null>;
  activeAct: ActId;
  unlockedActs: ActId[];
  setDoorway: (doorway: string | null) => void;
  visitDiscovery: (id: string) => void;
  recordEntry: (act: ActId) => void;
  unlockNextAct: () => void;
  /** Skip link for recruiters: reveal every act at once. */
  unlockAll: () => void;
  setActiveAct: (act: ActId) => void;
}

const ACT_ORDER: ActId[] = ['prologue', 'unwritten', 'kingdom', 'presentRoom', 'coda'];

const DOORWAY_KEY = 'makers-mark:doorway';

const VisitorContext = createContext<VisitorState | null>(null);

export function VisitorProvider({ children }: { children: ReactNode }) {
  // Legacy doorway choices are retained for completed visits. The single-door
  // Prologue clears this value for new entries.
  const [chosenDoorway, setChosenDoorway] = useState<string | null>(() => {
    try {
      return window.sessionStorage.getItem(DOORWAY_KEY);
    } catch {
      return null;
    }
  });
  const [visitedDiscoveries, setVisitedDiscoveries] = useState<string[]>([]);
  const [timestamps, setTimestamps] = useState<Record<ActId, number | null>>({
    prologue: null,
    unwritten: null,
    kingdom: null,
    presentRoom: null,
    coda: null,
  });
  
  const [unlockedActs, setUnlockedActs] = useState<ActId[]>(['prologue']);
  const [activeAct, setActiveAct] = useState<ActId>('prologue');

  const setDoorway = (doorway: string | null) => {
    setChosenDoorway(doorway);
    try {
      if (doorway) window.sessionStorage.setItem(DOORWAY_KEY, doorway);
      else window.sessionStorage.removeItem(DOORWAY_KEY);
    } catch {
      // storage unavailable (private mode); the in-memory value still works
    }
  };
  
  const visitDiscovery = (id: string) => {
    setVisitedDiscoveries((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };
  
  const recordEntry = (act: ActId) => {
    setTimestamps((prev) => (prev[act] ? prev : { ...prev, [act]: Date.now() }));
  };
  
  const unlockNextAct = () => {
    setUnlockedActs((prev) => {
      const currentIndex = ACT_ORDER.indexOf(prev[prev.length - 1]);
      if (currentIndex >= ACT_ORDER.length - 1) return prev;
      const nextAct = ACT_ORDER[currentIndex + 1];
      return prev.includes(nextAct) ? prev : [...prev, nextAct];
    });
  };

  const unlockAll = () => setUnlockedActs([...ACT_ORDER]);

  return (
    <VisitorContext.Provider value={{
      chosenDoorway, visitedDiscoveries, timestamps, activeAct, unlockedActs,
      setDoorway, visitDiscovery, recordEntry, unlockNextAct, unlockAll, setActiveAct
    }}>
      {children}
    </VisitorContext.Provider>
  );
}

export function useVisitor() {
  const context = useContext(VisitorContext);
  if (!context) throw new Error('useVisitor must be used within VisitorProvider');
  return context;
}
