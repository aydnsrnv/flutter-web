"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMaintenanceStatus, toggleMaintenance } from "../actions";

export default function MaintenancePage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    getMaintenanceStatus().then((s) => {
      setStatus(s);
      setLoading(false);
    });
  }, []);

  async function handleToggle() {
    setToggling(true);
    try {
      const next = !status?.is_on;
      await toggleMaintenance(next);
      const s = await getMaintenanceStatus();
      setStatus(s);
      startTransition(() => router.refresh());
    } finally {
      setToggling(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-32 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  const isOn = !!status?.is_on;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Maintenance Mode
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Toggle maintenance mode to restrict public access
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div
            className="h-20 w-20 rounded-2xl grid place-items-center text-3xl"
            style={{
              backgroundColor: isOn ? "rgba(239,68,68,0.10)" : "rgba(34,197,94,0.10)",
              color: isOn ? "#dc2626" : "#16a34a",
            }}
          >
            <i className={isOn ? "ri-alert-line" : "ri-check-double-line"} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
              {isOn ? "Maintenance Mode is ON" : "Maintenance Mode is OFF"}
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
              {isOn
                ? "Users will see a maintenance page instead of the app."
                : "The app is accessible to all users."}
            </p>
          </div>
          <button
            type="button"
            disabled={toggling}
            onClick={handleToggle}
            className="h-12 px-6 rounded-full text-sm font-semibold text-white transition-opacity"
            style={{
              backgroundColor: isOn ? "#16a34a" : "#dc2626",
              opacity: toggling ? 0.6 : 1,
            }}
          >
            {toggling ? "Updating..." : isOn ? "Turn OFF" : "Turn ON"}
          </button>
        </div>
      </div>
    </div>
  );
}
