# 🎓 Student Grade Calculator

> **By Amina** — 2nd Year Software Engineering Student, AAU CTBE

A feature-rich **console-based Python application** that calculates GPA, assigns letter grades, and tracks academic performance across multiple semesters.

---

## ✨ Features

| Feature | Details |
|---|---|
| 📚 **Multi-semester tracking** | Create, switch between, and delete semesters |
| 📖 **Course management** | Add/remove courses with credit hours |
| 📊 **Weighted assessments** | Record midterms, finals, quizzes — each with a custom weight % |
| 🏅 **Letter grades** | Auto-assigned using the AAU grade scale |
| 📈 **GPA calculation** | Credit-hour-weighted semester GPA + cumulative CGPA |
| 🖨️ **Full transcript** | Beautifully formatted academic transcript on screen |
| 💾 **Export to file** | Save transcript as a `.txt` file |
| ⚡ **Quick calculator** | One-off weighted average without saving |
| 💡 **Grade scale reference** | Built-in lookup table |
| 🎨 **Colour-coded output** | Green = A/B, Yellow = C, Red = D/F |
| 💾 **Auto-save** | All data persisted to `student_data.json` |

---

## 🗂️ Grade Scale (AAU Standard)

| Score Range | Letter | Grade Points |
|---|---|---|
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

## 🚀 How to Run

> **Requires Python 3.10+** (uses the `match` syntax internally)

```bash
# Navigate to the project folder
cd projects/grade_calculator

# Run the app
python grade_calculator.py
```

### First Time
The app will ask for your student profile (name, ID, university). This is saved automatically and won't be asked again.

---

## 📖 Usage Flow

```
Main Menu
├── 1. Manage Semesters & Courses
│     ├── Create / select a semester
│     ├── Add / remove courses
│     └── Manage scores (add, edit, remove assessments)
├── 2. Quick Grade Calculator
├── 3. Full Academic Transcript (screen)
├── 4. Export Transcript to .txt file
├── 5. Grade Scale Reference
├── 6. Edit Student Profile
├── 7. Delete a Semester
└── 0. Exit
```

### Example Session

```
  Welcome, Amina!  ·  CGPA: 3.45

  1. Manage Semesters & Courses
  2. Quick Grade Calculator
  ...

  ▸ Year 2 Semester 1
  Code     Course Name              Cr     Avg   Grade     GP
  ─────────────────────────────────────────────────────────
  SE201    Data Structures           3    82.3%    A-    3.75
    ↳ Midterm            70.0%  (wt 40%)
    ↳ Final Exam         90.0%  (wt 50%)
    ↳ Quiz Average       85.0%  (wt 10%)
  SE203    OOP with Java             3    76.5%    B+    3.50

  Semester GPA: 3.63
```

---

## 📁 File Structure

```
grade_calculator/
├── grade_calculator.py   ← main application
├── student_data.json     ← auto-created, stores all your data
├── transcript_*.txt      ← exported transcripts
└── README.md             ← this file
```

---

## 🧠 Concepts Used

- **Object-oriented thinking** (functions as logical units per feature)  
- **File I/O** — JSON read/write for persistence  
- **Input validation** — robust error handling on every input  
- **Algorithms** — weighted average, GPA formula  
- **Terminal UI** — ANSI colour codes, formatted table output  
- **Python features** — list comprehensions, type hints, f-strings  

---

*Built as part of my personal portfolio · AAU CTBE Software Engineering · 2nd Year*
