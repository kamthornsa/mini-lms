"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type QuizSubmitResult =
  | { ok: true; score: number; totalPoints: number; correct: number; total: number }
  | { ok: false; error: string }

export async function submitQuiz(
  quizId: number,
  studentId: string,
  courseSlug: string,
  lessonId: number,
  answers: Record<number, number> // questionId -> choiceId
): Promise<QuizSubmitResult> {
  // Check attempt limit
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { max_attempts: true, questions: { select: { id: true, points: true, choices: { select: { id: true, is_correct: true } } } } },
  })
  if (!quiz) return { ok: false, error: "ไม่พบ Quiz" }

  const attemptCount = await prisma.quizAttempt.count({
    where: { quizId, studentId, submitted_at: { not: null } },
  })

  if (quiz.max_attempts !== null && attemptCount >= quiz.max_attempts) {
    return { ok: false, error: `ทำ Quiz ได้สูงสุด ${quiz.max_attempts} ครั้งเท่านั้น` }
  }

  const attemptNo = attemptCount + 1

  // Calculate score
  let score = 0
  let correct = 0
  const totalPoints = quiz.questions.reduce((s, q) => s + q.points, 0)

  for (const q of quiz.questions) {
    const selectedChoiceId = answers[q.id]
    const correctChoice = q.choices.find((c) => c.is_correct)
    if (selectedChoiceId && correctChoice && selectedChoiceId === correctChoice.id) {
      score += q.points
      correct++
    }
  }

  // Create attempt with answers
  await prisma.quizAttempt.create({
    data: {
      quizId,
      studentId,
      attempt_no: attemptNo,
      score,
      total_points: totalPoints,
      submitted_at: new Date(),
      answers: {
        create: Object.entries(answers)
          .filter(([qId, cId]) => qId && cId)
          .map(([questionId, choiceId]) => ({
            questionId: parseInt(questionId),
            choiceId,
          })),
      },
    },
  })

  revalidatePath(`/courses/${courseSlug}/lessons/${lessonId}`)

  return { ok: true, score, totalPoints, correct, total: quiz.questions.length }
}
