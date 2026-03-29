"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createStudent } from "../actions";
import { UserPlus } from "lucide-react";

type Section = { id: number; name: string };

export function CreateStudentDialog({ sections }: { sections: Section[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      try {
        await createStudent(formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus size={16} className="mr-2" />
          เพิ่มนักศึกษา
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เพิ่มนักศึกษา</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">รหัสนักศึกษา *</label>
            <Input name="student_id" placeholder="เช่น 6601234567" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">ชื่อ-นามสกุล *</label>
            <Input
              name="full_name"
              placeholder="เช่น สมศักดิ์ มั่นใจ"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">กลุ่ม (Section)</label>
            <select
              name="sectionId"
              className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">— ไม่ระบุกลุ่ม —</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "กำลังเพิ่ม..." : "เพิ่ม"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
