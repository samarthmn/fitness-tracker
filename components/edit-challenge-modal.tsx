"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ChallengeDetails {
  id: string
  title: string
  status: "active" | "upcoming" | "completed"
  startDate: string
  endDate: string
  description: string
  participants: number
  progress?: number
  total?: number
  completed?: number
  reward?: string
}

interface EditChallengeModalProps {
  challenge: ChallengeDetails | null
  isOpen: boolean
  onClose: () => void
  onSave: (challenge: ChallengeDetails) => void
}

export function EditChallengeModal({ challenge, isOpen, onClose, onSave }: EditChallengeModalProps) {
  const [formData, setFormData] = useState<ChallengeDetails | null>(null)
  const isMounted = useRef(true)

  useEffect(() => {
    // Set isMounted to true when the component mounts
    isMounted.current = true

    // Update formData when challenge changes
    if (challenge && isMounted.current) {
      setFormData(challenge)
    }

    // Cleanup function
    return () => {
      isMounted.current = false
    }
  }, [challenge])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return

    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    if (!formData) return

    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSave = () => {
    if (!formData) return

    onSave(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] mx-auto">
        <DialogHeader>
          <div className="pr-6">
            <DialogTitle>Edit Challenge</DialogTitle>
            <DialogDescription>Make changes to the challenge details below.</DialogDescription>
          </div>
        </DialogHeader>

        {formData && (
          <>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Challenge Name</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {formData.status === "active" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="completed">Completed</Label>
                    <Input
                      id="completed"
                      name="completed"
                      type="number"
                      value={formData.completed}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total">Total</Label>
                    <Input id="total" name="total" type="number" value={formData.total} onChange={handleInputChange} />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reward">Reward</Label>
                <Input
                  id="reward"
                  name="reward"
                  value={formData.reward || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., Badge, Points, etc."
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

