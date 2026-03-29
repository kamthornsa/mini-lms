"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createQuiz(formData: FormData) {
  const title = (formData.get("title") as string).trim()
  const description = (formData.get("description") as string | null)?.trim() || null
  const max_attempts = formData.get("max_attempts")
    ? parseInt(formData.get("max_attempts") as string) || null
    : null

  if (!title) return

  const quiz = await prisma.quiz.create({
    data: { title, description, max_attempts },
  })

  redirect(`/admin/quizzes/${quiz.id}`)
}

export async function updateQuiz(quizId: number, formData: FormData) {
  const title = (formData.get("title") as string).trim()
  const description = (formData.get("description") as string | null)?.trim() || null
  const max_attempts = formData.get("max_attempts")
    ? parseInt(formData.get("max_attempts") as string) || null
    : null

  await prisma.quiz.update({
    where: { id: quizId },
    data: { title, description, max_attempts },
  })

  revalidatePath(`/admin/quizzes/${quizId}`)
}

export async function deleteQuiz(quizId: number) {
  await prisma.quiz.delete({ where: { id: quizId } })
  redirect("/admin/quizzes")
}

export async function createQuestion(quizId: number, formData: FormData) {
  const question = (formData.get("question") as string).trim()
  const points = parseInt(formData.get("points") as string) || 1
  const choices: { text: string; is_correct: boolean }[] = []

  // Collect choices from form: choice_0, choice_1, ... + correct = index
  const correct = formData.get("correct") as string
  let i = 0
  while (formData.has(`choice_${i}`)) {
    const text = (formData.get(`choice_${i}`) as string).trim()
    if (text) choices.push({ text, is_correct: String(i) === correct })
    i++
  }

  if (!question || choices.length < 2) return

  const existing = await prisma.quizQuestion.count({ where: { quizId } })

  await prisma.quizQuestion.create({
    data: {
      quizId,
      question,
      points,
      order_index: existing,
      choices: { create: choices.map((c, idx) => ({ ...c, order_index: idx })) },
    },
  })

  revalidatePath(`/admin/quizzes/${quizId}`)
}

export async function updateQuestion(
  questionId: number,
  quizId: number,
  formData: FormData
) {
  const question = (formData.get("question") as string).trim()
  const points = parseInt(formData.get("points") as string) || 1
  const correct = formData.get("correct") as string

  const newChoices: { text: string; is_correct: boolean }[] = []
  let i = 0
  while (formData.has(`choice_${i}`)) {
    const text = (formData.get(`choice_${i}`) as string).trim()
    if (text) newChoices.push({ text, is_correct: String(i) === correct })
    i++
  }

  if (!question || newChoices.length < 2) return

  // Delete old choices and recreate
  await prisma.quizChoice.deleteMany({ where: { questionId } })
  await prisma.quizQuestion.update({
    where: { id: questionId },
    data: {
      question,
      points,
      choices: {
        create: newChoices.map((c, idx) => ({ ...c, order_index: idx })),
      },
    },
  })

  revalidatePath(`/admin/quizzes/${quizId}`)
}

export async function deleteQuestion(questionId: number, quizId: number) {
  await prisma.quizQuestion.delete({ where: { id: questionId } })
  revalidatePath(`/admin/quizzes/${quizId}`)
}

export async function importQuestionsFromJson(
  quizId: number,
  rows: { question: string; points: number; choices: string[]; correct: number }[]
) {
  const existing = await prisma.quizQuestion.count({ where: { quizId } })
  for (let idx = 0; idx < rows.length; idx++) {
    const row = rows[idx]
    if (!row.question || row.choices.length < 2) continue
    await prisma.quizQuestion.create({
      data: {
        quizId,
        question: row.question,
        points: row.points || 1,
        order_index: existing + idx,
        choices: {
          create: row.choices.map((text, ci) => ({
            text,
            is_correct: ci === row.correct,
            order_index: ci,
          })),
        },
      },
    })
  }
  revalidatePath(`/admin/quizzes/${quizId}`)
}
