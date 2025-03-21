"use client"

import { Award, Calendar, Medal, Trophy, User } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Participant {
  name: string
  rank: number
  score: number
  completedDate?: string
}

interface ChallengeResults {
  id: string
  title: string
  endDate: string
  description: string
  participants: Participant[]
  yourRank?: number
  yourScore?: number
  yourCompletedDate?: string
}

interface ViewResultsModalProps {
  results: ChallengeResults | null
  isOpen: boolean
  onClose: () => void
}

export function ViewResultsModal({ results, isOpen, onClose }: ViewResultsModalProps) {
  if (!results) return null

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />
      case 3:
        return <Medal className="h-4 w-4 text-amber-700" />
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] mx-auto">
        <DialogHeader>
          <div className="pr-6">
            <DialogTitle className="text-xl">Challenge Results: {results.title}</DialogTitle>
            <DialogDescription className="flex items-center pt-1">
              <Calendar className="mr-1 h-4 w-4" />
              Completed on {results.endDate}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {results.yourRank && (
            <div className="rounded-md bg-muted p-4">
              <h3 className="mb-2 font-medium">Your Results</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-sm text-muted-foreground">Rank</span>
                  <div className="flex items-center gap-1 mt-1">
                    {getRankIcon(results.yourRank)}
                    <span className="text-lg font-bold">{results.yourRank}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm text-muted-foreground">Score</span>
                  <span className="text-lg font-bold">{results.yourScore}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="text-lg font-bold">{results.yourCompletedDate}</span>
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div>
            <h3 className="mb-2 font-medium">Leaderboard</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.participants.map((participant, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1">
                        {getRankIcon(participant.rank)}
                        <span>{participant.rank}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {participant.name}
                        {results.yourRank && participant.rank === results.yourRank && (
                          <span className="text-xs text-muted-foreground">(You)</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{participant.score}</TableCell>
                    <TableCell className="text-right">{participant.completedDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div>
            <h3 className="mb-1 font-medium">Achievement</h3>
            <div className="flex items-center gap-2 mt-2">
              <Award className="h-6 w-6 text-yellow-500" />
              <span>Challenge Completed Badge</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

