import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react";
import { updateQuiz, deleteQuiz } from "../actions";
import { QuestionEditor } from "./_components/question-editor";
import { ImportExcelDialog } from "./_components/import-excel-dialog";

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quizId = parseInt(id);
  if (isNaN(quizId)) notFound();

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { order_index: "asc" },
        include: { choices: { orderBy: { order_index: "asc" } } },
      },
      lessonQuizzes: {
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              courseId: true,
              course: { select: { title: true } },
            },
          },
        },
      },
    },
  });

  if (!quiz) notFound();

  const totalPoints = quiz.questions.reduce((s, q) => s + q.points, 0);

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateQuiz(quizId, formData);
  }

  async function handleDelete() {
    "use server";
    await deleteQuiz(quizId);
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/quizzes"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft size={14} /> กลับไปรายการ Quiz
      </Link>

      <h1 className="text-2xl font-bold mb-6">{quiz.title}</h1>

      {/* Quiz settings */}
      <section className="border rounded-lg p-6 mb-6 bg-background">
        <h2 className="text-base font-semibold mb-4">ตั้งค่า Quiz</h2>
        <form action={handleUpdate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">ชื่อ Quiz *</label>
            <Input name="title" defaultValue={quiz.title} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">คำอธิบาย</label>
            <Input
              name="description"
              defaultValue={quiz.description ?? ""}
              placeholder="เพิ่มคำอธิบาย (ไม่บังคับ)"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">จำกัดจำนวนครั้งที่ทำ</label>
            <Input
              name="max_attempts"
              type="number"
              min="1"
              defaultValue={quiz.max_attempts ?? ""}
              placeholder="ว่างไว้ = ไม่จำกัด"
              className="max-w-[200px]"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm">
              บันทึก
            </Button>
          </div>
        </form>
      </section>

      {/* Used in lessons */}
      {quiz.lessonQuizzes.length > 0 && (
        <section className="border rounded-lg p-4 mb-6 bg-background">
          <h2 className="text-sm font-semibold mb-2">ใช้อยู่ใน Lesson</h2>
          <ul className="space-y-1">
            {quiz.lessonQuizzes.map((lq) => (
              <li key={lq.id} className="text-sm text-muted-foreground">
                <Link
                  href={`/admin/courses/${lq.lesson.courseId}/lessons/${lq.lesson.id}`}
                  className="hover:underline"
                >
                  {lq.lesson.course.title} › {lq.lesson.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Questions */}
      <section className="border rounded-lg p-6 mb-6 bg-background">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">
            คำถาม ({quiz.questions.length} ข้อ — {totalPoints} คะแนน)
          </h2>
          <ImportExcelDialog quizId={quizId} />
        </div>
        <QuestionEditor quizId={quizId} questions={quiz.questions} />
      </section>

      {/* Danger zone */}
      <section className="border border-destructive/30 rounded-lg p-4 mb-8">
        <h2 className="text-sm font-semibold text-destructive mb-1">
          Danger Zone
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          การลบ Quiz จะลบคำถาม ตัวเลือก และผลการทำทั้งหมด
        </p>
        <form action={handleDelete}>
          <Button type="submit" variant="destructive" size="sm">
            ลบ Quiz นี้
          </Button>
        </form>
      </section>
    </div>
  );
}
