"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { toggleCourseInSection, toggleStudentInSection } from "../../actions"

export function ToggleCourseButton({
  sectionId,
  courseId,
  assigned,
  courseTitle,
}: {
  sectionId: number
  courseId: number
  assigned: boolean
  courseTitle: string
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm">{courseTitle}</span>
      <Button
        variant={assigned ? "secondary" : "outline"}
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(() => toggleCourseInSection(sectionId, courseId, assigned))
        }
      >
        {assigned ? "ถอด" : "เพิ่ม"}
      </Button>
    </div>
  )
}

export function ToggleStudentButton({
  sectionId,
  studentId,
  assigned,
  studentName,
  studentCode,
}: {
  sectionId: number
  studentId: string
  assigned: boolean
  studentName: string
  studentCode: string
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div>
        <span className="text-sm font-medium">{studentName}</span>
        <span className="text-xs text-muted-foreground ml-2">{studentCode}</span>
      </div>
      <Button
        variant={assigned ? "secondary" : "outline"}
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(() => toggleStudentInSection(sectionId, studentId, assigned))
        }
      >
        {assigned ? "ถอด" : "เพิ่ม"}
      </Button>
    </div>
  )
}
