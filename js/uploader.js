document.addEventListener('DOMContentLoaded', () => {
    const uploaderContainer = document.getElementById('uploader-container');
    let generatedQuestions = []; // To hold the parsed questions

    // Super-gatekeeper: Check for initialization errors first.
    if (window.firebaseInitializationError) {
        uploaderContainer.innerHTML = `
            <div class="login-container fade-in" style="max-width: 650px;">
                 <div class="login-header">
                    <svg class="login-icon" style="color: var(--danger-color);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h2 style="background: var(--danger-color); -webkit-background-clip: text;">Firebase 設定錯誤</h2>
                    <p>您的 Firebase 設定檔 (<code>js/firebase.js</code>) 存在格式錯誤，導致上傳工具無法啟動。請檢查您的設定是否從 Firebase 控制台完整複製。</p>
                </div>
                <div class="demo-info" style="text-align: left; background-color: rgba(239, 68, 68, 0.1); color: #c05621;">
                    <p><strong>錯誤詳情：</strong></p>
                    <pre style="white-space: pre-wrap; word-wrap: break-word;">${window.firebaseInitializationError.message}</pre>
                </div>
                 <div style="margin-top: 2rem; text-align: center;">
                    <a href="index.html" class="link">返回首頁</a>
                </div>
            </div>`;
        return;
    }

    if (!isFirebaseConfigured()) {
        uploaderContainer.innerHTML = `
            <div class="login-container fade-in" style="max-width: 600px;">
                <div class="login-header">
                    <svg class="login-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <h2>設定未完成</h2>
                    <p>您必須先設定 Firebase 才能使用此功能。</p>
                </div>
                <div class="demo-info" style="text-align: left; background-color: rgba(99, 102, 241, 0.05); color: #4f46e5;">
                    <p><strong>請依照以下步驟完成設定：</strong></p>
                    <ol style="padding-left: 20px; margin: 0.5rem 0 1rem 0;">
                        <li>開啟 <code>js/firebase.js</code> 檔案。</li>
                        <li>將您從 Firebase 控制台取得的設定物件貼入 <code>firebaseConfig</code>。</li>
                        <li>在 Firebase > Authentication 服務中，啟用「電子郵件/密碼」登入。</li>
                        <li>手動新增一個管理員帳號 (例如: admin@example.com)。</li>
                    </ol>
                </div>
                <div class="demo-info" style="text-align: left; background-color: rgba(245, 158, 11, 0.1); color: #b45309; margin-top: 1rem;">
                    <p><strong>設定後仍看到此畫面？請嘗試以下疑難排解：</strong></p>
                    <ul style="padding-left: 20px; margin-top: 0.5rem;">
                        <li><strong>檢查設定值：</strong> 確認 <code>js/firebase.js</code> 中所有 "YOUR_..." 的預設值都已被替換。</li>
                        <li><strong>檢查複製內容：</strong> 確認您已完整複製 <code>firebaseConfig</code> 物件，包含開頭的 <code>{</code> 與結尾的 <code>}</code>。</li>
                        <li><strong>清除快取：</strong> 按下 <code>Ctrl+Shift+R</code> (或 Mac 的 <code>Cmd+Shift+R</code>) 強制重新整理頁面，以清除瀏覽器快取。</li>
                    </ul>
                </div>
                <div style="margin-top: 2rem; text-align: center;">
                    <a href="index.html" class="link">返回首頁</a>
                </div>
            </div>`;
        return;
    }

    const db = firebase.firestore();
    const auth = firebase.auth();

    auth.onAuthStateChanged(user => {
        if (user) {
            renderUploaderTool(user);
        } else {
            renderLoginForm();
        }
    });

    function renderLoginForm() {
        uploaderContainer.innerHTML = `
            <div class="login-container fade-in">
                <div class="login-header">
                     <svg class="login-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    <h2>工具需要授權</h2>
                    <p>請登入以使用批次上傳工具</p>
                </div>
                <div id="login-error" style="color: var(--danger-color); margin-bottom: 1rem; text-align: center; display: none;"></div>
                <div class="form-group">
                    <label for="email">信箱</label>
                    <input type="text" id="email" placeholder="請輸入註冊的信箱">
                </div>
                <div class="form-group">
                    <label for="password">密碼</label>
                    <input type="password" id="password" placeholder="請輸入密碼">
                </div>
                <button id="login-btn" class="btn btn-primary">登入</button>
                <div style="margin-top: 2rem; text-align: center;">
                    <a href="index.html" class="link">返回首頁</a>
                </div>
            </div>
        `;
        attachLoginListeners();
    }

    function renderUploaderTool(user) {
        uploaderContainer.innerHTML = `
            <header class="admin-header">
                <h2>試題批次上傳工具</h2>
                 <div>
                    <span style="color: var(--secondary-color); margin-right: 1rem;">${user.email}</span>
                    <button id="logout-btn" class="btn btn-secondary">登出</button>
                </div>
            </header>
            
            <div class="instructions-box">
                <h4>格式說明</h4>
                <p>請將題目以純文字格式貼入左方輸入框。每題之間以 <code>---</code> 分隔。<code>ANS</code> 的值必須是 <code>A, B, C, D</code> 其中之一。</p>
                <pre><code>YEAR: 2024
SUBJECT: 藥理藥化
---
Q: 下列何者為鴉片類止痛劑？
A: Aspirin
B: Ibuprofen
C: Morphine
D: Acetaminophen
ANS: C
---
Q: Penicillin 的主要作用機制為何？
A: 抑制蛋白質合成
B: 抑制細胞壁合成
C: 抑制DNA複製
D: 抑制葉酸代謝
ANS: B</code></pre>
            </div>

            <div id="status-message" class="status-message" style="display:none;"></div>

            <div class="uploader-grid">
                <div class="form-group full-width">
                    <label for="questions-input">題目文字輸入</label>
                    <textarea id="questions-input" rows="20" placeholder="請在此處貼上題目..."></textarea>
                </div>
                <div class="form-group full-width">
                    <label>JSON 預覽</label>
                    <pre id="json-preview"><code>請先點擊「轉換為 JSON」以產生預覽。</code></pre>
                </div>
            </div>
            
            <div class="form-actions">
                <button id="convert-btn" class="btn btn-secondary">轉換為 JSON</button>
                <button id="upload-btn" class="btn btn-primary" disabled>上傳至 Firebase</button>
            </div>
        `;
        attachUploaderListeners();
    }

    function attachLoginListeners() {
        const loginBtn = document.getElementById('login-btn');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const errorDiv = document.getElementById('login-error');

        loginBtn.addEventListener('click', () => {
            const email = emailInput.value;
            const password = passwordInput.value;
            errorDiv.style.display = 'none';

            auth.signInWithEmailAndPassword(email, password)
                .catch(error => {
                    console.error("Login failed:", error);
                    errorDiv.textContent = `登入失敗: ${error.message}`;
                    errorDiv.style.display = 'block';
                });
        });
    }
    
    function attachUploaderListeners() {
        document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());
        document.getElementById('convert-btn').addEventListener('click', handleConvert);
        document.getElementById('upload-btn').addEventListener('click', handleUpload);
    }
    
    function handleConvert() {
        const input = document.getElementById('questions-input').value.trim();
        const jsonPreview = document.getElementById('json-preview');
        const uploadBtn = document.getElementById('upload-btn');
        
        generatedQuestions = [];
        uploadBtn.disabled = true;

        if (!input) {
            jsonPreview.innerHTML = '<code>輸入框為空。</code>';
            return;
        }

        try {
            const lines = input.split('\n');
            const yearLine = lines.find(line => line.toUpperCase().startsWith('YEAR:'));
            const subjectLine = lines.find(line => line.toUpperCase().startsWith('SUBJECT:'));

            if (!yearLine || !subjectLine) {
                 throw new Error('缺少 YEAR 或 SUBJECT 定義。');
            }

            const year = yearLine.split(':')[1].trim();
            const subject = subjectLine.split(':')[1].trim();
            
            const questionBlocks = input.split('---').slice(1);
            
            generatedQuestions = questionBlocks.map((block, index) => {
                const questionData = {
                    content: '',
                    options: [],
                    answer: -1,
                    year: year,
                    subject: subject
                };

                const blockLines = block.trim().split('\n');
                const answerMapping = {'A': 0, 'B': 1, 'C': 2, 'D': 3};

                blockLines.forEach(line => {
                    const upperLine = line.toUpperCase();
                    if (upperLine.startsWith('Q:')) {
                        questionData.content = line.substring(2).trim();
                    } else if (upperLine.startsWith('A:')) {
                        questionData.options[0] = line.substring(2).trim();
                    } else if (upperLine.startsWith('B:')) {
                        questionData.options[1] = line.substring(2).trim();
                    } else if (upperLine.startsWith('C:')) {
                        questionData.options[2] = line.substring(2).trim();
                    } else if (upperLine.startsWith('D:')) {
                        questionData.options[3] = line.substring(2).trim();
                    } else if (upperLine.startsWith('ANS:')) {
                        const ans = line.substring(4).trim().toUpperCase();
                        if (answerMapping[ans] === undefined) {
                            throw new Error(`第 ${index + 1} 題的答案 '${ans}' 格式不正確。`);
                        }
                        questionData.answer = answerMapping[ans];
                    }
                });

                if (!questionData.content || questionData.options.length !== 4 || questionData.answer === -1) {
                    throw new Error(`第 ${index + 1} 題的格式不完整，請檢查 Q, A, B, C, D, ANS 是否都存在。`);
                }
                
                return questionData;
            });

            jsonPreview.innerHTML = `<code>${JSON.stringify(generatedQuestions, null, 2)}</code>`;
            uploadBtn.disabled = false;
            showStatus(`成功解析 ${generatedQuestions.length} 題，可以上傳。`, 'success');
        } catch (error) {
            jsonPreview.innerHTML = `<code style="color: var(--danger-color);">${error.message}</code>`;
            showStatus(error.message, 'error');
        }
    }

    async function handleUpload() {
        if (generatedQuestions.length === 0) {
            alert('沒有可上傳的題目。');
            return;
        }

        if (!confirm(`確定要上傳 ${generatedQuestions.length} 筆新題目到 "${generatedQuestions[0].subject}" 科目嗎？`)) {
            return;
        }

        const uploadBtn = document.getElementById('upload-btn');
        uploadBtn.disabled = true;
        uploadBtn.textContent = '上傳中...';

        try {
            const batch = db.batch();
            const questionsRef = db.collection('questions');

            generatedQuestions.forEach(question => {
                const docRef = questionsRef.doc(); // Create a new doc with a random ID
                batch.set(docRef, question);
            });

            await batch.commit();
            showStatus(`成功上傳 ${generatedQuestions.length} 筆題目！`, 'success');
            document.getElementById('questions-input').value = '';
            generatedQuestions = [];

        } catch (error) {
            console.error("Error uploading questions: ", error);
            showStatus(`上傳失敗: ${error.message}`, 'error');
        } finally {
            uploadBtn.textContent = '上傳至 Firebase';
            // Keep it disabled until a new conversion happens
        }
    }

    function showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('status-message');
        statusDiv.textContent = message;
        statusDiv.className = `status-message ${type}`;
        statusDiv.style.display = 'block';
    }
});