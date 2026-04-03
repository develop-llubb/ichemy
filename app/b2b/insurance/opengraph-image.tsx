import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "아이케미 B2B - 보험 설계사를 위한 데이터 컨설팅";
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
          Insurance B2B Data Solution
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 32,
            fontSize: 64,
            fontWeight: 700,
            color: "#EDEDEF",
            lineHeight: 1.2,
            letterSpacing: -2,
            textAlign: "center",
          }}
        >
          <span>리포트 한 장이</span>
          <span style={{ color: "#6EE7B7" }}>10년 계약</span>
          <span>을 만듭니다</span>
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
          데이터 기반 맞춤형 보험 컨설팅 시스템
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
            { value: "256", label: "맞춤형 리포트 조합" },
            { value: "10년", label: "고객 터치포인트" },
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
