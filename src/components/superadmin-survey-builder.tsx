"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { setDashboardFlash } from "@/lib/dashboard-flash";

type QuestionDraft = {
  question: string;
  type: "rating" | "text" | "choice";
  options: string[];
};

export function SuperAdminSurveyBuilder() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    { question: "", type: "rating", options: ["", ""] },
  ]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function patchQuestion(index: number, patch: Partial<QuestionDraft>) {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question,
      ),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/superadmin/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, questions }),
      });

      const payload = (await response.json()) as {
        message?: string;
        errors?: Record<string, string[]>;
        survey?: { id: number };
      };

      if (!response.ok) {
        const firstError = payload.errors ? Object.values(payload.errors)[0]?.[0] : null;
        setError(firstError ?? payload.message ?? "Survey platform gagal dibuat.");
        return;
      }

      setDashboardFlash({
        type: "success",
        title: "Survey platform dibuat",
        message: payload.message ?? "Survey platform berhasil dipublikasikan.",
      });
      router.push(`/superadmin/surveys/${payload.survey?.id ?? ""}`);
      router.refresh();
    } catch {
      setError("Terjadi kendala saat membuat survey platform.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="section-block p-6 sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
          Survey platform
        </p>
        <h2 className="mt-3 font-[var(--font-display-sans)] text-3xl font-black tracking-[-0.08em] text-brand">
          Susun pertanyaan untuk semua outlet
        </h2>

        <div className="mt-8 grid gap-5">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
              Judul survey
            </label>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="field-soft"
              placeholder="Survey kebutuhan fitur ShoeClean"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="field-soft min-h-[140px]"
              placeholder="Jelaskan tujuan survey dan siapa yang sebaiknya mengisi."
            />
          </div>
        </div>
      </section>

      {questions.map((question, index) => (
        <section key={`${index}-${question.type}`} className="section-block p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
                Pertanyaan {index + 1}
              </p>
              <h2 className="mt-2 font-[var(--font-display-sans)] text-2xl font-black tracking-[-0.06em] text-brand">
                Detail pertanyaan
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setQuestions((current) => {
                  const next = current.filter((_, questionIndex) => questionIndex !== index);
                  return next.length > 0 ? next : [{ question: "", type: "rating", options: ["", ""] }];
                });
              }}
              className="btn-secondary"
            >
              Hapus
            </button>
          </div>

          <div className="mt-6 grid gap-5">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
                Isi pertanyaan
              </label>
              <input
                required
                value={question.question}
                onChange={(event) => patchQuestion(index, { question: event.target.value })}
                className="field-soft"
                placeholder="Apa yang ingin Anda tanyakan?"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
                Tipe jawaban
              </label>
              <select
                value={question.type}
                onChange={(event) =>
                  patchQuestion(index, {
                    type: event.target.value as QuestionDraft["type"],
                    options: ["", ""],
                  })
                }
                className="field-soft"
              >
                <option value="rating">Rating 1-5</option>
                <option value="text">Teks bebas</option>
                <option value="choice">Pilihan ganda</option>
              </select>
            </div>

            {question.type === "choice" ? (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
                  Opsi pilihan
                </label>
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex flex-col gap-3 sm:flex-row">
                      <input
                        value={option}
                        onChange={(event) => {
                          const nextOptions = [...question.options];
                          nextOptions[optionIndex] = event.target.value;
                          patchQuestion(index, { options: nextOptions });
                        }}
                        className="field-soft"
                        placeholder={`Opsi ${optionIndex + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          patchQuestion(index, {
                            options:
                              question.options.length <= 2
                                ? ["", ""]
                                : question.options.filter(
                                    (_, currentIndex) => currentIndex !== optionIndex,
                                  ),
                          })
                        }
                        className="btn-secondary"
                      >
                        Hapus opsi
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => patchQuestion(index, { options: [...question.options, ""] })}
                  className="btn-accent"
                >
                  Tambah opsi
                </button>
              </div>
            ) : null}
          </div>
        </section>
      ))}

      {error ? (
        <div className="rounded-[1.25rem] border border-[#f7b9ab] bg-[#fff1ee] px-4 py-4 text-sm text-[#9a3b2b]">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            setQuestions((current) => [...current, { question: "", type: "rating", options: ["", ""] }])
          }
          className="btn-accent"
        >
          Tambah pertanyaan
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Menyimpan..." : "Simpan survey platform"}
        </button>
      </div>
    </form>
  );
}
