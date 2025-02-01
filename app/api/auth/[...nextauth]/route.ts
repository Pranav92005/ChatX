import GoogleProvider from "next-auth/providers/google";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { db } from "@/lib/db";
import NextAuth, { NextAuthOptions } from "next-auth";

function googleCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  console.log("Google credentials:", { clientId, clientSecret });

  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not set");
  }
  if (!clientSecret) {
    throw new Error("GOOGLE_CLIENT_SECRET is not set");
  }

  return { clientId, clientSecret };
}

export const handler: NextAuthOptions = {
  adapter: UpstashRedisAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    GoogleProvider({
      clientId: googleCredentials().clientId,
      clientSecret: googleCredentials().clientSecret,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      try {
        const dbUser = await db.get(`user:${token.id}`) as User | null;

        if (!dbUser) {
          return token;
        }

        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          picture: dbUser.image,
        };
      } catch (error) {
        console.error("Error retrieving user from database:", error);
        return token;
      }
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        console.log("Session populated with user:", session.user);
      } else {
        console.log("Token is missing id:", token);
      }
      return session;
    },

    async redirect() {
      return "/dashboard";
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const POST = NextAuth(handler);
export const GET = NextAuth(handler);
