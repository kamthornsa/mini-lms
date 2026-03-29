import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileQuestion } from "lucide-react";
import { createQuiz } from "./actions";

export default async function QuizzesPage() {
  const quizzes = await prisma.quiz.findMany({
    orderBy: { created_at: "desc" },
    include: {
      _count: { select: { questions: true, attempts: true } },
      lessonQuizzes: {
        include: {
          lesson: {
            select: { title: true, course: { select: { title: true } } },
          },
        },
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quizzes ({quizzes.length})</h1>
      </div>

      {/* Create form */}
      <section className="border rounded-lg p-5 mb-8 bg-background">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Plus size={15} /> สร้าง Quiz ใหม่
        </h2>
        <form action={createQuiz} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px] space-y-1">
            <label className="text-xs font-medium">ชื่อ Quiz *</label>
            <Input
              name="title"
              placeholder="เช่น บทที่ 1 - ทดสอบความรู้"
              required
            />
          </div>
          <div className="w-40 space-y-1">
            <label className="text-xs font-medium">จำกัดจำนวนครั้ง</label>
            <Input
              name="max_attempts"
              type="number"
              min="1"
              placeholder="ไม่จำกัด"
            />
          </div>
          <Button type="submit" size="sm">
            <Plus size={14} className="mr-1" /> สร้าง
          </Button>
        </form>
      </section>

      {/* Quiz list */}
      {quizzes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg bg-background">
          <FileQuestion size={36} className="mx-auto mb-3 opacity-30" />
          <p>ยังไม่มี Quiz — สร้างด้านบนเพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted border-b">
                <th className="text-left px-4 py-3 font-medium">ชื่อ Quiz</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                  ใช้ใน Lesson
                </th>
                <th className="text-center px-4 py-3 font-medium">คำถาม</th>
                <th className="text-center px-4 py-3 font-medium hidden sm:table-cell">
                  ส่งแล้ว
                </th>
                <th className="text-center px-4 py-3 font-medium">
                  จำกัดครั้ง
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr
                  key={quiz.id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/quizzes/${quiz.id}`}
                      className="font-medium hover:underline"
                    >
                      {quiz.title}
                    </Link>
                    {quiz.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {quiz.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {quiz.lessonQuizzes.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <div className="space-y-0.5">
                        {quiz.lessonQuizzes.map((lq) => (
                          <p
                            key={lq.id}
                            className="text-xs text-muted-foreground line-clamp-1"
                          >
                            {lq.lesson.course.title} › {lq.lesson.title}
                          </p>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    {quiz._count.questions}
                  </td>
                  <td className="px-4 py-3 text-center font-mono hidden sm:table-cell">
                    {quiz._count.attempts}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {quiz.max_attempts ?? (
                      <span className="text-muted-foreground">∞</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/quizzes/${quiz.id}`}>
                      <Button variant="ghost" size="sm">
                        แก้ไข
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
