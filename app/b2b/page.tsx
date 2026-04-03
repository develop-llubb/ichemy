"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";

// ── CSS Variables & Keyframes (inline style tag) ──
const CSS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes glow {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.7; }
  }
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .fade-section {
    opacity: 0;
    transform: translateY(28px);
    transition: all 0.7s cubic-bezier(0.22,1,0.36,1);
  }
  .fade-section.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;

// ── Colors ──
const c = {
  bg: "#0A0A0B",
  bgElevated: "#111113",
  bgCard: "#161618",
  bgHover: "#1C1C1F",
  border: "#222225",
  borderLight: "#2A2A2E",
  text: "#EDEDEF",
  textSecondary: "#8B8B8F",
  textMuted: "#5C5C60",
  accent: "#6EE7B7",
  accentDim: "rgba(110,231,183,0.12)",
  warm: "#F4A261",
  coral: "#E76F51",
};

// ── Intersection Observer Hook ──
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

// ── Section with fade-in ──
function Section({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={`fade-section ${visible ? "visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

// ── Badge ──
function Badge({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full text-xs font-semibold"
      style={{
        padding: "6px 14px",
        background: c.accentDim,
        border: "1px solid rgba(110,231,183,0.15)",
        color: c.accent,
        letterSpacing: 0.3,
      }}
    >
      {children}
    </span>
  );
}

// ── Stat ──
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div
        className="font-[var(--font-outfit)] text-5xl font-extrabold leading-none"
        style={{
          fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
          letterSpacing: -2,
          background: `linear-gradient(135deg, ${c.accent}, #A7F3D0)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {value}
      </div>
      <div
        className="mt-2 text-[13px] font-normal"
        style={{ color: c.textSecondary }}
      >
        {label}
      </div>
    </div>
  );
}

// ── Main Page ──
export default function B2BLanding() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setTimeout(() => setReady(true), 100);
  }, []);

  const ease = (d = 0) => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(24px)",
    transition: `all 0.7s cubic-bezier(0.22,1,0.36,1) ${d}s`,
  });

  return (
    <>
      <style>{CSS}</style>
      <div
        className="min-h-screen font-[var(--font-noto)]"
        style={{
          background: c.bg,
          color: c.text,
          fontFamily: "var(--font-noto), 'Noto Sans KR', sans-serif",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        {/* ══════ NAV ══════ */}
        <nav
          className="fixed inset-x-0 top-0 z-[100] flex items-center justify-between px-8 py-4"
          style={{
            background: "rgba(10,10,11,0.8)",
            backdropFilter: "blur(16px)",
            borderBottom: `1px solid ${c.border}`,
          }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="text-xl font-bold tracking-wider"
              style={{
                fontFamily: "var(--font-jua), 'Jua', sans-serif",
                color: "#FFFFFF",
              }}
            >
              아이케미
            </span>
            <span
              className="rounded text-[10px] font-semibold"
              style={{
                color: c.accent,
                background: c.accentDim,
                padding: "2px 8px",
              }}
            >
              B2B
            </span>
          </div>
          <button
            className="rounded-lg border-none px-5 py-2 text-[13px] font-semibold"
            style={{
              background: c.accent,
              color: "#0A0A0B",
              fontFamily: "var(--font-noto), 'Noto Sans KR', sans-serif",
              cursor: "pointer",
            }}
          >
            도입 문의
          </button>
        </nav>

        {/* ══════ HERO ══════ */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-[120px] text-center">
          {/* Ambient glow */}
          <div
            className="pointer-events-none absolute left-1/2 top-[20%]"
            style={{
              transform: "translateX(-50%)",
              width: 600,
              height: 400,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(110,231,183,0.08) 0%, transparent 70%)",
              filter: "blur(80px)",
              animation: "glow 6s ease-in-out infinite",
            }}
          />

          <div style={ease(0)}>
            <Badge>Insurance B2B Data Solution</Badge>
          </div>

          <h1
            className="mx-auto mt-8 max-w-[720px] font-black leading-[1.2]"
            style={{
              fontFamily: "var(--font-noto), 'Noto Sans KR', sans-serif",
              fontSize: "clamp(36px, 5.5vw, 64px)",
              letterSpacing: -2,
              ...ease(0.08),
            }}
          >
            리포트 한 장이
            <br />
            <span
              style={{
                background: `linear-gradient(135deg, ${c.accent}, #A7F3D0, ${c.warm})`,
                backgroundSize: "200% 200%",
                animation: "gradientShift 4s ease infinite",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              10년 계약
            </span>
            을 만듭니다
          </h1>

          <p
            className="mx-auto mt-6 max-w-[480px] text-[17px] font-light leading-[1.7]"
            style={{ color: c.textSecondary, ...ease(0.16) }}
          >
            어린이·자녀 보험 영업의 판도를 바꾸는
            <br />
            데이터 기반 맞춤형 보험 컨설팅 시스템
          </p>

          <div className="mt-10 flex gap-3" style={ease(0.24)}>
            <button
              className="rounded-[10px] border-none px-8 py-3.5 text-[15px] font-bold"
              style={{
                background: c.accent,
                color: "#0A0A0B",
                fontFamily: "var(--font-noto), 'Noto Sans KR', sans-serif",
                cursor: "pointer",
              }}
            >
              도입 상담 신청 →
            </button>
            <button
              className="rounded-[10px] px-7 py-3.5 text-[15px] font-medium"
              style={{
                background: "transparent",
                color: c.text,
                border: `1px solid ${c.borderLight}`,
                fontFamily: "var(--font-noto), 'Noto Sans KR', sans-serif",
                cursor: "pointer",
              }}
            >
              데모 보기
            </button>
          </div>

          {/* Stats */}
          <div className="mt-20 flex gap-16" style={ease(0.32)}>
            <Stat value="4분" label="설문 소요 시간" />
            <Stat value="256" label="맞춤형 리포트 조합" />
            <Stat value="10년" label="고객 터치포인트" />
          </div>
        </section>

        {/* ══════ PAIN POINTS ══════ */}
        <section className="mx-auto max-w-[960px] px-6 py-[100px]">
          <Section>
            <div className="mb-[60px] text-center">
              <Badge>Problem</Badge>
              <h2 className="mt-5 text-4xl font-extrabold leading-[1.3]" style={{ letterSpacing: -1.5 }}>
                보험 설계사가 매일 마주하는
                <br />
                <span style={{ color: c.textMuted }}>3개의 거대한 벽</span>
              </h2>
            </div>
          </Section>

          <div className="flex flex-col gap-4">
            {[
              {
                num: "01",
                title: "초회 면담의 장벽",
                desc: '"보험 얘기하러 왔습니다"라는 말조차 꺼내기 힘든 현실. 상품설명 이전에 문이 닫힙니다.',
                color: c.coral,
              },
              {
                num: "02",
                title: "배우자 동석의 한계",
                desc: "자녀 보험은 부부 공동 의사 결정이지만, 부모 양측을 한자리에 모으는 것은 현실적으로 불가능에 가깝습니다.",
                color: c.warm,
              },
              {
                num: "03",
                title: "계약 후 관계 단절",
                desc: "가입이 끝나는 순간 접점이 사라집니다. 2년 뒤 리모델링을 제안하려 해도 낯선 사람처럼 느껴집니다.",
                color: "#F4A261",
              },
            ].map((item, i) => (
              <Section key={i} delay={i * 0.08}>
                <div
                  className="flex gap-6 rounded-2xl p-7"
                  style={{
                    background: c.bgCard,
                    border: `1px solid ${c.border}`,
                  }}
                >
                  <span
                    className="shrink-0 pt-0.5 text-[28px] font-extrabold leading-none"
                    style={{
                      fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
                      color: item.color,
                      opacity: 0.4,
                    }}
                  >
                    {item.num}
                  </span>
                  <div>
                    <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                    <p
                      className="text-sm font-light leading-[1.7]"
                      style={{ color: c.textSecondary }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              </Section>
            ))}
          </div>

          <Section delay={0.2}>
            <div
              className="mt-8 rounded-[10px] p-4 text-center text-sm font-medium"
              style={{
                background: "rgba(231,111,81,0.08)",
                border: "1px solid rgba(231,111,81,0.12)",
                color: c.coral,
              }}
            >
              감(感)과 친분에 의존하는 푸시(Push) 영업은 한계에 도달했습니다.
            </div>
          </Section>
        </section>

        {/* ══════ SOLUTION ══════ */}
        <section className="mx-auto max-w-[960px] px-6 py-[100px]">
          <Section>
            <div className="mb-[60px] text-center">
              <Badge>Solution</Badge>
              <h2 className="mt-5 text-4xl font-extrabold leading-[1.3]" style={{ letterSpacing: -1.5 }}>
                기존 영업 방식은 잊으세요
                <br />
                <span
                  style={{
                    background: `linear-gradient(135deg, ${c.accent}, #A7F3D0)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  데이터가 영업합니다
                </span>
              </h2>
            </div>
          </Section>

          <div className="flex flex-col gap-3">
            {[
              {
                label: "초기 접점",
                before: "상품 안내 및 가입 권유 → 높은 거절률",
                after: "'4분만 내주시면 맞춤 리포트를 무료로 드립니다' → 압도적 수락률",
              },
              {
                label: "의사결정자",
                before: "엄마 또는 아빠 단독 면담 → 취소율 증가",
                after: "부부 동시 참여 및 데이터 공유 → 안정적 계약 유지",
              },
              {
                label: "니즈 파악",
                before: "질문을 통한 막연한 추측",
                after: "심리학/학업 데이터(PNCAM) 기반 정밀 보험 니즈 진단",
              },
              {
                label: "고객 유지",
                before: "1회성 판매 후 단절",
                after: "자녀 성장에 맞춘 연령별 리포트 정기 업데이트 → 평생 고객화",
              },
            ].map((item, i) => (
              <Section key={i} delay={i * 0.06}>
                <div
                  className="rounded-[14px] px-6 py-5"
                  style={{
                    background: c.bgCard,
                    border: `1px solid ${c.border}`,
                  }}
                >
                  <Badge>{item.label}</Badge>
                  <p
                    className="mt-2.5 text-[13px] font-light leading-[1.6]"
                    style={{ color: c.textSecondary }}
                  >
                    {item.before}
                  </p>
                  <p
                    className="mt-1.5 text-[13px] font-medium leading-[1.6]"
                    style={{ color: c.accent }}
                  >
                    → {item.after}
                  </p>
                </div>
              </Section>
            ))}
          </div>
        </section>

        {/* ══════ 4 MODULES ══════ */}
        <section className="mx-auto max-w-[960px] px-6 py-[100px]">
          <Section>
            <div className="mb-[60px] text-center">
              <Badge>4-Module System</Badge>
              <h2 className="mt-5 text-4xl font-extrabold leading-[1.3]" style={{ letterSpacing: -1.5 }}>
                단 4분의 설문으로 완성되는
                <br />
                <span style={{ color: c.accent }}>256가지</span> 맞춤형 프리미엄 리포트
              </h2>
              <p
                className="mt-4 text-sm font-light"
                style={{ color: c.textSecondary }}
              >
                기본 3분 + 보충 1분
              </p>
            </div>
          </Section>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                module: "A",
                title: "육아 성향",
                desc: "심리학 기반 부부 양육 스타일 분석",
                sub: "가족 구성 및 가치관 자연 파악",
                color: c.accent,
                bg: "rgba(110,231,183,0.06)",
              },
              {
                module: "B",
                title: "육아 케어",
                desc: "PNCAM 4개 지표 기반 환경 진단",
                sub: "지표별 상세 분석 제공",
                color: "#67D4F1",
                bg: "rgba(103,212,241,0.06)",
              },
              {
                module: "C",
                title: "학습 케어 코어",
                desc: "학습 방향 및 부모 역할 가이드",
                sub: "교육 관련 상품과 자연스러운 연계",
                color: c.warm,
                bg: "rgba(244,162,97,0.06)",
              },
              {
                module: "D",
                title: "과목 심화 카드",
                desc: "과목별 심층 분석 및 실천 팁",
                sub: "자녀 잠재력에 대한 투자 마인드 고취",
                color: "#C084FC",
                bg: "rgba(192,132,252,0.06)",
              },
            ].map((item, i) => (
              <Section key={i} delay={i * 0.06}>
                <div
                  className="h-full rounded-2xl px-6 py-7"
                  style={{
                    background: item.bg,
                    border: `1px solid ${item.color}15`,
                  }}
                >
                  <span
                    className="text-[11px] font-bold tracking-widest"
                    style={{
                      fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
                      color: item.color,
                    }}
                  >
                    MODULE {item.module}
                  </span>
                  <h3 className="mb-2.5 mt-2.5 text-xl font-bold">
                    {item.title}
                  </h3>
                  <p
                    className="text-[13px] font-light leading-[1.6]"
                    style={{ color: c.textSecondary }}
                  >
                    {item.desc}
                  </p>
                  <p
                    className="mt-2 text-[11px] font-normal"
                    style={{ color: c.textMuted }}
                  >
                    {item.sub}
                  </p>
                </div>
              </Section>
            ))}
          </div>
        </section>

        {/* ══════ PIPELINE ══════ */}
        <section className="mx-auto max-w-[960px] px-6 py-[100px]">
          <Section>
            <div className="mb-[60px] text-center">
              <Badge>Lifetime Pipeline</Badge>
              <h2 className="mt-5 text-4xl font-extrabold" style={{ letterSpacing: -1.5 }}>
                끊임없이 이어지는 10년의 고객 터치포인트
              </h2>
            </div>
          </Section>

          <div className="flex flex-col">
            {[
              {
                age: "5세",
                stage: "유치부",
                action: "첫 만남 · 맞춤형 육아/배움 컨설팅",
                insurance: "첫 어린이 보험 가입 및 부모 건강보험 점검",
                active: true,
              },
              {
                age: "8세",
                stage: "초등부",
                action: "'아이가 초등학교에 입학했네요, 리포트 업데이트 해드릴게요.'",
                insurance: "학자금 저축 플랜 및 보장 확대 제안",
                active: false,
              },
              {
                age: "11세",
                stage: "고학년",
                action: "학습 습관 및 강점 과목 재확인",
                insurance: "장기 저축성 보험 및 변액 보험 리뷰",
                active: false,
              },
              {
                age: "14세",
                stage: "중등부",
                action: "본격적인 입시/진로 방향성 도출",
                insurance: "부모 소득보장 강화 및 목적자금 설계 완성",
                active: false,
              },
            ].map((item, i, arr) => (
              <Section key={i} delay={i * 0.06}>
                <div className="flex gap-5">
                  {/* Timeline */}
                  <div className="flex w-12 shrink-0 flex-col items-center">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        background: item.active ? c.accent : c.borderLight,
                        boxShadow: item.active
                          ? "0 0 12px rgba(110,231,183,0.4)"
                          : "none",
                      }}
                    />
                    {i < arr.length - 1 && (
                      <div
                        className="min-h-[40px] flex-1"
                        style={{ width: 1, background: c.border }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-8">
                    <div className="mb-2 flex items-center gap-2.5">
                      <span
                        className="text-2xl font-extrabold"
                        style={{
                          fontFamily:
                            "var(--font-outfit), 'Outfit', sans-serif",
                          color: item.active ? c.accent : c.textMuted,
                        }}
                      >
                        {item.age}
                      </span>
                      <span
                        className="rounded-md text-xs font-semibold"
                        style={{
                          color: c.textMuted,
                          padding: "3px 10px",
                          background: c.bgCard,
                          border: `1px solid ${c.border}`,
                        }}
                      >
                        {item.stage}
                      </span>
                    </div>
                    <p
                      className="mb-1.5 text-sm font-light leading-[1.5]"
                      style={{ color: c.textSecondary }}
                    >
                      {item.action}
                    </p>
                    <p
                      className="text-[13px] font-medium"
                      style={{ color: c.accent }}
                    >
                      → {item.insurance}
                    </p>
                  </div>
                </div>
              </Section>
            ))}
          </div>

          <Section delay={0.3}>
            <div
              className="mt-4 rounded-[10px] p-4 text-center text-sm font-medium"
              style={{
                background: c.accentDim,
                border: "1px solid rgba(110,231,183,0.12)",
                color: c.accent,
              }}
            >
              단 한 번의 판매가 아닌, 평생의 &apos;가족 데이터 컨설턴트&apos;로
              동행합니다.
            </div>
          </Section>
        </section>

        {/* ══════ PRIVACY ══════ */}
        <section className="mx-auto max-w-[960px] px-6 py-[100px]">
          <Section>
            <div className="mb-[60px] text-center">
              <Badge>Privacy &amp; Security</Badge>
              <h2 className="mt-5 text-4xl font-extrabold" style={{ letterSpacing: -1.5 }}>
                강력한 프라이버시 보호
              </h2>
            </div>
          </Section>

          <div className="grid grid-cols-2 gap-4">
            <Section>
              <div
                className="h-full rounded-2xl px-7 py-8"
                style={{
                  background: c.bgCard,
                  border: `1px solid ${c.border}`,
                }}
              >
                <div
                  className="mb-4 text-[11px] font-bold tracking-widest"
                  style={{ color: c.textMuted }}
                >
                  AGENT VIEW
                </div>
                <h3 className="mb-3 text-lg font-bold">설계사 요약 뷰</h3>
                <p
                  className="text-[13px] font-light leading-[1.7]"
                  style={{ color: c.textSecondary }}
                >
                  영업에 꼭 필요한 &apos;방향성 데이터&apos;만 제공됩니다.
                  ESB·CSP·PCI·STB 등급표와 과목별 강점/보강 요약. 민감한 부부
                  갈등 점수나 원점수는 철저히 블라인드 처리됩니다.
                </p>
              </div>
            </Section>
            <Section delay={0.08}>
              <div
                className="h-full rounded-2xl px-7 py-8"
                style={{
                  background: "rgba(110,231,183,0.04)",
                  border: "1px solid rgba(110,231,183,0.1)",
                }}
              >
                <div
                  className="mb-4 text-[11px] font-bold tracking-widest"
                  style={{ color: c.accent }}
                >
                  PARENT VIEW
                </div>
                <h3 className="mb-3 text-lg font-bold">학부모 전체 리포트</h3>
                <p
                  className="text-[13px] font-light leading-[1.7]"
                  style={{ color: c.textSecondary }}
                >
                  학부모에게는 앱을 통해 3,000자 이상의 상세한 심리 분석과
                  맞춤형 실천 조언이 담긴 전체 리포트가 전달됩니다.
                </p>
              </div>
            </Section>
          </div>

          <Section delay={0.16}>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {[
                "개인정보보호법 준수",
                "Row-Level Security",
                "데이터 완전 격리",
                "학부모 동의 기반 공유",
              ].map((tag, i) => (
                <span
                  key={i}
                  className="rounded-lg text-xs font-normal"
                  style={{
                    padding: "6px 14px",
                    background: c.bgCard,
                    border: `1px solid ${c.border}`,
                    color: c.textSecondary,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </Section>
        </section>

        {/* ══════ FUNNEL ══════ */}
        <section className="mx-auto max-w-[960px] px-6 py-[100px]">
          <Section>
            <div className="mb-[60px] text-center">
              <Badge>Sales Engine</Badge>
              <h2 className="mt-5 text-4xl font-extrabold" style={{ letterSpacing: -1.5 }}>
                궁극의 보험 세일즈 엔진
              </h2>
            </div>
          </Section>

          <div className="flex flex-col gap-0.5">
            {[
              {
                step: "1",
                title: "Touchpoint",
                subtitle: "발송",
                desc: "아이케미 프리미엄 리포트를 카카오톡으로 선물하여 호기심 유발",
                width: "100%",
                color: c.accent,
                bg: "rgba(110,231,183,0.06)",
              },
              {
                step: "2",
                title: "Engagement",
                subtitle: "몰입",
                desc: "부부 동반 설문 참여 및 결과 확인, 육아 성향에 대한 깊은 공감과 감동",
                width: "82%",
                color: "#67D4F1",
                bg: "rgba(103,212,241,0.06)",
              },
              {
                step: "3",
                title: "Trust Bridge",
                subtitle: "신뢰 구축",
                desc: "FC 대시보드 요약 뷰 확인 후, 부모의 고민에 맞춘 전문적인 상담",
                width: "64%",
                color: c.warm,
                bg: "rgba(244,162,97,0.06)",
              },
              {
                step: "4",
                title: "Conversion",
                subtitle: "계약 연계",
                desc: "리포트 지표를 자연스럽게 태아/영유아/가족 보험 보장 니즈로 연결하여 최종 계약 성사",
                width: "46%",
                color: "#F97316",
                bg: "rgba(249,115,22,0.08)",
              },
            ].map((item, i) => (
              <Section key={i} delay={i * 0.08}>
                <div
                  className="mx-auto rounded-[14px] px-7 py-6"
                  style={{
                    width: item.width,
                    background: item.bg,
                    border: `1px solid ${item.color}18`,
                  }}
                >
                  <div className="mb-2 flex items-center gap-3">
                    <span
                      className="text-[13px] font-bold"
                      style={{
                        fontFamily:
                          "var(--font-outfit), 'Outfit', sans-serif",
                        color: item.color,
                      }}
                    >
                      {item.step}. {item.title}
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ color: c.textMuted }}
                    >
                      ({item.subtitle})
                    </span>
                  </div>
                  <p
                    className="text-[13px] font-light leading-[1.6]"
                    style={{ color: c.textSecondary }}
                  >
                    {item.desc}
                  </p>
                </div>
              </Section>
            ))}
          </div>
        </section>

        {/* ══════ CTA ══════ */}
        <section className="relative px-6 py-[200px] text-center">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2"
            style={{
              transform: "translate(-50%, -50%)",
              width: 500,
              height: 300,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(110,231,183,0.06) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <Section>
            <h2
              className="relative mb-5 font-extrabold leading-[1.3]"
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                letterSpacing: -1.5,
              }}
            >
              데이터가 문을 열고,
              <br />
              신뢰가 계약을 완성합니다
            </h2>
            <p
              className="relative mb-10 text-base font-light"
              style={{ color: c.textSecondary }}
            >
              아이케미 B2B 도입 상담을 신청하세요.
            </p>
            <button
              className="relative rounded-xl border-none px-12 py-4 text-base font-bold"
              style={{
                background: c.accent,
                color: "#0A0A0B",
                fontFamily: "var(--font-noto), 'Noto Sans KR', sans-serif",
                cursor: "pointer",
              }}
            >
              도입 상담 신청 →
            </button>
          </Section>
        </section>

        {/* ══════ FOOTER ══════ */}
        <footer
          className="mx-auto max-w-[960px] px-8 py-10"
          style={{ borderTop: `1px solid ${c.border}` }}
        >
          <div className="space-y-0.5 text-center text-[10px] leading-[1.6]" style={{ color: c.textMuted }}>
            <div>주식회사 LLUBB · 대표 김유승</div>
            <div>사업자등록번호 880-87-03398</div>
            <div>통신판매업 제2025-용인기흥-0000호</div>
            <div>경기도 용인시 기흥구 덕영대로2077번길 8, 103동 1201호</div>
            <div>010-3082-3241 · yskim@llubb.com</div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <a href="/terms" className="underline" style={{ color: c.textMuted }}>이용약관</a>
              <span>·</span>
              <a href="/privacy" className="underline" style={{ color: c.textMuted }}>개인정보처리방침</a>
            </div>
            <div className="pt-1">© 2025 LLUBB</div>
          </div>
        </footer>
      </div>
    </>
  );
}
