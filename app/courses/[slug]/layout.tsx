import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getStudentSession } from "@/lib/student-session";
import { CourseSidebar } from "./_components/course-sidebar";
import { ScrollToTopButton } from "./_components/scroll-to-top";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug },
    select: { title: true },
  });
  return { title: course?.title ?? "Course" };
}

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getStudentSession(slug);

  // No session — render children without sidebar (login page)
  if (!session) {
    return <>{children}</>;
  }

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      lessons: {
        orderBy: { order_index: "asc" },
        select: {
          id: true,
          title: true,
          order_index: true,
          assignments: {
            select: { id: true, title: true },
            orderBy: { id: "asc" },
          },
          lessonQuizzes: {
            select: { id: true, quiz: { select: { id: true, title: true } } },
            orderBy: { order_index: "asc" },
          },
        },
      },
    },
  });

  if (!course) return <>{children}</>;

  return (
    <div className="flex h-screen overflow-hidden">
      <CourseSidebar
        slug={slug}
        courseTitle={course.title}
        lessons={course.lessons}
        session={session}
      />
      <div
        id="course-content"
        className="flex-1 min-w-0 overflow-y-auto pt-12 md:pt-0"
      >
        {children}
        <ScrollToTopButton />
      </div>
    </div>
  );
}
