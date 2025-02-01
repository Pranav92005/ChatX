// import GoogleProvider from "next-auth/providers/google";
// import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
// import { db } from "@/lib/db";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/authoptions";



const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };