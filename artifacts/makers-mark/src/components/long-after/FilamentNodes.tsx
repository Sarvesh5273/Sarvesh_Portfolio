import { useState } from 'react';
import { discoveries, structures } from '@/content';
import { useVisitor } from '@/store/VisitorContext';
import { FUTURE_MAT } from './SceneMedia';

function collectNodes() {
  const actionForge = structures.find((s) => s.id === 'gate')?.longAfter.nodes?.find((node) => node.name === 'ActionForge');
  const paperPilot = discoveries.find((discovery) => discovery.id === 'paperpilot');
  const phantomOps = discoveries.find((discovery) => discovery.id === 'phantomops');
  return [
    ...(paperPilot ? [{ id: paperPilot.id, name: paperPilot.name, line: paperPilot.line, href: paperPilot.href, near: 'the Lattice' }] : []),
    ...(actionForge ? [{ id: 'actionforge', name: actionForge.name, line: actionForge.line, href: actionForge.href, near: 'the Rings' }] : []),
    ...(phantomOps ? [{ id: phantomOps.id, name: phantomOps.name, line: phantomOps.line, href: phantomOps.href, near: 'the field' }] : []),
  ];
}

const NODES = collectNodes();

export function FilamentNodes({ reduced }: { reduced: boolean }) {
  const { visitDiscovery, visitedDiscoveries } = useVisitor();
  const [open, setOpen] = useState<string | null>(null);
  const reveal = (id: string | null) => {
    setOpen(id);
    if (id) visitDiscovery(id);
  };

  return (
    <div className="w-full rounded-none p-6 md:p-10" style={{ background: 'linear-gradient(180deg, rgba(3,5,7,0.8), rgba(3,5,7,0.95))', border: '1px solid rgba(162,172,184,0.15)', backdropFilter: 'blur(4px)' }} data-testid="scene-nodes">
      <p className="la-sub mb-3">Smaller lights</p>
      <h3 className="la-heading text-2xl md:text-4xl mb-8">Hung from the same filaments</h3>
      <ul className="grid gap-8 md:grid-cols-3">
        {NODES.map((node, index) => {
          const isOpen = open === node.id;
          const seen = visitedDiscoveries.includes(node.id);
          return (
            <li key={node.id} className="flex flex-col items-center text-center group" data-testid={`node-${node.id}`}>
              <span className="h-12 w-px transition-colors duration-500" style={{ background: isOpen ? `linear-gradient(to bottom, transparent, ${FUTURE_MAT.filament})` : `linear-gradient(to bottom, transparent, rgba(162,172,184,0.3))` }} aria-hidden="true" />
              <button
                type="button"
                className={`relative h-16 w-16 focus-visible:outline-none transition-transform duration-300 ${reduced ? '' : 'la-hang'} ${isOpen ? 'scale-110' : ''}`}
                style={{
                  color: isOpen ? FUTURE_MAT.filament : seen ? FUTURE_MAT.ceramic : FUTURE_MAT.titanium,
                  animationDelay: `${index * 1.7}s`,
                  boxShadow: isOpen ? `0 0 20px rgba(64,224,208,0.2)` : 'none',
                  borderRadius: '12px'
                }}
                aria-expanded={isOpen}
                aria-label={node.name}
                data-testid={`button-node-${node.id}`}
                onPointerEnter={(e) => e.pointerType === 'mouse' && reveal(node.id)}
                onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(null)}
                onClick={() => reveal(isOpen ? null : node.id)}
                onFocus={() => reveal(node.id)}
                onBlur={() => setOpen(null)}
              >
                <div className="absolute inset-0 border transition-colors duration-300" style={{ borderColor: 'currentColor', borderRadius: 'inherit', transform: `rotate(${index * 15 + 30}deg)` }} aria-hidden="true" />
                <div className="absolute inset-2 border opacity-50 transition-colors duration-300" style={{ borderColor: 'currentColor', borderRadius: 'inherit', transform: `rotate(${-(index * 15 + 30)}deg)` }} aria-hidden="true" />
              </button>
              <p className={`mt-6 text-[11px] uppercase tracking-[0.3em] transition-colors duration-300 ${isOpen ? 'la-text-filament la-glow' : 'la-text-ceramic'}`}>{node.name}</p>
              <p className="la-sub mt-1 text-[10px]">near {node.near}</p>
              <div className="mt-4 min-h-[6rem] border-t border-[rgba(162,172,184,0.1)] w-full pt-4" aria-live="polite" style={{ opacity: isOpen || reduced ? 1 : 0, transition: 'opacity 600ms' }}>
                <p className="la-text-titanium text-sm leading-relaxed" data-testid={`text-node-${node.id}`} aria-hidden={!(isOpen || reduced)}>
                  {node.line}{node.href && <> <a href={node.href} target="_blank" rel="noreferrer" className="la-sub underline underline-offset-4 hover:text-white" tabIndex={isOpen || reduced ? 0 : -1}>See it</a></>}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}