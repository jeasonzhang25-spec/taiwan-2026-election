import { PARTIES } from "@/lib/constants";
import type { PartyId } from "@/lib/types";

/** 政黨色點（含斜線紋理備援，色盲友好） */
export function PartyDot({
  party,
  size = 10,
  className = "",
}: {
  party: PartyId;
  size?: number;
  className?: string;
}) {
  const p = PARTIES[party];
  const style = {
    width: size,
    height: size,
    backgroundColor: p?.color ?? "#8A9199",
  };
  const texture =
    p?.texture === "stripes"
      ? { backgroundImage: "repeating-linear-gradient(45deg, rgba(0,0,0,0.25) 0 1px, transparent 1px 3px)" }
      : p?.texture === "dots"
        ? { backgroundImage: "radial-gradient(rgba(0,0,0,0.3) 1px, transparent 1px)", backgroundSize: "3px 3px" }
        : {};
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-[3px] ${className}`}
      style={{ ...style, ...texture }}
    />
  );
}
