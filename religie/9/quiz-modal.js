// Inițializare sistem de quiz-uri
document.addEventListener("DOMContentLoaded", function () {
  // Creare container modal în DOM
  createModalContainer();

  // Adăugare event listeners pentru butoanele de quiz
  const quizButtons = document.querySelectorAll(".quiz-button");
  quizButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Dacă teleprompterul rulează, pune-l pe pauză
      if (typeof isPlaying !== "undefined" && isPlaying) {
        togglePlayPause();
      }

      // Obține datele întrebării
      const questionType = this.getAttribute("data-question-type");
      const question = this.getAttribute("data-question");
      const option1 = this.getAttribute("data-option1");
      const option2 = this.getAttribute("data-option2");
      const option3 = this.getAttribute("data-option3");
      const correctIndex = this.getAttribute("data-correct");
      const explanation = this.getAttribute("data-explanation");

      // Media pentru întrebare (imagine, video sau youtube)
      let mediaUrl = "";
      let videoId = "";

      if (questionType === "image") {
        mediaUrl = this.getAttribute("data-image");
      } else if (questionType === "video") {
        mediaUrl = this.getAttribute("data-video");
      } else if (questionType === "youtube") {
        videoId = this.getAttribute("data-video-id");
      }

      // Deschide modalul cu întrebarea
      openQuizModal(
        questionType,
        question,
        [option1, option2, option3],
        correctIndex,
        explanation,
        mediaUrl,
        videoId
      );
    });
  });
});

// Creare container modal în DOM
function createModalContainer() {
  // Verifică dacă containerul există deja
  if (document.getElementById("quizModalContainer")) {
    return;
  }

  // Creare overlay
  const modalOverlay = document.createElement("div");
  modalOverlay.id = "quizModalContainer";
  modalOverlay.className = "quiz-modal-overlay";

  // Structura modalului
  modalOverlay.innerHTML = `
  <div class="quiz-modal">
    <div class="quiz-modal-border"></div>
    <button class="quiz-modal-close">&times;</button>
    <div class="quiz-modal-body">
      <div class="quiz-question"></div>
      <div class="quiz-media-container"></div>
      <div class="quiz-options"></div>
      <div class="quiz-result-message"></div>
    </div>
    <div class="quiz-modal-footer">
      <button class="quiz-btn quiz-btn-options">Afișează variantele</button>
      <button class="quiz-btn quiz-btn-answer">Afișează răspunsul</button>
    </div>
  </div>
`;

  // Adăugare în DOM
  document.body.appendChild(modalOverlay);

  // Event listeners pentru modal
  const modal = modalOverlay.querySelector(".quiz-modal");
  const closeBtn = modal.querySelector(".quiz-modal-close");

  // Închidere modal cu X
  closeBtn.addEventListener("click", closeQuizModal);

  // Închidere modal la click în afara lui
  modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) {
      closeQuizModal();
    }
  });
}

// Deschidere modal cu întrebare
function openQuizModal(
  type,
  question,
  options,
  correctIndex,
  explanation,
  mediaUrl,
  videoId
) {
  const overlay = document.getElementById("quizModalContainer");
  const modal = overlay.querySelector(".quiz-modal");
  const questionEl = modal.querySelector(".quiz-question");
  const mediaContainer = modal.querySelector(".quiz-media-container");
  const optionsContainer = modal.querySelector(".quiz-options");
  const resultMessage = modal.querySelector(".quiz-result-message");
  const optionsBtn = modal.querySelector(".quiz-btn-options");
  const answerBtn = modal.querySelector(".quiz-btn-answer");

  // Resetare modal
  mediaContainer.innerHTML = "";
  optionsContainer.innerHTML = "";
  optionsContainer.style.display = "none";
  resultMessage.style.display = "none";
  resultMessage.textContent = "";
  resultMessage.className = "quiz-result-message";
  optionsBtn.style.display = "block";
  answerBtn.style.display = "block";
  answerBtn.disabled = false;

  // Setare întrebare
  questionEl.textContent = question;

  // Adăugare media (imagine, video sau youtube)
  if (type === "image" && mediaUrl) {
    mediaContainer.innerHTML = `
      <div class="quiz-image-container">
        <img class="quiz-image" src="${mediaUrl}" alt="Imagine întrebare">
      </div>
    `;
  } else if (type === "video" && mediaUrl) {
    mediaContainer.innerHTML = `
      <div class="quiz-video-container">
        <video class="quiz-video" controls>
          <source src="${mediaUrl}" type="video/mp4">
          Browser-ul tău nu suportă tag-ul video.
        </video>
      </div>
    `;

    // Pauză teleprompter când video-ul pornește
    const video = mediaContainer.querySelector("video");
    video.addEventListener("play", function () {
      if (typeof isPlaying !== "undefined" && isPlaying) {
        togglePlayPause();
      }
    });
  } else if (type === "youtube" && videoId) {
    mediaContainer.innerHTML = `
      <div class="quiz-video-container">
        <iframe 
          class="quiz-video youtube-frame" 
          src="https://www.youtube.com/embed/${videoId}?enablejsapi=1" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
    `;
  }

  // Generare opțiuni
  options.forEach((option, index) => {
    if (option) {
      const optionEl = document.createElement("div");
      optionEl.className = "quiz-option";
      optionEl.dataset.index = index + 1;
      optionEl.innerHTML = `
        <span class="quiz-option-text">${option}</span>
      `;

      // Event listener pentru selectare opțiune
      optionEl.addEventListener("click", function () {
        // Resetare selecții anterioare
        optionsContainer.querySelectorAll(".quiz-option").forEach((opt) => {
          opt.classList.remove("selected", "correct", "incorrect");
        });

        // Marcare opțiune selectată
        this.classList.add("selected");

        // Activare buton afișare răspuns
        answerBtn.disabled = false;
      });

      optionsContainer.appendChild(optionEl);
    }
  });

  // Deschide modalul cu efect de animație
  overlay.classList.add("active");
  setTimeout(() => {
    modal.classList.add("active");
  }, 10);

  // Resetare event listeners pentru a evita duplicarea
  const newOptionsBtn = optionsBtn.cloneNode(true);
  const newAnswerBtn = answerBtn.cloneNode(true);

  optionsBtn.parentNode.replaceChild(newOptionsBtn, optionsBtn);
  answerBtn.parentNode.replaceChild(newAnswerBtn, answerBtn);

  // Adăugare noilor event listeners
  newOptionsBtn.addEventListener("click", function () {
    optionsContainer.style.display = "block";
    this.style.display = "none";
  });

  newAnswerBtn.addEventListener("click", function () {
    const resultMessage = modal.querySelector(".quiz-result-message");

    // Cazul 1: Opțiunile NU sunt afișate - afișăm doar răspunsul corect, fără a afișa opțiunile
    if (optionsContainer.style.display !== "block") {
      // NU mai afișăm toate opțiunile
      // optionsContainer.style.display = "block"; - Această linie a fost eliminată

      // Afișează mesajul de rezultat direct
      resultMessage.textContent = `Răspunsul corect este: ${
        options[correctIndex - 1]
      }`;
      resultMessage.classList.add("correct");
      resultMessage.style.display = "block";

      // Ascunde butonul de opțiuni pentru a evita confuzia
      newOptionsBtn.style.display = "none";

      // Ascunde butonul de răspuns
      this.style.display = "none";
      return;
    }

    // Cazul 2: Opțiunile sunt afișate
    // Verifică dacă este selectată vreo opțiune
    const selectedOption = optionsContainer.querySelector(
      ".quiz-option.selected"
    );
    if (selectedOption) {
      // Verifică răspunsul
      const selectedIndex = selectedOption.dataset.index;

      if (selectedIndex === correctIndex) {
        selectedOption.classList.add("correct");
        resultMessage.textContent = "Răspuns corect! Felicitări!";
        resultMessage.classList.add("correct");
      } else {
        selectedOption.classList.add("incorrect");
        const correctOption = optionsContainer.querySelector(
          `.quiz-option[data-index="${correctIndex}"]`
        );
        if (correctOption) {
          correctOption.classList.add("correct");
        }
        resultMessage.textContent = "Răspuns greșit!";
        resultMessage.classList.add("incorrect");
      }

      // Afișează mesajul de rezultat
      resultMessage.style.display = "block";

      // Ascunde butonul de răspuns
      this.style.display = "none";
    } else {
      // Nu este selectată nicio opțiune - afișează mesaj de avertizare
      resultMessage.textContent =
        "Vă rugăm să selectați mai întâi o variantă de răspuns!";
      resultMessage.classList.add("incorrect");
      resultMessage.style.display = "block";

      // Asigură-te că mesajul este vizibil
      resultMessage.scrollIntoView({ behavior: "smooth", block: "center" });

      // Ascundem mesajul după 3 secunde
      setTimeout(() => {
        resultMessage.style.display = "none";
        resultMessage.classList.remove("incorrect");
      }, 3000);
    }
  });
}

// Închidere modal
function closeQuizModal() {
  const overlay = document.getElementById("quizModalContainer");
  const modal = overlay.querySelector(".quiz-modal");
  const optionsContainer = modal.querySelector(".quiz-options");
  const resultMessage = modal.querySelector(".quiz-result-message");
  const optionsBtn = modal.querySelector(".quiz-btn-options");
  const answerBtn = modal.querySelector(".quiz-btn-answer");

  // Resetare stare modal
  optionsContainer.innerHTML = "";
  optionsContainer.style.display = "none";
  resultMessage.style.display = "none";
  resultMessage.textContent = "";
  resultMessage.className = "quiz-result-message";
  optionsBtn.style.display = "block";
  answerBtn.style.display = "block";
  answerBtn.disabled = false;

  // Animație de închidere
  modal.classList.remove("active");
  setTimeout(() => {
    overlay.classList.remove("active");
  }, 300);
}
