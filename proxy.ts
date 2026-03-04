import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/auth/callback",
  "/terms",
  "/privacy",
  "/marketing",
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
    pathname.startsWith("/invite/");

  // 미로그인 → 공개 페이지만 허용
  if (!isPublic && !user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 로그인 상태에서 보호 페이지 접근 시 프로필/테스트 체크
  if (user && !isPublic) {
    const { data: profile } = await supabase
      .from("befe_profiles")
      .select("test_completed")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.redirect(new URL("/profile/create", request.url));
    }

    if (!profile.test_completed && !pathname.startsWith("/test")) {
      return NextResponse.redirect(new URL("/test/intro", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
