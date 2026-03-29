import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, GraduationCap, FileText } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const [courseCount, sectionCount, studentCount, submissionCount] =
    await Promise.all([
      prisma.course.count(),
      prisma.section.count(),
      prisma.student.count(),
      prisma.submission.count(),
    ])

  const stats = [
    { label: "Courses", value: courseCount, icon: BookOpen, href: "/admin/courses" },
    { label: "Sections", value: sectionCount, icon: Users, href: "/admin/sections" },
    { label: "Students", value: studentCount, icon: GraduationCap, href: "/admin/students" },
    { label: "Submissions", value: submissionCount, icon: FileText, href: "/admin/submissions" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon size={16} className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
