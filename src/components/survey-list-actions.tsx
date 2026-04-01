"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  surveyId: number;
  isActive: boolean;
};

export function SurveyListActions({ surveyId, isActive }: Props) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleToggle() {
    setIsToggling(true);
    try {
      await fetch(`/api/surveys/${surveyId}/toggle`, { method: "PATCH" });
      router.refresh();
    } finally {
      setIsToggling(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Hapus survey ini? Respons yang terkait juga akan ikut terhapus.");
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await fetch(`/api/surveys/${surveyId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mobile-stack">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isToggling}
        className="btn-secondary w-full sm:w-auto"
      >
        {isToggling ? "Memproses..." : isActive ? "Nonaktifkan" : "Aktifkan"}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="btn-secondary w-full sm:w-auto"
      >
        {isDeleting ? "Menghapus..." : "Hapus"}
      </button>
    </div>
  );
}
