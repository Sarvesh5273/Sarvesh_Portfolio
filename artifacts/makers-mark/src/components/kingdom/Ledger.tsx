import { useState } from 'react';
import { LedgerRecord } from '@/content/types';
import { BronzeMark } from './BronzeMark';

const PARCHMENT = `${import.meta.env.BASE_URL}assets/bridge-parchment.png`;

interface LedgerProps {
  title: string;
  records: LedgerRecord[];
  /** An older ledger, chiseled over, faintly legible beneath the current one. */
  older?: LedgerRecord[];
  size?: 'compact' | 'medium' | 'wide';
  className?: string;
  testId?: string;
}

export function Parchment({
  children,
  className = '',
  imgClassName = '',
  style,
  imgStyle,
}: {
  children: React.ReactNode;
  className?: string;
  imgClassName?: string;
  style?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
}) {
  return (
    <div className={`relative ${className}`} style={style}>
      <img
        src={PARCHMENT}
        alt=""
        className={`absolute inset-0 w-full h-full object-fill z-[-1] pointer-events-none opacity-95 ${imgClassName}`}
        style={imgStyle}
      />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}

/** A manuscript ledger. Lines are facts; the gloss is what they mean in plain words. */
export function Ledger({ title, records, older, size = 'medium', className = '', testId }: LedgerProps) {
  const [open, setOpen] = useState<number | null>(null);
  const sizeClass = {
    compact: 'max-w-[22rem]',
    medium: 'max-w-[27rem]',
    wide: 'max-w-[31rem]',
  }[size];
  return (
    <div className={`relative ${className} w-full ${sizeClass} mx-auto md:mx-0`} data-testid={testId}>
      {older && older.length > 0 && (
        <div
          className="k-ledger-prior relative mb-8 px-6 py-5 md:px-8"
          aria-hidden="true"
          data-testid="ledger-older"
        >
          <img
            src={PARCHMENT}
            className="absolute -inset-3 w-[106%] h-[116%] object-fill z-[-1] pointer-events-none"
            style={{ filter: 'drop-shadow(-6px 8px 14px rgba(0,0,0,0.42)) sepia(0.12)' }}
            alt=""
          />
          <div className="relative z-10">
            <p className="k-ink-text text-[9px] uppercase tracking-[0.4em] mb-4">
              an older ledger, scrawled beneath
            </p>
            <ul className="space-y-3">
              {older.map((rec, i) => (
                <li key={i} className="k-struck k-ink-text k-inscription text-sm md:text-base leading-relaxed">
                  {rec.line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="k-ledger-sheet relative px-6 py-9 md:px-10 md:py-11 z-10">
        <img
          src={PARCHMENT}
          className="absolute -inset-4 md:-inset-5 w-[110%] md:w-[112%] h-[115%] md:h-[118%] object-fill z-[-1] pointer-events-none"
          style={{ filter: 'drop-shadow(-10px 15px 25px rgba(0,0,0,0.65))' }}
          alt=""
        />
        <BronzeMark className="k-ledger-seal absolute right-5 top-5 z-20 h-9 w-9 pointer-events-none" corrosion={0.55} />
        <div className="relative z-10">
          <h3 className="k-ink-title pr-10 text-xl md:text-2xl leading-tight mb-6 uppercase tracking-widest" data-testid="ledger-title">
            {title}
          </h3>
          <ul className="space-y-1">
            {records.map((rec, i) => (
              <li key={i}>
                <button
                  type="button"
                  className="k-manuscript-row"
                  aria-expanded={rec.gloss ? open === i : undefined}
                  aria-label={rec.gloss ? `${rec.line} Show what this means.` : rec.line}
                  onClick={() => rec.gloss && setOpen((v) => (v === i ? null : i))}
                  data-testid={`ledger-line-${i}`}
                >
                  <span className="k-line k-ink-text block text-[15px] md:text-[17px] leading-relaxed">{rec.line}</span>
                  {rec.gloss && <span className="k-gloss k-ink-gloss block text-[13.5px] md:text-[14.5px] leading-relaxed mt-2">{rec.gloss}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** A compact parchment note form for a single record result. */
export function RecordStone({ text, testId }: { text: string; testId?: string }) {
  return (
    <div
      className="relative px-6 py-6 max-w-[14rem] flex flex-col items-center justify-center text-center mt-4"
      data-testid={testId}
    >
      <img
        src={PARCHMENT}
        className="absolute -inset-2 w-[115%] h-[120%] object-fill z-[-1] pointer-events-none"
        style={{ transform: 'rotate(1.5deg)', filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.5))' }}
        alt=""
      />
      <div className="relative z-10">
        <p className="k-ink-text text-[9px] uppercase tracking-[0.4em] mb-2" style={{ opacity: 0.7 }}>
          record
        </p>
        <p className="k-ink-text text-[13px] md:text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

/** A stamped scrap of parchment for evidence. */
export function FossilPage({ text, testId }: { text: string; testId?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      className="group relative block text-left outline-none mt-4 ml-2"
      aria-expanded={open}
      aria-label="A handprint stamped onto a scrap of parchment"
      onClick={() => setOpen((v) => !v)}
      data-testid={testId}
    >
      <div
        className="relative w-20 h-24 md:w-24 md:h-28 transition-transform duration-700 group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5"
        style={{ transform: 'rotate(4deg)' }}
        aria-hidden="true"
      >
        <img
          src={PARCHMENT}
          className="absolute -inset-2 w-[120%] h-[120%] object-fill z-[-1] pointer-events-none"
          style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))' }}
          alt=""
        />
        <svg viewBox="0 0 100 120" className="k-handprint-ink" fill="currentColor">
          <path d="M49.6,110.1 c-9.9-1.2-18.1-6.1-23.7-14.7 c-2.4-3.7-4.1-8.1-5.3-13.6 c-1.3-5.8-2.6-9.8-3.7-11.4 c-2.2-3.1-6.2-7-8.9-8.7 c-2.5-1.5-3.3-3.2-2.1-4.8 c1-1.3,2.4-1.6,4.6-0.8 c3.7,1.4,7.4,5,10.6,10.4 c1.2,2,2.3,3.3,2.6,3.1 c0.3-0.2-0.5-5.9-1.8-12.7 c-2-10-3.3-21.4-2.8-25.1 c0.6-4.5,4.7-6.2,7.2-3 c1.5,1.8,2,4,2,9.3 c0.1,6.5,1.2,16.5,2.4,22.7 l0.8,3.9 l0.5-5.4 c0.8-6.1,2.8-21.6,4-30.8 c0.9-6.9,2.1-10.4,4.2-12 c3-2.3,6.3-1.6,8.2,1.7 c1,1.7,1.1,3,0.9,11.5 c-0.2,7-0.9,15.6-1.5,19.2 l-1,6.5 l1.7-5.9 c2.1-7.2,5.2-17.6,7.5-24.9 c1.6-5.1,2.7-7.2,4.8-8.7 c3-2,6.4-1,8,2.3 c0.9,1.7,0.7,3.9-0.8,11.4 c-1.7,8.2-3.6,15.2-6.5,23.5 c-1.2,3.3-2.4,6.4-2.7,6.8 c-0.3,0.4,0.3-0.5,1.3-2.1 c3.6-5.8,7.9-12.2,9.4-14.1 c1.9-2.5,4.3-3.6,6.3-2.9 c2.1,0.7,3.1,2.5,2.7,4.8 c-0.4,2.5-3.4,6.6-8.9,12.2 c-9,8.4-14.3,16-16.7,24 c-2,6.7-2,14.6,0.1,19.7 c1.6,3.8,2.2,6.3,1.6,7.4 C55.3,110,51.8,110.4,49.6,110.1 z" />
        </svg>
      </div>
      <div
        className={`absolute right-0 top-full mt-4 w-[16rem] transition-all duration-700 z-20 ${
          open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0'
        }`}
      >
        <img
          src={PARCHMENT}
          className="absolute -inset-4 w-[120%] h-[140%] object-fill z-[-1] pointer-events-none"
          style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.7))', transform: 'rotate(-1deg)' }}
          alt=""
        />
        <p className="k-ink-text k-ink-gloss text-left text-[13px] leading-relaxed relative z-10">
          {text}
        </p>
      </div>
    </button>
  );
}
