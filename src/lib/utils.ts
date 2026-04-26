import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(input: unknown) {
  const raw = String(input ?? "").trim();
  if (!raw) return "";

  const transliterated = raw
    .replace(/[ıİ]/g, (m) => (m === "ı" ? "i" : "I"))
    .replace(/[şŞ]/g, (m) => (m === "ş" ? "s" : "S"))
    .replace(/[çÇ]/g, (m) => (m === "ç" ? "c" : "C"))
    .replace(/[ğĞ]/g, (m) => (m === "ğ" ? "g" : "G"))
    .replace(/[öÖ]/g, (m) => (m === "ö" ? "o" : "O"))
    .replace(/[üÜ]/g, (m) => (m === "ü" ? "u" : "U"))
    .replace(/[əƏ]/g, (m) => (m === "ə" ? "e" : "E"))
    .replace(/[xX]/g, (m) => (m === "x" ? "x" : "X"));

  const stripped = transliterated
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return stripped
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
