import { DEMO_DISCLAIMER } from "@/lib/constants";

/** 資料邊界（全域統一樣式） */
export function DataDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border border-[#E8E0C9] bg-[#FBF8EF] px-3 py-2 text-[11px] leading-4 text-[#8A6410] ${className}`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{DEMO_DISCLAIMER}</span>
    </div>
  );
}
