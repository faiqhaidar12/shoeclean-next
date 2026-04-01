"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { setDashboardFlash } from "@/lib/dashboard-flash";

type OutletOption = {
  id: number;
  name: string;
  slug: string;
};

type QuestionDraft = {
  question: string;
  type: "rating" | "text" | "choice";
  options: string[];
};

type Props = {
  outlets: OutletOption[];
};

export function SurveyBuilderForm({ outlets }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [outletId, setOutletId] = useState(String(outlets[0]?.id ?? ""));
  const [questions, setQuestions] = useState<QuestionDraft[]>([{ question: "", type: "rating", options: ["", ""] }]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateQuestion(index: number, patch: Partial<QuestionDraft>) {
    setQuestions((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function addQuestion() {
    setQuestions((current) => [...current, { question: "", type: "rating", options: ["", ""] }]);
  }

  function removeQuestion(index: number) {
    setQuestions((current) => {
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      return next.length > 0 ? next : [{ question: "", type: "rating", options: ["", ""] }];
    });
  }

  function addOption(index: number) {
    setQuestions((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, options: [...item.options, ""] } : item)));
  }

  function removeOption(questionIndex: number, optionIndex: number) {
    setQuestions((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== questionIndex) return item;
        const nextOptions = item.options.filter((_, idx) => idx !== optionIndex);
        return { ...item, options: nextOptions.length >= 2 ? nextOptions : ["", ""] };
      }),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          outlet_id: Number(outletId),
          questions,
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
        errors?: Record<string, string[]>;
        survey?: { id: number };
      };

      if (!response.ok) {
        const firstError = payload.errors ? Object.values(payload.errors)[0]?.[0] : null;
        setError(firstError ?? payload.message ?? "Survey gagal dibuat.");
        return;
      }

      setDashboardFlash({
        type: "success",
        title: "Survey berhasil dibuat",
        message: "Anda bisa langsung melihat hasil dan membagikan tautannya ke pelanggan.",
      });
      router.push(`/dashboard/surveys/${payload.survey?.id ?? ""}`);
      router.refresh();
    } catch {
      setError("Terjadi kendala saat membuat survey.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="dashboard-stack">
      <section className="rounded-[2rem] bg-white p-8 shadow-[0_18px_38px_rgba(25,28,30,0.05)] sm:p-10 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Survey builder</p>
            <h2 className="mt-3 text-2xl font-[var(--font-display-sans)] font-extrabold tracking-[-0.03em] text-brand">Susun survey customer baru</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">Gunakan halaman ini untuk merancang survey yang mudah diisi customer dan mudah dibaca owner dari satu dashboard.</p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="space-y-3 sm:col-span-2">
                <label htmlFor="survey-title" className="text-[10px] font-black uppercase tracking-widest text-brand/40">Judul survey</label>
                <input id="survey-title" required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Survey kepuasan layanan outlet" className="field-soft" />
              </div>
              <div className="space-y-3 sm:col-span-2">
                <label htmlFor="survey-description" className="text-[10px] font-black uppercase tracking-widest text-brand/40">Deskripsi</label>
                <textarea id="survey-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Jelaskan tujuan survey ini untuk customer." className="field-soft min-h-[140px]" />
              </div>
              <div className="space-y-3">
                <label htmlFor="survey-outlet" className="text-[10px] font-black uppercase tracking-widest text-brand/40">Outlet</label>
                <select id="survey-outlet" value={outletId} onChange={(event) => setOutletId(event.target.value)} className="field-soft">
                  {outlets.map((outlet) => (
                    <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <aside className="section-dark rounded-[1.75rem] p-6 sm:p-7 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Panduan survey</p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-white/78">
              <p>Mulai dengan pertanyaan rating untuk mendapatkan sinyal cepat tentang kepuasan customer.</p>
              <p>Tambahkan pertanyaan teks saat Anda ingin menangkap konteks, kritik, atau masukan yang lebih mendalam.</p>
              <p>Gunakan pilihan ganda saat owner ingin analisis jawaban yang lebih mudah dibanding teks bebas.</p>
            </div>
          </aside>
        </div>
      </section>

      {questions.map((question, index) => (
        <section key={index} className="section-block p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Pertanyaan {index + 1}</p>
              <h2 className="mt-2 font-[var(--font-display-sans)] text-2xl font-extrabold tracking-tight text-brand">Susun isi pertanyaan</h2>
            </div>
            <button type="button" onClick={() => removeQuestion(index)} className="btn-secondary">Hapus</button>
          </div>

          <div className="mt-5 grid gap-5">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand/40">Teks pertanyaan</label>
              <input required value={question.question} onChange={(event) => updateQuestion(index, { question: event.target.value })} placeholder="Apa yang ingin Anda tanyakan?" className="field-soft" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand/40">Tipe jawaban</label>
              <select
                value={question.type}
                onChange={(event) => updateQuestion(index, { type: event.target.value as QuestionDraft["type"], options: ["", ""] })}
                className="field-soft"
              >
                <option value="rating">Rating 1-5</option>
                <option value="text">Teks bebas</option>
                <option value="choice">Pilihan ganda</option>
              </select>
            </div>

            {question.type === "choice" ? (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand/40">Opsi pilihan</label>
                <div className="dashboard-panel-stack">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex flex-col gap-3 sm:flex-row">
                      <input
                        value={option}
                        onChange={(event) => {
                          const nextOptions = [...question.options];
                          nextOptions[optionIndex] = event.target.value;
                          updateQuestion(index, { options: nextOptions });
                        }}
                        placeholder={`Opsi ${optionIndex + 1}`}
                        className="field-soft"
                      />
                      <button type="button" onClick={() => removeOption(index, optionIndex)} className="btn-secondary">Hapus</button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => addOption(index)} className="btn-accent">Tambah opsi</button>
              </div>
            ) : null}
          </div>
        </section>
      ))}

      {error ? <div className="rounded-[1.25rem] border border-[#f7b9ab] bg-[#fff1ee] px-4 py-4 text-sm text-[#9a3b2b]">{error}</div> : null}

      <div className="mobile-stack">
        <button type="button" onClick={addQuestion} className="btn-accent w-full sm:w-auto">Tambah pertanyaan</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto">{isSubmitting ? "Menyimpan..." : "Simpan survey"}</button>
      </div>
    </form>
  );
}
