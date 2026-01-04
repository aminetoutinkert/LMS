import NextAuth, { type DefaultSession, type DefaultUser } from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { env } from "@/env.mjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      languagePref: string;
      githubUsername?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    language_pref: string;
    github_username?: string;
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    GitHub({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          role: "student", // Default role for GitHub users
          language_pref: "fr", // Default language
          github_username: profile.login,
        };
      },
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error("Invalid credentials format");
        }

        const { email, password } = parsed.data;

        // Find user by email
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (!user || !user.password_hash) {
          throw new Error("No user found with this email");
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          language_pref: user.language_pref,
          github_username: user.github_username,
        } as any; // Cast to any to avoid type issues with returned user object vs NextAuth expectation
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For GitHub sign-ins, check if user exists or create new one
      if (account?.provider === "github" && user.email) {
        try {
          const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email));

          if (!existingUser) {
            // Create new user with GitHub data
            const [newUser] = await db
              .insert(users)
              .values({
                email: user.email,
                name: user.name || user.email.split("@")[0],
                role: "student",
                language_pref: "fr",
                github_username: user.github_username,
                profile_image_url: user.image || null,
                email_verified: true,
              })
              .returning();

            user.id = newUser.id;
          } else {
            user.id = existingUser.id;
          }
        } catch (error) {
          console.error("Error during GitHub sign-in:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, user }) {
      // When using database strategy, user is available. When using strategy: "jwt", token is available.
      // DrizzleAdapter typically uses database strategy by default if not specified otherwise, but strict typing can be tricky.
      // NextAuth v5 determines strategy based on adapter presence. With adapter, it defaults to "database".
      if (session.user) {
        session.user.id = user.id;
        // @ts-expect-error - custom fields
        session.user.role = user.role;
        // @ts-expect-error - custom fields
        session.user.languagePref = user.language_pref;
        // @ts-expect-error - custom fields
        session.user.githubUsername = user.github_username;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // @ts-expect-error - custom fields
        token.role = user.role;
        // @ts-expect-error - custom fields
        token.languagePref = user.language_pref;
        // @ts-expect-error - custom fields
        token.githubUsername = user.github_username;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login/error",
  },
  events: {
    async signIn({ user }) {
      // Update last login timestamp
      if (user.id) {
        try {
          await db
            .update(users)
            .set({ last_login: new Date(), is_active: true })
            .where(eq(users.id, user.id));
        } catch (e) {
          console.error("Error updating last login:", e);
        }
      }
    },
  },
  debug: process.env.NODE_ENV !== "production",
});
