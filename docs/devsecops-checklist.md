# Checklist DevSecOps

## Secretos

- Nunca subir `.env` al repositorio.
- Usar Vercel Environment Variables por entorno.
- Rotar tokens expuestos y claves de servicio.
- Usar `SUPABASE_SERVICE_ROLE_KEY` solo en funciones serverless, nunca en frontend.

## Supabase

- Activar Row Level Security en tablas de cliente.
- Crear politicas por `organization_id`.
- Separar roles anon, authenticated y service role.
- Auditar inserts de leads, eventos y billing.

## Clerk

- Proteger rutas API privadas con Bearer token.
- Usar organizaciones de Clerk si DOGUI vendera a empresas.
- Mapear `clerkUserId` y `organizationId` en Supabase.

## Stripe

- Validar webhooks con `STRIPE_WEBHOOK_SECRET`.
- Guardar `stripe_event_id` como unico para idempotencia.
- No confiar en datos de plan enviados por el cliente sin mapearlos a Price IDs del servidor.

## Resend

- Configurar SPF, DKIM y DMARC del dominio.
- Usar remitente verificado del dominio DOGUI.
- No enviar datos sensibles innecesarios por correo.

## Vercel

- Configurar previews por PR.
- Separar variables de Production, Preview y Development.
- Mantener headers de seguridad.
- Revisar logs de funciones y errores Sentry.

## Cloudflare

- Activar proxy DNS para dominio publico.
- Activar HTTPS Always Use HTTPS.
- Activar WAF managed rules basicas.
- Configurar rate limiting si el trafico crece.

## Observabilidad

- Sentry para errores de API.
- PostHog para eventos de producto.
- Alertas por fallos de checkout, webhooks y captura de leads.

## Datos e IA

- No enviar datos personales a Pinecone si no es necesario.
- Guardar solo metadatos minimos en vectores.
- Cifrar documentos sensibles antes de almacenarlos fuera de Supabase.
