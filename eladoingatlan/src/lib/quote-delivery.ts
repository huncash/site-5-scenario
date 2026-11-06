import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";

import nodemailer from "nodemailer";

/**
 * Server-only mail for eladoingatlan.szcenario.hu.
 * Recipient lives in process.env — never hardcode addresses here.
 * Ha az SMTP nincs kész, az érdeklődés fájlba mentődik (Poka-Yoke).
 */

export interface QuoteDelivery {
  subject: string;
  text: string;
  replyTo?: string;
}

export type QuoteDeliveryResult = {
  ok: boolean;
  mail: boolean;
  file: boolean;
  reason?: "not_configured" | "mail_failed" | "file_failed" | "none";
};

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

function enquiryStoreDir(): string {
  const raw = process.env.ENQUIRY_STORE_DIR?.trim();
  if (raw) return raw;
  return path.join(process.cwd(), "data", "enquiries");
}

export async function appendEnquiryToFile(delivery: QuoteDelivery): Promise<boolean> {
  try {
    const dir = enquiryStoreDir();
    await mkdir(dir, { recursive: true });
    const day = new Date().toISOString().slice(0, 10);
    const file = path.join(dir, `${day}.jsonl`);
    const line =
      JSON.stringify({
        at: new Date().toISOString(),
        subject: delivery.subject,
        replyTo: delivery.replyTo ?? null,
        text: delivery.text,
      }) + "\n";
    await appendFile(file, line, "utf8");
    console.log(JSON.stringify({ event: "listing_enquiry_file_saved", file }));
    return true;
  } catch (err) {
    console.error(
      JSON.stringify({
        event: "listing_enquiry_file_failed",
        message: err instanceof Error ? err.message : "unknown",
      }),
    );
    return false;
  }
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
        hasPass: Boolean(pass && String(pass).trim()),
      }),
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
    console.log(JSON.stringify({ event: "listing_mail_sent", toHost: host }));
    return true;
  } catch (err) {
    console.error(
      JSON.stringify({
        event: "listing_mail_failed",
        message: err instanceof Error ? err.message : "unknown",
      }),
    );
    return false;
  }
}

/** Mail + fájl: legalább az egyik siker → ok. */
export async function deliverEnquiry(delivery: QuoteDelivery): Promise<QuoteDeliveryResult> {
  const mail = await sendQuoteEmail(delivery);
  const file = await appendEnquiryToFile(delivery);

  if (mail || file) {
    return {
      ok: true,
      mail,
      file,
      reason: mail ? undefined : "not_configured",
    };
  }

  return { ok: false, mail: false, file: false, reason: "none" };
}
