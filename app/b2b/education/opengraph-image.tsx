import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "아이케미 B2B - 교육업체를 위한 데이터 세일즈 솔루션";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fontData = await fetch(
    new URL(
      "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-700-normal.woff",
    ),
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0B",
          fontFamily: '"Noto Sans KR"',
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: "20%",
            left: "30%",
            width: 500,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(110,231,183,0.12) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 20px",
            borderRadius: 100,
            background: "rgba(110,231,183,0.12)",
            border: "1px solid rgba(110,231,183,0.2)",
            fontSize: 16,
            fontWeight: 600,
            color: "#6EE7B7",
            letterSpacing: 0.5,
          }}
        >
          Education B2B Data Solution
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 32,
            fontSize: 60,
            fontWeight: 700,
            color: "#EDEDEF",
            lineHeight: 1.2,
            letterSpacing: -2,
            textAlign: "center",
          }}
        >
          <span>방문교사 세일즈,</span>
          <div style={{ display: "flex" }}>
            <span style={{ color: "#6EE7B7" }}>데이터 타겟팅</span>
            <span>으로 진화합니다</span>
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 22,
            color: "#8B8B8F",
            fontWeight: 400,
          }}
        >
          4분 진단 리포트를 통한 신규 세일즈 퍼널 구축
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: 80,
            marginTop: 48,
          }}
        >
          {[
            { value: "4분", label: "설문 소요 시간" },
            { value: "4-in-1", label: "통합 진단 리포트" },
            { value: "10년", label: "장기 구독 파이프라인" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: "#6EE7B7",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontSize: 14,
                  color: "#8B8B8F",
                  marginTop: 8,
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Logo */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 32,
            left: 40,
            fontSize: 20,
            fontWeight: 700,
            color: "#5C5C60",
          }}
        >
          아이케미
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Noto Sans KR",
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
