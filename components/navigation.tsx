"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Dumbbell, Home, Trophy, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export function Navigation() {
  const pathname = usePathname()

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
      active: pathname === "/workouts",
    },
    {
      href: "/challenges",
      label: "Challenges",
      icon: Trophy,
      active: pathname === "/challenges",
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
      active: pathname === "/profile",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Dumbbell className="h-6 w-6 mr-2" />
          <Link href="/" className="text-xl font-bold">
            FitTrack
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center",
                route.active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <route.icon className="h-4 w-4 mr-2" />
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center md:hidden">
          <Button variant="ghost" size="sm" className="mr-2" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              <span className="sr-only">Dashboard</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="mr-2" asChild>
            <Link href="/workouts">
              <Dumbbell className="h-4 w-4 mr-2" />
              <span className="sr-only">Workouts</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="mr-2" asChild>
            <Link href="/challenges">
              <Trophy className="h-4 w-4 mr-2" />
              <span className="sr-only">Challenges</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="mr-2" asChild>
            <Link href="/profile">
              <User className="h-4 w-4 mr-2" />
              <span className="sr-only">Profile</span>
            </Link>
          </Button>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

