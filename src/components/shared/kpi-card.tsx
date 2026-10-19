import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger" | "info";
  badge?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  badge,
}: KPICardProps) {
  const variantStyles = {
    default: {
      card: "border-slate-200/80 bg-white hover:border-slate-300",
      iconBg: "bg-slate-100 text-slate-700",
    },
    success: {
      card: "border-emerald-200/70 bg-gradient-to-br from-white to-emerald-50/30 hover:border-emerald-300",
      iconBg: "bg-emerald-100 text-emerald-800",
    },
    warning: {
      card: "border-amber-200/70 bg-gradient-to-br from-white to-amber-50/30 hover:border-amber-300",
      iconBg: "bg-amber-100 text-amber-800",
    },
    danger: {
      card: "border-rose-200/70 bg-gradient-to-br from-white to-rose-50/30 hover:border-rose-300",
      iconBg: "bg-rose-100 text-rose-800",
    },
    info: {
      card: "border-sky-200/70 bg-gradient-to-br from-white to-sky-50/30 hover:border-sky-300",
      iconBg: "bg-sky-100 text-sky-800",
    },
  };

  const currentStyle = variantStyles[variant];

  return (
    <div
      className={cn(
        "p-4 rounded-xl border shadow-xs transition-all duration-200 flex flex-col justify-between group",
        currentStyle.card
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider line-clamp-1">
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          {badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
              {badge}
            </span>
          )}
          <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-105", currentStyle.iconBg)}>
            <Icon className="h-4 w-4 stroke-[2.2]" />
          </div>
        </div>
      </div>

      <div>
        <div className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            {trend && (
              <span
                className={cn(
                  "font-semibold text-[11px] px-1 py-0.2 rounded",
                  trend.isPositive ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
                )}
              >
                {trend.value}
              </span>
            )}
            {subtitle && <span className="line-clamp-1">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
