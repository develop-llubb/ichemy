import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";
import type { ParentingProfileReport, ParentingTrait } from "./parenting-profile-report";

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
  purple: "#8B72BE",
  purpleDeep: "#7462A8",
  coral: "#D4735C",
  sage: "#7BA872",
  sky: "#5B9BD5",
  gold: "#C49A30",
  charcoal: "#3A3A3A",
  body: "#555555",
  muted: "#9A918A",
  mutedLight: "#B8A898",
  border: "#ECE8E3",
  white: "#FFFFFF",
};

const TRAIT_THEME: Record<string, { color: string; bg: string }> = {
  "개방성": { color: C.gold, bg: "#FFF8E8" },
  "성실성": { color: C.sage, bg: "#F0F7F0" },
  "외향성": { color: C.coral, bg: "#FFF0EB" },
  "우호성": { color: C.sky, bg: "#EEF4FB" },
  "신경성": { color: C.purple, bg: "#F3EFF9" },
};

function getTraitTheme(source: string) {
  return TRAIT_THEME[source] ?? { color: C.muted, bg: "#F8F6F3" };
}

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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 800,
    color: C.charcoal,
  },
  traitCard: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
  },
  traitHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  traitBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 700,
  },
  traitName: {
    fontSize: 11,
    fontWeight: 700,
    color: C.charcoal,
  },
  levelDots: {
    flexDirection: "row",
    gap: 3,
    marginLeft: "auto",
  },
  levelDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  sceneBox: {
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    marginTop: 8,
  },
  sceneLabel: {
    fontSize: 8.5,
    fontWeight: 700,
    marginBottom: 3,
  },
  sceneBody: {
    fontSize: 9,
    fontWeight: 300,
    lineHeight: 1.8,
    color: C.body,
  },
  attachmentCard: {
    backgroundColor: C.purple,
    borderRadius: 10,
    padding: 20,
    marginBottom: 12,
    color: C.white,
  },
  flexCard: {
    backgroundColor: C.sage,
    borderRadius: 10,
    padding: 20,
    marginBottom: 12,
    color: C.white,
  },
  subCard: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 8,
  },
  tipRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 9.5,
    fontWeight: 700,
    color: C.purple,
    width: 12,
  },
  closingBox: {
    marginTop: 24,
    padding: 28,
    borderRadius: 10,
    backgroundColor: "#FFF8F0",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0DAD3",
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

function PdfTheoryBox({ theory }: { theory: { title: string; author: string; description: string } }) {
  return (
    <View style={s.theoryBox}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 }}>
        <View style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: C.gold, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 8, fontWeight: 700, color: "#fff" }}>T</Text>
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

function LevelDots({ level, color }: { level: number; color: string }) {
  return (
    <View style={s.levelDots}>
      {Array.from({ length: 5 }).map((_, i) => (
        <View
          key={i}
          style={{ ...s.levelDot, backgroundColor: i < level ? color : C.border }}
        />
      ))}
    </View>
  );
}

function TraitSection({ trait }: { trait: ParentingTrait }) {
  const theme = getTraitTheme(trait.source);
  const sceneLabel = trait.type === "strength" ? "강점이 빛나는 장면" : trait.type === "growth" ? "성장할 수 있는 장면" : "일상 속 장면";
  return (
    <View style={s.traitCard} wrap={false}>
      <View style={s.traitHeader}>
        <View style={{ ...s.traitBadge, backgroundColor: theme.bg }}>
          <Text style={{ color: theme.color, fontSize: 8, fontWeight: 700 }}>{trait.source}</Text>
        </View>
        <Text style={s.traitName}>{trait.trait}</Text>
        <LevelDots level={trait.level} color={theme.color} />
      </View>
      <Text style={s.body}>{trait.description}</Text>
      <View style={{ ...s.sceneBox, backgroundColor: theme.bg, borderLeftColor: theme.color }}>
        <Text style={{ ...s.sceneLabel, color: theme.color }}>{sceneLabel}</Text>
        <Text style={s.sceneBody}>{trait.scene}</Text>
      </View>
    </View>
  );
}

// ─── PDF Document ───

function PersonalityReportPDF({ data }: { data: ParentingProfileReport }) {
  return (
    <Document
      title="나의 육아 성향 리포트"
      author="아이케미"
      subject="Parenting Profile Report"
    >
      {/* PAGE 1: Cover + Summary + Traits */}
      <Page size="A4" style={s.page} wrap>
        <View style={s.coverHeader}>
          <Text style={s.coverSub}>MY PARENTING PROFILE</Text>
          <Text style={s.coverTitle}>{data.parenting_type.title}</Text>
          <Text style={s.coverSubtitle}>{data.parenting_type.subtitle}</Text>
        </View>

        <View style={s.sectionHeader}>
          <View style={{ ...s.sectionDot, backgroundColor: C.coral }} />
          <Text style={s.sectionTitle}>종합 분석</Text>
        </View>
        <Text style={s.body}>{data.summary.text}</Text>
        <PdfTheoryBox theory={data.summary.theory} />

        <View style={s.divider} />

        <View style={s.sectionHeader}>
          <View style={{ ...s.sectionDot, backgroundColor: C.coral }} />
          <Text style={s.sectionTitle}>육아 성격 특성</Text>
        </View>
        {data.parenting_traits.map((trait, i) => (
          <TraitSection key={i} trait={trait} />
        ))}

        <PageFooter />
      </Page>

      {/* PAGE 2: Attachment + Emotional Flexibility */}
      <Page size="A4" style={s.page} wrap>
        <View style={s.sectionHeader}>
          <View style={{ ...s.sectionDot, backgroundColor: C.purple }} />
          <Text style={s.sectionTitle}>애착 기반 양육 패턴</Text>
        </View>

        <View style={s.attachmentCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <View style={{ paddingVertical: 3, paddingHorizontal: 10, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.2)" }}>
              <Text style={{ fontSize: 9, fontWeight: 700, color: C.white }}>{data.attachment_parenting.type_text}</Text>
            </View>
            <LevelDots level={data.attachment_parenting.intensity} color={C.white} />
          </View>
          <Text style={{ fontSize: 16, fontWeight: 800, color: C.white, marginBottom: 8 }}>
            {data.attachment_parenting.title}
          </Text>
          <Text style={{ fontSize: 9, fontWeight: 300, lineHeight: 1.8, color: C.white, opacity: 0.85 }}>
            {data.attachment_parenting.description}
          </Text>
        </View>

        <View style={s.subCard}>
          <Text style={{ fontSize: 9, fontWeight: 700, color: C.sage, marginBottom: 4 }}>강점</Text>
          <Text style={s.body}>{data.attachment_parenting.strength}</Text>
        </View>
        <View style={s.subCard}>
          <Text style={{ fontSize: 9, fontWeight: 700, color: C.gold, marginBottom: 4 }}>주의할 점</Text>
          <Text style={s.body}>{data.attachment_parenting.watchpoint}</Text>
        </View>
        <PdfTheoryBox theory={data.attachment_parenting.theory} />

        <View style={s.divider} />

        <View style={s.sectionHeader}>
          <View style={{ ...s.sectionDot, backgroundColor: C.sage }} />
          <Text style={s.sectionTitle}>정서적 유연성</Text>
        </View>

        <View style={s.flexCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <View style={{ paddingVertical: 3, paddingHorizontal: 10, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.2)" }}>
              <Text style={{ fontSize: 9, fontWeight: 700, color: C.white }}>Lv.{data.emotional_flexibility.level}</Text>
            </View>
            <Text style={{ fontSize: 9, fontWeight: 500, color: C.white, opacity: 0.7 }}>
              상위 {(100 - data.emotional_flexibility.percentage).toFixed(1)}%
            </Text>
          </View>
          <Text style={{ fontSize: 16, fontWeight: 800, color: C.white, marginBottom: 8 }}>
            {data.emotional_flexibility.title}
          </Text>
          <Text style={{ fontSize: 9, fontWeight: 300, lineHeight: 1.8, color: C.white, opacity: 0.85 }}>
            {data.emotional_flexibility.description}
          </Text>
        </View>

        <View style={s.subCard}>
          <Text style={{ fontSize: 9, fontWeight: 700, color: C.coral, marginBottom: 4 }}>유머 활용 능력</Text>
          <Text style={s.body}>{data.emotional_flexibility.humor_analysis}</Text>
        </View>
        <View style={s.subCard}>
          <Text style={{ fontSize: 9, fontWeight: 700, color: C.sky, marginBottom: 4 }}>갈등 대처 능력</Text>
          <Text style={s.body}>{data.emotional_flexibility.conflict_analysis}</Text>
        </View>
        <PdfTheoryBox theory={data.emotional_flexibility.theory} />

        <PageFooter />
      </Page>

      {/* PAGE 3: Highlights + Tips + Closing */}
      <Page size="A4" style={s.page} wrap>
        <View style={s.sectionHeader}>
          <View style={{ ...s.sectionDot, backgroundColor: C.coral }} />
          <Text style={s.sectionTitle}>육아 강점 & 성장 포인트</Text>
        </View>

        {data.highlights.strengths.map((str, i) => (
          <View key={i} style={s.subCard} wrap={false}>
            <Text style={{ fontSize: 10, fontWeight: 700, color: C.coral, marginBottom: 4 }}>{str.title}</Text>
            <Text style={s.body}>{str.description}</Text>
          </View>
        ))}

        <View style={{ ...s.sceneBox, backgroundColor: "#FFF8E8", borderLeftColor: C.gold, marginBottom: 10 }} wrap={false}>
          <Text style={{ ...s.sceneLabel, color: C.gold }}>성장 포인트</Text>
          <Text style={{ fontSize: 10, fontWeight: 700, color: C.charcoal, marginBottom: 3 }}>
            {data.highlights.growth_point.title}
          </Text>
          <Text style={s.sceneBody}>{data.highlights.growth_point.description}</Text>
        </View>

        <View style={s.divider} />

        <View style={s.sectionHeader}>
          <View style={{ ...s.sectionDot, backgroundColor: C.purple }} />
          <Text style={s.sectionTitle}>맞춤 조언</Text>
        </View>
        {data.tips.map((tip, i) => (
          <View key={i} style={s.tipRow} wrap={false}>
            <Text style={s.tipBullet}>{i + 1}</Text>
            <Text style={{ ...s.body, flex: 1 }}>{tip}</Text>
          </View>
        ))}

        <View style={{ ...s.closingBox, backgroundColor: "#F8F5FC", borderColor: "#F0DAD3" }}>
          <Text style={{ fontSize: 11, fontWeight: 700, color: C.charcoal, textAlign: "center", lineHeight: 1.7 }}>
            {data.closing.text}
          </Text>
        </View>

        <View style={{ marginTop: 40, alignItems: "center" }}>
          <View style={s.divider} />
          <Text style={{ fontSize: 8, color: C.mutedLight, textAlign: "center", lineHeight: 1.8 }}>
            본 리포트는 심리학 이론 기반 분석 · 비임상 참고 목적으로 작성되었습니다.{"\n"}
            아이케미 x 베이비페어 2026
          </Text>
        </View>

        <PageFooter />
      </Page>
    </Document>
  );
}

// ─── Download handler (client-side) ───

export async function handleDownloadPersonalityPdf(data: ParentingProfileReport) {
  const blob = await pdf(<PersonalityReportPDF data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `나의육아성향리포트_${data.meta.nickname}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
