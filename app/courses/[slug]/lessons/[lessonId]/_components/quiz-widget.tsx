"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  RefreshCw,
  History,
} from "lucide-react";
import { submitQuiz, QuizSubmitResult } from "../quiz-actions";

type Choice = { id: number; text: string };
type Question = {
  id: number;
  question: string;
  points: number;
  order_index: number;
  choices: Choice[];
};
type Attempt = {
  score: number | null;
  total_points: number | null;
  attempt_no: number;
  submitted_at: Date | null;
};

export function QuizWidget({
  lessonQuizId,
  quiz,
  studentId,
  courseSlug,
  lessonId,
  previousAttempts,
}: {
  lessonQuizId: number;
  quiz: {
    id: number;
    title: string;
    description: string | null;
    max_attempts: number | null;
    questions: Question[];
  };
  studentId: string;
  courseSlug: string;
  lessonId: number;
  previousAttempts: Attempt[];
}) {
  const submittedCount = previousAttempts.filter((a) => a.submitted_at).length;
  const canAttempt =
    quiz.max_attempts === null || submittedCount < quiz.max_attempts;
  const bestAttempt = previousAttempts.reduce<Attempt | null>((best, a) => {
    if (!a.submitted_at) return best;
    if (!best || (a.score ?? 0) > (best.score ?? 0)) return a;
    return best;
  }, null);

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);

  const totalPoints = quiz.questions.reduce((s, q) => s + q.points, 0);
  const allAnswered = quiz.questions.every((q) => answers[q.id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await submitQuiz(
      quiz.id,
      studentId,
      courseSlug,
      lessonId,
      answers,
    );
    setResult(res);
    setSubmitting(false);
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
    setStarted(true);
  };

  // Result screen
  if (result?.ok) {
    const pct = Math.round((result.score / result.totalPoints) * 100);
    return (
      <div className="border rounded-xl p-6 bg-background">
        <div className="text-center py-4">
          <Trophy size={40} className="mx-auto mb-3 text-yellow-500" />
          <h3 className="text-xl font-bold mb-1">ผลการทำ Quiz</h3>
          <p className="text-muted-foreground text-sm mb-4">{quiz.title}</p>
          <div className="inline-flex items-center gap-2 bg-muted rounded-full px-6 py-3 mb-3">
            <span className="text-3xl font-bold">{result.score}</span>
            <span className="text-muted-foreground">
              / {result.totalPoints} คะแนน
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            ตอบถูก {result.correct} / {result.total} ข้อ ({pct}%)
          </p>
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
            <div
              className={`h-full rounded-full transition-all ${pct >= 70 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        {previousAttempts.length > 0 && (
          <div className="mt-4 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
              <History size={13} /> ประวัติการสอบทั้งหมด
            </div>
            <div className="space-y-1.5">
              {[...previousAttempts]
                .sort((a, b) => a.attempt_no - b.attempt_no)
                .map((a) => {
                  const aPct =
                    a.total_points && a.total_points > 0
                      ? Math.round(((a.score ?? 0) / a.total_points) * 100)
                      : 0;
                  return (
                    <div
                      key={a.attempt_no}
                      className="flex items-center justify-between text-sm px-3 py-2 rounded-md bg-muted/40 border"
                    >
                      <span className="text-muted-foreground">
                        ครั้งที่ {a.attempt_no}
                        {a.submitted_at && (
                          <span className="ml-2 text-xs">
                            (
                            {new Date(a.submitted_at).toLocaleDateString(
                              "th-TH",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                            )
                          </span>
                        )}
                      </span>
                      <span
                        className={`font-medium ${
                          aPct >= 70
                            ? "text-green-600"
                            : aPct >= 50
                              ? "text-yellow-600"
                              : "text-red-500"
                        }`}
                      >
                        {a.score ?? 0} / {a.total_points ?? 0} คะแนน ({aPct}%)
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
        {canAttempt &&
          quiz.max_attempts !== null &&
          submittedCount < quiz.max_attempts && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw size={14} className="mr-1.5" /> ทำอีกครั้ง ( ใช้ไป{" "}
                {submittedCount} / {quiz.max_attempts} ครั้ง)
              </Button>
            </div>
          )}
      </div>
    );
  }

  if (result && !result.ok) {
    return (
      <div className="border rounded-xl p-5 bg-background">
        <div className="flex items-center gap-2 text-destructive mb-2">
          <XCircle size={18} />
          <span className="font-medium">{result.error}</span>
        </div>
        {bestAttempt && (
          <p className="text-sm text-muted-foreground">
            คะแนนดีที่สุดของคุณ: {bestAttempt.score} /{" "}
            {bestAttempt.total_points} คะแนน
          </p>
        )}
      </div>
    );
  }

  // Intro screen
  if (!started) {
    return (
      <div className="border rounded-xl p-5 bg-background">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-semibold">{quiz.title}</h3>
            {quiz.description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {quiz.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
          <span>{quiz.questions.length} คำถาม</span>
          <span>{totalPoints} คะแนน</span>
          {quiz.max_attempts !== null && (
            <span>
              ทำได้ {quiz.max_attempts} ครั้ง (ทำไปแล้ว {submittedCount} ครั้ง)
            </span>
          )}
        </div>
        {bestAttempt && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/30 rounded-md px-3 py-2 mb-3">
            <CheckCircle2 size={14} />
            คะแนนดีที่สุด: {bestAttempt.score} / {bestAttempt.total_points}{" "}
            คะแนน
          </div>
        )}
        {previousAttempts.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
              <History size={13} /> ประวัติการสอบ
            </div>
            <div className="space-y-1.5">
              {[...previousAttempts]
                .sort((a, b) => a.attempt_no - b.attempt_no)
                .map((a) => {
                  const pct =
                    a.total_points && a.total_points > 0
                      ? Math.round(((a.score ?? 0) / a.total_points) * 100)
                      : 0;
                  return (
                    <div
                      key={a.attempt_no}
                      className="flex items-center justify-between text-sm px-3 py-2 rounded-md bg-muted/40 border"
                    >
                      <span className="text-muted-foreground">
                        ครั้งที่ {a.attempt_no}
                        {a.submitted_at && (
                          <span className="ml-2 text-xs">
                            (
                            {new Date(a.submitted_at).toLocaleDateString(
                              "th-TH",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                            )
                          </span>
                        )}
                      </span>
                      <span
                        className={`font-medium ${
                          pct >= 70
                            ? "text-green-600"
                            : pct >= 50
                              ? "text-yellow-600"
                              : "text-red-500"
                        }`}
                      >
                        {a.score ?? 0} / {a.total_points ?? 0} คะแนน ({pct}%)
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
        {canAttempt ? (
          <Button size="sm" onClick={() => setStarted(true)}>
            {submittedCount > 0 ? "ทำอีกครั้ง" : "เริ่มทำ Quiz"}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            ใช้ครบจำนวนครั้งที่อนุญาตแล้ว
          </p>
        )}
      </div>
    );
  }

  // Quiz form
  return (
    <div className="border rounded-xl bg-background overflow-hidden">
      <div className="px-5 py-4 border-b bg-muted/30 flex items-center justify-between">
        <h3 className="font-semibold">{quiz.title}</h3>
        <span className="text-xs text-muted-foreground">
          {Object.keys(answers).length} / {quiz.questions.length} ข้อ
        </span>
      </div>
      <div className="p-5 space-y-6">
        {quiz.questions.map((q, idx) => (
          <div key={q.id}>
            <p className="text-sm font-medium mb-2">
              <span className="text-muted-foreground mr-1.5">{idx + 1}.</span>
              {q.question}
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                ({q.points} คะแนน)
              </span>
            </p>
            <ul className="space-y-1.5">
              {q.choices.map((c) => {
                const selected = answers[q.id] === c.id;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [q.id]: c.id }))
                      }
                      className={`w-full text-left text-sm px-4 py-2.5 rounded-lg border transition-colors ${
                        selected
                          ? "bg-primary/10 border-primary/40 text-primary font-medium"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      {c.text}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="px-5 py-4 border-t flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setStarted(false);
            setAnswers({});
          }}
        >
          ยกเลิก
        </Button>
        <Button
          size="sm"
          disabled={!allAnswered || submitting}
          onClick={handleSubmit}
        >
          {submitting
            ? "กำลังส่ง..."
            : `ส่งคำตอบ (${Object.keys(answers).length}/${quiz.questions.length})`}
        </Button>
      </div>
    </div>
  );
}
