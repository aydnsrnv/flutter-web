import { Ghost } from "iconsax-react";

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div
        className="grid place-items-center rounded-full"
        style={{
          width: 88,
          height: 88,
          backgroundColor: "rgba(36, 91, 235, 0.10)",
        }}
      >
        <Ghost size={44} variant="Linear" color="var(--jobly-main, #245BEB)" />
      </div>
      <p
        className="text-center text-[15px] font-medium"
        style={{ color: "var(--muted-foreground)" }}
      >
        {label}
      </p>
    </div>
  );
}
