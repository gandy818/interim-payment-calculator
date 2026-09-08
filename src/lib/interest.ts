export type Installment = {
  id: string;
  label: string;
  amount: number; // 원
  paidOn: string; // yyyy-mm-dd, 대출 실행일(중도금 납부일)
  ratePct: number; // 연 이자율(%)
};

export type InstallmentResult = {
  id: string;
  days: number;
  interest: number;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function todayISO(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function daysBetween(fromISO: string, toISO: string): number {
  if (!fromISO || !toISO) return 0;
  const from = new Date(fromISO + "T00:00:00");
  const to = new Date(toISO + "T00:00:00");
  const diff = Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
  return Math.max(0, diff);
}

// 단리(單利) 계산: 원금 x 연이자율 x (경과일수 / 365)
export function calcInstallmentInterest(
  installment: Installment,
  baseDateISO: string
): InstallmentResult {
  const days = daysBetween(installment.paidOn, baseDateISO);
  const rawInterest =
    installment.amount * (installment.ratePct / 100) * (days / 365);
  return {
    id: installment.id,
    days,
    interest: Math.round(rawInterest),
  };
}

export function calcAll(
  installments: Installment[],
  baseDateISO: string
): InstallmentResult[] {
  return installments.map((i) => calcInstallmentInterest(i, baseDateISO));
}

export function summarize(
  installments: Installment[],
  results: InstallmentResult[]
) {
  const totalPrincipal = installments.reduce((s, i) => s + (i.amount || 0), 0);
  const totalInterest = results.reduce((s, r) => s + r.interest, 0);
  return {
    totalPrincipal,
    totalInterest,
    totalDue: totalPrincipal + totalInterest,
  };
}

export function formatWon(n: number): string {
  if (!Number.isFinite(n)) return "0원";
  return `${Math.round(n).toLocaleString("ko-KR")}원`;
}

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "";
  return Math.round(n).toLocaleString("ko-KR");
}

export function parseDigits(input: string): number {
  const digits = input.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}
