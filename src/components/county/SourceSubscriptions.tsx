"use client";

import { useEffect, useMemo, useState } from "react";

type SourceSummary = { name: string; count: number; latestDate: string };
type Preference = { enabled: boolean; sources: string[]; lastSeenDate: string };
type PreferenceStore = Record<string, Preference>;

const STORAGE_KEY = "island-election-poll-subscriptions-v1";

export default function SourceSubscriptions({
  countyId,
  countyName,
  sources,
  latestDate,
}: {
  countyId: string;
  countyName: string;
  sources: SourceSummary[];
  latestDate: string;
}) {
  const [ready, setReady] = useState(false);
  const [preference, setPreference] = useState<Preference>({ enabled: false, sources: [], lastSeenDate: latestDate });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unavailable">("unavailable");

  useEffect(() => {
    let stored: PreferenceStore = {};
    try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"); } catch { stored = {}; }
    const next = stored[countyId] ?? { enabled: false, sources: [], lastSeenDate: latestDate };
    setPreference(next);
    setNotificationPermission("Notification" in window ? Notification.permission : "unavailable");
    setReady(true);

    const relevantLatest = next.sources.length > 0
      ? sources.filter((source) => next.sources.includes(source.name)).reduce((value, source) => source.latestDate > value ? source.latestDate : value, "")
      : latestDate;
    if (next.enabled && relevantLatest > next.lastSeenDate && "Notification" in window && Notification.permission === "granted") {
      new Notification(`${countyName}有新民調`, { body: `最新收錄日期 ${relevantLatest}，開啟島嶼選情查看。` });
    }
  }, [countyId, countyName, latestDate, sources]);

  useEffect(() => {
    if (!ready) return;
    let stored: PreferenceStore = {};
    try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"); } catch { stored = {}; }
    stored[countyId] = preference;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }, [countyId, preference, ready]);

  const relevantLatest = useMemo(() => preference.sources.length > 0
    ? sources.filter((source) => preference.sources.includes(source.name)).reduce((value, source) => source.latestDate > value ? source.latestDate : value, "")
    : latestDate, [latestDate, preference.sources, sources]);
  const hasNewData = ready && preference.enabled && relevantLatest > preference.lastSeenDate;
  const countyFeedUrl = `/api/polls/feed?countyId=${encodeURIComponent(countyId)}`;

  function toggleCounty() {
    setPreference((current) => ({ ...current, enabled: !current.enabled, lastSeenDate: current.enabled ? current.lastSeenDate : latestDate }));
  }

  function toggleSource(name: string) {
    setPreference((current) => ({
      ...current,
      enabled: true,
      sources: current.sources.includes(name) ? current.sources.filter((value) => value !== name) : [...current.sources, name],
      lastSeenDate: latestDate,
    }));
  }

  async function enableNotifications() {
    if (!("Notification" in window)) { setNotificationPermission("unavailable"); return; }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === "granted") setPreference((current) => ({ ...current, enabled: true, lastSeenDate: latestDate }));
  }

  return (
    <section id="subscriptions" className="scroll-mt-24" aria-labelledby="subscriptions-title">
      <span className="text-xs font-medium text-[#126B43]">來源訂閱與提醒</span>
      <h2 id="subscriptions-title" className="mt-1 text-2xl font-semibold tracking-tight text-ink">追蹤{countyName}，或只看指定來源</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-secondary">RSS 可交給任何閱讀器長期訂閱；本機追蹤保存在這台裝置，回訪網站時會比對是否出現更新。瀏覽器通知只在網站被開啟時觸發，不冒充背景推播服務。</p>

      {hasNewData && <div className="mt-4 flex flex-col justify-between gap-3 rounded-xl border border-[#B8D8C6] bg-[#E8F5EE] p-4 sm:flex-row sm:items-center"><div className="text-sm text-[#126B43]"><span className="font-semibold">有新資料：</span>你追蹤的來源最新收錄至 {relevantLatest}。</div><button type="button" onClick={() => setPreference((current) => ({ ...current, lastSeenDate: relevantLatest }))} className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-[#126B43]">標記為已讀</button></div>}

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div><h3 className="font-semibold text-ink">追蹤整個縣市</h3><p className="mt-1 text-xs text-ink-muted">最新資料日期 {latestDate}</p></div>
            <button type="button" role="switch" aria-checked={preference.enabled} onClick={toggleCounty} className={`relative h-7 w-12 rounded-full transition-colors ${preference.enabled ? "bg-[#178A56]" : "bg-[#D8D4CA]"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${preference.enabled ? "translate-x-6" : "translate-x-1"}`} /></button>
          </div>
          <div className="mt-5 space-y-2">
            <a href={countyFeedUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border border-line px-3 py-2.5 text-sm font-medium text-ink hover:bg-canvas"><span>訂閱全部民調 RSS</span><span className="text-ink-muted">↗</span></a>
            {notificationPermission === "granted" ? <div className="rounded-lg bg-[#E8F5EE] px-3 py-2.5 text-xs text-[#126B43]">瀏覽器提醒已允許；回訪網站時若有新資料會提示。</div> : <button type="button" onClick={enableNotifications} className="w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-left text-sm font-medium text-ink hover:border-line-strong">{notificationPermission === "denied" ? "瀏覽器已封鎖通知，可在網站權限中調整" : notificationPermission === "unavailable" ? "此瀏覽器不支援通知" : "開啟瀏覽器提醒"}</button>}
          </div>
          <p className="mt-4 text-[11px] leading-5 text-ink-muted">偏好只存在目前瀏覽器，不會上傳姓名、Email 或其他個人資料。</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
          <div className="border-b border-line px-5 py-4"><h3 className="font-semibold text-ink">指定來源</h3><p className="mt-1 text-xs text-ink-muted">選取後，本機新資料判斷只看這些來源；未選取代表全部來源。</p></div>
          <div className="max-h-[360px] divide-y divide-line overflow-y-auto">
            {sources.map((source) => {
              const selected = preference.sources.includes(source.name);
              const sourceFeedUrl = `${countyFeedUrl}&source=${encodeURIComponent(source.name)}`;
              return <div key={source.name} className="flex items-center gap-3 px-5 py-3 hover:bg-canvas/60"><label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"><input type="checkbox" checked={selected} onChange={() => toggleSource(source.name)} className="h-4 w-4 rounded border-line-strong accent-[#178A56]" /><span className="min-w-0"><span className="block truncate text-sm font-medium text-ink">{source.name}</span><span className="text-xs text-ink-muted">{source.count} 筆 · 最新 {source.latestDate}</span></span></label><a href={sourceFeedUrl} target="_blank" rel="noreferrer" className="shrink-0 rounded-md border border-line px-2 py-1 text-[11px] text-ink-secondary hover:text-ink">RSS ↗</a></div>;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
