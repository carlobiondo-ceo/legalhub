import { cn } from "@/lib/utils";

interface DeadlineStatusProps {
  deadline: string | null;
}

export default function DeadlineStatus({ deadline }: DeadlineStatusProps) {
  if (!deadline) {
    return <span className="text-gray-400">&mdash;</span>;
  }

  const now = new Date();
  const target = new Date(deadline);
  const diffMs = target.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let label: string;
  let colorClass: string;

  if (days < 0) {
    label = `Overdue (${Math.abs(days)}d)`;
    colorClass = "text-red-600";
  } else if (days <= 3) {
    label = `Due Soon (${days}d)`;
    colorClass = "text-yellow-600";
  } else {
    label = `On Track (${days}d)`;
    colorClass = "text-green-600";
  }

  return (
    <span className={cn("text-sm font-medium", colorClass)}>
      {label}
    </span>
  );
}
