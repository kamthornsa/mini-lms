"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { deleteLesson } from "../actions"
import { Trash2 } from "lucide-react"

export function DeleteLessonButton({
  lessonId,
  courseId,
}: {
  lessonId: number
  courseId: number
}) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm("ลบ lesson นี้? การกระทำนี้ไม่สามารถย้อนกลับได้")) return
    startTransition(() => deleteLesson(lessonId, courseId))
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 size={14} />
    </Button>
  )
}
