"use client";

import { Sparkles } from "lucide-react";
import { AiMatchModal } from "./ai-match-modal";
import { useState } from "react";

interface AiMatchFabProps {
  authUserId?: string | null;
  authUserType?: string | null;
  targetData: Record<string, any>;
  targetType: "job" | "resume";
  className?: string;
}

export function AiMatchFab({
  authUserId,
  authUserType,
  targetData,
  targetType,
  className,
}: AiMatchFabProps) {
  const [open, setOpen] = useState(false);

  const userType = (authUserType ?? "").toLowerCase();
  const isEmployer = userType === "employer";
  const isCandidate = userType === "candidate";

  // Employer sadece resume detayında görsün
  // Candidate sadece job detayında görsün
  const shouldShow = false;

  if (!shouldShow) return null;

  return (
    <>
      <div className={className ?? "z-[90] fixed bottom-[156px] right-4 lg:bottom-[120px] lg:right-6"}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ai-fab-ring flex h-14 w-14 items-center justify-center"
          aria-label="AI Uyum Analizi"
          title="AI Uyum Analizi"
        >
          <Sparkles className="ai-fab-icon h-7 w-7" />
        </button>
      </div>

      <AiMatchModal
        open={open}
        onClose={() => setOpen(false)}
        authUserId={authUserId}
        authUserType={userType}
        targetData={targetData}
        targetType={targetType}
      />
    </>
  );
}
