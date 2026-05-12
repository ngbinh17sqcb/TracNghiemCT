let currentMode = ''; // 'practice' hoặc 'exam'
let activeQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = []; // Lưu trữ đáp án người dùng chọn: mảng các object { index: selectedIndex, isCorrect: boolean } hoặc null
let flags = new Set(); // Set chứa index của các câu bị đánh dấu
let timerInterval;
let timeLeft = 15 * 60; // 15 phút cho chế độ thi thử

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizApp = document.getElementById('quiz-app');
const resultScreen = document.getElementById('result-screen');
const reviewScreen = document.getElementById('review-screen');
const themeToggle = document.getElementById('theme-toggle');

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('answer-options');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const flagBtn = document.getElementById('flag-btn');

const questionCountDisplay = document.getElementById('question-count');
const timerDisplay = document.getElementById('timer');
const timeText = document.getElementById('time-display');
const progressBar = document.getElementById('progress-bar');
const questionNavigator = document.getElementById('question-navigator');

const confirmModal = document.getElementById('confirm-modal');
const unansweredWarning = document.getElementById('unanswered-warning');
const unansweredCount = document.getElementById('unanswered-count');

// Dark Mode Toggle
themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
});

// Hàm trộn mảng
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startQuiz(mode) {
    currentMode = mode;
    startScreen.classList.add('hidden');
    quizApp.classList.remove('hidden');

    // Khởi tạo dữ liệu
    activeQuestions = JSON.parse(JSON.stringify(quizData)); // Deep copy
    shuffleArray(activeQuestions);

    // Xáo trộn đáp án trong mỗi câu
    activeQuestions.forEach(q => {
        let optionsWithState = q.options.map((opt, index) => ({
            text: opt,
            originalIndex: index,
            isCorrect: index === q.answer
        }));
        shuffleArray(optionsWithState);
        q.shuffledOptions = optionsWithState;
    });

    userAnswers = new Array(activeQuestions.length).fill(null);
    flags.clear();
    currentQuestionIndex = 0;

    buildNavigator();

    if (mode === 'exam') {
        timerDisplay.classList.remove('hidden');
        submitBtn.classList.remove('hidden');
        nextBtn.innerHTML = 'Câu tiếp theo <i class="fas fa-chevron-right"></i>';
        startTimer();
    } else {
        timerDisplay.classList.add('hidden');
        submitBtn.classList.add('hidden'); // Practice mode nộp bài ở câu cuối bằng nút next
    }

    loadQuestion();
}

function buildNavigator() {
    questionNavigator.innerHTML = '';
    activeQuestions.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.classList.add('nav-btn');
        btn.innerText = index + 1;
        btn.onclick = () => jumpToQuestion(index);
        btn.id = `nav-btn-${index}`;
        questionNavigator.appendChild(btn);
    });
}

function updateNavigator() {
    const navBtns = questionNavigator.children;
    for (let i = 0; i < navBtns.length; i++) {
        const btn = navBtns[i];
        btn.className = 'nav-btn'; // Reset
        
        if (i === currentQuestionIndex) btn.classList.add('active');
        if (flags.has(i)) btn.classList.add('flagged');

        if (currentMode === 'exam') {
            if (userAnswers[i] !== null) btn.classList.add('answered');
        } else {
            // Practice mode
            if (userAnswers[i] !== null) {
                if (userAnswers[i].isCorrect) btn.classList.add('correct-nav');
                else btn.classList.add('wrong-nav');
            }
        }
    }
}

function jumpToQuestion(index) {
    currentQuestionIndex = index;
    loadQuestion();
}

function loadQuestion() {
    const currentQuestion = activeQuestions[currentQuestionIndex];
    
    // Cập nhật UI
    questionCountDisplay.innerText = `Câu: ${currentQuestionIndex + 1} / ${activeQuestions.length}`;
    questionText.innerText = currentQuestion.question;
    const progress = ((currentQuestionIndex + 1) / activeQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;

    // Cờ
    if (flags.has(currentQuestionIndex)) {
        flagBtn.classList.add('flagged');
        flagBtn.innerHTML = '<i class="fas fa-flag"></i>';
    } else {
        flagBtn.classList.remove('flagged');
        flagBtn.innerHTML = '<i class="far fa-flag"></i>';
    }

    // Render Đáp án
    optionsContainer.innerHTML = '';
    const hasAnswered = userAnswers[currentQuestionIndex] !== null;

    currentQuestion.shuffledOptions.forEach((optionObj, index) => {
        const button = document.createElement('button');
        button.innerText = optionObj.text;
        button.classList.add('option-btn');
        
        // Trạng thái đã chọn
        if (hasAnswered) {
            if (currentMode === 'exam') {
                if (userAnswers[currentQuestionIndex].selectedIndex === index) {
                    button.classList.add('selected');
                }
            } else { // Practice
                button.disabled = true;
                if (userAnswers[currentQuestionIndex].selectedIndex === index) {
                    if (optionObj.isCorrect) button.classList.add('correct');
                    else button.classList.add('wrong');
                } else if (optionObj.isCorrect) {
                    button.classList.add('correct'); // Hiện đáp án đúng
                }
            }
        }

        button.onclick = () => selectAnswer(index, optionObj.isCorrect);
        optionsContainer.appendChild(button);
    });

    // Cập nhật nút
    prevBtn.disabled = currentQuestionIndex === 0;
    
    if (currentMode === 'practice') {
        if (currentQuestionIndex === activeQuestions.length - 1) {
            nextBtn.innerHTML = '<i class="fas fa-flag-checkered"></i> Xem kết quả';
            nextBtn.classList.add('btn-danger');
            nextBtn.classList.remove('btn-outline');
        } else {
            nextBtn.innerHTML = 'Câu tiếp theo <i class="fas fa-chevron-right"></i>';
            nextBtn.classList.remove('btn-danger');
        }
    } else {
        nextBtn.disabled = currentQuestionIndex === activeQuestions.length - 1;
    }

    updateNavigator();
}

function selectAnswer(selectedIndex, isCorrect) {
    if (currentMode === 'practice' && userAnswers[currentQuestionIndex] !== null) {
        return; // Không cho chọn lại trong chế độ ôn luyện
    }

    userAnswers[currentQuestionIndex] = { selectedIndex, isCorrect };

    if (currentMode === 'exam') {
        loadQuestion(); // Re-render để hiện style selected
    } else {
        loadQuestion(); // Re-render để hiện đúng/sai
    }
}

// Chuyển câu
function nextQuestion() {
    if (currentMode === 'practice' && currentQuestionIndex === activeQuestions.length - 1) {
        finishQuiz();
        return;
    }
    if (currentQuestionIndex < activeQuestions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

// Cờ
flagBtn.onclick = () => {
    if (flags.has(currentQuestionIndex)) {
        flags.delete(currentQuestionIndex);
    } else {
        flags.add(currentQuestionIndex);
    }
    loadQuestion(); // update icon
};

// Timer
function startTimer() {
    clearInterval(timerInterval);
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            finishQuiz(); // Hết giờ tự động nộp
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeText.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    if (timeLeft < 60) {
        timerDisplay.style.color = 'var(--wrong-color)';
        timerDisplay.style.animation = 'pulse 1s infinite';
    }
}

// Nộp bài
function confirmSubmit() {
    const unanswered = userAnswers.filter(ans => ans === null).length;
    if (unanswered > 0) {
        unansweredCount.innerText = unanswered;
        unansweredWarning.style.display = 'block';
    } else {
        unansweredWarning.style.display = 'none';
    }
    confirmModal.classList.remove('hidden');
}

function closeModal() {
    confirmModal.classList.add('hidden');
}

function submitQuiz() {
    closeModal();
    finishQuiz();
}

function finishQuiz() {
    clearInterval(timerInterval);
    quizApp.classList.add('hidden');
    resultScreen.classList.remove('hidden');

    let score = 0;
    userAnswers.forEach(ans => {
        if (ans !== null && ans.isCorrect) score++;
    });

    document.getElementById('score-number').innerText = score;
    document.getElementById('total-number').innerText = activeQuestions.length;

    const rankDisplay = document.getElementById('rank-display');
    let tyLe = score / activeQuestions.length;
    if(tyLe === 1) {
        rankDisplay.innerText = "Xuất sắc! Đồng chí nắm rất vững kiến thức.";
        rankDisplay.style.color = "var(--correct-color)";
    } else if(tyLe >= 0.8) {
        rankDisplay.innerText = "Đạt yêu cầu! Đồng chí cần phát huy.";
        rankDisplay.style.color = "var(--primary-color)";
    } else if(tyLe >= 0.5) {
         rankDisplay.innerText = "Trung bình! Yêu cầu đồng chí tích cực ôn luyện thêm.";
         rankDisplay.style.color = "var(--flag-color)";
    } else {
        rankDisplay.innerText = "Chưa đạt! Đồng chí cần nghiêm túc ôn tập lại.";
        rankDisplay.style.color = "var(--wrong-color)";
    }
}

function showReview() {
    resultScreen.classList.add('hidden');
    reviewScreen.classList.remove('hidden');
    
    const reviewContainer = document.getElementById('review-container');
    reviewContainer.innerHTML = '';

    activeQuestions.forEach((q, index) => {
        const item = document.createElement('div');
        const ans = userAnswers[index];
        const isCorrect = ans && ans.isCorrect;
        
        item.className = `review-item ${isCorrect ? 'r-correct' : 'r-wrong'}`;
        
        let html = `<div class="review-question">Câu ${index + 1}: ${q.question}</div>`;
        
        const correctOpt = q.shuffledOptions.find(opt => opt.isCorrect);
        
        if (ans === null) {
            html += `<div class="review-ans user-ans">Bạn chưa trả lời.</div>`;
        } else {
            const userOptText = q.shuffledOptions[ans.selectedIndex].text;
            html += `<div class="review-ans ${isCorrect ? 'correct-ans' : 'user-ans'}">Bạn chọn: ${userOptText}</div>`;
        }

        if (!isCorrect) {
            html += `<div class="review-ans correct-ans">Đáp án đúng: ${correctOpt.text}</div>`;
        }

        item.innerHTML = html;
        reviewContainer.appendChild(item);
    });
}