"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type Toast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive"
  open?: boolean
}

// Global state for toasts
let toasts: Toast[] = []
let toastListeners: Array<() => void> = []

// Function to add a toast
function addToast(toast: Omit<Toast, "id" | "open">) {
  const id = Math.random().toString(36).substring(2, 9)
  toasts = [...toasts, { id, ...toast, open: true }]
  notifyToastListeners()

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    dismissToast(id)
  }, 5000)
}

// Function to dismiss a toast
function dismissToast(id: string) {
  const index = toasts.findIndex((t) => t.id === id)
  if (index !== -1) {
    // Mark as closed for animation
    toasts[index] = { ...toasts[index], open: false }
    notifyToastListeners()

    // Remove after animation
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id)
      notifyToastListeners()
    }, 300)
  }
}

// Function to notify all listeners
function notifyToastListeners() {
  toastListeners.forEach((listener) => listener())
}

// Custom hook to access toasts
export function useSimpleToast() {
  const [toastList, setToastList] = React.useState<Toast[]>(toasts)

  React.useEffect(() => {
    // Create listener function
    const handleChange = () => {
      setToastList([...toasts])
    }

    // Add listener
    toastListeners.push(handleChange)

    // Cleanup
    return () => {
      toastListeners = toastListeners.filter((l) => l !== handleChange)
    }
  }, [])

  // Return the toast API
  return {
    toasts: toastList,
    toast: (props: { title?: string; description?: string; variant?: "default" | "destructive" }) => {
      addToast(props)
    },
    dismiss: dismissToast,
  }
}

// Toast component
export function SimpleToaster() {
  const { toasts, dismiss } = useSimpleToast()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed top-0 right-0 z-[100] flex flex-col items-end gap-2 p-4 max-h-screen overflow-hidden">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex w-full max-w-md items-center justify-between space-x-4 rounded-md border p-4 shadow-lg transition-all duration-300 ease-in-out",
            toast.open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
            toast.variant === "destructive"
              ? "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-50"
              : "border-border bg-background text-foreground",
          )}
        >
          <div className="grid gap-1">
            {toast.title && <div className="text-sm font-semibold">{toast.title}</div>}
            {toast.description && <div className="text-sm opacity-90">{toast.description}</div>}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="rounded-md p-1 text-foreground/50 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

// Direct toast function
export const simpleToast = {
  toast: (props: { title?: string; description?: string; variant?: "default" | "destructive" }) => {
    if (typeof window !== "undefined") {
      addToast(props)
    }
  },
}

