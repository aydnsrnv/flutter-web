"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string
  label?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "ghost" | "card"
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
}

const variantClasses = {
  default:
    "rounded-full bg-card text-foreground hover:bg-muted transition-colors",
  ghost:
    "rounded-full text-foreground hover:bg-muted transition-colors",
  card:
    "rounded-full bg-card border border-border text-foreground hover:bg-muted transition-colors",
}

function IconButton({
  className,
  href,
  label,
  size = "md",
  variant = "default",
  children,
  ...props
}: IconButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center",
    sizeClasses[size],
    variantClasses[variant],
    className
  )

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={label}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" className={classes} aria-label={label} {...props}>
      {children}
    </button>
  )
}

export { IconButton }
