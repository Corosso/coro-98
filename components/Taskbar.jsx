'use client';

import { useEffect, useState } from 'react';

export default function Taskbar({
  openApps,
  activeId,
  onStart,
  onToggleTask,
  onFocusTask,
  onAssistant,
}) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(
        d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      );
    };
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="taskbar">
      <button className="start-button" onClick={onStart}>
        <span className="start-flag">▦</span>
        Inicio
      </button>
      <div className="taskbar-divider" />
      <div className="taskbar-tasks">
        {openApps.map((app) => (
          <button
            key={app.id}
            className={`task-button ${app.id === activeId && !app.minimized ? 'active' : ''}`}
            onClick={() =>
              app.id === activeId && !app.minimized
                ? onToggleTask(app.id)
                : onFocusTask(app.id)
            }
          >
            <span className="task-icon">{app.icon}</span>
            <span>{app.title}</span>
          </button>
        ))}
      </div>
      <div className="taskbar-tray">
        <button className="tray-kernel" onClick={onAssistant} title="Abrir KERNEL">
          🤖
        </button>
        <span>🔊</span>
        <span>{time}</span>
      </div>
    </div>
  );
}
