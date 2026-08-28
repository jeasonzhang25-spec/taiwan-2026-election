import type { CountyRace, HistoricalResult, PartyId, PollRecord } from "../types";
import { MAJOR_CITY_POLLS, POLL_CANDIDATES, POLL_DATA_CHECKED_AT } from "./polling";

const checkedAt = POLL_DATA_CHECKED_AT;

function result2022(winner: PartyId, voteShare?: number, runnerUp?: PartyId): HistoricalResult {
  return { year: 2022, winner, voteShare, runnerUp };
}

type BaseCounty = Pick<CountyRace, "id" | "name" | "nameEn" | "incumbentParty" | "incumbentName" | "result2022">;

const BASE_COUNTIES: BaseCounty[] = [
  { id: "taipei", name: "台北市", nameEn: "Taipei", incumbentParty: "kmt", incumbentName: "蔣萬安", result2022: result2022("kmt", 42.29, "dpp") },
  { id: "newtaipei", name: "新北市", nameEn: "New Taipei", incumbentParty: "kmt", incumbentName: "侯友宜", result2022: result2022("kmt", 62.42, "dpp") },
  { id: "taoyuan", name: "桃園市", nameEn: "Taoyuan", incumbentParty: "kmt", incumbentName: "張善政", result2022: result2022("kmt", 52.02, "dpp") },
  { id: "taichung", name: "台中市", nameEn: "Taichung", incumbentParty: "kmt", incumbentName: "盧秀燕", result2022: result2022("kmt", 59.35, "dpp") },
  { id: "tainan", name: "台南市", nameEn: "Tainan", incumbentParty: "dpp", incumbentName: "黃偉哲", result2022: result2022("dpp", 48.8, "kmt") },
  { id: "kaohsiung", name: "高雄市", nameEn: "Kaohsiung", incumbentParty: "dpp", incumbentName: "陳其邁", result2022: result2022("dpp", undefined, "kmt") },
  { id: "keelung", name: "基隆市", nameEn: "Keelung", incumbentParty: "kmt", incumbentName: "謝國樑", result2022: result2022("kmt", 52.92, "dpp") },
  { id: "hsinchu-city", name: "新竹市", nameEn: "Hsinchu City", incumbentParty: "tpp", incumbentName: "高虹安（目前停職；邱臣遠代理）", result2022: result2022("tpp", 45.02, "dpp") },
  { id: "hsinchu-county", name: "新竹縣", nameEn: "Hsinchu County", incumbentParty: "kmt", incumbentName: "楊文科", result2022: result2022("kmt", 63.36, "dpp") },
  { id: "miaoli", name: "苗栗縣", nameEn: "Miaoli", incumbentParty: "ind", incumbentName: "鍾東錦", result2022: result2022("ind") },
  { id: "changhua", name: "彰化縣", nameEn: "Changhua", incumbentParty: "kmt", incumbentName: "王惠美", result2022: result2022("kmt", 56.75, "dpp") },
  { id: "nantou", name: "南投縣", nameEn: "Nantou", incumbentParty: "kmt", incumbentName: "許淑華", result2022: result2022("kmt", 55.99, "dpp") },
  { id: "yunlin", name: "雲林縣", nameEn: "Yunlin", incumbentParty: "kmt", incumbentName: "張麗善", result2022: result2022("kmt", 56.57, "dpp") },
  { id: "chiayi-city", name: "嘉義市", nameEn: "Chiayi City", incumbentParty: "kmt", incumbentName: "黃敏惠", result2022: result2022("kmt") },
  { id: "chiayi-county", name: "嘉義縣", nameEn: "Chiayi County", incumbentParty: "dpp", incumbentName: "翁章梁", result2022: result2022("dpp") },
  { id: "pingtung", name: "屏東縣", nameEn: "Pingtung", incumbentParty: "dpp", incumbentName: "周春米", result2022: result2022("dpp") },
  { id: "yilan", name: "宜蘭縣", nameEn: "Yilan", incumbentParty: "kmt", incumbentName: "林姿妙", result2022: result2022("kmt") },
  { id: "hualien", name: "花蓮縣", nameEn: "Hualien", incumbentParty: "kmt", incumbentName: "徐榛蔚", result2022: result2022("kmt") },
  { id: "taitung", name: "台東縣", nameEn: "Taitung", incumbentParty: "kmt", incumbentName: "饒慶鈴", result2022: result2022("kmt") },
  { id: "penghu", name: "澎湖縣", nameEn: "Penghu", incumbentParty: "dpp", incumbentName: "陳光復", result2022: result2022("dpp") },
  { id: "kinmen", name: "金門縣", nameEn: "Kinmen", incumbentParty: "ind", incumbentName: "陳福海", result2022: result2022("ind") },
  { id: "lienchiang", name: "連江縣", nameEn: "Lienchiang", incumbentParty: "kmt", incumbentName: "王忠銘", result2022: result2022("kmt") },
];

function latestRecord(records: PollRecord[]): PollRecord | undefined {
  const kindRank = { primary: 0, internal: 1, public: 2 } as const;
  return [...records].sort((a, b) =>
    a.date.localeCompare(b.date)
    || (kindRank[a.sourceKind ?? "public"] - kindRank[b.sourceKind ?? "public"])
    || Object.keys(a.results).length - Object.keys(b.results).length
    || a.id.localeCompare(b.id),
  ).at(-1);
}

function pollFields(base: BaseCounty) {
  const record = latestRecord(MAJOR_CITY_POLLS[base.id] ?? []);
  const candidates = (POLL_CANDIDATES[base.id] ?? []).map((item) => ({
    ...item,
    isIncumbent: base.incumbentName === item.name || base.incumbentName.startsWith(`${item.name}（`),
  }));
  if (!record || candidates.length === 0) {
    return {
      candidates: [], latestSupport: {}, leadingId: "", margin: 0,
      competitiveness: "insufficient" as const, change: 0, lastPollDate: "",
      dataStatus: "insufficient" as const,
      dataNote: "截至核驗日，公開索引尚無至少兩名人選皆有數字的縣市長支持度民調。",
    };
  }
  const ordered = Object.entries(record.results).sort((a, b) => b[1] - a[1]);
  const margin = Number(((ordered[0]?.[1] ?? 0) - (ordered[1]?.[1] ?? 0)).toFixed(2));
  return {
    candidates, latestSupport: { ...record.results }, leadingId: ordered[0]?.[0] ?? "", margin,
    competitiveness: record.marginOfError !== undefined && margin <= record.marginOfError
      ? "tossup" as const
      : margin <= 10 ? "slim-lead" as const : "stable-lead" as const,
    change: 0, lastPollDate: record.date, dataStatus: "verified-poll" as const,
    dataSource: record.source, dataSourceUrl: record.sourceUrl,
    dataNote: `地圖採最新一筆「${record.scenario ?? "候選人支持度"}」題目；同日其他組合仍完整保留於下方民調表。人名為問卷選項，不代表已完成候選人登記。`,
  };
}

export const COUNTIES: CountyRace[] = BASE_COUNTIES.map((base) => ({
  ...base,
  electionType: "mayor",
  ...pollFields(base),
  keyIssues: [],
  updatedAt: checkedAt,
  historical: [base.result2022],
}));

export const COUNTY_MAP: Record<string, CountyRace> = Object.fromEntries(COUNTIES.map((county) => [county.id, county]));
export const getCounty = (id: string) => COUNTY_MAP[id];
export const MAJOR_CITY_NAMES = ["台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市"];
