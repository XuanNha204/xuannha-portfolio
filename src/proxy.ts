export { auth as proxy } from "@/lib/proxy-auth";

export const config = {
  matcher: ["/admin/:path*"],
};
