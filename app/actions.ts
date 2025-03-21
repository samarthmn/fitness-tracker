import { db } from "@/lib/db"

export async function getWorkouts() {
  try {
    if (typeof window === "undefined") {
      return { workouts: [], error: null }
    }

    const workouts = db.getWorkouts()
    return { workouts, error: null }
  } catch (error) {
    return { workouts: [], error: "Failed to fetch workouts" }
  }
}

export async function getWorkoutById(id: string) {
  try {
    if (typeof window === "undefined") {
      return { workout: null, exercises: [], error: null }
    }

    const workout = db.getWorkoutById(id)
    const exercises = db.getExercisesByWorkoutId(id)

    return { workout, exercises, error: null }
  } catch (error) {
    return { workout: null, exercises: [], error: "Failed to fetch workout" }
  }
}

// Add the missing getChallenges function
export async function getChallenges() {
  try {
    // For server-side rendering, we'll return an empty array
    // The actual data will be fetched client-side
    if (typeof window === "undefined") {
      return { challenges: [], error: null }
    }

    const user = db.getUser()
    if (!user) {
      console.error("No user found when fetching challenges")
      return { challenges: [], error: "User not found" }
    }

    // Ensure challenges exist
    db.ensureChallengesExist()

    const challenges = db.getChallenges()

    // Debug log
    console.log("Fetched challenges:", challenges)

    if (!challenges || challenges.length === 0) {
      console.warn("No challenges found in database")
      return { challenges: [], error: "No challenges found" }
    }

    // For challenges that don't have progress data already embedded,
    // get it from the challenge progress
    const challengesWithProgress = challenges.map((challenge) => {
      // Debug log for each challenge
      console.log(`Processing challenge: ${challenge.id} - ${challenge.title}`)

      if ("progress" in challenge && challenge.progress !== undefined) {
        // Even if progress exists, make sure isJoined is set
        const progress = db.getUserChallengeProgress(user.id, challenge.id)
        return {
          ...challenge,
          isJoined: !!progress, // Make sure isJoined is set based on progress existence
        }
      }

      const progress = db.getUserChallengeProgress(user.id, challenge.id)
      return {
        ...challenge,
        progress: progress?.progress || 0,
        total: progress?.total || 0,
        completed: progress?.completed || 0,
        participants: challenge.participants || 12, // Default if not set
        isJoined: !!progress, // Add a flag to indicate if the user has joined this challenge
      }
    })

    console.log("Returning challenges with progress:", challengesWithProgress.length)
    return { challenges: challengesWithProgress, error: null }
  } catch (error) {
    console.error("Error fetching challenges:", error)
    return {
      challenges: [],
      error: "Failed to fetch challenges: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}

export async function getUserStats() {
  try {
    if (typeof window === "undefined") {
      return { stats: null, error: null }
    }

    const user = db.getUser()
    if (!user) {
      return { stats: null, error: "User not found" }
    }

    const stats = db.getUserStats(user.id)
    return { stats, error: null }
  } catch (error) {
    return { stats: null, error: "Failed to fetch user stats" }
  }
}

export async function getJoinedChallenges() {
  try {
    if (typeof window === "undefined") {
      return { challenges: [], error: null }
    }

    const user = db.getUser()
    if (!user) {
      return { challenges: [], error: "User not found" }
    }

    const challenges = db.getChallenges().filter((challenge) => {
      const progress = db.getUserChallengeProgress(user.id, challenge.id)
      return progress !== undefined
    })

    return { challenges, error: null }
  } catch (error) {
    return { challenges: [], error: "Failed to fetch joined challenges" }
  }
}

export async function deleteWorkout(id: string) {
  try {
    if (typeof window === "undefined") {
      return { success: false, error: null }
    }

    db.deleteWorkout(id)
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: "Failed to delete workout" }
  }
}

export async function updateWorkout(id: string, workoutData: any) {
  try {
    if (typeof window === "undefined") {
      return { workout: null, error: null }
    }

    const workout = db.updateWorkout(id, workoutData)
    return { workout, error: null }
  } catch (error) {
    return { workout: null, error: "Failed to update workout" }
  }
}

export async function joinChallenge(challengeId: string) {
  try {
    if (typeof window === "undefined") {
      return { success: false, error: null }
    }

    const user = db.getUser()
    if (!user) {
      return { success: false, error: "User not found" }
    }

    const challenge = db.getChallengeById(challengeId)
    if (!challenge) {
      return { success: false, error: "Challenge not found" }
    }

    // Check if already joined
    const existingProgress = db.getUserChallengeProgress(user.id, challengeId)
    if (existingProgress) {
      return { success: false, error: "You've already joined this challenge" }
    }

    // Join the challenge
    db.updateChallengeProgress(user.id, challengeId, {
      total: challenge.total || 20, // Use challenge total if available, otherwise default to 20
      progress: 0,
      completed: 0,
    })

    // Debug log
    console.log("Joined challenge:", challengeId)

    // Update challenge participants count
    const updatedChallenge = {
      ...challenge,
      participants: (challenge.participants || 0) + 1,
    }
    db.updateChallenge(challengeId, updatedChallenge)

    return { success: true, error: null }
  } catch (error) {
    console.error("Error joining challenge:", error)
    return { success: false, error: "Failed to join challenge" }
  }
}

export async function initializeApp() {
  try {
    if (typeof window === "undefined") {
      return { success: false, error: null }
    }

    db.initializeIfEmpty()
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: "Failed to initialize app" }
  }
}

export async function createWorkout(workoutData: any) {
  try {
    if (typeof window === "undefined") {
      return { workout: null, error: null }
    }

    const workout = db.addWorkout(workoutData)
    return { workout, error: null }
  } catch (error) {
    return { workout: null, error: "Failed to create workout" }
  }
}

export async function addExerciseToWorkout(workoutId: string, exerciseData: any) {
  try {
    if (typeof window === "undefined") {
      return { exercise: null, error: null }
    }

    const exercise = db.addExercise(workoutId, exerciseData)
    return { exercise, error: null }
  } catch (error) {
    return { exercise: null, error: "Failed to add exercise to workout" }
  }
}

