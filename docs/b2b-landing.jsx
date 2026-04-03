import { useState, useEffect, useRef } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Noto+Sans+KR:wght@300;400;500;600;700;800;900&display=swap');

  :root {
    --bg: #0A0A0B;
    --bg-elevated: #111113;
    --bg-card: #161618;
    --bg-hover: #1C1C1F;
    --border: #222225;
    --border-light: #2A2A2E;
    --text: #EDEDEF;
    --text-secondary: #8B8B8F;
    --text-muted: #5C5C60;
    --accent: #6EE7B7;
    --accent-dim: rgba(110,231,183,0.12);
    --accent-glow: rgba(110,231,183,0.06);
    --warm: #F4A261;
    --coral: #E76F51;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Noto Sans KR', 'Outfit', sans-serif;
    background: var(--bg);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes glow {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.7; }
  }
  @keyframes slideRight {
    from { width: 0%; }
    to { width: 100%; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
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

// ── Intersection Observer Hook ──
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Section({ children, delay = 0, className = "" }) {
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
function Badge({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: 100,
        background: "var(--accent-dim)",
        border: "1px solid rgba(110,231,183,0.15)",
        fontSize: 12,
        fontWeight: 600,
        color: "var(--accent)",
        letterSpacing: 0.3,
      }}
    >
      {children}
    </span>
  );
}

// ── Stat ──
function Stat({ value, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 48,
          fontWeight: 800,
          letterSpacing: -2,
          background: "linear-gradient(135deg, var(--accent), #A7F3D0)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8, fontWeight: 400 }}>
        {label}
      </div>
    </div>
  );
}

// ── Main Page ──
export default function B2BLanding() {
  const [ready, setReady] = useState(false);
  useEffect(() => { setTimeout(() => setReady(true), 100); }, []);

  const ease = (d = 0) => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(24px)",
    transition: `all 0.7s cubic-bezier(0.22,1,0.36,1) ${d}s`,
  });

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

        {/* ══════ NAV ══════ */}
        <nav
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            padding: "16px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(10,10,11,0.8)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: -0.5,
                color: "var(--text)",
              }}
            >
              i-Chemy
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "var(--accent)",
                background: "var(--accent-dim)",
                padding: "2px 8px",
                borderRadius: 4,
              }}
            >
              B2B
            </span>
          </div>
          <button
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              background: "var(--accent)",
              color: "#0A0A0B",
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Noto Sans KR', sans-serif",
            }}
          >
            도입 문의
          </button>
        </nav>

        {/* ══════ HERO ══════ */}
        <section
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "120px 24px 80px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Ambient glow */}
          <div
            style={{
              position: "absolute",
              top: "20%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 600,
              height: 400,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(110,231,183,0.08) 0%, transparent 70%)",
              filter: "blur(80px)",
              pointerEvents: "none",
              animation: "glow 6s ease-in-out infinite",
            }}
          />

          <div style={ease(0)}>
            <Badge>Insurance B2B Data Solution</Badge>
          </div>

          <h1
            style={{
              marginTop: 32,
              fontFamily: "'Noto Sans KR', sans-serif",
              fontSize: "clamp(36px, 5.5vw, 64px)",
              fontWeight: 900,
              lineHeight: 1.2,
              letterSpacing: -2,
              maxWidth: 720,
              ...ease(0.08),
            }}
          >
            리포트 한 장이
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, var(--accent), #A7F3D0, var(--warm))",
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
            style={{
              marginTop: 24,
              fontSize: 17,
              lineHeight: 1.7,
              color: "var(--text-secondary)",
              maxWidth: 480,
              fontWeight: 300,
              ...ease(0.16),
            }}
          >
            어린이·자녀 보험 영업의 판도를 바꾸는
            <br />
            데이터 기반 맞춤형 보험 컨설팅 시스템
          </p>

          <div
            style={{
              marginTop: 40,
              display: "flex",
              gap: 12,
              ...ease(0.24),
            }}
          >
            <button
              style={{
                padding: "14px 32px",
                borderRadius: 10,
                background: "var(--accent)",
                color: "#0A0A0B",
                border: "none",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Noto Sans KR', sans-serif",
              }}
            >
              도입 상담 신청 →
            </button>
            <button
              style={{
                padding: "14px 28px",
                borderRadius: 10,
                background: "transparent",
                color: "var(--text)",
                border: "1px solid var(--border-light)",
                fontSize: 15,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'Noto Sans KR', sans-serif",
              }}
            >
              데모 보기
            </button>
          </div>

          {/* Stats */}
          <div
            style={{
              marginTop: 80,
              display: "flex",
              gap: 64,
              ...ease(0.32),
            }}
          >
            <Stat value="4분" label="설문 소요 시간" />
            <Stat value="256" label="맞춤형 리포트 조합" />
            <Stat value="10년" label="고객 터치포인트" />
          </div>
        </section>

        {/* ══════ PAIN POINTS ══════ */}
        <section style={{ padding: "100px 24px", maxWidth: 960, margin: "0 auto" }}>
          <Section>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <Badge>Problem</Badge>
              <h2
                style={{
                  marginTop: 20,
                  fontSize: 36,
                  fontWeight: 800,
                  letterSpacing: -1.5,
                  lineHeight: 1.3,
                }}
              >
                보험 설계사가 매일 마주하는
                <br />
                <span style={{ color: "var(--text-muted)" }}>3개의 거대한 벽</span>
              </h2>
            </div>
          </Section>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                num: "01",
                title: "초회 면담의 장벽",
                desc: '"보험 얘기하러 왔습니다"라는 말조차 꺼내기 힘든 현실. 상품설명 이전에 문이 닫힙니다.',
                color: "var(--coral)",
              },
              {
                num: "02",
                title: "배우자 동석의 한계",
                desc: "자녀 보험은 부부 공동 의사 결정이지만, 부모 양측을 한자리에 모으는 것은 현실적으로 불가능에 가깝습니다.",
                color: "var(--warm)",
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
                  style={{
                    display: "flex",
                    gap: 24,
                    padding: "28px 28px",
                    borderRadius: 16,
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    transition: "border-color 0.3s ease",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 28,
                      fontWeight: 800,
                      color: item.color,
                      opacity: 0.4,
                      flexShrink: 0,
                      lineHeight: 1,
                      paddingTop: 2,
                    }}
                  >
                    {item.num}
                  </span>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)", fontWeight: 300 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </Section>
            ))}
          </div>

          <Section delay={0.2}>
            <div
              style={{
                marginTop: 32,
                padding: "16px 24px",
                borderRadius: 10,
                background: "rgba(231,111,81,0.08)",
                border: "1px solid rgba(231,111,81,0.12)",
                textAlign: "center",
                fontSize: 14,
                color: "var(--coral)",
                fontWeight: 500,
              }}
            >
              감(感)과 친분에 의존하는 푸시(Push) 영업은 한계에 도달했습니다.
            </div>
          </Section>
        </section>

        {/* ══════ SOLUTION ══════ */}
        <section style={{ padding: "100px 24px", maxWidth: 960, margin: "0 auto" }}>
          <Section>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <Badge>Solution</Badge>
              <h2
                style={{
                  marginTop: 20,
                  fontSize: 36,
                  fontWeight: 800,
                  letterSpacing: -1.5,
                  lineHeight: 1.3,
                }}
              >
                기존 영업 방식은 잊으세요
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, var(--accent), #A7F3D0)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  데이터가 영업합니다
                </span>
              </h2>
            </div>
          </Section>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              {
                label: "초기 접점",
                before: '상품 안내 및 가입 권유 → 높은 거절률',
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
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr 40px 1fr",
                    alignItems: "center",
                    gap: 16,
                    padding: "20px 24px",
                    borderRadius: 14,
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.5 }}>
                    {item.before}
                  </span>
                  <span style={{ textAlign: "center", fontSize: 16, color: "var(--accent)" }}>→</span>
                  <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500, lineHeight: 1.5 }}>
                    {item.after}
                  </span>
                </div>
              </Section>
            ))}
          </div>
        </section>

        {/* ══════ 4 MODULES ══════ */}
        <section
          style={{
            padding: "100px 24px",
            maxWidth: 960,
            margin: "0 auto",
          }}
        >
          <Section>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <Badge>4-Module System</Badge>
              <h2
                style={{
                  marginTop: 20,
                  fontSize: 36,
                  fontWeight: 800,
                  letterSpacing: -1.5,
                  lineHeight: 1.3,
                }}
              >
                단 4분의 설문으로 완성되는
                <br />
                <span style={{ color: "var(--accent)" }}>256가지</span> 맞춤형 프리미엄 리포트
              </h2>
              <p style={{ marginTop: 16, fontSize: 14, color: "var(--text-secondary)", fontWeight: 300 }}>
                기본 3분 + 보충 1분
              </p>
            </div>
          </Section>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              {
                module: "A",
                title: "육아 성향",
                desc: "심리학 기반 부부 양육 스타일 분석",
                sub: "가족 구성 및 가치관 자연 파악",
                color: "var(--accent)",
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
                color: "var(--warm)",
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
                  style={{
                    padding: "28px 24px",
                    borderRadius: 16,
                    background: item.bg,
                    border: `1px solid ${item.color}15`,
                    height: "100%",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 1,
                      color: item.color,
                    }}
                  >
                    MODULE {item.module}
                  </span>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 10, marginBottom: 10 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, fontWeight: 300 }}>
                    {item.desc}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, fontWeight: 400 }}>
                    {item.sub}
                  </p>
                </div>
              </Section>
            ))}
          </div>
        </section>

        {/* ══════ PIPELINE ══════ */}
        <section style={{ padding: "100px 24px", maxWidth: 960, margin: "0 auto" }}>
          <Section>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <Badge>Lifetime Pipeline</Badge>
              <h2 style={{ marginTop: 20, fontSize: 36, fontWeight: 800, letterSpacing: -1.5 }}>
                끊임없이 이어지는 10년의 고객 터치포인트
              </h2>
            </div>
          </Section>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
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
            ].map((item, i) => (
              <Section key={i} delay={i * 0.06}>
                <div style={{ display: "flex", gap: 20 }}>
                  {/* Timeline */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      flexShrink: 0,
                      width: 48,
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: item.active ? "var(--accent)" : "var(--border-light)",
                        boxShadow: item.active ? "0 0 12px rgba(110,231,183,0.4)" : "none",
                      }}
                    />
                    {i < 3 && (
                      <div
                        style={{
                          width: 1,
                          flex: 1,
                          minHeight: 40,
                          background: "var(--border)",
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ paddingBottom: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: 24,
                          fontWeight: 800,
                          color: item.active ? "var(--accent)" : "var(--text-muted)",
                        }}
                      >
                        {item.age}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--text-muted)",
                          padding: "3px 10px",
                          borderRadius: 6,
                          background: "var(--bg-card)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {item.stage}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 6, fontWeight: 300, lineHeight: 1.5 }}>
                      {item.action}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>
                      → {item.insurance}
                    </p>
                  </div>
                </div>
              </Section>
            ))}
          </div>

          <Section delay={0.3}>
            <div
              style={{
                marginTop: 16,
                padding: "16px 24px",
                borderRadius: 10,
                background: "var(--accent-dim)",
                border: "1px solid rgba(110,231,183,0.12)",
                textAlign: "center",
                fontSize: 14,
                color: "var(--accent)",
                fontWeight: 500,
              }}
            >
              단 한 번의 판매가 아닌, 평생의 '가족 데이터 컨설턴트'로 동행합니다.
            </div>
          </Section>
        </section>

        {/* ══════ PRIVACY ══════ */}
        <section style={{ padding: "100px 24px", maxWidth: 960, margin: "0 auto" }}>
          <Section>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <Badge>Privacy & Security</Badge>
              <h2 style={{ marginTop: 20, fontSize: 36, fontWeight: 800, letterSpacing: -1.5 }}>
                강력한 프라이버시 보호
              </h2>
            </div>
          </Section>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Section>
              <div
                style={{
                  padding: "32px 28px",
                  borderRadius: 16,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    letterSpacing: 1,
                    marginBottom: 16,
                  }}
                >
                  AGENT VIEW
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>설계사 요약 뷰</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, fontWeight: 300 }}>
                  영업에 꼭 필요한 '방향성 데이터'만 제공됩니다.
                  ESB·CSP·PCI·STB 등급표와 과목별 강점/보강 요약.
                  민감한 부부 갈등 점수나 원점수는 철저히 블라인드 처리됩니다.
                </p>
              </div>
            </Section>
            <Section delay={0.08}>
              <div
                style={{
                  padding: "32px 28px",
                  borderRadius: 16,
                  background: "rgba(110,231,183,0.04)",
                  border: "1px solid rgba(110,231,183,0.1)",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--accent)",
                    letterSpacing: 1,
                    marginBottom: 16,
                  }}
                >
                  PARENT VIEW
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>학부모 전체 리포트</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, fontWeight: 300 }}>
                  학부모에게는 앱을 통해 3,000자 이상의 상세한 심리 분석과
                  맞춤형 실천 조언이 담긴 전체 리포트가 전달됩니다.
                </p>
              </div>
            </Section>
          </div>

          <Section delay={0.16}>
            <div
              style={{
                marginTop: 20,
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {[
                "개인정보보호법 준수",
                "Row-Level Security",
                "데이터 완전 격리",
                "학부모 동의 기반 공유",
              ].map((tag, i) => (
                <span
                  key={i}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    fontWeight: 400,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </Section>
        </section>

        {/* ══════ FUNNEL ══════ */}
        <section style={{ padding: "100px 24px", maxWidth: 960, margin: "0 auto" }}>
          <Section>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <Badge>Sales Engine</Badge>
              <h2 style={{ marginTop: 20, fontSize: 36, fontWeight: 800, letterSpacing: -1.5 }}>
                궁극의 보험 세일즈 엔진
              </h2>
            </div>
          </Section>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              {
                step: "1",
                title: "Touchpoint",
                subtitle: "발송",
                desc: "i-Chemy 프리미엄 리포트를 카카오톡으로 선물하여 호기심 유발",
                width: "100%",
                color: "var(--accent)",
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
                color: "var(--warm)",
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
                  style={{
                    width: item.width,
                    margin: "0 auto",
                    padding: "24px 28px",
                    borderRadius: 14,
                    background: item.bg,
                    border: `1px solid ${item.color}18`,
                    transition: "all 0.3s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <span
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 13,
                        fontWeight: 700,
                        color: item.color,
                      }}
                    >
                      {item.step}. {item.title}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>({item.subtitle})</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, fontWeight: 300 }}>
                    {item.desc}
                  </p>
                </div>
              </Section>
            ))}
          </div>
        </section>

        {/* ══════ CTA ══════ */}
        <section style={{ padding: "120px 24px", textAlign: "center", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 500,
              height: 300,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(110,231,183,0.06) 0%, transparent 70%)",
              filter: "blur(60px)",
              pointerEvents: "none",
            }}
          />
          <Section>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 800,
                letterSpacing: -1.5,
                lineHeight: 1.3,
                marginBottom: 20,
                position: "relative",
              }}
            >
              데이터가 문을 열고,
              <br />
              신뢰가 계약을 완성합니다
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "var(--text-secondary)",
                fontWeight: 300,
                marginBottom: 40,
                position: "relative",
              }}
            >
              i-Chemy B2B 도입 상담을 신청하세요.
            </p>
            <button
              style={{
                padding: "16px 48px",
                borderRadius: 12,
                background: "var(--accent)",
                color: "#0A0A0B",
                border: "none",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Noto Sans KR', sans-serif",
                position: "relative",
              }}
            >
              도입 상담 신청 →
            </button>
          </Section>
        </section>

        {/* ══════ FOOTER ══════ */}
        <footer
          style={{
            padding: "40px 32px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: 960,
            margin: "0 auto",
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              i-Chemy
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>
              by LLUBB Co., Ltd.
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            © 2026 LLUBB. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
}
