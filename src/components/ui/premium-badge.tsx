"use client"

import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n/client"

interface PremiumBadgeProps {
  className?: string
  showIcon?: boolean
}

function PremiumBadge({ className, showIcon = true }: PremiumBadgeProps) {
  const { t } = useI18n()

  return (
    <div
      data-slot="premium-badge"
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1",
        "bg-primary text-primary-foreground",
        className
      )}
    >
      <span className="text-[10px] font-bold tracking-wider uppercase">
        {t("premium_tag")}
      </span>
      {showIcon ? (
        <i className="ri-vip-crown-fill text-[10px]" />
      ) : null}
    </div>
  )
}

export { PremiumBadge }
