import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  markSize?: number;
  showTagline?: boolean;
};

export default function BrandLogo({
  className = "",
  markSize = 30,
  showTagline = true,
}: BrandLogoProps) {
  return (
    <span className={`flex min-w-0 items-center gap-2.5 ${className}`}>
      <Image
        src="/brand/logo-mark.svg"
        alt=""
        aria-hidden="true"
        width={markSize}
        height={markSize}
        className="shrink-0"
        priority
      />
      <span className="min-w-0">
        <span className="block whitespace-nowrap text-[17px] font-semibold leading-5 tracking-tight text-ink">
          島嶼選情
        </span>
        {showTagline && (
          <span className="hidden truncate text-[11px] leading-4 text-ink-secondary sm:block">
            2026 台灣九合一選舉觀察
          </span>
        )}
      </span>
    </span>
  );
}
