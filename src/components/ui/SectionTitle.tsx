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
    <div id={id} className="mb-6 flex flex-wrap items-end justify-between gap-4 scroll-mt-24">
      <div className="max-w-3xl">
        <h2 className="text-[22px] font-semibold leading-8 tracking-tight text-ink sm:text-2xl">{title}</h2>
        {subtitle && (
          <p className="mt-1.5 text-sm leading-6 text-ink-secondary">{subtitle}</p>
        )}
      </div>
      {aside && <div className="flex items-center gap-2">{aside}</div>}
    </div>
  );
}
