import { Button } from "@/components/ui/button";
import type { Dispatch } from "../../types";
import { formatDuration } from "../../utils/formatDuration";

interface Props {
  dispatch: Dispatch;
  onReturn: () => void;
}

const SUMMARY_ROWS = [
  "Dispatch ID",
  "Machine",
  "Worker",
  "Client",
  "Order ID",
  "Completed",
] as const;

export default function SuccessScreen({ dispatch, onReturn }: Props) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const duration = dispatch.completedAt
    ? formatDuration(dispatch.createdAt, dispatch.completedAt)
    : null;

  const rowValues: Record<string, { value: string; mono?: boolean }> = {
    "Dispatch ID": { value: dispatch.id, mono: true },
    Machine: { value: dispatch.machineType },
    Worker: { value: dispatch.workerName },
    Client: { value: dispatch.clientName },
    "Order ID": { value: dispatch.orderId, mono: true },
    Completed: { value: fmt(dispatch.completedAt ?? new Date().toISOString()) },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 max-w-[430px] mx-auto">
      {/* Animated checkmark */}
      <div className="mb-8 animate-checkmark">
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          aria-label="Success checkmark"
          role="img"
        >
          <title>Dispatch verified successfully</title>
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="oklch(0.72 0.19 150 / 0.15)"
            stroke="oklch(0.72 0.19 150)"
            strokeWidth="3"
          />
          <path
            d="M28 50 L44 66 L72 34"
            fill="none"
            stroke="oklch(0.72 0.19 150)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="text-center space-y-2 mb-8 animate-fade-up-delay-1">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Dispatch Verified Successfully!
        </h1>
        <p className="text-muted-foreground text-sm">
          All checklist items have been verified and recorded.
        </p>
        {duration && (
          <p className="text-sm font-semibold text-primary">
            ⏱ Completed in {duration}
          </p>
        )}
      </div>

      {/* Summary card */}
      <div className="card-panel w-full p-5 space-y-3 animate-fade-up-delay-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Dispatch Summary
        </h2>
        {SUMMARY_ROWS.map((label) => {
          const row = rowValues[label];
          return (
            <div key={label} className="flex items-start justify-between gap-4">
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {label}
              </span>
              <span
                className={`text-sm text-right ${
                  row.mono
                    ? "font-mono text-primary/80"
                    : "font-medium text-foreground"
                }`}
              >
                {row.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="w-full space-y-3 mt-8 animate-fade-up-delay-3">
        <Button
          data-ocid="success.primary_button"
          onClick={onReturn}
          className="w-full bg-primary hover:bg-primary/90 font-semibold text-base"
          style={{ height: "52px" }}
        >
          Return to Dashboard
        </Button>
        <Button
          data-ocid="success.secondary_button"
          variant="outline"
          onClick={onReturn}
          className="w-full border-border"
          style={{ height: "52px" }}
        >
          View Record
        </Button>
      </div>

      <footer className="mt-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary/70 hover:text-primary transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
