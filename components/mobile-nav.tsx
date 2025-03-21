"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Award, BarChart3, Dumbbell, Home, Menu, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  return (
    <div className="md:hidden flex w-full items-center justify-between">
      <Link href="/" className="flex items-center space-x-2">
        <Dumbbell className="h-6 w-6" />
        <span className="font-bold">FitTrack</span>
      </Link>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-auto">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0">
          <div className="px-7">
            <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
              <Dumbbell className="h-6 w-6" />
              <span className="font-bold">FitTrack</span>
            </Link>
          </div>
          <nav className="flex flex-col gap-4 text-lg font-medium mt-8 px-7">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-x-2 py-2",
                pathname === "/" ? "text-foreground" : "text-foreground/60",
              )}
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/workouts"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-x-2 py-2",
                pathname?.startsWith("/workouts") ? "text-foreground" : "text-foreground/60",
              )}
            >
              <Dumbbell className="h-5 w-5" />
              <span>Workouts</span>
            </Link>
            <Link
              href="/challenges"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-x-2 py-2",
                pathname?.startsWith("/challenges") ? "text-foreground" : "text-foreground/60",
              )}
            >
              <Award className="h-5 w-5" />
              <span>Challenges</span>
            </Link>
            <Link
              href="/progress"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-x-2 py-2",
                pathname?.startsWith("/progress") ? "text-foreground" : "text-foreground/60",
              )}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Progress</span>
            </Link>
            <div className="border-t my-4"></div>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-x-2 py-2",
                pathname?.startsWith("/profile") ? "text-foreground" : "text-foreground/60",
              )}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}

