const { exec } = require('child_process');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const STATE_DB = path.join(
  process.env.HOME,
  'Library/Application Support/Antigravity/User/globalStorage/state.vscdb'
);

function getVisibleWindows() {
  return new Promise((resolve) => {
    const script = `
      tell application "System Events"
        tell process "Electron"
          set winNames to {}
          repeat with w in every window
            try
              set n to name of w
              if n is not "" then set end of winNames to n
            end try
          end repeat
          return winNames
        end tell
      end tell
    `;
    exec(`osascript -e '${script.trim()}'`, (err, stdout) => {
      if (err) return resolve([]);
      const names = stdout.trim().split(', ').map(n => n.trim()).filter(Boolean);
      resolve(names);
    });
  });
}

function getRecentWorkspaces() {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(STATE_DB, sqlite3.OPEN_READONLY, (err) => {
      if (err) return resolve([]);
    });
    db.get(
      "SELECT value FROM ItemTable WHERE key = 'history.recentlyOpenedPathsList'",
      (err, row) => {
        db.close();
        if (err || !row) return resolve([]);
        try {
          const data = JSON.parse(row.value);
          const folders = data.entries
            .filter(e => e.folderUri)
            .slice(0, 15)
            .map(e => {
              const uri = e.folderUri.replace('file://', '');
              const name = uri.split('/').pop();
              return { name, path: uri };
            });
          resolve(folders);
        } catch {
          resolve([]);
        }
      }
    );
  });
}

async function getWindows() {
  const [visible, recent] = await Promise.all([getVisibleWindows(), getRecentWorkspaces()]);

  const visibleSet = new Set(
    visible.map(v => v.split(' — ')[0].trim())
  );

  const result = [
    ...visible.map(v => ({ label: v, value: v, source: 'visible' })),
  ];

  for (const r of recent) {
    if (!visibleSet.has(r.name)) {
      result.push({ label: `${r.name}`, value: r.name, source: 'recent' });
    }
  }

  return result;
}

function injectToTerminal(text, targetWindow = 'any') {
  return new Promise((resolve, reject) => {
    const escaped = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    let focusScript;

    if (targetWindow === 'any') {
      focusScript = `
        tell application "Antigravity"
          activate
        end tell
        delay 0.8
        tell application "System Events"
          tell process "Electron"
            keystroke "v" using {command down}
            delay 0.3
            key code 36
          end tell
        end tell
      `;
    } else {
      const win = targetWindow.replace(/"/g, '\\"');
      focusScript = `
        tell application "Antigravity"
          activate
        end tell
        delay 0.5
        tell application "System Events"
          tell process "Electron"
            -- 先試精確比對，找不到再用部分比對
            set targetWin to missing value
            repeat with w in every window
              try
                set n to name of w
                if n is "${win}" or n starts with "${win}" then
                  set targetWin to w
                  exit repeat
                end if
              end try
            end repeat
            if targetWin is not missing value then
              perform action "AXRaise" of targetWin
              set focused of targetWin to true
            end if
          end tell
        end tell
        delay 0.5
        tell application "System Events"
          tell process "Electron"
            keystroke "v" using {command down}
            delay 0.3
            key code 36
          end tell
        end tell
      `;
    }

    const fullScript = `set the clipboard to "${escaped}"\n${focusScript}`;

    exec(`osascript -e '${fullScript.replace(/'/g, "'\\''")}'`, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message));
      else resolve();
    });
  });
}

module.exports = { getWindows, injectToTerminal };
