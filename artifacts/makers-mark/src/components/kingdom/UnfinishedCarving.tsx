import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

const START_PROGRESS = 0.3;

interface UnfinishedCarvingProps {
  interactive?: boolean;
  reduced?: boolean;
  onComplete?: () => void;
  completed?: boolean;
  className?: string;
}

export function UnfinishedCarving({ interactive = false, reduced = false, onComplete, completed = false, className }: UnfinishedCarvingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(completed ? 1 : START_PROGRESS);
  const [dragging, setDragging] = useState(false);
  const progressRef = useRef(progress);
  const doneRef = useRef(completed);
  const p = completed ? 1 : progress;

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    progressRef.current = 1;
    setProgress(1);
    onComplete?.();
  }, [onComplete]);

  const advanceTo = useCallback((target: number) => {
    if (doneRef.current) return;
    const next = Math.max(progressRef.current, Math.min(target, progressRef.current + 0.08));
    progressRef.current = next;
    setProgress(next);
    if (next >= 0.985) finish();
  }, [finish]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);
    const points = [
      [width * 0.17, height * 0.5],
      [width * 0.5, height * 0.16],
      [width * 0.83, height * 0.5],
      [width * 0.5, height * 0.84],
    ] as const;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(0,0,0,.72)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    ctx.quadraticCurveTo(width * 0.3, height * 0.16, ...points[1]);
    ctx.quadraticCurveTo(width * 0.7, height * 0.16, ...points[2]);
    ctx.quadraticCurveTo(width * 0.7, height * 0.84, ...points[3]);
    ctx.stroke();
    const start = points[3];
    const end = points[0];
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = 'rgba(44,30,22,.6)';
    ctx.beginPath();
    ctx.moveTo(...start);
    ctx.lineTo(...end);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(27,14,7,.8)';
    ctx.beginPath();
    ctx.moveTo(...start);
    ctx.lineTo(start[0] + (end[0] - start[0]) * p, start[1] + (end[1] - start[1]) * p);
    ctx.stroke();
    const labels = ['memory', 'reflection', 'feeling', 'time'];
    points.forEach(([x, y], i) => {
      ctx.fillStyle = 'rgba(44,30,22,.8)';
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(27,14,7,.8)';
      ctx.font = '11px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i].toUpperCase(), x, y + 30);
    });
  }, [p]);

  const positionFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = rootRef.current!.getBoundingClientRect();
    const start = { x: rect.width * 0.5, y: rect.height * 0.84 };
    const end = { x: rect.width * 0.17, y: rect.height * 0.5 };
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return ((x - start.x) * dx + (y - start.y) * dy) / (dx * dx + dy * dy);
  };

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive || doneRef.current) return;
    if (event.key.startsWith('Arrow')) {
      event.preventDefault();
      advanceTo(progressRef.current + 0.08);
    } else if (event.key === 'End') {
      event.preventDefault();
      finish();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      finish();
    }
  };

  return (
    <div
      ref={rootRef}
      className={`k-carving-canvas relative ${className ?? ''}`}
      role="group"
      aria-label="An unfinished carving: memory, reflection, feeling, time. The last groove stops where a chisel rests."
      data-testid="unfinished-carving"
      data-progress={p.toFixed(2)}
      data-complete={p >= 0.985 || undefined}
    >
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
      {p < 0.985 && (
        <div
          className="k-chisel"
          onPointerDown={(event) => {
            if (!interactive) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
          }}
          onPointerMove={(event) => dragging && interactive && advanceTo(positionFromPointer(event))}
          onPointerUp={(event) => {
            setDragging(false);
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => setDragging(false)}
          onKeyDown={onKey}
          tabIndex={interactive ? 0 : undefined}
          role={interactive ? 'slider' : undefined}
          aria-label={interactive ? 'The chisel. Drag along the groove, or press the arrow keys, to finish the last stroke.' : undefined}
          aria-valuemin={interactive ? 0 : undefined}
          aria-valuemax={interactive ? 100 : undefined}
          aria-valuenow={interactive ? Math.round(p * 100) : undefined}
          data-testid="carving-chisel"
          style={{
            left: `${50 + (17 - 50) * p}%`,
            top: `${84 + (50 - 84) * p}%`,
            transition: dragging || reduced ? 'none' : 'left 120ms linear, top 120ms linear',
          }}
        >
          <span className="k-chisel-blade" />
          <span className="k-chisel-handle" />
        </div>
      )}
      <span className="sr-only" data-testid="carving-last-groove">The final groove</span>
    </div>
  );
}