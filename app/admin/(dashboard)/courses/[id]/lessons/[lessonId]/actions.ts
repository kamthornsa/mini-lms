"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function updateLesson(
  lessonId: number,
  courseId: number,
  formData: FormData
) {
  const title = (formData.get("title") as string).trim()
  const content = (formData.get("content") as string).trim()
  const youtube_id = (formData.get("youtube_id") as string | null)?.trim() || null
  const order_index = parseInt(formData.get("order_index") as string) || 0
  const slugInput = (formData.get("slug") as string | null)?.trim()
  const slug = slugInput ? slugify(slugInput) : slugify(title)

  await prisma.lesson.update({
    where: { id: lessonId },
    data: { title, slug, content, youtube_id, order_index },
  })

  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`)
  revalidatePath(`/admin/courses/${courseId}`)
}

export async function deleteLessonAndRedirect(lessonId: number, courseId: number) {
  await prisma.submission.deleteMany({
    where: { assignment: { lessonId } },
  })
  await prisma.assignment.deleteMany({ where: { lessonId } })
  await prisma.lesson.delete({ where: { id: lessonId } })

  redirect(`/admin/courses/${courseId}`)
}

export async function createAssignment(lessonId: number, courseId: number, formData: FormData) {
  const title = (formData.get("title") as string).trim()
  const description = (formData.get("description") as string | null)?.trim() || null

  if (!title) return

  await prisma.assignment.create({
    data: { lessonId, title, description },
  })

  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`)
}

export async function updateAssignment(
  assignmentId: number,
  lessonId: number,
  courseId: number,
  formData: FormData
) {
  const title = (formData.get("title") as string).trim()
  const description = (formData.get("description") as string | null)?.trim() || null

  if (!title) return

  await prisma.assignment.update({
    where: { id: assignmentId },
    data: { title, description },
  })

  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`)
}

export async function deleteAssignment(assignmentId: number, lessonId: number, courseId: number) {
  await prisma.submission.deleteMany({ where: { assignmentId } })
  await prisma.assignment.delete({ where: { id: assignmentId } })

  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`)
}

export async function attachQuiz(lessonId: number, courseId: number, quizId: number) {
  await prisma.lessonQuiz.upsert({
    where: { lessonId_quizId: { lessonId, quizId } },
    create: { lessonId, quizId },
    update: {},
  })
  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`)
}

export async function detachQuiz(lessonQuizId: number, lessonId: number, courseId: number) {
  await prisma.lessonQuiz.delete({ where: { id: lessonQuizId } })
  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`)
}

