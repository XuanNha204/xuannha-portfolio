import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config (no database imports) shared by middleware and the
 * full NextAuth instance.
 */
export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "viewer";
      }
      delete token.picture;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        delete session.user.image;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isOwner = auth?.user?.role === "owner";
      const isLoginPage = pathname === "/admin/login";

      if (isLoginPage) {
        if (isLoggedIn && isOwner) {
          return Response.redirect(new URL("/admin", request.nextUrl));
        }
        return true;
      }

      if (pathname.startsWith("/admin")) {
        return isLoggedIn && isOwner;
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
