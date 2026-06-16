# Arquitectura DOGUI SaaS

## Objetivo

Mantener la landing actual como frontend estatico rapido y agregar una capa SaaS serverless en Vercel para vender servicios de ciberseguridad, monitoreo OSINT, alertamiento, dashboards, bots y reportes.

## Stack objetivo

- Frontend y despliegue: Vercel con landing estatica optimizada.
- Backend: Vercel Serverless Functions.
- Base de datos: Supabase Postgres.
- Autenticacion: Clerk.
- Pagos: Stripe Checkout y webhooks.
- Emails transaccionales: Resend.
- Analiticas de producto: PostHog server-side.
- Errores: Sentry server-side.
- Busqueda semantica: Pinecone.
- DNS y proteccion basica: Cloudflare.
- Dominio: Namecheap.
- Versionamiento: GitHub.

## Estructura propuesta

```text
/
  index.html                 Landing comercial.
  styles.css                 CSS fuente editable.
  styles.min.css             CSS optimizado para produccion.
  script.js                  Interacciones de UI y formulario.
  assets/
    client-integrations.js   Tracking ligero hacia /api/events.
    icons.svg                Sprite SVG cacheable.
    dogui-hero*.webp/jpg     Imagenes optimizadas.
  api/
    health.js                Estado de integraciones.
    public-config.js         Config publica no sensible.
    leads.js                 Captura leads + Supabase + Resend + PostHog.
    events.js                Analiticas server-side.
    auth/me.js               Verificacion Clerk por Bearer token.
    billing/create-checkout-session.js
    webhooks/stripe.js
    search/semantic.js
    _lib/                    Clientes y utilidades compartidas.
  scripts/
    build-optimized.mjs      Genera styles.min.css.
    check-project.mjs        Checks de referencias.
```

## Flujo de lead

1. Usuario envia formulario.
2. `script.js` intenta `POST /api/leads`.
3. La funcion valida datos, aplica rate limit y honeypot.
4. Si Supabase esta configurado, inserta en `leads`.
5. Si Resend esta configurado, envia notificacion comercial.
6. Si PostHog esta configurado, registra `lead_submitted`.
7. Si falla el backend, la landing abre `mailto:` como respaldo.

## Tablas sugeridas en Supabase

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

## Escalamiento recomendado

1. Crear dashboard autenticado con Clerk para clientes DOGUI.
2. Agregar tablas `organizations`, `projects`, `assets`, `alerts`, `reports` e `incidents`.
3. Mover bots y automatizaciones a workers programados.
4. Usar Supabase Row Level Security para datos por cliente.
5. Guardar embeddings y metadatos en Pinecone para busqueda semantica de reportes, hallazgos OSINT y documentos.
