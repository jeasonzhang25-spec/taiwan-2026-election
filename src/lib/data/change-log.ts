export type ChangeLogEntry = {
  date: string;
  kind: "資料新增" | "資料修正" | "透明度改善";
  title: string;
  detail: string;
};

export const DATA_CHANGE_LOG: ChangeLogEntry[] = [
  {
    date: "2026-08-27",
    kind: "透明度改善",
    title: "加入自動驗證與資料健康頁",
    detail: "每次同步會檢查資料量、縣市覆蓋、日期、支持度範圍、來源連結及候選人對應，異常時停止發布。",
  },
  {
    date: "2026-08-27",
    kind: "資料修正",
    title: "排除非支持度調查事件",
    detail: "移除被表格結構誤讀為民調的退選或政治事件，只保留至少兩名具數字問卷選項的調查情境。",
  },
  {
    date: "2026-08-27",
    kind: "資料新增",
    title: "擴充為全量公開民調檔案",
    detail: "目前收錄 18 個縣市、286 筆公開問卷情境，並保留原始報導、黨內參考與初選民調的分類。",
  },
];
