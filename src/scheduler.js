const cron = require('node-cron');
const db = require('./db');
const { injectToTerminal } = require('./injector');
const { notify } = require('./notifier');

function start() {
  // 每分鐘掃一次 pending 任務
  cron.schedule('* * * * *', async () => {
    const tasks = await db.getPending();
    const now = new Date();

    for (const task of tasks) {
      const scheduledAt = new Date(task.scheduled_at);
      if (scheduledAt <= now) {
        console.log(`[scheduler] 執行任務 #${task.id}: ${task.prompt}`);
        await db.updateStatus(task.id, 'running');
        notify('TerminalBot', `開始執行：${task.prompt.slice(0, 30)}`);

        try {
          await injectToTerminal(task.prompt, task.target_window);
          await db.updateStatus(task.id, 'done');
          console.log(`[scheduler] 任務 #${task.id} 完成`);
        } catch (err) {
          await db.updateStatus(task.id, 'failed');
          notify('TerminalBot ⚠️', `任務失敗：${err.message}`);
          console.error(`[scheduler] 任務 #${task.id} 失敗:`, err.message);
        }
      }
    }
  });

  console.log('[scheduler] 排程器啟動，每分鐘掃描一次');
}

module.exports = { start };
