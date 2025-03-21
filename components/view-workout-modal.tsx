"use client"

import { BarChart3, Calendar, Dumbbell, Trash } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { getWorkoutById } from "@/app/actions"
import { useEffect, useState, useRef } from "react"
import type { Exercise, Workout } from "@/lib/definitions"
import { Skeleton } from "@/components/ui/skeleton"

interface ViewWorkoutModalProps {
  workout: Workout | null
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => void
}

export function ViewWorkoutModal({ workout, isOpen, onClose, onDelete }: ViewWorkoutModalProps) {
  const [loading, setLoading] = useState(false)
  const [workoutDetails, setWorkoutDetails] = useState<Workout | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const isMounted = useRef(true)

  useEffect(() => {
    // Set isMounted to true when the component mounts
    isMounted.current = true

    const fetchWorkoutDetails = async () => {
      if (!workout) return

      setLoading(true)
      const { workout: workoutData, exercises: exercisesData } = await getWorkoutById(workout.id)

      if (isMounted.current) {
        if (workoutData) {
          setWorkoutDetails(workoutData)
          setExercises(exercisesData || [])
        }
        setLoading(false)
      }
    }

    if (isOpen && workout) {
      fetchWorkoutDetails()
    }

    // Cleanup function
    return () => {
      isMounted.current = false
    }
  }, [isOpen, workout])

  const getWorkoutIcon = (type: string) => {
    switch (type) {
      case "strength":
        return <Dumbbell className="h-5 w-5" />
      case "cardio":
        return <BarChart3 className="h-5 w-5" />
      default:
        return <Calendar className="h-5 w-5" />
    }
  }

  const getWorkoutTypeLabel = (type: string) => {
    switch (type) {
      case "strength":
        return "Strength Training"
      case "cardio":
        return "Cardio"
      case "flexibility":
        return "Flexibility"
      default:
        return "Other"
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] mx-auto">
        {workout && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <DialogTitle className="text-xl">{workout.title}</DialogTitle>
                <Badge variant="outline">{getWorkoutTypeLabel(workout.type)}</Badge>
              </div>
              <DialogDescription className="flex items-center pt-1">
                <Calendar className="mr-1 h-4 w-4" />
                {formatDate(workout.date)}
              </DialogDescription>
            </DialogHeader>

            {loading ? (
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
                <Separator />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground">Duration</span>
                    <span className="text-lg">{workout.duration} min</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground">Calories</span>
                    <span className="text-lg">{workout.calories || "N/A"}</span>
                  </div>
                </div>

                {workout.type === "cardio" && workout.distance && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-muted-foreground">Distance</span>
                      <span className="text-lg">{workout.distance} km</span>
                    </div>
                    {workout.pace && (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-muted-foreground">Pace</span>
                        <span className="text-lg">{workout.pace}/km</span>
                      </div>
                    )}
                  </div>
                )}

                {workout.type === "strength" && exercises.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="mb-2 font-medium">Exercises</h3>
                      <div className="space-y-2">
                        {exercises.map((exercise) => (
                          <div key={exercise.id} className="rounded-md border p-3">
                            <div className="font-medium">{exercise.name}</div>
                            <div className="mt-1 grid grid-cols-3 text-sm text-muted-foreground">
                              <div>{exercise.sets} sets</div>
                              <div>{exercise.reps} reps</div>
                              <div>{exercise.weight || 0} kg</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {workout.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="mb-1 font-medium">Notes</h3>
                      <p className="text-sm text-muted-foreground">{workout.notes}</p>
                    </div>
                  </>
                )}

                <div className="flex justify-end mt-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      onDelete(workout.id)
                      onClose()
                    }}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Workout
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

