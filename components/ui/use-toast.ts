"use client"

import { useSimpleToast } from "./simple-toast"

// Re-export the hook
export const useToast = useSimpleToast

// Export a direct toast function
export const toast = (props: {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}) => {
  if (typeof window === "undefined") return

  // Import directly to avoid any context issues
  import("./simple-toast").then(({ simpleToast }) => {
    simpleToast.toast(props)
  })
}

