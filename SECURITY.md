# Seguridad

## Reporte de vulnerabilidades

Reporta hallazgos de seguridad al correo configurado para DOGUI. No publiques vulnerabilidades sin coordinacion previa.

## Practicas del proyecto

- Las claves se gestionan por variables de entorno.
- Las APIs aplican headers basicos, rate limit en memoria y validacion de entrada.
- El formulario incluye honeypot antispam y fallback a correo.
- El webhook de Stripe valida firma.
- Las rutas privadas esperan JWT de Clerk en `Authorization: Bearer <token>`.

## Acciones pendientes antes de produccion

- Revocar tokens compartidos por chat o canales no seguros.
- Activar RLS en Supabase.
- Configurar SPF, DKIM y DMARC para Resend.
- Definir politicas de retencion de logs y leads.
- Agregar pruebas automatizadas para flujos criticos de billing y auth.
