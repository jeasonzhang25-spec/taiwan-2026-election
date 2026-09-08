import type { ReactNode } from "react";
import { COMPETITIVENESS } from "@/lib/constants";
import type { Competitiveness } from "@/lib/types";

const TONE_STYLES: Record<string, string> = {
  green: "bg-[#13271F] text-[#72D6A0] border-[#264D3A]",
  blue: "bg-[#162333] text-[#82B8F0] border-[#2B4664]",
  amber: "bg-[#2A2112] text-[#F1C46B] border-[#55411D]",
  red: "bg-[#2B1718] text-[#FF8A84] border-[#5B2A2D]",
  gray: "bg-[#1B1E23] text-[#AEB3BC] border-[#343841]",
};

export function Badge({
  children,
  tone = "gray",
  className = "",
}: {
  children: ReactNode;
  tone?: "green" | "blue" | "amber" | "red" | "gray";
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium leading-4 ${TONE_STYLES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function CompetitivenessBadge({
  value,
}: {
  value: Competitiveness;
}) {
  const meta = COMPETITIVENESS[value];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
