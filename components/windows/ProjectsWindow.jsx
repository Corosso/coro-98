'use client';

import projects from '@/data/projects.json';

export default function ProjectsWindow({ onOpenDemo }) {
  return (
    <div className="project-list">
      {projects.map((p) => (
        <div className="project-card" key={p.slug}>
          <img src={p.image} alt={p.name} loading="lazy" />
          <div className="project-card-body">
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <div className="project-tags">
              {p.tech.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="project-links">
              {p.demo && onOpenDemo && (
                <a
                  href={p.demo}
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenDemo(p.demo, !!p.demoInBrowser);
                  }}
                >
                  Probar demo ↗
                </a>
              )}
              {p.demo && !onOpenDemo && (
                <a href={p.demo} target="_blank" rel="noopener noreferrer">
                  Probar demo ↗
                </a>
              )}
              {p.landing && (
                <a href={p.landing} target="_blank" rel="noopener noreferrer">
                  Landing ↗
                </a>
              )}
              {p.github && (
                <a href={p.github} target="_blank" rel="noopener noreferrer">
                  Código ↗
                </a>
              )}
              {!p.demo && !p.landing && !p.github && (
                <span style={{ fontSize: 11, color: '#888' }}>
                  Demo próximamente
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
