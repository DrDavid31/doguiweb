# DOGUI Web + SaaS Base

Landing optimizada y base SaaS para servicios de ciberseguridad DOGUI: monitoreo OSINT, analisis de dominios, alertamiento, dashboards, bots, reportes, awareness, vCISO, SGSI/CIDSI y servicios administrados.

## Stack

- Backend: Supabase.
- Despliegue: Vercel.
- Pagos: Stripe.
- Versionamiento: GitHub.
- Emails transaccionales: Resend.
- Dominios: Namecheap.
- Autenticacion: Clerk.
- DNS y proteccion: Cloudflare.
- Analiticas: PostHog.
- Errores: Sentry.
- Busqueda semantica: Pinecone.

## Estructura

```text
index.html                 Landing comercial.
styles.css                 CSS fuente editable.
styles.min.css             CSS de produccion.
script.js                  UI, navegacion y formulario con fallback mailto.
assets/client-integrations.js
assets/icons.svg
api/                       Vercel Serverless Functions.
api/_lib/                  Clientes y utilidades compartidas.
docs/architecture.md       Arquitectura propuesta.
docs/devsecops-checklist.md
SECURITY.md
.env.example
vercel.json
```

## APIs incluidas

- `GET /api/health`: estado de integraciones.
- `GET /api/public-config`: configuracion publica no sensible.
- `POST /api/leads`: captura leads, guarda en Supabase y notifica por Resend si esta configurado.
- `POST /api/events`: eventos server-side hacia PostHog.
- `GET /api/auth/me`: validacion de sesion Clerk por Bearer token.
- `POST /api/billing/create-checkout-session`: crea Stripe Checkout para suscripciones.
- `POST /api/webhooks/stripe`: recibe webhooks firmados de Stripe.
- `POST /api/search/semantic`: busqueda vectorial con Pinecone protegida con Clerk.

## Instalacion local

Este proyecto usa `pnpm`.

```bash
pnpm install
pnpm run build
pnpm run check
pnpm dev
```

Si solo quieres abrir la landing sin APIs, puedes servir la carpeta como estatico. El formulario intentara `/api/leads`; si no existe, abre correo como respaldo.

## Variables de entorno

Copia `.env.example` a `.env.local` en Vercel/local y completa las claves reales.

Variables principales:

- `APP_URL`
- `ALLOWED_ORIGINS`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ESSENTIAL`
- `STRIPE_PRICE_PLUS`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_EXPOSURE`
- `STRIPE_PRICE_VCISO`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `SALES_TO_EMAIL`
- `POSTHOG_PROJECT_API_KEY`
- `POSTHOG_HOST`
- `SENTRY_DSN`
- `PINECONE_API_KEY`
- `PINECONE_INDEX_NAME`
- `PINECONE_NAMESPACE`

## Supabase

Tablas iniciales sugeridas:

```sql
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text not null,
  email text not null,
  service text not null,
  message text,
  source text,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists billing_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text unique not null,
  type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
```

Para dashboards por cliente, agrega despues `organizations`, `projects`, `assets`, `alerts`, `reports`, `incidents` y activa RLS por `organization_id`.

## Vercel

1. Conecta el repo de GitHub en Vercel.
2. Framework preset: Other.
3. Build command: `pnpm run build`.
4. Output directory: `.`.
5. Agrega las variables de `.env.example`.
6. Configura dominio de Namecheap apuntando a Vercel.
7. Si usas Cloudflare, deja DNS proxied y HTTPS activo.

## Stripe

- Crea productos/precios para planes DOGUI.
- Copia los Price IDs a las variables `STRIPE_PRICE_*`.
- Configura webhook a `/api/webhooks/stripe`.
- Copia el signing secret a `STRIPE_WEBHOOK_SECRET`.

## Seguridad

- No subas `.env`.
- Rota cualquier token compartido por chat.
- Usa `SUPABASE_SERVICE_ROLE_KEY` solo en APIs.
- Activa RLS en Supabase antes de guardar datos de clientes.
- Configura SPF, DKIM y DMARC para Resend.
- Mantén Cloudflare con HTTPS, WAF y rate limiting basico.
- Revisa `docs/devsecops-checklist.md`.

## Estado actual

- Landing optimizada para GitHub Pages y Vercel.
- API base lista para Vercel.
- Integraciones preparadas para Supabase, Clerk, Stripe, Resend, PostHog, Sentry y Pinecone.
- Formulario con backend `/api/leads` y fallback `mailto:`.
- CSS de produccion generado con `scripts/build-optimized.mjs`.
