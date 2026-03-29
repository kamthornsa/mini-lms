"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { deleteStudent } from "../actions"
import { Trash2 } from "lucide-react"

export function DeleteStudentButton({ studentId }: { studentId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm("ลบนักศึกษาคนนี้? submissions ทั้งหมดจะถูกลบด้วย")) return
    startTransition(() => deleteStudent(studentId))
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
