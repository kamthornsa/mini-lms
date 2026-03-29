"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Download } from "lucide-react";

type Course = { id: number; title: string };
type Quiz = { id: number; title: string };

export function QuizAttemptsFilter({
  courses,
  quizzes,
  total,
}: {
  courses: Course[];
  quizzes: Quiz[];
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const courseId = searchParams.get("courseId") ?? "";
  const quizId = searchParams.get("quizId") ?? "";
  const q = searchParams.get("q") ?? "";

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (key === "courseId") params.delete("quizId");
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const clearAll = () => router.push(`${pathname}?tab=quizzes`);

  const hasFilter = courseId || quizId || q;

  const exportUrl = (() => {
    const params = new URLSearchParams();
    if (courseId) params.set("courseId", courseId);
    if (quizId) params.set("quizId", quizId);
    if (q) params.set("q", q);
    const qs = params.toString();
    return `/api/admin/export/quiz-attempts${qs ? `?${qs}` : ""}`;
  })();

  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Course filter */}
        <select
          value={courseId}
          onChange={(e) => update("courseId", e.target.value)}
          className="h-9 rounded-md border bg-background px-3 text-sm min-w-[180px] focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">ทุกวิชา</option>
          {courses.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.title}
            </option>
          ))}
        </select>

        {/* Quiz filter */}
        <select
          value={quizId}
          onChange={(e) => update("quizId", e.target.value)}
          disabled={quizzes.length === 0}
          className="h-9 rounded-md border bg-background px-3 text-sm min-w-[180px] focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        >
          <option value="">ทุก Quiz</option>
          {quizzes.map((quiz) => (
            <option key={quiz.id} value={String(quiz.id)}>
              {quiz.title}
            </option>
          ))}
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="ค้นหาชื่อ / รหัสนักศึกษา"
            className="pl-8 h-9"
            value={q}
            onChange={(e) => update("q", e.target.value)}
          />
        </div>

        {/* Clear */}
        {hasFilter && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
            ล้างตัวกรอง
          </button>
        )}

        {/* Export Excel */}
        <a
          href={exportUrl}
          download
          className="ml-auto flex items-center gap-1.5 text-sm font-medium px-3 py-2 h-9 rounded-md border bg-background hover:bg-muted/60 transition-colors whitespace-nowrap"
        >
          <Download size={14} />
          Export Excel
        </a>
      </div>
      {(hasFilter || total > 0) && (
        <p className="text-xs text-muted-foreground">แสดง {total} รายการ</p>
      )}
    </div>
  );
}
