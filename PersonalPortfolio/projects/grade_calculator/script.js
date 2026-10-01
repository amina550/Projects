/* ═══════════════════════════════════════════════════════════
   STUDENT GRADE CALCULATOR — script.js
   by Amina · AAU CTBE · Software Engineering
   ═══════════════════════════════════════════════════════════ */

/* ─────────────────────────────────
   1. GRADE SCALE (AAU Standard)
   ───────────────────────────────── */
const GRADE_SCALE = [
  { min: 90,  letter: "A+",  points: 4.00, level: "excellent" },
  { min: 85,  letter: "A",   points: 4.00, level: "excellent" },
  { min: 80,  letter: "A-",  points: 3.75, level: "excellent" },
  { min: 75,  letter: "B+",  points: 3.50, level: "good"      },
  { min: 70,  letter: "B",   points: 3.00, level: "good"      },
  { min: 65,  letter: "B-",  points: 2.75, level: "good"      },
  { min: 60,  letter: "C+",  points: 2.50, level: "average"   },
  { min: 50,  letter: "C",   points: 2.00, level: "average"   },
  { min: 45,  letter: "D",   points: 1.00, level: "poor"      },
  { min: 0,   letter: "F",   points: 0.00, level: "poor"      },
];

const EXAMPLE_COURSES = [
  { code: "SE201", name: "Data Structures",        credits: 3, score: 82.5 },
  { code: "SE203", name: "OOP with Java",          credits: 3, score: 76.0 },
  { code: "SE205", name: "Discrete Mathematics",   credits: 3, score: 91.0 },
  { code: "SE207", name: "Computer Organization",  credits: 2, score: 68.5 },
  { code: "SE209", name: "Technical Writing",      credits: 1, score: 55.0 },
];

/* ─────────────────────────────────
   2. STATE
   ───────────────────────────────── */
let courses    = [];    // Array of { id, code, name, credits, score }
let editingId  = null;  // null = add mode, string = edit mode
let deletingId = null;  // id pending deletion confirmation

/* ─────────────────────────────────
   3. GRADE HELPERS
   ───────────────────────────────── */
function scoreToGrade(score) {
  if (score === null || score === undefined || isNaN(score)) {
    return { letter: "—", points: null, level: "average" };
  }
  for (const entry of GRADE_SCALE) {
    if (score >= entry.min) return entry;
  }
  return GRADE_SCALE[GRADE_SCALE.length - 1];
}

function computeGpa(courseList) {
  const withScores = courseList.filter(
    (c) => c.score !== null && c.score !== undefined && !isNaN(c.score)
  );
  if (withScores.length === 0) return null;

  const totalCredits = withScores.reduce((sum, c) => sum + c.credits, 0);
  if (totalCredits === 0) return null;

  const totalPoints = withScores.reduce((sum, c) => {
    const { points } = scoreToGrade(c.score);
    return sum + points * c.credits;
  }, 0);

  return totalPoints / totalCredits;
}

function gpaToStanding(gpa) {
  if (gpa === null) return "Add courses to calculate your GPA";
  if (gpa >= 3.75) return "🏆 Distinction";
  if (gpa >= 3.00) return "🌟 Very Good";
  if (gpa >= 2.50) return "👍 Good";
  if (gpa >= 2.00) return "✅ Satisfactory";
  if (gpa >= 1.00) return "⚠️ Pass";
  return "❌ Academic Warning";
}

function gpaToPct(gpa) {
  if (gpa === null) return 0;
  return Math.min((gpa / 4) * 100, 100);
}

/* ─────────────────────────────────
   4. UNIQUE ID GENERATOR
   ───────────────────────────────── */
function generateId() {
  return `course-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/* ─────────────────────────────────
   5. DOM ELEMENT REFERENCES
   ───────────────────────────────── */
const dom = {
  html:             document.documentElement,
  themeToggle:      document.getElementById("theme-toggle"),
  liveGpa:          document.getElementById("live-gpa"),
  gpaCircle:        document.getElementById("gpa-circle"),
  gpaValue:         document.getElementById("gpa-value"),
  gpaStanding:      document.getElementById("gpa-standing"),
  statCredits:      document.getElementById("stat-credits"),
  statCourses:      document.getElementById("stat-courses"),
  statAvg:          document.getElementById("stat-avg"),
  gradeDistSection: document.getElementById("grade-distribution"),
  distributionBars: document.getElementById("distribution-bars"),
  courseCount:      document.getElementById("course-count"),
  emptyState:       document.getElementById("empty-state"),
  courseList:       document.getElementById("course-list"),
  btnAddCourse:     document.getElementById("btn-add-course"),
  btnLoadExample:   document.getElementById("btn-load-example"),
  btnClearAll:      document.getElementById("btn-clear-all"),
  formCard:         document.getElementById("form-card"),
  formTitle:        document.getElementById("form-title"),
  courseForm:       document.getElementById("course-form"),
  inputCode:        document.getElementById("input-code"),
  inputName:        document.getElementById("input-name"),
  inputCredits:     document.getElementById("input-credits"),
  inputScore:       document.getElementById("input-score"),
  errorCode:        document.getElementById("error-code"),
  errorName:        document.getElementById("error-name"),
  errorCredits:     document.getElementById("error-credits"),
  errorScore:       document.getElementById("error-score"),
  btnSubmitForm:    document.getElementById("btn-submit-form"),
  btnCancelForm:    document.getElementById("btn-cancel-form"),
  confirmDialog:    document.getElementById("confirm-dialog"),
  dialogConfirm:    document.getElementById("dialog-confirm"),
  dialogCancel:     document.getElementById("dialog-cancel"),
  toastContainer:   document.getElementById("toast-container"),
  gradeScaleBody:   document.getElementById("grade-scale-body"),
};

/* ─────────────────────────────────
   6. THEME MANAGEMENT
   ───────────────────────────────── */
function initTheme() {
  const saved = localStorage.getItem("gpa-theme");
  const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  setTheme(saved || preferred, false);
}

function setTheme(theme, save = true) {
  dom.html.setAttribute("data-theme", theme);
  dom.themeToggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
  if (save) localStorage.setItem("gpa-theme", theme);
}

function toggleTheme() {
  const current = dom.html.getAttribute("data-theme");
  setTheme(current === "dark" ? "light" : "dark");
}

/* ─────────────────────────────────
   7. TOAST NOTIFICATIONS
   ───────────────────────────────── */
function showToast(message, type = "info") {
  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.setAttribute("role", "status");
  toast.innerHTML = `<span aria-hidden="true">${icons[type] ?? "ℹ️"}</span><span>${message}</span>`;

  dom.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("is-leaving");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }, 3000);
}

/* ─────────────────────────────────
   8. FORM MANAGEMENT
   ───────────────────────────────── */
function openForm(mode = "add", course = null) {
  editingId = mode === "edit" && course ? course.id : null;

  dom.formTitle.textContent = mode === "edit" ? "Edit Course" : "Add Course";
  dom.btnSubmitForm.textContent = mode === "edit" ? "Save Changes" : "Save Course";

  if (mode === "edit" && course) {
    dom.inputCode.value    = course.code;
    dom.inputName.value    = course.name;
    dom.inputCredits.value = course.credits;
    dom.inputScore.value   = course.score !== null ? course.score : "";
  } else {
    dom.courseForm.reset();
  }

  clearFormErrors();
  dom.formCard.setAttribute("aria-hidden", "false");
  dom.inputCode.focus();
}

function closeForm() {
  editingId = null;
  dom.courseForm.reset();
  clearFormErrors();
  dom.formCard.setAttribute("aria-hidden", "true");
}

function clearFormErrors() {
  [dom.errorCode, dom.errorName, dom.errorCredits, dom.errorScore].forEach((el) => {
    el.textContent = "";
  });
  [dom.inputCode, dom.inputName, dom.inputCredits, dom.inputScore].forEach((el) => {
    el.classList.remove("is-invalid");
  });
}

function setFieldError(inputEl, errorEl, message) {
  errorEl.textContent = message;
  inputEl.classList.add("is-invalid");
  inputEl.setAttribute("aria-invalid", "true");
}

function clearFieldError(inputEl, errorEl) {
  errorEl.textContent = "";
  inputEl.classList.remove("is-invalid");
  inputEl.removeAttribute("aria-invalid");
}

function validateForm() {
  let valid = true;

  const code    = dom.inputCode.value.trim().toUpperCase();
  const name    = dom.inputName.value.trim();
  const credits = parseInt(dom.inputCredits.value, 10);
  const scoreRaw = dom.inputScore.value.trim();
  const score   = scoreRaw === "" ? null : parseFloat(scoreRaw);

  clearFormErrors();

  // Code validation
  if (!code) {
    setFieldError(dom.inputCode, dom.errorCode, "Course code is required.");
    valid = false;
  } else if (!/^[A-Z0-9]{2,10}$/.test(code)) {
    setFieldError(dom.inputCode, dom.errorCode, "Use 2–10 letters/numbers, no spaces.");
    valid = false;
  } else {
    const duplicate = courses.find(
      (c) => c.code === code && c.id !== editingId
    );
    if (duplicate) {
      setFieldError(dom.inputCode, dom.errorCode, `"${code}" already exists.`);
      valid = false;
    }
  }

  // Name validation
  if (!name) {
    setFieldError(dom.inputName, dom.errorName, "Course name is required.");
    valid = false;
  } else if (name.length < 2) {
    setFieldError(dom.inputName, dom.errorName, "Name must be at least 2 characters.");
    valid = false;
  }

  // Credits validation
  if (!dom.inputCredits.value.trim()) {
    setFieldError(dom.inputCredits, dom.errorCredits, "Credit hours are required.");
    valid = false;
  } else if (isNaN(credits) || credits < 1 || credits > 10) {
    setFieldError(dom.inputCredits, dom.errorCredits, "Enter a whole number between 1 and 10.");
    valid = false;
  }

  // Score validation (optional field)
  if (scoreRaw !== "" && (isNaN(score) || score < 0 || score > 100)) {
    setFieldError(dom.inputScore, dom.errorScore, "Score must be between 0 and 100.");
    valid = false;
  }

  return valid
    ? { code, name, credits, score }
    : null;
}

/* ─────────────────────────────────
   9. COURSE CRUD OPERATIONS
   ───────────────────────────────── */
function addCourse(data) {
  const newCourse = { id: generateId(), ...data };
  courses.push(newCourse);
  renderAll();
  showToast(`"${data.code} – ${data.name}" added successfully.`, "success");
}

function updateCourse(id, data) {
  const index = courses.findIndex((c) => c.id === id);
  if (index === -1) return;
  courses[index] = { id, ...data };
  renderAll();
  showToast(`"${data.code}" updated.`, "success");
}

function deleteCourse(id) {
  const course = courses.find((c) => c.id === id);
  courses = courses.filter((c) => c.id !== id);
  renderAll();
  if (course) showToast(`"${course.code}" removed.`, "info");
}

function loadExampleData() {
  if (courses.length > 0) {
    showToast("Clear existing courses first before loading the example.", "error");
    return;
  }
  EXAMPLE_COURSES.forEach((c) => {
    courses.push({ id: generateId(), ...c });
  });
  renderAll();
  showToast("Example data loaded! 5 courses added.", "success");
}

function clearAllCourses() {
  if (courses.length === 0) {
    showToast("There are no courses to clear.", "info");
    return;
  }
  courses = [];
  closeForm();
  renderAll();
  showToast("All courses cleared.", "info");
}

/* ─────────────────────────────────
   10. RENDERING
   ───────────────────────────────── */

/** Render a single course item and return the <li> element */
function buildCourseItem(course) {
  const { id, code, name, credits, score } = course;
  const grade = scoreToGrade(score);

  const li = document.createElement("li");
  li.className = "course-item";
  li.dataset.id = id;

  const scoreDisplay = (score !== null && !isNaN(score)) ? `${score.toFixed(1)}%` : "No score";
  const gradeDisplay = (score !== null && !isNaN(score)) ? `${grade.letter} (${grade.points.toFixed(2)})` : "—";

  li.innerHTML = `
    <div class="course-item__info">
      <div class="course-item__header">
        <span class="course-item__code">${escapeHtml(code)}</span>
        <span class="course-item__name">${escapeHtml(name)}</span>
      </div>
      <div class="course-item__meta">
        <span>${credits} cr</span>
        <span class="course-item__score">${scoreDisplay}</span>
        <span
          class="grade-pill"
          data-grade-level="${grade.level}"
          aria-label="Grade: ${gradeDisplay}"
        >${(score !== null && !isNaN(score)) ? grade.letter : "—"}</span>
      </div>
    </div>
    <div class="course-item__actions">
      <button
        class="btn btn--ghost btn--sm"
        data-action="edit"
        data-id="${id}"
        aria-label="Edit ${escapeHtml(code)}"
        title="Edit course"
        type="button"
      >✏️</button>
      <button
        class="btn btn--ghost btn--sm btn--danger"
        data-action="delete"
        data-id="${id}"
        aria-label="Delete ${escapeHtml(code)}"
        title="Delete course"
        type="button"
      >🗑️</button>
    </div>
  `;
  return li;
}

/** Render the full course list */
function renderCourseList() {
  dom.courseList.innerHTML = "";

  const isEmpty = courses.length === 0;
  dom.emptyState.setAttribute("aria-hidden", isEmpty ? "false" : "true");

  if (isEmpty) return;

  const fragment = document.createDocumentFragment();
  courses.forEach((course) => {
    fragment.appendChild(buildCourseItem(course));
  });
  dom.courseList.appendChild(fragment);

  const plural = courses.length === 1 ? "course" : "courses";
  dom.courseCount.textContent = `${courses.length} ${plural}`;
}

/** Render GPA results panel */
function renderResults() {
  const gpa = computeGpa(courses);
  const gpaPct = gpaToPct(gpa);

  // Header badge
  dom.liveGpa.textContent = gpa !== null ? gpa.toFixed(2) : "—";

  // Circle (conic-gradient trick)
  dom.gpaCircle.style.setProperty("--gpa-pct", `${gpaPct.toFixed(1)}%`);
  dom.gpaValue.textContent = gpa !== null ? gpa.toFixed(2) : "—";

  // Standing
  dom.gpaStanding.textContent = gpaToStanding(gpa);

  // Stats
  const withScores = courses.filter(
    (c) => c.score !== null && c.score !== undefined && !isNaN(c.score)
  );
  const totalCredits = withScores.reduce((s, c) => s + c.credits, 0);
  const avgScore = withScores.length
    ? withScores.reduce((s, c) => s + c.score, 0) / withScores.length
    : null;

  dom.statCredits.textContent = totalCredits || "—";
  dom.statCourses.textContent = courses.length || "—";
  dom.statAvg.textContent     = avgScore !== null ? `${avgScore.toFixed(1)}%` : "—";

  // Course count badge in panel header
  const plural = courses.length === 1 ? "course" : "courses";
  dom.courseCount.textContent = courses.length
    ? `${courses.length} ${plural}`
    : "0 courses";

  // Grade distribution
  renderGradeDistribution();
}

/** Build grade distribution bars */
function renderGradeDistribution() {
  const withScores = courses.filter(
    (c) => c.score !== null && c.score !== undefined && !isNaN(c.score)
  );

  if (withScores.length === 0) {
    dom.gradeDistSection.hidden = true;
    return;
  }

  dom.gradeDistSection.hidden = false;
  dom.distributionBars.innerHTML = "";

  // Count by letter grade
  const counts = {};
  withScores.forEach((c) => {
    const { letter } = scoreToGrade(c.score);
    counts[letter] = (counts[letter] || 0) + 1;
  });

  // Display top grades that exist
  const gradeOrder = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "D", "F"];
  const present = gradeOrder.filter((g) => counts[g]);
  const max = Math.max(...Object.values(counts));

  const fragment = document.createDocumentFragment();
  present.forEach((letter) => {
    const count = counts[letter];
    const pct   = (count / max) * 100;
    const gradeInfo = GRADE_SCALE.find((g) => g.letter === letter);

    const row = document.createElement("div");
    row.className = "dist-bar-row";
    row.setAttribute("role", "listitem");
    row.innerHTML = `
      <span class="dist-bar-label">${letter}</span>
      <div class="dist-bar-track" aria-hidden="true">
        <div
          class="dist-bar-fill"
          style="width: ${pct.toFixed(1)}%"
          data-grade-level="${gradeInfo ? gradeInfo.level : "average"}"
        ></div>
      </div>
      <span class="dist-bar-count">${count}</span>
    `;
    fragment.appendChild(row);
  });
  dom.distributionBars.appendChild(fragment);
}

/** Build the static grade scale table */
function renderGradeScale() {
  const ranges = [
    "90–100", "85–89", "80–84", "75–79",
    "70–74",  "65–69", "60–64", "50–59", "45–49", "0–44",
  ];

  const fragment = document.createDocumentFragment();
  GRADE_SCALE.forEach((entry, i) => {
    const row = document.createElement("div");
    row.className = "grade-scale-row";
    row.setAttribute("role", "row");
    row.innerHTML = `
      <span class="grade-scale-row__score" role="cell">${ranges[i]}</span>
      <span class="grade-scale-row__letter grade-pill" role="cell" data-grade-level="${entry.level}">${entry.letter}</span>
      <span class="grade-scale-row__points" role="cell">${entry.points.toFixed(2)}</span>
    `;
    fragment.appendChild(row);
  });
  dom.gradeScaleBody.appendChild(fragment);
}

/** Master render — call after any state change */
function renderAll() {
  renderCourseList();
  renderResults();
}

/* ─────────────────────────────────
   11. DELETE DIALOG
   ───────────────────────────────── */
function openDeleteDialog(id) {
  deletingId = id;
  dom.confirmDialog.showModal();
  dom.dialogConfirm.focus();
}

function closeDeleteDialog() {
  deletingId = null;
  dom.confirmDialog.close();
}

/* ─────────────────────────────────
   12. SECURITY HELPER
   ───────────────────────────────── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ─────────────────────────────────
   13. REAL-TIME INPUT VALIDATION (inline feedback while typing)
   ───────────────────────────────── */
function attachInlineValidation() {
  dom.inputCode.addEventListener("blur", () => {
    const val = dom.inputCode.value.trim().toUpperCase();
    if (!val) {
      setFieldError(dom.inputCode, dom.errorCode, "Course code is required.");
    } else if (!/^[A-Z0-9]{2,10}$/.test(val)) {
      setFieldError(dom.inputCode, dom.errorCode, "Use 2–10 letters/numbers, no spaces.");
    } else {
      clearFieldError(dom.inputCode, dom.errorCode);
    }
  });

  dom.inputName.addEventListener("blur", () => {
    const val = dom.inputName.value.trim();
    if (!val) {
      setFieldError(dom.inputName, dom.errorName, "Course name is required.");
    } else if (val.length < 2) {
      setFieldError(dom.inputName, dom.errorName, "Name must be at least 2 characters.");
    } else {
      clearFieldError(dom.inputName, dom.errorName);
    }
  });

  dom.inputCredits.addEventListener("blur", () => {
    const val = parseInt(dom.inputCredits.value, 10);
    if (!dom.inputCredits.value.trim()) {
      setFieldError(dom.inputCredits, dom.errorCredits, "Credit hours are required.");
    } else if (isNaN(val) || val < 1 || val > 10) {
      setFieldError(dom.inputCredits, dom.errorCredits, "Enter a whole number between 1 and 10.");
    } else {
      clearFieldError(dom.inputCredits, dom.errorCredits);
    }
  });

  dom.inputScore.addEventListener("blur", () => {
    const raw = dom.inputScore.value.trim();
    if (raw === "") {
      clearFieldError(dom.inputScore, dom.errorScore);
      return;
    }
    const val = parseFloat(raw);
    if (isNaN(val) || val < 0 || val > 100) {
      setFieldError(dom.inputScore, dom.errorScore, "Score must be between 0 and 100.");
    } else {
      clearFieldError(dom.inputScore, dom.errorScore);
    }
  });

  // Live grade preview as user types score
  dom.inputScore.addEventListener("input", () => {
    const raw = dom.inputScore.value.trim();
    if (raw === "") return;
    const val = parseFloat(raw);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      clearFieldError(dom.inputScore, dom.errorScore);
    }
  });
}

/* ─────────────────────────────────
   14. EVENT LISTENERS
   ───────────────────────────────── */
function attachEventListeners() {
  // Theme toggle
  dom.themeToggle.addEventListener("click", toggleTheme);

  // Open add form
  dom.btnAddCourse.addEventListener("click", () => {
    openForm("add");
  });

  // Load example data
  dom.btnLoadExample.addEventListener("click", loadExampleData);

  // Clear all
  dom.btnClearAll.addEventListener("click", clearAllCourses);

  // Cancel form
  dom.btnCancelForm.addEventListener("click", closeForm);

  // Form submit (add or edit)
  dom.courseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = validateForm();
    if (!data) return;

    if (editingId) {
      updateCourse(editingId, data);
    } else {
      addCourse(data);
    }
    closeForm();
  });

  // Course list: edit / delete buttons via event delegation
  dom.courseList.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-action]");
    if (!btn) return;

    const { action, id } = btn.dataset;

    if (action === "edit") {
      const course = courses.find((c) => c.id === id);
      if (course) openForm("edit", course);
    }

    if (action === "delete") {
      openDeleteDialog(id);
    }
  });

  // Delete dialog confirm
  dom.dialogConfirm.addEventListener("click", () => {
    if (deletingId) deleteCourse(deletingId);
    closeDeleteDialog();
  });

  // Delete dialog cancel
  dom.dialogCancel.addEventListener("click", closeDeleteDialog);

  // Close dialog if backdrop clicked
  dom.confirmDialog.addEventListener("click", (event) => {
    if (event.target === dom.confirmDialog) closeDeleteDialog();
  });

  // Close dialog on Escape key (native behavior for <dialog>, but be explicit)
  dom.confirmDialog.addEventListener("cancel", closeDeleteDialog);

  // Keyboard shortcut: Escape closes the add/edit form
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!dom.confirmDialog.open) closeForm();
    }
  });
}

/* ─────────────────────────────────
   15. INIT
   ───────────────────────────────── */
function init() {
  initTheme();
  renderGradeScale();
  renderAll();
  attachEventListeners();
  attachInlineValidation();
}

document.addEventListener("DOMContentLoaded", init);
