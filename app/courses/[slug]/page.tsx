import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getStudentSession } from "@/lib/student-session";
import { loginStudent } from "./actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ERROR_MESSAGES: Record<string, string> = {
  required: "กรุณากรอกรหัสนักศึกษา",
  invalid: "รหัสนักศึกษาไม่ถูกต้อง หรือไม่ได้ลงทะเบียนวิชานี้",
};

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      lessons: {
        orderBy: { order_index: "asc" },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!course) notFound();

  const session = await getStudentSession(slug);

  // Logged in — redirect to first lesson (or show overview if no lessons)
  if (session) {
    if (course.lessons.length > 0) {
      redirect(`/courses/${slug}/lessons/${course.lessons[0].id}`);
    }
    // No lessons yet
    return (
      <main className="max-w-2xl mx-auto py-16 px-8">
        <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
        {course.description && (
          <p className="text-muted-foreground">{course.description}</p>
        )}
        <p className="mt-6 text-sm text-muted-foreground">
          ยังไม่มีบทเรียนในวิชานี้
        </p>
      </main>
    );
  }

  // Not logged in — show login form
  async function handleLogin(formData: FormData) {
    "use server";
    await loginStudent(slug, formData);
  }

  return (
    <main className="max-w-md mx-auto py-16 px-4">
      <Link
        href="/courses"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block"
      >
        ← กลับหน้าวิชาเรียน
      </Link>
      <h1 className="text-2xl font-bold mb-1">{course.title}</h1>
      {course.description && (
        <p className="text-muted-foreground mb-6">{course.description}</p>
      )}
      <div className="border rounded-lg p-6">
        <h2 className="font-semibold mb-1">เข้าเรียน</h2>
        <p className="text-sm text-muted-foreground mb-4">
          กรอกรหัสนักศึกษาเพื่อเข้าถึงเนื้อหา
        </p>
        {error && (
          <p className="text-sm text-destructive mb-3 bg-destructive/10 px-3 py-2 rounded-md">
            {ERROR_MESSAGES[error] ?? "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"}
          </p>
        )}
        <form action={handleLogin} className="space-y-3">
          <Input
            name="student_id"
            placeholder="รหัสนักศึกษา"
            required
            autoFocus
          />
          <Button type="submit" className="w-full">
            เข้าเรียน
          </Button>
        </form>
      </div>
    </main>
  );
}
