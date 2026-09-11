import type { ReactNode } from 'react';
import type { StructureId } from '@/content/types';
import { DoorwayLeadTag } from '@/components/DoorwayLeadTag';

export const FUTURE_MAT = {
  bg: '#10272D',
  ceramic: '#FAFCFF',
  titanium: '#A2ACB8',
  titaniumDim: 'rgba(162, 172, 184, 0.5)',
  filament: '#FB7185',
  filamentDim: 'rgba(64, 224, 208, 0.3)',
  glow: 'rgba(64, 224, 208, 0.2)',
} as const;

interface Props {
  structureId: StructureId;
  panelSide?: 'left' | 'right';
  children?: ReactNode;
}

export function SceneMedia({ structureId, panelSide = 'left', children }: Props) {
  return (
    <div className={`relative flex min-h-[min(62vh,36rem)] w-full items-end md:items-center ${panelSide === 'left' ? 'justify-start' : 'justify-end'}`}>
      <div
        className="la-scene-panel relative z-10 w-full max-w-[30rem] p-6 md:p-8"
        data-lenis-prevent
        style={{
          background:
            panelSide === 'left'
              ? 'linear-gradient(90deg, rgba(8,20,23,.92), rgba(8,20,23,.76) 85%, rgba(8,20,23,.5))'
              : 'linear-gradient(270deg, rgba(8,20,23,.92), rgba(8,20,23,.76) 85%, rgba(8,20,23,.5))',
          borderLeft: panelSide === 'left' ? '1px solid rgba(162,172,184,0.1)' : 'none',
          borderRight: panelSide === 'right' ? '1px solid rgba(162,172,184,0.1)' : 'none',
          backdropFilter: 'blur(2px)',
        }}
      >
        <DoorwayLeadTag structureId={structureId} className="la-text-titanium" />
        {children}
      </div>
    </div>
  );
}