document.addEventListener('DOMContentLoaded', () => {
    const examContainer = document.getElementById('exam-container');
    // Super-gatekeeper: Check for initialization errors first.
    if (window.firebaseInitializationError) {
        examContainer.innerHTML = `
            <div class="glass-card fade-in" style="max-width: 650px; margin: 2rem auto;">
                 <div class="login-header">
                    <svg class="login-icon" style="color: var(--danger-color);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h2 style="background: var(--danger-color); -webkit-background-clip: text;">Firebase 設定錯誤</h2>
                    <p>您的 Firebase 設定檔 (<code>js/firebase.js</code>) 存在格式錯誤，導致應用程式無法啟動。請檢查您的設定是否從 Firebase 控制台完整複製。</p>
                </div>
                <div class="demo-info" style="text-align: left; background-color: rgba(239, 68, 68, 0.1); color: #c05621;">
                    <p><strong>錯誤詳情：</strong></p>
                    <pre style="white-space: pre-wrap; word-wrap: break-word;">${window.firebaseInitializationError.message}</pre>
                </div>
            </div>`;
        return; // Stop execution
    }

    const usePreviewMode = !isFirebaseConfigured();
    const questionsCollection = usePreviewMode ? null : db.collection('questions');
    const leaderboardCollection = usePreviewMode ? null : db.collection('leaderboard');
    
    const allSubjects = ['藥理藥化', '生物藥劑', '藥物分析', '藥事行政法規', '藥物治療', '藥劑學', '生藥學'];
    let allQuestions = [];

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
    let latestExamId = null;

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
    
    function showPreviewWarning() {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'demo-info';
        warningDiv.style.margin = '1rem auto 0 auto';
        warningDiv.style.textAlign = 'center';
        warningDiv.style.maxWidth = '800px';
        warningDiv.innerHTML = '<p><strong>預覽模式</strong>：目前正在使用預設題目。您的成績將不會被記錄。請設定 <code>js/firebase.js</code> 以啟用完整功能。</p>';
        document.querySelector('.container > header').insertAdjacentElement('afterend', warningDiv);
    }

    async function loadAllQuestions() {
        if (usePreviewMode) {
            allQuestions = MOCK_QUESTIONS;
            showPreviewWarning();
            return;
        }
        try {
            const snapshot = await questionsCollection.get();
            allQuestions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error loading questions from Firestore:", error);
            alert("無法從資料庫載入試題，請檢查 Firebase 設定或網路連線。");
        }
    }

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
        
        allSubjects.forEach(subject => {
            const hasQuestions = allQuestions.some(q => q.year === selectedYear && q.subject === subject);
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
        currentQuestions = allQuestions.filter(q => q.year === selectedYear && q.subject === selectedSubject);
        if (currentQuestions.length === 0) {
            alert(`${selectedYear} 年 ${selectedSubject} 尚無試題。`);
            return;
        }
        answers = {};
        currentQuestions.forEach(q => { answers[q.id] = null; });
        examInProgress = true;
        timeLeft = timeLimit * 60;
        latestExamId = `exam_${Date.now()}`;
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
                const questionId = item.getAttribute('data-question');
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

    async function submitExam() {
        clearInterval(timer);
        examInProgress = false;
        let correctCount = 0;
        currentQuestions.forEach(q => { if (answers[q.id] === q.answer) correctCount++; });
        score = currentQuestions.length > 0 ? Math.round((correctCount / currentQuestions.length) * 100) : 0;
        
        if (!usePreviewMode) {
            await updateLeaderboard();
        }

        currentStep = 4;
        updateUI();
    }

    async function updateLeaderboard() {
        const userRecord = { 
            nickname, 
            score, 
            subject: selectedSubject,
            year: selectedYear, 
            date: firebase.firestore.FieldValue.serverTimestamp(),
            examId: latestExamId
        };
        
        try {
            // More robust logic that doesn't rely on composite indexes.
            // 1. Fetch all records for the subject.
            const querySnapshot = await leaderboardCollection
                .where('subject', '==', selectedSubject)
                .get();

            // 2. Find the user's existing record on the client-side.
            let existingDoc = null;
            querySnapshot.forEach(doc => {
                if (doc.data().nickname === nickname) {
                    existingDoc = doc;
                }
            });

            if (existingDoc) {
                // 3a. If a record exists, update it.
                await leaderboardCollection.doc(existingDoc.id).update(userRecord);
            } else {
                // 3b. If no record exists, create a new one.
                await leaderboardCollection.add(userRecord);
            }
        } catch (error) {
            console.error("Error updating leaderboard:", error);
            // This is a non-critical error for the user's flow.
            // They will still see their score, but we log the issue.
        }
    }

    async function renderResultStep() {
        resultStep.innerHTML = `<div class="loading-spinner">正在計算您的成績與排名...</div>`;
        
        if (usePreviewMode) {
            renderResultStepPreview();
            return;
        }

        // Add a small delay to allow Firestore's index to update after the write.
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            // Use a simpler query and sort on the client to avoid needing a composite index.
            const q = leaderboardCollection.where('subject', '==', selectedSubject);
            const snapshot = await q.get();
            let subjectLeaderboard = snapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
            
            // Client-side sorting
            subjectLeaderboard.sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score;
                }
                const dateA = a.date ? a.date.toMillis() : 0;
                const dateB = b.date ? b.date.toMillis() : 0;
                return dateB - dateA;
            });
            
            const userRankData = subjectLeaderboard.find(item => item.examId === latestExamId);
            const userRank = userRankData ? subjectLeaderboard.indexOf(userRankData) + 1 : "N/A";
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
                        <div class="rank-item ${item.examId === latestExamId ? 'current-user' : ''}">
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
        } catch (error) {
             console.error("Error rendering results:", error);
             resultStep.innerHTML = `<div class="glass-card fade-in" style="padding: 2rem;"><p class="no-data">無法載入排名資料，但您的分數是 ${score} 分。</p></div>`
        }
    }

    function renderResultStepPreview() {
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
                    <p>預覽模式下不計算排名</p>
                </div>
                
                 <div class="button-group" style="margin-top: 2rem;">
                    <a href="index.html" class="btn btn-secondary">返回首頁</a>
                    <a href="exam.html" class="btn btn-primary">再測一次</a>
                </div>
            </div>
        `;
        resultStep.innerHTML = html;
    }

    // Initialize the page
    async function initialize() {
        await loadAllQuestions();
        updateUI();
    }
    
    initialize();
});