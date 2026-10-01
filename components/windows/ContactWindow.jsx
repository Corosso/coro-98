'use client';

import { useState } from 'react';

export default function ContactWindow() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);

  const submit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus({ ok: false, text: 'Ingresa un correo válido.' });
      return;
    }
    setStatus(null);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          subject: subject.trim() || 'Contacto FRF-98',
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ ok: true, text: 'Mensaje enviado. ¡Gracias!' });
        setMessage('');
        setSubject('');
      } else {
        setStatus({ ok: false, text: data.error || 'Error al enviar.' });
      }
    } catch {
      setStatus({ ok: false, text: 'No se pudo conectar.' });
    }
  };

  return (
    <div className="contact-form">
      <label>
        Tu correo
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
        />
      </label>
      <label>
        Asunto
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Hola Federico"
        />
      </label>
      <label>
        Mensaje
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Cuéntame…"
        />
      </label>
      <div
        className={`contact-status ${status?.ok ? 'ok' : status ? 'err' : ''}`}
      >
        {status ? status.text : ''}
      </div>
      <button onClick={submit}>Enviar</button>
    </div>
  );
}
