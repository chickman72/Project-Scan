import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { usersContainer } from "@/lib/cosmos";
import { verifyPassword } from "@/lib/password";

const demoEmail = process.env.DEMO_USER_EMAIL;
const demoPassword = process.env.DEMO_USER_PASSWORD;

type UserItem = {
  id: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Demo Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password.trim();

        if (demoEmail && demoPassword) {
          if (email === demoEmail.toLowerCase() && password === demoPassword) {
            return {
              id: demoEmail.toLowerCase(),
              email: demoEmail.toLowerCase(),
              name: demoEmail.split("@")[0] ?? "Demo User",
            };
          }
        }

        if (!usersContainer) {
          return null;
        }

        try {
          const { resource } = await usersContainer
            .item(email, email)
            .read<UserItem>();

          if (!resource) {
            return null;
          }

          const valid = verifyPassword(
            password,
            resource.passwordSalt,
            resource.passwordHash
          );

          if (!valid) {
            return null;
          }

          return {
            id: resource.id,
            email: resource.email,
            name: resource.email.split("@")[0] ?? "User",
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = String(token.id);
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
