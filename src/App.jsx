import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, Check, X, RefreshCw, Award, BookOpen, Plus, Search, ChevronLeft, MoreHorizontal, Play, Book, Home, Shuffle, Trash2 } from 'lucide-react';

// --- 1. 本地词典数据 (模拟一个内置的大词库) ---
// 您可以随时扩充这个列表，或者从 JSON 文件导入
import fullDictionary from './dictionary_full';
const LOCAL_DICTIONARY = fullDictionary;

/*const LOCAL_DICTIONARY = [
  { word: "ambitious", ipa: "/æm'bɪʃəs/", meaning: "有野心的；费力的" },
  { word: "candidate", ipa: "/'kændɪdət/", meaning: "候选人；应试者" },
  { word: "prospect", ipa: "/'prɒspekt/", meaning: "前景；预期；可能性" },
  { word: "generic", ipa: "/dʒə'nerɪk/", meaning: "通用的；一般的" },
  { word: "incentive", ipa: "/ɪn'sentɪv/", meaning: "刺激；鼓励；动机" },
  { word: "ambiguous", ipa: "/æm'bɪɡjuəs/", meaning: "模棱两可的；含糊的" },
  { word: "valid", ipa: "/'vælɪd/", meaning: "有效的；有根据的" },
  { word: "concept", ipa: "/'kɒnsept/", meaning: "概念；观念" },
  { word: "indicate", ipa: "/'ɪndɪkeɪt/", meaning: "表明；指出；预示" },
  { word: "significant", ipa: "/sɪg'nɪfɪkənt/", meaning: "重要的；显著的" },
  { word: "factor", ipa: "/'fæktə(r)//", meaning: "因素；要素" },
  { word: "approach", ipa: "/ə'prəʊtʃ/", meaning: "方法；接近；途径" },
  { word: "access", ipa: "/'ækses/", meaning: "进入；使用权；通路" },
  { word: "benefit", ipa: "/'benɪfɪt/", meaning: "利益；好处；津贴" },
  { word: "challenge", ipa: "/'tʃælɪndʒ/", meaning: "挑战；质疑" },
  { word: "characteristic", ipa: "/ˌkærəktə'rɪstɪk/", meaning: "特征；特性" },
  { word: "component", ipa: "/kəm'pəʊnənt/", meaning: "成分；组件；零件" },
  { word: "concentration", ipa: "/ˌkɒnsn'treɪʃn/", meaning: "集中；浓度；浓缩" },
  { word: "consequence", ipa: "/'kɒnsɪkwəns/", meaning: "结果；后果；重要性" },
  { word: "consistent", ipa: "/kən'sɪstənt/", meaning: "一致的；连续的" },
  { word: "constant", ipa: "/'kɒnstənt/", meaning: "不变的；恒定的" },
  { word: "context", ipa: "/'kɒntekst/", meaning: "语境；上下文；背景" },
  { word: "contribute", ipa: "/kən'trɪbjuːt/", meaning: "贡献；捐助；投稿" },
  { word: "definition", ipa: "/ˌdefɪ'nɪʃn/", meaning: "定义；清晰度" },
  { word: "demonstrate", ipa: "/'demənstreɪt/", meaning: "证明；展示；示威" },
  { word: "derive", ipa: "/dɪ'raɪv/", meaning: "源于；获得；起源" },
  { word: "distribution", ipa: "/ˌdɪstrɪ'bjuːʃn/", meaning: "分布；分配；发送" },
  { word: "economic", ipa: "/ˌiːkə'nɒmɪk/", meaning: "经济的；有利可图的" },
  { word: "environment", ipa: "/ɪn'vaɪrənmənt/", meaning: "环境；周围状况" },
  { word: "establish", ipa: "/ɪ'stæblɪʃ/", meaning: "建立；创办；确立" },
  { word: "estimate", ipa: "/'estɪmeɪt/", meaning: "估计；估价；判断" },
  { word: "evidence", ipa: "/'evɪdəns/", meaning: "证据；证明；迹象" },
  { word: "export", ipa: "/'ekspɔːt/", meaning: "出口；输出" },
  { word: "financial", ipa: "/faɪ'nænʃl/", meaning: "财政的；金融的" },
  { word: "formula", ipa: "/'fɔːmjələ/", meaning: "公式；配方；方案" },
  { word: "function", ipa: "/'fʌŋkʃn/", meaning: "功能；函数；职责" },
  { word: "identify", ipa: "/aɪ'dentɪfaɪ/", meaning: "鉴定；识别；认出" },
  { word: "income", ipa: "/'ɪnkʌm/", meaning: "收入；所得；收益" },
  { word: "individual", ipa: "/ˌɪndɪ'vɪdʒuəl/", meaning: "个人的；独特的" },
  { word: "interpretation", ipa: "/ɪnˌtɜːprə'teɪʃn/", meaning: "解释；翻译；演出" },
  { word: "involved", ipa: "/ɪn'vɒlvd/", meaning: "有关的；卷入的；复杂的" },
  { word: "issue", ipa: "/'ɪʃuː/", meaning: "问题；发行；流出" },
  { word: "labour", ipa: "/'leɪbə(r)/", meaning: "劳动；工作；劳工" },
  { word: "legal", ipa: "/'liːɡl/", meaning: "法律的；合法的" },
  { word: "legislation", ipa: "/ˌledʒɪs'leɪʃn/", meaning: "立法；法律" },
  { word: "major", ipa: "/'meɪdʒə(r)/", meaning: "主要的；主修的" },
  { word: "method", ipa: "/'meθəd/", meaning: "方法；条理" },
  { word: "occur", ipa: "/ə'kɜː(r)/", meaning: "发生；出现；存在" },
  { word: "percent", ipa: "/pə'sent/", meaning: "百分比；百分率" },
  { word: "period", ipa: "/'pɪəriəd/", meaning: "时期；周期；句点" },
  { word: "policy", ipa: "/'pɒləsi/", meaning: "政策；方针；保险单" },
  { word: "principle", ipa: "/'prɪnsəpl/", meaning: "原则；原理；主义" },
  { word: "procedure", ipa: "/prə'siːdʒə(r)/", meaning: "程序；手续；步骤" },
  { word: "process", ipa: "/'prəʊses/", meaning: "过程；工序；程序" },
  { word: "required", ipa: "/rɪ'kwaɪəd/", meaning: "必需的；必修的" },
  { word: "research", ipa: "/rɪ'sɜːtʃ/", meaning: "研究；调查" },
  { word: "response", ipa: "/rɪ'spɒns/", meaning: "反应；回答；响应" },
  { word: "role", ipa: "/rəʊl/", meaning: "角色；任务" },
  { word: "section", ipa: "/'sekʃn/", meaning: "部分；部门；章节" },
  { word: "sector", ipa: "/'sektə(r)/", meaning: "部门；领域；扇形" },
];*/

// --- 2. 记忆曲线配置 ---
const REVIEW_INTERVALS = [1, 2, 4, 7, 15, 30, 60];

// --- 3. 本地存储管理 ---
const STORAGE_KEY_WORDS = 'vocab_app_words_local';
const STORAGE_KEY_PROGRESS = 'vocab_app_progress_local';

// 读取
const loadSavedWords = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_WORDS);
    return saved ? JSON.parse(saved) : {};
  } catch (e) { return {}; }
};
const loadProgress = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
    return saved ? JSON.parse(saved) : {};
  } catch (e) { return {}; }
};

// 初始默认数据（取词典前3个作为演示）
const DEFAULT_DATA = LOCAL_DICTIONARY.slice(0, 3).map((item, index) => ({
  id: `default-${index}`,
  ...item,
  options: [item.meaning, ...getDistractors(item.meaning, LOCAL_DICTIONARY, 3)]
}));

// --- 辅助函数：从词典生成干扰项 ---
function getDistractors(correctMeaning, dictionary, count) {
  // 过滤掉正确答案，剩下的是潜在干扰项
  const candidates = dictionary.filter(w => w.meaning !== correctMeaning);
  // 随机打乱
  const shuffled = [...candidates].sort(() => 0.5 - Math.random());
  // 取前 count 个的释义
  return shuffled.slice(0, count).map(w => w.meaning);
}

export default function VocabularyApp() {
  // --- Navigation & Mode ---
  const [currentView, setCurrentView] = useState('quiz'); 
  const [mode, setMode] = useState('learn'); // 'learn', 'review', 'custom'
  
  // --- Data State ---
  const [vocabList, setVocabList] = useState(DEFAULT_DATA);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allWordsMap, setAllWordsMap] = useState({});
  const [reviewQueue, setReviewQueue] = useState([]);
  
  // --- UI State ---
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);

  // --- Modals State ---
  const [showAddWordModal, setShowAddWordModal] = useState(false);
  const [newWordInput, setNewWordInput] = useState("");
  const [addWordMessage, setAddWordMessage] = useState(""); // 提示信息

  const currentWord = vocabList[currentIndex];
  const totalQuestions = vocabList.length;

  // --- Mobile Optimization ---
  useEffect(() => {
    const metaTags = [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' }
    ];
    metaTags.forEach(tagInfo => {
      let meta = document.querySelector(`meta[name="${tagInfo.name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = tagInfo.name;
        document.head.appendChild(meta);
      }
      meta.content = tagInfo.content;
    });
    document.title = "竹林背单词";
  }, []);

  // --- Init Data ---
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = useCallback(() => {
    const savedWords = loadSavedWords();
    const progress = loadProgress();
    
    // 合并默认数据和保存的数据
    const mergedWords = { ...savedWords };
    DEFAULT_DATA.forEach(w => { if (!mergedWords[w.word]) mergedWords[w.word] = w; });
    
    setAllWordsMap(mergedWords);
    setMasteredCount(Object.values(progress).filter(p => p.status === 'mastered').length);
    checkReviewDue();
  }, []);

  // --- SRS Logic (Review System) ---
  const checkReviewDue = useCallback(() => {
    const progress = loadProgress();
    const allWords = loadSavedWords(); // Note: review logic depends on persisted words
    const combinedWords = { ...allWords };
    DEFAULT_DATA.forEach(w => { if(!combinedWords[w.word]) combinedWords[w.word] = w; });

    const now = Date.now();
    const dueWords = [];

    Object.keys(progress).forEach(wordKey => {
      const p = progress[wordKey];
      if (p.status !== 'mastered' && p.nextReview <= now && combinedWords[wordKey]) {
        dueWords.push({ ...combinedWords[wordKey], ...p });
      }
    });
    
    setReviewQueue(dueWords);
    return dueWords;
  }, []);

  const updateWordProgress = (word, correct) => {
    const progress = loadProgress();
    const allWords = loadSavedWords();
    const wordKey = word.word;
    const now = Date.now();

    // Persist word if not exists
    if (!allWords[wordKey]) {
      allWords[wordKey] = word;
      localStorage.setItem(STORAGE_KEY_WORDS, JSON.stringify(allWords));
      setAllWordsMap(allWords);
    }

    let currentP = progress[wordKey] || { stage: -1, nextReview: 0, status: 'new' };

    if (correct) {
      const newStage = currentP.stage + 1;
      if (newStage >= REVIEW_INTERVALS.length) {
        currentP = { ...currentP, stage: newStage, status: 'mastered', nextReview: Infinity };
      } else {
        const daysToAdd = REVIEW_INTERVALS[newStage];
        const nextReviewDate = now + (daysToAdd * 24 * 60 * 60 * 1000);
        currentP = { ...currentP, stage: newStage, status: 'reviewing', nextReview: nextReviewDate };
      }
    } else {
      const newStage = 0;
      const daysToAdd = REVIEW_INTERVALS[0];
      const nextReviewDate = now + (daysToAdd * 24 * 60 * 60 * 1000);
      currentP = { ...currentP, stage: newStage, status: 'reviewing', nextReview: nextReviewDate };
    }

    progress[wordKey] = currentP;
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
    setMasteredCount(Object.values(progress).filter(p => p.status === 'mastered').length);
  };

  // --- Actions ---

  const startDefaultLearn = () => {
    setVocabList(DEFAULT_DATA);
    setMode('learn');
    setCurrentView('quiz');
    restartQuiz();
  };

  const startReview = () => {
    const dueWords = checkReviewDue();
    if (dueWords.length > 0) {
      setVocabList(dueWords);
      setMode('review');
      setCurrentView('quiz');
      restartQuiz();
    }
  };

  const startCustomBookLearn = () => {
    const savedWordsList = Object.values(allWordsMap);
    if (savedWordsList.length === 0) { alert("生词本是空的，快去添加单词吧！"); return; }
    const shuffled = [...savedWordsList].sort(() => 0.5 - Math.random());
    setVocabList(shuffled.slice(0, 20));
    setMode('custom');
    setCurrentView('quiz');
    restartQuiz();
  };

  // Generate a random quiz from the LOCAL DICTIONARY (replacing AI)
  const generateRandomQuiz = () => {
    // 随机选5个不在 allWordsMap 中的词（如果是纯随机则不判断）
    // 这里简单实现：从 LOCAL_DICTIONARY 随机选5个
    const shuffled = [...LOCAL_DICTIONARY].sort(() => 0.5 - Math.random()).slice(0, 5);
    
    // 为这些词生成选项
    const newQuizData = shuffled.map((item, idx) => ({
      id: `random-${Date.now()}-${idx}`,
      ...item,
      options: [item.meaning, ...getDistractors(item.meaning, LOCAL_DICTIONARY, 3)]
    }));

    setVocabList(newQuizData);
    setMode('learn');
    setCurrentView('quiz');
    restartQuiz();
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsCorrect(null);
  };

  // --- Interaction ---
  useEffect(() => {
    if (currentView === 'quiz' && currentWord) {
      // Shuffle options for display
      const options = [...currentWord.options];
      // 简单的乱序算法
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      setShuffledOptions(options);

      if (autoPlay) {
        const timer = setTimeout(() => playAudio(currentWord.word), 600);
        return () => clearTimeout(timer);
      }
    }
  }, [currentIndex, currentWord, autoPlay, currentView]);

  const handleOptionClick = (option) => {
    if (selectedOption !== null) return;
    setSelectedOption(option);
    const correct = option === currentWord.meaning;
    setIsCorrect(correct);
    if (correct) setScore(score + 1);
    
    updateWordProgress(currentWord, correct);

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
        checkReviewDue(); // re-check review queue after finishing
      }
    }, 1500);
  };

  const playAudio = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // --- Local Add Word Logic (The Core Change) ---
  const handleLocalAddWord = () => {
    const input = newWordInput.trim().toLowerCase();
    if (!input) return;

    // 1. 查找词典
    const found = LOCAL_DICTIONARY.find(w => w.word.toLowerCase() === input);

    if (found) {
      // 2. 找到了：生成干扰项
      const distractors = getDistractors(found.meaning, LOCAL_DICTIONARY, 3);
      const newWordObj = {
        id: `custom-${Date.now()}`,
        ...found,
        options: [found.meaning, ...distractors]
      };

      // 3. 保存
      const allWords = loadSavedWords();
      // 检查是否已经存在
      if (allWords[newWordObj.word]) {
        setAddWordMessage("这个词已经在生词本里啦！");
        setTimeout(() => setAddWordMessage(""), 2000);
        return;
      }

      allWords[newWordObj.word] = newWordObj;
      localStorage.setItem(STORAGE_KEY_WORDS, JSON.stringify(allWords));
      setAllWordsMap(prev => ({ ...prev, [newWordObj.word]: newWordObj }));
      
      setNewWordInput("");
      setAddWordMessage("添加成功！");
      setTimeout(() => {
        setAddWordMessage("");
        setShowAddWordModal(false);
      }, 1000);
    } else {
      // 4. 没找到
      setAddWordMessage("本地词典里没找到这个词 (T_T)");
      setTimeout(() => setAddWordMessage(""), 3000);
    }
  };

  // --- Views ---

  const BookListView = () => {
    const totalWords = Object.keys(allWordsMap).length;
    return (
      <div className="w-full max-w-md mx-auto pt-4 px-4 animate-in fade-in slide-in-from-right-4">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
                <button onClick={() => setCurrentView('quiz')}><ChevronLeft className="text-gray-600" /></button>
                <h1 className="text-2xl font-bold text-gray-800">生词本</h1>
            </div>
            <div className="p-2 bg-gray-100 rounded-full text-gray-600"><MoreHorizontal className="w-5 h-5" /></div>
        </div>
        <div onClick={() => setCurrentView('book-detail')} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100 to-transparent rounded-bl-full opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-orange-50 to-transparent rounded-tr-full opacity-50"></div>
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <div className="w-12 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-md mb-4 flex flex-col items-center justify-center text-white text-xs">
                         <span className="font-bold text-lg opacity-90">词</span>
                         <div className="w-6 h-0.5 bg-white/30 rounded-full mt-1"></div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">我的单词</h3>
                    <p className="text-gray-400 text-sm">共 {totalWords} 词</p>
                </div>
                <button className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-sm group-hover:bg-orange-600 transition">学习中</button>
            </div>
        </div>
        <button onClick={() => setShowAddWordModal(true)} className="mt-12 w-full bg-[#00d2a0] hover:bg-[#00c290] text-white py-4 rounded-full font-bold text-lg shadow-lg shadow-green-200 flex items-center justify-center gap-2 transition-all active:scale-95">
            <Plus className="w-6 h-6" /> 添加新词
        </button>
      </div>
    );
  };

  const BookDetailView = () => {
    const words = Object.values(allWordsMap);
    
    // 删除单个单词的功能
    const deleteWord = (key) => {
        if(confirm(`确定删除 "${key}" 吗？`)) {
            const newMap = { ...allWordsMap };
            delete newMap[key];
            setAllWordsMap(newMap);
            localStorage.setItem(STORAGE_KEY_WORDS, JSON.stringify(newMap));
            
            // 也要删掉进度
            const prog = loadProgress();
            if(prog[key]) {
                delete prog[key];
                localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(prog));
            }
        }
    };

    return (
      <div className="w-full max-w-md mx-auto h-[calc(100vh-80px)] flex flex-col bg-white animate-in fade-in slide-in-from-right-4">
         <div className="px-4 py-4 flex items-center justify-between border-b border-gray-50">
            <button onClick={() => setCurrentView('books')}><ChevronLeft className="text-gray-600 w-6 h-6" /></button>
            <h2 className="font-bold text-lg text-gray-800">所有单词</h2>
            <div className="w-6"></div>
         </div>
         <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
            {words.length === 0 ? (
                <div className="text-center text-gray-400 mt-20">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen className="w-8 h-8 text-gray-300" /></div>
                    <p>空空如也</p>
                    <button onClick={() => setShowAddWordModal(true)} className="text-[#00d2a0] font-medium mt-2">添加一个</button>
                </div>
            ) : (
                words.map((word, idx) => (
                    <div key={idx} className="border-b border-dashed border-gray-100 pb-4 last:border-0 group relative">
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-xl font-bold text-gray-800">{word.word}</h3>
                                <span className="text-gray-400 font-serif text-sm">{word.ipa}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => playAudio(word.word)} className="text-[#00d2a0] p-1 hover:bg-green-50 rounded-full"><Volume2 className="w-5 h-5" /></button>
                                <button onClick={() => deleteWord(word.word)} className="text-gray-300 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm">{word.meaning}</p>
                    </div>
                ))
            )}
         </div>
         <div className="fixed bottom-20 left-0 right-0 px-4 flex justify-center pointer-events-none">
             <button onClick={() => setShowAddWordModal(true)} className="bg-white text-gray-400 shadow-lg border border-gray-100 w-12 h-12 rounded-full flex items-center justify-center pointer-events-auto hover:text-[#00d2a0] transition active:scale-95 mb-4">
                <Plus className="w-6 h-6" />
             </button>
         </div>
         <div className="border-t border-gray-100 p-3 flex items-center justify-between bg-white fixed bottom-[60px] w-full max-w-md">
             <button onClick={startCustomBookLearn} className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#00d2a0] transition px-4">
                <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-[#00d2a0]"><Play className="w-4 h-4 fill-current" /></div>
                <span className="text-[10px]">开始学习</span>
             </button>
         </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center font-sans relative overflow-hidden text-gray-800">
      {/* Background for Quiz Mode */}
      {currentView === 'quiz' && (
          <div className="absolute inset-0 pointer-events-none z-0">
             <div className="absolute top-0 left-0 w-full h-full bg-[#e8f5e9]"></div>
             {/* Bamboo-like decoration */}
             <div className="absolute top-[-50px] left-[-50px] opacity-20">
                <svg width="300" height="300" viewBox="0 0 200 200">
                <path d="M50 150 Q 30 50 100 20 T 150 100" fill="none" stroke="#2e7d32" strokeWidth="2" />
                <path d="M100 20 Q 80 50 60 40 L 100 20" fill="#4caf50" />
                <path d="M120 40 Q 100 70 80 60 L 120 40" fill="#66bb6a" />
                <path d="M60 100 Q 90 120 110 100 L 60 100" fill="#81c784" />
                </svg>
             </div>
          </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-md h-screen flex flex-col relative z-10 bg-white/50 backdrop-blur-sm shadow-2xl sm:rounded-3xl sm:h-[800px] sm:my-8 sm:overflow-hidden">
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto relative no-scrollbar">
            {currentView === 'quiz' && (
                showResult ? (
                     // Result Screen
                     <div className="h-full flex items-center justify-center p-6">
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 w-full text-center border border-white/50">
                          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><Award className="w-10 h-10 text-green-600" /></div>
                          <h2 className="text-2xl font-bold text-gray-800 mb-2">{mode === 'review' ? '复习完成' : '学习完成'}</h2>
                          <div className="text-5xl font-bold text-green-600 mb-6">{score} / {vocabList.length}</div>
                          <div className="flex gap-2">
                              <button onClick={startDefaultLearn} className="flex-1 bg-gray-100 py-3 rounded-xl text-sm font-bold text-gray-600">回首页</button>
                              <button onClick={restartQuiz} className="flex-1 bg-green-500 text-white py-3 rounded-xl text-sm font-bold shadow-lg">再来一组</button>
                          </div>
                        </div>
                     </div>
                ) : (
                    // Quiz Screen
                    <div className="h-full p-6 flex flex-col">
                        <div className="mb-4 flex justify-between items-center">
                             <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded ${mode === 'review' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{mode === 'review' ? '复习' : '学习'}</span>
                                <span className="text-xs font-medium text-gray-400">{currentIndex + 1}/{totalQuestions}</span>
                             </div>
                             <div className="flex items-center gap-3">
                                {/* Auto Play Toggle */}
                                <label className="flex items-center gap-2 cursor-pointer select-none group">
                                    <span className={`text-[10px] font-medium transition-colors ${autoPlay ? 'text-green-600' : 'text-gray-400'}`}>自动发音</span>
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={autoPlay} onChange={(e) => setAutoPlay(e.target.checked)} />
                                        <div className={`w-8 h-4 rounded-full shadow-inner transition-colors duration-300 ${autoPlay ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                                        <div className={`absolute left-0 top-[-2px] w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${autoPlay ? 'translate-x-4 bg-green-50' : 'translate-x-0'}`}></div>
                                    </div>
                                </label>
                                {/* Random New Words Button */}
                                <button onClick={generateRandomQuiz} className="text-xs bg-white/80 border border-purple-100 text-purple-600 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm"><Shuffle className="w-3 h-3" /> 随机新词</button>
                             </div>
                        </div>
                        
                        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mb-8">
                            <div className={`h-full transition-all duration-300 ${mode === 'review' ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}></div>
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-center mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <h1 className="text-4xl font-bold text-gray-800 break-words">{currentWord?.word}</h1>
                                <button onClick={() => playAudio(currentWord?.word)} className={`p-2 rounded-full ${autoPlay ? 'text-green-600 bg-green-50' : 'text-green-500'}`}><Volume2 className="w-6 h-6" /></button>
                            </div>
                            <div className="text-gray-400 text-lg font-serif italic mb-6">{currentWord?.ipa}</div>
                        </div>

                        <div className="space-y-3 pb-20">
                            {shuffledOptions.map((option, idx) => {
                                let style = "bg-white border-2 border-gray-100 text-gray-600";
                                let icon = null;
                                if (selectedOption) {
                                    if (option === currentWord.meaning) { style = "bg-green-50 border-green-500 text-green-700"; icon = <Check className="w-4 h-4 text-green-500" />; }
                                    else if (option === selectedOption) { style = "bg-red-50 border-red-400 text-red-700"; icon = <X className="w-4 h-4 text-red-400" />; }
                                    else { style = "opacity-50 bg-gray-50"; }
                                }
                                return (<button key={idx} onClick={() => handleOptionClick(option)} disabled={selectedOption !== null} className={`w-full p-4 rounded-xl text-left text-sm font-medium flex justify-between items-center ${style}`}><span>{option}</span>{icon}</button>);
                            })}
                        </div>
                    </div>
                )
            )}
            
            {currentView === 'books' && <BookListView />}
            {currentView === 'book-detail' && <BookDetailView />}
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white border-t border-gray-100 h-[60px] flex items-center justify-around px-6 relative z-20">
            <button onClick={() => { setCurrentView('quiz'); setMode('learn'); }} className={`flex flex-col items-center gap-1 ${currentView === 'quiz' ? 'text-green-600' : 'text-gray-400'}`}><Home className="w-6 h-6" /><span className="text-[10px] font-medium">练习</span></button>
            <button onClick={() => setShowAddWordModal(true)} className="bg-[#00d2a0] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-green-200 -mt-6 border-4 border-[#f8f9fa] active:scale-95 transition"><Plus className="w-6 h-6" /></button>
            <button onClick={() => setCurrentView('books')} className={`flex flex-col items-center gap-1 ${currentView.startsWith('book') ? 'text-green-600' : 'text-gray-400'}`}><Book className="w-6 h-6" /><span className="text-[10px] font-medium">生词本</span></button>
        </div>
      </div>

      {/* Add Word Modal (Local) */}
      {showAddWordModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-xl text-gray-800">添加生词</h3><button onClick={() => setShowAddWordModal(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
              <div className="relative mb-2">
                  <input className="w-full border-2 border-green-100 focus:border-green-500 rounded-xl p-4 bg-white text-lg outline-none transition-colors pl-10" value={newWordInput} onChange={e=>setNewWordInput(e.target.value)} placeholder="输入单词 (如: access)..." autoFocus />
                  <Search className="w-5 h-5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              
              {/* Message Display */}
              <div className="h-6 mb-4 text-xs text-center">
                {addWordMessage ? <span className="text-orange-500 font-medium">{addWordMessage}</span> : <span className="text-gray-400">将从本地词典中查找并生成练习</span>}
              </div>

              <button onClick={handleLocalAddWord} className="w-full bg-[#00d2a0] hover:bg-[#00c290] text-white py-4 rounded-xl font-bold shadow-md flex justify-center items-center gap-2 transition-all">
                  确认添加
              </button>
           </div>
        </div>
      )}
    </div>
  );
}