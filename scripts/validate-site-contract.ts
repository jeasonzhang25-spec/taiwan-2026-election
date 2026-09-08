import { COUNTIES } from "../src/lib/data/counties";
import { COUNTY_PAGE_IDS } from "../src/lib/data/county-pages";
import { MAJOR_CITY_POLLS } from "../src/lib/data/polling";
import { POLICY_POSITIONS } from "../src/lib/data/policies";
import { inferExternalFeedKind } from "../src/lib/data/feed-classification";
import { canonicalInstituteName } from "../src/lib/data/source-names";
import { REGISTERED_MAYOR_CANDIDATES } from "../src/lib/data/candidate-registrations";
import auditData from "../src/lib/data/generated/poll-source-audit.json";
import candidateAudit from "../src/lib/data/generated/candidate-registration-audit.json";
import policyAudit from "../src/lib/data/generated/candidate-policy-audit.json";

const errors: string[] = [];
const allowedStatuses = new Set(["poll-option", "announced", "nominated", "registered", "qualified"]);

function check(condition: unknown, message: string) {
  if (!condition) errors.push(message);
}

check(COUNTIES.length === 22, `縣市數量應為 22，目前為 ${COUNTIES.length}`);
check(new Set(COUNTIES.map((county) => county.id)).size === 22, "縣市 ID 必須唯一");
check(new Set(COUNTY_PAGE_IDS).size === 22, "獨立頁 ID 必須完整且唯一");
check(COUNTIES.every((county) => COUNTY_PAGE_IDS.includes(county.id as typeof COUNTY_PAGE_IDS[number])), "每個縣市都必須有獨立頁");
check(Object.keys(REGISTERED_MAYOR_CANDIDATES).length === 22, "22 縣市登記名冊必須完整");
check(Object.values(REGISTERED_MAYOR_CANDIDATES).flat().length === 81, "全台縣市長登記人數應為 81");
check(COUNTY_PAGE_IDS.every((countyId) => (REGISTERED_MAYOR_CANDIDATES[countyId]?.length ?? 0) > 0), "每個縣市必須至少有一位登記人");

for (const county of COUNTIES) {
  const candidateIds = new Set(county.candidates.map((candidate) => candidate.id));
  check(candidateIds.size === county.candidates.length, `${county.name} 人選 ID 重複`);
  for (const candidate of county.candidates) {
    check(allowedStatuses.has(candidate.status ?? "poll-option"), `${county.name} ${candidate.name} 身分狀態無效`);
    if (candidate.status !== "poll-option") {
      check(Boolean(candidate.statusDate && candidate.statusSourceUrl), `${county.name} ${candidate.name} 的正式身分缺少日期或來源`);
    }
  }
  const records = MAJOR_CITY_POLLS[county.id] ?? [];
  for (const record of records) {
    check(Boolean(record.sourceUrl && /^https?:\/\//.test(record.sourceUrl)), `${record.id} 缺少有效來源網址`);
    for (const [candidateId, value] of Object.entries(record.results)) {
      check(candidateIds.has(candidateId), `${record.id} 引用了未知人選 ${candidateId}`);
      check(Number.isFinite(value) && value >= 0 && value <= 100, `${record.id} 支持度超出范围`);
    }
  }
  if (county.dataStatus === "verified-poll") {
    const values = Object.entries(county.latestSupport).sort((a, b) => b[1] - a[1]);
    check(candidateIds.has(county.leadingId), `${county.name} 領先者不在人選台帳`);
    check(values[0]?.[0] === county.leadingId, `${county.name} 領先者與支持度不一致`);
    const expectedMargin = Number(((values[0]?.[1] ?? 0) - (values[1]?.[1] ?? 0)).toFixed(2));
    check(Math.abs(expectedMargin - county.margin) < 0.01, `${county.name} 領先差距不一致`);
  }
}

for (const policy of POLICY_POSITIONS) {
  check(Boolean(policy.originalText && policy.sourceUrl && policy.publishedAt && policy.versionDate), `${policy.id} 政見缺少原文或版本欄位`);
  check(COUNTY_PAGE_IDS.includes(policy.countyId as typeof COUNTY_PAGE_IDS[number]), `${policy.id} 政見縣市無效`);
  check(["candidate-primary", "media-direct"].includes(policy.sourceKind), `${policy.id} 政見來源層級無效`);
  check(COUNTIES.find((county) => county.id === policy.countyId)?.candidates.some((candidate) => candidate.id === policy.candidateId), `${policy.id} 引用了未知人選`);
}

check(auditData.summary.recordCount === Object.values(MAJOR_CITY_POLLS).flat().length, "來源台帳與民調情境數量不一致");
check(auditData.summary.surveyCount === auditData.surveyGroups.length, "來源台帳調查分組數量不一致");
check(auditData.summary.sourceCount === auditData.sources.length, "來源台帳網址數量不一致");
check(candidateAudit.summary.countyCount === 22, "候選人核驗台帳未覆蓋 22 縣市");
check(candidateAudit.summary.candidateCount === 81, "候選人核驗台帳人數不一致");
check(candidateAudit.summary.blockingIssueCount === 0, "候選人核驗台帳存在阻擋發布問題");
check(policyAudit.summary.candidateCount === 81, "政見監測未覆蓋全部登記人");
check(policyAudit.summary.verifiedPolicyCount === POLICY_POSITIONS.filter((policy) => policy.status === "verified").length, "政見監測與已核驗資料數量不一致");
check(policyAudit.candidates.every((candidate) => COUNTIES.some((county) => county.candidates.some((item) => item.id === candidate.candidateId))), "政見監測含未知候選人");
check(inferExternalFeedKind("宣布不再做民調，要一票一票拚回來", "poll") === "news", "否定民調語境不可分類為民調發布");
check(inferExternalFeedKind("最新市長支持度民調出爐", "news") === "poll", "支持度民調標題應分類為民調");
check(canonicalInstituteName("ETToday") === "ETtoday", "ETtoday 名稱未正規化");
check(canonicalInstituteName("NewTalk") === "Newtalk", "Newtalk 名稱未正規化");
check(
  !Object.values(MAJOR_CITY_POLLS).flat().some((record) => record.source === "ETToday" || record.source === "NewTalk"),
  "民調來源篩選仍有未正規化名稱",
);

if (errors.length) {
  console.error(`P1 contract validation failed (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`P1 contract validation passed: ${COUNTIES.length} counties, ${Object.values(MAJOR_CITY_POLLS).flat().length} poll scenarios, ${auditData.surveyGroups.length} survey groups.`);
