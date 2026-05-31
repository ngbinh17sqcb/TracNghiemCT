// === HỆ THỐNG BẢO VỆ NỘI BỘ - CHẶN SOI CODE ===
// 1. Chặn menu chuột phải
document.addEventListener('contextmenu', event => event.preventDefault());

// 2. Chặn các phím nóng của dân kỹ thuật
document.addEventListener('keydown', function(e) {
    if (e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
        (e.ctrlKey && e.keyCode === 85) || // Ctrl+U
        (e.ctrlKey && e.keyCode === 83)    // Ctrl+S
    ) {
        e.preventDefault();
    }
});

// 3. Cấm chụp màn hình (làm mờ giao diện khi không focus)
window.addEventListener('blur', () => {
    // Chỉ áp dụng khi đã đăng nhập
    if (!mainContainer.classList.contains('hidden')) {
        document.body.classList.add('no-peeking');
    }
});
window.addEventListener('focus', () => {
    document.body.classList.remove('no-peeking');
});

// === AUDIO EFFECTS ===
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'ping') { // Tiếng đúng
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.2);
    } else if (type === 'buzzer') { // Tiếng sai
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    }
}

// === STATE & VARIABLES ===
let currentMode = ''; 
let activeQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = []; 
let flags = new Set(); 
let timerInterval;
let timeLeft = 0; 
let isPaused = false;

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizApp = document.getElementById('quiz-app');
const resultScreen = document.getElementById('result-screen');
const reviewScreen = document.getElementById('review-screen');

const questionSection = document.getElementById('question-section');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('answer-options');
const categoryBadge = document.getElementById('category-badge');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const flagBtn = document.getElementById('flag-btn');

const questionCountDisplay = document.getElementById('question-count');
const timerDisplay = document.getElementById('timer');
const timeText = document.getElementById('time-display');
const progressBar = document.getElementById('progress-bar');
const questionNavigator = document.getElementById('question-navigator');
const pauseBtn = document.getElementById('pause-btn');
const pauseOverlay = document.getElementById('pause-overlay');

const confirmModal = document.getElementById('confirm-modal');
const unansweredWarning = document.getElementById('unanswered-warning');
const unansweredCount = document.getElementById('unanswered-count');

const loginOverlay = document.getElementById('login-overlay');
const loginBtn = document.getElementById('login-btn');
const passwordInput = document.getElementById('password-input');
const loginError = document.getElementById('login-error');
const mainContainer = document.querySelector('.container');
const togglePasswordBtn = document.getElementById('toggle-password');

function handleLogin() {
    if (passwordInput.value === 'cauduongk29') {
        sessionStorage.setItem('tracnghiem_logged_in', 'true');
        loginOverlay.classList.add('hidden');
        mainContainer.classList.remove('hidden');
    } else {
        loginError.classList.remove('hidden');
        passwordInput.focus();
    }
}

loginBtn.addEventListener('click', handleLogin);
passwordInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        handleLogin();
    }
});

togglePasswordBtn.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    const icon = this.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
    passwordInput.focus();
});

// Init app on load
function initApp() {
    if (sessionStorage.getItem('tracnghiem_logged_in') === 'true') {
        loginOverlay.classList.add('hidden');
        mainContainer.classList.remove('hidden');
    } else {
        passwordInput.focus(); // Focus on password input on load
    }

    // Load High Score
    const highScore = localStorage.getItem('tracnghiem_highscore');
    if (highScore) {
        document.getElementById('high-score-board').classList.remove('hidden');
        document.getElementById('highest-score').innerText = highScore + "%";
    }

    // Check saved state
    if (localStorage.getItem('tracnghiem_save')) {
        document.getElementById('resume-container').classList.remove('hidden');
    }
}
initApp();

// Dark Mode
const themeCheckbox = document.getElementById('theme-checkbox');
themeCheckbox.addEventListener('change', () => {
    if (themeCheckbox.checked) {
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.body.setAttribute('data-theme', 'light');
    }
});

// Mobile Drawer
const drawerToggle = document.getElementById('drawer-toggle');
const navigatorDrawer = document.getElementById('navigator-drawer');
const closeDrawerBtn = document.getElementById('close-drawer');
const drawerBackdrop = document.getElementById('drawer-backdrop');

function toggleDrawer() {
    navigatorDrawer.classList.toggle('open');
    drawerBackdrop.classList.toggle('show');
}
drawerToggle.onclick = toggleDrawer;
closeDrawerBtn.onclick = toggleDrawer;
drawerBackdrop.onclick = toggleDrawer;


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// === BẮT ĐẦU BÀI THI ===
function startQuiz(mode) {
    currentMode = mode;
    
    // Đọc cài đặt
    const selectedCount = document.getElementById('setup-count').value;
    const selectedTime = document.getElementById('setup-time').value;

    let filteredData = [...quizData]; // Sử dụng toàn bộ câu hỏi
    shuffleArray(filteredData);
    
    if (selectedCount !== 'all') {
        filteredData = filteredData.slice(0, parseInt(selectedCount));
    }

    if (filteredData.length === 0) {
        alert("Không có câu hỏi nào!");
        return;
    }

    activeQuestions = JSON.parse(JSON.stringify(filteredData)); // Deep copy

    activeQuestions.forEach(q => {
        let optionsWithState = q.options.map((opt, index) => ({
            text: opt, originalIndex: index, isCorrect: index === q.answer
        }));
        shuffleArray(optionsWithState);
        q.shuffledOptions = optionsWithState;
    });

    userAnswers = new Array(activeQuestions.length).fill(null);
    flags.clear();
    currentQuestionIndex = 0;
    timeLeft = parseInt(selectedTime) * 60;
    
    setupUI();
    saveProgress(); // Lưu state ban đầu
}

function resumeQuiz() {
    const saved = JSON.parse(localStorage.getItem('tracnghiem_save'));
    if (saved) {
        currentMode = saved.currentMode;
        activeQuestions = saved.activeQuestions;
        currentQuestionIndex = saved.currentQuestionIndex;
        userAnswers = saved.userAnswers;
        flags = new Set(saved.flags);
        timeLeft = saved.timeLeft;
        setupUI();
    }
}

function clearSavedProgress() {
    if(confirm("Bạn có chắc chắn muốn xóa bài thi đang lưu?")) {
        localStorage.removeItem('tracnghiem_save');
        document.getElementById('resume-container').classList.add('hidden');
    }
}

function saveProgress() {
    const state = {
        currentMode, activeQuestions, currentQuestionIndex,
        userAnswers, flags: Array.from(flags), timeLeft
    };
    localStorage.setItem('tracnghiem_save', JSON.stringify(state));
}

function setupUI() {
    startScreen.classList.add('hidden');
    quizApp.classList.remove('hidden');
    buildNavigator();

    if (currentMode === 'exam') {
        timerDisplay.classList.remove('hidden');
        pauseBtn.classList.remove('hidden');
        submitBtn.classList.remove('hidden');
        nextBtn.innerHTML = 'Câu tiếp theo <i class="fas fa-chevron-right"></i>';
        startTimer();
    } else {
        timerDisplay.classList.add('hidden');
        pauseBtn.classList.add('hidden');
        submitBtn.classList.add('hidden');
    }

    loadQuestion('fade');
}

// === RENDER UI ===
function buildNavigator() {
    questionNavigator.innerHTML = '';
    activeQuestions.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.classList.add('nav-btn');
        btn.innerText = index + 1;
        btn.onclick = () => {
            if (currentQuestionIndex === index) return;
            const direction = index > currentQuestionIndex ? 'slide-left' : 'slide-right';
            currentQuestionIndex = index;
            loadQuestion(direction);
        };
        questionNavigator.appendChild(btn);
    });
}

function updateNavigator() {
    const navBtns = questionNavigator.children;
    for (let i = 0; i < navBtns.length; i++) {
        const btn = navBtns[i];
        btn.className = 'nav-btn'; 
        
        if (i === currentQuestionIndex) btn.classList.add('active');
        if (flags.has(i)) btn.classList.add('flagged');

        if (currentMode === 'exam') {
            if (userAnswers[i] !== null) btn.classList.add('answered');
        } else {
            if (userAnswers[i] !== null) {
                if (userAnswers[i].isCorrect) btn.classList.add('correct-nav');
                else btn.classList.add('wrong-nav');
            }
        }
    }
}

// direction: 'fade' | 'slide-left' | 'slide-right' | 'none'
function loadQuestion(direction = 'none') {
    if (direction !== 'none') {
        questionSection.classList.remove('active-slide', 'slide-out', 'slide-in');
        if(direction === 'slide-left') questionSection.classList.add('slide-in');
        else if (direction === 'slide-right') questionSection.classList.add('slide-out');
        else questionSection.style.opacity = '0';

        setTimeout(() => renderQuestionContent(), 50);
    } else {
        renderQuestionContent();
    }
}

function renderQuestionContent() {
    const currentQuestion = activeQuestions[currentQuestionIndex];
    
    questionCountDisplay.innerText = `Câu: ${currentQuestionIndex + 1} / ${activeQuestions.length}`;
    categoryBadge.innerText = "Công tác Đảng, CTCT";
    questionText.innerText = currentQuestion.question;
    progressBar.style.width = `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%`;

    if (flags.has(currentQuestionIndex)) {
        flagBtn.classList.add('flagged');
        flagBtn.innerHTML = '<i class="fas fa-flag"></i>';
    } else {
        flagBtn.classList.remove('flagged');
        flagBtn.innerHTML = '<i class="far fa-flag"></i>';
    }

    optionsContainer.innerHTML = '';
    const hasAnswered = userAnswers[currentQuestionIndex] !== null;

    currentQuestion.shuffledOptions.forEach((optionObj, index) => {
        const button = document.createElement('button');
        button.innerText = optionObj.text;
        button.classList.add('option-btn');
        
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
                    button.classList.add('correct');
                }
            }
        }

        button.onclick = () => selectAnswer(index, optionObj.isCorrect);
        optionsContainer.appendChild(button);
    });

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
    saveProgress();

    // Trigger animation in
    requestAnimationFrame(() => {
        questionSection.classList.remove('slide-in', 'slide-out');
        questionSection.style.opacity = '1';
        questionSection.classList.add('active-slide');
    });
}

function selectAnswer(selectedIndex, isCorrect) {
    if (currentMode === 'practice' && userAnswers[currentQuestionIndex] !== null) return; 

    userAnswers[currentQuestionIndex] = { selectedIndex, isCorrect };

    if (currentMode === 'practice') {
        if (isCorrect) playSound('ping');
        else playSound('buzzer');
    }

    loadQuestion('none'); // Re-render style
}

function nextQuestion() {
    if (currentMode === 'practice' && currentQuestionIndex === activeQuestions.length - 1) {
        finishQuiz();
        return;
    }
    if (currentQuestionIndex < activeQuestions.length - 1) {
        currentQuestionIndex++;
        loadQuestion('slide-left');
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion('slide-right');
    }
}

flagBtn.onclick = () => {
    if (flags.has(currentQuestionIndex)) flags.delete(currentQuestionIndex);
    else flags.add(currentQuestionIndex);
    loadQuestion('none');
};

// === TIMER & PAUSE ===
function startTimer() {
    clearInterval(timerInterval);
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        if(!isPaused) {
            timeLeft--;
            updateTimerDisplay();
            // Lưu progress mỗi 5s để tránh lag
            if(timeLeft % 5 === 0) saveProgress();

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                finishQuiz();
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeText.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeLeft < 60 && timeLeft > 0) {
        timerDisplay.classList.add('heartbeat-active');
    } else {
        timerDisplay.classList.remove('heartbeat-active');
    }
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        pauseOverlay.classList.remove('hidden');
        pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        pauseOverlay.classList.add('hidden');
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
}
pauseBtn.onclick = togglePause;

// === SUBMIT ===
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
    localStorage.removeItem('tracnghiem_save'); // Xóa save khi thi xong
    
    quizApp.classList.add('hidden');
    resultScreen.classList.remove('hidden');

    let score = 0;
    userAnswers.forEach(ans => {
        if (ans !== null && ans.isCorrect) score++;
    });

    document.getElementById('score-number').innerText = score;
    document.getElementById('total-number').innerText = activeQuestions.length;

    const rankDisplay = document.getElementById('rank-display');
    const scoreCircle = document.getElementById('score-circle');
    let tyLe = score / activeQuestions.length;
    let percent = Math.round(tyLe * 100);

    // Update Highscore
    let highest = localStorage.getItem('tracnghiem_highscore') || 0;
    if(percent > highest) {
        localStorage.setItem('tracnghiem_highscore', percent);
    }

    if(tyLe >= 0.8) {
        if(tyLe === 1) rankDisplay.innerText = "Tuyệt đối! Chúc mừng đồng chí.";
        else rankDisplay.innerText = "Xuất sắc! Đồng chí nắm rất vững kiến thức.";
        rankDisplay.style.color = "var(--correct-color)";
        scoreCircle.style.borderColor = "var(--correct-color)";
        scoreCircle.style.transform = "scale(1.1)";
        
        // Bắn pháo hoa
        if(typeof confetti !== 'undefined') {
            setTimeout(() => {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            }, 300);
        }
    } else if(tyLe >= 0.5) {
         rankDisplay.innerText = "Đạt yêu cầu. Cần cố gắng thêm.";
         rankDisplay.style.color = "var(--primary-color)";
    } else {
        rankDisplay.innerText = "Chưa đạt! Yêu cầu đồng chí nghiêm túc ôn luyện lại.";
        rankDisplay.style.color = "var(--wrong-color)";
        scoreCircle.style.borderColor = "var(--wrong-color)";
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
        
        let html = `<div class="review-question">
            <span class="badge" style="margin-right: 10px; background: #6c757d;">Câu ${index + 1}</span>
            ${q.question}
        </div>`;
        
        const correctOpt = q.shuffledOptions.find(opt => opt.isCorrect);
        
        if (ans === null) {
            html += `<div class="review-ans user-ans"><i class="fas fa-times-circle"></i> Bạn chưa trả lời.</div>`;
        } else {
            const userOptText = q.shuffledOptions[ans.selectedIndex].text;
            html += `<div class="review-ans ${isCorrect ? 'correct-ans' : 'user-ans'}">
                <i class="fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}"></i> Bạn chọn: ${userOptText}
            </div>`;
        }

        if (!isCorrect) {
            html += `<div class="review-ans correct-ans"><i class="fas fa-check-circle"></i> Đáp án đúng: ${correctOpt.text}</div>`;
        }

        item.innerHTML = html;
        reviewContainer.appendChild(item);
    });
}