"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createSection(formData: FormData) {
  const name = (formData.get("name") as string).trim()
  if (!name) throw new Error("ชื่อ section ไม่ว่าง")

  await prisma.section.create({ data: { name } })
  revalidatePath("/admin/sections")
}

export async function deleteSection(id: number) {
  await prisma.studentSection.deleteMany({ where: { sectionId: id } })
  await prisma.sectionCourse.deleteMany({ where: { sectionId: id } })
  await prisma.section.delete({ where: { id } })
  redirect("/admin/sections")
}

export async function toggleCourseInSection(
  sectionId: number,
  courseId: number,
  assigned: boolean
) {
  if (assigned) {
    await prisma.sectionCourse.deleteMany({ where: { sectionId, courseId } })
  } else {
    await prisma.sectionCourse.create({ data: { sectionId, courseId } })
  }
  revalidatePath(`/admin/sections/${sectionId}`)
}

export async function toggleStudentInSection(
  sectionId: number,
  studentId: string,
  assigned: boolean
) {
  if (assigned) {
    await prisma.studentSection.deleteMany({ where: { sectionId, studentId } })
  } else {
    await prisma.studentSection.create({ data: { sectionId, studentId } })
  }
  revalidatePath(`/admin/sections/${sectionId}`)
}
