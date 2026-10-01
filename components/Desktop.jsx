'use client';

import { useEffect, useState } from 'react';
import MatrixRain from './MatrixRain';
import Window from './Window';
import DesktopIcon from './DesktopIcon';
import Taskbar from './Taskbar';
import StartMenu from './StartMenu';
import Gate from './Gate';
import AboutWindow from './windows/AboutWindow';
import ProjectsWindow from './windows/ProjectsWindow';
import MediaWindow from './windows/MediaWindow';
import PlayerWindow from './windows/PlayerWindow';
import ContactWindow from './windows/ContactWindow';
import BrowserWindow from './windows/BrowserWindow';
import site from '@/data/site.json';
import projects from '@/data/projects.json';

const APPS = [
  { id: 'about', title: 'info.txt — Sobre mí', label: 'Sobre mí', icon: '📄', width: 430, height: 470, Component: AboutWindow },
  { id: 'projects', title: 'Mis Proyectos', label: 'Proyectos', icon: '📁', width: 540, height: 490, Component: ProjectsWindow },
  { id: 'media', title: 'Audiovisual', label: 'Audiovisual', icon: '🎬', width: 420, height: 360, Component: MediaWindow },
  { id: 'player', title: 'Reproductor', label: 'Reproductor', icon: '🎵', width: 320, height: 290, Component: PlayerWindow },
  { id: 'contact', title: 'Contacto', label: 'Contacto', icon: '✉️', width: 380, height: 420, Component: ContactWindow },
  { id: 'browser', title: 'Navegador', label: 'Navegador', icon: '🌐', width: 900, height: 620, Component: BrowserWindow },
];

export default function Desktop() {
  const [open, setOpen] = useState({});
  const [order, setOrder] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [startOpen, setStartOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [shutdown, setShutdown] = useState(false);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });
  const [browserUrl, setBrowserUrl] = useState('https://esencialesdetaller.com/');

  // preload demos/thumbnails behind the gate
  useEffect(() => {
    const images = projects.map((p) => p.image).filter(Boolean);
    setProgress({ loaded: 0, total: images.length });

    const origins = new Set();
    projects.forEach((p) => {
      ['demo', 'landing', 'github'].forEach((k) => {
        if (p[k]) {
          try {
            origins.add(new URL(p[k]).origin);
          } catch {}
        }
      });
    });
    origins.forEach((origin) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      document.head.appendChild(link);
    });

    if (images.length === 0) return;
    let loaded = 0;
    images.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded += 1;
        setProgress({ loaded, total: images.length });
      };
      img.src = src;
    });
  }, []);

  // returning visitors skip the gate
  useEffect(() => {
    try {
      if (localStorage.getItem('frf98-email')) setEntered(true);
    } catch {}
  }, []);

  const focusApp = (id) => {
    setOrder((prev) => [...prev.filter((x) => x !== id), id]);
    setActiveId(id);
  };

  const openApp = (id) => {
    setStartOpen(false);
    setOpen((prev) =>
      prev[id]
        ? { ...prev, [id]: { ...prev[id], minimized: false } }
        : { ...prev, [id]: { minimized: false, maximized: false } }
    );
    focusApp(id);
  };

  const closeApp = (id) => {
    const nextOrder = order.filter((x) => x !== id);
    setOrder(nextOrder);
    setOpen((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    if (activeId === id) setActiveId(nextOrder[nextOrder.length - 1] || null);
  };

  const minimizeApp = (id) => {
    setOpen((prev) => ({ ...prev, [id]: { ...prev[id], minimized: true } }));
    if (activeId === id) {
      const visible = order.filter((x) => x !== id && !open[x]?.minimized);
      setActiveId(visible[visible.length - 1] || null);
    }
  };

  const maximizeApp = (id) => {
    setOpen((prev) => ({
      ...prev,
      [id]: { ...prev[id], maximized: !prev[id].maximized },
    }));
  };

  const restoreAndFocus = (id) => {
    setOpen((prev) =>
      prev[id]
        ? { ...prev, [id]: { ...prev[id], minimized: false } }
        : prev
    );
    focusApp(id);
  };

  const handleEnter = async (email) => {
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {}
    try {
      localStorage.setItem('frf98-email', email);
    } catch {}
    setEntered(true);
  };

  const openDemo = (url, inBrowser) => {
    if (inBrowser || (url && url.startsWith('/'))) {
      setBrowserUrl(url);
      openApp('browser');
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const taskApps = order.map((id) => {
    const app = APPS.find((a) => a.id === id);
    return { ...app, minimized: open[id]?.minimized || false };
  });

  return (
    <div
      className="desktop"
      onPointerDown={() => {
        setSelectedId(null);
        setStartOpen(false);
      }}
    >
      <div className="desktop-wallpaper">
        <MatrixRain />
      </div>

      <div className="desktop-icons">
        {APPS.map((app) => (
          <DesktopIcon
            key={app.id}
            app={app}
            selected={selectedId === app.id}
            onSelect={setSelectedId}
            onOpen={openApp}
          />
        ))}
      </div>

      {order.map((id) => {
        const app = APPS.find((a) => a.id === id);
        const st = open[id];
        const Comp = app.Component;
        let content = <Comp />;
        if (id === 'browser') content = <BrowserWindow initialUrl={browserUrl} />;
        else if (id === 'projects') content = <ProjectsWindow onOpenDemo={openDemo} />;
        return (
          <Window
            key={id}
            app={app}
            isActive={activeId === id}
            isMinimized={st.minimized}
            isMaximized={st.maximized}
            zIndex={10 + order.indexOf(id)}
            onFocus={() => focusApp(id)}
            onClose={() => closeApp(id)}
            onMinimize={() => minimizeApp(id)}
            onMaximize={() => maximizeApp(id)}
          >
            {content}
          </Window>
        );
      })}

      {startOpen && (
        <div onPointerDown={(e) => e.stopPropagation()}>
          <StartMenu
            apps={APPS}
            site={site}
            onOpenApp={openApp}
            onShutDown={() => {
              setStartOpen(false);
              setShutdown(true);
            }}
          />
        </div>
      )}

      <div onPointerDown={(e) => e.stopPropagation()}>
        <Taskbar
          openApps={taskApps}
          activeId={activeId}
          onStart={() => setStartOpen((s) => !s)}
          onToggleTask={minimizeApp}
          onFocusTask={restoreAndFocus}
        />
      </div>

      {!entered && <Gate progress={progress} site={site} onEnter={handleEnter} />}

      {shutdown && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            background: '#000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
            color: '#ffa500',
            fontFamily: 'var(--font-display), monospace',
            fontSize: 24,
          }}
        >
          <span>Ya es seguro apagar el equipo.</span>
          <button
            onClick={() => setShutdown(false)}
            style={{
              fontFamily: 'inherit',
              fontSize: 16,
              padding: '4px 16px',
              background: '#ffa500',
              color: '#000',
              border: 'none',
            }}
          >
            Volver a encender
          </button>
        </div>
      )}
    </div>
  );
}
