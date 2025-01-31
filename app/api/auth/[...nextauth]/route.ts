
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

export const handler:NextAuthOptions = {
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
        // Assign user ID when user object is available
        token.id = user.id;
         
      }

      try {
        // Fetch user from the database based on token.id
        const dbUser = await db.get(`user:${token.id}`) as User | null;

        if (!dbUser) {
        //   console.log("No user found in the database for token.id:", token.id);
          return token; // Return token as is if user is not found in the database
        }

        // Ensure that user data is added to the token
        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          picture: dbUser.image,
        };
      } catch (error) {
        console.error("Error retrieving user from database:", error);
        return token; // Return token without any changes if an error occurs
      }
    },

    async session({ session, token }) {
    //   console.log("Session callback called. Token:", token);
      // Ensure token.id exists before assigning it to the session
      if (token?.id) {
        session.user.id = token.id;  // Assign token.id to session.user.id
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        console.log("Session populated with user:", session.user); // Debugging log
      } else {
        console.log("Token is missing id:", token); // Log if `id` is missing in token
      }
      return session; // Return the session with the populated user object
    },

    async redirect() {
      return "/dashboard"; // Redirect to the dashboard after successful login
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const GET = NextAuth(handler);
export const POST = NextAuth(handler);

