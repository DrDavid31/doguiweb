let resendClient = null;

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (resendClient) return resendClient;
  const { Resend } = require("resend");
  resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

async function sendLeadEmail(lead) {
  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.SALES_TO_EMAIL;

  if (!resend || !from || !to) {
    return { sent: false, reason: "resend_not_configured" };
  }

  await resend.emails.send({
    from,
    to,
    subject: `Nuevo lead DOGUI - ${lead.service || "Ciberseguridad"}`,
    text: [
      `Nombre: ${lead.name}`,
      `Empresa: ${lead.company}`,
      `Correo: ${lead.email}`,
      `Servicio: ${lead.service}`,
      "",
      "Mensaje:",
      lead.message || "Sin mensaje.",
      "",
      `Origen: ${lead.source || "website"}`,
    ].join("\n"),
  });

  return { sent: true };
}

module.exports = { getResend, sendLeadEmail };
