"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { useI18n } from "@/lib/i18n/client";
import { Sparkles, X, Loader2, CheckCircle2, AlertCircle, Lightbulb, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchResult {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface AiMatchModalProps {
  open: boolean;
  onClose: () => void;
  authUserId?: string | null;
  authUserType: string;
  targetData: Record<string, any>;
  targetType: "job" | "resume";
}

type SelectableItem = {
  id: string;
  title: string;
  subtitle?: string;
};

export function AiMatchModal({
  open,
  onClose,
  authUserId,
  authUserType,
  targetData,
  targetType,
}: AiMatchModalProps) {
  const { t } = useI18n();
  const supabase = useMemo(() => createClient(), []);

  const [step, setStep] = useState<"select" | "loading" | "result" | "error">("select");
  const [items, setItems] = useState<SelectableItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [fetching, setFetching] = useState(false);

  const isEmployer = authUserType === "employer";

  // Fetch employer jobs or candidate resumes
  useEffect(() => {
    if (!open || !authUserId) return;

    const fetchItems = async () => {
      setFetching(true);
      try {
        if (isEmployer) {
          const { data, error } = await supabase
            .from("jobs")
            .select("id, title, company_name, status")
            .eq("creator_id", authUserId)
            .eq("status", true)
            .order("create_time", { ascending: false })
            .limit(50);
          if (error) throw error;
          setItems(
            (data ?? []).map((j: any) => ({
              id: String(j.id),
              title: j.title ?? "Vakansiya",
              subtitle: j.company_name ?? "",
            }))
          );
        } else {
          const { data, error } = await supabase
            .from("resumes")
            .select("id, desired_position, full_name, status")
            .eq("user_id", authUserId)
            .eq("status", true)
            .order("create_time", { ascending: false })
            .limit(50);
          if (error) throw error;
          setItems(
            (data ?? []).map((r: any) => ({
              id: String(r.id),
              title: r.desired_position ?? "CV",
              subtitle: r.full_name ?? "",
            }))
          );
        }
      } catch {
        setItems([]);
      } finally {
        setFetching(false);
      }
    };

    fetchItems();
    setStep("select");
    setSelectedId(null);
    setResult(null);
    setErrorMsg("");
  }, [open, authUserId, isEmployer, supabase]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedId) return;
    setStep("loading");

    try {
      // Fetch full data for the selected item
      let jobData: Record<string, any>;
      let resumeData: Record<string, any>;

      if (isEmployer) {
        // Employer: targetData = resume, selected = job
        resumeData = targetData;
        const { data, error } = await supabase
          .from("jobs")
          .select(
            "id, title, company_name, job_type, category_name, city, experience, education, min_salary, max_salary, gender, min_age, max_age, about, request"
          )
          .eq("id", selectedId)
          .maybeSingle();
        if (error || !data) throw new Error("İş ilanı bulunamadı");
        jobData = data;
      } else {
        // Candidate: targetData = job, selected = resume
        jobData = targetData;
        const { data, error } = await supabase
          .from("resumes")
          .select(
            "id, full_name, desired_position, city, education, experience, desired_salary, about"
          )
          .eq("id", selectedId)
          .maybeSingle();
        if (error || !data) throw new Error("CV bulunamadı");
        resumeData = data;
      }

      const res = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobData, resumeData }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error ?? "AI analizi başarısız");
      }

      setResult(json);
      setStep("result");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Bilinmeyen hata");
      setStep("error");
    }
  }, [selectedId, isEmployer, targetData, supabase]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[85vh] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">{t("ai_match_title") ?? "AI Uyum Analizi"}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === "select" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                {isEmployer
                  ? (t("ai_match_select_job") ?? "Karşılaştırmak istediğiniz iş ilanını seçin:")
                  : (t("ai_match_select_resume") ?? "Karşılaştırmak istediğiniz CV'nizi seçin:")}
              </p>

              {fetching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : items.length === 0 ? (
                <div className="rounded-xl border border-border bg-muted/50 py-8 text-center text-sm text-muted-foreground">
                  {isEmployer
                    ? (t("ai_match_no_jobs") ?? "Aktif iş ilanınız bulunmuyor.")
                    : (t("ai_match_no_resumes") ?? "Aktif CV'niz bulunmuyor.")}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                        selectedId === item.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        selectedId === item.id
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30"
                      )}>
                        {selectedId === item.id && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-foreground">{item.title}</div>
                        {item.subtitle ? (
                          <div className="truncate text-xs text-muted-foreground">{item.subtitle}</div>
                        ) : null}
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!selectedId || fetching}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {t("ai_match_analyze") ?? "Analiz Et"}
              </button>
            </div>
          )}

          {step === "loading" && (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <div className="relative h-16 w-16">
                <div className="ai-fab-ring absolute inset-0 h-full w-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="ai-fab-icon h-7 w-7" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground animate-pulse">
                {t("ai_match_loading") ?? "AI analiz ediyor..."}
              </p>
            </div>
          )}

          {step === "error" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-center text-sm text-destructive">{errorMsg}</p>
              <button
                type="button"
                onClick={() => setStep("select")}
                className="rounded-[var(--radius-button)] bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/80"
              >
                {t("ai_match_try_again") ?? "Tekrar Dene"}
              </button>
            </div>
          )}

          {step === "result" && result && (
            <div className="flex flex-col gap-5">
              {/* Score */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-28 w-28">
                  <svg className="ai-score-ring h-full w-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="var(--muted)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="var(--jobly-main)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 * (1 - result.score / 100)}
                      className="ai-score-ring-circle"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{result.score}%</span>
                    <span className="text-xs text-muted-foreground">{t("ai_match_score") ?? "Uyum"}</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {result.summary ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm leading-relaxed text-foreground">{result.summary}</p>
                </div>
              ) : null}

              {/* Strengths */}
              {result.strengths.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {t("ai_match_strengths") ?? "Güçlü Taraflar"}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* Weaknesses */}
              {result.weaknesses.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                      {t("ai_match_weaknesses") ?? "Gelişim Alanları"}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {result.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* Suggestions */}
              {result.suggestions.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-primary">
                      {t("ai_match_suggestions") ?? "Öneriler"}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* Retry */}
              <button
                type="button"
                onClick={() => {
                  setStep("select");
                  setSelectedId(null);
                }}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-border bg-card text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                {t("ai_match_new_analysis") ?? "Yeni Analiz"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
