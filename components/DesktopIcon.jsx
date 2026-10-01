'use client';

export default function DesktopIcon({ app, selected, onSelect, onOpen }) {
  return (
    <div
      className={`desktop-icon ${selected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(app.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onOpen(app.id);
      }}
    >
      <span className="icon-glyph">{app.icon}</span>
      <span className="icon-label">{app.label || app.title}</span>
    </div>
  );
}
