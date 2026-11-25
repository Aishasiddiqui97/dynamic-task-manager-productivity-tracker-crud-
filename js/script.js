let tasks = [];
let currentFilter = 'all';
let searchQuery = '';

const STORAGE_KEY = 'taskflow_tasks';

function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Save failed', e);
  }
}

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Load failed', e);
    return [];
  }
}

function generateId() {
  return 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
}

function isOverdue(task) {
  if (!task.dueDate || task.completed) return false;
  const today = new Date();
  today.setHours(0,0,0,0);
  const due = new Date(task.dueDate);
  return due < today;
}

function updateStatistics() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active = total - completed;
  const pending = tasks.filter(t => !t.completed && isOverdue(t)).length;
  document.getElementById('statTotal').textContent = total;
  document.getElementById('statActive').textContent = active;
  document.getElementById('statCompleted').textContent = completed;
  document.getElementById('statPending').textContent = pending;
}

function showNotification(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function addTask() {
  const title = document.getElementById('taskTitle').value.trim();
  const desc = document.getElementById('taskDesc').value.trim();
  const category = document.getElementById('taskCategory').value;
  const due = document.getElementById('taskDue').value;
  const priority = document.getElementById('taskPriority').value;
  if (!title) { showNotification('Title is required'); return; }
  const task = {
    id: generateId(),
    title, description: desc, category, dueDate: due, priority,
    completed: false, createdAt: Date.now()
  };
  tasks.unshift(task);
  saveToLocalStorage();
  renderTasks();
  updateStatistics();
  document.getElementById('taskForm').reset();
  document.getElementById('formSection').hidden = true;
  showNotification('Task added');
}

function toggleTaskCompletion(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveToLocalStorage();
  renderTasks();
  updateStatistics();
  if (task.completed) {
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) card.classList.add('just-completed');
  }
  showNotification(task.completed ? 'Task completed' : 'Task reopened');
}

function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  tasks = tasks.filter(t => t.id !== id);
  saveToLocalStorage();
  renderTasks();
  updateStatistics();
  showNotification('Task deleted');
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  const newTitle = prompt('Edit title:', task.title);
  if (newTitle === null) return;
  const newDesc = prompt('Edit description:', task.description);
  if (newDesc === null) return;
  const newCat = prompt('Edit category (Work/Personal/Study/Other):', task.category);
  if (newCat === null) return;
  const newDue = prompt('Edit due date (YYYY-MM-DD):', task.dueDate);
  if (newDue === null) return;
  const newPri = prompt('Edit priority (Low/Medium/High):', task.priority);
  if (newPri === null) return;
  task.title = newTitle.trim() || task.title;
  task.description = newDesc.trim();
  if (['Work','Personal','Study','Other'].includes(newCat)) task.category = newCat;
  task.dueDate = newDue;
  if (['Low','Medium','High'].includes(newPri)) task.priority = newPri;
  saveToLocalStorage();
  renderTasks();
  updateStatistics();
  showNotification('Task updated');
}

function filterTasks() {
  let result = [...tasks];
  if (currentFilter === 'active') result = result.filter(t => !t.completed);
  else if (currentFilter === 'completed') result = result.filter(t => t.completed);
  else if (['Work','Personal','Study','Other'].includes(currentFilter)) result = result.filter(t => t.category === currentFilter);
  else if (['High','Medium','Low'].includes(currentFilter)) result = result.filter(t => t.priority === currentFilter);
  else if (currentFilter === 'overdue') result = result.filter(t => isOverdue(t));
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    result = result.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.description||'').toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  }
  return result;
}

function renderTasks() {
  const container = document.getElementById('tasksContainer');
  const empty = document.getElementById('emptyState');
  const filtered = filterTasks();
  container.innerHTML = '';
  if (filtered.length === 0) { empty.hidden = false; return; }
  empty.hidden = true;
  filtered.forEach(task => {
    const card = document.createElement('div');
    card.className = 'task-card' + (task.completed ? ' completed' : '') + (isOverdue(task) ? ' overdue' : '');
    card.draggable = true;
    card.dataset.id = task.id;
    card.innerHTML = `
      <div class="task-header">
        <span class="task-title">${escapeHtml(task.title)}</span>
        <span class="badge priority-${task.priority}">${task.priority}</span>
      </div>
      <div class="task-desc">${escapeHtml(task.description || '')}</div>
      <div class="task-meta">
        <span class="badge">${task.category}</span>
        ${task.dueDate ? `<span class="badge ${isOverdue(task)?'overdue':''}">Due: ${task.dueDate}</span>` : ''}
        ${task.completed ? '<span class="badge">Completed</span>' : ''}
      </div>
      <div class="task-actions">
        <button data-action="toggle">${task.completed ? 'Reopen' : 'Complete'}</button>
        <button data-action="edit">Edit</button>
        <button data-action="delete" class="danger">Delete</button>
      </div>
    `;
    card.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const action = btn.dataset.action;
        if (action === 'toggle') toggleTaskCompletion(task.id);
        else if (action === 'edit') editTask(task.id);
        else if (action === 'delete') deleteTask(task.id);
      });
    });
    // drag and drop
    card.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', task.id);
      card.style.opacity = '0.5';
    });
    card.addEventListener('dragend', () => { card.style.opacity = '1'; });
    card.addEventListener('dragover', e => { e.preventDefault(); });
    card.addEventListener('drop', e => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData('text/plain');
      if (draggedId === task.id) return;
      const fromIndex = tasks.findIndex(t => t.id === draggedId);
      const toIndex = tasks.findIndex(t => t.id === task.id);
      if (fromIndex < 0 || toIndex < 0) return;
      const [moved] = tasks.splice(fromIndex, 1);
      tasks.splice(toIndex, 0, moved);
      saveToLocalStorage();
      renderTasks();
    });
    container.appendChild(card);
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function clearCompletedTasks() {
  if (!confirm('Clear all completed tasks?')) return;
  tasks = tasks.filter(t => !t.completed);
  saveToLocalStorage();
  renderTasks();
  updateStatistics();
  showNotification('Completed tasks cleared');
}

function setFilter(f) {
  currentFilter = f;
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === f);
  });
  renderTasks();
}

document.addEventListener('DOMContentLoaded', () => {
  tasks = loadFromLocalStorage();
  renderTasks();
  updateStatistics();
  document.getElementById('currentDate').textContent = new Date().toLocaleDateString();

  document.getElementById('addTaskBtn').addEventListener('click', () => {
    document.getElementById('formSection').hidden = false;
  });
  document.getElementById('cancelForm').addEventListener('click', () => {
    document.getElementById('formSection').hidden = true;
  });
  document.getElementById('taskForm').addEventListener('submit', e => {
    e.preventDefault();
    addTask();
  });
  document.getElementById('searchInput').addEventListener('input', e => {
    searchQuery = e.target.value;
    renderTasks();
  });
  document.getElementById('clearCompleted').addEventListener('click', clearCompletedTasks);
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });
  document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem('taskflow_theme', document.body.classList.contains('light') ? 'light' : 'dark');
  });
  if (localStorage.getItem('taskflow_theme') === 'light') document.body.classList.add('light');

  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
});
