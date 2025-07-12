document.addEventListener('DOMContentLoaded', () => {
    const adminContainer = document.getElementById('admin-container');

    const mockQuestions = [
        { id: 'q1', subject: '數學', year: '2025', content: '若 2x + 3y = 12 且 x - y = 1，求 x 與 y 的值。', options: ['x=3, y=2', 'x=4, y=0', 'x=3, y=0', 'x=5, y=-1'], answer: 0 },
        { id: 'q2', subject: '英文', year: '2025', content: 'Choose the correct sentence:', options: ['She don\'t like apples.', 'She doesn\'t likes apples.', 'She doesn\'t like apples.', 'She not like apples.'], answer: 2 },
        { id: 'q3', subject: '數學', year: '2024', content: '一個等差數列的首項為3，公差為2，則第10項為多少？', options: ['21', '22', '23', '24'], answer: 0 },
        { id: 'q4', subject: '國文', year: '2025', content: '下列何者不是李白的作品？', options: ['將進酒', '早發白帝城', '琵琶行', '靜夜思'], answer: 2 },
    ];
    const availableYears = ['2025', '2024', '2023', '2022', '2021'];
    const availableSubjects = ['數學', '英文', '國文', '物理', '化學', '生物'];

    let state = {
        isLoggedIn: false,
        questions: [],
        filteredQuestions: [],
        loading: false,
        editingQuestionId: null,
        showForm: false,
        filters: {
            searchTerm: '',
            year: '',
            subject: '',
        },
        expandedQuestionId: null,
    };

    function setState(newState) {
        Object.assign(state, newState);
        render();
    }

    function render() {
        if (!state.isLoggedIn) {
            renderLoginForm();
        } else {
            renderAdminPanel();
        }
    }

    function renderLoginForm() {
        adminContainer.innerHTML = `
            <div class="login-container fade-in">
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
                    <input type="text" id="username" placeholder="請輸入帳號" value="admin">
                </div>
                <div class="form-group">
                    <label for="password">密碼</label>
                    <input type="password" id="password" placeholder="請輸入密碼" value="admin123">
                </div>
                <button id="login-btn" class="btn btn-primary">登入</button>
                <div class="demo-info">
                    <p>Demo 帳號: admin</p>
                    <p>Demo 密碼: admin123</p>
                </div>
                <div style="margin-top: 2rem; text-align: center;">
                    <a href="index.html" class="link">返回首頁</a>
                </div>
            </div>
        `;
        attachLoginListeners();
    }
    
    function renderAdminPanel() {
        const { loading, showForm, editingQuestionId, filters, expandedQuestionId } = state;
        const editingQuestion = editingQuestionId ? state.questions.find(q => q.id === editingQuestionId) : null;

        adminContainer.innerHTML = `
            <div class="admin-panel fade-in">
                <header class="admin-header">
                    <h2>試題管理</h2>
                    <button id="logout-btn" class="btn btn-secondary">登出</button>
                </header>
                
                <section class="admin-controls">
                    <button id="add-question-btn" class="btn btn-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        ${showForm && !editingQuestionId ? '取消新增' : '新增題目'}
                    </button>
                    <input type="search" id="search-input" placeholder="搜尋題目內容..." value="${filters.searchTerm}">
                    <select id="year-filter">
                        <option value="">所有年份</option>
                        ${availableYears.map(y => `<option value="${y}" ${filters.year === y ? 'selected' : ''}>${y}</option>`).join('')}
                    </select>
                    <select id="subject-filter">
                        <option value="">所有科目</option>
                        ${availableSubjects.map(s => `<option value="${s}" ${filters.subject === s ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                </section>

                <section id="question-form-container" class="glass-card" style="display: ${showForm ? 'block' : 'none'};">
                    <form id="question-form">
                        <h3>${editingQuestionId ? '編輯題目' : '新增題目'}</h3>
                        <div class="question-form-grid">
                            <div class="form-group">
                                <label for="form-year">年份</label>
                                <select id="form-year" required>
                                    ${availableYears.map(y => `<option value="${y}" ${editingQuestion?.year === y ? 'selected' : ''}>${y}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="form-subject">科目</label>
                                <select id="form-subject" required>
                                    ${availableSubjects.map(s => `<option value="${s}" ${editingQuestion?.subject === s ? 'selected' : ''}>${s}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group full-width">
                                <label for="form-content">題目內容</label>
                                <textarea id="form-content" rows="3" required>${editingQuestion?.content || ''}</textarea>
                            </div>
                            <div class="options-group">
                                ${[0,1,2,3].map(i => `
                                <div class="form-group">
                                    <label for="form-option-${i}">選項 ${i + 1}</label>
                                    <input type="text" id="form-option-${i}" value="${editingQuestion?.options[i] || ''}" required>
                                </div>`).join('')}
                            </div>
                            <div class="answer-group">
                                <label>正確答案</label>
                                <div class="answer-options">
                                    ${[0,1,2,3].map(i => `
                                    <label>
                                        <input type="radio" name="answer" value="${i}" ${editingQuestion?.answer === i ? 'checked' : ''} required>
                                        選項 ${i+1}
                                    </label>`).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="button" id="cancel-edit-btn" class="btn btn-secondary">取消</button>
                            <button type="submit" class="btn btn-primary">${editingQuestionId ? '儲存變更' : '建立題目'}</button>
                        </div>
                    </form>
                </section>

                <main id="question-list-container">
                    ${loading ? '<div class="loading-spinner">載入中...</div>' : renderQuestionList()}
                </main>
            </div>
        `;
        attachAdminListeners();
    }

    function renderQuestionList() {
        const { filteredQuestions, expandedQuestionId } = state;

        if (filteredQuestions.length === 0) {
            return '<div class="no-questions">找不到符合條件的題目，或尚未建立任何題目。</div>';
        }

        return `
            <div class="question-list">
                ${filteredQuestions.map(q => `
                <div class="question-item" id="q-item-${q.id}">
                    <div class="question-item-header">
                        <div>
                            <div class="question-item-tags">
                                <span class="tag">${q.year}</span>
                                <span class="tag">${q.subject}</span>
                            </div>
                            <p class="question-item-title">${q.content}</p>
                        </div>
                        <div class="question-item-actions">
                            <button class="action-btn expand-btn" data-id="${q.id}" title="查看選項">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                   ${expandedQuestionId === q.id ? '<polyline points="18 15 12 9 6 15"></polyline>' : '<polyline points="6 9 12 15 18 9"></polyline>'}
                                </svg>
                            </button>
                            <button class="action-btn edit-btn" data-id="${q.id}" title="編輯">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button class="action-btn delete-btn" data-id="${q.id}" title="刪除">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </div>
                    </div>
                    <div class="question-item-details ${expandedQuestionId === q.id ? 'expanded' : ''}">
                        <ol style="list-style-type: upper-alpha; padding-left: 20px;">
                            ${q.options.map((opt, i) => `
                                <li class="${q.answer === i ? 'correct' : ''}">
                                    ${opt} ${q.answer === i ? '<strong>(正確答案)</strong>' : ''}
                                </li>
                            `).join('')}
                        </ol>
                    </div>
                </div>
                `).join('')}
            </div>
        `;
    }
    
    function attachLoginListeners() {
        const loginBtn = document.getElementById('login-btn');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        const performLogin = () => {
            if (usernameInput.value === 'admin' && passwordInput.value === 'admin123') {
                document.body.classList.add('admin');
                setState({ isLoggedIn: true, loading: true });
                setTimeout(() => {
                    const questions = [...mockQuestions];
                    setState({ questions, filteredQuestions: questions, loading: false });
                }, 500);
            } else {
                alert('帳號或密碼錯誤');
            }
        };

        loginBtn.addEventListener('click', performLogin);
        usernameInput.addEventListener('keypress', (e) => e.key === 'Enter' && performLogin());
        passwordInput.addEventListener('keypress', (e) => e.key === 'Enter' && performLogin());
    }

    function attachAdminListeners() {
        document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
        document.getElementById('add-question-btn')?.addEventListener('click', toggleAddForm);
        document.getElementById('cancel-edit-btn')?.addEventListener('click', cancelEdit);
        document.getElementById('question-form')?.addEventListener('submit', handleFormSubmit);
        document.getElementById('search-input')?.addEventListener('input', handleFilterChange);
        document.getElementById('year-filter')?.addEventListener('change', handleFilterChange);
        document.getElementById('subject-filter')?.addEventListener('change', handleFilterChange);
        document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', handleEdit));
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', handleDelete));
        document.querySelectorAll('.expand-btn').forEach(btn => btn.addEventListener('click', handleExpand));
    }

    function handleLogout() {
        document.body.classList.remove('admin');
        setState({ isLoggedIn: false, questions: [], filters: { searchTerm: '', year: '', subject: '' } });
    }

    function handleFilterChange() {
        const filters = {
            searchTerm: document.getElementById('search-input').value,
            year: document.getElementById('year-filter').value,
            subject: document.getElementById('subject-filter').value,
        };
        const filteredQuestions = state.questions.filter(q => {
            const searchMatch = q.content.toLowerCase().includes(filters.searchTerm.toLowerCase());
            const yearMatch = !filters.year || q.year === filters.year;
            const subjectMatch = !filters.subject || q.subject === filters.subject;
            return searchMatch && yearMatch && subjectMatch;
        });
        setState({ filters, filteredQuestions });
    }

    function toggleAddForm() {
        setState({ showForm: !state.showForm, editingQuestionId: null });
    }

    function cancelEdit() {
        setState({ showForm: false, editingQuestionId: null });
    }

    function handleEdit(e) {
        const id = e.currentTarget.dataset.id;
        setState({ editingQuestionId: id, showForm: true, expandedQuestionId: null });
        document.getElementById('question-form-container').scrollIntoView({ behavior: 'smooth' });
    }

    function handleDelete(e) {
        const id = e.currentTarget.dataset.id;
        if (confirm('確定要刪除此題目嗎？此操作無法復原。')) {
            const questions = state.questions.filter(q => q.id !== id);
            const filteredQuestions = state.filteredQuestions.filter(q => q.id !== id);
            setState({ questions, filteredQuestions });
        }
    }
    
    function handleExpand(e) {
        const id = e.currentTarget.dataset.id;
        setState({ expandedQuestionId: state.expandedQuestionId === id ? null : id });
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const newQuestion = {
            id: state.editingQuestionId || `q${Date.now()}`,
            year: form.querySelector('#form-year').value,
            subject: form.querySelector('#form-subject').value,
            content: form.querySelector('#form-content').value,
            options: [
                form.querySelector('#form-option-0').value,
                form.querySelector('#form-option-1').value,
                form.querySelector('#form-option-2').value,
                form.querySelector('#form-option-3').value,
            ],
            answer: parseInt(form.querySelector('input[name="answer"]:checked').value, 10),
        };

        let questions;
        if (state.editingQuestionId) {
            questions = state.questions.map(q => q.id === state.editingQuestionId ? newQuestion : q);
        } else {
            questions = [...state.questions, newQuestion];
        }
        
        setState({ questions, showForm: false, editingQuestionId: null });
        handleFilterChange(); // Re-apply filters
    }

    // Initial render
    render();
});
