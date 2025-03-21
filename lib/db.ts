import { v4 as uuidv4 } from "uuid"
import type {
  User,
  Workout,
  Exercise,
  Challenge,
  ChallengeProgress,
  WorkoutFormValues,
  ExerciseFormValues,
} from "./definitions"

// Check if we're running on the server
const isServer = typeof window === "undefined"

// In a real app, this would be replaced with a proper database
// For now, we'll use localStorage for persistence on the client
class LocalStorageDB {
  private getItem<T>(key: string, defaultValue: T): T {
    if (isServer) return defaultValue

    const item = localStorage.getItem(key)
    if (!item) return defaultValue

    try {
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`Error parsing ${key} from localStorage:`, error)
      return defaultValue
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (isServer) return
    localStorage.setItem(key, JSON.stringify(value))
  }

  // User methods
  getUser(): User | null {
    return this.getItem<User | null>("user", null)
  }

  setUser(user: User): void {
    this.setItem("user", user)
  }

  // Workout methods
  getWorkouts(): Workout[] {
    return this.getItem<Workout[]>("workouts", [])
  }

  getWorkoutById(id: string): Workout | undefined {
    const workouts = this.getWorkouts()
    return workouts.find((workout) => workout.id === id)
  }

  addWorkout(workoutData: WorkoutFormValues): Workout {
    const workouts = this.getWorkouts()
    const user = this.getUser()

    if (!user) throw new Error("User not found")

    const newWorkout: Workout = {
      ...workoutData,
      id: uuidv4(),
      userId: user.id,
      createdAt: new Date(),
    }

    this.setItem("workouts", [...workouts, newWorkout])
    return newWorkout
  }

  updateWorkout(id: string, workoutData: Partial<Workout>): Workout {
    const workouts = this.getWorkouts()
    const workoutIndex = workouts.findIndex((workout) => workout.id === id)

    if (workoutIndex === -1) throw new Error("Workout not found")

    const updatedWorkout = {
      ...workouts[workoutIndex],
      ...workoutData,
    }

    workouts[workoutIndex] = updatedWorkout
    this.setItem("workouts", workouts)

    return updatedWorkout
  }

  deleteWorkout(id: string): void {
    const workouts = this.getWorkouts()
    this.setItem(
      "workouts",
      workouts.filter((workout) => workout.id !== id),
    )

    // Also delete associated exercises
    const exercises = this.getExercises()
    this.setItem(
      "exercises",
      exercises.filter((exercise) => exercise.workoutId !== id),
    )
  }

  // Exercise methods
  getExercises(): Exercise[] {
    return this.getItem<Exercise[]>("exercises", [])
  }

  getExercisesByWorkoutId(workoutId: string): Exercise[] {
    const exercises = this.getExercises()
    return exercises.filter((exercise) => exercise.workoutId === workoutId)
  }

  addExercise(workoutId: string, exerciseData: ExerciseFormValues): Exercise {
    const exercises = this.getExercises()

    const newExercise: Exercise = {
      ...exerciseData,
      id: uuidv4(),
      workoutId,
    }

    this.setItem("exercises", [...exercises, newExercise])
    return newExercise
  }

  updateExercise(id: string, exerciseData: Partial<Exercise>): Exercise {
    const exercises = this.getExercises()
    const exerciseIndex = exercises.findIndex((exercise) => exercise.id === id)

    if (exerciseIndex === -1) throw new Error("Exercise not found")

    const updatedExercise = {
      ...exercises[exerciseIndex],
      ...exerciseData,
    }

    exercises[exerciseIndex] = updatedExercise
    this.setItem("exercises", exercises)

    return updatedExercise
  }

  deleteExercise(id: string): void {
    const exercises = this.getExercises()
    this.setItem(
      "exercises",
      exercises.filter((exercise) => exercise.id !== id),
    )
  }

  // Challenge methods
  getChallenges(): Challenge[] {
    return this.getItem<Challenge[]>("challenges", [])
  }

  getChallengeById(id: string): Challenge | undefined {
    const challenges = this.getChallenges()
    return challenges.find((challenge) => challenge.id === id)
  }

  // Add method to update a challenge
  updateChallenge(id: string, challengeData: Partial<Challenge>): Challenge {
    const challenges = this.getChallenges()
    const challengeIndex = challenges.findIndex((challenge) => challenge.id === id)

    if (challengeIndex === -1) throw new Error("Challenge not found")

    const updatedChallenge = {
      ...challenges[challengeIndex],
      ...challengeData,
    }

    challenges[challengeIndex] = updatedChallenge
    this.setItem("challenges", challenges)

    return updatedChallenge
  }

  // Challenge progress methods
  getChallengeProgress(): ChallengeProgress[] {
    return this.getItem<ChallengeProgress[]>("challengeProgress", [])
  }

  getUserChallengeProgress(userId: string, challengeId: string): ChallengeProgress | undefined {
    const progress = this.getChallengeProgress()
    return progress.find((p) => p.userId === userId && p.challengeId === challengeId)
  }

  updateChallengeProgress(userId: string, challengeId: string, data: Partial<ChallengeProgress>): ChallengeProgress {
    const allProgress = this.getChallengeProgress()
    const progressIndex = allProgress.findIndex((p) => p.userId === userId && p.challengeId === challengeId)

    if (progressIndex === -1) {
      // Create new progress entry
      const newProgress: ChallengeProgress = {
        id: uuidv4(),
        userId,
        challengeId,
        progress: data.progress || 0,
        total: data.total || 0,
        completed: data.completed || 0,
        joinedAt: new Date(),
      }

      this.setItem("challengeProgress", [...allProgress, newProgress])
      return newProgress
    } else {
      // Update existing progress
      const updatedProgress = {
        ...allProgress[progressIndex],
        ...data,
      }

      allProgress[progressIndex] = updatedProgress
      this.setItem("challengeProgress", allProgress)

      return updatedProgress
    }
  }

  // Stats methods
  getUserStats(userId: string) {
    const workouts = this.getWorkouts().filter((w) => w.userId === userId)
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentWorkouts = workouts.filter((w) => new Date(w.date) >= thirtyDaysAgo)

    const totalCalories = recentWorkouts.reduce((sum, workout) => sum + (workout.calories || 0), 0)

    const workoutsByType = {
      strength: workouts.filter((w) => w.type === "strength").length,
      cardio: workouts.filter((w) => w.type === "cardio").length,
      flexibility: workouts.filter((w) => w.type === "flexibility").length,
    }

    const totalDistance = recentWorkouts
      .filter((w) => w.type === "cardio" && w.distance)
      .reduce((sum, workout) => sum + (workout.distance || 0), 0)

    // Calculate weekly activity
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const workoutsThisWeek = workouts.filter((w) => new Date(w.date) >= startOfWeek)
    const daysWorkedOutThisWeek = new Set(workoutsThisWeek.map((w) => new Date(w.date).toDateString())).size

    return {
      totalWorkouts: workouts.length,
      recentWorkouts: recentWorkouts.length,
      totalCalories,
      workoutsByType,
      totalDistance,
      weeklyActivity: {
        workouts: workoutsThisWeek.length,
        daysWorkedOut: daysWorkedOutThisWeek,
        progress: (daysWorkedOutThisWeek / 7) * 100,
      },
    }
  }

  // Initialize with sample data if empty
  initializeIfEmpty(): void {
    // Skip initialization on server
    if (isServer) return

    // Create user if it doesn't exist
    if (!this.getUser()) {
      // Create user
      const user: User = {
        id: uuidv4(),
        name: "User",
        email: "user@example.com",
        streak: 12,
        joinedAt: new Date(),
      }
      this.setUser(user)
    }

    // Always ensure challenges exist
    this.ensureChallengesExist()
  }

  // Improve the ensureChallengesExist method
  ensureChallengesExist(): void {
    if (isServer) return

    const challenges = this.getChallenges()

    // Create sample challenges if none exist or if the array is empty
    if (!challenges || challenges.length === 0) {
      console.log("Creating sample challenges...")

      const user = this.getUser()
      if (!user) {
        console.error("Cannot create challenges: No user found")
        return
      }

      // Create sample challenges
      const newChallenges: Challenge[] = [
        {
          id: uuidv4(),
          title: "Summer Shred Challenge",
          description: "Complete 20 workouts in 30 days and earn a badge.",
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: "active",
          reward: "Summer Shred Badge and 500 points",
          createdAt: new Date(),
          participants: 24,
          progress: 40,
          total: 20,
          completed: 8,
          isJoined: false,
        },
        {
          id: uuidv4(),
          title: "10K Steps Daily",
          description: "Walk 10,000 steps every day for 7 consecutive days.",
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: "active",
          reward: "Step Master Badge and 300 points",
          createdAt: new Date(),
          participants: 42,
          progress: 71,
          total: 7,
          completed: 5,
          isJoined: false,
        },
        {
          id: uuidv4(),
          title: "30-Day Yoga Journey",
          description: "Practice yoga for at least 15 minutes every day for 30 days.",
          startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
          status: "upcoming",
          reward: "Yoga Master Badge and 400 points",
          createdAt: new Date(),
          participants: 18,
          isJoined: false,
        },
      ]

      this.setItem("challenges", newChallenges)
      console.log("Sample challenges created:", newChallenges.length)
    } else {
      console.log("Challenges already exist:", challenges.length)
    }
  }
}

export const db = new LocalStorageDB()

