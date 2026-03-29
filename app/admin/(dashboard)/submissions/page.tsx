import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { SubmissionsFilter } from "./_components/submissions-filter";
import { QuizAttemptsFilter } from "./_components/quiz-attempts-filter";
import Link from "next/link";
import { cn } from "@/lib/utils";

type SearchParams = {
  courseId?: string;
  assignmentId?: string;
  quizId?: string;
  q?: string;
  tab?: string;
};

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { courseId, assignmentId, quizId, q, tab } = await searchParams;
  const activeTab = tab === "quizzes" ? "quizzes" : "assignments";
  const courseIdNum = courseId ? parseInt(courseId) : undefined;
  const assignmentIdNum = assignmentId ? parseInt(assignmentId) : undefined;
  const quizIdNum = quizId ? parseInt(quizId) : undefined;

  // Shared: courses for filter
  const courses = await prisma.course.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });

  // ─── Assignments Tab ──────────────────────────────────────────────
  const assignmentsForFilter =
    activeTab === "assignments" && courseIdNum
      ? await prisma.assignment.findMany({
          where: { lesson: { courseId: courseIdNum } },
          orderBy: { id: "asc" },
          select: { id: true, title: true, lessonId: true },
        })
      : [];

  const submissionWhere: Record<string, unknown> = {};
  if (activeTab === "assignments") {
    if (assignmentIdNum) submissionWhere.assignmentId = assignmentIdNum;
    else if (courseIdNum)
      submissionWhere.assignment = { lesson: { courseId: courseIdNum } };
    if (q) {
      submissionWhere.student = {
        OR: [
          { full_name: { contains: q, mode: "insensitive" } },
          { student_id: { contains: q, mode: "insensitive" } },
        ],
      };
    }
  }

  const submissions =
    activeTab === "assignments"
      ? await prisma.submission.findMany({
          where: submissionWhere,
          include: {
            student: { select: { full_name: true, student_id: true } },
            assignment: {
              select: {
                title: true,
                lesson: {
                  select: {
                    title: true,
                    course: { select: { title: true } },
                  },
                },
              },
            },
          },
          orderBy: { created_at: "desc" },
        })
      : [];

  // ─── Quizzes Tab ──────────────────────────────────────────────────
  const quizzesForFilter =
    activeTab === "quizzes"
      ? await prisma.quiz.findMany({
          where: courseIdNum
            ? {
                lessonQuizzes: {
                  some: { lesson: { courseId: courseIdNum } },
                },
              }
            : undefined,
          orderBy: { title: "asc" },
          select: { id: true, title: true },
        })
      : [];

  const attemptWhere: Record<string, unknown> = {
    submitted_at: { not: null },
  };
  if (activeTab === "quizzes") {
    if (quizIdNum) {
      attemptWhere.quizId = quizIdNum;
    } else if (courseIdNum) {
      attemptWhere.quiz = {
        lessonQuizzes: { some: { lesson: { courseId: courseIdNum } } },
      };
    }
    if (q) {
      attemptWhere.student = {
        OR: [
          { full_name: { contains: q, mode: "insensitive" } },
          { student_id: { contains: q, mode: "insensitive" } },
        ],
      };
    }
  }

  const quizAttempts =
    activeTab === "quizzes"
      ? await prisma.quizAttempt.findMany({
          where: attemptWhere,
          include: {
            student: { select: { full_name: true, student_id: true } },
            quiz: {
              select: {
                id: true,
                title: true,
                lessonQuizzes: {
                  take: 1,
                  include: {
                    lesson: {
                      select: {
                        title: true,
                        course: { select: { title: true } },
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { submitted_at: "desc" },
        })
      : [];

  // Summary cards (no filter active)
  const assignmentCourseStats =
    activeTab === "assignments" && !courseIdNum && !assignmentIdNum && !q
      ? courses.map((c) => ({
          ...c,
          count: submissions.filter(
            (s) => s.assignment.lesson.course.title === c.title,
          ).length,
        }))
      : [];

  const quizCourseStats =
    activeTab === "quizzes" && !courseIdNum && !quizIdNum && !q
      ? courses.map((c) => ({
          ...c,
          count: quizAttempts.filter(
            (a) => a.quiz.lessonQuizzes[0]?.lesson.course.title === c.title,
          ).length,
        }))
      : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Submissions</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        <Link
          href="?tab=assignments"
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
            activeTab === "assignments"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          📝 แบบฝึกหัด
        </Link>
        <Link
          href="?tab=quizzes"
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
            activeTab === "quizzes"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          🧠 แบบทดสอบ
        </Link>
      </div>

      {activeTab === "assignments" ? (
        <>
          {/* Course summary cards */}
          {assignmentCourseStats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
              {assignmentCourseStats.map((c) => (
                <a
                  key={c.id}
                  href={`?tab=assignments&courseId=${c.id}`}
                  className="border rounded-lg p-4 bg-background hover:bg-muted/40 transition-colors group"
                >
                  <p className="text-xs text-muted-foreground mb-1 group-hover:text-foreground line-clamp-2">
                    {c.title}
                  </p>
                  <p className="text-2xl font-bold">{c.count}</p>
                  <p className="text-xs text-muted-foreground">การส่งงาน</p>
                </a>
              ))}
            </div>
          )}

          <Suspense>
            <SubmissionsFilter
              courses={courses}
              assignments={assignmentsForFilter}
              total={submissions.length}
            />
          </Suspense>

          <div className="border rounded-lg overflow-hidden bg-background">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="text-left px-4 py-3 font-medium whitespace-nowrap">
                    วันที่
                  </th>
                  <th className="text-left px-4 py-3 font-medium">นักศึกษา</th>
                  <th className="text-left px-4 py-3 font-medium">
                    Assignment
                  </th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                    Lesson / Course
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Link</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      ไม่พบรายการส่งงาน
                    </td>
                  </tr>
                )}
                {submissions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                      {new Date(sub.created_at).toLocaleDateString("th-TH", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{sub.student.full_name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {sub.student.student_id}
                      </p>
                    </td>
                    <td className="px-4 py-3">{sub.assignment.title}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      <p>{sub.assignment.lesson.title}</p>
                      <p className="text-xs">
                        {sub.assignment.lesson.course.title}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={sub.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all text-xs"
                      >
                        {sub.link_url}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* Quiz course summary cards */}
          {quizCourseStats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
              {quizCourseStats.map((c) => (
                <a
                  key={c.id}
                  href={`?tab=quizzes&courseId=${c.id}`}
                  className="border rounded-lg p-4 bg-background hover:bg-muted/40 transition-colors group"
                >
                  <p className="text-xs text-muted-foreground mb-1 group-hover:text-foreground line-clamp-2">
                    {c.title}
                  </p>
                  <p className="text-2xl font-bold">{c.count}</p>
                  <p className="text-xs text-muted-foreground">การทำแบบทดสอบ</p>
                </a>
              ))}
            </div>
          )}

          <Suspense>
            <QuizAttemptsFilter
              courses={courses}
              quizzes={quizzesForFilter}
              total={quizAttempts.length}
            />
          </Suspense>

          <div className="border rounded-lg overflow-hidden bg-background">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="text-left px-4 py-3 font-medium whitespace-nowrap">
                    วันที่
                  </th>
                  <th className="text-left px-4 py-3 font-medium">นักศึกษา</th>
                  <th className="text-left px-4 py-3 font-medium">แบบทดสอบ</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                    Lesson / Course
                  </th>
                  <th className="text-center px-4 py-3 font-medium">คะแนน</th>
                  <th className="text-center px-4 py-3 font-medium hidden md:table-cell">
                    ครั้งที่
                  </th>
                </tr>
              </thead>
              <tbody>
                {quizAttempts.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      ไม่พบรายการทำแบบทดสอบ
                    </td>
                  </tr>
                )}
                {quizAttempts.map((attempt) => {
                  const pct =
                    attempt.score != null && attempt.total_points
                      ? Math.round((attempt.score / attempt.total_points) * 100)
                      : null;
                  const lessonInfo = attempt.quiz.lessonQuizzes[0]?.lesson;
                  return (
                    <tr
                      key={attempt.id}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                        {attempt.submitted_at
                          ? new Date(attempt.submitted_at).toLocaleDateString(
                              "th-TH",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">
                          {attempt.student.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {attempt.student.student_id}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {attempt.quiz.title}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                        {lessonInfo ? (
                          <>
                            <p>{lessonInfo.title}</p>
                            <p className="text-xs">{lessonInfo.course.title}</p>
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {pct !== null &&
                        attempt.score != null &&
                        attempt.total_points != null ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-semibold tabular-nums">
                              {attempt.score}/{attempt.total_points}
                            </span>
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${pct >= 70 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span
                              className={`text-xs font-medium ${pct >= 70 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-red-600"}`}
                            >
                              {pct}%
                            </span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground hidden md:table-cell">
                        #{attempt.attempt_no}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
