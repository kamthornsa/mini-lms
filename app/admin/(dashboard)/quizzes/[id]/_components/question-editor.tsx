"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { createQuestion, updateQuestion, deleteQuestion } from "../../actions";

type Choice = {
  id?: number;
  text: string;
  is_correct: boolean;
  order_index: number;
};
type Question = {
  id: number;
  question: string;
  points: number;
  order_index: number;
  choices: Choice[];
};

function QuestionForm({
  quizId,
  initial,
  onCancel,
}: {
  quizId: number;
  initial?: Question;
  onCancel?: () => void;
}) {
  const defaultChoices = initial?.choices ?? [
    { text: "", is_correct: false, order_index: 0 },
    { text: "", is_correct: false, order_index: 1 },
    { text: "", is_correct: true, order_index: 2 },
    { text: "", is_correct: false, order_index: 3 },
  ];
  const [choices, setChoices] = useState(
    defaultChoices.map((c) => ({ text: c.text, is_correct: c.is_correct })),
  );
  const correctIdx = choices.findIndex((c) => c.is_correct);
  const [correct, setCorrect] = useState(correctIdx >= 0 ? correctIdx : 0);

  const addChoice = () =>
    setChoices((prev) => [...prev, { text: "", is_correct: false }]);
  const removeChoice = (i: number) => {
    if (choices.length <= 2) return;
    setChoices((prev) => prev.filter((_, idx) => idx !== i));
    if (correct >= i && correct > 0) setCorrect((c) => c - 1);
  };

  const action = initial
    ? updateQuestion.bind(null, initial.id, quizId)
    : createQuestion.bind(null, quizId);

  return (
    <form action={action} className="space-y-3">
      <div className="grid grid-cols-[1fr_100px] gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">คำถาม *</label>
          <Input
            name="question"
            defaultValue={initial?.question}
            required
            placeholder="ระบุคำถาม..."
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">คะแนน</label>
          <Input
            name="points"
            type="number"
            min="1"
            defaultValue={initial?.points ?? 1}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium">
          ตัวเลือก (คลิก ✓ เพื่อกำหนดเฉลย)
        </label>
        {choices.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="hidden" name={`choice_${i}`} value={c.text} />
            <button
              type="button"
              onClick={() => setCorrect(i)}
              className={`shrink-0 p-0.5 rounded-full transition-colors ${correct === i ? "text-green-500" : "text-muted-foreground hover:text-foreground"}`}
              title="กำหนดเป็นเฉลย"
            >
              <CheckCircle2 size={18} />
            </button>
            <Input
              value={c.text}
              onChange={(e) =>
                setChoices((prev) =>
                  prev.map((ch, idx) =>
                    idx === i ? { ...ch, text: e.target.value } : ch,
                  ),
                )
              }
              placeholder={`ตัวเลือก ${i + 1}`}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => removeChoice(i)}
              disabled={choices.length <= 2}
              className="text-muted-foreground hover:text-destructive disabled:opacity-30"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <input type="hidden" name="correct" value={correct} />
        <button
          type="button"
          onClick={addChoice}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1"
        >
          <Plus size={12} /> เพิ่มตัวเลือก
        </button>
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            ยกเลิก
          </Button>
        )}
        <Button type="submit" size="sm">
          {initial ? "บันทึก" : "เพิ่มคำถาม"}
        </Button>
      </div>
    </form>
  );
}

export function QuestionEditor({
  quizId,
  questions,
}: {
  quizId: number;
  questions: Question[];
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-3">
      {questions.map((q, idx) => {
        const del = deleteQuestion.bind(null, q.id, quizId);
        return (
          <div key={q.id} className="border rounded-lg p-4 bg-muted/20">
            {editingId === q.id ? (
              <QuestionForm
                quizId={quizId}
                initial={q}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-medium">
                    <span className="text-muted-foreground font-mono mr-2">
                      {idx + 1}.
                    </span>
                    {q.question}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({q.points} คะแนน)
                    </span>
                  </p>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(q.id)}
                    >
                      แก้ไข
                    </Button>
                    <form action={del}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        ลบ
                      </Button>
                    </form>
                  </div>
                </div>
                <ul className="space-y-1">
                  {q.choices.map((c) => (
                    <li
                      key={c.order_index}
                      className={`text-sm flex items-center gap-2 ${c.is_correct ? "text-green-600 font-medium" : "text-muted-foreground"}`}
                    >
                      <CheckCircle2
                        size={13}
                        className={
                          c.is_correct ? "text-green-500" : "opacity-20"
                        }
                      />
                      {c.text}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        );
      })}

      {showAddForm ? (
        <div className="border rounded-lg p-4 bg-background border-dashed">
          <QuestionForm
            quizId={quizId}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full border-2 border-dashed rounded-lg py-3 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={15} /> เพิ่มคำถามใหม่
        </button>
      )}
    </div>
  );
}
