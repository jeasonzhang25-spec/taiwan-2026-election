export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-lg ${className}`} />;
}

export function SkeletonLine({ h = "h-4", w = "w-full", className = "" }: { h?: string; w?: string; className?: string }) {
  return <Skeleton className={`${h} ${w} ${className}`} />;
}
