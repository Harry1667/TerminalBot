# TerminalBot — 技術棧

## 架構總覽

```
[Web UI]  ←→  [Express Server + Scheduler Daemon]  →  [osascript]  →  [Antigravity Terminal]
  瀏覽器          Node.js 背景程序 + SQLite                AppleScript      Claude CLI
```

---

## 各層技術選型

### 後端 / 排程守護程序
| 項目 | 選擇 | 原因 |
|------|------|------|
| Runtime | **Node.js** | 輕量、生態豐富、macOS 原生支援 |
| HTTP Server | **Express** | 同時服務 API 和靜態前端，一個程序搞定 |
| 排程 | **node-cron** | 支援精確到秒的 cron 語法，輕量無依賴 |
| 資料庫 | **SQLite（better-sqlite3）** | 本機單檔，無需安裝資料庫服務；同步 API 簡單 |
| 程序管理 | **pm2** | 開機自動啟動、crash 自動重啟、log 管理 |

### 終端機注入
| 項目 | 選擇 | 原因 |
|------|------|------|
| 注入方式 | **osascript（AppleScript）** | macOS 原生，可控制 Antigravity GUI |
| 呼叫方式 | Node.js `child_process.exec` 執行 shell | 不需額外套件 |

AppleScript 注入邏輯：
1. 找到名稱含 "Ghostty"（Antigravity 底層）的視窗
2. `tell application` 啟動並置前
3. `keystroke` 貼入文字
4. `key code 36`（Enter）送出

### 前端介面
| 項目 | 選擇 | 原因 |
|------|------|------|
| 框架 | **Vanilla HTML + CSS + JS** | 功能簡單，不值得引入 React；零建置步驟 |
| 樣式 | **手寫 CSS（深色主題）** | 配合終端機使用者的視覺習慣 |
| 時間選擇器 | **原生 `<input type="datetime-local">`** | 不需第三方套件 |

### macOS 通知
```bash
osascript -e 'display notification "Claude 開始執行任務" with title "TerminalBot"'
```
不需要任何套件，直接用 osascript。

---

## 專案目錄結構

```
16-TerminalBot/
├── src/
│   ├── server.js          # Express server + API routes
│   ├── scheduler.js       # node-cron 排程邏輯
│   ├── injector.js        # AppleScript 注入邏輯
│   ├── db.js              # SQLite 資料庫操作
│   └── notifier.js        # macOS 通知
├── public/
│   ├── index.html         # Web UI 主頁
│   ├── style.css
│   └── app.js             # 前端 JS
├── data/
│   └── tasks.db           # SQLite 資料庫（自動生成）
├── scripts/
│   └── test-inject.applescript  # 注入功能測試腳本
├── package.json
└── ecosystem.config.js    # pm2 設定
```

---

## API 設計

| Method | Path | 說明 |
|--------|------|------|
| GET | `/api/tasks` | 取得所有排程任務 |
| POST | `/api/tasks` | 新增排程任務 |
| DELETE | `/api/tasks/:id` | 刪除任務 |
| PATCH | `/api/tasks/:id` | 編輯任務（僅待執行中可編輯） |
| POST | `/api/tasks/:id/run` | 立即手動執行（測試用） |

### Task 資料結構
```json
{
  "id": 1,
  "prompt": "我要寫一個關於狗狗的網站",
  "scheduled_at": "2026-05-13T09:00:00",
  "status": "pending",      // pending | running | done | failed
  "created_at": "2026-05-12T23:30:00",
  "executed_at": null
}
```

---

## 系統需求

- macOS 12+
- Node.js 18+
- 系統偏好設定 → 隱私權與安全性 → 輔助使用：需授予終端機程序權限
- Antigravity 必須保持開啟（不可關閉）
- 電腦不可進入睡眠（系統偏好 → 電池 → 關閉顯示器但不睡眠）

---

## 未來可升級項目（v2）

- 包成 macOS Menu Bar App（使用 Electron 或 Tauri）
- 用 `pmset` 排程喚醒，允許電腦睡眠
- 偵測 Claude 閒置狀態，支援任務串接執行
