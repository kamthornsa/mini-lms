"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createStudent(formData: FormData) {
  const student_id = (formData.get("student_id") as string).trim()
  const full_name = (formData.get("full_name") as string).trim()
  const sectionId = formData.get("sectionId") as string | null

  if (!student_id || !full_name) throw new Error("กรอกข้อมูลให้ครบ")

  const exists = await prisma.student.findUnique({ where: { student_id } })
  if (exists) throw new Error(`รหัส ${student_id} มีในระบบแล้ว`)

  const student = await prisma.student.create({ data: { student_id, full_name } })

  if (sectionId) {
    await prisma.studentSection.create({
      data: { studentId: student.id, sectionId: parseInt(sectionId) },
    })
  }

  revalidatePath("/admin/students")
}

export async function deleteStudent(id: string) {
  await prisma.submission.deleteMany({ where: { studentId: id } })
  await prisma.studentSection.deleteMany({ where: { studentId: id } })
  await prisma.student.delete({ where: { id } })
  revalidatePath("/admin/students")
}

export async function updateStudentSections(studentId: string, sectionIds: number[]) {
  await prisma.studentSection.deleteMany({ where: { studentId } })
  if (sectionIds.length > 0) {
    await prisma.studentSection.createMany({
      data: sectionIds.map((sectionId) => ({ studentId, sectionId })),
    })
  }
  revalidatePath("/admin/students")
}

export async function importStudentsFromCSV(csvText: string, sectionId?: number) {
  const lines = csvText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)

  const dataLines =
    lines[0]?.toLowerCase().includes("student_id") ||
    lines[0]?.toLowerCase().includes("รหัส")
      ? lines.slice(1)
      : lines

  const results = { created: 0, skipped: 0, errors: [] as string[] }

  for (const line of dataLines) {
    const parts = line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""))
    const student_id = parts[0]
    const full_name = parts[1]

    if (!student_id || !full_name) {
      results.errors.push(`บรรทัด "${line}" ข้อมูลไม่ครบ`)
      continue
    }

    let student = await prisma.student.findUnique({ where: { student_id } })
    if (student) {
      results.skipped++
    } else {
      student = await prisma.student.create({ data: { student_id, full_name } })
      results.created++
    }

    if (sectionId && student) {
      const alreadyIn = await prisma.studentSection.findFirst({
        where: { studentId: student.id, sectionId },
      })
      if (!alreadyIn) {
        await prisma.studentSection.create({
          data: { studentId: student.id, sectionId },
        })
      }
    }
  }

  revalidatePath("/admin/students")
  return results
}
