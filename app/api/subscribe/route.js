import { NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import { Resend } from 'resend';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const { email, subject, message } = await request.json();

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Correo inválido' },
        { status: 400 }
      );
    }

    const record = {
      email,
      subject: subject || null,
      message: message || null,
      ts: new Date().toISOString(),
    };

    // 1) Guardar en Vercel Blob (almacenamiento persistente)
    let stored = false;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        await put(`emails/${id}.json`, JSON.stringify(record), {
          access: 'public',
          contentType: 'application/json',
          addRandomSuffix: false,
        });
        stored = true;
      } catch (e) {
        console.error('Blob store error:', e);
      }
    }

    // 2) Opcional: enviar por Resend para que llegue al correo
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'FRF-98 <onboarding@resend.dev>',
          to: process.env.CONTACT_TO || 'fredolds180@gmail.com',
          reply_to: email,
          subject: subject || 'Nuevo acceso desde FRF-98',
          html: `
            <h2>Nuevo correo desde FRF-98</h2>
            <p><strong>De:</strong> ${email}</p>
            ${subject ? `<p><strong>Asunto:</strong> ${subject}</p>` : ''}
            ${message ? `<p><strong>Mensaje:</strong></p><p>${message}</p>` : '<p><em>Acceso (sin mensaje).</em></p>'}
          `,
        });
      } catch (e) {
        console.error('Resend error:', e);
      }
    }

    return NextResponse.json({ success: true, stored });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (process.env.ADMIN_KEY && key !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ emails: [], note: 'BLOB_READ_WRITE_TOKEN no configurado' });
    }

    const { blobs } = await list({ prefix: 'emails' });
    const emails = await Promise.all(
      blobs.map(async (b) => {
        try {
          const res = await fetch(b.url);
          return await res.json();
        } catch {
          return { url: b.url, uploadedAt: b.uploadedAt };
        }
      })
    );
    emails.sort((a, b) => (a.ts || '').localeCompare(b.ts || ''));

    return NextResponse.json({ emails });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
