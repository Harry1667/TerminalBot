# 終端機指令備忘

## pm2 開機自啟（只需執行一次）

```
sudo env PATH=$PATH:/opt/homebrew/Cellar/node/26.0.0/bin /opt/homebrew/lib/node_modules/pm2/bin/pm2 startup launchd -u gomigo --hp /Users/gomigo
```

---

## 日常管理指令

```bash
# 查看 TerminalBot 狀態
/opt/homebrew/bin/pm2 status

# 重啟
/opt/homebrew/bin/pm2 restart terminalbot

# 查看 log
/opt/homebrew/bin/pm2 logs terminalbot

# 停止
/opt/homebrew/bin/pm2 stop terminalbot

# 開啟 Web UI
open http://localhost:3700
```
