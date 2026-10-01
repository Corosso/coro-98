'use client';

import { useEffect, useRef } from 'react';

const CHARS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&|_=+-<>';

function rand(min, max) {
  return min + Math.random() * (max - min);
}
function randChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

export default function MatrixRain({ className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const FS = 13;
    let streams = [];
    let intervalId;

    function makeStream() {
      const len = Math.floor(rand(8, 24));
      return {
        head: rand(-60, 0),
        len,
        speed: rand(0.18, 0.55),
        chars: Array.from({ length: len + 2 }, randChar),
      };
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.fillStyle = '#060606';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const cols = Math.floor(canvas.width / FS);
      streams = Array.from({ length: cols }, makeStream);
    }
    resize();
    window.addEventListener('resize', resize);

    function tick() {
      ctx.fillStyle = 'rgba(6,6,6,0.10)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${FS}px 'Share Tech Mono', monospace`;

      streams.forEach((s, col) => {
        const x = col * FS;
        for (let row = 0; row < s.len; row++) {
          const y = (s.head - row) * FS;
          if (y < -FS || y > canvas.height + FS) continue;
          const ratio = 1 - row / s.len;

          if (row === 0) {
            ctx.shadowColor = '#00ff41';
            ctx.shadowBlur = 10;
            ctx.fillStyle = `rgba(200,255,215,${rand(0.5, 0.7)})`;
          } else if (row === 1) {
            ctx.shadowColor = '#00ff41';
            ctx.shadowBlur = 4;
            ctx.fillStyle = 'rgba(0,255,65,.55)';
          } else {
            ctx.shadowBlur = 0;
            const g = Math.floor(55 + ratio * 180);
            const a = 0.04 + ratio * 0.4;
            ctx.fillStyle = `rgba(0,${g},${Math.floor(ratio * 35)},${a})`;
          }

          if (Math.random() < 0.022) s.chars[row] = randChar();
          ctx.fillText(s.chars[row], x, y);
        }

        ctx.shadowBlur = 0;
        s.head += s.speed;
        if ((s.head - s.len) * FS > canvas.height) {
          streams[col] = makeStream();
          streams[col].head = rand(-50, 0);
        }
      });
    }

    intervalId = setInterval(tick, 33);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}
