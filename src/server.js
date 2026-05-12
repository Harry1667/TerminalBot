const express = require('express');
const path = require('path');
const db = require('./db');
const { injectToTerminal, getWindows } = require('./injector');
const { start: startScheduler } = require('./scheduler');

const app = express();
const PORT = 3700;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/windows', async (req, res) => {
  try {
    const windows = await getWindows();
    res.json(windows);
  } catch (err) {
    res.json([]);
  }
});

app.get('/api/tasks', async (req, res) => {
  const tasks = await db.all();
  res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
  const { prompt, scheduled_at, target_window } = req.body;
  if (!prompt || !scheduled_at) {
    return res.status(400).json({ error: '缺少 prompt 或 scheduled_at' });
  }
  const task = await db.create(prompt, scheduled_at, target_window || 'any');
  res.json(task);
});

app.delete('/api/tasks/:id', async (req, res) => {
  await db.remove(req.params.id);
  res.json({ ok: true });
});

app.post('/api/tasks/:id/run', async (req, res) => {
  const tasks = await db.all();
  const task = tasks.find(t => t.id == req.params.id);
  if (!task) return res.status(404).json({ error: '找不到任務' });

  try {
    await injectToTerminal(task.prompt, task.target_window);
    await db.updateStatus(task.id, 'done');
    res.json({ ok: true });
  } catch (err) {
    await db.updateStatus(task.id, 'failed');
    res.status(500).json({ error: err.message });
  }
});

startScheduler();

app.listen(PORT, () => {
  console.log(`TerminalBot 已啟動：http://localhost:${PORT}`);
});
