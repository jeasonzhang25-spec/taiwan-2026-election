export const METRO_COUNTY_IDS = [
  "taipei",
  "newtaipei",
  "taoyuan",
  "taichung",
  "tainan",
  "kaohsiung",
] as const;

export type MetroCountyId = (typeof METRO_COUNTY_IDS)[number];

export const METRO_POLICY_DIMENSIONS = [
  { id: "transport", label: "交通與通勤", description: "大眾運輸、道路安全、停車與跨區通勤" },
  { id: "housing", label: "住宅與都市更新", description: "社會住宅、租屋、都市更新與土地使用" },
  { id: "family", label: "育兒與教育", description: "托育、校園、教育資源與青年支持" },
  { id: "climate", label: "環境與防災", description: "淨零、空污、水資源、韌性與災害應變" },
  { id: "finance", label: "財政與重大建設", description: "預算來源、建設期程與量化成效" },
] as const;

export function isMetroCountyId(value: string): value is MetroCountyId {
  return (METRO_COUNTY_IDS as readonly string[]).includes(value);
}
