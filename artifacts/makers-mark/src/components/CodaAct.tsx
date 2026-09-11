import { useEffect, useRef, useState } from 'react';
import { useVisitor } from '@/store/VisitorContext';
import { prefersReducedMotion } from '@/lib/scroll';
import { contact, structures, achievements, skills, discoveries } from '@/content';
import { SIGIL_SRC } from '@/components/Sigil';
import { getDoorway } from '@/content/doorways';
import codaBridge from '@/assets/gen/coda_bridge.webp';
import codaWell from '@/assets/gen/coda_well.webp';
import codaGate from '@/assets/gen/coda_gate.webp';
import codaOrchard from '@/assets/gen/coda_orchard.webp';

const PROJECT_MARKS: Record<string, string> = { bridge: codaBridge, well: codaWell, gate: codaGate, orchard: codaOrchard };

const resumeHref = `${import.meta.env.BASE_URL}${contact.resume.file}`;

/**
 * Act 5. The Coda. The blank page from the start comes back, and this time it
 * is written: a plain, conventional portfolio anyone can scan in a minute.
 */
export function CodaAct() {
  const { setActiveAct, recordEntry, chosenDoorway } = useVisitor();
  const ref = useRef<HTMLElement>(null);
  const [reduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActiveAct('coda');
          recordEntry('coda');
        }
      },
      { rootMargin: '-30% 0px -30% 0px', threshold: 0 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [setActiveAct, recordEntry]);

  // Reveal-on-scroll without a motion library: an observer flips data-revealed
  // once, and .coda-reveal in index.css does the rest.
  useEffect(() => {
    if (reduced || !ref.current) return;
    const items = Array.from(ref.current.querySelectorAll<HTMLElement>('.coda-reveal'));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.revealed = '';
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '-10% 0px' },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reduced]);

  const reveal = (delay = 0) =>
    reduced ? { className: '' } : { className: 'coda-reveal', style: { transitionDelay: `${delay}s` } };

  const alsoBuilt = discoveries.filter((d) => d.world !== 'presentRoom' || d.id === 'reelgap' || d.id === 'stargap');
  const doorway = getDoorway(chosenDoorway);
  const orderedStructures = doorway
    ? [...structures].sort((a, b) => Number(b.id === doorway.structure) - Number(a.id === doorway.structure))
    : structures;

  return (
    <section
      ref={ref}
      id="act-coda"
      data-testid="act-coda"
      aria-labelledby="coda-name"
      className="relative min-h-screen px-6 md:px-12 py-24 md:py-32 font-[family-name:var(--app-font-sans)]"
      style={{ backgroundColor: '#FCFDFD', color: '#0A0A0A' }}
    >
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <header className={`flex flex-col gap-6 ${reveal(0.1).className}`} style={reveal(0.1).style}>
          <img src={SIGIL_SRC} alt="The maker's mark, finished." className="w-14 h-14 object-contain" draggable={false} />
          <div>
            <h2 id="coda-name" className="text-4xl md:text-5xl font-semibold tracking-tight" data-testid="text-coda-name">
              {contact.name}
            </h2>
            <p className="mt-3 text-lg md:text-xl leading-relaxed text-[#3f3f46] max-w-2xl" data-testid="text-coda-identity">
              {contact.identity}
            </p>
            <p className="mt-1 text-sm text-[#71717a]">{contact.location}</p>
          </div>
          <nav aria-label="Contact" className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium">
            {contact.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="underline underline-offset-4 decoration-black/25 hover:decoration-black"
                data-testid={`link-coda-${link.label.toLowerCase()}`}
              >
                {link.label}
              </a>
            ))}
            <a
              href={resumeHref}
              download
              className="inline-flex items-center gap-2 border border-[#0A0A0A] px-3.5 py-2 hover:bg-[#0A0A0A] hover:text-[#FCFDFD] transition-colors"
              data-testid="link-coda-resume"
            >
                            {contact.resume.label}
            </a>
          </nav>
        </header>

        {/* Projects */}
        <section className={`mt-20 md:mt-24 ${reveal(0.15).className}`} style={reveal(0.15).style} aria-labelledby="coda-projects">
          <SectionTitle id="coda-projects">Featured projects</SectionTitle>
          {doorway && (
            <p className="mt-4 text-sm text-[#3f3f46]" data-testid="text-coda-doorway-order">
              You came in through {doorway.name.toLowerCase()}, so the {structures.find((s) => s.id === doorway.structure)?.storyName.replace(/^The /, '')} comes first.
            </p>
          )}
          <ul className="mt-8 grid gap-x-10 gap-y-10 md:grid-cols-2">
            {orderedStructures.map((s) => (
              <li key={s.id} className="flex flex-col" data-testid={`coda-project-${s.id}`}>
                <img src={PROJECT_MARKS[s.id]} alt="" aria-hidden="true" className="mb-4 h-24 w-auto self-start object-contain" draggable={false} />
                <h4 className="text-xl font-semibold tracking-tight">
                  {s.presentRoom.name}
                  {s.presentRoom.unfinished && (
                    <span className="ml-2 align-middle text-[11px] font-medium uppercase tracking-[0.14em] text-[#71717a]">ongoing</span>
                  )}
                </h4>
                <p className="mt-2 text-[15px] leading-relaxed text-[#3f3f46]">{s.presentRoom.description}</p>
                <p className="mt-3 font-[family-name:var(--app-font-mono)] text-xs text-[#71717a] leading-relaxed">
                  {s.presentRoom.stack.join(' · ')}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium">
                  {s.presentRoom.links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 decoration-black/25 hover:decoration-black"
                    >
                      {l.label}
                      <span aria-hidden="true" className="text-[#a1a1aa]"> ↗</span>
                    </a>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Achievements */}
        <section className={`mt-20 ${reveal(0.1).className}`} style={reveal(0.1).style} aria-labelledby="coda-achievements">
          <SectionTitle id="coda-achievements">Achievements</SectionTitle>
          <ul className="mt-6 divide-y divide-black/10">
            {achievements.map((a) => (
              <li key={a.id} className="grid grid-cols-[3.5rem_1fr] gap-4 py-3 text-[15px]" data-testid={`coda-achievement-${a.id}`}>
                <span className="font-[family-name:var(--app-font-mono)] text-xs text-[#71717a] pt-1">{a.year}</span>
                <span>
                  <strong className="font-semibold">{a.title}</strong>
                  <span className="text-[#3f3f46]"> — {a.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Also built */}
        <section className={`mt-20 ${reveal(0.1).className}`} style={reveal(0.1).style} aria-labelledby="coda-also">
          <SectionTitle id="coda-also">Also built</SectionTitle>
          <ul className="mt-6 grid gap-x-10 gap-y-4 md:grid-cols-2 text-[15px]">
            {alsoBuilt.map((d) => (
              <li key={d.id} className="leading-relaxed">
                {d.href ? (
                  <a href={d.href} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4 decoration-black/25 hover:decoration-black">
                    {d.name}
                  </a>
                ) : (
                  <span className="font-semibold">{d.name}</span>
                )}
                <span className="text-[#3f3f46]"> — {d.description}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Skills */}
        <section className={`mt-20 ${reveal(0.1).className}`} style={reveal(0.1).style} aria-labelledby="coda-skills">
          <SectionTitle id="coda-skills">Skills</SectionTitle>
          <ul className="mt-6 flex flex-wrap gap-2">
            {skills.map((s) => (
              <li key={s} className="border border-black/15 px-3 py-1.5 text-sm">
                {s}
              </li>
            ))}
          </ul>
        </section>

        <footer className={`mt-24 flex flex-wrap items-end justify-between gap-6 border-t border-black/10 pt-8 text-sm text-[#71717a] ${reveal(0.1).className}`} style={reveal(0.1).style}>
          <div>
            <p>
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="underline underline-offset-4 decoration-black/25 hover:decoration-black text-[#0A0A0A]">
                  {contact.email}
                </a>
              )}
            </p>
            <p className="mt-1 font-[family-name:var(--app-font-serif)] italic">{contact.stickyNote}</p>
          </div>
          <img src={SIGIL_SRC} alt="" aria-hidden="true" className="w-8 h-8 object-contain" draggable={false} />
        </footer>
      </div>
    </section>
  );
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#71717a]">
      {children}
    </h3>
  );
}
