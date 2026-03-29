"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { logoutStudent } from "../actions";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  LogOut,
  ClipboardList,
  FileQuestion,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

type Assignment = {
  id: number;
  title: string;
  lessonId: number;
  lessonTitle: string;
};
type Quiz = {
  lessonQuizId: number;
  quizTitle: string;
  lessonId: number;
  lessonTitle: string;
};
type Lesson = {
  id: number;
  title: string;
  order_index: number;
  assignments: { id: number; title: string }[];
  lessonQuizzes: { id: number; quiz: { id: number; title: string } }[];
};
type Session = { studentId: string; studentName: string; courseSlug: string };

function SidebarInner({
  slug,
  courseTitle,
  lessons,
  assignments,
  quizzes,
  session,
  collapsed,
  onClose,
}: {
  slug: string;
  courseTitle: string;
  lessons: Lesson[];
  assignments: Assignment[];
  quizzes: Quiz[];
  session: Session;
  collapsed: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");
  const boundLogout = logoutStudent.bind(null, slug);

  useEffect(() => {
    setActiveHash(window.location.hash);
    const onHashChange = () => setActiveHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={cn(
          "flex items-center border-b h-14 px-4 shrink-0 gap-2",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {!collapsed && (
          <div className="min-w-0">
            <Link
              href="/courses"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-0.5"
            >
              ← วิชาเรียนทั้งหมด
            </Link>
            <div className="flex items-start gap-1.5">
              <BookOpen
                size={13}
                className="mt-0.5 shrink-0 text-muted-foreground"
              />
              <span className="font-semibold text-sm leading-snug line-clamp-2">
                {courseTitle}
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <Link href="/courses" title="วิชาเรียนทั้งหมด">
            <BookOpen
              size={16}
              className="text-muted-foreground hover:text-foreground transition-colors"
            />
          </Link>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto">
        {/* Lessons */}
        <nav className="px-3 py-4">
          {!collapsed && (
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-2">
              บทเรียน
            </p>
          )}
          <ul className="space-y-0.5">
            {lessons.map((lesson) => {
              const href = `/courses/${slug}/lessons/${lesson.id}`;
              const isActive = pathname === href && !activeHash;
              return (
                <li key={lesson.id}>
                  <Link
                    href={href}
                    onClick={() => { setActiveHash(""); onClose?.(); }}
                    title={
                      collapsed
                        ? `${lesson.order_index}. ${lesson.title}`
                        : undefined
                    }
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                      collapsed && "justify-center px-2",
                      isActive
                        ? "bg-primary/10 text-primary font-medium border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0 text-xs font-mono w-5 text-center",
                        isActive ? "text-primary" : "opacity-50",
                      )}
                    >
                      {lesson.order_index}
                    </span>
                    {!collapsed && (
                      <span className="leading-snug line-clamp-2">
                        {lesson.title}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Assignments */}
        {assignments.length > 0 && (
          <nav className="px-3 pb-4">
            <div className="border-t mb-3" />
            {!collapsed && (
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-2 flex items-center gap-1.5">
                <ClipboardList size={11} />
                แบบฝึกหัด
              </p>
            )}
            {collapsed && (
              <div className="flex justify-center mb-2" title="แบบฝึกหัด">
                <ClipboardList size={14} className="text-muted-foreground" />
              </div>
            )}
            <ul className="space-y-0.5">
              {assignments.map((a) => {
                const href = `/courses/${slug}/lessons/${a.lessonId}#assignment-${a.id}`;
                const hash = `#assignment-${a.id}`;
                const isActive = pathname === `/courses/${slug}/lessons/${a.lessonId}` && activeHash === hash;
                return (
                  <li key={a.id}>
                    <a
                      href={href}
                      onClick={() => { setActiveHash(hash); onClose?.(); }}
                      title={collapsed ? a.title : undefined}
                      className={cn(
                        "flex items-start gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                        collapsed && "justify-center px-2",
                        isActive
                          ? "bg-primary/10 text-primary font-medium border border-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                      )}
                    >
                      <span className="shrink-0 mt-0.5 text-xs">📋</span>
                      {!collapsed && (
                        <span className="leading-snug line-clamp-2">
                          {a.title}
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {/* Quizzes */}
        {quizzes.length > 0 && (
          <nav className="px-3 pb-4">
            <div className="border-t mb-3" />
            {!collapsed && (
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-2 flex items-center gap-1.5">
                <FileQuestion size={11} />
                แบบทดสอบ
              </p>
            )}
            {collapsed && (
              <div className="flex justify-center mb-2" title="แบบทดสอบ">
                <FileQuestion size={14} className="text-muted-foreground" />
              </div>
            )}
            <ul className="space-y-0.5">
              {quizzes.map((q) => {
                const href = `/courses/${slug}/lessons/${q.lessonId}#quiz-${q.lessonQuizId}`;
                const hash = `#quiz-${q.lessonQuizId}`;
                const isActive = pathname === `/courses/${slug}/lessons/${q.lessonId}` && activeHash === hash;
                return (
                  <li key={q.lessonQuizId}>
                    <a
                      href={href}
                      onClick={() => { setActiveHash(hash); onClose?.(); }}
                      title={collapsed ? q.quizTitle : undefined}
                      className={cn(
                        "flex items-start gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                        collapsed && "justify-center px-2",
                        isActive
                          ? "bg-primary/10 text-primary font-medium border border-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                      )}
                    >
                      <span className="shrink-0 mt-0.5 text-xs">🧠</span>
                      {!collapsed && (
                        <span className="leading-snug line-clamp-2">
                          {q.quizTitle}
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>

      {/* Footer */}
      <div
        className={cn(
          "px-4 py-3 border-t bg-muted/30 shrink-0",
          collapsed && "px-2",
        )}
      >
        {!collapsed && (
          <>
            <p className="text-xs font-medium text-foreground truncate">
              {session.studentName}
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              {session.studentId}
            </p>
          </>
        )}
        <form action={boundLogout}>
          <button
            type="submit"
            title={collapsed ? "ออกจากระบบ" : undefined}
            className={cn(
              "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors",
              collapsed && "justify-center w-full",
            )}
          >
            <LogOut size={12} />
            {!collapsed && "ออกจากระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function CourseSidebar({
  slug,
  courseTitle,
  lessons,
  session,
}: {
  slug: string;
  courseTitle: string;
  lessons: Lesson[];
  session: Session;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const assignments: Assignment[] = lessons.flatMap((l) =>
    l.assignments.map((a) => ({ ...a, lessonId: l.id, lessonTitle: l.title })),
  );

  const quizzes: Quiz[] = lessons.flatMap((l) =>
    l.lessonQuizzes.map((lq) => ({
      lessonQuizId: lq.id,
      quizTitle: lq.quiz.title,
      lessonId: l.id,
      lessonTitle: l.title,
    })),
  );

  const innerProps = {
    slug,
    courseTitle,
    lessons,
    assignments,
    quizzes,
    session,
  };

  return (
    <>
      {/* Mobile: top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-12 z-30 bg-background border-b flex items-center px-4 gap-3 shrink-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <span className="font-semibold text-sm line-clamp-1">
          {courseTitle}
        </span>
      </div>

      {/* Mobile: overlay + drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-background border-r shadow-xl">
            <SidebarInner
              {...innerProps}
              collapsed={false}
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </>
      )}

      {/* Desktop: collapsible sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-full bg-background border-r shrink-0 relative transition-all duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <SidebarInner {...innerProps} collapsed={collapsed} />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[3.75rem] z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-muted transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </>
  );
}
