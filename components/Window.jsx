'use client';

import { useState } from 'react';

export default function Window({
  app,
  isActive,
  isMinimized,
  isMaximized,
  zIndex,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  children,
}) {
  const [pos, setPos] = useState(app.defaultPos || { x: 60, y: 40 });
  const [prev, setPrev] = useState(null);

  const startDrag = (e) => {
    if (e.target.closest('.title-bar-controls')) return;
    onFocus();
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = pos.x;
    const origY = pos.y;
    const move = (ev) => {
      const w = app.width || 320;
      setPos({
        x: Math.max(-(w - 80), origX + ev.clientX - startX),
        y: Math.max(0, origY + ev.clientY - startY),
      });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const toggleMax = () => {
    if (isMaximized) {
      setPos(prev || { x: 60, y: 40 });
      setPrev(null);
    } else {
      setPrev(pos);
    }
    onMaximize();
  };

  if (isMinimized) return null;

  const style = isMaximized
    ? { left: 0, top: 0, width: '100%', height: 'calc(100% - 36px)', zIndex }
    : {
        left: pos.x,
        top: pos.y,
        width: app.width || 320,
        height: app.height || 280,
        zIndex,
      };

  return (
    <div
      className={`win98-window ${isActive ? 'active' : ''}`}
      style={style}
      onPointerDown={onFocus}
    >
      <div className="title-bar" onPointerDown={startDrag} onDoubleClick={toggleMax}>
        <span className="title-bar-icon">{app.icon}</span>
        <span className="title-bar-text">{app.title}</span>
        <div className="title-bar-controls" onPointerDown={(e) => e.stopPropagation()}>
          <button aria-label="Minimizar" onClick={onMinimize}>
            _
          </button>
          <button aria-label="Maximizar" onClick={toggleMax}>
            {isMaximized ? '❐' : '□'}
          </button>
          <button className="close" aria-label="Cerrar" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>
      <div className="window-body">{children}</div>
    </div>
  );
}
