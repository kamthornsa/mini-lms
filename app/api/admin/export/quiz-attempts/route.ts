import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as XLSX from "xlsx"

export async function GET(req: NextRequest) {
  // Admin-only
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const courseId = searchParams.get("courseId")
  const quizId = searchParams.get("quizId")
  const q = searchParams.get("q")

  const courseIdNum = courseId ? parseInt(courseId) : undefined
  const quizIdNum = quizId ? parseInt(quizId) : undefined

  const where: Record<string, unknown> = { submitted_at: { not: null } }

  if (quizIdNum) {
    where.quizId = quizIdNum
  } else if (courseIdNum) {
    where.quiz = {
      lessonQuizzes: { some: { lesson: { courseId: courseIdNum } } },
    }
  }

  if (q) {
    where.student = {
      OR: [
        { full_name: { contains: q, mode: "insensitive" } },
        { student_id: { contains: q, mode: "insensitive" } },
      ],
    }
  }

  const attempts = await prisma.quizAttempt.findMany({
    where,
    include: {
      student: { select: { full_name: true, student_id: true } },
      quiz: {
        select: {
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

  const rows = attempts.map((a) => {
    const lesson = a.quiz.lessonQuizzes[0]?.lesson
    const pct =
      a.score != null && a.total_points && a.total_points > 0
        ? Math.round((a.score / a.total_points) * 100)
        : null

    return {
      วันที่: a.submitted_at
        ? new Date(a.submitted_at).toLocaleString("th-TH", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      รหัสนักศึกษา: a.student.student_id,
      ชื่อ: a.student.full_name,
      แบบทดสอบ: a.quiz.title,
      Lesson: lesson?.title ?? "",
      วิชา: lesson?.course.title ?? "",
      ครั้งที่: a.attempt_no,
      คะแนนที่ได้: a.score ?? "",
      คะแนนเต็ม: a.total_points ?? "",
      เปอร์เซ็นต์: pct !== null ? `${pct}%` : "",
    }
  })

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)

  // Column widths
  ws["!cols"] = [
    { wch: 22 }, // วันที่
    { wch: 16 }, // รหัสนักศึกษา
    { wch: 26 }, // ชื่อ
    { wch: 30 }, // แบบทดสอบ
    { wch: 26 }, // Lesson
    { wch: 26 }, // วิชา
    { wch: 8 },  // ครั้งที่
    { wch: 12 }, // คะแนนที่ได้
    { wch: 10 }, // คะแนนเต็ม
    { wch: 12 }, // เปอร์เซ็นต์
  ]

  XLSX.utils.book_append_sheet(wb, ws, "Quiz Attempts")

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`
  const filename = `quiz-attempts-${dateStr}.xlsx`

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
