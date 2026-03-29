import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react";
import { updateCourseInfo, deleteCourse } from "./actions";
import { CreateLessonDialog } from "./_components/create-lesson-dialog";
import { DeleteLessonButton } from "./_components/delete-lesson-button";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const courseId = parseInt(id);
  if (isNaN(courseId)) notFound();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        orderBy: { order_index: "asc" },
        include: {
          assignments: {
            orderBy: { id: "asc" },
            select: { id: true, title: true },
          },
        },
      },
    },
  });

  if (!course) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateCourseInfo(courseId, formData);
  }

  async function handleDelete() {
    "use server";
    await deleteCourse(courseId);
  }

  // Flatten all assignments with lesson context
  const allAssignments = course.lessons.flatMap(
    (l: {
      id: number;
      title: string;
      slug: string;
      order_index: number;
      assignments: { id: number; title: string }[];
    }) =>
      l.assignments.map((a) => ({
        ...a,
        lessonId: l.id,
        lessonTitle: l.title,
        lessonOrder: l.order_index,
      })),
  );

  return (
    <div className="max-w-6xl">
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft size={14} /> Back to Courses
      </Link>

      <h1 className="text-2xl font-bold mb-6">{course.title}</h1>

      {/* Course Info */}
      <section className="border rounded-lg p-6 mb-6 bg-background">
        <h2 className="text-base font-semibold mb-4">Course Info</h2>
        <form action={handleUpdate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title *</label>
            <Input name="title" defaultValue={course.title} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Slug *</label>
            <Input name="slug" defaultValue={course.slug} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <Input name="description" defaultValue={course.description ?? ""} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm">
              บันทึก
            </Button>
          </div>
        </form>
      </section>

      {/* Danger Zone */}
      <section className="border border-destructive/30 rounded-lg p-4 mb-8">
        <h2 className="text-sm font-semibold text-destructive mb-1">
          Danger Zone
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          การลบ course จะลบ lessons และ assignments ทั้งหมดด้วย
        </p>
        <form action={handleDelete}>
          <Button type="submit" variant="destructive" size="sm">
            ลบ Course นี้
          </Button>
        </form>
      </section>

      {/* 2-column: Lessons + Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lessons (left) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">
              Lessons ({course.lessons.length})
            </h2>
            <CreateLessonDialog courseId={courseId} />
          </div>

          <div className="border rounded-lg overflow-hidden bg-background">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="text-left px-4 py-3 font-medium w-12">#</th>
                  <th className="text-left px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {course.lessons.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      ยังไม่มี lesson — คลิก &quot;New Lesson&quot; เพื่อสร้าง
                    </td>
                  </tr>
                )}
                {course.lessons.map(
                  (lesson: {
                    id: number;
                    title: string;
                    slug: string;
                    order_index: number;
                    assignments: { id: number; title: string }[];
                  }) => (
                    <tr
                      key={lesson.id}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                        {lesson.order_index}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/admin/courses/${courseId}/lessons/${lesson.id}`}
                          className="hover:underline"
                        >
                          {lesson.title}
                        </Link>
                        {lesson.assignments.length > 0 && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({lesson.assignments.length} แบบฝึกหัด)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/courses/${courseId}/lessons/${lesson.id}`}
                          >
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </Link>
                          <DeleteLessonButton
                            lessonId={lesson.id}
                            courseId={courseId}
                          />
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Assignments (right) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">
              Assignments ({allAssignments.length})
            </h2>
          </div>

          <div className="border rounded-lg overflow-hidden bg-background">
            {allAssignments.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                ยังไม่มี assignment — เพิ่มได้ในหน้าแก้ไข Lesson
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted border-b">
                    <th className="text-left px-4 py-3 font-medium">
                      Assignment
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Lesson</th>
                  </tr>
                </thead>
                <tbody>
                  {allAssignments.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/admin/courses/${courseId}/lessons/${a.lessonId}`}
                          className="hover:underline"
                        >
                          {a.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        <span className="font-mono mr-1">{a.lessonOrder}.</span>
                        {a.lessonTitle}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
