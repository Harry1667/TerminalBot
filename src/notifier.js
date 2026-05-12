const { exec } = require('child_process');

function notify(title, message) {
  const script = `display notification "${message}" with title "${title}" sound name "Glass"`;
  exec(`osascript -e '${script}'`);
}

module.exports = { notify };
