/**
 * app.js — To-Do List Manager
 * ============================
 * Architecture:
 *   - State:   A single `tasks` array is the source of truth.
 *   - Storage: Tasks are serialised to / from localStorage on every change.
 *   - Render:  One `render()` function re-draws the list from state.
 *              Transitions are handled by CSS animations; JS only adds/removes classes.
 *
 * Data model (one task object):
 * {
 *   id:        string   — unique ID (Date.now() + random suffix)
 *   text:      string   — the task label
 *   done:      boolean  — completion status
 *   createdAt: number   — Unix timestamp (ms) for ordering
 * }
 */

'use strict';

/* ================================================================
   CONSTANTS & DOM REFERENCES
================================================================ */

/** Key used to read/write tasks in localStorage */
const STORAGE_KEY = 'todo-app-tasks';

// DOM nodes we reference throughout the app
const taskInput    = document.getElementById('taskInput');
const addBtn       = document.getElementById('addBtn');
const taskList     = document.getElementById('taskList');
const taskCounter  = document.getElementById('taskCounter');
const inputError   = document.getElementById('inputError');
const emptyState   = document.getElementById('emptyState');
const cardFooter   = document.getElementById('cardFooter');
const footerInfo   = document.getElementById('footerInfo');
const clearDoneBtn = document.getElementById('clearDoneBtn');
const filterBtns   = document.querySelectorAll('.filters__btn');


/* ================================================================
   STATE
================================================================ */

/**
 * In-memory task list.
 * Always kept in sync with localStorage via `saveTasks()`.
 * @type {Array<{id: string, text: string, done: boolean, createdAt: number}>}
 */
let tasks = loadTasks();

/**
 * The currently active filter.
 * @type {'all' | 'active' | 'done'}
 */
let currentFilter = 'all';


/* ================================================================
   PERSISTENCE HELPERS
================================================================ */

/**
 * Read and parse the task array from localStorage.
 * Returns an empty array if nothing is stored or data is corrupt.
 * @returns {Array}
 */
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    // If JSON is corrupt, start fresh
    return [];
  }
}

/**
 * Serialise the current task array to localStorage.
 */
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}


/* ================================================================
   TASK HELPERS
================================================================ */

/**
 * Generate a lightweight unique ID for a new task.
 * Using Date.now() + Math.random() avoids crypto-API dependency.
 * @returns {string}
 */
function generateId() {
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/**
 * Return the filtered subset of tasks based on `currentFilter`.
 * @returns {Array}
 */
function getFilteredTasks() {
  switch (currentFilter) {
    case 'active': return tasks.filter(t => !t.done);
    case 'done':   return tasks.filter(t => t.done);
    default:       return tasks;                     // 'all'
  }
}


/* ================================================================
   CORE ACTIONS
================================================================ */

/**
 * Add a new task to the list.
 * Validates input, updates state, persists, and re-renders.
 */
function addTask() {
  const text = taskInput.value.trim();

  // --- Validation ---
  if (!text) {
    showInputError();
    return;
  }

  // Clear any previous error
  clearInputError();

  // Build the new task object
  const newTask = {
    id:        generateId(),
    text,
    done:      false,
    createdAt: Date.now(),
  };

  // Prepend so newest tasks appear at the top
  tasks.unshift(newTask);
  saveTasks();

  // Reset the input field
  taskInput.value = '';
  taskInput.focus();

  // Re-render the list; the CSS entry animation fires automatically
  render();
}

/**
 * Toggle the completion state of a task by its ID.
 * @param {string} id
 */
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.done = !task.done;
  saveTasks();
  render();
}

/**
 * Remove a task by its ID.
 * Plays a CSS exit animation before removing the DOM node and re-rendering.
 * @param {string} id
 */
function deleteTask(id) {
  // Find the list item DOM node currently rendered for this task
  const item = taskList.querySelector(`[data-id="${id}"]`);

  if (item) {
    // Trigger the CSS slideOut animation
    item.classList.add('removing');

    // Wait for the animation to finish (matches CSS animation duration = 400 ms)
    item.addEventListener('animationend', () => {
      // Remove from state and persist
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      // Re-render the full list (the DOM node is already gone via animation)
      render();
    }, { once: true });
  } else {
    // Fallback if item wasn't found in the DOM (e.g. filtered out)
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
  }
}

/**
 * Delete every completed task at once.
 */
function clearCompleted() {
  // Collect IDs to delete
  const doneIds = tasks.filter(t => t.done).map(t => t.id);
  if (!doneIds.length) return;

  // Animate each visible done item out, then purge state
  let animationsLeft = 0;

  doneIds.forEach(id => {
    const item = taskList.querySelector(`[data-id="${id}"]`);
    if (item) {
      animationsLeft++;
      item.classList.add('removing');
      item.addEventListener('animationend', () => {
        animationsLeft--;
        if (animationsLeft === 0) {
          tasks = tasks.filter(t => !t.done);
          saveTasks();
          render();
        }
      }, { once: true });
    }
  });

  // Fallback: if no items were visible (e.g. filter hid them), purge directly
  if (animationsLeft === 0) {
    tasks = tasks.filter(t => !t.done);
    saveTasks();
    render();
  }
}


/* ================================================================
   VALIDATION UI
================================================================ */

/** Show the error state on the input field */
function showInputError() {
  taskInput.classList.add('is-error');
  inputError.classList.add('is-visible');

  // Auto-clear the error after 2.5 s so it doesn't linger
  setTimeout(clearInputError, 2500);
}

/** Remove the error state from the input field */
function clearInputError() {
  taskInput.classList.remove('is-error');
  inputError.classList.remove('is-visible');
}


/* ================================================================
   RENDER
================================================================ */

/**
 * The single source of truth for what appears on screen.
 * Clears and re-builds the task list from the current state & filter.
 * Also updates the counter badge, empty state, and footer.
 */
function render() {
  const filtered   = getFilteredTasks();
  const doneCount  = tasks.filter(t => t.done).length;
  const totalCount = tasks.length;
  const activeCount = totalCount - doneCount;

  // ── Clear existing rendered items ──────────────────────────
  taskList.innerHTML = '';

  // ── Render each task item ──────────────────────────────────
  filtered.forEach(task => {
    const li = createTaskElement(task);
    taskList.appendChild(li);
  });

  // ── Empty state ────────────────────────────────────────────
  // Show the placeholder only when the *filtered* view is empty
  emptyState.hidden = filtered.length > 0;

  // ── Counter badge ─────────────────────────────────────────
  const label = totalCount === 1 ? 'task' : 'tasks';
  taskCounter.textContent = `${totalCount} ${label}`;

  // Trigger the "pop" micro-animation on the badge
  taskCounter.classList.remove('pop');
  // Force a reflow so the class can be re-applied on the same tick
  void taskCounter.offsetWidth;
  taskCounter.classList.add('pop');

  // ── Footer (shown only when there are tasks) ───────────────
  cardFooter.hidden = totalCount === 0;
  footerInfo.textContent =
    `${activeCount} remaining · ${doneCount} completed`;
}

/**
 * Build and return a `<li>` DOM element for a single task.
 * All interactivity is wired up via event listeners.
 * @param {{id: string, text: string, done: boolean}} task
 * @returns {HTMLLIElement}
 */
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task-item${task.done ? ' is-done' : ''}`;
  li.dataset.id = task.id;

  // ── Checkbox (native input + label pair for accessibility) ──
  const checkboxId = `chk-${task.id}`;

  const checkbox = document.createElement('input');
  checkbox.type    = 'checkbox';
  checkbox.id      = checkboxId;
  checkbox.checked = task.done;
  checkbox.className = 'task-item__checkbox';
  checkbox.setAttribute('aria-label', `Mark "${task.text}" as ${task.done ? 'incomplete' : 'complete'}`);

  // Toggling completion
  checkbox.addEventListener('change', () => toggleTask(task.id));

  const checkboxLabel = document.createElement('label');
  checkboxLabel.htmlFor   = checkboxId;
  checkboxLabel.className = 'task-item__checkbox-label';
  checkboxLabel.setAttribute('aria-hidden', 'true');   // label is decorative; the input carries semantics

  // ── Task text ────────────────────────────────────────────────
  const span = document.createElement('span');
  span.className = 'task-item__text';
  span.textContent = task.text;

  // ── Delete button ────────────────────────────────────────────
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'task-item__delete';
  deleteBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
  deleteBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round"
         stroke-linejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/>
      <path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>`;

  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  // ── Assemble ─────────────────────────────────────────────────
  li.appendChild(checkbox);
  li.appendChild(checkboxLabel);
  li.appendChild(span);
  li.appendChild(deleteBtn);

  return li;
}


/* ================================================================
   EVENT LISTENERS
================================================================ */

// Add task via button click
addBtn.addEventListener('click', addTask);

// Add task via Enter key
taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

// Clear error styling as soon as the user starts typing again
taskInput.addEventListener('input', () => {
  if (taskInput.classList.contains('is-error')) {
    clearInputError();
  }
});

// Filter tab buttons
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active visual state
    filterBtns.forEach(b => {
      b.classList.remove('filters__btn--active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('filters__btn--active');
    btn.setAttribute('aria-selected', 'true');

    // Apply the new filter and re-render
    currentFilter = btn.dataset.filter;
    render();
  });
});

// Clear completed tasks
clearDoneBtn.addEventListener('click', clearCompleted);


/* ================================================================
   INITIALISE
================================================================ */

// Perform the first render on page load using data from localStorage
render();
