# 🎓 Student Grade Calculator

> **A fully interactive, browser-based GPA calculator built as a portfolio project.**  
> Created by: **Amina** · AAU CTBE · Software Engineering · Year 2

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)](/)

---

## 📖 Project Description

The **Student Grade Calculator** is a clean, responsive web application that allows students to track their courses, record scores, and instantly see their semester GPA — all in the browser with zero installation required.

It is built with **vanilla HTML, CSS, and JavaScript** (no frameworks, no build tools, no dependencies), making it a great showcase of fundamental front-end skills. The project demonstrates form validation, dynamic DOM manipulation, accessible UI patterns, and a professional design using CSS custom properties.

---

## ✨ Features

| Feature | Details |
|---|---|
| ➕ **Add / Edit / Delete Courses** | Full CRUD with instant DOM updates |
| ✅ **Form Validation** | Real-time field-level error messages with visual feedback |
| 📊 **GPA Calculation** | Credit-hour-weighted GPA using the AAU (Ethiopian) grade scale |
| 🌙 **Dark Mode** | One-click toggle, preference saved to `localStorage` |
| 📋 **Example Data** | Load 5 pre-filled sample courses instantly |
| 🏅 **Grade Distribution** | Visual bar chart showing grade spread |
| 🪟 **Delete Confirmation Dialog** | Native `<dialog>` element, keyboard accessible |
| 🔔 **Toast Notifications** | Non-blocking status messages for every action |
| 📱 **Responsive Design** | Works on mobile, tablet, and desktop |
| ♿ **Accessible** | ARIA labels, `role` attributes, `aria-live` regions, focus management |

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic structure — `<main>`, `<section>`, `<aside>`, `<dialog>`, `<form>` |
| **CSS3** | Custom properties (design tokens), CSS Grid, Flexbox, animations, `conic-gradient` |
| **Vanilla JavaScript (ES2022)** | DOM manipulation, state management, event delegation, `localStorage` |

> **No external libraries, frameworks, or bundlers required.**

---

## 🗂️ Grade Scale (AAU Standard)

| Score Range | Letter | Grade Points |
|---|:---:|:---:|
| 90 – 100 | A+ | 4.00 |
| 85 – 89  | A  | 4.00 |
| 80 – 84  | A- | 3.75 |
| 75 – 79  | B+ | 3.50 |
| 70 – 74  | B  | 3.00 |
| 65 – 69  | B- | 2.75 |
| 60 – 64  | C+ | 2.50 |
| 50 – 59  | C  | 2.00 |
| 45 – 49  | D  | 1.00 |
| 0  – 44  | F  | 0.00 |

---

## 🧮 GPA Calculation Explained

The GPA is calculated using the **credit-hour weighted average** formula:

```
GPA = Σ (Grade Points × Credit Hours) / Σ Credit Hours
```

**Step-by-step:**

1. Each course score (0–100) is mapped to a **letter grade** and **grade points** using the AAU scale above.
2. Each course's grade points are **multiplied by its credit hours** to produce weighted points.
3. All weighted points are **summed** and divided by the **total credit hours** across all graded courses.

**Example:**

| Course | Score | Grade | Points | Credits | Weighted |
|---|---|---|---|---|---|
| SE201 Data Structures | 82.5% | A- | 3.75 | 3 | 11.25 |
| SE203 OOP with Java | 76.0% | B+ | 3.50 | 3 | 10.50 |
| SE205 Discrete Mathematics | 91.0% | A+ | 4.00 | 3 | 12.00 |

```
GPA = (11.25 + 10.50 + 12.00) / (3 + 3 + 3) = 33.75 / 9 = 3.75
```

> Courses without a score entered are **excluded** from the GPA calculation.

---

## 🚀 How to Run Locally

No installation, no terminal, no server required.

1. **Download or clone** this repository.
2. Open the `projects/grade_calculator/` folder.
3. **Double-click `index.html`** — it opens directly in your browser.

That's it. ✅

---

## 📁 Project Structure

```
projects/grade_calculator/
├── index.html          ← App structure & semantic HTML
├── style.css           ← All styling (no inline CSS)
├── script.js           ← All logic (no inline JS)
├── grade_calculator.py ← Original Python CLI version
├── student_data.json   ← Python version data file
└── README.md           ← This file
```

---

## 🔧 How the Three Files Work Together

```
index.html  ──────▶  Defines the structure (HTML skeleton)
                      Links style.css and script.js
                      
style.css   ──────▶  Defines how everything looks
                      Uses CSS variables for light/dark themes
                      
script.js   ──────▶  Controls all behaviour
                      Reads/writes the DOM
                      Handles user events
                      Runs GPA math
```

1. **`index.html`** provides the skeleton — all elements exist in the HTML. JavaScript never creates structural HTML from scratch; it only populates list items and shows/hides sections.
2. **`style.css`** uses CSS custom properties (`--color-primary`, `--bg-surface`, etc.) defined on `:root`. Switching dark mode simply changes the `data-theme` attribute on `<html>`, which triggers a different set of property values.
3. **`script.js`** manages an in-memory `courses` array as the single source of truth. Every user action (add, edit, delete, toggle theme) updates this array and then calls `renderAll()` to re-draw the UI cleanly.

---

## 🚀 Creating a GitHub Repository & Pushing

Follow these steps from your terminal (Git Bash, PowerShell, or WSL):

```bash
# 1. Navigate into the web project folder
cd projects/grade_calculator

# 2. Initialise a new Git repository
git init

# 3. Stage all files
git add .

# 4. Create your first commit
git commit -m "Create interactive student grade calculator"

# 5. Rename the default branch to main
git branch -M main

# 6. Connect to your GitHub repository (replace the URL)
git remote add origin YOUR_GITHUB_REPOSITORY_URL

# 7. Push to GitHub
git push -u origin main
```

> **How to get YOUR_GITHUB_REPOSITORY_URL:**  
> 1. Go to [github.com](https://github.com) → **New repository**  
> 2. Name it `student-grade-calculator` (or anything you like)  
> 3. Leave it empty (no README, no .gitignore)  
> 4. Copy the HTTPS URL shown (e.g. `https://github.com/your-username/student-grade-calculator.git`)  
> 5. Paste it in place of `YOUR_GITHUB_REPOSITORY_URL`

---

## 🔮 Future Improvements

Here are planned enhancements to make this project even more powerful:

| Improvement | Description |
|---|---|
| 💾 **Local Storage** | Persist all courses automatically in the browser so data survives page reloads |
| 📅 **Multiple Semesters** | Organise courses by semester (Year 1 Sem 1, Year 2 Sem 2, etc.) |
| 📈 **GPA History** | Track and visualise GPA trends across all semesters on a line chart |
| 🔮 **GPA Prediction** | "What grade do I need in Course X to reach a target GPA?" calculator |
| 📤 **Export Results** | Download course data as a `.csv` or `.json` file |
| 🖨️ **PDF Reports** | Generate a printable academic transcript using the browser's print API |
| ⚖️ **Custom Grading Scales** | Let users switch between grading systems (AAU, US 4.0, ECTS, etc.) |

---

## 👩‍💻 Author

**Amina**  
2nd Year Software Engineering Student  
Addis Ababa University · College of Technology and Built Environment (CTBE)

---

*Built as part of a personal developer portfolio · October 2026*
