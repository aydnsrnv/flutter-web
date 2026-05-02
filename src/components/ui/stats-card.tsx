"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type TrendDirection = "up" | "down" | "flat";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: TrendDirection;
    value: string;
  };
  icon?: React.ReactNode;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: {
    card: "bg-card border-border",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  primary: {
    card: "bg-primary/5 border-primary/20",
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
  },
  success: {
    card: "bg-emerald-500/5 border-emerald-500/20",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-600",
  },
  warning: {
    card: "bg-amber-500/5 border-amber-500/20",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-600",
  },
  danger: {
    card: "bg-red-500/5 border-red-500/20",
    iconBg: "bg-red-500/15",
    iconColor: "text-red-600",
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  className,
  variant = "default",
}: StatsCardProps) {
  const styles = variantStyles[variant];

  const trendIcon =
    trend?.direction === "up" ? (
      <TrendingUp size={14} />
    ) : trend?.direction === "down" ? (
      <TrendingDown size={14} />
    ) : (
      <Minus size={14} />
    );

  const trendColor =
    trend?.direction === "up"
      ? "text-emerald-600"
      : trend?.direction === "down"
        ? "text-red-500"
        : "text-muted-foreground";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-4",
        styles.card,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        {icon && (
          <div className={cn("grid h-9 w-9 place-items-center rounded-xl", styles.iconBg)}>
            <span className={styles.iconColor}>{icon}</span>
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            {trend && (
              <span className={cn("inline-flex items-center gap-0.5 font-semibold", trendColor)}>
                {trendIcon}
                {trend.value}
              </span>
            )}
            {subtitle && (
              <span className="text-muted-foreground">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
