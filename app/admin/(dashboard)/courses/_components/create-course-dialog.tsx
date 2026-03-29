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
import { createCourse } from "../actions"
import { Plus } from "lucide-react"

export function CreateCourseDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createCourse(formData)
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} className="mr-2" />
          New Course
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>สร้าง Course ใหม่</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">ชื่อ Course *</label>
            <Input name="title" placeholder="เช่น Web Development Fundamentals" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Slug</label>
            <Input name="slug" placeholder="เช่น web-dev-fundamentals (ไม่กรอกก็ได้)" />
            <p className="text-xs text-muted-foreground">ถ้าไม่กรอก จะ generate จากชื่ออัตโนมัติ</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">คำอธิบาย</label>
            <Input name="description" placeholder="คำอธิบายสั้นๆ" />
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
