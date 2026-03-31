import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 표준정규분포 CDF Φ(z) 근사 (0~1 사이).
 * Abramowitz & Stegun 근사식.
 */
export function normalCdf(z: number): number {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1 / (1 + p * x);
  const y =
    1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1 + sign * y);
}

/** Φ(z)를 0~100 백분위로 변환 */
export function phiPct(z: number): number {
  return normalCdf(z) * 100;
}

/** 0~100 점수를 1~5 레벨로 변환 */
export function scoreToLevel(score: number): number {
  if (score < 20) return 1;
  if (score < 40) return 2;
  if (score < 60) return 3;
  if (score < 80) return 4;
  return 5;
}

/** 필요한 z값이 null이면 에러를 던지는 헬퍼 */
export function nz(value: number | null, name: string): number {
  if (value === null || Number.isNaN(value)) {
    throw new Error(`필요한 z-score(${name})가 없습니다.`);
  }
  return value;
}
