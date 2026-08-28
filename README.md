# 島嶼選情 · 2026 台灣九合一選舉選情看板

一個公共選舉資訊網站，匯總 2026 台灣地方選舉公開民調、候選人動態、縣市選情、政黨版圖與歷史選舉數據。

> **資料邊界**：民調數字來自公開索引與其引用報導；同一調查的不同對戰題目分開保存。民調中的人名只代表問卷選項，在中選會完成登記與審定前，不視為正式候選人。來源未揭露的方法或樣本數不自行補填。

---

## 技術棧

| 面向 | 選型 |
| --- | --- |
| 框架 | Next.js 14（App Router） |
| 語言 | TypeScript（strict） |
| 樣式 | Tailwind CSS 3 |
| 圖表 | ECharts 5（canvas 渲染，自建輕量 React 封裝） |
| 地圖 | 台灣 22 縣市 GeoJSON（本地 `public/data`，Douglas-Peucker 簡化，未變形，含金門／連江離島） |
| 資料 | 公開民調同步腳本、靜態 JSON、RSS 媒體索引 |
| 主題 | 預設淺色；預留開票夜深色模式 |

核心民調與地圖在建置時寫入本地；外部媒體標題由伺服器端接口定時快取。

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

# 5. 重新同步並驗證公開民調
npm run sync:polls
npm run validate:polls
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
│   │   ├── county/[countyId]/          # 六都獨立頁（民調、政見、訂閱）
│   │   ├── data-status/                # 資料健康與更正紀錄
│   │   ├── roadmap/                    # 公開完善清單
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
│       ├── data/                      # 真實資料、同步產物與資料狀態
│       │   ├── counties.ts            # 22 縣市選情
│       │   ├── polling.ts             # 公開民調趨勢與逐筆民調
│       │   ├── sources.ts             # 資料來源卡片
│       │   └── index.ts               # 資料總入口
│       └── utils/                     # 格式化、篩選、排序工具
└── README.md
```

---

## 資料更新與發布

公開民調同步器位於 `scripts/sync-public-polls.py`，輸出為 `src/lib/data/generated/public-polls.json`。`scripts/validate-public-polls.py` 會在發布前檢查筆數、覆蓋縣市、日期、百分比、來源連結與候選人對應。

1. **`src/lib/data/counties.ts`**
   22 縣市的候選人、最新支持度、領先者、領先差距、競爭評級、現任首長、關鍵議題、2022 結果與歷史版圖。對應型別 `CountyRace`。

2. **`src/lib/data/polling.ts`**
   將同步後的逐筆民調依縣市建立趨勢序列。對應型別為 `PollRecord`、`CountyPollTrend`；每筆保留調查機構、日期、題目情境、支持度、來源分類與原始連結，樣本或方法未揭露時留空。

3. **`src/lib/data/sources.ts`**
   資料來源卡片（`SOURCES`）與來源篩選選項（`SOURCE_OPTIONS`）。填上 `url` 即可啟用「前往來源」連結。

4. **`src/lib/constants.ts`**
   投票日 `ELECTION_DAY`、最後更新時間 `LAST_UPDATED`、政黨顏色 `PARTIES`。

### 從 API / 資料庫遷移

- 將上述三個檔案的**靜態資料**改為非同步取得（`fetch` 或 ORM 查詢）。
- 建議保留 `src/lib/types.ts` 的欄位契約不變，直接映射 API 回應。
- 若改用動態資料，可在 `ElectionContext` 加入 loading / error 狀態（已預留 `hydrated` 與各區塊的骨架屏、空狀態）。
- 地圖圖資若更新，僅需替換 `public/data/taiwan-counties.geo.json`（保持 `FeatureCollection`，feature `properties.name` 為縣市名）。

### 自動排程

`.github/workflows/sync-polls.yml` 會定期同步、驗證、執行型別檢查與正式建置。只有資料內容真正改變且全部檢查通過時才建立更新提交；上傳 GitHub 並啟用 Actions 後生效。

---

## 主要互動

- **地圖 ↔ 關鍵選區 ↔ 縣市列表 ↔ 抽屜** 相互聯動；點擊任一縣市開啟右側詳情抽屜。
- 篩選器（選舉類型／觀察日期／政黨／來源／顯示模式）會同步更新指標卡、地圖與列表。
- 顯示模式三種著色：**領先政黨／競爭程度／民調變化**，均搭配文字圖例與紋理（色盲友好）。
- 篩選條件寫入 URL query（`?type=&party=&source=&date=&mode=&county=`），可直接分享。
- 縣市抽屜支援 `Esc` 與關閉鈕退出，並處理焦點管理；手機端為全屏底部面板。
- 民調趨勢圖使用「折線＋資料點＋誤差線」，**不進行虛假平滑**；懸浮顯示機構、樣本數、日期。來源與截至日期只作用於有逐筆記錄的縣市，不會把最新摘要假裝成歷史快照。
- 六都各有獨立網址，提供人選／來源／題目／日期篩選的逐筆民調比較器。
- 政見區只收錄可追溯的正式來源；候選人登記與選舉公報尚未完成時顯示待補狀態。
- 每個六都頁面提供縣市及指定來源 RSS；瀏覽器本機追蹤不蒐集姓名或 Email。

---

## 設計規範（摘要）

- 主設計基準 1440px、12 欄網格；溫暖米白背景、深灰文字、白色卡片、細邊框、極輕陰影。
- 圓角 8–12px；動畫 150–250ms；不使用大面積漸層、玻璃擬態或誇張發光。
- 政黨顏色僅用於地圖／圖表／少量狀態標記：國民黨藍、民進黨綠、民眾黨青綠、時代力量黃、無黨籍灰、五五波淺灰。
- 所有顏色均搭配文字／圖示／紋理，兼顧色盲使用者。

---

## 免責聲明

本網站整理公開資訊，不委託民調、不建立勝選機率，也不代表任何政黨或候選人。民調是特定時間與方法下的抽樣結果，不等於選舉預測。地圖圖資來源為開放資料（g0v/twgeojson，經座標簡化）。
