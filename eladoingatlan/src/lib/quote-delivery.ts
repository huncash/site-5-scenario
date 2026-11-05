import nodemailer from "nodemailer";

/**
 * Server-only mail for eladoingatlan.szcenario.hu.
 * Recipient lives in process.env — never hardcode addresses here.
 */

export interface QuoteDelivery {
  subject: string;
  text: string;
  replyTo?: string;
}

function resolveRecipient(): string | undefined {
  return (
    process.env.RECIPIENT_ELADOINGATLAN?.trim() ||
    process.env.LISTING_INBOX_EMAIL?.trim() ||
    undefined
  );
}

function resolveFrom(smtpUser: string): string {
  const raw = process.env.SMTP_FROM?.trim();
  if (raw) return raw;
  return smtpUser;
}

export async function sendQuoteEmail(delivery: QuoteDelivery): Promise<boolean> {
  const to = resolveRecipient();
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  if (!to || !host || !user || !pass) {
    console.error(
      JSON.stringify({
        event: "listing_mail_not_configured",
        hasTo: Boolean(to),
        hasHost: Boolean(host),
        hasUser: Boolean(user),
        hasPass: Boolean(pass),
      })
    );
    return false;
  }
  const from = resolveFrom(user);
  const port = Number(process.env.SMTP_PORT || "587");
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from,
      to,
      ...(delivery.replyTo ? { replyTo: delivery.replyTo } : {}),
      subject: delivery.subject,
      text: delivery.text,
    });
    console.log(JSON.stringify({ event: "listing_mail_sent" }));
    return true;
  } catch (err) {
    console.error(
      JSON.stringify({
        event: "listing_mail_failed",
        message: err instanceof Error ? err.message : "unknown",
      })
    );
    return false;
  }
}
