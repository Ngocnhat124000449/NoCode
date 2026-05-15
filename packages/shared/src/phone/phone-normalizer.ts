import { parsePhoneNumberFromString, PhoneNumber } from 'libphonenumber-js';

export function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/[\s\-\(\)]/g, '');

  const parsed: PhoneNumber | undefined = parsePhoneNumberFromString(
    cleaned,
    'VN',
  );

  if (!parsed || !parsed.isValid()) {
    throw new Error(`Invalid phone number: ${raw}`);
  }

  return parsed.format('E.164');
}
