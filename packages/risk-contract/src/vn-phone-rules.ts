/**
 * Vietnam phone classification rules.
 *
 * Two-layer check that runs when a phone is NOT already in the user-reported scam DB:
 *
 *   1. OFFICIAL_NUMBERS — exact-match whitelist. Numbers actually published by
 *      government agencies, banks, telcos. Treat as low risk.
 *
 *   2. HOTLINE_PREFIXES — 4-digit prefixes that legitimate hotlines own
 *      (1900, 1800, etc.). If a phone STARTS with one of these but is NOT in
 *      OFFICIAL_NUMBERS, it is almost certainly an impersonation — return
 *      a high-confidence warning.
 *
 * Phones are normalised to E.164 (+84...) before matching.
 */

export const OFFICIAL_NUMBERS: ReadonlyArray<{
  phone: string;
  org: string;
  label: string;
}> = [
  // Emergency
  { phone: '113', org: 'Bộ Công an', label: 'Cảnh sát' },
  { phone: '114', org: 'Bộ Công an', label: 'Cứu hỏa' },
  { phone: '115', org: 'Bộ Y tế', label: 'Cấp cứu' },
  { phone: '111', org: 'Bộ LĐ-TB&XH', label: 'Bảo vệ trẻ em' },
  { phone: '116', org: 'Bộ TT&TT', label: 'Tư vấn pháp luật miễn phí' },

  // Major banks — 1900 hotlines
  { phone: '1900545413', org: 'Vietcombank', label: 'CSKH' },
  { phone: '19001577', org: 'BIDV', label: 'CSKH' },
  { phone: '19001955', org: 'Techcombank', label: 'CSKH' },
  { phone: '1900545486', org: 'ACB', label: 'CSKH' },
  { phone: '19001595', org: 'Sacombank', label: 'CSKH' },
  { phone: '19001234', org: 'VIB', label: 'CSKH' },
  { phone: '19001566', org: 'TPBank', label: 'CSKH' },
  { phone: '18001585', org: 'Vietinbank', label: 'CSKH' },
  { phone: '1900558868', org: 'Agribank', label: 'CSKH' },
  { phone: '19006060', org: 'MB Bank', label: 'CSKH' },
  { phone: '18006675', org: 'VPBank', label: 'CSKH' },
  { phone: '19001545', org: 'SHB', label: 'CSKH' },

  // Telcos
  { phone: '198', org: 'Viettel', label: 'CSKH' },
  { phone: '18001091', org: 'VNPT/Vinaphone', label: 'CSKH' },
  { phone: '9090', org: 'Mobifone', label: 'CSKH' },
  { phone: '789', org: 'Vietnamobile', label: 'CSKH' },

  // E-wallets / payments
  { phone: '19005555', org: 'Momo', label: 'CSKH' },
  { phone: '19002126', org: 'ZaloPay', label: 'CSKH' },
];

/**
 * 4-digit prefixes that real hotlines own. A number starting with one of these
 * SHOULD be in OFFICIAL_NUMBERS; if it is not, it is impersonating.
 *
 * NOTE: 1900 and 1800 are SMS/IVR shortcodes; only entities that registered
 * with MIC can own one. Bad actors usually buy 1900xxxx prefixes from
 * shady resellers.
 */
export const HOTLINE_PREFIXES: ReadonlyArray<string> = [
  '1900', // Pay-per-call hotlines (banks, gov, e-commerce)
  '1800', // Free hotlines (banks, gov)
];

/**
 * Strip + / spaces / dashes and Vietnam country code so we can compare a
 * stable internal form. Output: pure digits, no country code, no leading 0.
 */
export function normaliseDigits(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '');
  if (digits.startsWith('84') && digits.length > 10) return digits.slice(2);
  if (digits.startsWith('0')) return digits.slice(1);
  return digits;
}

export type PhoneClassification =
  | { kind: 'official'; org: string; label: string }
  | { kind: 'impersonation_risk'; matchedPrefix: string }
  | { kind: 'unknown' };

const OFFICIAL_INDEX = new Set(OFFICIAL_NUMBERS.map(n => normaliseDigits(n.phone)));
const OFFICIAL_DETAILS = new Map(
  OFFICIAL_NUMBERS.map(n => [normaliseDigits(n.phone), n]),
);

export function classifyPhone(rawPhone: string): PhoneClassification {
  const digits = normaliseDigits(rawPhone);

  if (OFFICIAL_INDEX.has(digits)) {
    const entry = OFFICIAL_DETAILS.get(digits)!;
    return { kind: 'official', org: entry.org, label: entry.label };
  }

  for (const prefix of HOTLINE_PREFIXES) {
    if (digits.startsWith(prefix)) {
      return { kind: 'impersonation_risk', matchedPrefix: prefix };
    }
  }

  return { kind: 'unknown' };
}
