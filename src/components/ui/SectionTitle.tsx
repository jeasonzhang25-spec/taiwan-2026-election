import type { ReactNode } from "react";

export function SectionTitle({
  title,
  subtitle,
  aside,
  id,
}: {
  title: string;
  subtitle?: string;
  aside?: ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="mb-4 flex flex-wrap items-end justify-between gap-3 scroll-mt-24">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-[13px] leading-5 text-ink-secondary">{subtitle}</p>
        )}
      </div>
      {aside && <div className="flex items-center gap-2">{aside}</div>}
    </div>
  );
}
