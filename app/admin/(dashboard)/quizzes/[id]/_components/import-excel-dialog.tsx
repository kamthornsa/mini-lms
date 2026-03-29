"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download, X } from "lucide-react";
import { importQuestionsFromJson } from "../../actions";
import * as XLSX from "xlsx";

type ParsedRow = {
  question: string;
  points: number;
  choices: string[];
  correct: number;
};

function generateTemplate() {
  const ws_data = [
    [
      "question",
      "points",
      "choice_1",
      "choice_2",
      "choice_3",
      "choice_4",
      "correct",
    ],
    ["2 + 2 = ?", 1, "3", "4", "5", "6", 2],
    ["เมืองหลวงของไทยคือ?", 1, "เชียงใหม่", "กรุงเทพฯ", "ขอนแก่น", "ภูเก็ต", 2],
  ];
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  ws["!cols"] = [
    { wch: 40 },
    { wch: 8 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 8 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Questions");
  XLSX.writeFile(wb, "quiz_template.xlsx");
}

export function ImportExcelDialog({ quizId }: { quizId: number }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setPreview([]);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
        const parsed: ParsedRow[] = [];

        for (const row of rows) {
          const question = String(row["question"] ?? "").trim();
          if (!question) continue;
          const choices: string[] = [];
          let ci = 1;
          while (row[`choice_${ci}`] !== undefined) {
            const t = String(row[`choice_${ci}`]).trim();
            if (t) choices.push(t);
            ci++;
          }
          if (choices.length < 2) {
            setError(`แถวที่มีคำถาม "${question}" มีตัวเลือกน้อยกว่า 2 ข้อ`);
            return;
          }
          const correctRaw = row["correct"];
          const correct =
            typeof correctRaw === "number"
              ? correctRaw - 1
              : parseInt(String(correctRaw)) - 1;
          if (correct < 0 || correct >= choices.length) {
            setError(
              `แถว "${question}": ค่า correct (${row["correct"]}) ไม่ถูกต้อง`,
            );
            return;
          }
          parsed.push({
            question,
            points: parseInt(String(row["points"])) || 1,
            choices,
            correct,
          });
        }

        if (parsed.length === 0) {
          setError("ไม่พบข้อมูลคำถามในไฟล์");
          return;
        }
        setPreview(parsed);
      } catch {
        setError("ไม่สามารถอ่านไฟล์ได้ กรุณาใช้ไฟล์ .xlsx ตาม template");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    setImporting(true);
    await importQuestionsFromJson(quizId, preview);
    setImporting(false);
    setOpen(false);
    reset();
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Upload size={14} className="mr-1.5" /> Import Excel
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col m-4">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold">Import คำถามจาก Excel</h2>
          <button
            onClick={() => {
              setOpen(false);
              reset();
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={generateTemplate}>
              <Download size={14} className="mr-1.5" /> ดาวน์โหลด Template
            </Button>
            <span className="text-xs text-muted-foreground">
              จากนั้นกรอกข้อมูลแล้วอัปโหลด
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">เลือกไฟล์ .xlsx</label>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFile}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:text-sm file:bg-muted file:text-foreground hover:file:bg-muted/70 cursor-pointer"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {preview.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-600">
                พบ {preview.length} คำถาม — ตัวอย่าง:
              </p>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {preview.slice(0, 5).map((row, i) => (
                  <div
                    key={i}
                    className="border rounded-md p-3 text-sm bg-muted/20"
                  >
                    <p className="font-medium">
                      {i + 1}. {row.question}{" "}
                      <span className="text-muted-foreground font-normal">
                        ({row.points} คะแนน)
                      </span>
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {row.choices.map((c, ci) => (
                        <li
                          key={ci}
                          className={
                            ci === row.correct
                              ? "text-green-600 font-medium"
                              : "text-muted-foreground"
                          }
                        >
                          {ci === row.correct ? "✓" : "○"} {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {preview.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    ... และอีก {preview.length - 5} คำถาม
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setOpen(false);
              reset();
            }}
          >
            ยกเลิก
          </Button>
          <Button
            size="sm"
            disabled={preview.length === 0 || importing}
            onClick={handleImport}
          >
            {importing ? "กำลัง import..." : `Import ${preview.length} คำถาม`}
          </Button>
        </div>
      </div>
    </div>
  );
}
