"use server"

import { prisma } from "@/lib/prisma"
import { setStudentSession, clearStudentSession } from "@/lib/student-session"
import { redirect } from "next/navigation"

export async function loginStudent(courseSlug: string, formData: FormData) {
  const studentId = (formData.get("student_id") as string)?.trim()

  if (!studentId) {
    redirect(`/courses/${courseSlug}?error=required`)
  }

  const access = await prisma.studentSection.findFirst({
    where: {
      student: { student_id: studentId },
      section: {
        courses: {
          some: { course: { slug: courseSlug } },
        },
      },
    },
    include: {
      student: {
        select: { id: true, student_id: true, full_name: true },
      },
    },
  })

  if (!access) {
    redirect(`/courses/${courseSlug}?error=invalid`)
  }

  await setStudentSession({
    studentId: access.student.student_id,
    studentUUID: access.student.id,
    studentName: access.student.full_name,
    courseSlug,
  })

  redirect(`/courses/${courseSlug}`)
}

export async function logoutStudent(courseSlug: string) {
  await clearStudentSession(courseSlug)
  redirect(`/courses/${courseSlug}`)
}
