const taskList = document.getElementById('taskList');
const addBtn = document.getElementById('addBtn');
const promptInput = document.getElementById('prompt');
const scheduledAtInput = document.getElementById('scheduled_at');
const targetWindowSelect = document.getElementById('target_window');
const refreshWindowsBtn = document.getElementById('refreshWindows');

async function loadWindows() {
  const res = await fetch('/api/windows');
  const windows = await res.json();
  const current = targetWindowSelect.value;
  targetWindowSelect.innerHTML = '<option value="any">任何視窗（當前焦點）</option>';
  windows.forEach(w => {
    const opt = document.createElement('option');
    opt.value = w;
    opt.textContent = w;
    if (w === current) opt.selected = true;
    targetWindowSelect.appendChild(opt);
  });
}

refreshWindowsBtn.addEventListener('click', () => {
  loadWindows();
  showToast('視窗清單已更新');
});

// 預設時間為明天早上 9 點
function setDefaultTime() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  const iso = tomorrow.toISOString().slice(0, 16);
  scheduledAtInput.value = iso;
}

function countdown(scheduled_at) {
  const diff = new Date(scheduled_at) - new Date();
  if (diff <= 0) return '已到時間';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h} 小時 ${m} 分後執行`;
  return `${m} 分鐘後執行`;
}

function statusLabel(status) {
  const map = { pending: '待機中', running: '執行中', done: '已完成', failed: '失敗' };
  return map[status] || status;
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

async function loadTasks() {
  const res = await fetch('/api/tasks');
  const tasks = await res.json();

  if (tasks.length === 0) {
    taskList.innerHTML = '<div class="empty">還沒有排程任務<br>在上方新增你要 Claude 執行的指令</div>';
    return;
  }

  taskList.innerHTML = tasks.map(t => `
    <div class="task-card">
      <div class="task-status status-${t.status}"></div>
      <div class="task-body">
        <div class="task-prompt">${escHtml(t.prompt)}</div>
        <div class="task-meta">
          <span>${statusLabel(t.status)}</span>
          <span>排定 ${formatTime(t.scheduled_at)}</span>
          ${t.status === 'pending' ? `<span class="task-countdown">${countdown(t.scheduled_at)}</span>` : ''}
          <span class="task-window">${t.target_window === 'any' ? '任何視窗' : '⌗ ' + t.target_window}</span>
          ${t.executed_at ? `<span>執行於 ${formatTime(t.executed_at)}</span>` : ''}
        </div>
      </div>
      <div class="task-actions">
        ${t.status === 'pending' ? `<button class="btn-run" onclick="runNow(${t.id})">立即執行</button>` : ''}
        <button class="btn-delete" onclick="deleteTask(${t.id})">刪除</button>
      </div>
    </div>
  `).join('');
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

addBtn.addEventListener('click', async () => {
  const prompt = promptInput.value.trim();
  const scheduled_at = scheduledAtInput.value;
  const target_window = targetWindowSelect.value;
  if (!prompt) return showToast('請輸入指令內容');
  if (!scheduled_at) return showToast('請選擇執行時間');
  if (new Date(scheduled_at) <= new Date()) return showToast('執行時間必須在未來');

  addBtn.disabled = true;
  addBtn.textContent = '新增中...';

  await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, scheduled_at, target_window })
  });

  promptInput.value = '';
  setDefaultTime();
  addBtn.disabled = false;
  addBtn.textContent = '開始待機';
  showToast('已新增排程，等你睡醒');
  loadTasks();
});

async function deleteTask(id) {
  await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  loadTasks();
}

async function runNow(id) {
  showToast('注入中...');
  const res = await fetch(`/api/tasks/${id}/run`, { method: 'POST' });
  const data = await res.json();
  if (data.ok) showToast('已送出到 Claude');
  else showToast('失敗：' + data.error);
  loadTasks();
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

setDefaultTime();
loadWindows();
loadTasks();
setInterval(loadTasks, 30000);
