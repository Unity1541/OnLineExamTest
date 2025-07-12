document.addEventListener('DOMContentLoaded', () => {
    // 測試數據 - 在實際應用中可以從 JSON 文件或 API 獲取
    const mockYears = ['2025', '2024', '2023', '2022', '2021'];
    const mockSubjects = ['數學', '英文', '國文', '物理', '化學', '生物'];
    const mockQuestions = [
        { id: 1, subject: '數學', year: '2025', content: '若 2x + 3y = 12 且 x - y = 1，求 x 與 y 的值。', 
            options: ['x=3, y=2', 'x=4, y=0', 'x=3, y=0', 'x=5, y=-1'], answer: 0 },
        { id: 2, subject: '數學', year: '2025', content: '計算 ∫(x² + 2x + 1)dx', 
            options: ['x³/3 + x² + x + C', 'x³/3 + 2x² + x + C', 'x³/3 + x² + x² + C', 'x³ + 2x² + x + C'], answer: 0 },
        { id: 3, subject: '英文', year: '2025', content: 'Choose the correct sentence:', 
            options: ['She don\'t like apples.', 'She doesn\'t likes apples.', 'She doesn\'t like apples.', 'She not like apples.'], answer: 2 },
        { id: 4, subject: '英文', year: '2025', content: 'What is the meaning of "ubiquitous"?', 
            options: ['Rare', 'Present everywhere', 'Unique', 'Unnecessary'], answer: 1 },
        { id: 5, subject: '國文', year: '2025', content: '下列何者不是李白的作品？', 
            options: ['將進酒', '早發白帝城', '琵琶行', '靜夜思'], answer: 2 },
        { id: 6, subject: '物理', year: '2025', content: '物體從靜止開始做勻加速運動，在前2秒內通過的路程為4米，則在第3秒內通過的路程為？', 
            options: ['3米', '4米', '5米', '6米'], answer: 2 },
        { id: 7, subject: '化學', year: '2025', content: '下列哪個是二氧化碳的化學式？', 
            options: ['CO', 'CO₂', 'H₂CO₃', 'O₂'], answer: 1 },
        { id: 8, subject: '生物', year: '2025', content: '下列何者不是動物細胞的構造？', 
            options: ['細胞膜', '細胞壁', '細胞核', '粒線體'], answer: 1 },
        { id: 9, subject: '數學', year: '2024', content: '一個等差數列的首項為3，公差為2，則第10項為多少？', 
            options: ['21', '22', '23', '24'], answer: 0 },
        { id: 10, subject: '英文', year: '2024', content: 'What is the opposite of "generous"?', 
            options: ['Kind', 'Stingy', 'Wealthy', 'Charitable'], answer: 1 }
    ];

    // 排行榜數據
    let leaderboardData = JSON.parse(localStorage.getItem('examLeaderboard')) || {
        '數學': [], '英文': [], '國文': [], '物理': [], '化學': [], '生物': []
    };

    // 狀態變量
    let currentStep = 0; // 0: 輸入暱稱, 1: 選擇年份, 2: 選擇科目, 3: 考試進行中, 4: 考試結果
    let nickname = '';
    let selectedYear = null;
    let selectedSubject = null;
    let timeLimit = 30; // 預設 30 分鐘
    let timeLeft = timeLimit * 60;
    let examInProgress = false;
    let currentQuestions = [];
    let answers = {};
    let score = 0;
    let timer = null;

    // 獲取DOM元素
    const nicknameStep = document.getElementById('nickname-step');
    const yearStep = document.getElementById('year-step');
    const subjectStep = document.getElementById('subject-step');
    const examStep = document.getElementById('exam-step');
    const resultStep = document.getElementById('result-step');
    
    const nicknameInput = document.getElementById('nickname-input');
    const startBtn = document.getElementById('start-btn');
    const yearSelect = document.getElementById('year-select');
    const yearNextBtn = document.getElementById('year-next-btn');

    // 綁定事件
    startBtn.addEventListener('click', () => {
        if (nicknameInput.value.trim() === '') {
            alert('請輸入暱稱');
            return;
        }
        nickname = nicknameInput.value.trim();
        currentStep = 1;
        updateUI();
    });

    yearNextBtn.addEventListener('click', () => {
        if (yearSelect.value === '') {
            alert('請選擇年度');
            return;
        }
        selectedYear = yearSelect.value;
        currentStep = 2;
        updateUI();
    });

    // 更新UI
    function updateUI() {
        [nicknameStep, yearStep, subjectStep, examStep, resultStep].forEach(el => el.style.display = 'none');
        
        switch (currentStep) {
            case 0: nicknameStep.style.display = 'block'; break;
            case 1: yearStep.style.display = 'block'; break;
            case 2: renderSubjectStep(); subjectStep.style.display = 'block'; break;
            case 3: renderExamStep(); examStep.style.display = 'block'; break;
            case 4: renderResultStep(); resultStep.style.display = 'block'; break;
        }
    }

    // 渲染科目選擇步驟
    function renderSubjectStep() {
        let html = `
            <h2 class="step-title">選擇考試科目</h2>
            <p class="step-description">您選擇了 ${selectedYear} 年度，請選擇科目：</p>
            <div class="selection-grid">
        `;
        
        mockSubjects.forEach(subject => {
            const hasQuestions = mockQuestions.some(q => q.year === selectedYear && q.subject === subject);
            const disabledClass = hasQuestions ? '' : 'disabled';
            
            html += `
                <div class="selection-card ${disabledClass}" data-subject="${subject}" ${!hasQuestions ? 'aria-disabled="true"' : ''}>
                    <h3>${subject}</h3>
                    <p>${hasQuestions ? `點擊開始 ${selectedYear} 年 ${subject} 考試` : `${selectedYear} 年無 ${subject} 考試題目`}</p>
                </div>
            `;
        });
        
        html += `</div>`;
        subjectStep.innerHTML = html;
        
        document.querySelectorAll('.selection-card:not(.disabled)').forEach(card => {
            card.addEventListener('click', () => {
                selectedSubject = card.getAttribute('data-subject');
                startExam();
            });
        });
    }

    // 開始考試
    function startExam() {
        currentQuestions = mockQuestions.filter(q => q.year === selectedYear && q.subject === selectedSubject);
        if (currentQuestions.length === 0) {
            alert(`${selectedYear} 年 ${selectedSubject} 尚無試題。`);
            return;
        }
        answers = {};
        currentQuestions.forEach(q => { answers[q.id] = null; });
        examInProgress = true;
        timeLeft = timeLimit * 60;
        currentStep = 3;
        updateUI();
        startTimer();
    }

    // 渲染考試步驟
    function renderExamStep() {
        let html = `
            <div class="exam-header glass-card">
                <div>
                    <h2>${selectedYear}年 ${selectedSubject} 考試</h2>
                    <p>考生：${nickname} | 共 ${currentQuestions.length} 題</p>
                </div>
                <div class="timer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span id="time-display">${formatTime(timeLeft)}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
                </div>
            </div>
            <div class="questions-container">
        `;
        
        currentQuestions.forEach((question, index) => {
            html += `
                <div class="question-card">
                    <div class="question-content">
                        <div class="question-number">${index + 1}</div>
                        <div class="question-text">${question.content}</div>
                    </div>
                    <div class="options-list">
            `;
            question.options.forEach((option, optIndex) => {
                html += `
                    <div class="option-item" data-question="${question.id}" data-option="${optIndex}">
                        <div class="option-radio"></div>
                        <span>${option}</span>
                    </div>
                `;
            });
            html += `</div></div>`;
        });
        
        html += `
            </div>
            <div class="submit-container">
                <button id="submit-exam" class="btn btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    提交答案
                </button>
            </div>
        `;
        examStep.innerHTML = html;
        
        document.querySelectorAll('.option-item').forEach(item => {
            item.addEventListener('click', () => {
                const questionId = parseInt(item.getAttribute('data-question'));
                const optionIndex = parseInt(item.getAttribute('data-option'));
                
                document.querySelectorAll(`.option-item[data-question="${questionId}"]`).forEach(opt => opt.classList.remove('selected'));
                item.classList.add('selected');
                answers[questionId] = optionIndex;
                updateProgressBar();
            });
        });
        document.getElementById('submit-exam').addEventListener('click', submitExam);
    }

    function updateProgressBar() {
        const answeredCount = Object.values(answers).filter(a => a !== null).length;
        const percentage = (answeredCount / currentQuestions.length) * 100;
        document.getElementById('progress-fill').style.width = `${percentage}%`;
    }

    function startTimer() {
        clearInterval(timer);
        timer = setInterval(() => {
            timeLeft--;
            const timeDisplay = document.getElementById('time-display');
            if (timeDisplay) timeDisplay.textContent = formatTime(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(timer);
                alert('時間到！將自動提交答案。');
                submitExam();
            }
        }, 1000);
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function submitExam() {
        clearInterval(timer);
        examInProgress = false;
        let correctCount = 0;
        currentQuestions.forEach(q => { if (answers[q.id] === q.answer) correctCount++; });
        score = Math.round((correctCount / currentQuestions.length) * 100);
        updateLeaderboard();
        currentStep = 4;
        updateUI();
    }

    function updateLeaderboard() {
        let subjectLeaderboard = leaderboardData[selectedSubject] || [];
        const existingIndex = subjectLeaderboard.findIndex(item => item.nickname === nickname);
        
        const userRecord = { nickname, score, year: selectedYear, date: new Date().toISOString() };

        if (existingIndex !== -1) {
            // Update only if the new score is higher
            if (score >= subjectLeaderboard[existingIndex].score) {
                 subjectLeaderboard[existingIndex] = userRecord;
            }
        } else {
            subjectLeaderboard.push(userRecord);
        }
        
        subjectLeaderboard.sort((a, b) => b.score - a.score);
        leaderboardData[selectedSubject] = subjectLeaderboard;
        localStorage.setItem('examLeaderboard', JSON.stringify(leaderboardData));
    }

    function renderResultStep() {
        const subjectLeaderboard = leaderboardData[selectedSubject] || [];
        const userIndex = subjectLeaderboard.findIndex(item => item.nickname === nickname);
        const userRank = userIndex !== -1 ? userIndex + 1 : "N/A";
        const topFive = subjectLeaderboard.slice(0, 5);
        
        let html = `
            <div class="result-container glass-card fade-in">
                 <div class="${score >= 60 ? 'result-icon success' : 'result-icon failure'}">
                    ${score >= 60 ? 
                        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' : 
                        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'}
                </div>
                <h2 class="result-title">${score >= 60 ? '恭喜通過！' : '再接再厲！'}</h2>
                <p>${selectedYear}年 ${selectedSubject} 考試 | 考生：${nickname}</p>
                
                <div class="score-container">
                    <div class="result-score">
                        <span class="score-value">${score}</span>
                        <span class="score-total">/100</span>
                    </div>
                </div>
                
                <div class="rank-info">
                    <p>您在${selectedSubject}排行榜中排名第 <strong>${userRank}</strong> 名</p>
                </div>
                
                <h3 class="leaderboard-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2l3 6.3 7 1-5 4.8 1.2 6.9-6.2-3.2Z"></path></svg>
                    ${selectedSubject}排行榜（前五名）
                </h3>
                
                <div class="mini-leaderboard">
        `;
        
        if (topFive.length === 0) {
            html += `<p class="no-data">暫無排名數據</p>`;
        } else {
            topFive.forEach((item, index) => {
                html += `
                    <div class="rank-item ${item.nickname === nickname ? 'current-user' : ''}">
                        <div class="rank-position">${index + 1}</div>
                        <div class="rank-nickname">${item.nickname}</div>
                        <div class="rank-score">${item.score}</div>
                    </div>
                `;
            });
        }
        
        html += `
                </div>
                <div class="button-group" style="margin-top: 2rem;">
                    <a href="index.html" class="btn btn-secondary">返回首頁</a>
                    <a href="exam.html" class="btn btn-primary">再測一次</a>
                </div>
            </div>
        `;
        resultStep.innerHTML = html;
    }

    updateUI();
});
