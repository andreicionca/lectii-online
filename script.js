// pagina ./script.js

let config = null;
let selectedGrade = null;
let selectedClass = null;
let selectedLesson = null;
let selectedStudents = [];
async function loadConfig() {
  const response = await fetch("./data/config.json");
  config = await response.json();
  renderGrades();
  setupTitleToggle();
}

function renderGrades() {
  const container = document.querySelector(".categories-grid");
  container.innerHTML = config.grades
    .map(
      (grade) => `
      <div class="category-item" data-grade="${grade}">
        <div class="category-content">
          <span class="category-name">${grade}</span>
        </div>
      </div>
    `
    )
    .join("");

  container.addEventListener("click", handleGradeSelection);
}

function handleGradeSelection(e) {
  const gradeItem = e.target.closest(".category-item");
  if (!gradeItem) return;

  document.querySelectorAll(".category-item").forEach((item) => {
    item.classList.remove("selected");
  });

  const wasSelected = gradeItem.classList.contains("selected");
  selectedGrade = wasSelected ? null : gradeItem.dataset.grade;

  selectedLesson = null;
  selectedClass = null;
  selectedStudents = [];
  document.querySelector(".students-section").classList.add("hidden");

  if (selectedGrade) {
    gradeItem.classList.add("selected");
    renderLessons();
    renderClasses();
    document.querySelector(".lessons-section").classList.remove("hidden");
    document.querySelector(".classes-section").classList.remove("hidden");
  } else {
    hideSecondaryUI();
  }

  document.querySelectorAll(".lesson-item").forEach((item) => {
    item.classList.remove("selected");
  });

  document.querySelectorAll(".class-item").forEach((item) => {
    item.classList.remove("selected");
  });

  updateLoadButton();
}

function renderLessons() {
  const container = document.querySelector(".lessons-grid");
  const lessons = config.lessons[selectedGrade] || [];

  // Add header with toggle button
  document.querySelector(".lessons-section h2").innerHTML = `
    <div class="selection-header">
      <h3>Lecții Disponibile</h3>
      <div class="selection-controls">
        <button id="toggleTitles" class="btn-control">Afișează titlurile lecțiilor</button>
      </div>
    </div>
  `;

  container.innerHTML = lessons
    .map(
      (lesson) => `
      <div class="lesson-item" data-id="${lesson.id}" data-title="${lesson.title}">
        <h3>${lesson.name}</h3>
      </div>
    `
    )
    .join("");

  container.addEventListener("click", handleLessonSelection);
  setupTitleToggle();
}

function setupTitleToggle() {
  // Keyboard toggle
  window.addEventListener("keydown", (e) => {
    if ((e.key === "t" || e.key === "T") && selectedLesson) {
      const selectedLessonElement = document.querySelector(
        ".lesson-item.selected h3"
      );
      if (selectedLessonElement) {
        selectedLessonElement.textContent = selectedLesson.title;
      }
    }
  });

  window.addEventListener("keyup", (e) => {
    if ((e.key === "t" || e.key === "T") && selectedLesson) {
      const selectedLessonElement = document.querySelector(
        ".lesson-item.selected h3"
      );
      if (selectedLessonElement) {
        selectedLessonElement.textContent = selectedLesson.name;
      }
    }
  });

  // Button toggle
  const toggleBtn = document.getElementById("toggleTitles");
  let showingTitles = false;

  toggleBtn?.addEventListener("click", () => {
    showingTitles = !showingTitles;
    const lessons = document.querySelectorAll(".lesson-item h3");
    const currentGrade = selectedGrade;

    lessons.forEach((lessonElement) => {
      const lessonId = lessonElement.parentElement.dataset.id;
      const lesson = config.lessons[currentGrade].find(
        (l) => l.id === lessonId
      );
      lessonElement.textContent = showingTitles ? lesson.title : lesson.name;
    });

    toggleBtn.textContent = showingTitles
      ? "Afișează lecțiile"
      : "Afișează titlurile lecțiilor";
  });
}

function handleLessonSelection(e) {
  const lessonItem = e.target.closest(".lesson-item");
  if (!lessonItem) return;

  const wasSelected = lessonItem.classList.contains("selected");

  document
    .querySelectorAll(".lesson-item")
    .forEach((item) => item.classList.remove("selected"));

  if (!wasSelected) {
    lessonItem.classList.add("selected");
    selectedLesson = config.lessons[selectedGrade].find(
      (l) => l.id === lessonItem.dataset.id
    );
  } else {
    selectedLesson = null;
  }

  selectedClass = null;
  selectedStudents = [];
  document.querySelector(".students-section").classList.add("hidden");
  document.querySelectorAll(".class-item").forEach((item) => {
    item.classList.remove("selected");
  });

  updateLoadButton();
}

function renderClasses() {
  const container = document.querySelector(".classes-grid");
  const classes = config.classes[selectedGrade] || [];

  container.innerHTML = classes
    .map(
      (className) => `
      <div class="class-item" data-class="${className}">
        ${className}
      </div>
    `
    )
    .join("");

  container.addEventListener("click", handleClassSelection);
}

function handleClassSelection(e) {
  const classItem = e.target.closest(".class-item");
  if (!classItem) return;

  if (!selectedGrade || !selectedLesson) {
    return;
  }

  const wasSelected = classItem.classList.contains("selected");

  document.querySelectorAll(".class-item").forEach((item) => {
    item.classList.remove("selected");
  });

  if (!wasSelected) {
    selectedClass = classItem.dataset.class;
    classItem.classList.add("selected");
    renderStudents();
    document.querySelector(".students-section").classList.remove("hidden");
  } else {
    selectedClass = null;
    selectedStudents = [];
    document.querySelector(".students-section").classList.add("hidden");
  }
}

function renderStudents() {
  const container = document.querySelector(".students-grid");
  const students = config.students[selectedClass] || [];
  selectedStudents = students.filter(
    (student) => !config.unselected_students.includes(student)
  );

  document.querySelector(".students-section h2").innerHTML = `
    <div class="selection-header">
      <h3>Elevi</h3>
      <div class="selection-controls">
        <button id="selectAllStudents" class="btn-control">Selectează Tot</button>
        <button id="deselectAllStudents" class="btn-control">Deselectează Tot</button>
        <span id="selectedCount" class="counter">${selectedStudents.length} selectați</span>
      </div>
    </div>
  `;

  container.innerHTML = students
    .map(
      (student) => `
      <div class="student-item ${
        selectedStudents.includes(student) ? "selected" : ""
      }" 
           data-student="${student}">
        <span>${student}</span>
      </div>
    `
    )
    .join("");

  container.addEventListener("click", handleStudentSelection);
  document
    .getElementById("selectAllStudents")
    .addEventListener("click", selectAllStudents);
  document
    .getElementById("deselectAllStudents")
    .addEventListener("click", deselectAllStudents);
}

function handleStudentSelection(e) {
  const studentItem = e.target.closest(".student-item");
  if (!studentItem) return;

  const student = studentItem.dataset.student;

  studentItem.classList.toggle("selected");

  if (studentItem.classList.contains("selected")) {
    selectedStudents = [...selectedStudents, student];
  } else {
    selectedStudents = selectedStudents.filter((s) => s !== student);
  }

  updateSelectedCount(selectedStudents.length);
}

function selectAllStudents() {
  const students = config.students[selectedClass] || [];
  document.querySelectorAll(".student-item").forEach((item) => {
    item.classList.add("selected");
  });
  selectedStudents = [...students];
  updateSelectedCount(selectedStudents.length);
}

function deselectAllStudents() {
  document.querySelectorAll(".student-item").forEach((item) => {
    item.classList.remove("selected");
  });
  selectedStudents = [];
  updateSelectedCount(0);
}

function updateSelectedCount(count) {
  document.getElementById("selectedCount").textContent = `${count} selectați`;
}

function updateLoadButton() {
  const btn = document.getElementById("loadLessonBtn");
  const arrow = btn.querySelector(".arrow");

  if (selectedLesson) {
    btn.disabled = false;
    btn.querySelector(".button-text").textContent = "Încarcă lecția";
    arrow.style.display = "block";
  } else {
    btn.querySelector(".button-text").textContent = "Selectează o lecție";
    btn.disabled = true;
    arrow.style.display = "none";
  }
  document.querySelector(".load-lesson-container").classList.remove("hidden");
}

function hideSecondaryUI() {
  document
    .querySelectorAll(
      ".lessons-section, .classes-section, .students-section, .load-lesson-container"
    )
    .forEach((el) => el.classList.add("hidden"));
  selectedLesson = null;
  selectedClass = null;
  selectedStudents = [];
}

document.addEventListener("DOMContentLoaded", loadConfig);

document.getElementById("loadLessonBtn").addEventListener("click", () => {
  if (selectedLesson) {
    if (selectedClass) {
      let studentTracking =
        JSON.parse(localStorage.getItem("studentTracking")) || {};

      if (!studentTracking[selectedClass]) {
        studentTracking[selectedClass] = {};
      }

      selectedStudents.forEach((student) => {
        if (!studentTracking[selectedClass][student]) {
          studentTracking[selectedClass][student] = 0;
        }
      });

      localStorage.setItem("studentTracking", JSON.stringify(studentTracking));
      localStorage.setItem(
        "selectedStudents",
        JSON.stringify(selectedStudents)
      );
      localStorage.setItem("currentClass", selectedClass);
    }

    window.open(selectedLesson.path, "_blank");
  }
});
