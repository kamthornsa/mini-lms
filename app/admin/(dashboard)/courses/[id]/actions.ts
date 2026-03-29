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

export async function updateCourseInfo(id: number, formData: FormData) {
  const title = (formData.get("title") as string).trim()
  const description = (formData.get("description") as string | null)?.trim() || null
  const slugInput = (formData.get("slug") as string | null)?.trim()
  const slug = slugInput ? slugify(slugInput) : slugify(title)

  await prisma.course.update({ where: { id }, data: { title, description, slug } })
  revalidatePath(`/admin/courses/${id}`)
  revalidatePath("/admin/courses")
}

export async function deleteCourse(id: number) {
  const lessons = await prisma.lesson.findMany({
    where: { courseId: id },
    select: { id: true },
  })
  const lessonIds = lessons.map((l: { id: number }) => l.id)

  await prisma.submission.deleteMany({
    where: { assignment: { lessonId: { in: lessonIds } } },
  })
  await prisma.assignment.deleteMany({ where: { lessonId: { in: lessonIds } } })
  await prisma.lesson.deleteMany({ where: { courseId: id } })
  await prisma.sectionCourse.deleteMany({ where: { courseId: id } })
  await prisma.course.delete({ where: { id } })

  redirect("/admin/courses")
}

export async function createLesson(courseId: number, formData: FormData) {
  const title = (formData.get("title") as string).trim()
  const content = (formData.get("content") as string).trim()
  const youtube_id = (formData.get("youtube_id") as string | null)?.trim() || null
  const order_index = parseInt(formData.get("order_index") as string) || 0
  const slug = slugify(title)

  await prisma.lesson.create({
    data: { courseId, title, slug, content, youtube_id, order_index },
  })
  revalidatePath(`/admin/courses/${courseId}`)
}

export async function deleteLesson(lessonId: number, courseId: number) {
  await prisma.submission.deleteMany({
    where: { assignment: { lessonId } },
  })
  await prisma.assignment.deleteMany({ where: { lessonId } })
  await prisma.lesson.delete({ where: { id: lessonId } })
  revalidatePath(`/admin/courses/${courseId}`)
}
