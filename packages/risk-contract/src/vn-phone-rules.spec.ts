import {
  OFFICIAL_NUMBERS,
  HOTLINE_PREFIXES,
  classifyPhone,
  normaliseDigits,
} from './vn-phone-rules';

describe('vn-phone-rules', () => {
  describe('data integrity', () => {
    it('contains no duplicate phone keys after normalisation', () => {
      const seen = new Map<string, string>();
      const duplicates: string[] = [];
      for (const entry of OFFICIAL_NUMBERS) {
        const key = normaliseDigits(entry.phone);
        const previous = seen.get(key);
        if (previous) {
          duplicates.push(`${key} → ${previous} AND ${entry.org}`);
        } else {
          seen.set(key, entry.org);
        }
      }
      expect(duplicates).toEqual([]);
    });

    it('all phone entries have non-empty fields', () => {
      for (const entry of OFFICIAL_NUMBERS) {
        expect(entry.phone.length).toBeGreaterThan(0);
        expect(entry.org.length).toBeGreaterThan(0);
        expect(entry.label.length).toBeGreaterThan(0);
      }
    });

    it('no whitelisted number is itself caught by impersonation rule alone', () => {
      // It is fine for a whitelisted number to start with 1900/1800;
      // classifyPhone must return "official", not "impersonation_risk".
      for (const entry of OFFICIAL_NUMBERS) {
        const result = classifyPhone(entry.phone);
        expect(result.kind).toBe('official');
      }
    });
  });

  describe('classifyPhone', () => {
    it('returns official for emergency number 113', () => {
      const result = classifyPhone('113');
      expect(result.kind).toBe('official');
      if (result.kind === 'official') expect(result.org).toBe('Bộ Công an');
    });

    it('returns official for Vietcombank hotline', () => {
      const result = classifyPhone('1900545413');
      expect(result.kind).toBe('official');
      if (result.kind === 'official') expect(result.org).toBe('Vietcombank');
    });

    it('returns impersonation_risk for unregistered 1900 prefix', () => {
      const result = classifyPhone('19009999');
      expect(result.kind).toBe('impersonation_risk');
      if (result.kind === 'impersonation_risk') {
        expect(result.matchedPrefix).toBe('1900');
      }
    });

    it('returns impersonation_risk for unregistered 1800 prefix', () => {
      const result = classifyPhone('18001234');
      expect(result.kind).toBe('impersonation_risk');
    });

    it('returns unknown for ordinary VN mobile', () => {
      expect(classifyPhone('0987654321').kind).toBe('unknown');
    });

    it('normalises +84 country code so 84901234567 ≡ 0901234567', () => {
      // Both forms should classify identically (here: both unknown)
      const a = classifyPhone('84901234567');
      const b = classifyPhone('0901234567');
      expect(a.kind).toBe(b.kind);
    });
  });

  describe('HOTLINE_PREFIXES', () => {
    it('is non-empty', () => {
      expect(HOTLINE_PREFIXES.length).toBeGreaterThan(0);
    });
  });
});
