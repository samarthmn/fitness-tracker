"use client"

import { useEffect, useState, useRef } from "react"
import { Calendar, Dumbbell, Flame, Heart, TrendingUp, Trophy } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAppContext } from "@/components/providers"
import { getUserStats, getJoinedChallenges } from "@/app/actions"
import { ViewChallengeModal } from "@/components/view-challenge-modal"
import type { Challenge } from "@/lib/definitions"

export default function ProfilePage() {
  const { user, loading: userLoading } = useAppContext()
  const { toast } = useToast()
  const [stats, setStats] = useState<any>(null)
  const [joinedChallenges, setJoinedChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [viewChallenge, setViewChallenge] = useState<Challenge | null>(null)
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false)

  // Use a ref to track if we've already fetched data
  const dataFetchedRef = useRef(false)

  // Use a simpler useEffect with no dependencies to run only once
  useEffect(() => {
    // Only fetch data if we haven't already and user is loaded
    if (dataFetchedRef.current || userLoading) return

    let isActive = true

    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch user stats
        const { stats, error: statsError } = await getUserStats()
        if (!isActive) return

        if (statsError) {
          toast({
            title: "Error",
            description: statsError,
            variant: "destructive",
          })
        } else if (stats) {
          setStats(stats)
        }

        // Fetch joined challenges
        const { challenges, error: challengesError } = await getJoinedChallenges()
        if (!isActive) return

        if (challengesError) {
          toast({
            title: "Error",
            description: challengesError,
            variant: "destructive",
          })
        } else {
          setJoinedChallenges(challenges || [])
        }
      } catch (err) {
        if (isActive) {
          console.error("Error fetching profile data:", err)
        }
      } finally {
        if (isActive) {
          setLoading(false)
          // Mark that we've fetched data
          dataFetchedRef.current = true
        }
      }
    }

    fetchData()

    // Cleanup function
    return () => {
      isActive = false
    }
  }, [userLoading, toast])

  const handleViewChallenge = (challenge: Challenge) => {
    setViewChallenge(challenge)
    setIsChallengeModalOpen(true)
  }

  if (loading || userLoading) {
    return <ProfileSkeleton />
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">View your fitness statistics and progress</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold">{stats?.totalWorkouts || 0}</span>
            <span className="text-sm text-muted-foreground">Workouts</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.weeklyActivity?.daysWorkedOut || 0} workouts</div>
            <Progress value={stats?.weeklyActivity?.progress || 0} className="mt-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              {stats?.weeklyActivity?.daysWorkedOut || 0}/7 days this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Calories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">{stats?.totalCalories || 0}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Strength Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stats?.workoutsByType?.strength || 0}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {stats?.totalWorkouts
                  ? Math.round(((stats?.workoutsByType?.strength || 0) / stats.totalWorkouts) * 100)
                  : 0}
                % of total workouts
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cardio Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold">{stats?.workoutsByType?.cardio || 0}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {stats?.totalWorkouts
                  ? Math.round(((stats?.workoutsByType?.cardio || 0) / stats.totalWorkouts) * 100)
                  : 0}
                % of total workouts
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Flexibility Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">{stats?.workoutsByType?.flexibility || 0}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {stats?.totalWorkouts
                  ? Math.round(((stats?.workoutsByType?.flexibility || 0) / stats.totalWorkouts) * 100)
                  : 0}
                % of total workouts
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{stats?.totalDistance || 0} km</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {viewChallenge && isChallengeModalOpen && (
        <ViewChallengeModal
          challenge={viewChallenge}
          isOpen={isChallengeModalOpen}
          onClose={() => {
            setIsChallengeModalOpen(false)
            setTimeout(() => setViewChallenge(null), 100)
          }}
        />
      )}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </div>
        <div className="flex items-center gap-6">
          <Skeleton className="h-16 w-16" />
          <Skeleton className="h-16 w-16" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-2 w-full mb-2" />
              <Skeleton className="h-4 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-2 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

