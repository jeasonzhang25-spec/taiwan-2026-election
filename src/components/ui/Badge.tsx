import type { ReactNode } from "react";
import { COMPETITIVENESS } from "@/lib/constants";
import type { Competitiveness } from "@/lib/types";

const TONE_STYLES: Record<string, string> = {
  green: "bg-[#E6F2EC] text-[#1C6B44] border-[#BFE0CF]",
  blue: "bg-[#EAF1FA] text-[#245A96] border-[#C6D9F0]",
  amber: "bg-[#FBF3E2] text-[#8A6410] border-[#EBD9AE]",
  red: "bg-[#FBECEC] text-[#9C2B25] border-[#EFCDCB]",
  gray: "bg-[#F0EFEC] text-[#5F6470] border-[#DDDAD3]",
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
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-4 ${TONE_STYLES[tone]} ${className}`}
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
