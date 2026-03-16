import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // /invite/[id] 경로 진입 시 invited_by 쿠키 설정
  const match = request.nextUrl.pathname.match(/^\/invite\/([^/]+)$/);
  if (match) {
    const inviterProfileId = match[1];
    const response = NextResponse.next();
    response.cookies.set("invited_by", inviterProfileId, {
      path: "/",
      maxAge: 60 * 60 * 24,
      httpOnly: true,
      sameSite: "lax",
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/invite/:id*"],
};
