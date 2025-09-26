import { connectToDatabase } from "@/lib/db"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "your-secret-key"
)

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

export interface AuthSession {
  user: AuthUser
}

export async function signIn(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    await connectToDatabase()
    const user = await User.findOne({ email })
    
    if (!user) {
      return { success: false, error: "Invalid email or password" }
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return { success: false, error: "Invalid email or password" }
    }

    const authUser: AuthUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.fullName,
      role: user.role
    }

    // Create JWT token
    const token = await new SignJWT({ user: authUser })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return { success: true, user: authUser }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: "An error occurred" }
  }
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) return null

    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as AuthSession
  } catch (error) {
    return null
  }
}

export async function getServerSession(): Promise<AuthSession | null> {
  return getSession()
}
