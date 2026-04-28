import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  icon,
  color = "primary",
}: {
  title: string;
  value: number | string;
  icon: string;
  color?: "primary" | "success" | "warning" | "danger";
}) {
  const colorMap = {
    primary: "bg-[rgba(36,91,235,0.10)] text-[#245beb]",
    success: "bg-[rgba(34,197,94,0.10)] text-[#16a34a]",
    warning: "bg-[rgba(245,158,11,0.10)] text-[#d97706]",
    danger: "bg-[rgba(239,68,68,0.10)] text-[#dc2626]",
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
            {title}
          </p>
          <p className="mt-1 text-2xl md:text-3xl font-bold" style={{ color: "var(--foreground)" }}>
            {value}
          </p>
        </div>
        <div
          className={cn(
            "grid h-11 w-11 place-items-center rounded-xl text-xl",
            colorMap[color]
          )}
        >
          <i className={icon} />
        </div>
      </div>
    </div>
  );
}
