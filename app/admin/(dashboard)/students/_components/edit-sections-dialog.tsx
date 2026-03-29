"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateStudentSections } from "../actions";
import { Pencil } from "lucide-react";

type Section = { id: number; name: string };

type Props = {
  studentId: string;
  studentName: string;
  currentSectionIds: number[];
  sections: Section[];
};

export function EditSectionsDialog({
  studentId,
  studentName,
  currentSectionIds,
  sections,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(
    new Set(currentSectionIds),
  );
  const [isPending, startTransition] = useTransition();

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSave() {
    startTransition(async () => {
      await updateStudentSections(studentId, Array.from(selected));
      setOpen(false);
    });
  }

  function handleOpenChange(v: boolean) {
    if (v) setSelected(new Set(currentSectionIds));
    setOpen(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-7 px-2">
          <Pencil size={13} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>แก้ไขกลุ่ม — {studentName}</DialogTitle>
        </DialogHeader>

        {sections.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            ยังไม่มีกลุ่ม (Section) ในระบบ
          </p>
        ) : (
          <div className="space-y-2 py-1">
            {sections.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={selected.has(s.id)}
                  onChange={() => toggle(s.id)}
                />
                <span className="text-sm">{s.name}</span>
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
