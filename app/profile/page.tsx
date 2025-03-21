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
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold">{joinedChallenges.length}</span>
            <span className="text-sm text-muted-foreground">Challenges</span>
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

      {/* Joined Challenges Section */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Joined Challenges</h2>
          <Link href="/challenges" className="text-sm text-muted-foreground hover:underline">
            Find more challenges
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {joinedChallenges.length > 0 ? (
            joinedChallenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge
                      className={
                        challenge.status === "active"
                          ? "bg-green-500 hover:bg-green-600"
                          : challenge.status === "completed"
                            ? "bg-secondary hover:bg-secondary/80"
                            : "bg-blue-500 hover:bg-blue-600"
                      }
                    >
                      {challenge.status === "active"
                        ? "Active"
                        : challenge.status === "upcoming"
                          ? "Upcoming"
                          : "Completed"}
                    </Badge>
                  </div>
                  <CardTitle className="mt-2">{challenge.title}</CardTitle>
                  <CardDescription className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {challenge.status === "upcoming"
                      ? `Starts on ${new Date(challenge.startDate).toLocaleDateString()}`
                      : challenge.status === "active"
                        ? `Ends on ${new Date(challenge.endDate).toLocaleDateString()}`
                        : `Completed on ${new Date(challenge.endDate).toLocaleDateString()}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm line-clamp-2">{challenge.description}</p>
                  {challenge.status === "active" && challenge.progress !== undefined && (
                    <>
                      <Progress value={challenge.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {challenge.completed}/{challenge.total} {challenge.total === 1 ? "task" : "tasks"} completed
                      </p>
                    </>
                  )}
                  {challenge.status === "completed" && (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <Trophy className="h-6 w-6 text-yellow-500" />
                      <span className="text-sm font-medium">Challenge Completed!</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant={challenge.status === "completed" ? "outline" : "default"}
                    className="w-full"
                    onClick={() => handleViewChallenge(challenge)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card className="md:col-span-2 lg:col-span-3 max-w-[400px] ml-0">
              <CardHeader>
                <CardTitle>No challenges joined yet</CardTitle>
                <CardDescription>Join challenges to track your progress and earn rewards</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/challenges">Browse Challenges</Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </section>

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

