import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("首頁核心入口與無障礙", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /2026 台灣九合一/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "台灣選情地圖" })).toBeVisible();
  const map = page.locator('[data-map-region-count="22"][data-map-feature-count="22"][data-map-series-count="4"]');
  await expect(map).toBeVisible();
  await expect(map.locator("canvas")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "進入縣市獨立頁面" })).toBeVisible();
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", await page.locator("html").evaluate((element) => element.clientWidth));
  if (testInfo.project.name === "desktop") {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  }
});

test("有民調與無民調縣市都有完整頁面", async ({ page }) => {
  await page.goto("/county/taichung");
  await expect(page.getByRole("heading", { name: "台中市 2026 選情" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "比較不同機構、題目與人選" })).toBeVisible();
  await page.goto("/county/miaoli");
  await expect(page.getByRole("heading", { name: "苗栗縣 2026 選情" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "目前沒有可比較的公開民調" })).toBeVisible();
});

test("登記人選、民調選項與不同選舉層級分流", async ({ page }) => {
  await page.goto("/county/newtaipei");
  await expect(page.getByText("本頁已核對 3 位登記人選")).toBeVisible();
  await expect(page.getByText("候選人登記已完成，資格審定中")).toBeVisible();
  const ledger = page.locator("#policies");
  await expect(ledger.getByText("蘇輝湟", { exact: true }).first()).toBeVisible();
  await expect(ledger.getByText("黃國昌", { exact: true })).toBeVisible();
  await expect(ledger.locator("span").filter({ hasText: /^· 已登記 2026-/ })).toHaveCount(3);
  await expect(ledger.getByText("· 民調選項", { exact: true })).toHaveCount(1);
  await expect(ledger.getByText("已核驗 10 項 · 涵蓋 2 人")).toBeVisible();
  await expect(ledger.getByRole("heading", { name: "蘇巧慧｜都更與住宅七項方案" })).toBeVisible();
  await expect(ledger.getByRole("heading", { name: "李四川｜都更 5 夠力" })).toBeVisible();

  await page.goto("/county/hsinchu-city");
  await expect(page.getByText("本頁已核對 3 位登記人選")).toBeVisible();
  const hsinchuLedger = page.locator("#policies");
  await expect(hsinchuLedger.getByText("高虹安", { exact: true }).first()).toBeVisible();
  await expect(hsinchuLedger.getByText("莊競程", { exact: true }).first()).toBeVisible();
  await expect(hsinchuLedger.getByText("何志勇", { exact: true }).first()).toBeVisible();
  await expect(hsinchuLedger.getByText(/邱臣遠已登記參選的是新竹縣竹北市長/)).toBeVisible();
  await expect(hsinchuLedger.locator("span").filter({ hasText: /^· 已登記 2026-/ })).toHaveCount(3);

  await page.goto("/county/kinmen");
  await expect(page.getByText("本頁已核對 7 位登記人選")).toBeVisible();
  const kinmenPolicies = page.locator("#policies");
  await expect(kinmenPolicies.getByText("陳玉珍", { exact: true }).first()).toBeVisible();
  await expect(kinmenPolicies.getByText("3 / 7 人已有核驗資料", { exact: true })).toBeVisible();
  await expect(kinmenPolicies.getByText("已核驗 7 項 · 涵蓋 3 人", { exact: true })).toBeVisible();
  await expect(kinmenPolicies.getByText("尚無核驗資料", { exact: true })).toHaveCount(4);
});

test("資料狀態頁公開候選人與政見自動化覆蓋", async ({ page }) => {
  await page.goto("/data-status");
  await expect(page.getByText("81 人", { exact: true })).toBeVisible();
  await expect(page.getByText("22 / 22 縣市均已建立台帳")).toBeVisible();
  await expect(page.getByText("81 / 81", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "候選人登記台帳" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "候選人政見" })).toBeVisible();
});

test("縣市追蹤開關位置、狀態與本機保存", async ({ page }) => {
  await page.goto("/county/newtaipei");
  const trackingSwitch = page.getByRole("switch", { name: "追蹤新北市" });
  await expect(trackingSwitch).toHaveAttribute("aria-checked", "false");
  await trackingSwitch.click();
  await expect(page.getByRole("switch", { name: "停止追蹤新北市" })).toHaveAttribute("aria-checked", "true");
  await expect(page.getByText("已追蹤", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("switch", { name: "停止追蹤新北市" })).toHaveAttribute("aria-checked", "true");
});

test("來源台帳公開調查分組與核驗狀態", async ({ page }) => {
  await page.goto("/sources");
  await expect(page.getByRole("heading", { name: "民調來源台帳" })).toBeVisible();
  await expect(page.getByText("調查歸組")).toBeVisible();
  await expect(page.getByRole("heading", { name: "台中市" })).toBeVisible();
});

test("延遲載入區塊可由網址錨點直接抵達", async ({ page }) => {
  await page.goto("/#live-data");
  await expect(page.getByRole("heading", { name: "外部真實資料" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);

  await page.goto("/#trend");
  await expect(page.getByRole("heading", { name: "公開民調完整資料庫" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
});

test("日期與來源篩選可保存到網址", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "更多篩選" }).click();
  await page.locator('input[type="date"]').fill("2026-06-01");
  await expect(page).toHaveURL(/date=2026-06-01/);
  await expect(page.getByText(/正在查看截至 2026-06-01 的資料快照/)).toBeVisible();

  const sourceLabels = await page.locator("select").nth(1).locator("option").allTextContents();
  expect(sourceLabels).not.toContain("ETToday");
  expect(sourceLabels).not.toContain("NewTalk");

  await page.reload();
  await page.getByRole("button", { name: "更多篩選" }).click();
  await expect(page.locator('input[type="date"]')).toHaveValue("2026-06-01");
});
