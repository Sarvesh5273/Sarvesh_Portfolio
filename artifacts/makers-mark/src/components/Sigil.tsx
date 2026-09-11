import { useEffect, useState } from 'react';
import { useVisitor } from '@/store/VisitorContext';
import { useDissolve } from '@/lib/dissolve';
import type { ActId } from '@/content/types';
import sigilImg from '@/assets/gen/sigil.webp';

/** The maker's mark: a generated wax seal that takes on each world's light. */
export const SIGIL_SRC = sigilImg;

const TONE: Record<ActId, string> = {
  prologue: 'grayscale(1) brightness(0.9) opacity(0.7)',
  unwritten: 'grayscale(1) brightness(1.35) contrast(0.7) blur(0.6px) opacity(0.55)',
  kingdom: 'sepia(0.6) saturate(1.3) brightness(0.95) drop-shadow(0 2px 6px rgba(0,0,0,0.7))',
  longAfter: 'grayscale(0.9) brightness(1.5) hue-rotate(190deg) saturate(1.8) drop-shadow(0 0 8px rgba(160,200,255,0.6))',
  presentRoom: 'saturate(1.05) drop-shadow(0 1px 2px rgba(0,0,0,0.25))',
  coda: 'saturate(1)',
};

export function Sigil() {
  const { activeAct: enteredAct } = useVisitor();
  const dissolve = useDissolve();
  const [morphedTo, setMorphedTo] = useState<ActId | null>(null);
  const dissolveKind = dissolve?.kind ?? null;
  const dissolveTo = dissolve?.to ?? null;
  useEffect(() => {
    if (!dissolveKind || !dissolveTo) {
      setMorphedTo(null);
      return;
    }
    const id = window.setTimeout(() => setMorphedTo(dissolveTo), 3000);
    return () => window.clearTimeout(id);
  }, [dissolveKind, dissolveTo]);
  const activeAct: ActId = dissolve ? (morphedTo ?? dissolve.from) : enteredAct;

  return (
    <div
      className="fixed bottom-8 right-8 z-[70] w-14 h-14 pointer-events-none"
      aria-label={`Maker's mark, current state: ${activeAct}`}
      role="img"
      data-testid="sigil"
      data-state={activeAct}
    >
      <img
        src={sigilImg}
        alt=""
        className="w-full h-full object-contain transition-[filter] duration-1000"
        style={{ filter: TONE[activeAct] }}
        draggable={false}
      />
    </div>
  );
}
