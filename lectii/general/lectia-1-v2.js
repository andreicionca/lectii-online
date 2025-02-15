// pagina /lectii/general/lectia-1-v2.js

// Selectăm elementele DOM
const welcomeScreen = document.querySelector(".welcome-screen");
const startBtn = document.querySelector(".start-btn");
const titleScreen = document.querySelector(".title-screen");
const lessonTitle = document.querySelector(".title");
const navBar = document.querySelector(".nav-bar");
const navTitle = document.querySelector(".nav-title");
const teleprompterView = document.querySelector(".teleprompter-view");
const contentContainer = document.querySelector(".content-container");
const playPauseBtn = document.getElementById("play-pause");
const speedDownBtn = document.getElementById("speed-down");
const speedUpBtn = document.getElementById("speed-up");
const themeToggle = document.querySelector(".theme-toggle");
const zoomInBtn = document.getElementById("zoom-in");
const zoomOutBtn = document.getElementById("zoom-out");
const studentSelector = document.querySelector(".student-selector");
const studentName = document.querySelector(".student-name");
const studentCard = document.querySelector(".student-card");
const leftControls = document.querySelector(".side-controls.left");
const backgroundMusic = document.getElementById("backgroundMusic");
const soundToggle = document.getElementById("sound-toggle");
const fullscreenToggle = document.getElementById("fullscreen-toggle");

// Configurrări inițiale principale pentru lecție

backgroundMusic.volume = 0.5; // Setăm volumul inițial la 50%
const titleText = "Personalități religioase istorice"; // Textul titlului
const TITLE_ANIMATION_DURATION = 3500; // durata animației typing in milisecunde
const POST_ANIMATION_DELAY = 3500; // delay după animație în milisecunde

// Configurare pentru viteze
const speedLevels = {
  1: 0.2, // foarte încet
  2: 0.25, // puțin mai încet decât viteza confortabilă
  3: 0.3, // viteza confortabilă (fostul nivel 1)
  4: 0.5, // mediu-încet
  5: 0.7, // mediu
  6: 0.9, // mediu-rapid
  7: 1.2, // rapid
  8: 1.5, // foarte rapid
  9: 1.8, // maxim
};

if (document.documentElement.classList.contains("dark")) {
  themeToggle.innerHTML = '<i data-lucide="sun"></i>';
  lucide.createIcons();
}
function showError(message) {
  const errorContainer = document.getElementById("error-container");
  errorContainer.textContent = message;
  errorContainer.classList.remove("hidden");
  setTimeout(() => errorContainer.classList.add("hidden"), 5000);
}

function normalizeTracking() {
  const maxSelections = Math.max(...Object.values(classTracking));
  Object.keys(classTracking).forEach((student) => {
    if (maxSelections - classTracking[student] > 1) {
      classTracking[student] = maxSelections - 1;
    }
  });
  studentTracking[currentClass] = classTracking;
  try {
    localStorage.setItem("studentTracking", JSON.stringify(studentTracking));
  } catch (e) {
    showError("Eroare la salvarea datelor. Verificați spațiul disponibil.");
  }
}

const currentClass = localStorage.getItem("currentClass");
const studentTracking =
  JSON.parse(localStorage.getItem("studentTracking")) || {};
const classTracking = studentTracking[currentClass] || {};
const currentStudents =
  JSON.parse(localStorage.getItem("selectedStudents")) || [];
let availableStudents = [];
let sessionSelections = {};

currentStudents.forEach((student) => {
  if (!(student in classTracking)) {
    classTracking[student] = 0;
  }
});
normalizeTracking();

// Configurare inițială
let isMuted = true;
let isMusicPlaying = false;
let isPlaying = false;
let scrollSpeed = speedLevels["4"]; // Pornim cu o viteză confortabilă (tasta 4)
const minSpeed = speedLevels["1"];
const maxSpeed = speedLevels["9"];
let animationFrameId = null;
let startTime = null;
let titleTimeout;
let totalHeight = 0;
let viewportHeight = 0;
let isManualScrolling = false;
let deltaY = 0;
let zoomLevel = 1;
const minZoom = 0.5;
const maxZoom = 2;
let touchStartY = 0;
let lastTouchY = 0;
// Funcție pentru toggle temă
function toggleTheme() {
  document.documentElement.classList.toggle("dark");

  const themeIcon = themeToggle.querySelector("[data-lucide]");

  if (document.documentElement.classList.contains("dark")) {
    themeIcon.remove();
    themeToggle.innerHTML = '<i data-lucide="sun"></i>';
  } else {
    themeIcon.remove();
    themeToggle.innerHTML = '<i data-lucide="moon"></i>';
  }
  lucide.createIcons();
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      showError(
        "Eroare la intrarea în ecran complet. Verificați setările browser-ului."
      );
    });
    fullscreenToggle.setAttribute("data-tooltip", "Ieșire din ecran complet");
  } else {
    document.exitFullscreen();
    fullscreenToggle.setAttribute("data-tooltip", "Comută ecran complet");
  }
}
function startLesson() {
  welcomeScreen.classList.add("hidden");
  titleScreen.classList.remove("hidden");
  lessonTitle.innerHTML = "";

  const words = titleText.split(" ");
  let lines = [];
  let currentLine = [];

  let tempDiv = document.createElement("div");
  tempDiv.style.visibility = "hidden";
  tempDiv.style.position = "absolute";
  tempDiv.style.fontSize = getComputedStyle(lessonTitle).fontSize;
  tempDiv.style.fontFamily = getComputedStyle(lessonTitle).fontFamily;
  tempDiv.style.fontWeight = getComputedStyle(lessonTitle).fontWeight;
  tempDiv.style.whiteSpace = "nowrap";
  document.body.appendChild(tempDiv);

  const maxWidth = window.innerWidth * 0.8;

  words.forEach((word) => {
    tempDiv.textContent = [...currentLine, word].join(" ");
    const currentWidth = tempDiv.getBoundingClientRect().width;

    if (currentWidth <= maxWidth) {
      currentLine.push(word);
    } else {
      if (currentLine.length > 0) {
        lines.push(currentLine.join(" "));
        currentLine = [word];
      } else {
        lines.push(word);
      }
    }
  });

  if (currentLine.length > 0) {
    lines.push(currentLine.join(" "));
  }

  lines.forEach((line, index) => {
    const lineDiv = document.createElement("div");
    lineDiv.className = "title-line";
    lineDiv.textContent = line;

    tempDiv.textContent = line;
    const exactWidth = tempDiv.getBoundingClientRect().width;
    lineDiv.style.setProperty("--line-content-width", `${exactWidth}px`);

    lessonTitle.appendChild(lineDiv);
  });

  document.body.removeChild(tempDiv);

  document.documentElement.requestFullscreen().catch((err) => {
    showError(
      "Eroare la intrarea în ecran complet. Verificați setările browser-ului."
    );
  });

  const lineElements = document.querySelectorAll(".title-line");
  const TYPING_DURATION = 3500;

  const animateLine = (index) => {
    if (index >= lineElements.length) {
      setTimeout(() => {
        startTeleprompter();
      }, POST_ANIMATION_DELAY);
      return;
    }

    const line = lineElements[index];

    if (index > 0) {
      setTimeout(() => {
        lineElements[index - 1].classList.remove("active");
        line.classList.add("active", "typewriter");
      }, 100);
    } else {
      line.classList.add("active", "typewriter");
    }

    setTimeout(() => {
      animateLine(index + 1);
    }, TYPING_DURATION);
  };

  setTimeout(() => {
    animateLine(0);
  }, 100);
}

// Funcție pentru fade in/out
function fadeAudio(shouldPlay) {
  const fadePoints = 20; // Numărul de pași pentru fade
  const fadeDuration = 1000; // Durata totală în milisecunde
  const fadeInterval = fadeDuration / fadePoints;
  const volumeStep = 0.5 / fadePoints; // 0.3 este volumul maxim dorit

  if (shouldPlay) {
    // Fade in
    let volume = 0;
    backgroundMusic.volume = volume;
    backgroundMusic.play().catch((error) => {
      showError("Eroare la pornirea muzicii.");
    });

    const fadeIn = setInterval(() => {
      if (volume < 0.06) {
        volume += volumeStep;
        backgroundMusic.volume = volume;
      } else {
        clearInterval(fadeIn);
      }
    }, fadeInterval);

    isMusicPlaying = true;
  } else {
    // Fade out
    let volume = backgroundMusic.volume;

    const fadeOut = setInterval(() => {
      if (volume > 0.01) {
        volume -= volumeStep;
        backgroundMusic.volume = volume;
      } else {
        backgroundMusic.pause();
        backgroundMusic.volume = 0.3; // Resetăm volumul pentru următoarea pornire
        clearInterval(fadeOut);
      }
    }, fadeInterval);

    isMusicPlaying = false;
  }
}

// Înlocuim vechea funcție toggleMusic cu noua implementare
function toggleMusic(shouldPlay) {
  if (shouldPlay && !isMusicPlaying) {
    fadeAudio(true);
  } else if (!shouldPlay && isMusicPlaying) {
    fadeAudio(false);
  }
}

function togglePauseAudio() {
  if (backgroundMusic.paused) {
    backgroundMusic.play();
    soundToggle.querySelector("[data-lucide]").remove();
    soundToggle.innerHTML = '<i data-lucide="volume-2"></i>';
    soundToggle.setAttribute("data-tooltip", "Oprește sunetul (M)");
  } else {
    backgroundMusic.pause();
    soundToggle.querySelector("[data-lucide]").remove();
    soundToggle.innerHTML = '<i data-lucide="volume-x"></i>';
    soundToggle.setAttribute("data-tooltip", "Pornește sunetul (M)");
  }
  lucide.createIcons();
}

function selectRandomStudent() {
  if (currentStudents.length === 0) return;

  if (availableStudents.length === 0) {
    const minSelections = Math.min(
      ...currentStudents.map((s) => classTracking[s])
    );
    availableStudents = currentStudents.filter(
      (s) => classTracking[s] === minSelections
    );
  }

  const randomIndex = Math.floor(Math.random() * availableStudents.length);
  const selected = availableStudents.splice(randomIndex, 1)[0];

  classTracking[selected]++;
  sessionSelections[selected] = (sessionSelections[selected] || 0) + 1;
  studentTracking[currentClass] = classTracking;
  try {
    localStorage.setItem("studentTracking", JSON.stringify(studentTracking));
  } catch (e) {
    showError("Eroare la salvarea datelor. Verificați spațiul disponibil.");
  }

  splitFlapEffect(selected);
}

function splitFlapEffect(finalText) {
  studentSelector.classList.remove("hidden");
  studentSelector.classList.add("gradient-effect");
  studentName.classList.add("text-gradient-effect");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let cycles = 0;
  const maxCycles = 20;

  const interval = setInterval(() => {
    if (cycles >= maxCycles) {
      studentName.textContent = finalText.toUpperCase();
      studentSelector.classList.remove("gradient-effect");
      studentName.classList.remove("text-gradient-effect");
      clearInterval(interval);
      return;
    }

    studentName.textContent = finalText
      .split("")
      .map((char) =>
        char === " " ? " " : chars[Math.floor(Math.random() * chars.length)]
      )
      .join("");
    studentName.classList.add("flap-effect");

    setTimeout(() => {
      studentName.classList.remove("flap-effect");
    }, 25);

    cycles++;
  }, 50);
}

// Funcție pentru a începe teleprompter-ul (al doilea pas)
function startTeleprompter() {
  document.title = titleText;
  titleScreen.classList.add("hidden");
  navBar.classList.remove("hidden");
  navTitle.textContent = titleText;
  teleprompterView.classList.remove("hidden");
  leftControls.classList.remove("hidden"); // Afișăm controalele din stânga

  // Calculăm înălțimea totală
  totalHeight = contentContainer.offsetHeight - teleprompterView.offsetHeight;
  viewportHeight = teleprompterView.offsetHeight;

  // Resetăm poziția folosind viewportHeight

  contentContainer.style.transform = `translate3d(0, ${viewportHeight}px, 0)`;
  contentContainer.style.willChange = "transform";
  contentContainer.style.backfaceVisibility = "hidden";

  setTimeout(() => {
    togglePlayPause();
  }, 50);
}

function restartTeleprompter() {
  contentContainer.style.transform = `translate3d(0, ${viewportHeight}px, 0)`;
  startTime = null;
  playPauseBtn.querySelector("[data-lucide]").remove();
  playPauseBtn.innerHTML = '<i data-lucide="play"></i>';
  playPauseBtn.title = "Pornește (P)";
  lucide.createIcons();
  isPlaying = false;
  togglePlayPause(); // Acesta va reporni muzica automat
}

function updateZoom(delta) {
  const newZoom = zoomLevel + delta;
  if (newZoom >= minZoom && newZoom <= maxZoom) {
    zoomLevel = newZoom;
    document.documentElement.style.setProperty("--zoom-level", zoomLevel);

    requestAnimationFrame(() => {
      totalHeight =
        contentContainer.offsetHeight - teleprompterView.offsetHeight;
      viewportHeight = teleprompterView.offsetHeight;

      // Ajustăm poziția pentru a menține textul vizibil
      if (isPlaying) {
        const currentTransform = getComputedStyle(contentContainer).transform;
        const matrix = new DOMMatrixReadOnly(currentTransform);
        const currentY = matrix.m42;

        if (currentY <= -totalHeight) {
          contentContainer.style.transform = `translate3d(0, ${viewportHeight}px, 0)`;
        }
      }
    });
  }
}

// Funcție pentru animația de scroll
function animate(timestamp) {
  if (!startTime) {
    startTime = timestamp;
  }

  if (!isPlaying) return;

  const deltaTime = timestamp - startTime;
  startTime = timestamp;

  const currentTransform = getComputedStyle(contentContainer).transform;
  const matrix = new DOMMatrixReadOnly(currentTransform);
  const currentY = matrix.m42;

  if (currentY <= -totalHeight) {
    isPlaying = false;
    playPauseBtn.querySelector("[data-lucide]").remove();
    playPauseBtn.innerHTML = '<i data-lucide="refresh-ccw"></i>';
    playPauseBtn.setAttribute("data-tooltip", "Repornește");
    lucide.createIcons();
    toggleMusic(false); // Oprim muzica
    return;
  }

  // Calculăm deplasarea bazată pe timpul trecut
  let pixelsToMove;
  if (isManualScrolling) {
    pixelsToMove = deltaY;
    deltaY = 0;
    isManualScrolling = false;
  } else {
    // Folosim deltaTime pentru a face mișcarea mai uniformă
    pixelsToMove = (scrollSpeed * deltaTime) / 16.67; // 16.67ms = 60fps
  }

  const newY = currentY - pixelsToMove;
  contentContainer.style.transform = `translate3d(0, ${newY}px, 0)`;

  animationFrameId = requestAnimationFrame(animate);
}

// Funcție pentru play/pause
function togglePlayPause() {
  if (
    playPauseBtn.querySelector("[data-lucide]").dataset.lucide === "refresh-ccw"
  ) {
    restartTeleprompter();
    return;
  }

  if (!isPlaying) {
    isManualScrolling = false;
    isPlaying = true;
    startTime = null;
    playPauseBtn.querySelector("[data-lucide]").remove();
    playPauseBtn.innerHTML = '<i data-lucide="pause"></i>';
    playPauseBtn.setAttribute("data-tooltip", "Pauză (P)");
    animationFrameId = requestAnimationFrame(animate);
    lucide.createIcons();
    if (!isMuted && !isMusicPlaying) {
      toggleMusic(true);
    }
  } else {
    isPlaying = false;
    playPauseBtn.querySelector("[data-lucide]").remove();
    playPauseBtn.innerHTML = '<i data-lucide="play"></i>';

    playPauseBtn.setAttribute("data-tooltip", "Pornește (P)");
    lucide.createIcons();
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  }
}

// Funcții pentru controlul vitezei
function increaseSpeed() {
  if (scrollSpeed < maxSpeed) {
    scrollSpeed += 0.1;
    scrollSpeed = Math.min(scrollSpeed, maxSpeed);
  }
}

function decreaseSpeed() {
  if (scrollSpeed > minSpeed) {
    scrollSpeed -= 0.1;
    scrollSpeed = Math.max(scrollSpeed, minSpeed);
  }
}

// Event Listeners
startBtn.addEventListener("click", startLesson);

soundToggle.addEventListener("click", () => {
  togglePauseAudio();
  if (isPlaying && !isMuted) {
    toggleMusic(true);
  } else if (isPlaying && isMuted) {
    toggleMusic(false);
  }
});

playPauseBtn.addEventListener("click", () => {
  if (titleScreen.classList.contains("hidden")) {
    if (
      playPauseBtn.querySelector("[data-lucide]").dataset.lucide ===
      "refresh-ccw"
    ) {
      restartTeleprompter();
    } else {
      togglePlayPause();
    }
  } else {
    startTeleprompter();
  }
});

themeToggle.addEventListener("click", toggleTheme);
fullscreenToggle.addEventListener("click", toggleFullscreen);
speedUpBtn.addEventListener("click", increaseSpeed);
speedDownBtn.addEventListener("click", decreaseSpeed);

zoomInBtn.addEventListener("click", () => updateZoom(0.1));
zoomOutBtn.addEventListener("click", () => updateZoom(-0.1));

teleprompterView.addEventListener("wheel", (e) => {
  e.preventDefault(); // Prevenim scroll-ul implicit

  if (!isPlaying) {
    const currentTransform = getComputedStyle(contentContainer).transform;
    const matrix = new DOMMatrixReadOnly(currentTransform);
    const currentY = matrix.m42;

    // Calculăm noua poziție
    const newY = currentY - e.deltaY * 0.5; // Reducem viteza scroll-ului cu 0.5

    // Verificăm limitele
    if (newY <= -totalHeight) {
      contentContainer.style.transform = `translate3d(0, ${-totalHeight}px, 0)`;
    } else if (newY >= viewportHeight) {
      contentContainer.style.transform = `translate3d(0, ${viewportHeight}px, 0)`;
    } else {
      contentContainer.style.transform = `translate3d(0, ${newY}px, 0)`;
    }
  } else {
    // Dacă animația rulează, acumulăm delta pentru următorul frame
    isManualScrolling = true;
    deltaY = e.deltaY * 0.5;
  }
});

// Variabile pentru touch events

// Funcție comună pentru procesarea scrollului
function processScroll(deltaY) {
  if (!isPlaying) {
    const currentTransform = getComputedStyle(contentContainer).transform;
    const matrix = new DOMMatrixReadOnly(currentTransform);
    const currentY = matrix.m42;

    // Calculăm noua poziție
    const newY = currentY - deltaY * 0.5; // Reducem viteza scroll-ului cu 0.5

    // Verificăm limitele
    if (newY <= -totalHeight) {
      contentContainer.style.transform = `translate3d(0, ${-totalHeight}px, 0)`;
    } else if (newY >= viewportHeight) {
      contentContainer.style.transform = `translate3d(0, ${viewportHeight}px, 0)`;
    } else {
      contentContainer.style.transform = `translate3d(0, ${newY}px, 0)`;
    }
  } else {
    // Dacă animația rulează, acumulăm delta pentru următorul frame
    isManualScrolling = true;
    deltaY = deltaY * 0.5;
  }
}

// Mouse wheel event
teleprompterView.addEventListener("wheel", (e) => {
  e.preventDefault();
  processScroll(e.deltaY);
});

// Touch events
teleprompterView.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    touchStartY = e.touches[0].clientY;
    lastTouchY = touchStartY;
  },
  { passive: false }
);

teleprompterView.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
    const currentTouchY = e.touches[0].clientY;
    const deltaY = lastTouchY - currentTouchY;
    lastTouchY = currentTouchY;

    processScroll(deltaY);
  },
  { passive: false }
);

teleprompterView.addEventListener(
  "touchend",
  (e) => {
    e.preventDefault();
  },
  { passive: false }
);

// Keyboard controls
document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase(); // Convertim la lowercase

  // Verificăm dacă teleprompterul a pornit pentru tastele e și ArrowRight
  if (
    (key === "e" || key === "arrowright") &&
    titleScreen.classList.contains("hidden") &&
    welcomeScreen.classList.contains("hidden")
  ) {
    selectRandomStudent();
    return;
  }

  // Controale existente
  switch (key) {
    case " ":
    case "p":
      if (titleScreen.classList.contains("hidden")) {
        togglePlayPause();
      } else {
        clearTimeout(titleTimeout);
        startTeleprompter();
      }
      break;
    case "r":
      if (!titleScreen.classList.contains("hidden")) return;
      restartTeleprompter();
      break;
    case "-":
    case "_":
      updateZoom(-0.1);
      break;
    case "=":
    case "+":
      updateZoom(0.1);
      break;
    case "m":
      togglePauseAudio();
      if (isPlaying && !isMuted) {
        toggleMusic(true);
      } else if (isPlaying && isMuted) {
        toggleMusic(false);
      }
      break;
    default:
      if (key >= "1" && key <= "9") {
        scrollSpeed = speedLevels[key];
      }
      break;
  }
});

// Event listener pentru redimensionarea ferestrei
window.addEventListener("resize", () => {
  if (!teleprompterView.classList.contains("hidden")) {
    totalHeight = contentContainer.offsetHeight - teleprompterView.offsetHeight;
    viewportHeight = teleprompterView.offsetHeight;
  }
});

// Actualizare buton la schimbarea stării fullscreen
document.addEventListener("fullscreenchange", () => {
  fullscreenToggle.setAttribute(
    "data-tooltip",
    document.fullscreenElement
      ? "Ieșire din ecran complet"
      : "Comută ecran complet"
  );
});

backgroundMusic.addEventListener("ended", function () {
  if (isPlaying) {
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
  }
});

window.addEventListener("beforeunload", () => {
  normalizeTracking();
  cancelAnimationFrame(animationFrameId);
  backgroundMusic.pause();
});

// Setăm zoom-ul inițial mai mare
document.documentElement.style.setProperty("--zoom-level", 1.25); // 25% mai mare by default
zoomLevel = 1.25;
