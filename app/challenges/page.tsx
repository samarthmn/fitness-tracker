"use client"

import { useEffect, useState, useRef } from "react"
import { Award, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { ViewChallengeModal } from "@/components/view-challenge-modal"
import { getChallenges } from "@/app/actions"
import type { Challenge } from "@/lib/definitions"
// Add this at the top of the file, after the imports
import { initializeApp } from "@/app/actions"

export default function ChallengesPage() {
  const { toast } = useToast()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [viewChallenge, setViewChallenge] = useState<Challenge | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Use a ref to track if data has been fetched
  const dataFetchedRef = useRef(false)

  // Set isMounted to true on client-side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fix the issue with state updates after unmounting
  // Update the useEffect to include proper cleanup

  // Replace the existing useEffect with this improved version
  useEffect(() => {
    if (!isMounted || dataFetchedRef.current) return

    let isActive = true

    const fetchChallenges = async () => {
      try {
        setLoading(true)
        console.log("Fetching challenges...")
        const { challenges: fetchedChallenges, error } = await getChallenges()

        console.log("Challenges response:", fetchedChallenges)

        if (!isActive) return

        if (error) {
          toast({
            title: "Error",
            description: error,
            variant: "destructive",
          })
        } else if (fetchedChallenges && fetchedChallenges.length > 0) {
          setChallenges(fetchedChallenges)
        } else {
          console.warn("No challenges returned from API")
        }
      } catch (err) {
        if (isActive) {
          console.error("Error in fetchChallenges:", err)
        }
      } finally {
        if (isActive) {
          setLoading(false)
          dataFetchedRef.current = true
        }
      }
    }

    fetchChallenges()

    // Cleanup function
    return () => {
      isActive = false
    }
  }, [toast, isMounted])

  // Add this function inside the ChallengesPage component
  const handleInitialize = async () => {
    try {
      setLoading(true)
      await initializeApp()
      // Reset the data fetched flag to force a refresh
      dataFetchedRef.current = false
      // Fetch challenges again
      const { challenges: refreshedChallenges } = await getChallenges()
      if (refreshedChallenges) {
        setChallenges(refreshedChallenges)
      }
      setLoading(false)
    } catch (err) {
      console.error("Error initializing app:", err)
      setLoading(false)
    }
  }

  const handleViewChallenge = (challenge: Challenge) => {
    setViewChallenge(challenge)
    setIsViewModalOpen(true)
  }

  const getChallengesByStatus = (status: string) => {
    if (status === "all") return challenges
    return challenges.filter((challenge) => challenge.status === status)
  }

  // During server-side rendering or before mounting, return a loading skeleton
  if (!isMounted) {
    return <ChallengesSkeleton />
  }

  if (loading) {
    return <ChallengesSkeleton />
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Challenges</h1>
        <p className="text-muted-foreground">Join challenges to stay motivated and earn rewards</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Challenges</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        {["all", "active", "upcoming", "completed"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="mt-4">
            {getChallengesByStatus(tabValue).length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getChallengesByStatus(tabValue).map((challenge) => (
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
                          <Award className="h-6 w-6 text-yellow-500" />
                          <span className="text-sm font-medium">Challenge Completed!</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={() => handleViewChallenge(challenge)}>
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              // Update the "No challenges found" section
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No challenges found</h3>
                <p className="text-muted-foreground mt-1">Check back later for new challenges</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {viewChallenge && isViewModalOpen && (
        <ViewChallengeModal
          challenge={viewChallenge}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setTimeout(() => setViewChallenge(null), 100)
          }}
        />
      )}
    </div>
  )
}

function ChallengesSkeleton() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-4 w-60" />
      </div>

      <Skeleton className="h-10 w-full max-w-md" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-6 w-40 mt-2" />
              <Skeleton className="h-4 w-32 mt-1" />
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
  )
}

