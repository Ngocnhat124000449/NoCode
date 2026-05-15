import { PrismaClient } from '@prisma/client';
import { createHmac } from 'crypto';

const prisma = new PrismaClient();

const HMAC_SECRET = process.env.PHONE_HMAC_SECRET ?? 'icproject2026_hmac_secret_key_minimum_32chars';

function hashPhone(e164: string): string {
  return createHmac('sha256', HMAC_SECRET).update(e164).digest('hex');
}

// E.164 → HMAC hash mapping for seed phones
const PHONES: Array<{
  raw: string;
  e164: string;
  scenarios: string[];
  reportCount: number;
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  confidence: number;
  action: 'allow' | 'verify' | 'block';
}> = [
  // === CRITICAL (score ≥ 80) ===
  {
    raw: '0988000111', e164: '+84988000111',
    scenarios: ['impersonation', 'demands_immediate_transfer', 'requests_secrecy'],
    reportCount: 142,
    score: 97, level: 'critical',
    reasons: ['[RC001] Mạo danh cơ quan nhà nước', '[RC010] Thúc ép chuyển tiền ngay', '[RC020] Yêu cầu giữ bí mật'],
    confidence: 0.96, action: 'block',
  },
  {
    raw: '0901888999', e164: '+84901888999',
    scenarios: ['impersonation', 'financial_fraud'],
    reportCount: 89,
    score: 92, level: 'critical',
    reasons: ['[RC001] Mạo danh công an điều tra', '[RC015] Yêu cầu chuyển tiền vào tài khoản lạ'],
    confidence: 0.91, action: 'block',
  },
  {
    raw: '0909111222', e164: '+84909111222',
    scenarios: ['prize_scam', 'demands_immediate_transfer'],
    reportCount: 67,
    score: 88, level: 'critical',
    reasons: ['[RC030] Thông báo trúng thưởng giả mạo', '[RC010] Thúc ép chuyển tiền ngay'],
    confidence: 0.87, action: 'block',
  },
  {
    raw: '0977333444', e164: '+84977333444',
    scenarios: ['impersonation', 'requests_secrecy'],
    reportCount: 54,
    score: 85, level: 'critical',
    reasons: ['[RC002] Mạo danh cán bộ ngân hàng', '[RC020] Yêu cầu giữ bí mật tuyệt đối'],
    confidence: 0.84, action: 'block',
  },

  // === HIGH (score 60–79) ===
  {
    raw: '0901234567', e164: '+84901234567',
    scenarios: ['financial_fraud', 'demands_immediate_transfer'],
    reportCount: 68,
    score: 75, level: 'high',
    reasons: ['[RC040] Giả mạo nhân viên ngân hàng', '[RC010] Thúc ép chuyển tiền'],
    confidence: 0.74, action: 'verify',
  },
  {
    raw: '0912345678', e164: '+84912345678',
    scenarios: ['loan_fraud'],
    reportCount: 45,
    score: 72, level: 'high',
    reasons: ['[RC050] Cho vay lãi suất bất thường', '[RC055] Yêu cầu phí trước khi giải ngân'],
    confidence: 0.70, action: 'verify',
  },
  {
    raw: '0933222111', e164: '+84933222111',
    scenarios: ['tech_support_scam'],
    reportCount: 38,
    score: 69, level: 'high',
    reasons: ['[RC060] Mạo danh hỗ trợ kỹ thuật Microsoft/Apple', '[RC065] Yêu cầu truy cập từ xa'],
    confidence: 0.68, action: 'verify',
  },
  {
    raw: '0944555666', e164: '+84944555666',
    scenarios: ['impersonation'],
    reportCount: 31,
    score: 65, level: 'high',
    reasons: ['[RC003] Mạo danh cán bộ thuế', '[RC010] Thúc ép chuyển tiền nộp phạt'],
    confidence: 0.63, action: 'verify',
  },
  {
    raw: '0966777888', e164: '+84966777888',
    scenarios: ['prize_scam'],
    reportCount: 29,
    score: 63, level: 'high',
    reasons: ['[RC031] Trúng thưởng xổ số giả mạo', '[RC015] Yêu cầu đặt cọc để nhận thưởng'],
    confidence: 0.61, action: 'verify',
  },

  // === MEDIUM (score 30–59) ===
  {
    raw: '0909876543', e164: '+84909876543',
    scenarios: ['financial_fraud'],
    reportCount: 18,
    score: 55, level: 'medium',
    reasons: ['[RC070] Mời đầu tư tài chính lợi nhuận cao bất thường'],
    confidence: 0.50, action: 'verify',
  },
  {
    raw: '0922333444', e164: '+84922333444',
    scenarios: ['romance_scam'],
    reportCount: 12,
    score: 48, level: 'medium',
    reasons: ['[RC080] Nghi ngờ lừa đảo tình cảm trực tuyến'],
    confidence: 0.44, action: 'verify',
  },
  {
    raw: '0955111000', e164: '+84955111000',
    scenarios: ['loan_fraud'],
    reportCount: 9,
    score: 42, level: 'medium',
    reasons: ['[RC051] Quảng cáo vay tiền không cần thế chấp'],
    confidence: 0.40, action: 'verify',
  },
  {
    raw: '0978444555', e164: '+84978444555',
    scenarios: ['tech_support_scam'],
    reportCount: 7,
    score: 38, level: 'medium',
    reasons: ['[RC061] Cảnh báo virus giả mạo trên điện thoại'],
    confidence: 0.35, action: 'verify',
  },

  // === LOW (score < 30) — đủ dữ liệu đối chứng ===
  {
    raw: '0912111333', e164: '+84912111333',
    scenarios: ['spam_call'],
    reportCount: 3,
    score: 22, level: 'low',
    reasons: ['[RC090] Cuộc gọi quảng cáo không mong muốn'],
    confidence: 0.20, action: 'allow',
  },
  {
    raw: '0901999000', e164: '+84901999000',
    scenarios: ['spam_call'],
    reportCount: 2,
    score: 15, level: 'low',
    reasons: ['[RC090] Cuộc gọi tiếp thị'],
    confidence: 0.14, action: 'allow',
  },
];

async function main() {
  console.log('🌱 Seeding ScamShield database...\n');

  let reportTotal = 0;
  let scoreTotal = 0;

  for (const phone of PHONES) {
    const phoneHash = hashPhone(phone.e164);

    // Upsert RiskScore
    await prisma.riskScore.upsert({
      where: { phoneHash },
      update: {
        score:      phone.score,
        level:      phone.level,
        reasons:    phone.reasons,
        confidence: phone.confidence,
        action:     phone.action,
      },
      create: {
        phoneHash,
        score:      phone.score,
        level:      phone.level,
        reasons:    phone.reasons,
        confidence: phone.confidence,
        action:     phone.action,
      },
    });
    scoreTotal++;

    // Create reports (one per scenario type, spread over last 30 days)
    const msPerSlot = (30 * 24 * 60 * 60 * 1000) / phone.reportCount;
    for (let i = 0; i < phone.scenarios.length; i++) {
      const reportId = `seed-${phone.e164.replace('+', '')}-${i}`;
      const reportedAt = new Date(Date.now() - msPerSlot * (i + 1));
      await prisma.scamReport.upsert({
        where: { id: reportId },
        update: {},
        create: {
          id: reportId,
          phoneHash,
          scenarioType: phone.scenarios[i],
          reportedAt,
        },
      });
      reportTotal++;
    }

    const icon = phone.level === 'critical' ? '🔴' : phone.level === 'high' ? '🟠' : phone.level === 'medium' ? '🟡' : '🟢';
    console.log(`${icon} ${phone.raw} (${phone.e164}) → score=${phone.score} level=${phone.level} reports=${phone.reportCount}`);
  }

  console.log(`\n✅ Seed complete: ${scoreTotal} risk scores, ${reportTotal} scam reports`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
