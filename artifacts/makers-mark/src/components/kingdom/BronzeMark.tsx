import { SIGIL_SRC } from '@/components/Sigil';

interface BronzeMarkProps {
  className?: string;
  corrosion?: number;
  strokeWidth?: number;
  title?: string;
}

export function BronzeMark({ className, corrosion = 0.6, title }: BronzeMarkProps) {
  return (
    <img
      src={SIGIL_SRC}
      className={className}
      alt={title ?? ''}
      aria-hidden={title ? undefined : true}
      data-testid="bronze-mark"
      style={{
        opacity: 0.88,
        filter: `sepia(1) saturate(${1.4 - corrosion * 0.3}) hue-rotate(${55 + corrosion * 18}deg) drop-shadow(1px 2px 2px rgba(0,0,0,.7))`,
      }}
    />
  );
}