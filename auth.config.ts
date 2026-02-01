/**
 * File: auth.config.ts
 * Description: Edge-compatible NextAuth configuration for middleware session checks.
 */

import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export const authConfig: NextAuthConfig = {
  providers: [
    GitHub({
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnApp =
        nextUrl.pathname.startsWith("/gym") ||
        nextUrl.pathname.startsWith("/nutrition");

      if (isOnAdmin || isOnApp) {
        if (isLoggedIn) {
          if (isOnAdmin && auth?.user?.role !== "admin") {
            return Response.redirect(new URL("/", nextUrl));
          }
          return true;
        }
        return false;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = user.role ?? "user";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as string) ?? "user";
      }
      return session;
    },
  },
};
