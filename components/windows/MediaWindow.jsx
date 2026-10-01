'use client';

import { useEffect, useRef, useState } from 'react';
import media from '@/data/media.json';

// Single point of access to media URLs, so we can later migrate to
// Cloudinary/R2/Drive without touching the UI.
const getMediaUrl = (path) => path;

const FOLDERS = [
  { id: 'fotos', label: 'Fotos', icon: '📷' },
  { id: 'videos', label: 'Videos', icon: '🎬' },
  { id: 'mezclas', label: 'Mezclas', icon: '🎚️' },
  { id: 'musica', label: 'Música', icon: '🎵' },
];

const btnStyle = {
  fontFamily: 'inherit',
  fontSize: 12,
  background: '#c0c0c0',
  border: 'none',
  marginBottom: 8,
  padding: '2px 8px',
  boxShadow: 'inset -1px -1px 0 #404040, inset 1px 1px 0 #fff',
  cursor: 'pointer',
};

const ctrlBtnStyle = {
  width: 34,
  height: 26,
  fontSize: 14,
  background: '#c0c0c0',
  color: '#000',
  border: 'none',
  cursor: 'pointer',
  boxShadow: 'inset -1px -1px 0 #404040, inset 1px 1px 0 #fff',
};

export default function MediaWindow() {
  const [current, setCurrent] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [videoIdx, setVideoIdx] = useState(null);

  const videoRef = useRef(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const fotos = media.fotos || [];
  const videos = media.videos || [];

  // Reset player state whenever we switch videos.
  useEffect(() => {
    setVideoLoaded(false);
    setVideoPlaying(false);
  }, [videoIdx]);

  const closeLightbox = () => setLightbox(null);
  const stepLightbox = (d) => {
    setLightbox((i) => {
      if (i == null) return i;
      return (i + d + fotos.length) % fotos.length;
    });
  };

  const loadAndPlayVideo = (item) => {
    const v = videoRef.current;
    if (!v || videoLoaded) return;
    v.src = getMediaUrl(item.src);
    setVideoLoaded(true);
    v.play().catch(() => {});
  };

  const toggleVideo = (item) => {
    const v = videoRef.current;
    if (!v) return;
    if (videoPlaying) {
      v.pause();
    } else {
      if (!videoLoaded) {
        loadAndPlayVideo(item);
      } else {
        v.play().catch(() => {});
      }
    }
  };

  const stepVideo = (d) => {
    setVideoIdx((i) => (i == null ? i : (i + d + videos.length) % videos.length));
  };

  // ── Video player view ──
  if (videoIdx != null && videos[videoIdx]) {
    const item = videos[videoIdx];
    return (
      <div>
        <button style={btnStyle} onClick={() => setVideoIdx(null)}>
          ◀ Volver
        </button>
        <div style={{ position: 'relative', background: '#000', marginBottom: 8 }}>
          <video
            key={videoIdx}
            ref={videoRef}
            poster={getMediaUrl(item.poster)}
            onClick={() => toggleVideo(item)}
            onPlay={() => setVideoPlaying(true)}
            onPause={() => setVideoPlaying(false)}
            onEnded={() => setVideoPlaying(false)}
            style={{ width: '100%', display: 'block', cursor: 'pointer' }}
            controls={false}
          />
          {!videoPlaying && (
            <button
              onClick={() => toggleVideo(item)}
              aria-label="Reproducir"
              style={{
                position: 'absolute',
                inset: 0,
                margin: 'auto',
                width: 48,
                height: 48,
                fontSize: 22,
                color: '#00ff41',
                background: 'rgba(0,0,0,0.55)',
                border: '2px solid #00ff41',
                cursor: 'pointer',
              }}
            >
              ▶
            </button>
          )}
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, marginBottom: 8 }}>
          {item.titulo}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <button style={ctrlBtnStyle} onClick={() => stepVideo(-1)} aria-label="Anterior">
            «
          </button>
          <button style={ctrlBtnStyle} onClick={() => toggleVideo(item)} aria-label="Reproducir/Pausar">
            {videoPlaying ? '❚❚' : '▶'}
          </button>
          <button style={ctrlBtnStyle} onClick={() => stepVideo(1)} aria-label="Siguiente">
            »
          </button>
        </div>
      </div>
    );
  }

  // ── Folder view ──
  if (current) {
    const folder = FOLDERS.find((f) => f.id === current);
    const items = media[current] || [];

    return (
      <div>
        <button style={btnStyle} onClick={() => setCurrent(null)}>
          ◀ Volver
        </button>
        {items.length === 0 ? (
          <div className="media-empty">
            {folder.label} — vacío por ahora. Próximamente subiré mi trabajo
            audiovisual.
          </div>
        ) : (
          <div className="media-folders">
            {items.map((item, i) => {
              const thumb = current === 'fotos' ? item.thumb : current === 'videos' ? item.poster : item.thumb;
              const label = item.titulo || `Archivo ${i + 1}`;

              if (current === 'fotos') {
                return (
                  <div
                    key={i}
                    className="media-folder"
                    onClick={() => setLightbox(i)}
                    title="Abrir"
                  >
                    <img
                      src={getMediaUrl(thumb)}
                      alt={label}
                      loading="lazy"
                      style={{ width: 84, height: 63, objectFit: 'cover' }}
                    />
                    <span className="mf-label">{label}</span>
                  </div>
                );
              }

              if (current === 'videos') {
                return (
                  <div
                    key={i}
                    className="media-folder"
                    onClick={() => setVideoIdx(i)}
                    title="Reproducir"
                  >
                    <img
                      src={getMediaUrl(item.poster)}
                      alt={label}
                      loading="lazy"
                      style={{ width: 84, height: 63, objectFit: 'cover' }}
                    />
                    <span className="mf-label">{label}</span>
                  </div>
                );
              }

              // mezclas / musica: list item (audio handled by PlayerWindow)
              return (
                <div key={i} className="media-folder">
                  <span className="mf-icon">{item.icon || '📄'}</span>
                  <span className="mf-label">{label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Root folder list ──
  return (
    <div className="media-folders">
      {FOLDERS.map((f) => (
        <div
          key={f.id}
          className="media-folder"
          onClick={() => setCurrent(f.id)}
        >
          <span className="mf-icon">{f.icon}</span>
          <span className="mf-label">{f.label}</span>
        </div>
      ))}

      {/* ── Image lightbox ── */}
      {lightbox != null && fotos[lightbox] && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '90%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <img
              src={getMediaUrl(fotos[lightbox].src)}
              alt={fotos[lightbox].titulo}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                border: '2px solid #c0c0c0',
                background: '#000',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <button
                style={ctrlBtnStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  stepLightbox(-1);
                }}
                aria-label="Anterior"
              >
                «
              </button>
              <span style={{ color: '#c8ffd4', fontSize: 12 }}>
                {lightbox + 1} / {fotos.length} — {fotos[lightbox].titulo}
              </span>
              <button
                style={ctrlBtnStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  stepLightbox(1);
                }}
                aria-label="Siguiente"
              >
                »
              </button>
              <button
                style={{ ...ctrlBtnStyle, width: 'auto', padding: '0 8px' }}
                onClick={closeLightbox}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
