"use client";

import { useState, useEffect, useRef, type ReactNode, type FormEvent } from "react";
import { submitInquiry } from "./actions";

// ── CSS Variables & Keyframes (inline style tag) ──
const CSS = `
  html { scroll-behavior: smooth; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to { opacity: 1; transform: translateY(0); }
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
  .cta-btn { transition: transform 0.2s ease; }
  .cta-btn:hover { transform: scale(1.04); }
  .cta-btn span { display: inline-block; transition: transform 0.2s ease; }
  .cta-btn:hover span { transform: translateX(4px); }
  @media (max-width: 639px) {
    .funnel-step { width: 100% !important; }
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
        className="font-[var(--font-outfit)] text-4xl font-extrabold leading-none sm:text-5xl"
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

// ── Inquiry Form ──
const inputStyle = {
  background: c.bgCard,
  border: `1px solid ${c.border}`,
  color: c.text,
  outline: "none",
  fontFamily: "var(--font-noto), 'Noto Sans KR', sans-serif",
};

function InquiryForm() {
  const [form, setForm] = useState({ company: "", name: "", phone: "", message: "" });
  const [touched, setTouched] = useState({ company: false, name: false, phone: false });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const errors = {
    company: touched.company && !form.company.trim() ? "업체명을 입력해 주세요." : "",
    name: touched.name && !form.name.trim() ? "담당자명을 입력해 주세요." : "",
    phone: touched.phone && form.phone.replace(/\D/g, "").length < 10 ? "연락처를 정확히 입력해 주세요." : "",
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ company: true, name: true, phone: true });
    if (!form.company.trim() || !form.name.trim() || form.phone.replace(/\D/g, "").length < 10) {
      return;
    }
    setStatus("sending");
    const result = await submitInquiry(form);
    if (result.error) {
      setErrorMsg(result.error);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  };

  if (status === "sent") {
    return (
      <div
        className="mx-auto max-w-[480px] rounded-2xl px-8 py-12 text-center"
        style={{ background: c.bgCard, border: `1px solid ${c.border}` }}
      >
        <div className="text-3xl">✓</div>
        <h3 className="mt-4 text-lg font-bold">신청이 완료되었습니다</h3>
        <p className="mt-2 text-sm" style={{ color: c.textSecondary }}>
          빠른 시일 내에 연락드리겠습니다.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex max-w-[480px] flex-col gap-4"
    >
      <div>
        <input
          type="text"
          placeholder="업체명 *"
          value={form.company}
          onChange={(e) => { setTouched({ ...touched, company: true }); setForm({ ...form, company: e.target.value }); }}
          className="w-full rounded-xl px-5 py-3.5 text-sm"
          style={{ ...inputStyle, borderColor: errors.company ? c.coral : c.border }}
        />
        {errors.company && <p className="mt-1.5 text-xs" style={{ color: c.coral }}>{errors.company}</p>}
      </div>
      <div>
        <input
          type="text"
          placeholder="담당자명 *"
          value={form.name}
          onChange={(e) => { setTouched({ ...touched, name: true }); setForm({ ...form, name: e.target.value }); }}
          className="w-full rounded-xl px-5 py-3.5 text-sm"
          style={{ ...inputStyle, borderColor: errors.name ? c.coral : c.border }}
        />
        {errors.name && <p className="mt-1.5 text-xs" style={{ color: c.coral }}>{errors.name}</p>}
      </div>
      <div>
        <input
          type="tel"
          placeholder="연락처 *"
          value={form.phone}
          onChange={(e) => {
            setTouched({ ...touched, phone: true });
            const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
            let formatted = digits;
            if (digits.length > 7) {
              formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
            } else if (digits.length > 3) {
              formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
            }
            setForm({ ...form, phone: formatted });
          }}
          className="w-full rounded-xl px-5 py-3.5 text-sm"
          style={{ ...inputStyle, borderColor: errors.phone ? c.coral : c.border }}
        />
        {errors.phone && <p className="mt-1.5 text-xs" style={{ color: c.coral }}>{errors.phone}</p>}
      </div>
      <textarea
        placeholder="문의 내용 (선택)"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        rows={4}
        className="w-full resize-none rounded-xl px-5 py-3.5 text-sm"
        style={inputStyle}
      />
      {status === "error" && errorMsg && (
        <p className="text-center text-sm" style={{ color: c.coral }}>
          {errorMsg}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="cta-btn mt-2 w-full rounded-xl border-none py-4 text-base font-bold"
        style={{
          background: status === "sending" ? c.borderLight : c.accent,
          color: "#0A0A0B",
          fontFamily: "var(--font-noto), 'Noto Sans KR', sans-serif",
          cursor: status === "sending" ? "default" : "pointer",
        }}
      >
        {status === "sending" ? "전송 중..." : <>제휴 상담 신청하기 <span>→</span></>}
      </button>
    </form>
  );
}

// ── Main Page ──
export default function B2BEducationLanding() {
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
          className="fixed inset-x-0 top-0 z-[100] flex items-center justify-between px-5 py-2 sm:px-8 sm:py-3"
          style={{
            background: c.bg,
            borderBottom: `1px solid ${c.border}`,
          }}
        >
          <a href="#" className="flex items-center gap-2.5 no-underline">
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
              EDU
            </span>
          </a>
          <a
            href="#inquiry"
            className="cta-btn rounded-lg border-none px-5 py-2 text-[13px] font-semibold no-underline"
            style={{
              background: c.accent,
              color: "#0A0A0B",
              fontFamily: "var(--font-noto), 'Noto Sans KR', sans-serif",
              cursor: "pointer",
            }}
          >
            제휴 문의
          </a>
        </nav>

        {/* ══════ HERO ══════ */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-[120px] text-center">

          <div style={ease(0)}>
            <Badge>Education B2B Data Solution</Badge>
          </div>

          <h1
            className="mx-auto mt-8 font-black leading-[1.2]"
            style={{
              fontFamily: "var(--font-noto), 'Noto Sans KR', sans-serif",
              fontSize: "clamp(32px, 5vw, 60px)",
              letterSpacing: -2,
              ...ease(0.08),
            }}
          >
            방문교사 세일즈,
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
              데이터 타겟팅
            </span>
            으로 진화합니다
          </h1>

          <p
            className="mx-auto mt-6 max-w-[520px] text-[17px] font-light leading-[1.7]"
            style={{ color: c.textSecondary, ...ease(0.16) }}
          >
            4분 진단 리포트를 통한 신규 세일즈 퍼널 구축
            <br />
            및 장기 록인(Lock-in) 전략
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row" style={ease(0.24)}>
            <a
              href="#inquiry"
              className="cta-btn rounded-[10px] border-none px-8 py-3.5 text-[15px] font-bold no-underline"
              style={{
                background: c.accent,
                color: "#0A0A0B",
                fontFamily: "var(--font-noto), 'Noto Sans KR', sans-serif",
                cursor: "pointer",
              }}
            >
              제휴 상담 신청 <span>→</span>
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid w-full max-w-[600px] grid-cols-3 sm:mt-20" style={ease(0.32)}>
            <Stat value="4분" label="설문 소요 시간" />
            <Stat value="4-in-1" label="통합 진단 리포트" />
            <Stat value="10년" label="장기 구독 파이프라인" />
          </div>

          {/* As seen in */}
          <div
            className="mt-14 flex items-center justify-center gap-2 sm:mt-20"
            style={ease(0.4)}
          >
            <span className="text-[11px] tracking-wide" style={{ color: c.textMuted }}>
              AS SEEN IN
            </span>
            <span className="text-[11px]" style={{ color: c.textMuted }}>—</span>
            <a
              href="https://www.ibabynews.com/news/articleView.html?idxno=149846"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium no-underline transition-colors hover:underline"
              style={{ color: c.textSecondary }}
            >
              베이비뉴스
            </a>
            <span className="text-[10px]" style={{ color: c.textMuted }}>|</span>
            <span className="text-[11px]" style={{ color: c.textMuted }}>
              베페 베이비페어 2026
            </span>
          </div>
        </section>

        {/* ══════ PAIN POINTS ══════ */}
        <section className="mx-auto flex min-h-[70vh] max-w-[960px] flex-col justify-center px-5 py-16 sm:px-6 sm:py-[100px]">
          <Section>
            <div className="mb-10 text-center sm:mb-[60px]">
              <Badge>Problem</Badge>
              <h2 className="mt-5 text-2xl font-extrabold leading-[1.3] sm:text-4xl" style={{ letterSpacing: -1.5 }}>
                교재 샘플에 의존하는 콜드 세일즈는
                <br />
                <span style={{ color: c.textMuted }}>구조적 한계에 직면했습니다</span>
              </h2>
            </div>
          </Section>

          <div className="flex flex-col gap-4">
            {[
              {
                num: "01",
                title: "거부감 높은 오프닝",
                desc: "영업 목적이 명확한 접근은 초기 거절률을 급증시킵니다. 교재 샘플 전달만으로는 문이 열리지 않습니다.",
                color: c.coral,
              },
              {
                num: "02",
                title: "불확실한 주관적 상담",
                desc: "교사의 개인적 '직관'에 의존한 상담은 학부모의 압도적 신뢰를 이끌어내지 못합니다.",
                color: c.warm,
              },
              {
                num: "03",
                title: "우수 교사 이탈 및 비용 증가",
                desc: "단순 판매원으로 전락한 방문교사의 피로도 증가와 잦은 이탈은 막대한 채용·교육 비용을 발생시킵니다.",
                color: "#F4A261",
              },
            ].map((item, i) => (
              <Section key={i} delay={i * 0.08}>
                <div
                  className="flex gap-4 rounded-2xl p-5 sm:gap-6 sm:p-7"
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
              학부모는 &apos;단순 교재 배달부&apos;가 아닌, &apos;데이터 기반 에듀케어 전문가&apos;를 원합니다.
            </div>
          </Section>
        </section>

        {/* ══════ SOLUTION ══════ */}
        <section className="mx-auto flex min-h-[70vh] max-w-[960px] flex-col justify-center px-5 py-16 sm:px-6 sm:py-[100px]">
          <Section>
            <div className="mb-10 text-center sm:mb-[60px]">
              <Badge>Solution</Badge>
              <h2 className="mt-5 text-2xl font-extrabold leading-[1.3] sm:text-4xl" style={{ letterSpacing: -1.5 }}>
                세일즈의 격과 전환율이
                <br />
                <span
                  style={{
                    background: `linear-gradient(135deg, ${c.accent}, #A7F3D0)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  완전히 달라집니다
                </span>
              </h2>
            </div>
          </Section>

          <div className="flex flex-col gap-3">
            {[
              {
                label: "접근 방식",
                before: "교재 샘플 전달 및 가입 권유",
                after: "고가의 심리·학습 진단 리포트 무료 체험 제공",
              },
              {
                label: "상담의 근거",
                before: "교사의 개인 역량과 감(感)",
                after: "PNCAM 4지표 및 학습 스타일 데이터(ESB, CSP 등)",
              },
              {
                label: "의사결정 주체",
                before: "주 양육자 단독 결정 (추후 번복 위험 높음)",
                after: "부부 공동 설문을 통한 가족 공동의 확고한 결정 유도",
              },
              {
                label: "브랜드 포지셔닝",
                before: "상품 판매원 및 교재 배달부",
                after: "우리 아이 전담 학습·심리 발달 주치의",
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
                    className="mt-2.5 text-sm font-normal leading-[1.6]"
                    style={{ color: c.text }}
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
        <section className="mx-auto flex min-h-[70vh] max-w-[960px] flex-col justify-center px-5 py-16 sm:px-6 sm:py-[100px]">
          <Section>
            <div className="mb-10 text-center sm:mb-[60px]">
              <Badge>4-in-1 System</Badge>
              <h2 className="mt-5 text-2xl font-extrabold leading-[1.3] sm:text-4xl" style={{ letterSpacing: -1.5 }}>
                아이의 숨은 강점부터 부모의 양육 환경까지
                <br />
                <span style={{ color: c.accent }}>4-in-1</span> 통합 진단
              </h2>
              <p
                className="mt-4 text-sm font-light"
                style={{ color: c.textSecondary }}
              >
                기본 3분 + 보충 1분
              </p>
            </div>
          </Section>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                module: "A",
                title: "육아성향 리포트",
                desc: "LLUBB 기반 부부 양육 스타일 분석. 첫 면담의 부드러운 아이스브레이킹 도구.",
                sub: "학부모 신뢰 구축의 출발점",
                color: c.accent,
                bg: "rgba(110,231,183,0.06)",
              },
              {
                module: "B",
                title: "육아케어 리포트",
                desc: "PNCAM 4지표(ESB, CSP, PCI, STB) 심층 분석. 우리 아이를 제대로 안다는 학부모의 절대적 신뢰 구축.",
                sub: "데이터 기반 상담 근거",
                color: "#67D4F1",
                bg: "rgba(103,212,241,0.06)",
              },
              {
                module: "C",
                title: "성장·학습케어 리포트",
                desc: "과목별 강점 및 학습 환경 분석. 성적 부진의 원인 파악 및 과목별 심화 프로그램 매칭 근거.",
                sub: "자사 프로그램과 직접 연결",
                color: c.warm,
                bg: "rgba(244,162,97,0.06)",
              },
              {
                module: "D",
                title: "과목 심화 카드",
                desc: "자사 프로그램 직접 연결 영역. 타겟팅된 CTA 배치를 통한 즉각적인 세일즈 전환.",
                sub: "즉각적 전환 유도",
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
                  <div className="mb-4">
                    <span
                      className="text-[11px] font-bold tracking-widest"
                      style={{
                        fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
                        color: item.color,
                      }}
                    >
                      MODULE {item.module}
                    </span>
                    <h3 className="mt-2 text-xl font-bold">
                      {item.title}
                    </h3>
                  </div>
                  <div
                    className="mb-4 h-px w-full"
                    style={{ background: `${item.color}20` }}
                  />
                  <p
                    className="text-sm font-normal leading-relaxed"
                    style={{ color: c.text }}
                  >
                    {item.desc}
                  </p>
                  <span
                    className="mt-3 inline-block rounded-md px-2.5 py-1 text-[11px] font-medium"
                    style={{
                      background: `${item.color}12`,
                      color: item.color,
                    }}
                  >
                    {item.sub}
                  </span>
                </div>
              </Section>
            ))}
          </div>
        </section>

        {/* ══════ PIPELINE ══════ */}
        <section className="mx-auto flex min-h-[70vh] max-w-[960px] flex-col justify-center px-5 py-16 sm:px-6 sm:py-[100px]">
          <Section>
            <div className="mb-10 text-center sm:mb-[60px]">
              <Badge>Lifetime Pipeline</Badge>
              <h2 className="mt-5 text-2xl font-extrabold sm:text-4xl" style={{ letterSpacing: -1.5 }}>
                5세 진입으로 10년의 장기 구독을 구조화합니다
              </h2>
            </div>
          </Section>

          <div className="flex flex-col">
            {[
              {
                age: "5~7세",
                stage: "유치부",
                action: "프레이밍: '배움·놀이'",
                sales: "초기 유아 교재/방문수업 진입 (6영역 진단)",
                active: true,
              },
              {
                age: "8~13세",
                stage: "초등부",
                action: "프레이밍: '학습·학교생활'",
                sales: "국/영/수 심화 프로그램. 6개월 단위 재검사로 재방문 명분 창출",
                active: false,
              },
              {
                age: "14~16세",
                stage: "중등부",
                action: "프레이밍: '학업·진로'",
                sales: "자기주도학습 및 고등 대비 장기 수강 전환 (6과목 진로 연결)",
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
                      → {item.sales}
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
              단 한 번의 가족 진입으로, 자녀의 성장 단계마다 새로운 세일즈 터치포인트가 자동 생성됩니다.
            </div>
          </Section>
        </section>

        {/* ══════ FUNNEL ══════ */}
        <section className="mx-auto flex min-h-[70vh] max-w-[960px] flex-col justify-center px-5 py-16 sm:px-6 sm:py-[100px]">
          <Section>
            <div className="mb-10 text-center sm:mb-[60px]">
              <Badge>Sales Engine</Badge>
              <h2 className="mt-5 text-2xl font-extrabold sm:text-4xl" style={{ letterSpacing: -1.5 }}>
                단 4분, 방문교사가 교육 컨설턴트로
              </h2>
            </div>
          </Section>

          <div className="flex flex-col gap-3 sm:gap-0.5">
            {[
              {
                step: "1",
                title: "Door Opener",
                subtitle: "알림톡 발송",
                desc: "아이케미 맞춤 리포트를 카카오톡으로 무료 선물 — 학부모 거부감 0%의 프리미엄 혜택",
                width: "100%",
                color: c.accent,
                bg: "rgba(110,231,183,0.06)",
              },
              {
                step: "2",
                title: "Engagement",
                subtitle: "부부 공동 진단",
                desc: "부부 양쪽 설문 참여로 배우자 동석 효과 창출. 4분 완성, 즉각 리포트 발급",
                width: "82%",
                color: "#67D4F1",
                bg: "rgba(103,212,241,0.06)",
              },
              {
                step: "3",
                title: "Trust Bridge",
                subtitle: "데이터 상담",
                desc: "학부모에게는 상세 분석, 교사에게는 세일즈 타겟팅 데이터 제공",
                width: "64%",
                color: c.warm,
                bg: "rgba(244,162,97,0.06)",
              },
              {
                step: "4",
                title: "Conversion",
                subtitle: "프로그램 연결",
                desc: "리포트 지표를 자사 교육 프로그램과 자연스럽게 매칭하여 구독 전환",
                width: "46%",
                color: "#F97316",
                bg: "rgba(249,115,22,0.08)",
              },
            ].map((item, i) => (
              <Section key={i} delay={i * 0.08}>
                <div
                  className="funnel-step mx-auto rounded-[14px] px-7 py-6"
                  style={{
                    width: item.width,
                    background: item.bg,
                    border: `1px solid ${item.color}18`,
                  }}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className="text-sm font-bold"
                      style={{
                        fontFamily:
                          "var(--font-outfit), 'Outfit', sans-serif",
                        color: item.color,
                      }}
                    >
                      {item.step}. {item.title}
                    </span>
                    <span
                      className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                      style={{
                        background: `${item.color}15`,
                        color: item.color,
                      }}
                    >
                      {item.subtitle}
                    </span>
                  </div>
                  <p
                    className="text-sm font-normal leading-relaxed"
                    style={{ color: c.text }}
                  >
                    {item.desc}
                  </p>
                </div>
              </Section>
            ))}
          </div>
        </section>

        {/* ══════ ROI ══════ */}
        <section className="mx-auto flex min-h-[70vh] max-w-[960px] flex-col justify-center px-5 py-16 sm:px-6 sm:py-[100px]">
          <Section>
            <div className="mb-10 text-center sm:mb-[60px]">
              <Badge>ROI</Badge>
              <h2 className="mt-5 text-2xl font-extrabold sm:text-4xl" style={{ letterSpacing: -1.5 }}>
                압도적 ROI
              </h2>
              <p
                className="mt-4 text-sm font-light"
                style={{ color: c.textSecondary }}
              >
                고객 1명 유치를 위한 가장 확실하고 저렴한 투자
              </p>
            </div>
          </Section>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                label: "시뮬레이션",
                stat: "1,000건",
                desc: "방문교사 100명 × 월 10건 초대\n비용 450만 원",
                color: c.accent,
                bg: "rgba(110,231,183,0.06)",
              },
              {
                label: "기대 수익",
                stat: "+400만",
                desc: "전환율 15% → 신규 계약 150건\n월 수익 750만 원 창출",
                color: "#67D4F1",
                bg: "rgba(103,212,241,0.06)",
              },
              {
                label: "건당 비용",
                stat: "₩4,500",
                desc: "수만 원대 가치의 전문 심리검사를\nAI 최적화로 저비용 제공",
                color: c.warm,
                bg: "rgba(244,162,97,0.06)",
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
                    {item.label}
                  </span>
                  <div
                    className="mt-3 text-3xl font-extrabold"
                    style={{
                      fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
                      color: item.color,
                      letterSpacing: -1,
                    }}
                  >
                    {item.stat}
                  </div>
                  <div
                    className="my-4 h-px w-full"
                    style={{ background: `${item.color}20` }}
                  />
                  <p
                    className="whitespace-pre-line text-sm font-normal leading-relaxed"
                    style={{ color: c.text }}
                  >
                    {item.desc}
                  </p>
                </div>
              </Section>
            ))}
          </div>
        </section>

        {/* ══════ ONBOARDING ══════ */}
        <section className="mx-auto flex min-h-[70vh] max-w-[960px] flex-col justify-center px-5 py-16 sm:px-6 sm:py-[100px]">
          <Section>
            <div className="mb-10 text-center sm:mb-[60px]">
              <Badge>Quick Start</Badge>
              <h2 className="mt-5 text-2xl font-extrabold sm:text-4xl" style={{ letterSpacing: -1.5 }}>
                IT 개발 불필요, 단 5일 후면
                <br />
                전국 영업 현장에 즉시 가동됩니다
              </h2>
            </div>
          </Section>

          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { day: "1", desc: "계약 및 계정 발급" },
              { day: "2", desc: "CTA 매핑\n프로그램 연결" },
              { day: "3", desc: "크레딧 초기 충전" },
              { day: "4", desc: "교사 교육 및 검수" },
              { day: "5", desc: "전국 정식 운영" },
            ].map((item, i, arr) => (
              <Section key={i} delay={i * 0.06} className={i === arr.length - 1 ? "col-span-2 sm:col-span-1" : ""}>
                <div
                  className="h-full rounded-xl px-5 py-6 text-center"
                  style={{
                    background: c.bgCard,
                    border: `1px solid ${c.border}`,
                  }}
                >
                  <span
                    className="text-2xl font-extrabold"
                    style={{
                      fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
                      color: c.accent,
                    }}
                  >
                    Day {item.day}
                  </span>
                  <p
                    className="mt-3 whitespace-pre-line text-xs font-normal leading-relaxed"
                    style={{ color: c.text }}
                  >
                    {item.desc}
                  </p>
                </div>
              </Section>
            ))}
          </div>

          <Section delay={0.3}>
            <div
              className="mt-8 rounded-[10px] p-4 text-center text-sm font-medium"
              style={{
                background: c.accentDim,
                border: "1px solid rgba(110,231,183,0.12)",
                color: c.accent,
              }}
            >
              SaaS 플랫폼을 통해 별도 앱 구축이나 복잡한 서버 연동 없이 계약 즉시 운영이 가능합니다.
            </div>
          </Section>
        </section>

        {/* ══════ CTA / INQUIRY FORM ══════ */}
        <section
          id="inquiry"
          className="mx-auto min-h-[70vh] max-w-[960px] px-5 py-16 sm:px-6 sm:py-[100px]"
          style={{ scrollMarginTop: 80 }}
        >
          <Section>
            <div className="mb-10 text-center sm:mb-[60px]">
              <Badge>Contact</Badge>
              <h2
                className="mt-5 text-2xl font-extrabold leading-[1.3] sm:text-4xl"
                style={{ letterSpacing: -1.5 }}
              >
                제휴 상담 신청
              </h2>
              <p
                className="mt-4 text-sm font-light"
                style={{ color: c.textSecondary }}
              >
                귀사의 핵심 프로그램에 맞춘 Dynamic CTA 설정 컨설팅 및
                <br className="hidden sm:block" />
                테스트 리포트 10건을 무료로 제공해 드립니다.
              </p>
            </div>
          </Section>

          <InquiryForm />
        </section>

        {/* ══════ FOOTER ══════ */}
        <footer
          className="mx-auto max-w-[960px] px-5 py-8 sm:px-8 sm:py-10"
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
