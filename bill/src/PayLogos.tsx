import { BARION_WALLETS_LIVE } from "./payLogos";

function MastercardMark() {
  return (
    <svg viewBox="0 0 48 32" className="mark" role="img" aria-label="Mastercard">
      <rect width="48" height="32" rx="4" fill="#fff" />
      <circle cx="19" cy="16" r="10" fill="#EB001B" />
      <circle cx="29" cy="16" r="10" fill="#F79E1B" />
    </svg>
  );
}

function VisaMark() {
  return (
    <svg viewBox="0 0 48 32" className="mark" role="img" aria-label="Visa">
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <text x="24" y="21" textAnchor="middle" fill="#fff" fontFamily="Arial, Helvetica, sans-serif" fontStyle="italic" fontWeight="700" fontSize="13">
        VISA
      </text>
    </svg>
  );
}

function ApplePayMark() {
  return (
    <svg viewBox="0 0 56 32" className="mark" role="img" aria-label="Apple Pay">
      <rect width="56" height="32" rx="6" fill="#fff" stroke="#d0d0d0" />
      <text x="28" y="21" textAnchor="middle" fill="#111" fontFamily="Arial, Helvetica, sans-serif" fontWeight="600" fontSize="10">
        Apple Pay
      </text>
    </svg>
  );
}

function GooglePayMark() {
  return (
    <svg viewBox="0 0 56 32" className="mark" role="img" aria-label="Google Pay">
      <rect width="56" height="32" rx="16" fill="#fff" stroke="#d0d0d0" />
      <text x="28" y="21" textAnchor="middle" fill="#3c4043" fontFamily="Arial, Helvetica, sans-serif" fontWeight="600" fontSize="10">
        G Pay
      </text>
    </svg>
  );
}

export function PayLogos({ alt }: { alt: string }) {
  return (
    <footer className="pay-logos" aria-label={alt}>
      <img src="/barion/barion-wordmark.png" alt="Barion" width={96} height={28} />
      <MastercardMark />
      <VisaMark />
      {BARION_WALLETS_LIVE ? (
        <>
          <ApplePayMark />
          <GooglePayMark />
        </>
      ) : null}
    </footer>
  );
}
