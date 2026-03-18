import { phiPct } from "./utils";

// ─── Types ───

export interface ProfileScores {
  role: "mom" | "dad";
  z_anxiety: number;
  z_avoidance: number;
  z_openness: number;
  z_conscientiousness: number;
  z_extraversion: number;
  z_agreeableness: number;
  z_neuroticism: number;
  z_conflict: number;
  z_humor: number;
}

export interface PNCAmResult {
  e_llubb: number;
  l_llubb: number;
  esb_score: number;
  csp_score: number;
  pci_score: number;
  stb_score: number;
  esb_grade: "A" | "B" | "C" | "D";
  csp_grade: "A" | "B" | "C" | "D";
  pci_grade: "A" | "B" | "C" | "D";
  stb_grade: "A" | "B" | "C" | "D";
  pcq_score: number;
}

// ─── Helpers ───

function clamp(min: number, max: number, v: number): number {
  return Math.max(min, Math.min(max, v));
}

// v2.0 백분위 기반 등급 커팅포인트
const GRADE_CUTS = {
  esb: { A: 63, B: 54, C: 44 },
  csp: { A: 59, B: 51, C: 43 },
  pci: { A: 58, B: 50, C: 42 },
  stb: { A: 52, B: 42, C: 31 },
} as const;

type Indicator = keyof typeof GRADE_CUTS;

function toGrade(score: number, indicator: Indicator): "A" | "B" | "C" | "D" {
  const cuts = GRADE_CUTS[indicator];
  if (score >= cuts.A) return "A";
  if (score >= cuts.B) return "B";
  if (score >= cuts.C) return "C";
  return "D";
}

// ─── Main Calculator ───

export function calculatePNCAmScores(
  profileA: ProfileScores,
  profileB: ProfileScores,
): PNCAmResult {
  // male/female 결정
  const male = profileA.role === "dad" ? profileA : profileB;
  const female = profileA.role === "mom" ? profileA : profileB;

  // ── E_LLUBB ──
  const zErc_M = 0.6 * male.z_anxiety + 0.4 * male.z_avoidance;
  const zErc_F = 0.6 * female.z_anxiety + 0.4 * female.z_avoidance;
  const avgErc = (phiPct(zErc_M) + phiPct(zErc_F)) / 2;
  const pTrap =
    (phiPct(male.z_anxiety) * phiPct(female.z_avoidance) +
      phiPct(female.z_anxiety) * phiPct(male.z_avoidance)) /
    10000;
  const e_llubb = clamp(0, 100, 100 - avgErc - 20 * pTrap);

  // ── L_LLUBB ──
  const zLong_M = 0.6 * male.z_conflict + 0.4 * male.z_humor;
  const zLong_F = 0.6 * female.z_conflict + 0.4 * female.z_humor;
  const avgLong = (phiPct(zLong_M) + phiPct(zLong_F)) / 2;
  const diffLong = Math.abs(phiPct(zLong_M) - phiPct(zLong_F));
  const l_llubb = clamp(0, 100, avgLong - 0.18 * diffLong);

  // ── EF 정서유연성 ──
  function ef(cw: number, hw: number): number {
    const z_M = cw * male.z_conflict + hw * male.z_humor;
    const z_F = cw * female.z_conflict + hw * female.z_humor;
    const avg = (phiPct(z_M) + phiPct(z_F)) / 2;
    const diff = Math.abs(phiPct(z_M) - phiPct(z_F));
    return clamp(0, 100, avg - 0.18 * diff);
  }
  const efc = ef(0.6, 0.4); // ESB, STB용
  const ef_csp = ef(0.3, 0.7); // CSP용

  // ── Big5 평균 백분위 ──
  const agree_avg =
    (phiPct(male.z_agreeableness) + phiPct(female.z_agreeableness)) / 2;
  const open_avg =
    (phiPct(male.z_openness) + phiPct(female.z_openness)) / 2;
  const extra_avg =
    (phiPct(male.z_extraversion) + phiPct(female.z_extraversion)) / 2;
  const cons_avg =
    (phiPct(male.z_conscientiousness) +
      phiPct(female.z_conscientiousness)) /
    2;
  const neuro_avg =
    (phiPct(male.z_neuroticism) + phiPct(female.z_neuroticism)) / 2;
  const anx_avg =
    (phiPct(male.z_anxiety) + phiPct(female.z_anxiety)) / 2;

  // ── 4대 지표 ──
  const esb_score = clamp(
    0,
    100,
    0.45 * e_llubb + 0.2 * agree_avg + 0.35 * efc,
  );

  const csp_score = clamp(
    0,
    100,
    0.4 * open_avg + 0.25 * extra_avg + 0.35 * ef_csp,
  );

  const cons_diff = Math.abs(
    phiPct(male.z_conscientiousness) - phiPct(female.z_conscientiousness),
  );
  const pci_score = clamp(
    0,
    100,
    (0.65 * cons_avg + 0.35 * l_llubb) *
      (1 - (0.1 * cons_diff) / 100) *
      (1 - (0.2 * neuro_avg) / 100),
  );

  const n_estab = 100 - neuro_avg;
  const stb_score = clamp(
    0,
    100,
    (0.4 * efc + 0.15 * n_estab - 0.15 * anx_avg + 0.3 * l_llubb) / 0.85,
  );

  // ── 등급 & PCQ ──
  const pcq_score = (esb_score + csp_score + pci_score + stb_score) / 4;

  return {
    e_llubb,
    l_llubb,
    esb_score,
    csp_score,
    pci_score,
    stb_score,
    esb_grade: toGrade(esb_score, "esb"),
    csp_grade: toGrade(csp_score, "csp"),
    pci_grade: toGrade(pci_score, "pci"),
    stb_grade: toGrade(stb_score, "stb"),
    pcq_score,
  };
}
