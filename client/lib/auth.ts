import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import User from "@/lib/models/User"
import { verifyPassword } from "@/lib/utils/password"
import { connectToDatabase } from "@/lib/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        await connectToDatabase() // Add this!
        
        const user = await User.findOne({ email: credentials.email as string })
        
        if (!user || !verifyPassword(credentials.password as string, user.password)) {
          throw new Error("Invalid credentials.")
        }
        
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.fullName,
          role: user.role
        }
      },
    }),
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
  },
})