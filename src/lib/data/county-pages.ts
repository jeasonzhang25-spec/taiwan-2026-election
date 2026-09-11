export const METRO_COUNTY_IDS = [
  "taipei",
  "newtaipei",
  "taoyuan",
  "taichung",
  "tainan",
  "kaohsiung",
] as const;

export const COUNTY_PAGE_IDS = [
  "taipei", "newtaipei", "taoyuan", "taichung", "tainan", "kaohsiung",
  "keelung", "hsinchu-city", "hsinchu-county", "miaoli", "changhua", "nantou",
  "yunlin", "chiayi-city", "chiayi-county", "pingtung", "yilan", "hualien",
  "taitung", "penghu", "kinmen", "lienchiang",
] as const;

export type MetroCountyId = (typeof METRO_COUNTY_IDS)[number];
export type CountyPageId = (typeof COUNTY_PAGE_IDS)[number];

export const METRO_POLICY_DIMENSIONS = [
  { id: "transport", label: "交通與通勤", description: "大眾運輸、道路安全、停車與跨區通勤" },
  { id: "housing", label: "住宅與都市更新", description: "社會住宅、租屋、都市更新與土地使用" },
  { id: "family", label: "育兒與教育", description: "托育、校園、教育資源與青年支持" },
  { id: "health", label: "醫療與長照", description: "區域醫療量能、長照、公共衛生與健康支持" },
  { id: "climate", label: "環境與防災", description: "淨零、空污、水資源、韌性與災害應變" },
  { id: "finance", label: "產業、財政與建設", description: "產業發展、預算來源、建設期程與量化成效" },
  { id: "sports", label: "運動與公共空間", description: "運動設施、公共空間、全民參與與場館建設" },
  { id: "culture", label: "文化、觀光與地方創生", description: "文化資產、觀光路線、原民政策與地方品牌" },
  { id: "governance", label: "治理與公共服務", description: "行政改革、資訊公開、法律支援與公民參與" },
] as const;

export const POLICY_DIMENSIONS = METRO_POLICY_DIMENSIONS;

export function isMetroCountyId(value: string): value is MetroCountyId {
  return (METRO_COUNTY_IDS as readonly string[]).includes(value);
}

export function isCountyPageId(value: string): value is CountyPageId {
  return (COUNTY_PAGE_IDS as readonly string[]).includes(value);
}
