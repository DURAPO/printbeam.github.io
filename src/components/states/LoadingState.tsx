import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  variant?: "spinner" | "skeleton";
  rows?: number;
}

export default function LoadingState({ message = "Loading…", variant = "spinner", rows = 3 }: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div className="space-y-3 py-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="size-8 rounded-md bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 rounded bg-muted" />
              <div className="h-2.5 w-1/2 rounded bg-muted/60" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <Loader2 className="size-6 text-success animate-spin mb-3" />
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}
