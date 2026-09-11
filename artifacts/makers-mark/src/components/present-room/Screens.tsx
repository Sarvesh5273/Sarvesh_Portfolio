import { useState } from 'react';
import { structureById } from '@/content';
function PlaceholderTag({ label }: { label: string }) {
  return <span className="pr-placeholder-tag" aria-hidden="true">{label}</span>;
}

/**
 * What glows on the black screens. Both are live HTML, so they read as UI
 * rather than as pictures of UI; the real screenshots can replace them later.
 */

interface LaptopProps {
  onOpenTab: () => void;
}

/** ReelSense running, with PaperPilot open in the next tab. */
export function LaptopScreen({ onOpenTab }: LaptopProps) {
  const orchard = structureById.orchard;
  const [selected, setSelected] = useState<number | null>(null);
  // The explanations on screen are worded exactly like the Kingdom placards.
  const why = orchard.kingdom.ledger.map((l) => l.line);
  const rows = [
    { title: 'Recommendation 1', match: 0.92, why: why[0] },
    { title: 'Recommendation 2', match: 0.87, why: why[1] },
    { title: 'Recommendation 3', match: 0.81, why: why[2] },
  ];
  return (
    <div className="pr-screen pr-laptop-screen" data-placeholder="screenshot" data-testid="screen-laptop">
      <div className="pr-tabs" role="tablist" aria-label="Browser tabs">
        <span className="pr-tab is-active" role="tab" aria-selected="true">
          ReelSense — demo
        </span>
        <button
          type="button"
          role="tab"
          aria-selected="false"
          className="pr-tab pr-tab-button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenTab();
          }}
          data-testid="button-tab-paperpilot"
        >
          PaperPilot
        </button>
      </div>
      <div className="pr-screen-body">
        <div className="pr-rs-search">
          <span className="pr-rs-prompt">Liked something quiet. Not the usual suspects.</span>
        </div>
        <ul className="pr-rs-list">
          {rows.map((r) => (
            <li key={r.title}>
              <button
                type="button"
                className="pr-rs-row w-full text-left"
                aria-pressed={selected === rows.indexOf(r)}
                onClick={() => setSelected((value) => value === rows.indexOf(r) ? null : rows.indexOf(r))}
                style={{ outline: selected === rows.indexOf(r) ? '1px solid rgba(119, 151, 189, .7)' : undefined }}
              >
              <span className="pr-rs-poster" aria-hidden="true" />
              <span className="pr-rs-meta">
                <span className="pr-rs-title">{r.title}</span>
                <span className="pr-rs-why">{r.why}</span>
              </span>
              <span className="pr-rs-match">{Math.round(r.match * 100)}%</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[9px] uppercase tracking-[0.16em] text-[#7797bd]" aria-live="polite">
          {selected === null ? 'Select a recommendation to inspect its reasoning' : 'Reasoning kept visible'}
        </p>
      </div>
      <PlaceholderTag label="live screenshot" />
    </div>
  );
}

/** Recall AI mid-scan: the viewfinder over the ledger, rows resolving. */
export function PhoneScreen() {
  const [scanned, setScanned] = useState(false);
  return (
    <div className="pr-screen pr-phone-screen" data-placeholder="screenshot" data-testid="screen-phone">
      <div className="pr-phone-bar">
        <span>Recall AI</span>
        <span className="pr-phone-dot" aria-hidden="true" />
      </div>
      <div className="pr-viewfinder" aria-hidden="true">
        <div className="pr-ledger-page">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className="pr-ledger-line" style={{ width: `${55 + ((i * 37) % 40)}%` }} />
          ))}
        </div>
        <span className="pr-vf-corner tl" />
        <span className="pr-vf-corner tr" />
        <span className="pr-vf-corner bl" />
        <span className="pr-vf-corner br" />
        <span className="pr-scan-line" />
        <span className="pr-vf-box" style={{ top: '30%', left: '10%', width: '78%', height: '11%' }} />
        <span className="pr-vf-box" style={{ top: '46%', left: '10%', width: '70%', height: '11%' }} />
        <span className="pr-vf-box is-pending" style={{ top: '62%', left: '10%', width: '74%', height: '11%' }} />
      </div>
      <div className="pr-phone-sheet">
        <p className="pr-phone-status">{scanned ? 'Reading complete · 3 of 3 rows' : 'Reading ledger · 2 of 3 rows'}</p>
        <ul aria-hidden="true">
          {[0.6, 0.45, 0.72].map((w, i) => (
            <li key={i} className={`pr-phone-row ${i === 2 && !scanned ? 'is-pending' : ''}`}>
              <span className="pr-phone-name" style={{ width: `${w * 100}%` }} />
              <span className="pr-phone-qty" />
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="pr-phone-foot mt-1 w-full text-left"
          onClick={() => setScanned((value) => !value)}
          aria-pressed={scanned}
          data-testid="button-complete-scan"
        >
          {scanned ? 'scan complete · tap to replay' : 'tap to resolve the last row'}
        </button>
      </div>
    </div>
  );
}
