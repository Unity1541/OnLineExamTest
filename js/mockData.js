// js/mockData.js

const MOCK_QUESTIONS = [
    { id: 'mock1', year: '2024', subject: '藥理藥化', content: '下列何者為鴉片類止痛劑？', options: ['Aspirin', 'Ibuprofen', 'Morphine', 'Acetaminophen'], answer: 2 },
    { id: 'mock2', year: '2024', subject: '藥理藥化', content: 'Penicillin 的主要作用機制為何？', options: ['抑制蛋白質合成', '抑制細胞壁合成', '抑制DNA複製', '抑制葉酸代謝'], answer: 1 },
    { id: 'mock3', year: '2024', subject: '藥劑學', content: '下列何者為影響藥物穿透血腦障壁(BBB)最主要的因素？', options: ['分子量', '水溶性', '脂溶性', '蛋白質結合率'], answer: 2 },
    { id: 'mock4', year: '2024', subject: '藥物分析', content: '高效液相層析法(HPLC)中，何者為固定相？', options: ['溶劑', '層析管柱', '偵測器', '樣品注射器'], answer: 1 },
    { id: 'mock5', year: '2023', subject: '藥事行政法規', content: '管制藥品依其成癮性、濫用性及社會危害性，共分為幾級？', options: ['二級', '三級', '四級', '五級'], answer: 2 },
    { id: 'mock6', year: '2023', subject: '生物藥劑', content: '藥物動力學中「首渡效應」(First-pass effect) 主要發生在哪個器官？', options: ['腎臟', '肺臟', '肝臟', '心臟'], answer: 2 },
];

const MOCK_LEADERBOARD = {
    '藥理藥化': [
        { nickname: '弗萊明', score: 100 },
        { nickname: '杜馬克', score: 95 },
        { nickname: '伯韋', score: 90 },
    ],
    '生物藥劑': [
        { nickname: '諾伊斯', score: 98 },
        { nickname: '惠特尼', score: 92 },
    ],
    '藥物分析': [],
    '藥事行政法規': [
         { nickname: '藥學之父', score: 100 },
    ],
    '藥物治療': [],
    '藥劑學': [
        { nickname: '蓋倫', score: 88 },
        { nickname: '阿維森納', score: 85 },
    ],
};
