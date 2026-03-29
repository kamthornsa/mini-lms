import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft } from "lucide-react"
import { deleteSection } from "../actions"
import { ToggleCourseButton, ToggleStudentButton } from "./_components/toggle-buttons"

export default async function SectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const sectionId = parseInt(id)
  if (isNaN(sectionId)) notFound()

  const [section, allCourses, allStudents] = await Promise.all([
    prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        courses: { include: { course: true } },
        students: { include: { student: true } },
      },
    }),
    prisma.course.findMany({ orderBy: { title: "asc" } }),
    prisma.student.findMany({ orderBy: { full_name: "asc" } }),
  ])

  if (!section) notFound()

  const assignedCourseIds = new Set(section.courses.map((c: { courseId: number }) => c.courseId))
  const assignedStudentIds = new Set(section.students.map((s: { studentId: string }) => s.studentId))

  async function handleDelete() {
    "use server"
    await deleteSection(sectionId)
  }

  async function handleRename(formData: FormData) {
    "use server"
    const { prisma } = await import("@/lib/prisma")
    const { revalidatePath } = await import("next/cache")
    const name = (formData.get("name") as string).trim()
    if (name) {
      await prisma.section.update({ where: { id: sectionId }, data: { name } })
      revalidatePath(`/admin/sections/${sectionId}`)
      revalidatePath("/admin/sections")
    }
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/sections"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft size={14} /> Back to Sections
      </Link>

      <h1 className="text-2xl font-bold mb-6">{section.name}</h1>

      {/* Rename */}
      <section className="border rounded-lg p-6 mb-6 bg-background">
        <h2 className="text-base font-semibold mb-4">แก้ไขชื่อ Section</h2>
        <form action={handleRename} className="flex gap-3">
          <Input name="name" defaultValue={section.name} required className="max-w-xs" />
          <Button type="submit" size="sm">บันทึก</Button>
        </form>
      </section>

      {/* Assign Courses */}
      <section className="border rounded-lg p-6 mb-6 bg-background">
        <h2 className="text-base font-semibold mb-4">
          Courses ที่มอบหมาย ({section.courses.length})
        </h2>
        {allCourses.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มี course ในระบบ</p>
        ) : (
          <div>
            {allCourses.map((course: { id: number; title: string }) => (
              <ToggleCourseButton
                key={course.id}
                sectionId={sectionId}
                courseId={course.id}
                assigned={assignedCourseIds.has(course.id)}
                courseTitle={course.title}
              />
            ))}
          </div>
        )}
      </section>

      {/* Assign Students */}
      <section className="border rounded-lg p-6 mb-6 bg-background">
        <h2 className="text-base font-semibold mb-4">
          นักศึกษาในกลุ่ม ({section.students.length})
        </h2>
        {allStudents.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มีนักศึกษาในระบบ</p>
        ) : (
          <div>
            {allStudents.map((s: { id: string; full_name: string; student_id: string }) => (
              <ToggleStudentButton
                key={s.id}
                sectionId={sectionId}
                studentId={s.id}
                assigned={assignedStudentIds.has(s.id)}
                studentName={s.full_name}
                studentCode={s.student_id}
              />
            ))}
          </div>
        )}
      </section>

      {/* Danger Zone */}
      <section className="border border-destructive/30 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-destructive mb-1">Danger Zone</h2>
        <p className="text-xs text-muted-foreground mb-3">
          ลบ section นี้ออกจากระบบ (ไม่ลบนักศึกษา)
        </p>
        <form action={handleDelete}>
          <Button type="submit" variant="destructive" size="sm">
            ลบ Section นี้
          </Button>
        </form>
      </section>
    </div>
  )
}
