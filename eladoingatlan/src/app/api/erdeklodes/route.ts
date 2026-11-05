import { sendQuoteEmail } from "@/lib/quote-delivery";

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
  } catch {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  // Honeypot fields — bots that fill these get a fake success.
  if (
    (typeof data.company === "string" && data.company.trim()) ||
    (typeof data.website === "string" && data.website.trim())
  ) {
    return Response.json({ ok: true });
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
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  const optionLabel =
    variant === "A"
      ? "Kétütemű novemberi kedvezmény (30.700.000 Ft)"
      : variant === "B"
        ? "Alapár (31.500.000 Ft, legkorábban 2026. nov. 10.)"
        : null;
  const variantLine = optionLabel ? `Konstrukció: ${optionLabel}` : "Konstrukció: nem jelölt";
  const replyTo = email ?? undefined;
  const sent = await sendQuoteEmail({
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
  });

  if (!sent) {
    return Response.json({ error: "mail" }, { status: 503 });
  }

  console.log(JSON.stringify({ event: "listing_enquiry", hasName: true, hasEmail: Boolean(email), hasPhone: Boolean(phone) }));
  return Response.json({ ok: true });
}
