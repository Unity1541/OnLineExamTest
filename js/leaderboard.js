// 排行榜標籤切換
document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有標籤的active類
            tabBtns.forEach(b => b.classList.remove('active'));
            // 為當前標籤添加active類
            this.classList.add('active');
            
            // 隱藏所有內容
            tabContents.forEach(content => content.classList.remove('active'));
            // 顯示對應內容
            const subject = this.getAttribute('data-subject');
            document.getElementById(`${subject}-leaderboard`).classList.add('active');
        });
    });
    
    // 從本地存儲加載排行榜數據
    loadLeaderboardData();
});

// 加載排行榜數據
function loadLeaderboardData() {
    // 獲取排行榜數據
    const leaderboardData = JSON.parse(localStorage.getItem('examLeaderboard')) || {
        '數學': [],
        '英文': [],
        '國文': [],
        '物理': [],
        '化學': [],
        '生物': []
    };
    
    // 科目映射
    const subjectMapping = {
        '數學': 'math',
        '英文': 'english',
        '國文': 'chinese',
        '物理': 'physics',
        '化學': 'chemistry',
        '生物': 'biology'
    };
    
    // 更新每個科目的排行榜
    for (const subject in leaderboardData) {
        if (leaderboardData.hasOwnProperty(subject) && subjectMapping[subject]) {
            const subjectId = subjectMapping[subject];
            const leaderboardContainer = document.getElementById(`${subjectId}-leaderboard`);
            
            if (leaderboardContainer) {
                // 排序數據
                const sortedData = [...leaderboardData[subject]].sort((a, b) => b.score - a.score);
                // 只取前5名
                const top5 = sortedData.slice(0, 5);
                
                if (top5.length === 0) {
                    leaderboardContainer.innerHTML = `
                        <div class="empty-leaderboard">
                            <p>暫無排名數據</p>
                            <a href="exam.html" class="btn btn-primary">參加考試</a>
                        </div>
                    `;
                    continue;
                }
                
                let html = '<div class="leaderboard-cards">';
                
                top5.forEach((item, index) => {
                    const rankClass = index < 3 ? `top-${index + 1}` : '';
                    const medalOrRank = index < 3 ? 
                        `<div class="medal">${index + 1}</div>` : 
                        `<div class="rank">${index + 1}</div>`;
                    
                    html += `
                        <div class="leaderboard-card ${rankClass}">
                            ${medalOrRank}
                            <div class="user-avatar">${item.nickname.charAt(0)}</div>
                            <div class="user-name">${item.nickname}</div>
                            <div class="score">${item.score}</div>
                        </div>
                    `;
                });
                
                html += '</div>';
                leaderboardContainer.innerHTML = html;
            }
        }
    }
}
