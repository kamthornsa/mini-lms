import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { CreateCourseDialog } from "./_components/create-course-dialog"

type CourseRow = {
  id: number
  title: string
  slug: string
  description: string | null
  _count: { lessons: number }
}

export default async function CoursesPage() {
  const courses = (await prisma.course.findMany({
    include: { _count: { select: { lessons: true } } },
    orderBy: { id: "desc" },
  })) as CourseRow[]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Courses</h1>
        <CreateCourseDialog />
      </div>

      <div className="border rounded-lg overflow-hidden bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted border-b">
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium">Slug</th>
              <th className="text-left px-4 py-3 font-medium">Lessons</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  ยังไม่มี course — คลิก &quot;New Course&quot; เพื่อสร้าง
                </td>
              </tr>
            )}
            {courses.map((course: CourseRow) => (
              <tr key={course.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/courses/${course.id}`} className="hover:underline">
                    {course.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                  {course.slug}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {course._count.lessons}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/courses/${course.id}`}>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
