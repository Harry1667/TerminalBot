module.exports = {
  apps: [{
    name: 'terminalbot',
    script: './src/server.js',
    interpreter: '/opt/homebrew/bin/node',
    cwd: '/Users/gomigo/Documents/0-Dev/1-WebDev/Unfinished/16-TerminalBot',
    restart_delay: 3000,
    max_restarts: 10,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
