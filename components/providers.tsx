"use client"

import { useEffect, useState, type ReactNode } from "react"
import type { User } from "@/lib/definitions"
import { db } from "@/lib/db"
import { initializeApp } from "@/app/actions"

// Create a global state for user data to avoid context issues
let globalUser: User | null = null
let globalLoading = true
let listeners: Array<() => void> = []

// Function to update the global state
function updateGlobalState(user: User | null, loading: boolean) {
  globalUser = user
  globalLoading = loading
  // Notify all listeners
  listeners.forEach((listener) => listener())
}

// Function to initialize the app
async function initializeAppData() {
  if (typeof window === "undefined") return

  try {
    // Initialize the app with sample data if needed
    await initializeApp()

    // Get user from localStorage
    const userData = db.getUser()
    updateGlobalState(userData, false)
  } catch (error) {
    console.error("Error initializing app:", error)
    updateGlobalState(null, false)
  }
}

// Custom hook to access user data
export function useAppContext() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Create a listener function
    const handleChange = () => {
      setUser(globalUser)
      setLoading(globalLoading)
    }

    // Add listener
    listeners.push(handleChange)

    // Set initial state
    setUser(globalUser)
    setLoading(globalLoading)

    // Initialize if needed
    if (globalLoading && typeof window !== "undefined") {
      initializeAppData()
    }

    // Cleanup
    return () => {
      listeners = listeners.filter((l) => l !== handleChange)
    }
  }, [])

  // Return null during server-side rendering to prevent hydration mismatch
  if (!isMounted) {
    return { user: null, loading: true }
  }

  return { user, loading }
}

// This is now just a wrapper component that doesn't use context
export function AppProvider({ children }: { children: ReactNode }) {
  // Initialize on mount
  useEffect(() => {
    if (globalLoading && typeof window !== "undefined") {
      initializeAppData()
    }
  }, [])

  return <>{children}</>
}

