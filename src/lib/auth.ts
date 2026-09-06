import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { dbConnect } from "./db";
import { User } from "@/models/User";
import { loginSchema } from "@/schemas";
import { getClientIp } from "@/lib/client-ip";
import {
  clearLoginFailures,
  compareWithDummyPassword,
  loginAllowed,
  recordLoginFailure,
} from "@/lib/auth-security";

export const { handlers, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const normalizedEmail = email.trim().toLowerCase();
        const ip = getClientIp(request.headers);

        await dbConnect();
        if (!(await loginAllowed(normalizedEmail, ip))) return null;

        const user = await User.findOne({ email: normalizedEmail })
          .select("+password +sessionVersion")
          .lean();
        if (!user) {
          await compareWithDummyPassword(password);
          await recordLoginFailure(normalizedEmail, ip);
          return null;
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          await recordLoginFailure(normalizedEmail, ip);
          return null;
        }

        await clearLoginFailures(normalizedEmail, ip);

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
          sessionVersion: user.sessionVersion ?? 0,
        };
      },
    }),
  ],
});
