"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type SubmissionState = { error?: string; success?: string } | null

export async function submitAssignment(
  assignmentId: number,
  studentUUID: string,
  courseSlug: string,
  lessonId: number,
  _prevState: SubmissionState,
  formData: FormData
): Promise<SubmissionState> {
  const rawUrl = (formData.get("link_url") as string)?.trim()

  try {
    const url = new URL(rawUrl)
    if (!["http:", "https:"].includes(url.protocol)) {
      return { error: "URL ต้องเป็น http หรือ https เท่านั้น" }
    }
  } catch {
    return { error: "กรุณากรอก URL ที่ถูกต้อง (เช่น https://...)" }
  }

  const existing = await prisma.submission.findFirst({
    where: { assignmentId, studentId: studentUUID },
  })

  if (existing) {
    await prisma.submission.update({
      where: { id: existing.id },
      data: { link_url: rawUrl },
    })
  } else {
    await prisma.submission.create({
      data: { assignmentId, studentId: studentUUID, link_url: rawUrl },
    })
  }

  revalidatePath(`/courses/${courseSlug}/lessons/${lessonId}`)
  return { success: "ส่งงานเรียบร้อยแล้ว ✓" }
}

export async function deleteSubmission(
  assignmentId: number,
  studentUUID: string,
  courseSlug: string,
  lessonId: number,
): Promise<SubmissionState> {
  const existing = await prisma.submission.findFirst({
    where: { assignmentId, studentId: studentUUID },
  })

  if (!existing) return { error: "ไม่พบงานที่ส่งไว้" }

  await prisma.submission.delete({ where: { id: existing.id } })

  revalidatePath(`/courses/${courseSlug}/lessons/${lessonId}`)
  return { success: "ลบงานเรียบร้อยแล้ว" }
}
