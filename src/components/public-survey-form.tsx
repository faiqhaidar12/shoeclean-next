"use client";

import { FormEvent, useState } from "react";
import type { PublicSurveyResponse } from "@/lib/api";

type Props = {
  survey: PublicSurveyResponse["survey"];
};

export function PublicSurveyForm({ survey }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [respondentName, setRespondentName] = useState("");
  const [respondentPhone, setRespondentPhone] = useState("");
  const [respondentType, setRespondentType] = useState<"owner" | "customer">(
    survey.type === "outlet" ? "customer" : "customer",
  );
  const [answers, setAnswers] = useState<Record<number, string | number>>(
    Object.fromEntries(
      survey.questions.map((question) => [
        question.id,
        question.type === "rating" ? 0 : "",
      ]),
    ),
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function nextStep() {
    if (step === 1 && !respondentName.trim()) {
      setError("Nama wajib diisi.");
      return;
    }

    setError("");
    setStep((current) => (current === 1 ? 2 : 3));
  }

  function prevStep() {
    setError("");
    setStep((current) => (current === 2 ? 1 : 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    for (const question of survey.questions) {
      const answer = answers[question.id];
      if (question.type === "rating" && (!answer || Number(answer) < 1)) {
        setError("Semua rating wajib diisi.");
        return;
      }
      if (question.type === "choice" && !String(answer ?? "").trim()) {
        setError("Semua pilihan wajib diisi.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/surveys/public/${survey.slug}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          respondent_name: respondentName,
          respondent_phone: respondentPhone,
          respondent_type: respondentType,
          answers,
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
        errors?: Record<string, string[]>;
      };

      if (!response.ok) {
        const firstError = payload.errors
          ? Object.values(payload.errors)[0]?.[0]
          : null;
        setError(firstError ?? payload.message ?? "Jawaban survey gagal dikirim.");
        return;
      }

      setStep(3);
    } catch {
      setError("Terjadi kendala saat mengirim jawaban survey.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === 3) {
    return (
      <section className="section-dark p-5 sm:p-7">
        <p className="section-label-dark">Terima kasih</p>
        <h2 className="mt-3 text-3xl font-semibold">
          Jawaban Anda sudah kami simpan.
        </h2>
        <p className="subcopy-dark mt-4">
          Feedback Anda membantu kami meningkatkan kualitas layanan di outlet ini.
        </p>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="section-block p-5 sm:p-6">
      {step === 1 ? (
        <div className="space-y-4">
          <div>
            <p className="section-label">Langkah 1</p>
            <h2 className="mt-2 text-2xl font-semibold">Kenalan dulu sebentar.</h2>
          </div>
          <div className="space-y-2">
            <label htmlFor="respondent-name" className="section-label block">
              Nama
            </label>
            <input
              id="respondent-name"
              value={respondentName}
              onChange={(event) => setRespondentName(event.target.value)}
              placeholder="Nama Anda"
              className="field-soft"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="respondent-phone" className="section-label block">
              Nomor HP
            </label>
            <input
              id="respondent-phone"
              value={respondentPhone}
              onChange={(event) => setRespondentPhone(event.target.value)}
              placeholder="Opsional"
              className="field-soft"
            />
          </div>
          {survey.type === "platform" ? (
            <div className="space-y-2">
              <label htmlFor="respondent-type" className="section-label block">
                Tipe responden
              </label>
              <select
                id="respondent-type"
                value={respondentType}
                onChange={(event) =>
                  setRespondentType(event.target.value as "owner" | "customer")
                }
                className="field-soft"
              >
                <option value="customer">Customer</option>
                <option value="owner">Owner</option>
              </select>
            </div>
          ) : null}
          <button type="button" onClick={nextStep} className="btn-primary w-full sm:w-auto">
            Lanjut ke pertanyaan
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-5">
          <div>
            <p className="section-label">Langkah 2</p>
            <h2 className="mt-2 text-2xl font-semibold">Isi jawaban Anda.</h2>
          </div>

          {survey.questions.map((question, index) => (
            <div key={question.id} className="soft-panel p-4">
              <p className="font-semibold text-foreground">
                {index + 1}. {question.question}
              </p>

              {question.type === "rating" ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setAnswers((current) => ({ ...current, [question.id]: rating }))}
                      className={`h-11 w-11 rounded-full text-sm font-semibold transition ${
                        Number(answers[question.id]) === rating
                          ? "bg-accent text-white"
                          : "bg-white text-foreground"
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              ) : null}

              {question.type === "text" ? (
                <textarea
                  value={String(answers[question.id] ?? "")}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: event.target.value,
                    }))
                  }
                  placeholder="Tulis jawaban Anda"
                  className="field-soft mt-4 min-h-[120px]"
                />
              ) : null}

              {question.type === "choice" ? (
                <div className="mt-4 space-y-2">
                  {question.options.map((option) => (
                    <label key={option} className="soft-panel flex items-center gap-3 p-3">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        checked={String(answers[question.id] ?? "") === option}
                        onChange={() =>
                          setAnswers((current) => ({ ...current, [question.id]: option }))
                        }
                      />
                      <span className="text-sm text-foreground">{option}</span>
                    </label>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          {error ? (
            <div className="rounded-[1.25rem] border border-[#f7b9ab] bg-[#fff1ee] px-4 py-4 text-sm text-[#9a3b2b]">
              {error}
            </div>
          ) : null}

          <div className="mobile-stack">
            <button type="button" onClick={prevStep} className="btn-secondary w-full sm:w-auto">
              Kembali
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto">
              {isSubmitting ? "Mengirim..." : "Kirim jawaban"}
            </button>
          </div>
        </div>
      ) : null}

      {error && step === 1 ? (
        <div className="mt-4 rounded-[1.25rem] border border-[#f7b9ab] bg-[#fff1ee] px-4 py-4 text-sm text-[#9a3b2b]">
          {error}
        </div>
      ) : null}
    </form>
  );
}
