import React, { useState } from 'react';
import { createPortal } from 'react-dom';
// @ts-ignore
import { useControl } from 'react-map-gl/maplibre';
import { useGameStore } from '../../store/gameStore';

interface CameraModeControlProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const CameraModeControl: React.FC<CameraModeControlProps> = ({ position = 'top-right' }) => {
  const cameraMode = useGameStore((state) => state.cameraMode);
  const setCameraMode = useGameStore((state) => state.setCameraMode);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useControl(
    () => ({
      onAdd: () => {
        const el = document.createElement('div');
        el.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        setContainer(el);
        return el;
      },
      onRemove: () => {
        setContainer(null);
      }
    }),
    { position }
  );

  if (!container) return null;

  return createPortal(
    <button
      type="button"
      className={`maplibregl-ctrl-camera transition-colors ${
        cameraMode === 'fpv'
          ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
          : 'text-gray-700 hover:text-black hover:bg-black/5'
      }`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '29px',
        height: '29px',
        padding: 0,
        margin: 0,
        lineHeight: 0,
      }}
      title={
        cameraMode === 'fpv'
          ? 'Đang ở Góc nhìn thứ 1 (FPS) - Bấm để chuyển sang Góc nhìn thứ 3'
          : 'Đang ở Góc nhìn thứ 3 - Bấm để chuyển sang Góc nhìn thứ 1 (FPS)'
      }
      aria-label="Chuyển đổi góc nhìn"
      onClick={() => setCameraMode(cameraMode === 'fpv' ? 'tpv' : 'fpv')}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {cameraMode === 'fpv' ? (
          // Icon máy quay để chuyển sang góc nhìn thứ 3 (TPV)
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ display: 'block', margin: 'auto' }}
          >
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        ) : (
          // Icon con mắt để chuyển sang góc nhìn thứ nhất (FPV)
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ display: 'block', margin: 'auto' }}
          >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </span>
    </button>,
    container
  );
};
