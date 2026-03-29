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
import { importStudentsFromCSV } from "../actions";
import { Upload } from "lucide-react";

type Section = { id: number; name: string };

export function ImportCsvDialog({ sections }: { sections: Section[] }) {
  const [open, setOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    created: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  function handleImport() {
    if (!csvText.trim()) return;
    startTransition(async () => {
      const res = await importStudentsFromCSV(
        csvText,
        sectionId ? parseInt(sectionId) : undefined,
      );
      setResult(res);
      if (res.errors.length === 0) setCsvText("");
    });
  }

  function handleClose() {
    setOpen(false);
    setResult(null);
    setCsvText("");
    setSectionId("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => (v ? setOpen(true) : handleClose())}
    >
      <DialogTrigger asChild>
        <Button>
          <Upload size={16} className="mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import นักศึกษาจาก CSV</DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="space-y-3">
            <div className="p-4 bg-muted rounded-md text-sm space-y-1">
              <p className="text-green-600 font-medium">
                เพิ่มสำเร็จ {result.created} คน
              </p>
              {result.skipped > 0 && (
                <p className="text-muted-foreground">
                  ข้าม {result.skipped} คน (มีอยู่แล้ว)
                </p>
              )}
              {result.errors.length > 0 && (
                <div>
                  <p className="text-red-500 font-medium">
                    ข้อผิดพลาด {result.errors.length} รายการ:
                  </p>
                  <ul className="list-disc list-inside text-xs text-red-500 mt-1">
                    {result.errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={handleClose}>ปิด</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-md text-xs text-muted-foreground">
              <p className="font-medium mb-1">รูปแบบ CSV:</p>
              <pre className="font-mono">{`student_id,full_name\n6601234567,สมศักดิ์ มั่นใจ`}</pre>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                กลุ่ม (Section) — ใส่นักศึกษาทั้งหมดเข้ากลุ่มนี้
              </label>
              <select
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
              >
                <option value="">— ไม่ระบุกลุ่ม —</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">วางข้อมูล CSV</label>
              <textarea
                className="w-full min-h-[160px] px-3 py-2 text-sm border rounded-md bg-background resize-y font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="student_id,full_name"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={handleClose}>
                ยกเลิก
              </Button>
              <Button
                onClick={handleImport}
                disabled={isPending || !csvText.trim()}
              >
                {isPending ? "กำลัง import..." : "Import"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
