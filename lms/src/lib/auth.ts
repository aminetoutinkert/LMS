import { DrizzleAdapter } from '@auth/drizzle-adapter';
import NextAuth, { type DefaultSession } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { db } from '@/lib/db';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      languagePref: string;
    } & DefaultSession['user'];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // @ts-expect-error - role and language_pref are custom fields
      session.user.id = user.id;
      // @ts-expect-error - role and language_pref are custom fields
      session.user.role = user.role;
      // @ts-expect-error - role and language_pref are custom fields
      session.user.languagePref = user.language_pref;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
