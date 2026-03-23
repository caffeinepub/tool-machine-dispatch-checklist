interface Props {
  status: "pending" | "completed" | "in-progress";
  className?: string;
}

export default function StatusBadge({ status, className = "" }: Props) {
  const styles = {
    completed: "bg-success/15 text-success border-success/30",
    pending: "bg-warning/15 text-warning border-warning/30",
    "in-progress": "bg-primary/15 text-primary border-primary/30",
  };
  const labels = {
    completed: "✓ Completed",
    pending: "⏳ Pending",
    "in-progress": "▶ In Progress",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]} ${className}`}
    >
      {labels[status]}
    </span>
  );
}
