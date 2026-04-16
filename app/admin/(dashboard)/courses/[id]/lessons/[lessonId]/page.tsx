import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Pencil, Trash2, Plus } from "lucide-react";
import {
  updateLesson,
  deleteLessonAndRedirect,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "./actions";
import { QuizAttacher } from "./_components/quiz-attacher";

export default async function LessonEditorPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  const courseId = parseInt(id);
  const lId = parseInt(lessonId);
  if (isNaN(courseId) || isNaN(lId)) notFound();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lId },
    include: {
      course: { select: { title: true } },
      assignments: { orderBy: { id: "asc" } },
      lessonQuizzes: {
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              _count: { select: { questions: true } },
            },
          },
        },
        orderBy: { order_index: "asc" },
      },
    },
  });

  if (!lesson || lesson.courseId !== courseId) notFound();

  // Quizzes not yet attached to this lesson
  const allQuizzes = await prisma.quiz.findMany({
    orderBy: { created_at: "desc" },
    select: { id: true, title: true, _count: { select: { questions: true } } },
  });
  const attachedIds = new Set(
    lesson.lessonQuizzes.map((lq: { quizId: number }) => lq.quizId),
  );
  const availableQuizzes = allQuizzes.filter(
    (q: { id: number }) => !attachedIds.has(q.id),
  );

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateLesson(lId, courseId, formData);
  }

  async function handleDelete() {
    "use server";
    await deleteLessonAndRedirect(lId, courseId);
  }

  async function handleCreateAssignment(formData: FormData) {
    "use server";
    await createAssignment(lId, courseId, formData);
  }

  return (
    <div className="max-w-3xl">
      <Link
        href={`/admin/courses/${courseId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
      >
        <ChevronLeft size={14} /> {lesson.course.title}
      </Link>

      <h1 className="text-2xl font-bold mb-6">แก้ไข Lesson</h1>

      <section className="border rounded-lg p-6 mb-6 bg-background">
        <form action={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title *</label>
              <Input name="title" defaultValue={lesson.title} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Slug</label>
              <Input name="slug" defaultValue={lesson.slug} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">ลำดับ</label>
              <Input
                name="order_index"
                type="number"
                defaultValue={lesson.order_index}
                min="0"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">YouTube ID</label>
              <Input
                name="youtube_id"
                defaultValue={lesson.youtube_id ?? ""}
                placeholder="เช่น dQw4w9WgXcQ"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">เนื้อหา (Markdown) *</label>
            <textarea
              name="content"
              className="w-full min-h-[400px] px-3 py-2 text-sm border rounded-md bg-background resize-y font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              defaultValue={lesson.content}
              required
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">บันทึก</Button>
          </div>
        </form>
      </section>

      {/* Assignments Section */}
      <section className="border rounded-lg p-6 mb-6 bg-background">
        <h2 className="text-lg font-semibold mb-4">
          Assignments ({lesson.assignments.length})
        </h2>

        {lesson.assignments.length === 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            ยังไม่มี assignment
          </p>
        )}

        <div className="space-y-3 mb-6">
          {lesson.assignments.map(
            (a: { id: number; title: string; description: string | null }) => {
              async function handleUpdateAssignment(formData: FormData) {
                "use server";
                await updateAssignment(a.id, lId, courseId, formData);
              }
              async function handleDeleteAssignment() {
                "use server";
                await deleteAssignment(a.id, lId, courseId);
              }
              return (
                <div key={a.id} className="border rounded-md p-4 bg-muted/30">
                  <div className="flex gap-2 items-start">
                    <form
                      action={handleUpdateAssignment}
                      className="flex-1 space-y-2"
                    >
                      <Input
                        name="title"
                        defaultValue={a.title}
                        placeholder="ชื่อ Assignment *"
                        required
                      />
                      <textarea
                        name="description"
                        className="w-full px-3 py-2 text-sm border rounded-md bg-background resize-y font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                        rows={3}
                        defaultValue={a.description ?? ""}
                        placeholder="คำอธิบาย (รองรับ Markdown และ HTML เช่น - ข้อย่อย, **ตัวหนา**, <b>bold</b>)"
                      />
                      <p className="text-xs text-muted-foreground">
                        รองรับ Markdown (<code>- รายการ</code>,{" "}
                        <code>**ตัวหนา**</code>) และ HTML (
                        <code>&lt;br&gt;</code>,{" "}
                        <code>
                          &lt;ul&gt;&lt;li&gt;...&lt;/li&gt;&lt;/ul&gt;
                        </code>
                        )
                      </p>
                      <div className="flex justify-start">
                        <Button type="submit" size="sm" variant="outline">
                          <Pencil size={14} className="mr-1" /> บันทึก
                        </Button>
                      </div>
                    </form>
                    <form
                      action={handleDeleteAssignment}
                      className="shrink-0 mt-0.5"
                    >
                      <Button type="submit" size="sm" variant="destructive">
                        <Trash2 size={14} className="mr-1" /> ลบ
                      </Button>
                    </form>
                  </div>
                </div>
              );
            },
          )}
        </div>

        {/* Add new assignment */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
            <Plus size={14} /> เพิ่ม Assignment ใหม่
          </h3>
          <form action={handleCreateAssignment} className="space-y-2">
            <Input name="title" placeholder="ชื่อ Assignment *" required />
            <textarea
              name="description"
              className="w-full px-3 py-2 text-sm border rounded-md bg-background resize-y font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
              placeholder="คำอธิบาย (รองรับ Markdown และ HTML เช่น - ข้อย่อย, **ตัวหนา**, <b>bold</b>)"
            />
            <p className="text-xs text-muted-foreground">
              รองรับ Markdown (<code>- รายการ</code>, <code>**ตัวหนา**</code>)
              และ HTML (<code>&lt;br&gt;</code>,{" "}
              <code>&lt;ul&gt;&lt;li&gt;...&lt;/li&gt;&lt;/ul&gt;</code>)
            </p>
            <div className="flex justify-end">
              <Button type="submit" size="sm">
                <Plus size={14} className="mr-1" /> เพิ่ม Assignment
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Quiz Section */}
      <section className="border rounded-lg p-6 mb-6 bg-background">
        <h2 className="text-lg font-semibold mb-4">
          แบบทดสอบ (Quiz) ({lesson.lessonQuizzes.length})
        </h2>
        <QuizAttacher
          lessonId={lId}
          courseId={courseId}
          attached={lesson.lessonQuizzes}
          available={availableQuizzes}
        />
      </section>

      <section className="border border-destructive/30 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-destructive mb-1">
          Danger Zone
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          การลบ lesson จะลบ assignments และ submissions ทั้งหมดด้วย
        </p>
        <form action={handleDelete}>
          <Button type="submit" variant="destructive" size="sm">
            ลบ Lesson นี้
          </Button>
        </form>
      </section>
    </div>
  );
}
