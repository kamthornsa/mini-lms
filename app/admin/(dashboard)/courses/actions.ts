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

export async function createCourse(formData: FormData) {
  const title = (formData.get("title") as string).trim()
  const description = (formData.get("description") as string | null)?.trim() || null
  const slugInput = (formData.get("slug") as string | null)?.trim()
  const slug = slugInput ? slugify(slugInput) : slugify(title)

  if (!title || !slug) throw new Error("Title is required")

  await prisma.course.create({ data: { title, slug, description } })
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
