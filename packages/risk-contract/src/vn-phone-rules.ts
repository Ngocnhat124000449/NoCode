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
  // === EMERGENCY ===
  { phone: '113', org: 'Bộ Công an', label: 'Cảnh sát' },
  { phone: '114', org: 'Bộ Công an', label: 'Cứu hỏa' },
  { phone: '115', org: 'Bộ Y tế', label: 'Cấp cứu' },
  { phone: '111', org: 'Bộ LĐ-TB&XH', label: 'Bảo vệ trẻ em' },
  { phone: '116', org: 'Bộ TT&TT', label: 'Tư vấn pháp luật miễn phí' },
  { phone: '112', org: 'Quốc phòng', label: 'Tìm kiếm cứu nạn' },

  // === GOVERNMENT / PUBLIC SERVICE ===
  { phone: '1022', org: 'UBND TP.HCM', label: 'Hành chính công' },
  { phone: '1900099966', org: 'Tổng cục Thuế', label: 'CSKH' },
  { phone: '19009068', org: 'BHXH Việt Nam', label: 'CSKH' },

  // === ELECTRICITY (EVN) ===
  { phone: '19001288', org: 'EVN miền Bắc / Hà Nội', label: 'CSKH' },
  { phone: '1900545454', org: 'EVN HCMC', label: 'CSKH' },
  { phone: '19001909', org: 'EVN miền Trung', label: 'CSKH' },
  { phone: '19001006', org: 'EVN miền Nam', label: 'CSKH' },

  // === BANKS — Big 4 + major joint-stock ===
  { phone: '1900545413', org: 'Vietcombank', label: 'CSKH' },
  { phone: '19009247', org: 'BIDV', label: 'CSKH' },
  { phone: '19008198', org: 'Techcombank', label: 'CSKH' },
  { phone: '19001212', org: 'VietinBank', label: 'CSKH' },
  { phone: '1900558868', org: 'Agribank', label: 'CSKH' },
  { phone: '1900545486', org: 'ACB', label: 'CSKH' },
  { phone: '19005555', org: 'Sacombank', label: 'CSKH' },
  { phone: '19002351', org: 'VIB', label: 'CSKH' },
  { phone: '19005858', org: 'TPBank', label: 'CSKH' },
  { phone: '19005454', org: 'MB Bank', label: 'CSKH' },
  { phone: '19005485', org: 'VPBank', label: 'CSKH' },
  { phone: '18006115', org: 'SHB', label: 'CSKH' },
  { phone: '19006060', org: 'HDBank', label: 'CSKH' },
  { phone: '19006678', org: 'OCB', label: 'CSKH' },
  { phone: '19006083', org: 'MSB', label: 'CSKH' },
  { phone: '19005558', org: 'SeABank', label: 'CSKH' },
  { phone: '18001199', org: 'Eximbank', label: 'CSKH' },
  { phone: '19006234', org: 'LPBank (LienVietPostBank)', label: 'CSKH' },

  // === TELCOS (số ngắn) ===
  { phone: '198', org: 'Viettel', label: 'CSKH' },
  { phone: '9191', org: 'Vinaphone', label: 'CSKH' },
  { phone: '9090', org: 'Mobifone', label: 'CSKH' },
  { phone: '789', org: 'Vietnamobile', label: 'CSKH' },
  { phone: '199', org: 'Wintel', label: 'CSKH' },

  // === ISP / INTERNET ===
  { phone: '19006600', org: 'FPT Telecom', label: 'CSKH' },
  { phone: '18001166', org: 'VNPT Internet', label: 'CSKH' },
  { phone: '18008119', org: 'Viettel Internet', label: 'CSKH' },
  { phone: '19001255', org: 'SCTV', label: 'CSKH' },
  { phone: '19001592', org: 'K+', label: 'CSKH' },

  // === AIRLINES ===
  { phone: '19001100', org: 'Vietnam Airlines', label: 'CSKH' },
  { phone: '19001886', org: 'Vietjet Air', label: 'CSKH' },
  { phone: '19001166', org: 'Bamboo Airways', label: 'CSKH' },
  { phone: '19001550', org: 'Pacific Airlines', label: 'CSKH' },

  // === POSTAL / DELIVERY ===
  { phone: '1900545481', org: 'Vietnam Post', label: 'CSKH' },
  { phone: '19001088', org: 'Viettel Post', label: 'CSKH' },
  { phone: '19001239', org: 'Giao Hàng Nhanh (GHN)', label: 'CSKH' },
  { phone: '19001188', org: 'Giao Hàng Tiết Kiệm (GHTK)', label: 'CSKH' },
  { phone: '19001902', org: 'J&T Express', label: 'CSKH' },
  { phone: '19006625', org: 'Best Express', label: 'CSKH' },

  // === E-COMMERCE ===
  { phone: '19001221', org: 'Shopee', label: 'CSKH' },
  { phone: '19001000', org: 'Lazada', label: 'CSKH' },
  { phone: '19006035', org: 'Tiki', label: 'CSKH' },
  { phone: '19006557', org: 'Sendo', label: 'CSKH' },

  // === RIDE HAILING ===
  { phone: '19006750', org: 'Grab', label: 'CSKH' },
  { phone: '19002089', org: 'Be', label: 'CSKH' },
  { phone: '19002088', org: 'Xanh SM (GSM)', label: 'CSKH' },

  // === E-WALLETS / PAYMENTS ===
  { phone: '19005232', org: 'Momo', label: 'CSKH' },
  { phone: '1900561558', org: 'ZaloPay', label: 'CSKH' },
  { phone: '1900555577', org: 'VNPay', label: 'CSKH' },
  { phone: '18008000', org: 'Viettel Money', label: 'CSKH' },

  // === INSURANCE ===
  { phone: '1900558899', org: 'Bảo Việt', label: 'CSKH' },
  { phone: '18001247', org: 'Prudential VN', label: 'CSKH' },
  { phone: '19001776', org: 'Manulife VN', label: 'CSKH' },
  { phone: '19001346', org: 'Dai-ichi Life VN', label: 'CSKH' },
  { phone: '19001877', org: 'AIA VN', label: 'CSKH' },
  { phone: '19001140', org: 'Generali VN', label: 'CSKH' },

  // === HOSPITALS (private + major public) ===
  { phone: '19001229', org: 'Vinmec', label: 'CSKH' },
  { phone: '19009095', org: 'BV Hồng Ngọc', label: 'CSKH' },
  { phone: '19001717', org: 'FV Hospital', label: 'CSKH' },
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
