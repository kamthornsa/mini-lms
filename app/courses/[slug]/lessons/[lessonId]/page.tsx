import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getStudentSession } from "@/lib/student-session";
import { SubmissionForm } from "./_components/submission-form";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { QuizWidget } from "./_components/quiz-widget";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId: lessonIdStr } = await params;
  const lessonId = parseInt(lessonIdStr);
  if (isNaN(lessonId)) notFound();

  const session = await getStudentSession(slug);
  if (!session) redirect(`/courses/${slug}`);

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: { select: { title: true, slug: true } },
      assignments: {
        orderBy: { id: "asc" },
        include: {
          submissions: {
            where: { studentId: session.studentUUID },
            select: { id: true, link_url: true },
          },
        },
      },
      lessonQuizzes: {
        orderBy: { order_index: "asc" },
        include: {
          quiz: {
            include: {
              questions: {
                orderBy: { order_index: "asc" },
                include: {
                  choices: {
                    orderBy: { order_index: "asc" },
                    select: { id: true, text: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!lesson || lesson.course.slug !== slug) notFound();

  return (
    <article className="max-w-3xl mx-auto py-10 px-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">{lesson.title}</h1>

      {/* YouTube embed */}
      {lesson.youtube_id && (
        <div className="aspect-video mb-8 rounded-lg overflow-hidden border bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${lesson.youtube_id}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Lesson content */}
      {lesson.content && (
        <div className="mb-10">
          <MarkdownRenderer content={lesson.content} />
        </div>
      )}

      {/* Assignments */}
      {lesson.assignments.length > 0 && (
        <section className="mt-10 border-t pt-8">
          <h2 className="text-xl font-semibold mb-5">📝 Assignments</h2>
          <div className="space-y-4">
            {lesson.assignments.map(
              (a: {
                id: number;
                title: string;
                description: string | null;
                submissions: { id: number; link_url: string }[];
              }) => {
                const submission = a.submissions[0] ?? null;
                return (
                  <div
                    key={a.id}
                    id={`assignment-${a.id}`}
                    className="border rounded-lg p-5 bg-muted/20 scroll-mt-8"
                  >
                    <h3 className="font-medium mb-1">{a.title}</h3>
                    {a.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {a.description}
                      </p>
                    )}
                    {submission && (
                      <p className="text-xs text-muted-foreground mb-2">
                        ส่งแล้ว:{" "}
                        <a
                          href={submission.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-primary"
                        >
                          {submission.link_url}
                        </a>
                      </p>
                    )}
                    <SubmissionForm
                      assignmentId={a.id}
                      studentUUID={session.studentUUID}
                      courseSlug={slug}
                      lessonId={lessonId}
                      existingUrl={submission?.link_url ?? null}
                    />
                  </div>
                );
              },
            )}
          </div>
        </section>
      )}

      {/* Quizzes */}
      {lesson.lessonQuizzes.length > 0 && (
        <section className="mt-10 border-t pt-8">
          <h2 className="text-xl font-semibold mb-5">🧠 แบบทดสอบ</h2>
          <div className="space-y-4">
            {lesson.lessonQuizzes.map(
              async (lq: {
                id: number;
                quiz: {
                  id: number;
                  title: string;
                  description: string | null;
                  max_attempts: number | null;
                  questions: {
                    id: number;
                    question: string;
                    points: number;
                    order_index: number;
                    choices: { id: number; text: string }[];
                  }[];
                };
              }) => {
                const attempts = await prisma.quizAttempt.findMany({
                  where: { quizId: lq.quiz.id, studentId: session.studentUUID },
                  select: {
                    score: true,
                    total_points: true,
                    attempt_no: true,
                    submitted_at: true,
                  },
                  orderBy: { attempt_no: "desc" },
                });
                return (
                  <div key={lq.id} id={`quiz-${lq.id}`} className="scroll-mt-8">
                    <QuizWidget
                      lessonQuizId={lq.id}
                      quiz={lq.quiz}
                      studentId={session.studentUUID}
                      courseSlug={slug}
                      lessonId={lessonId}
                      previousAttempts={attempts}
                    />
                  </div>
                );
              },
            )}
          </div>
        </section>
      )}
    </article>
  );
}
