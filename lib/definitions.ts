import { z } from "zod"

// User schema
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  image: z.string().optional(),
  streak: z.number().default(0),
  joinedAt: z.date().default(() => new Date()),
})

export type User = z.infer<typeof userSchema>

// Workout schemas
export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Exercise name is required"),
  sets: z.number().min(1, "Sets must be at least 1"),
  reps: z.number().min(1, "Reps must be at least 1"),
  weight: z.number().optional(),
  workoutId: z.string(),
})

export type Exercise = z.infer<typeof exerciseSchema>

export const workoutSchema = z.object({
  id: z.string(),
  title: z.string().min(2, "Title must be at least 2 characters"),
  type: z.enum(["strength", "cardio", "flexibility"]),
  date: z.date(),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  calories: z.number().optional(),
  notes: z.string().optional(),
  userId: z.string(),
  createdAt: z.date().default(() => new Date()),
  // Cardio specific fields
  distance: z.number().optional(),
  pace: z.string().optional(),
  // Flexibility specific fields
  intensity: z.string().optional(),
})

export type Workout = z.infer<typeof workoutSchema>

// Challenge schemas
export const challengeSchema = z.object({
  id: z.string(),
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  status: z.enum(["active", "upcoming", "completed"]),
  reward: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  // Additional fields for UI display
  participants: z.number().optional(),
  progress: z.number().optional(),
  total: z.number().optional(),
  completed: z.number().optional(),
  isJoined: z.boolean().optional(), // Added isJoined property
})

export type Challenge = z.infer<typeof challengeSchema>

export const challengeProgressSchema = z.object({
  id: z.string(),
  challengeId: z.string(),
  userId: z.string(),
  progress: z.number().default(0),
  total: z.number(),
  completed: z.number().default(0),
  joinedAt: z.date().default(() => new Date()),
})

export type ChallengeProgress = z.infer<typeof challengeProgressSchema>

// Form schemas
export const workoutFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  type: z.enum(["strength", "cardio", "flexibility"]),
  date: z.date(),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  calories: z.coerce.number().optional(),
  notes: z.string().optional(),
  // Cardio specific fields
  distance: z.coerce.number().optional(),
  pace: z.string().optional(),
  // Flexibility specific fields
  intensity: z.string().optional(),
})

export type WorkoutFormValues = z.infer<typeof workoutFormSchema>

export const exerciseFormSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  sets: z.coerce.number().min(1, "Sets must be at least 1"),
  reps: z.coerce.number().min(1, "Reps must be at least 1"),
  weight: z.coerce.number().optional(),
})

export type ExerciseFormValues = z.infer<typeof exerciseFormSchema>

