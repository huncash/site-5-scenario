import { appendEnquiryToFile, deliverEnquiry } from "@/lib/quote-delivery";

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_PHONE = 40;
const MAX_MESSAGE = 2000;

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch (err) {
    console.error(
      JSON.stringify({
        event: "listing_enquiry_bad_json",
        message: err instanceof Error ? err.message : "unknown",
      }),
    );
    return Response.json({ error: "invalid", detail: "json" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json({ error: "invalid", detail: "body" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  // Honeypot fields — bots that fill these get a fake success.
  if (
    (typeof data.company === "string" && data.company.trim()) ||
    (typeof data.website === "string" && data.website.trim())
  ) {
    return Response.json({ ok: true, honeypot: true });
  }

  const name = text(data.name, MAX_NAME);
  const emailRaw = typeof data.email === "string" ? data.email.trim() : "";
  const phoneRaw = typeof data.phone === "string" ? data.phone.trim() : "";
  const message = text(data.message, MAX_MESSAGE);
  const rawVariant = typeof data.variant === "string" ? data.variant.trim().toLowerCase() : "";
  const variant = rawVariant === "a" || rawVariant === "b" ? rawVariant.toUpperCase() : null;

  const email =
    emailRaw && emailRaw.length <= MAX_EMAIL && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw) ? emailRaw : null;
  const phone = phoneRaw && phoneRaw.length <= MAX_PHONE ? phoneRaw : null;

  if (!name || !message || (!email && !phone)) {
    console.warn(
      JSON.stringify({
        event: "listing_enquiry_invalid",
        hasName: Boolean(name),
        hasMessage: Boolean(message),
        hasEmail: Boolean(email),
        hasPhone: Boolean(phone),
      }),
    );
    return Response.json({ error: "invalid", detail: "fields" }, { status: 400 });
  }

  const optionLabel =
    variant === "A"
      ? "Kétütemű novemberi kedvezmény (30.700.000 Ft)"
      : variant === "B"
        ? "Alapár (31.500.000 Ft, legkorábban 2026. nov. 10.)"
        : null;
  const variantLine = optionLabel ? `Konstrukció: ${optionLabel}` : "Konstrukció: nem jelölt";
  const replyTo = email ?? undefined;
  const delivery = {
    subject: optionLabel
      ? `Érdeklődés (${optionLabel}): Kismaros, Börzsönyliget`
      : "Érdeklődés: Kismaros, Börzsönyliget",
    replyTo,
    text: [
      `Név: ${name}`,
      phone ? `Telefon: ${phone}` : null,
      email ? `E-mail: ${email}` : null,
      variantLine,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n"),
  };

  // SMTP hibánál se 503: mentés data/enquiries/ alá, válasz { ok: true, mail: false, file: true }.
  let mail = false;
  let file = false;
  try {
    const result = await deliverEnquiry(delivery);
    mail = result.mail;
    file = result.file;
    if (result.ok) {
      console.log(
        JSON.stringify({
          event: "listing_enquiry",
          hasName: true,
          hasEmail: Boolean(email),
          hasPhone: Boolean(phone),
          mail,
          file,
        }),
      );
      return Response.json({ ok: true, mail, file });
    }
  } catch (err) {
    console.error(
      JSON.stringify({
        event: "listing_enquiry_delivery_throw",
        message: err instanceof Error ? err.message : "unknown",
      }),
    );
  }

  if (!file) {
    try {
      file = await appendEnquiryToFile(delivery);
    } catch (err) {
      console.error(
        JSON.stringify({
          event: "listing_enquiry_file_catch",
          message: err instanceof Error ? err.message : "unknown",
        }),
      );
      file = false;
    }
  }

  if (file) {
    console.log(
      JSON.stringify({
        event: "listing_enquiry",
        hasName: true,
        hasEmail: Boolean(email),
        hasPhone: Boolean(phone),
        mail: false,
        file: true,
      }),
    );
    return Response.json({ ok: true, mail: false, file: true });
  }

  console.error(
    JSON.stringify({
      event: "listing_enquiry_delivery_failed",
      reason: "none",
      mail: false,
      file: false,
    }),
  );
  return Response.json({ error: "delivery", detail: "none", mail: false, file: false }, { status: 503 });
}
