'use client';

import { useEffect, useState } from 'react';

const btnStyle = {
  fontFamily: 'inherit',
  fontSize: 12,
  height: 24,
  padding: '0 10px',
  background: '#c0c0c0',
  color: '#000',
  border: 'none',
  boxShadow: 'inset -1px -1px 0 #404040, inset 1px 1px 0 #fff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

export default function BrowserWindow({ initialUrl = 'https://esencialesdetaller.com/' }) {
  const [url, setUrl] = useState(initialUrl);
  const [input, setInput] = useState(initialUrl);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    setUrl(initialUrl);
    setInput(initialUrl);
    setNonce((n) => n + 1);
  }, [initialUrl]);

  const go = () => {
    let u = input.trim();
    if (!u) return;
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    setUrl(u);
    setNonce((n) => n + 1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 6 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && go()}
          aria-label="Dirección"
          style={{
            flex: 1,
            fontFamily: 'inherit',
            fontSize: 12,
            height: 24,
            padding: '2px 6px',
            background: '#fff',
            color: '#000',
            border: 'none',
            boxShadow: 'inset -1px -1px 0 #fff, inset 1px 1px 0 #808080',
          }}
        />
        <button style={btnStyle} onClick={go}>
          Ir
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir en pestaña nueva"
          style={{ ...btnStyle, textDecoration: 'none' }}
        >
          ↗
        </a>
      </div>
      <div
        style={{
          flex: 1,
          position: 'relative',
          background: '#fff',
          boxShadow: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #fff',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <iframe
          key={nonce}
          src={url}
          title="Navegador coro-98"
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            fontSize: 10,
            background: 'rgba(6,6,6,0.8)',
            color: '#00ff41',
            padding: '1px 6px',
          }}
        >
          ¿No carga? Usa ↗ para abrir en pestaña nueva.
        </div>
      </div>
    </div>
  );
}
