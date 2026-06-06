import { Plane } from "lucide-react";

export function Brand({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-full bg-coral text-paper -rotate-12 shadow-sm">
        <Plane className="h-4 w-4 rotate-45" strokeWidth={2.5} />
      </span>
      <span className="display text-2xl font-semibold tracking-tight text-ink">
        Voya
      </span>
    </div>
  );
}
