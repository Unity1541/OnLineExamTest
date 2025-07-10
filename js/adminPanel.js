// adminPanel.js 完整修正版
// 直接複製覆蓋即可

document.addEventListener('DOMContentLoaded', () => {
    // 獲取容器元素
    const adminContainer = document.getElementById('admin-container');

    // 模擬數據
    const mockQuestions = [
        { id: '1', subject: '數學', year: '2025', content: '若 2x + 3y = 12 且 x - y = 1，求 x 與 y 的值。', 
            options: ['x=3, y=2', 'x=4, y=0', 'x=3, y=0', 'x=5, y=-1'], answer: 0 },
        // ... 更多題目
    ];

    // 預設選項
    const availableYears = ['2025', '2024', '2023', '2022', '2021'];
    const availableSubjects = ['數學', '英文', '國文', '物理', '化學', '生物'];

    // 狀態變量
    let isLoggedIn = false;
    let questions = [];
    let filteredQuestions = [];
    let loading = true;
    let editingQuestion = null;
    let searchTerm = '';
    let yearFilter = '';
    let subjectFilter = '';
    let showAddForm = false;
    let expandedQuestion = null;

    // 初始化應用
    init();

    function init() {
        render();
    }

    // 渲染界面
    function render() {
        if (!isLoggedIn) {
            renderLoginForm();
        } else {
            renderAdminPanel();
        }
    }

    // 渲染登入表單
    function renderLoginForm() {
        adminContainer.innerHTML = `
            <div class="login-container">
                <div class="login-header">
                    <svg class="login-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <rect width="20" height="16" x="2" y="4" rx="2" stroke="currentColor" fill="none" stroke-width="2"/>
                        <path d="M10 14h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M6 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M6 12h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M6 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <h2>管理者登入</h2>
                    <p>請輸入您的帳號和密碼</p>
                </div>
                <div class="form-group">
                    <label for="username">帳號</label>
                    <input type="text" id="username" placeholder="請輸入帳號">
                </div>
                <div class="form-group">
                    <label for="password">密碼</label>
                    <input type="password" id="password" placeholder="請輸入密碼">
                </div>
                <button id="login-btn" class="btn btn-primary">登入</button>
                <div class="demo-info">
                    <p>Demo 帳號: admin</p>
                    <p>Demo 密碼: admin123</p>
                </div>
                <div class="mt-8 text-center">
                    <a href="index.html" class="link">返回首頁</a>
                </div>
            </div>
        `;

        // 添加登入按鈕事件監聽器
        document.getElementById('login-btn').addEventListener('click', handleLogin);
        // 支援 Enter 鍵登入
        document.getElementById('username').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleLogin();
        });
        document.getElementById('password').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleLogin();
        });
    }

    // 處理登入
    function handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === 'admin' && password === 'admin123') {
            isLoggedIn = true;
            document.body.classList.add('admin'); // <--- 這一行很關鍵
            loadQuestions();
        } else {
            alert('帳號或密碼錯誤');
        }
    }

    // 處理登出
    function handleLogout() {
        isLoggedIn = false;
        document.body.classList.remove('admin'); // <--- 登出時移除
        render();
    }

    // 加載題目
    function loadQuestions() {
        loading = true;
        render();
        setTimeout(() => {
            questions = [...mockQuestions];
            filteredQuestions = [...mockQuestions];
            loading = false;
            render();
        }, 800);
    }

    // 管理面板（簡化版，僅作為範例）
    function renderAdminPanel() {
        adminContainer.innerHTML = `
            <div style="text-align:center; padding:2rem 0;">
                <h2>考試系統管理後台</h2>
                <button id="logout-btn" class="btn btn-secondary" style="margin:1rem 0;">登出</button>
                <div>（這裡可放題目管理等內容）</div>
            </div>
        `;
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
    }
});
