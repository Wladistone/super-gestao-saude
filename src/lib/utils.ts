import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "-";
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return "-";
  }
}

export function getDaysRemaining(targetDate: string | Date): number {
  try {
    const d = typeof targetDate === "string" ? parseISO(targetDate) : targetDate;
    const now = new Date();
    return differenceInDays(d, now);
  } catch {
    return 0;
  }
}

export function getVigenciaBadge(daysRemaining: number) {
  if (daysRemaining < 0) {
    return {
      label: `Vencido há ${Math.abs(daysRemaining)} dias`,
      color: "bg-red-100 text-red-800 border-red-300",
      urgency: "critical",
    };
  }
  if (daysRemaining <= 30) {
    return {
      label: `Crítico: ${daysRemaining} dias`,
      color: "bg-red-100 text-red-800 border-red-300 font-semibold",
      urgency: "critical",
    };
  }
  if (daysRemaining <= 60) {
    return {
      label: `Atenção: ${daysRemaining} dias`,
      color: "bg-amber-100 text-amber-800 border-amber-300",
      urgency: "high",
    };
  }
  if (daysRemaining <= 90) {
    return {
      label: `Alerta: ${daysRemaining} dias`,
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      urgency: "medium",
    };
  }
  if (daysRemaining <= 120) {
    return {
      label: `Vigente: ${daysRemaining} dias`,
      color: "bg-blue-50 text-blue-800 border-blue-200",
      urgency: "low",
    };
  }
  return {
    label: `${daysRemaining} dias restantes`,
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    urgency: "safe",
  };
}

export function extrairPrimeiroNome(nomeCompleto?: string | null): string {
  if (!nomeCompleto) return "Servidor";
  let limpo = nomeCompleto
    .trim()
    .replace(/^([Dd]ra?\.?|[Dd]rª\.?|[Dd]rª|[Ee]nf\.?|[Pp]rofa?\.?|[Ss]ra?\.?)\s+/i, "");
  limpo = limpo.replace(/\s*\([^)]*\)$/, "").trim();
  const partes = limpo.split(/\s+/);
  return partes[0] || "Servidor";
}

