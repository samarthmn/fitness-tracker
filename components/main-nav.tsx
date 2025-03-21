"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Award, Dumbbell, Home, Menu, Moon, Sun, User, X } from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MainNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const routes = [
    {
      href: "/",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/workouts",
      label: "Workouts",
      icon: Dumbbell,
      active: pathname === "/workouts" || pathname?.startsWith("/workouts/"),
    },
    {
      href: "/challenges",
      label: "Challenges",
      icon: Award,
      active: pathname === "/challenges" || pathname?.startsWith("/challenges/"),
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
      active: pathname === "/profile",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="flex items-center gap-2 font-semibold" onClick={() => setIsOpen(false)}>
                <Dumbbell className="h-5 w-5" />
                <span>FitTrack</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col gap-4">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1 text-lg font-medium rounded-md hover:bg-accent",
                    route.active ? "text-primary" : "text-muted-foreground",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <route.icon className="h-5 w-5" />
                  {route.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2 font-semibold ml-2 md:ml-0">
          <Dumbbell className="h-5 w-5" />
          <span className="hidden md:inline-block">FitTrack</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 ml-10">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                route.active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Button size="sm" asChild>
            <Link href="/workouts/add">
              <Dumbbell className="mr-2 h-4 w-4" />
              Log Workout
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

