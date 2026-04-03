import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/auth/callback",
  "/terms",
  "/privacy",
  "/marketing",
  "/b2b/insurance",
  "/profile/create",
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/invite/") ||
    pathname.startsWith("/coupon/") ||
    pathname.startsWith("/og/");

  // /invite/[id] → invited_by 쿠키 설정 (로그인 여부 무관 — 프로필 생성 시 필요)
  if (pathname.startsWith("/invite/")) {
    const inviterId = pathname.split("/invite/")[1];
    if (inviterId) {
      response.cookies.set("invited_by", inviterId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "lax",
      });
    }
  }

  // /coupon/[code] → coupon_code 쿠키 설정 (로그인 여부 무관 — 프로필 생성 시 필요)
  if (pathname.startsWith("/coupon/")) {
    const couponCode = pathname.split("/coupon/")[1];
    if (couponCode) {
      response.cookies.set("coupon_code", couponCode, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "lax",
      });
    }
  }

  // 미로그인 → 공개 페이지만 허용
  if (!isPublic && !user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 미로그인 + protected 페이지 → 랜딩으로 (위에서 이미 처리됨)
  // 프로필/테스트 상태 기반 라우팅은 각 페이지 서버 컴포넌트에서 처리

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
