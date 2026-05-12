const { exec } = require('child_process');

function getWindows() {
  return new Promise((resolve, reject) => {
    const script = `
      tell application "System Events"
        tell process "Electron"
          get name of every window
        end tell
      end tell
    `;
    exec(`osascript -e '${script.trim()}'`, (err, stdout) => {
      if (err) return reject(err);
      const names = stdout.trim().split(', ').map(n => n.trim()).filter(Boolean);
      resolve(names);
    });
  });
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
            set targetWin to first window whose name is "${win}"
            perform action "AXRaise" of targetWin
            set focused of targetWin to true
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
