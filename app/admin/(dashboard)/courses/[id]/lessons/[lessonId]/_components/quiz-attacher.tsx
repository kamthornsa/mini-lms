"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Unlink } from "lucide-react";
import { attachQuiz, detachQuiz } from "../actions";

type AttachedQuiz = {
  id: number;
  quizId: number;
  quiz: { title: string; _count: { questions: number } };
};
type AvailableQuiz = {
  id: number;
  title: string;
  _count: { questions: number };
};

export function QuizAttacher({
  lessonId,
  courseId,
  attached,
  available,
}: {
  lessonId: number;
  courseId: number;
  attached: AttachedQuiz[];
  available: AvailableQuiz[];
}) {
  const [selectedId, setSelectedId] = useState("");

  const handleAttach = async () => {
    if (!selectedId) return;
    await attachQuiz(lessonId, courseId, parseInt(selectedId));
    setSelectedId("");
  };

  return (
    <div className="space-y-3">
      {/* Attached quizzes */}
      {attached.length === 0 ? (
        <p className="text-sm text-muted-foreground">ยังไม่มี Quiz ที่แนบไว้</p>
      ) : (
        <ul className="space-y-2">
          {attached.map((lq) => {
            const detach = detachQuiz.bind(null, lq.id, lessonId, courseId);
            return (
              <li
                key={lq.id}
                className="flex items-center justify-between border rounded-md px-3 py-2 bg-muted/20 text-sm"
              >
                <div>
                  <span className="font-medium">{lq.quiz.title}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {lq.quiz._count.questions} คำถาม
                  </span>
                </div>
                <form action={detach}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive h-7"
                  >
                    <Unlink size={13} className="mr-1" /> ถอด
                  </Button>
                </form>
              </li>
            );
          })}
        </ul>
      )}

      {/* Attach new */}
      {available.length > 0 && (
        <div className="flex gap-2 items-center">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="flex-1 h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">เลือก Quiz ที่จะแนบ...</option>
            {available.map((q) => (
              <option key={q.id} value={String(q.id)}>
                {q.title} ({q._count.questions} คำถาม)
              </option>
            ))}
          </select>
          <Button size="sm" disabled={!selectedId} onClick={handleAttach}>
            <Link2 size={14} className="mr-1" /> แนบ
          </Button>
        </div>
      )}

      {available.length === 0 && attached.length === 0 && (
        <p className="text-xs text-muted-foreground">
          ยังไม่มี Quiz — ไปสร้างได้ที่{" "}
          <a href="/admin/quizzes" className="underline">
            หน้า Quizzes
          </a>
        </p>
      )}
    </div>
  );
}
