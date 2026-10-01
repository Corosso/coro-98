# Deploy de FRF-98 en Vercel

Guía para desplegar el portafolio (Next.js) en Vercel, incluyendo el setup del
almacenamiento de correos (Vercel Blob) y el plan de rutas para demos.

## Arquitectura

- **Un solo proyecto Vercel** para la web principal (este repo).
- **Demos** (`demos/<slug>/`, generadas por `demo-minifier`) se sirven de dos formas
  posibles (ver [Rutas de demos](#rutas-de-demos-demos-slug)):
  1. Estáticas dentro del mismo proyecto (`public/demos/<slug>/`), o
  2. Como su propio proyecto Vercel, expuestas en `/demos/<slug>` vía `rewrites`.
- **Correos** del gate/contacto se guardan en **Vercel Blob** y, opcionalmente, se
  reenvían por **Resend**.

## Variables de entorno

Configúralas en Vercel → **Settings → Environment Variables**
(Production, Preview y Development).

| Variable               | Requerida | Descripción                                                                 |
| ---------------------- | --------- | --------------------------------------------------------------------------- |
| `BLOB_READ_WRITE_TOKEN`| Sí        | Token del Vercel Blob store. Guarda los correos en `emails/<id>.json`.       |
| `ADMIN_KEY`            | No        | Clave para leer los correos guardados vía `GET /api/subscribe?key=...`.      |
| `RESEND_API_KEY`       | No        | Api key de Resend para **además** enviar el correo por email.                |
| `CONTACT_TO`           | No        | Destino de los correos enviados. Default: `fredolds180@gmail.com`.           |

> Localmente, copia `.env.example` a `.env.local` y completa los mismos valores.

## Vercel Blob store (lista de correos)

`app/api/subscribe/route.js` escribe cada correo como un archivo JSON bajo el
prefijo `emails/` y los lista con `GET /api/subscribe`. Para que funcione:

1. En el proyecto de Vercel, ve a **Storage → Create Database** (o **Blob**) y
   crea un **Blob store**.
2. Copia el token de acceso de lectura/escritura que genera Vercel.
3. Pégalo como la variable `BLOB_READ_WRITE_TOKEN` (ver tabla de arriba).
4. Redeploy (guardar la variable dispara uno automáticamente).

Comportamiento del endpoint:

- `POST /api/subscribe` con `{ email, subject?, message? }` → guarda en Blob
  (`stored: true`) y, si `RESEND_API_KEY` está configurado, envía el email.
- `GET /api/subscribe?key=<ADMIN_KEY>` → lista los correos guardados, ordenados por
  fecha. Sin `ADMIN_KEY` configurado, el endpoint queda abierto (solo lectura).
- Sin `BLOB_READ_WRITE_TOKEN`, el guardado se omite y el endpoint lo indica.

## Pasos de deploy

1. Validar el build localmente:
   ```bash
   npm run build
   ```
2. Conectar el repo a Vercel (Import Project) o usar la CLI:
   ```bash
   npx vercel link
   ```
3. Configurar las variables de entorno de la tabla anterior.
4. Deploy:
   - Vercel dispara un deploy por push a la rama de producción, o
   - `npx vercel --prod` (solo con aprobación explícita del usuario).
5. Probar `POST /api/subscribe` y el `GET` con `ADMIN_KEY`.

> **Regla:** no ejecutar `vercel deploy`/`--prod` ni hacer push a producción sin
> aprobación explícita.

## Rutas de demos (`/demos/<slug>`)

`vercel.json` declara `cleanUrls: true` (para `/demos/<slug>` sin `.html`) y un plan
de `rewrites`. Cada demo expuesta en `/demos/<slug>` es un proyecto Vercel aparte
(subdominio `demo-<slug>.vercel.app`), y se proxy-transparenta en la web principal.

**Importante:** los rewrites a orígenes externos requieren un host literal por
entrada. No hay sustitución dinámica de subdominio, así que se añade **una entrada
por slug**.

Plantilla para añadir una demo (sustituye `kaizen` por el slug real):

```json
{
  "source": "/demos/kaizen",
  "destination": "https://demo-kaizen.vercel.app/"
},
{
  "source": "/demos/kaizen/:path*",
  "destination": "https://demo-kaizen.vercel.app/:path*"
}
```

Flujo al añadir una demo:

1. Generar el build estático con `demo-minifier` en `demos/<slug>/`.
2. Crear su proyecto Vercel y obtener el subdominio `demo-<slug>.vercel.app`.
3. Añadir las dos entradas de rewrite anteriores en `vercel.json`.
4. Actualizar `data/projects.json` → `"demo": "/demos/<slug>/"`.

Alternativa (sin proyecto aparte): copiar el build a `public/demos/<slug>/` y se
sirve directamente en `/demos/<slug>/` sin rewrites.

## Notas

- Media liviana va en `public/media/` (lazy-load). Media pesada → YouTube/Drive/R2/
  Cloudinary, nunca al repo de Vercel.
- `.vercelignore` excluye `node_modules`, `.next`, `.env*`, `docs/` y `demos/` del
  upload (las demos viven en su propio proyecto o en `public/demos/`).
