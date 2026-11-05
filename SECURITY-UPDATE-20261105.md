# Rat 本機衝突解決與依賴修補 — 2026-11-05

> 此文件保存推送前的本機修補與測試紀錄；「尚未提交／推送」是當時狀態。後續已獲准提交至修復分支並更新／建立草稿 PR；實際結果以 PR 與 commit 狀態為準，仍不合併、不部署、不執行 npm audit。

在隔離 clone 的 fix/security-20261105 處理，原 checkout 與 GitHub PR 完全未修改。HEAD 仍是 PR #11 的 `1a3f18702eabae27dfc87d26c30d95ac4d3810e5`，沒有建立提交。

## 衝突分析

已取回 PR #10 的目前 head（current-security-base）並在隔離副本嘗試合併；唯一衝突是 playwright.config.ts 的 add/add。兩邊 tests/e2e/navigation.spec.ts 完全相同，沒有應用語意衝突。

合併後保留兩邊意圖：

- PR #11 的 testDir ./tests，保留新增 smoke.spec.ts 的 3 項測試，加上 e2e/navigation.spec.ts 的 2 項測試。
- PR #11 的 locale en-US 與 reuseExistingServer: false，避免誤用既有本機服務。
- PR #10 的 CI forbidOnly、重試／reporter、trace、Chromium Desktop project 與 120 秒啟動 timeout。
- 兩邊 loopback／strictPort 及測試阻擋外部服務的規則保留。

衝突已解決，沒有未解決 index entries；merge --quit 已清除 merge 進行狀態，最終是可審查的未提交差異。GitHub #11 仍可能顯示衝突，因未推送任何變更。

## 依賴變更

glob 10.5.0 與 Workbox 的 11.1.0 → 14.0.2；minimatch 9.0.9 / 10.2.6 → 11.0.3。只對受影響版本範圍覆寫，保留 filelist 的 minimatch 5.1.9 和 ESLint 的 3.1.5。既有 Vite 6.4.5、lodash 4.18.1 及安全修補保留。

官方依據：[glob CVE-2026-118773](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4)、[minimatch CVE-2026-118764](https://github.com/advisories/GHSA-g3hv-75wg-m249)。

## 驗證

- npm install --package-lock-only 與 npm ci 通過，均 --ignore-scripts --no-audit。
- PWA production build 通過，實際 exercise Workbox 對新版 glob 的使用。
- security/delete-account.test.cjs 與 private-cache.test.cjs：4 項 mocked 安全測試通過，未執行真實刪帳號。
- Playwright：全部 5 項測試通過，包含 PR #10 與 #11 的測試；使用現有 Chrome 與 loopback Vite，所有外部服務阻擋。
- 本機 wrapper 只把 browser channel 改成已安裝的 Chrome，並把 artifacts 寫入本次 evidence；保留實際 config 的 project、locale、testDir、server 與 CI 設定。沒有下載瀏覽器。
- lint：既有 163 errors / 26 warnings，沒有藉本次變更停用規則。
- npm audit 依指示未執行。沒有 AGENTS.md 或 .agents/skills 指示。

本次是依賴／測試設定維護，無應用機制、UI 或資料契約變更；既有 SQL／Edge／PWA 修補尚未部署的待辦仍保留。未提交、推送、修改 PR、部署或發佈。

建議 commit：`fix(security): reconcile browser tests and patch glob dependencies`。

## GitHub CI 範圍

Playwright workflow 的 pull_request 分支篩選納入既有 security base，讓此堆疊 PR 可以執行原有測試；npm ci 明確加上 --no-audit --no-fund，避免未授權的依賴樹 audit 傳輸。
