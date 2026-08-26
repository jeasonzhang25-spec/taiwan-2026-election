# 島嶼選情 · 2026 台灣九合一選舉選情看板

一個具現代財經媒體數據專題質感的公共選舉資訊網站原型。匯總公開民調、候選人動態、縣市選情、政黨版圖與歷史選舉數據，觀察 22 個縣市的競爭態勢。

> ⚠️ **演示資料聲明**：本專案目前使用**模擬資料**建構原型，所有候選人（候選人A／B／C）、民調機構、支持度、領先差距、競爭評級皆為虛構，僅供介面展示，**不代表實際選情**。歷史執政黨版圖以「政黨層級」示意。

---

## 技術棧

| 面向 | 選型 |
| --- | --- |
| 框架 | Next.js 14（App Router） |
| 語言 | TypeScript（strict） |
| 樣式 | Tailwind CSS 3 |
| 圖表 | ECharts 5（canvas 渲染，自建輕量 React 封裝） |
| 地圖 | 台灣 22 縣市 GeoJSON（本地 `public/data`，Douglas-Peucker 簡化，未變形，含金門／連江離島） |
| 資料 | 本地 TypeScript 資料模組（資料與 UI 分離） |
| 主題 | 預設淺色；預留開票夜深色模式 |

無任何**運行時外部接口**依賴，地圖與演示資料皆在本地。

---

## 快速開始

環境要求：Node.js ≥ 18.17（建議 20+）。

```bash
# 1. 安裝依賴
npm install

# 2. 啟動開發伺服器
npm run dev
# 開啟 http://localhost:3000

# 3. 生產建構
npm run build
npm run start

# 4. 型別檢查
npm run typecheck
```

---

## 專案結構

```
election-dashboard/
├── public/
│   └── data/
│       └── taiwan-counties.geo.json   # 台灣 22 縣市 GeoJSON（地圖圖資）
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # 根佈局（metadata、lang=zh-Hant）
│   │   ├── page.tsx                   # 首頁組裝（Provider + 各區塊 + 抽屜）
│   │   └── globals.css                # 全域樣式、設計 token、紋理/動畫
│   ├── components/
│   │   ├── layout/                    # Navbar、Footer
│   │   ├── ui/                        # 通用元件（Badge、Skeleton、EmptyState、圖例…）
│   │   ├── charts/                    # EChart 封裝、民調趨勢圖、政黨長條圖
│   │   ├── map/                       # TaiwanMap（ECharts map + registerMap）
│   │   ├── drawer/                    # 縣市詳情抽屜
│   │   └── home/                      # 首頁各區塊（篩選、指標、地圖、趨勢、版圖、列表、方法）
│   ├── context/
│   │   └── ElectionContext.tsx        # 全域狀態：篩選器 + 選中縣市 + URL 同步
│   ├── hooks/                         # （預留自訂 hooks 目錄）
│   └── lib/
│       ├── types.ts                   # 全部 TypeScript 型別
│       ├── constants.ts               # 政黨、選舉類型、競爭評級等常數
│       ├── geojson.ts                 # GeoJSON 載入與 name→id 對照
│       ├── data/                      # ★ 演示資料（替換點，見下）
│       │   ├── counties.ts            # 22 縣市選情
│       │   ├── polling.ts             # 六都民調趨勢與逐筆民調
│       │   ├── sources.ts             # 資料來源卡片
│       │   └── index.ts               # 資料總入口
│       └── utils/                     # 格式化、篩選、排序工具
└── README.md
```

---

## 接入真實選舉資料時需要替換的位置

資料與 UI 已分離，替換時**無需改動任何元件**，只需改 `src/lib/data/` 下的資料層：

1. **`src/lib/data/counties.ts`**
   22 縣市的候選人、最新支持度、領先者、領先差距、競爭評級、現任首長、關鍵議題、2022 結果與歷史版圖。對應型別 `CountyRace`。

2. **`src/lib/data/polling.ts`**
   六都的逐筆民調（`MAJOR_CITY_WAVES`）與趨勢序列（`MAJOR_CITY_TRENDS`），以及事件標記（`EVENTS`）。對應型別 `PollRecord`、`CountyPollTrend`。每筆民調已保留欄位：調查機構、調查時間、樣本數、調查方式、誤差範圍、資料來源、發佈時間。

3. **`src/lib/data/sources.ts`**
   資料來源卡片（`SOURCES`）與來源篩選選項（`SOURCE_OPTIONS`）。填上 `url` 即可啟用「前往來源」連結。

4. **`src/lib/constants.ts`**
   投票日 `ELECTION_DAY`、最後更新時間 `LAST_UPDATED`、政黨顏色 `PARTIES`。

### 從 API / 資料庫遷移

- 將上述三個檔案的**靜態資料**改為非同步取得（`fetch` 或 ORM 查詢）。
- 建議保留 `src/lib/types.ts` 的欄位契約不變，直接映射 API 回應。
- 若改用動態資料，可在 `ElectionContext` 加入 loading / error 狀態（已預留 `hydrated` 與各區塊的骨架屏、空狀態）。
- 地圖圖資若更新，僅需替換 `public/data/taiwan-counties.geo.json`（保持 `FeatureCollection`，feature `properties.name` 為縣市名）。

### 移除演示警示

接入真實資料後，全域警示文字在 `src/lib/constants.ts` 的 `DEMO_DISCLAIMER`，移除後 `DataDisclaimer` 元件會隨之消失。

---

## 主要互動

- **地圖 ↔ 關鍵選區 ↔ 縣市列表 ↔ 抽屜** 相互聯動；點擊任一縣市開啟右側詳情抽屜。
- 篩選器（選舉類型／觀察日期／政黨／來源／顯示模式）會同步更新指標卡、地圖與列表。
- 顯示模式三種著色：**領先政黨／競爭程度／民調變化**，均搭配文字圖例與紋理（色盲友好）。
- 篩選條件寫入 URL query（`?type=&party=&source=&date=&mode=&county=`），可直接分享。
- 縣市抽屜支援 `Esc` 與關閉鈕退出，並處理焦點管理；手機端為全屏底部面板。
- 民調趨勢圖使用「折線＋資料點＋誤差線」，**不進行虛假平滑**；懸浮顯示機構、樣本數、日期。來源與截至日期只作用於有逐筆記錄的六都資料，不會把最新縣市摘要假裝成歷史快照。

---

## 設計規範（摘要）

- 主設計基準 1440px、12 欄網格；溫暖米白背景、深灰文字、白色卡片、細邊框、極輕陰影。
- 圓角 8–12px；動畫 150–250ms；不使用大面積漸層、玻璃擬態或誇張發光。
- 政黨顏色僅用於地圖／圖表／少量狀態標記：國民黨藍、民進黨綠、民眾黨青綠、時代力量黃、無黨籍灰、五五波淺灰。
- 所有顏色均搭配文字／圖示／紋理，兼顧色盲使用者。

---

## 免責聲明

本專案為前端演示原型，不含任何真實民調或勝選預測。地圖圖資來源為開放資料（g0v/twgeojson，經座標簡化），僅供展示。
