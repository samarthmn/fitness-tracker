"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { ArrowRight, Award, BarChart3, Dumbbell, Flame, Users, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppContext } from "@/components/providers"
import { ViewWorkoutModal } from "@/components/view-workout-modal"
import { EditWorkoutModal } from "@/components/edit-workout-modal"
import { getWorkouts, getChallenges, getUserStats, deleteWorkout, updateWorkout, initializeApp } from "@/app/actions"
import type { Workout, Challenge } from "@/lib/definitions"
import { useToast } from "@/components/ui/use-toast"
import { ViewChallengeModal } from "@/components/view-challenge-modal"

export default function Dashboard() {
  const { user, loading: userLoading } = useAppContext()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [viewWorkout, setViewWorkout] = useState<Workout | null>(null)
  const [editWorkout, setEditWorkout] = useState<Workout | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { toast } = useToast()

  // Add state variables for the challenge modal
  const [viewChallenge, setViewChallenge] = useState<Challenge | null>(null)
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false)

  // Use a ref to track if data has been fetched
  const dataFetchedRef = useRef(false)

  // Define fetchData here so it can be called in the refresh button
  const fetchData = async () => {
    let isMounted = true

    try {
      setLoading(true)

      // Fetch workouts
      const workoutsRes = await getWorkouts()
      if (workoutsRes.workouts && isMounted) {
        // Sort by date, most recent first
        const sortedWorkouts = [...workoutsRes.workouts].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )
        setWorkouts(sortedWorkouts.slice(0, 3)) // Get most recent 3
      }

      // Fetch challenges
      const challengesRes = await getChallenges()
      if (challengesRes.challenges && isMounted) {
        setChallenges(challengesRes.challenges.filter((c) => c.status !== "completed").slice(0, 3))
      } else if (isMounted) {
        console.error("No challenges returned:", challengesRes.error)
        // Force initialization
        await initializeApp()
        // Try fetching again
        const retryRes = await getChallenges()
        if (retryRes.challenges && isMounted) {
          setChallenges(retryRes.challenges.filter((c) => c.status !== "completed").slice(0, 3))
        }
      }

      // Fetch user stats
      const statsRes = await getUserStats()
      if (statsRes.stats && isMounted) {
        setStats(statsRes.stats)
      }
    } catch (error) {
      if (isMounted) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please refresh the page.",
          variant: "destructive",
        })
      }
    } finally {
      if (isMounted) {
        setLoading(false)
        dataFetchedRef.current = true
      }
    }

    return () => {
      isMounted = false
    }
  }

  // Update the useEffect to use this function
  useEffect(() => {
    let isMounted = true

    if (!dataFetchedRef.current && !userLoading) {
      const fetchDataInternal = async () => {
        try {
          setLoading(true)

          // Fetch workouts
          const workoutsRes = await getWorkouts()
          if (workoutsRes.workouts && isMounted) {
            // Sort by date, most recent first
            const sortedWorkouts = [...workoutsRes.workouts].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            )
            setWorkouts(sortedWorkouts.slice(0, 3)) // Get most recent 3
          }

          // Fetch challenges
          const challengesRes = await getChallenges()
          if (challengesRes.challenges && isMounted) {
            setChallenges(challengesRes.challenges.filter((c) => c.status !== "completed").slice(0, 3))
          } else if (isMounted) {
            console.error("No challenges returned:", challengesRes.error)
            // Force initialization
            await initializeApp()
            // Try fetching again
            const retryRes = await getChallenges()
            if (retryRes.challenges && isMounted) {
              setChallenges(retryRes.challenges.filter((c) => c.status !== "completed").slice(0, 3))
            }
          }

          // Fetch user stats
          const statsRes = await getUserStats()
          if (statsRes.stats && isMounted) {
            setStats(statsRes.stats)
          }
        } catch (error) {
          if (isMounted) {
            console.error("Error fetching dashboard data:", error)
            toast({
              title: "Error",
              description: "Failed to load dashboard data. Please refresh the page.",
              variant: "destructive",
            })
          }
        } finally {
          if (isMounted) {
            setLoading(false)
            dataFetchedRef.current = true
          }
        }
      }

      fetchDataInternal()
    }

    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false
    }
  }, [userLoading, toast])

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
  }

  const handleViewWorkout = (workout: Workout) => {
    setViewWorkout(workout)
    setIsViewModalOpen(true)
  }

  const handleEditWorkout = (workout: Workout) => {
    setEditWorkout(workout)
    setIsEditModalOpen(true)
  }

  // Add a function to handle opening the challenge modal
  const handleViewChallenge = (challenge: Challenge) => {
    setViewChallenge(challenge)
    setIsChallengeModalOpen(true)
  }

  if (loading || userLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 space-y-8">
      <section className="space-y-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground">Track your fitness journey and challenge yourself</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.weeklyActivity?.daysWorkedOut || 0}/7</div>
              <Progress
                value={stats?.weeklyActivity?.workouts ? stats?.weeklyActivity?.progress || 0 : 0}
                className="mt-2"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {stats?.weeklyActivity?.workouts || 0} workouts completed this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">{challenges.filter((c) => c.status === "active").length}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {challenges
                  .filter((c) => c.status === "active")
                  .map((c) => c.title)
                  .join(", ") || "No active challenges"}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {workouts.length > 0 && (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Workouts</h2>
            <Link href="/workouts" className="text-sm text-muted-foreground hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}</Badge>
                    {workout.type === "strength" ? (
                      <Dumbbell className="h-5 w-5 text-muted-foreground" />
                    ) : workout.type === "cardio" ? (
                      <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Flame className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle className="mt-2">{workout.title}</CardTitle>
                  <CardDescription>{formatDate(workout.date)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Duration: {workout.duration} min</div>
                    <div>Calories: {workout.calories || 0}</div>
                    {workout.type === "cardio" && workout.distance && (
                      <>
                        <div>Distance: {workout.distance} km</div>
                        {workout.pace && <div>Pace: {workout.pace}/km</div>}
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditWorkout(workout)}>
                    Edit
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => handleViewWorkout(workout)}>
                    View
                  </Button>
                </CardFooter>
              </Card>
            ))}
            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>Quick Add Workout</CardTitle>
                <CardDescription>Log your latest activity</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/workouts/add">
                    Log Workout <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Featured Challenges</h2>
          <Link href="/challenges" className="text-sm text-muted-foreground hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {challenges && challenges.length > 0 ? (
            <>
              {challenges.slice(0, 3).map((challenge) => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge
                        className={
                          challenge.status === "active"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-blue-500 hover:bg-blue-600"
                        }
                      >
                        {challenge.status === "active" ? "Active" : "Upcoming"}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-1 h-4 w-4" />
                        {challenge.participants || 0}
                      </div>
                    </div>
                    <CardTitle className="mt-2">{challenge.title}</CardTitle>
                    <CardDescription className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {challenge.status === "active"
                        ? `Ends on ${new Date(challenge.endDate).toLocaleDateString()}`
                        : `Starts on ${new Date(challenge.startDate).toLocaleDateString()}`}
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
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => handleViewChallenge(challenge)}>
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </>
          ) : (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>No challenges available</CardTitle>
                <CardDescription>Check back later for new challenges or try refreshing the page</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  onClick={() => {
                    // Reset the data fetched flag to force a refresh
                    dataFetchedRef.current = false
                    // Manually trigger a refresh
                    fetchData()
                  }}
                >
                  Refresh Challenges
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </section>

      {/* Always render modals but control their visibility with the open prop */}
      <ViewWorkoutModal
        workout={viewWorkout}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          // Small delay to prevent the "_pendingVisibility" error
          setTimeout(() => setViewWorkout(null), 100)
        }}
        onDelete={async (id) => {
          const { success } = await deleteWorkout(id)
          if (success) {
            setWorkouts(workouts.filter((w) => w.id !== id))
            toast({
              title: "Success",
              description: "Workout deleted successfully",
            })
          }
          setIsViewModalOpen(false)
          setTimeout(() => setViewWorkout(null), 100)
        }}
      />

      <EditWorkoutModal
        workout={editWorkout}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          // Small delay to prevent the "_pendingVisibility" error
          setTimeout(() => setEditWorkout(null), 100)
        }}
        onSave={async (updatedWorkout) => {
          const { workout } = await updateWorkout(updatedWorkout.id, updatedWorkout)
          if (workout) {
            setWorkouts(workouts.map((w) => (w.id === updatedWorkout.id ? workout : w)))
            toast({
              title: "Success",
              description: "Workout updated successfully",
            })
          }
          setIsEditModalOpen(false)
          setTimeout(() => setEditWorkout(null), 100)
        }}
      />

      <ViewChallengeModal
        challenge={viewChallenge}
        isOpen={isChallengeModalOpen}
        onClose={() => {
          setIsChallengeModalOpen(false)
          setTimeout(() => setViewChallenge(null), 100)
        }}
      />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-6 space-y-8">
      <section className="space-y-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-2 w-full mb-2" />
                <Skeleton className="h-4 w-36" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

