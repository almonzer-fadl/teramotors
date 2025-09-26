import { NextResponse } from "next/server"
import { getSession } from "@/lib/simple-auth"

export async function GET() {
  try {
    const session = await getSession()
    
    if (session) {
      return NextResponse.json(session)
    } else {
      return NextResponse.json(null, { status: 401 })
    }
  } catch (error) {
    console.error("Session API error:", error)
    return NextResponse.json(null, { status: 401 })
  }
}
