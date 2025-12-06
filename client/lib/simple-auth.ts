import { logActivity } from "@/lib/services/loggingService";
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
  firstName?: string
  lastName?: string
  role: string
  tenantId?: string
}

export interface AuthSession {
  user: AuthUser
}

// Alias for backward compatibility with code expecting 'Session' type
export type Session = AuthSession

export async function signIn(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    await connectToDatabase()
    console.log('[AUTH] Looking up user:', email)

    // Try exact match first
    let user = await User.findOne({ email })
    console.log('[AUTH] Exact match result:', user ? 'Found' : 'Not found')

    // If not found, try case-insensitive
    if (!user) {
      user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
      console.log('[AUTH] Case-insensitive result:', user ? 'Found' : 'Not found')
    }

    if (!user) {
      // Log failed login attempt (user not found)
      await logActivity({
        level: 'warn',
        message: `Failed login attempt: User not found for email "${email}".`,
        resource: { type: 'authentication' },
        action: 'login_fail',
        details: { emailAttempted: email },
      });
      return { success: false, error: "Invalid email or password" }
    }

    console.log('[AUTH] User found:', { email: user.email, role: user.role, hasPassword: !!user.password })

    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log('[AUTH] Password valid:', isValidPassword)

    if (!isValidPassword) {
      // Log failed login attempt (invalid password)
      await logActivity({
        level: 'warn',
        message: `Failed login attempt: Invalid password for user "${email}".`,
        userId: user._id,
        tenantId: user.tenantId,
        resource: { type: 'authentication', id: user._id.toString() },
        action: 'login_fail',
        details: { email: user.email },
      });
      return { success: false, error: "Invalid email or password" }
    }

    const authUser: AuthUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.fullName || `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenantId: user.tenantId?.toString()
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

    // Log successful login
    await logActivity({
      level: 'audit',
      message: `User "${authUser.email}" logged in successfully.`,
      userId: authUser.id,
      tenantId: authUser.tenantId,
      resource: { type: 'authentication', id: authUser.id },
      action: 'login_success',
    });

    return { success: true, user: authUser }
  } catch (error) {
    console.error("Sign in error:", error)
    // Log generic sign-in error
    await logActivity({
      level: 'error',
      message: `An unexpected error occurred during sign-in for email "${email}".`,
      resource: { type: 'authentication' },
      action: 'login_error',
      details: { error: (error as Error).message },
    });
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
