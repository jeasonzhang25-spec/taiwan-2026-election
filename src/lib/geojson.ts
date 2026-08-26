// 載入本地 GeoJSON（位於 public/data，同源請求，非外部接口）
import type { CountyRace } from "./types";

let cache: unknown = null;

export async function loadTaiwanGeoJson(): Promise<any> {
  if (cache) return cache;
  const res = await fetch("/data/taiwan-counties.geo.json");
  if (!res.ok) throw new Error(`地圖資料載入失敗：${res.status}`);
  cache = await res.json();
  return cache;
}

/** 建立 GeoJSON name -> 縣市 id 對照 */
export function buildNameToId(counties: CountyRace[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const c of counties) map[c.name] = c.id;
  return map;
}
