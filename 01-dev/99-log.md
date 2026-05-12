# TerminalBot — 行動計畫 & 開發日誌

## 行動計畫

### Phase 0：技術可行性驗證（第一天，30 分鐘）
> 目標：確認 AppleScript 可以控制 Antigravity，這是整個專案的命脈

- [ ] 0-1 寫一個最小的 AppleScript 測試腳本
- [ ] 0-2 在 Antigravity 中開啟 Claude，執行腳本，確認文字能注入並送出
- [ ] 0-3 確認需要哪些 macOS 輔助使用權限，一次開好

**若此步失敗**：改用 `cliclick` 方案或 tmux 方案，不繼續往後做。

---

### Phase 1：後端核心（第一天，2-3 小時）
> 目標：排程系統可以在時間到時觸發注入

- [ ] 1-1 `npm init`，安裝 express、better-sqlite3、node-cron
- [ ] 1-2 寫 `db.js`：建立 tasks 表，CRUD 函數
- [ ] 1-3 寫 `injector.js`：封裝 AppleScript 執行邏輯
- [ ] 1-4 寫 `scheduler.js`：每分鐘掃描 pending 任務，時間到就注入
- [ ] 1-5 寫 `server.js`：Express + 5 個 API routes
- [ ] 1-6 用 curl 測試 API，確認排程到期後確實注入

---

### Phase 2：前端介面（第二天，2-3 小時）
> 目標：有個好用的網頁可以新增、查看、刪除排程

- [ ] 2-1 `public/index.html`：任務清單 + 新增表單
- [ ] 2-2 `public/style.css`：深色主題，清爽乾淨
- [ ] 2-3 `public/app.js`：串接 API，即時更新清單
- [ ] 2-4 時間選擇器：日期 + 時間，顯示「距離執行還有 X 小時」

---

### Phase 3：可靠性補強（第二天下午，1 小時）
> 目標：讓它真的可以放著睡覺

- [ ] 3-1 加入 macOS 通知（任務開始 / 失敗）
- [ ] 3-2 設定 pm2：`pm2 start`，`pm2 startup` 開機自啟
- [ ] 3-3 測試完整流程：設排程 → 等待 → 自動注入 → 通知送出
- [ ] 3-4 設定電腦不睡眠提示（在 UI 上顯示提醒）

---

### Phase 4：收尾（選配）
- [ ] 4-1 執行歷史頁面（看過去跑了什麼）
- [ ] 4-2 支援多行提示詞（textarea）
- [ ] 4-3 「立即執行」按鈕，方便測試

---

## 開發日誌

### 2026-05-12
- 確定需求：AppleScript 注入 Antigravity + Web UI 排程介面
- 完成技術棧文件（3-TechStack.md）
- 確定行動計畫，下一步：Phase 0 測試 AppleScript
