import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name") || "배우자";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(145deg, #2C2420, #1A1614)",
          padding: "48px 52px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Left content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                background: "rgba(212,115,92,0.2)",
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 16,
                color: "#E8927C",
                fontWeight: 600,
              }}
            >
              💌 {name}님이 초대했어요
            </div>
          </div>

          {/* Main copy */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: "#FFFFFF",
                lineHeight: 1.35,
                letterSpacing: -1,
              }}
            >
              우리 부부 육아 점수,
              <br />몇 점일까?
            </div>
            <div
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.5,
              }}
            >
              3분 심리 검사로 알아보는 부부 육아 케미
            </div>
          </div>

          {/* CTA pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "linear-gradient(135deg, #D4735C, #C0614A)",
              borderRadius: 16,
              padding: "12px 24px",
              fontSize: 16,
              fontWeight: 700,
              color: "#fff",
              alignSelf: "flex-start",
              boxShadow: "0 4px 16px rgba(212,115,92,0.3)",
            }}
          >
            함께 검사하기 →
          </div>
        </div>

        {/* Right side: icon + indicators */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            width: 180,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(145deg, #D4735C, #C0614A)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              boxShadow: "0 8px 24px rgba(212,115,92,0.3)",
            }}
          >
            👶
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              justifyContent: "center",
              maxWidth: 160,
            }}
          >
            {[
              { label: "마음여유", color: "#7BA872" },
              { label: "서로돕기", color: "#D4735C" },
              { label: "규칙일관", color: "#5B9BD5" },
              { label: "스트레스차단", color: "#8B72BE" },
            ].map((tag) => (
              <div
                key={tag.label}
                style={{
                  background: `${tag.color}22`,
                  borderRadius: 8,
                  padding: "4px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: tag.color,
                }}
              >
                {tag.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { width: 600, height: 314 },
  );
}
