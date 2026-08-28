"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ANALYSIS_ITEMS,
  EXTERNAL_DATA_CHECKED_AT,
  VERIFIED_POLLS,
  isPollPublicationBlackout,
  type ExternalFeedItem,
  type ExternalFeedKind,
} from "@/lib/data/external";
import { Badge } from "@/components/ui/Badge";
import { SectionTitle } from "@/components/ui/SectionTitle";

type FeedResponse = {
  items: ExternalFeedItem[];
  fetchedAt: string;
  blackout: boolean;
  partial: boolean;
};

const FILTERS: { value: ExternalFeedKind | "all"; label: string }[] = [
  { value: "all", label: "全部動態" },
  { value: "poll", label: "民調報導" },
  { value: "analysis", label: "選情分析" },
];

function formatFeedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-TW", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function LiveDataSection() {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [feedError, setFeedError] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ExternalFeedKind | "all">("all");
  const [blackout] = useState(() => isPollPublicationBlackout(new Date()));

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/external-feed", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("feed unavailable");
        return response.json() as Promise<FeedResponse>;
      })
      .then(setFeed)
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setFeedError(true);
        }
      });

    return () => controller.abort();
  }, []);

  const filteredFeed = useMemo(() => {
    const items = Array.from(
      (feed?.items ?? []).reduce((map, item) => {
        const key = item.title.replace(/\s+/g, " ").trim();
        if (!map.has(key)) map.set(key, item);
        return map;
      }, new Map<string, ExternalFeedItem>()).values(),
    );
    return activeFilter === "all"
      ? items
      : items.filter((item) => item.kind === activeFilter);
  }, [activeFilter, feed]);

  return (
    <section id="live-data" className="mx-auto max-w-page scroll-mt-20 px-4 pt-10 sm:px-6 lg:px-8">
      <SectionTitle
        title="外部真實資料"
        subtitle="人工核驗的民調資料與即時媒體索引分開呈現；評論觀點不參與地圖、席次或勝率計算。"
        aside={<Badge tone="green">核驗至 {EXTERNAL_DATA_CHECKED_AT}</Badge>}
      />

      <div className="mb-5 grid gap-3 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-xl border border-[#C6D9F0] bg-[#F3F7FC] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="blue">中選會時程</Badge>
            <span className="text-sm font-semibold text-ink">候選人登記尚未完成</span>
          </div>
          <p className="mt-2 text-[13px] leading-5 text-ink-secondary">
            2026 年地方選舉投票日為 11 月 28 日；候選人登記受理期間為 8 月 31 日至 9 月 4 日。
            因此目前頁面中的人名只代表該份民調實際詢問的人選，不等於中選會核定的正式候選人。
          </p>
          <a
            href="https://web.cec.gov.tw/api/file/2ecc9288-48df-44b1-8dbd-d0a263763fd0.pdf"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex text-xs font-medium text-[#245A96] hover:underline"
          >
            查看中選會工作時程 ↗
          </a>
        </div>

        <div className="rounded-xl border border-[#EBD9AE] bg-[#FFFAEF] p-4">
          <div className="flex items-center gap-2">
            <Badge tone="amber">資料邊界</Badge>
            <span className="text-sm font-semibold text-ink">不同調查不硬做平均</span>
          </div>
          <p className="mt-2 text-[13px] leading-5 text-ink-secondary">
            問法、樣本框、電話或網路方法，以及委託方都可能造成「機構效應」。本區保留原題情境與出處，
            不把跨機構數字拼成單一預測。
          </p>
        </div>
      </div>

      {blackout ? (
        <div className="rounded-xl border border-[#EFCDCB] bg-[#FBECEC] p-4 text-[13px] leading-5 text-[#7E2924]">
          依法進入投票日前十日的民調發布限制期，本區暫時隱藏民調數字與相關即時索引，投票結束後自動恢復。
        </div>
      ) : (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">方法資料較完整的重點民調</h3>
            <span className="text-[11px] text-ink-muted">完整民調情境請見下方資料庫；此處只精選已核對樣本與方法者</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {VERIFIED_POLLS.map((poll) => (
              <article key={poll.id} className="rounded-xl border border-line bg-surface p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge tone="gray">{poll.county}</Badge>
                      <span className="text-[11px] text-ink-muted">發布 {poll.publishedAt}</span>
                    </div>
                    <h4 className="mt-2 text-sm font-semibold text-ink">{poll.question}</h4>
                  </div>
                  <a
                    href={poll.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-[#245A96] hover:underline"
                  >
                    {poll.sourceName} ↗
                  </a>
                </div>

                <div className="mt-4 space-y-3">
                  {poll.results.map((result) => (
                    <div key={result.name}>
                      <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
                        <span className="font-medium text-ink">
                          {result.name} <span className="font-normal text-ink-muted">· {result.party}</span>
                        </span>
                        <span className="num font-semibold text-ink">{result.value}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#ECEAE3]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(result.value, 100)}%`, backgroundColor: result.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3 text-[11px] leading-4">
                  <div>
                    <dt className="text-ink-muted">調查期間</dt>
                    <dd className="mt-0.5 text-ink-secondary">{poll.fieldwork}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-muted">樣本／誤差</dt>
                    <dd className="mt-0.5 text-ink-secondary">n={poll.sampleSize.toLocaleString()} · ±{poll.marginOfError}%</dd>
                  </div>
                  <div>
                    <dt className="text-ink-muted">執行機構</dt>
                    <dd className="mt-0.5 text-ink-secondary">{poll.executor}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-muted">經費／委託</dt>
                    <dd className="mt-0.5 text-ink-secondary">{poll.commissioner}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-ink-muted">調查方法</dt>
                    <dd className="mt-0.5 text-ink-secondary">{poll.method}</dd>
                  </div>
                </dl>

                {(poll.undecided !== undefined || poll.note) && (
                  <p className="mt-3 rounded-lg bg-[#F6F4EF] px-3 py-2 text-[11px] leading-4 text-ink-secondary">
                    {poll.undecided !== undefined && `未決定／未表態：${poll.undecided}%。`}
                    {poll.note ? ` ${poll.note}` : ""}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_1.15fr]">
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">評論觀點樣本</h3>
            <Badge tone="amber">觀點 ≠ 資料</Badge>
          </div>
          <div className="space-y-3">
            {ANALYSIS_ITEMS.map((item) => (
              <article key={item.id} className="rounded-xl border border-line bg-surface p-4 shadow-card">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
                  <span className="font-medium text-ink-secondary">{item.analyst}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.outlet}</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={item.publishedAt}>{item.publishedAt}</time>
                </div>
                <h4 className="mt-2 text-sm font-semibold text-ink">{item.title}</h4>
                <p className="mt-1.5 text-[13px] leading-5 text-ink-secondary">{item.summary}</p>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-xs font-medium text-[#245A96] hover:underline"
                >
                  查看完整原文／節目報導 ↗
                </a>
              </article>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-ink">即時媒體索引</h3>
              <p className="mt-0.5 text-[11px] text-ink-muted">每 30 分鐘更新標題與原連結；本站不自動摘要或判定立場</p>
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="篩選即時媒體索引">
              {FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  aria-pressed={activeFilter === filter.value}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                    activeFilter === filter.value
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-surface text-ink-secondary hover:border-line-strong"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card" aria-live="polite">
            {!feed && !feedError && (
              <div className="space-y-3 p-4">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="h-12 animate-pulse rounded-lg bg-[#ECEAE3]" />
                ))}
              </div>
            )}

            {feedError && (
              <div className="p-5 text-center text-[13px] text-ink-secondary">
                即時索引暫時無法連線；上方人工核驗資料仍可正常使用。
              </div>
            )}

            {feed && filteredFeed.length === 0 && (
              <div className="p-5 text-center text-[13px] text-ink-secondary">
                目前篩選沒有新資料，請稍後再試。
              </div>
            )}

            {filteredFeed.map((item, index) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className={`group block px-4 py-3 transition-colors hover:bg-[#F8F7F3] ${
                  index > 0 ? "border-t border-line" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <Badge tone={item.kind === "poll" ? "blue" : "amber"} className="mt-0.5 shrink-0">
                    {item.kind === "poll" ? "民調相關" : "分析"}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium leading-5 text-ink group-hover:text-[#245A96]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-muted">
                      {item.source} · {formatFeedDate(item.publishedAt)}
                    </p>
                  </div>
                  <span className="text-xs text-ink-muted" aria-hidden="true">↗</span>
                </div>
              </a>
            ))}
          </div>

          {feed?.partial && (
            <p className="mt-2 text-[11px] text-ink-muted">部分外部來源暫時沒有回應，現有項目仍繼續顯示。</p>
          )}
        </div>
      </div>
    </section>
  );
}
