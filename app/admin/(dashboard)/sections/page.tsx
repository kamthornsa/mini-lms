import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { CreateSectionDialog } from "./_components/create-section-dialog"

type SectionRow = {
  id: number
  name: string
  _count: { students: number; courses: number }
}

export default async function SectionsPage() {
  const sections = (await prisma.section.findMany({
    include: {
      _count: { select: { students: true, courses: true } },
    },
    orderBy: { id: "desc" },
  })) as SectionRow[]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sections</h1>
        <CreateSectionDialog />
      </div>

      <div className="border rounded-lg overflow-hidden bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted border-b">
              <th className="text-left px-4 py-3 font-medium">Section</th>
              <th className="text-left px-4 py-3 font-medium">Courses</th>
              <th className="text-left px-4 py-3 font-medium">Students</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {sections.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  ยังไม่มี section — คลิก &quot;New Section&quot; เพื่อสร้าง
                </td>
              </tr>
            )}
            {sections.map((section: SectionRow) => (
              <tr key={section.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/sections/${section.id}`} className="hover:underline">
                    {section.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{section._count.courses}</td>
                <td className="px-4 py-3 text-muted-foreground">{section._count.students}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/sections/${section.id}`}>
                    <Button variant="ghost" size="sm">Manage</Button>
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
