"""
╔══════════════════════════════════════════════════════════╗
║         STUDENT GRADE CALCULATOR — by Amina              ║
║         AAU CTBE · Software Engineering · Year 2         ║
╚══════════════════════════════════════════════════════════╝

Features:
  • Add / remove courses with credit hours
  • Record multiple assessment scores (e.g., midterm, final, quiz)
  • Compute weighted average per course → letter grade
  • Calculate semester GPA (credit-hour weighted)
  • Track cumulative GPA across multiple semesters
  • Save & load records from a JSON file
  • Print a formatted academic transcript
"""

import json
import os
import sys
from datetime import datetime


# ─────────────────────────────────────────
#  CONSTANTS
# ─────────────────────────────────────────

DATA_FILE = os.path.join(os.path.dirname(__file__), "student_data.json")

# Ethiopian / standard AAU grade scale
GRADE_SCALE = [
    (90, "A+", 4.0),
    (85, "A",  4.0),
    (80, "A-", 3.75),
    (75, "B+", 3.5),
    (70, "B",  3.0),
    (65, "B-", 2.75),
    (60, "C+", 2.5),
    (50, "C",  2.0),
    (45, "D",  1.0),
    (0,  "F",  0.0),
]

COLORS = {
    "header":  "\033[1;35m",   # bold magenta
    "title":   "\033[1;36m",   # bold cyan
    "success": "\033[1;32m",   # bold green
    "warning": "\033[1;33m",   # bold yellow
    "error":   "\033[1;31m",   # bold red
    "info":    "\033[0;34m",   # blue
    "muted":   "\033[0;37m",   # light grey
    "reset":   "\033[0m",
}

# Disable colors on Windows if not supported
if sys.platform == "win32":
    try:
        import ctypes
        kernel = ctypes.windll.kernel32
        kernel.SetConsoleMode(kernel.GetStdHandle(-11), 7)
    except Exception:
        COLORS = {k: "" for k in COLORS}


# ─────────────────────────────────────────
#  HELPER UTILITIES
# ─────────────────────────────────────────

def c(color: str, text: str) -> str:
    """Wrap text in a terminal colour."""
    return f"{COLORS.get(color,'')}{text}{COLORS['reset']}"


def clear() -> None:
    os.system("cls" if sys.platform == "win32" else "clear")


def separator(char: str = "─", width: int = 60) -> None:
    print(c("muted", char * width))


def header(title: str) -> None:
    clear()
    width = 60
    print(c("header", "╔" + "═" * (width - 2) + "╗"))
    print(c("header", "║") + c("title", title.center(width - 2)) + c("header", "║"))
    print(c("header", "╚" + "═" * (width - 2) + "╝"))
    print()


def pause() -> None:
    input(c("muted", "\n  Press Enter to continue…"))


def prompt(msg: str, default: str = "") -> str:
    suffix = f" [{default}]" if default else ""
    value = input(c("info", f"  {msg}{suffix}: ")).strip()
    return value if value else default


def prompt_float(msg: str, low: float = 0.0, high: float = 100.0) -> float:
    while True:
        raw = prompt(msg)
        try:
            val = float(raw)
            if low <= val <= high:
                return val
            print(c("error", f"  ✗ Enter a number between {low} and {high}."))
        except ValueError:
            print(c("error", "  ✗ Invalid number. Try again."))


def prompt_int(msg: str, low: int = 1, high: int = 99) -> int:
    while True:
        raw = prompt(msg)
        try:
            val = int(raw)
            if low <= val <= high:
                return val
            print(c("error", f"  ✗ Enter a whole number between {low} and {high}."))
        except ValueError:
            print(c("error", "  ✗ Invalid number. Try again."))


def prompt_choice(options: list[str]) -> int:
    """Show a numbered menu and return the 1-based user choice."""
    for i, opt in enumerate(options, 1):
        print(f"  {c('info', str(i)+'.')} {opt}")
    print()
    return prompt_int("Choose", low=1, high=len(options))


# ─────────────────────────────────────────
#  GRADE LOGIC
# ─────────────────────────────────────────

def score_to_grade(score: float) -> tuple[str, float]:
    """Convert a numeric score (0–100) to a letter grade and grade point."""
    for threshold, letter, points in GRADE_SCALE:
        if score >= threshold:
            return letter, points
    return "F", 0.0


def weighted_average(scores: list[dict]) -> float:
    """
    Compute weighted average given a list of:
      {"name": str, "score": float, "weight": float}
    Weights must sum to ≤ 100; if < 100 remaining is treated as unweighted.
    """
    if not scores:
        return 0.0
    total_weight = sum(s["weight"] for s in scores)
    if total_weight == 0:
        return 0.0
    weighted_sum = sum(s["score"] * s["weight"] for s in scores)
    # normalise so weights always sum to 100
    return weighted_sum / total_weight


def compute_gpa(courses: list[dict]) -> float:
    """Weighted GPA from a list of course dicts."""
    total_points = 0.0
    total_credits = 0
    for course in courses:
        avg = weighted_average(course["scores"])
        _, gp = score_to_grade(avg)
        total_points += gp * course["credits"]
        total_credits += course["credits"]
    if total_credits == 0:
        return 0.0
    return total_points / total_credits


# ─────────────────────────────────────────
#  PERSISTENCE
# ─────────────────────────────────────────

def load_data() -> dict:
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            pass
    return {"student": {}, "semesters": []}


def save_data(data: dict) -> None:
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


# ─────────────────────────────────────────
#  STUDENT INFO SETUP
# ─────────────────────────────────────────

def setup_student(data: dict) -> None:
    header("  Student Information Setup")
    print("  Let's set up your profile first.\n")
    data["student"]["name"]       = prompt("Full name", data["student"].get("name", ""))
    data["student"]["id"]         = prompt("Student ID", data["student"].get("id", ""))
    data["student"]["university"] = prompt("University", data["student"].get("university", "AAU"))
    data["student"]["college"]    = prompt("College/Department", data["student"].get("college", "CTBE – Software Engineering"))
    data["student"]["year"]       = prompt("Year of study", data["student"].get("year", "2nd Year"))
    save_data(data)
    print(c("success", "\n  ✓ Profile saved!"))
    pause()


# ─────────────────────────────────────────
#  SEMESTER MANAGEMENT
# ─────────────────────────────────────────

def select_or_create_semester(data: dict) -> dict | None:
    """Let user pick an existing semester or create a new one."""
    header("  Semester Selection")
    options = [s["name"] for s in data["semesters"]]
    options.append("➕  Create new semester")

    choice = prompt_choice(options)

    if choice == len(options):
        # create new
        print()
        name = prompt("Semester name (e.g. Year 2 Semester 1)")
        if not name:
            print(c("error", "  ✗ Name cannot be empty."))
            pause()
            return None
        # check duplicate
        if any(s["name"] == name for s in data["semesters"]):
            print(c("error", "  ✗ A semester with that name already exists."))
            pause()
            return None
        semester = {
            "name":    name,
            "created": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "courses": [],
        }
        data["semesters"].append(semester)
        save_data(data)
        print(c("success", f"\n  ✓ Semester '{name}' created."))
        pause()
        return semester
    else:
        return data["semesters"][choice - 1]


def delete_semester(data: dict) -> None:
    header("  Delete Semester")
    if not data["semesters"]:
        print(c("warning", "  No semesters to delete."))
        pause()
        return

    options = [s["name"] for s in data["semesters"]]
    options.append("← Cancel")
    choice = prompt_choice(options)

    if choice == len(options):
        return

    name = data["semesters"][choice - 1]["name"]
    confirm = prompt(f"Type '{name}' to confirm deletion")
    if confirm == name:
        data["semesters"].pop(choice - 1)
        save_data(data)
        print(c("success", f"\n  ✓ '{name}' deleted."))
    else:
        print(c("warning", "  Deletion cancelled."))
    pause()


# ─────────────────────────────────────────
#  COURSE MANAGEMENT
# ─────────────────────────────────────────

def add_course(semester: dict, data: dict) -> None:
    header(f"  Add Course  ·  {semester['name']}")
    code    = prompt("Course code (e.g. SE201)").upper()
    name    = prompt("Course name (e.g. Data Structures)")
    credits = prompt_int("Credit hours", low=1, high=10)

    if not code or not name:
        print(c("error", "  ✗ Code and name cannot be empty."))
        pause()
        return

    # check duplicate in this semester
    if any(c_["code"] == code for c_ in semester["courses"]):
        print(c("error", f"  ✗ Course '{code}' already exists in this semester."))
        pause()
        return

    course = {"code": code, "name": name, "credits": credits, "scores": []}
    semester["courses"].append(course)
    save_data(data)
    print(c("success", f"\n  ✓ Course '{code} – {name}' added ({credits} cr)."))
    pause()


def remove_course(semester: dict, data: dict) -> None:
    header(f"  Remove Course  ·  {semester['name']}")
    if not semester["courses"]:
        print(c("warning", "  No courses in this semester."))
        pause()
        return

    options = [f"{c_['code']} – {c_['name']}" for c_ in semester["courses"]]
    options.append("← Cancel")
    choice = prompt_choice(options)
    if choice == len(options):
        return

    removed = semester["courses"].pop(choice - 1)
    save_data(data)
    print(c("success", f"\n  ✓ '{removed['code']}' removed."))
    pause()


# ─────────────────────────────────────────
#  SCORE MANAGEMENT
# ─────────────────────────────────────────

def manage_scores(course: dict, data: dict) -> None:
    """Add / edit / remove assessment scores for a single course."""
    while True:
        header(f"  Scores  ·  {course['code']} – {course['name']}")

        # Show current scores
        if course["scores"]:
            print(f"  {'Assessment':<20} {'Score':>7}  {'Weight':>8}  {'Weighted':>9}")
            separator()
            for s in course["scores"]:
                weighted = s["score"] * s["weight"] / 100
                print(f"  {s['name']:<20} {s['score']:>6.1f}%  {s['weight']:>7.1f}%  {weighted:>8.2f}")
            separator()
            total_weight = sum(s["weight"] for s in course["scores"])
            avg = weighted_average(course["scores"])
            letter, gp = score_to_grade(avg)
            colour = "success" if gp >= 3.0 else "warning" if gp >= 2.0 else "error"
            print(f"  {'Total weight assigned:':<30} {total_weight:.1f}%")
            print(f"  {'Course average:':<30} {avg:.2f}%")
            print(f"  {'Grade:':<30} " + c(colour, f"{letter}  ({gp:.2f})"))
        else:
            print(c("muted", "  No scores recorded yet.\n"))

        print()
        separator()
        print("  1. Add assessment    2. Edit assessment")
        print("  3. Remove assessment 4. ← Back")
        separator()
        choice = prompt_int("Option", low=1, high=4)

        if choice == 1:
            _add_score(course, data)
        elif choice == 2:
            _edit_score(course, data)
        elif choice == 3:
            _remove_score(course, data)
        elif choice == 4:
            break


def _add_score(course: dict, data: dict) -> None:
    print()
    remaining = 100.0 - sum(s["weight"] for s in course["scores"])
    if remaining <= 0:
        print(c("warning", "  ✗ Total weight is already 100%. Remove or edit an assessment first."))
        pause()
        return

    name   = prompt("Assessment name (e.g. Midterm, Final, Quiz 1)")
    score  = prompt_float(f"Score (0–100)")
    weight = prompt_float(f"Weight % (remaining: {remaining:.1f}%)", high=remaining)

    if not name:
        print(c("error", "  ✗ Name cannot be empty."))
        pause()
        return

    course["scores"].append({"name": name, "score": score, "weight": weight})
    save_data(data)
    print(c("success", "  ✓ Score added."))
    pause()


def _edit_score(course: dict, data: dict) -> None:
    if not course["scores"]:
        print(c("warning", "  No scores to edit."))
        pause()
        return

    options = [s["name"] for s in course["scores"]] + ["← Cancel"]
    choice  = prompt_choice(options)
    if choice == len(options):
        return

    s = course["scores"][choice - 1]
    other_weight = sum(sc["weight"] for sc in course["scores"]) - s["weight"]
    remaining    = 100.0 - other_weight

    print(f"\n  Editing: {s['name']}  (current score={s['score']}, weight={s['weight']}%)")
    s["name"]   = prompt("New name", s["name"])
    s["score"]  = prompt_float("New score (0–100)", high=100.0)
    s["weight"] = prompt_float(f"New weight % (max {remaining:.1f}%)", high=remaining)

    save_data(data)
    print(c("success", "  ✓ Score updated."))
    pause()


def _remove_score(course: dict, data: dict) -> None:
    if not course["scores"]:
        print(c("warning", "  No scores to remove."))
        pause()
        return

    options = [s["name"] for s in course["scores"]] + ["← Cancel"]
    choice  = prompt_choice(options)
    if choice == len(options):
        return

    removed = course["scores"].pop(choice - 1)
    save_data(data)
    print(c("success", f"  ✓ '{removed['name']}' removed."))
    pause()


# ─────────────────────────────────────────
#  SEMESTER MENU
# ─────────────────────────────────────────

def semester_menu(semester: dict, data: dict) -> None:
    while True:
        header(f"  {semester['name']}")

        gpa = compute_gpa(semester["courses"])
        gpa_col = "success" if gpa >= 3.0 else "warning" if gpa >= 2.0 else "error"

        if semester["courses"]:
            print(f"  {'#':<3} {'Code':<8} {'Course Name':<22} {'Cr':>3}  {'Avg':>6}  {'Grade':>6}  {'GP':>5}")
            separator()
            for i, course in enumerate(semester["courses"], 1):
                avg = weighted_average(course["scores"])
                letter, gp = score_to_grade(avg) if course["scores"] else ("–", 0.0)
                col = "success" if gp >= 3.0 else "warning" if gp >= 2.0 else "error"
                avg_str  = f"{avg:.1f}%" if course["scores"] else "–"
                grade_str = c(col, letter)
                print(f"  {i:<3} {course['code']:<8} {course['name']:<22} {course['credits']:>3}  {avg_str:>6}  {grade_str:>15}  {gp:>5.2f}")
            separator()
            print(f"  {'Semester GPA:':<44} " + c(gpa_col, f"{gpa:.2f}"))
        else:
            print(c("muted", "  No courses yet.\n"))

        print()
        separator()
        print("  1. Add course         2. Remove course")
        print("  3. Manage scores      4. View report")
        print("  5. ← Back to main")
        separator()
        choice = prompt_int("Option", low=1, high=5)

        if choice == 1:
            add_course(semester, data)
        elif choice == 2:
            remove_course(semester, data)
        elif choice == 3:
            if not semester["courses"]:
                print(c("warning", "  Add a course first."))
                pause()
            else:
                opts = [f"{c_['code']} – {c_['name']}" for c_ in semester["courses"]] + ["← Cancel"]
                idx  = prompt_choice(opts)
                if idx < len(opts):
                    manage_scores(semester["courses"][idx - 1], data)
        elif choice == 4:
            print_semester_report(semester)
            pause()
        elif choice == 5:
            break


# ─────────────────────────────────────────
#  REPORTS
# ─────────────────────────────────────────

def print_semester_report(semester: dict) -> None:
    header("  Semester Report")
    W = 62

    print(c("title", "=" * W))
    print(c("title", "  SEMESTER ACADEMIC REPORT".center(W)))
    print(c("title", "=" * W))
    print(f"  Semester : {semester['name']}")
    print(f"  Date     : {datetime.now().strftime('%d %B %Y  %H:%M')}")
    print(c("title", "─" * W))

    if not semester["courses"]:
        print(c("muted", "  No courses recorded."))
        return

    fmt = f"  {{:<8}}  {{:<22}}  {{:>3}}  {{:>6}}  {{:>5}}  {{:>5}}"
    print(fmt.format("Code", "Course Name", "Cr", "Avg %", "Grade", "GP"))
    print(c("muted", "  " + "─" * (W - 2)))

    total_credits = 0
    total_points  = 0.0

    for course in semester["courses"]:
        avg = weighted_average(course["scores"])
        if course["scores"]:
            letter, gp = score_to_grade(avg)
        else:
            avg, letter, gp = 0.0, "N/A", 0.0

        total_credits += course["credits"]
        total_points  += gp * course["credits"]

        avg_str = f"{avg:.1f}" if course["scores"] else "–"
        print(fmt.format(
            course["code"],
            course["name"][:22],
            course["credits"],
            avg_str,
            letter,
            f"{gp:.2f}",
        ))

        # show assessments breakdown
        for s in course["scores"]:
            print(c("muted", f"       ↳ {s['name']:<20}  {s['score']:>5.1f}%  (wt {s['weight']:.0f}%)"))

    gpa = total_points / total_credits if total_credits else 0.0
    print(c("muted", "  " + "─" * (W - 2)))
    print(f"  {'Total Credits:':<40} {total_credits}")
    print(f"  {'Semester GPA:':<40} {gpa:.3f}")

    # standing
    if   gpa >= 3.75: standing = "Distinction"
    elif gpa >= 3.0:  standing = "Very Good"
    elif gpa >= 2.5:  standing = "Good"
    elif gpa >= 2.0:  standing = "Satisfactory"
    elif gpa >= 1.0:  standing = "Pass"
    else:             standing = "Fail – Academic Warning"

    col = "success" if gpa >= 3.0 else "warning" if gpa >= 2.0 else "error"
    print(f"  {'Academic Standing:':<40} " + c(col, standing))
    print(c("title", "=" * W))


def print_full_transcript(data: dict) -> None:
    header("  Full Academic Transcript")
    W = 66

    student = data.get("student", {})
    print(c("title", "=" * W))
    print(c("title", "  OFFICIAL ACADEMIC TRANSCRIPT".center(W)))
    print(c("title", "=" * W))
    print(f"  Name       : {student.get('name', 'N/A')}")
    print(f"  Student ID : {student.get('id', 'N/A')}")
    print(f"  University : {student.get('university', 'N/A')}")
    print(f"  College    : {student.get('college', 'N/A')}")
    print(f"  Year       : {student.get('year', 'N/A')}")
    print(f"  Printed    : {datetime.now().strftime('%d %B %Y')}")
    print(c("title", "─" * W))

    if not data["semesters"]:
        print(c("muted", "  No academic records found."))
        print(c("title", "=" * W))
        pause()
        return

    cumulative_credits = 0
    cumulative_points  = 0.0

    for semester in data["semesters"]:
        print(c("header", f"\n  ▸ {semester['name']}"))
        print(c("muted",  "  " + "─" * (W - 2)))

        fmt = "  {:<8}  {:<24}  {:>3}  {:>6}  {:>5}  {:>5}"
        print(fmt.format("Code", "Course", "Cr", "Avg", "Grade", "GP"))

        sem_credits = 0
        sem_points  = 0.0

        for course in semester["courses"]:
            avg = weighted_average(course["scores"])
            if course["scores"]:
                letter, gp = score_to_grade(avg)
            else:
                avg, letter, gp = 0.0, "N/A", 0.0

            sem_credits += course["credits"]
            sem_points  += gp * course["credits"]
            avg_str = f"{avg:.1f}%" if course["scores"] else "–"
            print(fmt.format(course["code"], course["name"][:24],
                             course["credits"], avg_str, letter, f"{gp:.2f}"))

        sem_gpa = sem_points / sem_credits if sem_credits else 0.0
        cumulative_credits += sem_credits
        cumulative_points  += sem_points
        col = "success" if sem_gpa >= 3.0 else "warning" if sem_gpa >= 2.0 else "error"
        print(c("muted", f"  Semester GPA: ") + c(col, f"{sem_gpa:.3f}")
              + c("muted", f"  |  Credits: {sem_credits}"))

    cgpa = cumulative_points / cumulative_credits if cumulative_credits else 0.0
    col  = "success" if cgpa >= 3.0 else "warning" if cgpa >= 2.0 else "error"
    print()
    print(c("title", "═" * W))
    print(f"  {'Total Credits Earned:':<48} {cumulative_credits}")
    print(f"  {'Cumulative GPA (CGPA):':<48} " + c(col, f"{cgpa:.3f}"))
    print(c("title", "═" * W))
    pause()


def export_transcript(data: dict) -> None:
    """Save the transcript as a plain-text file."""
    header("  Export Transcript")
    filename = f"transcript_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    filepath = os.path.join(os.path.dirname(__file__), filename)

    student  = data.get("student", {})
    lines    = []
    W        = 66

    lines += [
        "=" * W,
        "  OFFICIAL ACADEMIC TRANSCRIPT".center(W),
        "=" * W,
        f"  Name       : {student.get('name', 'N/A')}",
        f"  Student ID : {student.get('id', 'N/A')}",
        f"  University : {student.get('university', 'N/A')}",
        f"  College    : {student.get('college', 'N/A')}",
        f"  Year       : {student.get('year', 'N/A')}",
        f"  Printed    : {datetime.now().strftime('%d %B %Y')}",
        "─" * W,
    ]

    cumulative_credits = 0
    cumulative_points  = 0.0

    for semester in data["semesters"]:
        lines.append(f"\n  ▸ {semester['name']}")
        lines.append("  " + "─" * (W - 2))
        fmt = "  {:<8}  {:<24}  {:>3}  {:>6}  {:>5}  {:>5}"
        lines.append(fmt.format("Code", "Course", "Cr", "Avg", "Grade", "GP"))

        sem_credits = 0
        sem_points  = 0.0

        for course in semester["courses"]:
            avg = weighted_average(course["scores"])
            if course["scores"]:
                letter, gp = score_to_grade(avg)
            else:
                avg, letter, gp = 0.0, "N/A", 0.0
            sem_credits += course["credits"]
            sem_points  += gp * course["credits"]
            avg_str = f"{avg:.1f}%" if course["scores"] else "–"
            lines.append(fmt.format(course["code"], course["name"][:24],
                                    course["credits"], avg_str, letter, f"{gp:.2f}"))
            for s in course["scores"]:
                lines.append(f"       ↳ {s['name']:<20}  {s['score']:>5.1f}%  (wt {s['weight']:.0f}%)")

        sem_gpa = sem_points / sem_credits if sem_credits else 0.0
        cumulative_credits += sem_credits
        cumulative_points  += sem_points
        lines.append(f"  Semester GPA: {sem_gpa:.3f}  |  Credits: {sem_credits}")

    cgpa = cumulative_points / cumulative_credits if cumulative_credits else 0.0
    lines += [
        "",
        "=" * W,
        f"  {'Total Credits Earned:':<48} {cumulative_credits}",
        f"  {'Cumulative GPA (CGPA):':<48} {cgpa:.3f}",
        "=" * W,
    ]

    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(c("success", f"\n  ✓ Transcript saved to: {filepath}"))
    pause()


# ─────────────────────────────────────────
#  GRADE SCALE REFERENCE
# ─────────────────────────────────────────

def show_grade_scale() -> None:
    header("  Grade Scale Reference")
    print(f"  {'Score Range':<20}  {'Letter Grade':>13}  {'Grade Points':>13}")
    separator()
    for i, (threshold, letter, points) in enumerate(GRADE_SCALE):
        nxt = GRADE_SCALE[i - 1][0] if i > 0 else 100
        if i == 0:
            rng = f"90 – 100"
        else:
            rng = f"{threshold} – {nxt - 1}"
        col = "success" if points >= 3.0 else "warning" if points >= 2.0 else "error"
        print(f"  {rng:<20}  {c(col, letter):>22}  {points:>13.2f}")
    separator()
    pause()


# ─────────────────────────────────────────
#  QUICK CALCULATOR (one-off)
# ─────────────────────────────────────────

def quick_calculator() -> None:
    header("  Quick Grade Calculator")
    print("  Enter assessment scores one by one.")
    print("  Weights must sum to 100%.\n")

    scores = []
    while True:
        remaining = 100.0 - sum(s["weight"] for s in scores)
        if scores:
            print()
            print(f"  {'Assessment':<20} {'Score':>7}  {'Weight':>8}")
            separator("─", 50)
            for s in scores:
                print(f"  {s['name']:<20} {s['score']:>6.1f}%  {s['weight']:>7.1f}%")
            separator("─", 50)
            print(f"  Weight remaining: {remaining:.1f}%\n")

        if remaining <= 0:
            break

        print("  1. Add assessment    2. Done (calculate)")
        choice = prompt_int("Option", low=1, high=2)
        if choice == 2:
            break

        name   = prompt("Assessment name")
        score  = prompt_float("Score (0–100)")
        weight = prompt_float(f"Weight % (max {remaining:.1f}%)", high=remaining)
        if name:
            scores.append({"name": name, "score": score, "weight": weight})

    if not scores:
        print(c("warning", "  No scores entered."))
    else:
        avg = weighted_average(scores)
        letter, gp = score_to_grade(avg)
        col = "success" if gp >= 3.0 else "warning" if gp >= 2.0 else "error"
        print()
        separator()
        print(f"  Weighted Average : {avg:.2f}%")
        print(f"  Letter Grade     : " + c(col, letter))
        print(f"  Grade Points     : {gp:.2f}")
        separator()

    pause()


# ─────────────────────────────────────────
#  MAIN MENU
# ─────────────────────────────────────────

def main_menu(data: dict) -> None:
    while True:
        header("  Student Grade Calculator")

        name = data["student"].get("name", "Student")
        cgpa_str = ""
        if data["semesters"]:
            all_courses: list[dict] = []
            for sem in data["semesters"]:
                all_courses.extend(sem["courses"])
            cgpa = compute_gpa(all_courses) if all_courses else 0.0
            col  = "success" if cgpa >= 3.0 else "warning" if cgpa >= 2.0 else "error"
            cgpa_str = "  CGPA: " + c(col, f"{cgpa:.3f}")

        print(c("info", f"  Welcome, {name}!") + (f"  ·{cgpa_str}" if cgpa_str else ""))
        print()
        separator()
        print("  1. Manage Semesters & Courses")
        print("  2. Quick Grade Calculator")
        print("  3. Full Academic Transcript")
        print("  4. Export Transcript to File")
        print("  5. Grade Scale Reference")
        print("  6. Edit Student Profile")
        print("  7. Delete a Semester")
        print("  0. Exit")
        separator()

        choice = prompt_int("Option", low=0, high=7)

        if choice == 1:
            if not data["semesters"]:
                print(c("muted", "\n  No semesters yet. Let's create one!"))
            semester = select_or_create_semester(data)
            if semester:
                semester_menu(semester, data)
        elif choice == 2:
            quick_calculator()
        elif choice == 3:
            print_full_transcript(data)
        elif choice == 4:
            export_transcript(data)
        elif choice == 5:
            show_grade_scale()
        elif choice == 6:
            setup_student(data)
        elif choice == 7:
            delete_semester(data)
        elif choice == 0:
            header("  Goodbye!")
            print(c("success", "  Good luck with your studies, Amina! 🎓\n"))
            sys.exit(0)


# ─────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────

def main() -> None:
    data = load_data()

    # First-time setup
    if not data["student"]:
        header("  Welcome to Student Grade Calculator!")
        print("  Built with ❤️  by Amina · AAU CTBE Software Engineering\n")
        print(c("muted", "  This app helps you track your courses, scores,"))
        print(c("muted", "  letter grades, and GPA across all semesters.\n"))
        pause()
        setup_student(data)

    main_menu(data)


if __name__ == "__main__":
    main()
