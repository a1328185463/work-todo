(function () {
  'use strict';

  const STORAGE_KEY = 'cloud-todo-items-v1';

  /** @type {{id: string, text: string, done: boolean, createdAt: number}[]} */
  let todos = load();
  let filter = 'all';

  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  const emptyState = document.getElementById('empty-state');
  const filters = document.getElementById('filters');
  const clearDone = document.getElementById('clear-done');

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (err) {
      /* 存储不可用时静默降级，不影响当前会话 */
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function visible() {
    if (filter === 'active') return todos.filter((t) => !t.done);
    if (filter === 'done') return todos.filter((t) => t.done);
    return todos;
  }

  function render() {
    list.innerHTML = '';
    const items = visible();

    for (const todo of items) {
      const li = document.createElement('li');
      li.className = 'todo' + (todo.done ? ' is-done' : '');
      li.dataset.id = todo.id;

      const check = document.createElement('button');
      check.type = 'button';
      check.className = 'todo__check';
      check.setAttribute('aria-label', todo.done ? '标记为未完成' : '标记为已完成');
      check.addEventListener('click', () => toggle(todo.id));

      const span = document.createElement('span');
      span.className = 'todo__text';
      span.textContent = todo.text;

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'todo__remove';
      remove.setAttribute('aria-label', '删除待办');
      remove.textContent = '×';
      remove.addEventListener('click', () => removeTodo(todo.id));

      li.append(check, span, remove);
      list.appendChild(li);
    }

    emptyState.hidden = items.length > 0;
    if (!items.length) {
      emptyState.textContent = todos.length
        ? '这个筛选条件下暂无待办。'
        : '还没有待办，先添加一件小事吧。';
    }

    document.getElementById('count-all').textContent = String(todos.length);
    document.getElementById('count-active').textContent = String(todos.filter((t) => !t.done).length);
    document.getElementById('count-done').textContent = String(todos.filter((t) => t.done).length);
  }

  function add(text) {
    const value = text.trim();
    if (!value) return;
    todos.unshift({ id: uid(), text: value, done: false, createdAt: Date.now() });
    save();
    render();
  }

  function toggle(id) {
    todos = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    save();
    render();
  }

  function removeTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    save();
    render();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    add(input.value);
    input.value = '';
    input.focus();
  });

  filters.addEventListener('click', (event) => {
    const btn = event.target.closest('.filter');
    if (!btn) return;
    filter = btn.dataset.filter || 'all';
    [...filters.querySelectorAll('.filter')].forEach((el) => {
      el.classList.toggle('is-active', el === btn);
    });
    render();
  });

  clearDone.addEventListener('click', () => {
    todos = todos.filter((t) => !t.done);
    save();
    render();
  });

  render();
})();
