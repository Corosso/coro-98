'use client';

export default function StartMenu({ apps, site, onOpenApp, onShutDown }) {
  return (
    <div className="start-menu">
      <div className="start-menu-banner">
        <span>FRF-98</span>
      </div>
      <div className="start-menu-items">
        {apps.map((app) => (
          <button
            key={app.id}
            className="start-menu-item"
            onClick={() => onOpenApp(app.id)}
          >
            <span className="mi-icon">{app.icon}</span>
            <span>{app.menuLabel || app.title}</span>
          </button>
        ))}
        <div className="start-menu-sep" />
        <button className="start-menu-item" onClick={onShutDown}>
          <span className="mi-icon">⏻</span>
          <span>Apagar…</span>
        </button>
      </div>
    </div>
  );
}
