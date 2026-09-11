import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { contact } from '@/content';

interface Props {
  done: boolean;
  reduced: boolean;
  onTurnPage: () => void;
}

type Phase = 'closed' | 'reading' | 'read';

export function StickyGate({ done, reduced, onTurnPage }: Props) {
  const [phase, setPhase] = useState<Phase>('closed');
  const turnRef = useRef<HTMLButtonElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase !== 'reading') return;
    const timer = window.setTimeout(() => setPhase('read'), reduced ? 0 : 900);
    return () => window.clearTimeout(timer);
  }, [phase, reduced]);

  useEffect(() => {
    if (phase === 'reading') noteRef.current?.focus();
    if (phase === 'read') turnRef.current?.focus();
  }, [phase]);

  useEffect(() => {
    if (phase === 'closed') return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !done) setPhase('closed');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, done]);

  const open = phase !== 'closed';
  return (
    <>
      <button
        type="button"
        className="pr-sticky-gate"
        onClick={() => setPhase('reading')}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="A sticky note on the screen. Read it."
        data-testid="button-read-sticky"
      >
        <span className="pr-hand-text">{contact.stickyNote}</span>
        <small>read</small>
      </button>
      {open && createPortal(
        <div className="pr-read-layer" data-testid="sticky-reading">
          <button type="button" className="pr-read-backdrop" aria-label="Put the note back" onClick={() => !done && setPhase('closed')} tabIndex={-1} />
          <div ref={noteRef} className={`pr-read-note ${phase === 'read' ? 'is-read' : ''}`} role="dialog" aria-modal="true" aria-label={contact.stickyNote} tabIndex={-1}>
            <div className="pr-sticky-large pr-hand-text">{contact.stickyNote}</div>
            <div className="pr-hello" aria-hidden={phase !== 'read'} data-testid="panel-contact">
              <p className="pr-hello-name">{contact.name}</p>
              <p className="pr-hello-identity">{contact.identity}</p>
              <p className="pr-hello-location">{contact.location}</p>
              <ul className="pr-hello-links">
                {contact.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} target={link.href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer" data-testid={`link-hello-${link.label.toLowerCase()}`} tabIndex={phase === 'read' ? 0 : -1}>
                      {link.label}{link.label === 'Email' && contact.email ? ` — ${contact.email}` : ''}
                    </a>
                  </li>
                ))}
              </ul>
              <button ref={turnRef} type="button" className="pr-turn" onClick={() => { setPhase('closed'); onTurnPage(); }} disabled={phase !== 'read'} data-testid="button-turn-page">
                <span className="pr-hand-text">Turn the page</span>
                <span className="pr-turn-hint">{done ? 'the last page is below' : 'the blank page from the start, finished'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}