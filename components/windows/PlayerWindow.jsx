'use client';

import { useEffect, useRef, useState } from 'react';
import media from '@/data/media.json';

// Single point of access to media URLs, so we can later migrate to
// Cloudinary/R2/Drive without touching the UI.
const getMediaUrl = (path) => path;

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

export default function PlayerWindow() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [idx, setIdx] = useState(0);

  const playlist = [
    ...(media.musica || []).map((m) => ({ ...m, tipo: 'musica' })),
    ...(media.mezclas || []).map((m) => ({ ...m, tipo: 'mezcla' })),
  ];

  const track = playlist[idx];
  const hasTracks = playlist.length > 0;

  useEffect(() => {
    setLoaded(false);
    setPlaying(false);
  }, [idx]);

  useEffect(() => {
    return () => {
      const a = audioRef.current;
      if (a) a.pause();
    };
  }, []);

  const playTrack = () => {
    const a = audioRef.current;
    if (!a || !track) return;
    if (!loaded) {
      a.src = getMediaUrl(track.src);
      setLoaded(true);
    }
    a.play().catch(() => {});
  };

  const toggle = () => {
    const a = audioRef.current;
    if (!a || !track) return;
    if (playing) {
      a.pause();
    } else {
      playTrack();
    }
  };

  const step = (d) => {
    if (!hasTracks) return;
    setIdx((i) => (i + d + playlist.length) % playlist.length);
  };

  const title = track ? track.titulo : 'Sin pista';
  const subtitle = track
    ? track.tipo === 'musica'
      ? track.artista || 'Artista desconocido'
      : 'Mezcla'
    : 'Próximamente: mis mezclas y música';

  return (
    <div className="player-body">
      <audio
        ref={audioRef}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <div className="player-art">
        {track && track.cover ? (
          <img
            src={getMediaUrl(track.cover)}
            alt={title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span>{playing ? '🎵' : '💿'}</span>
        )}
      </div>
      <div className="player-track">
        <strong>{title}</strong>
        <br />
        <span style={{ fontSize: 11, color: '#555' }}>{subtitle}</span>
        {hasTracks && (
          <span style={{ fontSize: 11, color: '#555' }}>
            {' '}
            · {idx + 1}/{playlist.length}
          </span>
        )}
      </div>
      <div className="player-controls">
        <button style={ctrlBtnStyle} onClick={() => step(-1)} disabled={!hasTracks} aria-label="Anterior">
          «
        </button>
        <button style={ctrlBtnStyle} onClick={toggle} disabled={!hasTracks} aria-label="Reproducir/Pausar">
          {playing ? '❚❚' : '▶'}
        </button>
        <button style={ctrlBtnStyle} onClick={() => step(1)} disabled={!hasTracks} aria-label="Siguiente">
          »
        </button>
      </div>
    </div>
  );
}
