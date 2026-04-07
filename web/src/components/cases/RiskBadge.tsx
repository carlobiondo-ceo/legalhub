import type { RiskLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const riskConfig: Record<RiskLevel, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-green-100 text-green-700" },
  medium: { label: "Medium", className: "bg-yellow-100 text-yellow-700" },
  high: { label: "High", className: "bg-orange-100 text-orange-700" },
  critical: { label: "Critical", className: "bg-red-100 text-red-700" },
};

interface RiskBadgeProps {
  level: RiskLevel | null;
}

export default function RiskBadge({ level }: RiskBadgeProps) {
  if (!level) {
    return <span className="text-gray-400">&mdash;</span>;
  }

  const config = riskConfig[level];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
