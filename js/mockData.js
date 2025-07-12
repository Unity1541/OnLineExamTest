// js/mockData.js

const MOCK_QUESTIONS = [
    { id: 'mock1', year: '2024', subject: '數學', content: '1 + 1 = ?', options: ['1', '2', '3', '4'], answer: 1 },
    { id: 'mock2', year: '2024', subject: '數學', content: '2 * 3 = ?', options: ['4', '5', '6', '7'], answer: 2 },
    { id: 'mock3', year: '2024', subject: '數學', content: '10 / 2 = ?', options: ['3', '4', '5', '6'], answer: 2 },
    { id: 'mock4', year: '2024', subject: '英文', content: 'Which of the following is a fruit?', options: ['Carrot', 'Potato', 'Apple', 'Broccoli'], answer: 2 },
    { id: 'mock5', year: '2024', subject: '英文', content: 'What is the past tense of "go"?', options: ['Goed', 'Gone', 'Went', 'Going'], answer: 2 },
    { id: 'mock6', year: '2023', subject: '國文', content: '「床前明月光」的下一句是？', options: ['疑是地上霜', '舉頭望明月', '低頭思故鄉', '春眠不覺曉'], answer: 0 },
    { id: 'mock7', year: '2023', subject: '國文', content: '「誰知盤中飧」的下一句是？', options: ['粒粒皆辛苦', '春種一粒粟', '汗滴禾下土', '低頭思故鄉'], answer: 0 },
];

const MOCK_LEADERBOARD = {
    '數學': [
        { nickname: '愛因斯坦', score: 100 },
        { nickname: '牛頓', score: 95 },
        { nickname: '高斯', score: 90 },
        { nickname: '歐拉', score: 88 },
        { nickname: '費馬', score: 85 },
    ],
    '英文': [
        { nickname: '莎士比亞', score: 98 },
        { nickname: '珍·奧斯汀', score: 92 },
    ],
    '國文': [
         { nickname: '李白', score: 100 },
         { nickname: '杜甫', score: 92 },
         { nickname: '蘇軾', score: 90 },
    ],
    '物理': [],
    '化學': [],
    '生物': [],
};
