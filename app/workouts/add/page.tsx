"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Dumbbell, Flame, Plus, Trash2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { type WorkoutFormValues, type ExerciseFormValues, workoutFormSchema } from "@/lib/definitions"
import { createWorkout, addExerciseToWorkout } from "@/app/actions"

export default function AddWorkoutPage() {
  const router = useRouter()
  const { toast } = useToast() // Correctly destructure the toast object
  const [activeTab, setActiveTab] = useState("strength")
  const [exercises, setExercises] = useState<ExerciseFormValues[]>([{ name: "", sets: 3, reps: 10, weight: 0 }])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      title: "",
      type: "strength",
      date: new Date(),
      duration: 45,
      calories: 0,
      notes: "",
    },
  })

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: 3, reps: 10, weight: 0 }])
  }

  const removeExercise = (index: number) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, i) => i !== index))
    }
  }

  const updateExercise = (index: number, field: keyof ExerciseFormValues, value: any) => {
    const updatedExercises = [...exercises]
    updatedExercises[index] = { ...updatedExercises[index], [field]: value }
    setExercises(updatedExercises)
  }

  const handleSubmit = async (data: WorkoutFormValues) => {
    setIsSubmitting(true)

    try {
      // Create the workout
      const { workout, error } = await createWorkout(data)

      if (error || !workout) {
        throw new Error(error || "Failed to create workout")
      }

      // If it's a strength workout, add exercises
      if (data.type === "strength" && exercises.length > 0) {
        for (const exercise of exercises) {
          if (exercise.name.trim()) {
            await addExerciseToWorkout(workout.id, exercise)
          }
        }
      }

      // Use the toast object correctly
      toast({
        title: "Success",
        description: "Workout logged successfully",
      })

      router.push("/workouts")
    } catch (error) {
      console.error("Error saving workout:", error)
      // Use the toast object correctly
      toast({
        title: "Error",
        description: "Failed to save workout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6 px-4 md:px-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/workouts">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Log Workout</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="strength" onClick={() => form.setValue("type", "strength")}>
                <Dumbbell className="mr-2 h-4 w-4" />
                Strength
              </TabsTrigger>
              <TabsTrigger value="cardio" onClick={() => form.setValue("type", "cardio")}>
                <Flame className="mr-2 h-4 w-4" />
                Cardio
              </TabsTrigger>
              <TabsTrigger value="flexibility" onClick={() => form.setValue("type", "flexibility")}>
                <Clock className="mr-2 h-4 w-4" />
                Flexibility
              </TabsTrigger>
            </TabsList>

            <TabsContent value="strength" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workout Details</CardTitle>
                  <CardDescription>Enter the details of your strength training session</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Workout Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Upper Body, Leg Day" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="calories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calories Burned</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Exercises</Label>
                    <div className="space-y-4">
                      {exercises.map((exercise, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="grid grid-cols-12 gap-2 items-end">
                              <div className="col-span-12 md:col-span-4 space-y-2">
                                <Label htmlFor={`exercise-name-${index}`}>Exercise</Label>
                                <Input
                                  id={`exercise-name-${index}`}
                                  placeholder="Bench Press"
                                  value={exercise.name}
                                  onChange={(e) => updateExercise(index, "name", e.target.value)}
                                />
                              </div>
                              <div className="col-span-4 md:col-span-2 space-y-2">
                                <Label htmlFor={`exercise-sets-${index}`}>Sets</Label>
                                <Input
                                  id={`exercise-sets-${index}`}
                                  type="number"
                                  placeholder="3"
                                  value={exercise.sets}
                                  onChange={(e) => updateExercise(index, "sets", Number.parseInt(e.target.value))}
                                />
                              </div>
                              <div className="col-span-4 md:col-span-2 space-y-2">
                                <Label htmlFor={`exercise-reps-${index}`}>Reps</Label>
                                <Input
                                  id={`exercise-reps-${index}`}
                                  type="number"
                                  placeholder="10"
                                  value={exercise.reps}
                                  onChange={(e) => updateExercise(index, "reps", Number.parseInt(e.target.value))}
                                />
                              </div>
                              <div className="col-span-3 md:col-span-3 space-y-2">
                                <Label htmlFor={`exercise-weight-${index}`}>Weight (kg)</Label>
                                <Input
                                  id={`exercise-weight-${index}`}
                                  type="number"
                                  placeholder="60"
                                  value={exercise.weight}
                                  onChange={(e) => updateExercise(index, "weight", Number.parseFloat(e.target.value))}
                                />
                              </div>
                              <div className="col-span-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground"
                                  type="button"
                                  onClick={() => removeExercise(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      <Button variant="outline" size="sm" className="w-full" type="button" onClick={addExercise}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Exercise
                      </Button>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Add any notes about your workout..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cardio" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cardio Workout</CardTitle>
                  <CardDescription>Enter the details of your cardio session</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Workout Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Morning Run, Cycling" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="distance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Distance (km)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="calories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calories Burned</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pace"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pace (min/km)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 5:30" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Add any notes about your cardio session..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="flexibility" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Flexibility Workout</CardTitle>
                  <CardDescription>Log yoga, pilates, stretching, or other activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Activity Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Yoga, Pilates, Stretching" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="calories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calories Burned</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Add any notes about your activity..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Workout"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

