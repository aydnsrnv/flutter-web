// ============================================================================
// Jobly UI Design System — Merkezi Export Noktası
// ============================================================================
// Flutter'daki widget kit mantığının karşılığı:
// Tüm UI bileşenleri tek noktadan import edilir.
//
// Kullanım:
//   import { Button, Input, Card, Badge, Avatar, Dialog, Skeleton } from "@/components/ui";
// ============================================================================

// ── Primitive / Temel Bileşenler ──
export { Button, buttonVariants } from "./button";
export { Input } from "./input";
export { Select } from "./select";
export { Textarea } from "./textarea";
export { Label } from "./label";
export { Separator } from "./separator";

// ── Görsel / Layout Bileşenleri ──
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card";
export { Badge, badgeVariants } from "./badge";
export { Avatar, AvatarImage, AvatarFallback } from "./avatar";

// ── Overlay / Modal Bileşenleri ──
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./dialog";

// ── Feedback / State Bileşenleri ──
export { Skeleton } from "./skeleton";
export { Alert, AlertTitle, AlertDescription } from "./alert";

// ── Özel / Jobly-Spesifik Bileşenler ──
export { ManatIcon } from "./manat-icon";
export { IconButton } from "./icon-button";
export { PremiumBadge } from "./premium-badge";
export { EmptyState } from "../empty-state";
export { PageShimmer } from "../page-shimmer";
export { SectionHeader } from "../section-header";
