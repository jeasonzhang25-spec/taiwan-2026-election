import { DEMO_DISCLAIMER } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-page px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-ink">島嶼選情</div>
            <div className="mt-1">2026 台灣九合一選舉觀察看板</div>
          </div>
          <div className="max-w-md leading-5">
            <span className="rounded bg-[#FBF8EF] px-1.5 py-0.5 text-[#8A6410]">
              {DEMO_DISCLAIMER}
            </span>
          </div>
        </div>
        <div className="mt-6 border-t border-line pt-4 text-[11px] text-ink-muted">
          本看板為前端演示原型，地圖圖資與選舉資料均屬示範用途。地圖未經變形，含金門、連江等離島。
        </div>
      </div>
    </footer>
  );
}
