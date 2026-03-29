"use client";

import { useActionState, useState } from "react";
import {
  submitAssignment,
  deleteSubmission,
  type SubmissionState,
} from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

type Props = {
  assignmentId: number;
  studentUUID: string;
  courseSlug: string;
  lessonId: number;
  existingUrl: string | null;
};

export function SubmissionForm({
  assignmentId,
  studentUUID,
  courseSlug,
  lessonId,
  existingUrl,
}: Props) {
  const boundSubmit = submitAssignment.bind(
    null,
    assignmentId,
    studentUUID,
    courseSlug,
    lessonId,
  );
  const boundDelete = deleteSubmission.bind(
    null,
    assignmentId,
    studentUUID,
    courseSlug,
    lessonId,
  );

  const [state, formAction, pending] = useActionState<
    SubmissionState,
    FormData
  >(boundSubmit, null);
  const [deleteState, deleteFormAction, deletepending] = useActionState<
    SubmissionState,
    FormData
  >(async (_prev: SubmissionState, _fd: FormData) => boundDelete(), null);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const successMsg = state?.success ?? deleteState?.success;
  const errorMsg = state?.error ?? deleteState?.error;

  return (
    <div className="space-y-2">
      {successMsg && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-md">
          {successMsg}
        </p>
      )}
      {errorMsg && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {errorMsg}
        </p>
      )}

      <form action={formAction} className="flex gap-2">
        <Input
          name="link_url"
          defaultValue={existingUrl ?? ""}
          placeholder="https://..."
          required
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "กำลังส่ง..." : existingUrl ? "อัปเดต" : "ส่งงาน"}
        </Button>
      </form>

      {existingUrl && (
        <>
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 size={12} />
              ยกเลิก / ลบงานที่ส่งไว้
            </button>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                ยืนยันลบงานที่ส่งไว้?
              </span>
              <form
                action={deleteFormAction}
                className="flex items-center gap-2"
              >
                <Button
                  type="submit"
                  size="sm"
                  variant="destructive"
                  disabled={deletepending}
                >
                  {deletepending ? "กำลังลบ..." : "ยืนยันลบ"}
                </Button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  ยกเลิก
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
