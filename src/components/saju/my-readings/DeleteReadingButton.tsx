"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteReading } from "@/services/saju/chat-actions";

interface DeleteReadingButtonProps {
  readingId: string;
  readingName: string;
}

export default function DeleteReadingButton({
  readingId,
  readingName,
}: DeleteReadingButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (isPending) return;
    const confirmed = window.confirm(
      `${readingName} 분석 내역을 삭제할까?\n삭제한 내역은 다시 복구할 수 없어.`,
    );

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteReading(readingId);
      if (result.error) {
        window.alert(result.error);
        return;
      }

      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      aria-label={`${readingName} 분석 내역 삭제`}
      className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-red-100 text-red-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
      title="분석 내역 삭제"
    >
      <Trash2 aria-hidden="true" className="h-4 w-4" />
      <span className="sr-only">{isPending ? "삭제 중" : "삭제"}</span>
    </button>
  );
}
