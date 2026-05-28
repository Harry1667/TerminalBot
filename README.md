# TerminalBot

排程 Prompt 注入工具 — 在指定時間自動將文字注入 macOS 視窗（VSCode、終端機等 Electron App），解放重複性 AI 工作流程。

## 功能
- 建立排程任務（Prompt + 執行時間 + 目標視窗）
- 自動偵測可用的 macOS Electron 視窗
- 時間到自動注入文字並送出（AppleScript 驅動）
- Web UI 管理介面（port 3700）
- SQLite 持久化任務清單

## 技術棧
- Node.js + Express
- SQLite + node-cron
- AppleScript（macOS 視窗控制）

## 啟動
```bash
npm start
# → http://localhost:3700
```

---

## English

A scheduled prompt-injection tool — fires text into macOS windows (VSCode, Terminal, and other Electron apps) at a chosen time, automating repetitive AI workflows.

### Features
- Schedule a task: prompt + run time + target window
- Auto-detects open macOS Electron windows
- At the scheduled moment, types the text and submits it (driven by AppleScript)
- Web UI for managing tasks (port 3700)
- Tasks persisted in SQLite

### Tech stack
- Node.js + Express
- SQLite + node-cron
- AppleScript (macOS window control)

### Run
```bash
npm start
# → http://localhost:3700
```
