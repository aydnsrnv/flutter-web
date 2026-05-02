import { Ghost } from "iconsax-react";

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="grid place-items-center rounded-full bg-jobly-soft" style={{ width: 88, height: 88 }}>
        <Ghost size={44} variant="Linear" color="currentColor" className="text-primary" />
      </div>
      <p className="text-center text-[15px] font-medium text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
