"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

type Course = { id: number; title: string };
type Assignment = { id: number; title: string; lessonId: number };

export function SubmissionsFilter({
  courses,
  assignments,
  total,
}: {
  courses: Course[];
  assignments: Assignment[];
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const courseId = searchParams.get("courseId") ?? "";
  const assignmentId = searchParams.get("assignmentId") ?? "";
  const q = searchParams.get("q") ?? "";

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset dependent filters
      if (key === "courseId") params.delete("assignmentId");
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const clearAll = () => router.push(pathname);

  const hasFilter = courseId || assignmentId || q;

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

        {/* Assignment filter */}
        <select
          value={assignmentId}
          onChange={(e) => update("assignmentId", e.target.value)}
          disabled={assignments.length === 0}
          className="h-9 rounded-md border bg-background px-3 text-sm min-w-[180px] focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        >
          <option value="">ทุก Assignment</option>
          {assignments.map((a) => (
            <option key={a.id} value={String(a.id)}>
              {a.title}
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
      </div>

      <p className="text-sm text-muted-foreground">
        แสดง <span className="font-medium text-foreground">{total}</span> รายการ
      </p>
    </div>
  );
}
