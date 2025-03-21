"use client"

import { Award, Calendar, Clock } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import type { Challenge } from "@/lib/definitions"

interface ViewChallengeModalProps {
  challenge: Challenge | null
  isOpen: boolean
  onClose: () => void
}

export function ViewChallengeModal({ challenge, isOpen, onClose }: ViewChallengeModalProps) {
  // Always render the Dialog component, but control its visibility with the open prop
  // This prevents the "multiple renderers" error by ensuring consistent context provider rendering

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
      case "upcoming":
        return <Badge variant="outline">Upcoming</Badge>
      case "completed":
        return <Badge variant="secondary">Completed</Badge>
      default:
        return null
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-[525px] mx-auto">
        {challenge && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <DialogTitle className="text-xl">{challenge.title}</DialogTitle>
                {getStatusBadge(challenge.status)}
              </div>
              <DialogDescription className="flex items-center pt-1">
                <Calendar className="mr-1 h-4 w-4" />
                {challenge.status === "upcoming"
                  ? `Starts on ${formatDate(challenge.startDate)}`
                  : challenge.status === "active"
                    ? `Ends on ${formatDate(challenge.endDate)}`
                    : `Completed on ${formatDate(challenge.endDate)}`}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                {challenge.status === "completed" && (
                  <div className="flex items-center text-sm">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>Completed</span>
                  </div>
                )}
              </div>

              <p className="text-sm">{challenge.description}</p>

              {"progress" in challenge && challenge.status === "active" && (
                <div className="space-y-2">
                  <Progress value={challenge.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {challenge.completed}/{challenge.total} {challenge.total === 1 ? "task" : "tasks"} completed
                  </p>
                </div>
              )}

              {challenge.status === "completed" && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <Award className="h-8 w-8 text-yellow-500" />
                  <span className="text-sm font-medium">Challenge Completed!</span>
                </div>
              )}

              {challenge.reward && (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-1 font-medium">Reward</h3>
                    <p className="text-sm">{challenge.reward}</p>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

