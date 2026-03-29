import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true, slug: true, description: true },
  });

  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">วิชาเรียนทั้งหมด</h1>
      <p className="text-muted-foreground mb-8">เลือกวิชาที่ต้องการเข้าเรียน</p>

      <div className="space-y-3">
        {courses.length === 0 && (
          <p className="text-muted-foreground">ยังไม่มีวิชาในระบบ</p>
        )}
        {courses.map(
          (c: {
            id: number;
            title: string;
            slug: string;
            description: string | null;
          }) => (
            <Link
              key={c.id}
              href={`/courses/${c.slug}`}
              className="block border rounded-lg p-5 hover:bg-muted/50 transition-colors"
            >
              <h2 className="font-semibold text-lg">{c.title}</h2>
              {c.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {c.description}
                </p>
              )}
            </Link>
          ),
        )}
      </div>
    </main>
  );
}
