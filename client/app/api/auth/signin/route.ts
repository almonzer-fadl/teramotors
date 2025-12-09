import { NextRequest, NextResponse } from "next/server"
import { signIn } from "@/lib/simple-auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('[SIGNIN] Attempt for email:', email)

    if (!email || !password) {
      console.log('[SIGNIN] Missing email or password')
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    const result = await signIn(email, password)

    console.log('[SIGNIN] Result:', { success: result.success, role: result.user?.role, error: result.error })

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 401 })
    }
  } catch (error) {
    console.error("Sign in API error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
