import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/db"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          await connectToDatabase()
          const user = await User.findOne({ email: credentials?.email })
          if (!user) return null

          if (!credentials?.password || typeof credentials.password !== 'string') return null

          const isValidPassword = await bcrypt.compare(credentials.password, user.password || '')
          if (!isValidPassword) return null

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.fullName,
            role: user.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
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
    async redirect({ url, baseUrl }) {
      // If it's a relative URL, make it absolute
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // If it's the same origin, allow it
      if (url.startsWith(baseUrl)) return url
      // Default to dashboard
      return `${baseUrl}/dashboard`
    },
  },
  pages: {
    signIn: '/login',
  },
})