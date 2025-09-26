"use client"

import { useState, useEffect } from "react"

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
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()
    return data
  } catch (error) {
    return { success: false, error: "Network error" }
  }
}

export async function signOut(): Promise<void> {
  try {
    await fetch("/api/auth/signout", { method: "POST" })
    window.location.href = "/login"
  } catch (error) {
    console.error("Sign out error:", error)
  }
}

export function useSession() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch("/api/auth/session")
        if (response.ok) {
          const data = await response.json()
          setSession(data)
        } else {
          setSession(null)
        }
      } catch (error) {
        setSession(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [])

  return {
    user: session?.user,
    isLoading,
    isAuthenticated: !!session?.user
  }
}
