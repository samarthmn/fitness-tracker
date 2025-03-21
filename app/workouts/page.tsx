"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import { BarChart3, Calendar, Dumbbell, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ViewWorkoutModal } from "@/components/view-workout-modal"
import { EditWorkoutModal } from "@/components/edit-workout-modal"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { getWorkouts, updateWorkout, deleteWorkout } from "@/app/actions"
import type { Workout } from "@/lib/definitions"

export default function WorkoutsPage() {
  const { toast } = useToast()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [viewWorkout, setViewWorkout] = useState<Workout | null>(null)
  const [editWorkout, setEditWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Use a ref to track if data has been fetched
  const dataFetchedRef = useRef(false)

  // Use useCallback to prevent the function from being recreated on every render
  const fetchWorkouts = useCallback(async () => {
    if (dataFetchedRef.current) return

    try {
      setLoading(true)
      const { workouts, error } = await getWorkouts()

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
      } else {
        setWorkouts(workouts || [])
      }
    } catch (error) {
      console.error("Error fetching workouts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch workouts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      dataFetchedRef.current = true
    }
  }, [toast])

  // Only fetch workouts once when the component mounts
  useEffect(() => {
    fetchWorkouts()
  }, [fetchWorkouts])

  const handleSaveWorkout = async (updatedWorkout: Workout) => {
    try {
      const { workout, error } = await updateWorkout(updatedWorkout.id, updatedWorkout)

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
      } else {
        setWorkouts(workouts.map((w) => (w.id === updatedWorkout.id ? workout : w)))
        toast({
          title: "Success",
          description: "Workout updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating workout:", error)
      toast({
        title: "Error",
        description: "Failed to update workout",
        variant: "destructive",
      })
    } finally {
      setEditWorkout(null)
      setIsEditModalOpen(false)
    }
  }

  const handleDeleteWorkout = async (id: string) => {
    try {
      const { success, error } = await deleteWorkout(id)

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
      } else {
        setWorkouts(workouts.filter((w) => w.id !== id))
        toast({
          title: "Success",
          description: "Workout deleted successfully",
        })
      }
    } catch (error) {
      console.error("Error deleting workout:", error)
      toast({
        title: "Error",
        description: "Failed to delete workout",
        variant: "destructive",
      })
    } finally {
      setViewWorkout(null)
      setIsViewModalOpen(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getWorkoutIcon = (type: string) => {
    switch (type) {
      case "strength":
        return <Dumbbell className="h-5 w-5 text-muted-foreground" />
      case "cardio":
        return <BarChart3 className="h-5 w-5 text-muted-foreground" />
      default:
        return <Calendar className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getWorkoutTypeLabel = (type: string) => {
    switch (type) {
      case "strength":
        return "Strength"
      case "cardio":
        return "Cardio"
      case "flexibility":
        return "Flexibility"
      default:
        return "Other"
    }
  }

  const getWorkoutsByType = (type: string) => {
    if (type === "all") return workouts
    return workouts.filter((workout) => workout.type === type)
  }

  const handleViewWorkout = (workout: Workout) => {
    setViewWorkout(workout)
    setIsViewModalOpen(true)
  }

  const handleEditWorkout = (workout: Workout) => {
    setEditWorkout(workout)
    setIsEditModalOpen(true)
  }

  if (loading) {
    return <WorkoutsSkeleton />
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
          <p className="text-muted-foreground">View and manage your workout history</p>
        </div>
        <Button asChild>
          <Link href="/workouts/add">
            <Plus className="mr-2 h-4 w-4" />
            Log Workout
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Workouts</TabsTrigger>
          <TabsTrigger value="strength">Strength</TabsTrigger>
          <TabsTrigger value="cardio">Cardio</TabsTrigger>
          <TabsTrigger value="flexibility">Flexibility</TabsTrigger>
        </TabsList>

        {["all", "strength", "cardio", "flexibility"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="mt-4">
            {getWorkoutsByType(tabValue).length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getWorkoutsByType(tabValue).map((workout) => (
                  <Card key={workout.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{getWorkoutTypeLabel(workout.type)}</Badge>
                        {getWorkoutIcon(workout.type)}
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
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No workouts found</h3>
                <p className="text-muted-foreground mt-1">Start tracking your fitness journey by logging a workout</p>
                <Button className="mt-4" asChild>
                  <Link href="/workouts/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Log Workout
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {viewWorkout && (
        <ViewWorkoutModal
          workout={viewWorkout}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            // Small delay to prevent the "_pendingVisibility" error
            setTimeout(() => setViewWorkout(null), 100)
          }}
          onDelete={handleDeleteWorkout}
        />
      )}

      {editWorkout && (
        <EditWorkoutModal
          workout={editWorkout}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            // Small delay to prevent the "_pendingVisibility" error
            setTimeout(() => setEditWorkout(null), 100)
          }}
          onSave={handleSaveWorkout}
        />
      )}
    </div>
  )
}

function WorkoutsSkeleton() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-4 w-60 mt-1" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Skeleton className="h-10 w-full max-w-md" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-6 w-32 mt-2" />
              <Skeleton className="h-4 w-24 mt-1" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

