'use client';

import { useState } from 'react';

export default function Gate({ progress, site, onEnter }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pct = progress.total
    ? Math.round((progress.loaded / progress.total) * 100)
    : 100;

  const submit = async () => {
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Ingresa un correo válido.');
      return;
    }
    setError('');
    setSubmitting(true);
    await onEnter(value);
    setSubmitting(false);
  };

  return (
    <div className="gate">
      <div className="gate-dialog">
        <div className="title-bar" style={{ display: 'flex', alignItems: 'center', padding: '2px 3px', background: 'linear-gradient(90deg,#001f09,#00330f)', color: '#c8ffd4' }}>
          <span className="title-bar-text">Acceder a {site.osName}</span>
          <div className="title-bar-controls">
            <button aria-label="Cerrar" style={{ width: 16, height: 14, background: '#c0c0c0', border: 'none' }}>✕</button>
          </div>
        </div>
        <div className="window-body">
          <div className="gate-logo">
            <div className="fr-badge">{site.initials}</div>
            <div>
              <div className="gate-title">{site.name}</div>
              <div className="gate-sub">{site.tagline}</div>
            </div>
          </div>

          <p style={{ fontSize: 12, lineHeight: 1.4 }}>
            Bienvenido. Ingresa tu correo para entrar al sistema.
          </p>

          <div className="gate-field">
            <label>Correo electrónico</label>
            <input
              className="gate-input"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              autoFocus
            />
          </div>

          <div className="gate-progress">
            <div className="gate-progress-track">
              <div className="gate-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="gate-progress-label">
              Cargando sistema… {progress.loaded}/{progress.total || '—'}
            </div>
          </div>

          <div className="gate-error">{error}</div>

          <div className="gate-actions">
            <button onClick={submit} disabled={submitting}>
              {submitting ? '…' : 'Entrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
