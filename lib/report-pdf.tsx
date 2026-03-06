import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";
import type { CareReport, Grade, TheoryReference, Scene } from "./care-report";

// ─── Font registration ───

Font.register({
  family: "NotoSansKR",
  fonts: [
    { src: "/fonts/NotoSansKR-Light.ttf?v=3", fontWeight: 300 },
    { src: "/fonts/NotoSansKR-Regular.ttf?v=3", fontWeight: 400 },
    { src: "/fonts/NotoSansKR-Medium.ttf?v=3", fontWeight: 500 },
    { src: "/fonts/NotoSansKR-Bold.ttf?v=3", fontWeight: 700 },
    { src: "/fonts/NotoSansKR-Black.ttf?v=3", fontWeight: 800 },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

// ─── Colors ───

const C = {
  coral: "#D4735C",
  coralDeep: "#C0614A",
  sage: "#7BA872",
  sky: "#5B9BD5",
  lavender: "#8B72BE",
  gold: "#C49A30",
  charcoal: "#3A3A3A",
  body: "#555555",
  muted: "#9A918A",
  mutedLight: "#B8A898",
  border: "#ECE8E3",
  cream: "#FEFCF9",
  white: "#FFFFFF",
};

const INDICATOR_THEME: Record<
  string,
  { accent: string; bg: string; bgLight: string }
> = {
  ESB: { accent: C.sage, bg: "#F0F7F0", bgLight: "#FAFFF9" },
  CSP: { accent: C.coral, bg: "#FFF0EB", bgLight: "#FFFAF6" },
  PCI: { accent: C.sky, bg: "#EEF4FB", bgLight: "#F5F9FE" },
  STB: { accent: C.lavender, bg: "#F3EFF9", bgLight: "#F9F6FE" },
};

const GRADE_CONFIG: Record<
  Grade,
  { label: string; color: string; bg: string }
> = {
  A: { label: "잘하고 있어요", color: "#2E7D32", bg: "#E8F5E8" },
  B: { label: "괜찮아요", color: "#1565C0", bg: "#E3F2FD" },
  C: { label: "조금 더 노력해요", color: "#E65100", bg: "#FFF3E0" },
  D: { label: "도움이 필요해요", color: "#C62828", bg: "#FFEBEE" },
};

// ─── Styles ───

const s = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingBottom: 44,
    paddingHorizontal: 40,
    fontFamily: "NotoSansKR",
    fontSize: 9.5,
    color: C.charcoal,
    backgroundColor: C.white,
  },

  coverHeader: {
    backgroundColor: C.charcoal,
    borderRadius: 10,
    padding: 28,
    marginBottom: 24,
    color: C.white,
  },
  coverSub: {
    fontSize: 8,
    fontWeight: 500,
    letterSpacing: 1.5,
    opacity: 0.5,
    marginBottom: 10,
  },
  coverTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 4,
  },
  coverSubtitle: {
    fontSize: 9,
    opacity: 0.5,
    marginBottom: 18,
  },
  gradeRow: {
    flexDirection: "row",
    gap: 6,
  },
  gradePill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    fontSize: 9,
    fontWeight: 700,
  },

  gradeSummaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  gradeCard: {
    flex: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  gradeCardCode: {
    fontSize: 11,
    fontWeight: 800,
    marginBottom: 4,
  },
  gradeCardGrade: {
    fontSize: 16,
    fontWeight: 800,
    marginBottom: 2,
  },
  gradeCardLabel: {
    fontSize: 7,
    fontWeight: 500,
    textAlign: "center",
  },

  body: {
    fontSize: 9.5,
    fontWeight: 300,
    lineHeight: 1.85,
    color: C.body,
  },

  theoryBox: {
    backgroundColor: "#F8F6F3",
    padding: 14,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: C.gold,
    marginTop: 10,
    marginBottom: 10,
  },
  theoryBody: {
    fontSize: 8.5,
    fontWeight: 300,
    lineHeight: 1.75,
    color: "#6B6360",
  },

  indHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 16,
  },
  indBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  indCode: {
    fontSize: 13,
    fontWeight: 800,
  },
  indName: {
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 2,
  },
  indNameEn: {
    fontSize: 8,
    fontWeight: 500,
    color: C.muted,
  },
  indGradeBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 800,
    marginTop: 4,
  },

  sceneCard: {
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
    marginTop: 10,
    marginBottom: 4,
  },
  sceneBody: {
    fontSize: 9,
    fontWeight: 300,
    lineHeight: 1.8,
    color: C.body,
  },

  tipRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 9.5,
    fontWeight: 700,
    color: C.coral,
    width: 12,
  },

  subHeading: {
    fontSize: 10.5,
    fontWeight: 800,
    marginTop: 16,
    marginBottom: 8,
    color: C.charcoal,
  },

  closingBox: {
    marginTop: 24,
    padding: 28,
    borderRadius: 10,
    backgroundColor: "#FFF8F0",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(212,115,92,0.1)",
  },
  closingTitle: {
    fontSize: 14,
    fontWeight: 800,
    marginBottom: 12,
    textAlign: "center",
  },

  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 20,
  },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    fontWeight: 500,
    color: C.mutedLight,
  },
});

// ─── Components ───

function Dot({ color, size = 6 }: { color: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      }}
    />
  );
}

function SectionLabel({ text, color }: { text: string; color: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 10,
      }}
    >
      <Dot color={color} />
      <Text style={{ fontSize: 13, fontWeight: 800, color: C.charcoal }}>
        {text}
      </Text>
    </View>
  );
}

function SubSectionLabel({ text, color }: { text: string; color: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 16,
        marginBottom: 8,
      }}
    >
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: color,
        }}
      />
      <Text style={{ fontSize: 10.5, fontWeight: 800, color: C.charcoal }}>
        {text}
      </Text>
    </View>
  );
}

function PdfTheoryBox({
  theory,
}: {
  theory: TheoryReference | null | undefined;
}) {
  if (!theory) return null;
  return (
    <View style={s.theoryBox}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          marginBottom: 5,
        }}
      >
        <View
          style={{
            width: 14,
            height: 14,
            borderRadius: 3,
            backgroundColor: C.gold,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 8, fontWeight: 700, color: "#fff" }}>
            T
          </Text>
        </View>
        <Text style={{ fontSize: 8.5, fontWeight: 800, color: C.gold }}>
          {theory.title} — {theory.author}
        </Text>
      </View>
      <Text style={s.theoryBody}>{theory.description}</Text>
    </View>
  );
}

function PageFooter() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>아이케미 x 베이비페어 2026</Text>
      <Text style={s.footerText}>심리학 이론 기반 · 비임상 참고 목적</Text>
    </View>
  );
}

function SceneCard({ scene }: { scene: Scene }) {
  const isStrength = scene.type === "strength";
  const color = isStrength ? C.sage : "#E8927C";
  return (
    <View
      style={{
        ...s.sceneCard,
        backgroundColor: isStrength ? "#FAFFF9" : "#FFFAF6",
        borderLeftColor: color,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          marginBottom: 5,
        }}
      >
        <View
          style={{
            width: 5,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: color,
          }}
        />
        <Text style={{ fontSize: 9.5, fontWeight: 800, color }}>
          {isStrength ? "강점이 빛나는 장면" : "성장이 필요한 장면"}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 9.5,
          fontWeight: 800,
          color: C.charcoal,
          marginBottom: 3,
        }}
      >
        {scene.title}
      </Text>
      <Text style={s.sceneBody}>{scene.content}</Text>
    </View>
  );
}

// ─── PDF Document ───

function CareReportPDF({ data }: { data: CareReport }) {
  return (
    <Document
      title="유아기 부부 육아 케어 리포트"
      author="아이케미"
      subject="Parenting Dynamics Report"
    >
      {/* PAGE 1: Cover + Summary */}
      <Page size="A4" style={s.page}>
        <View style={s.coverHeader}>
          <Text style={s.coverSub}>PARENTING DYNAMICS REPORT</Text>
          <Text style={s.coverTitle}>유아기 부부 육아 케어 리포트</Text>
          <Text style={s.coverSubtitle}>
            Parenting Dynamics & Couple Strengths Report | Toddler Stage
          </Text>
          <View style={s.gradeRow}>
            {(Object.entries(data.grades) as [string, Grade][]).map(
              ([key, grade]) => (
                <Text key={key} style={s.gradePill}>
                  {key.toUpperCase()} ({grade})
                </Text>
              ),
            )}
          </View>
        </View>

        <View style={s.gradeSummaryRow}>
          {data.indicators.map((ind) => {
            const theme = INDICATOR_THEME[ind.code];
            return (
              <View
                key={ind.code}
                style={{ ...s.gradeCard, backgroundColor: theme.bg }}
              >
                <Text style={{ ...s.gradeCardCode, color: theme.accent }}>
                  {ind.code}
                </Text>
                <Text style={{ ...s.gradeCardGrade, color: theme.accent }}>
                  {ind.grade}
                </Text>
                <Text style={{ ...s.gradeCardLabel, color: theme.accent }}>
                  {ind.name}
                </Text>
              </View>
            );
          })}
        </View>

        <SectionLabel text="종합 총평" color={C.coral} />
        <Text style={s.body}>{data.summary.text}</Text>

        <PdfTheoryBox theory={data.summary.theory} />

        <PageFooter />
      </Page>

      {/* INDICATOR PAGES */}
      {data.indicators.map((ind) => {
        const theme = INDICATOR_THEME[ind.code];
        const gc = GRADE_CONFIG[ind.grade];

        return (
          <Page key={ind.code} size="A4" style={s.page} wrap>
            <View style={s.indHeader}>
              <View style={{ ...s.indBadge, backgroundColor: theme.bg }}>
                <Text style={{ ...s.indCode, color: theme.accent }}>
                  {ind.code}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.indName}>{ind.name}</Text>
                <Text style={s.indNameEn}>{ind.name_en}</Text>
                <View
                  style={{
                    ...s.indGradeBadge,
                    backgroundColor: gc.bg,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text
                    style={{ color: gc.color, fontSize: 8, fontWeight: 800 }}
                  >
                    등급 {ind.grade} · {gc.label}
                  </Text>
                </View>
              </View>
            </View>

            <SubSectionLabel
              text="이 지표는 무엇을 측정하나요?"
              color={theme.accent}
            />
            <Text style={s.body}>{ind.description}</Text>

            <PdfTheoryBox theory={ind.description_theory} />

            <SubSectionLabel text="현재 점수 해석" color={theme.accent} />
            <Text style={s.body}>{ind.interpretation}</Text>

            <SubSectionLabel
              text="육아에서 이렇게 나타나요"
              color={theme.accent}
            />
            {ind.scenes.map((scene, i) => (
              <SceneCard key={i} scene={scene} />
            ))}

            {ind.scenes_theory && <PdfTheoryBox theory={ind.scenes_theory} />}

            <SubSectionLabel text="맞춤 조언" color={theme.accent} />
            {ind.tips.map((tip, i) => (
              <View key={i} style={s.tipRow} wrap={false}>
                <Text style={{ ...s.tipBullet, color: theme.accent }}>
                  ✔
                </Text>
                <Text style={{ ...s.body, flex: 1 }}>{tip}</Text>
              </View>
            ))}

            <PageFooter />
          </Page>
        );
      })}

      {/* CLOSING PAGE */}
      <Page size="A4" style={s.page}>
        <View style={s.closingBox}>
          <Dot color={C.sage} size={10} />
          <View style={{ marginTop: 12 }}>
            <Text style={s.closingTitle}>앞으로의 방향 제언</Text>
          </View>
          <Text style={{ ...s.body, textAlign: "center" }}>
            {data.closing.text}
          </Text>
        </View>

        <PdfTheoryBox theory={data.closing.theory} />

        <View style={{ marginTop: 40, alignItems: "center" }}>
          <View style={s.divider} />
          <Text
            style={{
              fontSize: 8,
              color: C.mutedLight,
              textAlign: "center",
              lineHeight: 1.8,
            }}
          >
            본 리포트는 유아기 자녀를 양육 중인 부부를 위한 육아 케어 지원
            목적으로 작성되었습니다.{"\n"}
            심리학 이론 기반 분석 · 비임상 참고 목적 리포트{"\n"}
            아이케미 x 베이비페어 2026
          </Text>
        </View>

        <PageFooter />
      </Page>
    </Document>
  );
}

// ─── Download handler (client-side) ───

export async function handleDownloadPdf(data: CareReport) {
  const fileName = `육아케어리포트_${data.meta.sequence}.pdf`;
  const blob = await pdf(<CareReportPDF data={data} />).toBlob();

  // 모바일 share API 우선 시도 (카카오 인앱 브라우저 등)
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], fileName, { type: "application/pdf" });
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file] });
      return;
    }
  }

  // fallback: 새 탭으로 열기 (인앱 브라우저 호환)
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
