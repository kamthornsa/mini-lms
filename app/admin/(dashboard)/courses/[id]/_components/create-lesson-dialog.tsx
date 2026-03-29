"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createLesson } from "../actions"
import { Plus } from "lucide-react"

export function CreateLessonDialog({ courseId }: { courseId: number }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createLesson(courseId, formData)
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus size={14} className="mr-1.5" />
          New Lesson
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>สร้าง Lesson ใหม่</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">ชื่อ Lesson *</label>
              <Input name="title" placeholder="เช่น Introduction to HTML" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">ลำดับ</label>
              <Input name="order_index" type="number" defaultValue="1" min="0" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">YouTube ID</label>
            <Input name="youtube_id" placeholder="เช่น dQw4w9WgXcQ (ไม่บังคับ)" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">เนื้อหา (Markdown) *</label>
            <textarea
              name="content"
              className="w-full min-h-[200px] px-3 py-2 text-sm border rounded-md bg-background resize-y font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={"# Lesson Title\n\nเนื้อหาบทเรียน..."}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "กำลังสร้าง..." : "สร้าง"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
