import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, Check, X, RefreshCw, Award, Sparkles, BrainCircuit, Loader2, CalendarClock, BookOpen, Trophy, Plus, Search, ChevronLeft, MoreHorizontal, Play, Book, Home } from 'lucide-react';

// --- Gemini API Configuration ---
const apiKey = ""; // 系统会自动注入 API Key

// --- 记忆曲线配置 (单位: 天) ---
const REVIEW_INTERVALS = [1, 2, 4, 7, 15, 30, 60];

// 通用 API 调用函数
async function callGemini(prompt, isJson = false) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: isJson ? "application/json" : "text/plain"
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return isJson ? JSON.parse(text) : text;
  } catch (error) {
    console.error("Gemini API Request Failed", error);
    return null;
  }
}

// --- 默认数据 ---
const DEFAULT_DATA = [
  {
    id: "default-1",
    word: "prospect",
    ipa: "/'prɒspekt/",
    meaning: "预期，展望；景象；(成功、得益等的)可能性",
    options: ["具体表现，体现；代表；包括；收录", "证据的，证明的", "屈服，屈从，抵挡不住（攻击、疾病、诱惑等）", "预期，展望；景象；(成功、得益等的)可能性"]
  },
  {
    id: "default-2",
    word: "ambitious",
    ipa: "/æm'bɪʃəs/",
    meaning: "有野心的，雄心勃勃的；费力的",
    options: ["有野心的，雄心勃勃的；费力的", "模糊的，不清楚的", "有能力的，胜任的", "焦虑的，担心的"]
  },
  {
    id: "default-3",
    word: "candidate",
    ipa: "/'kændɪdət/",
    meaning: "候选人；应试者",
    options: ["候选人；应试者", "取消，撤销", "坦白的，直率的", "能够...的，有能力的"]
  }
];

// --- 本地存储管理 ---
const STORAGE_KEY_WORDS = 'vocab_app_words';
const STORAGE_KEY_PROGRESS = 'vocab_app_progress';

// 读取所有保存的单词
const loadSavedWords = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_WORDS);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
};

// 读取进度
const loadProgress = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
};

export default function VocabularyApp() {
  // --- Navigation State ---
  const [currentView, setCurrentView] = useState('quiz'); 
  const [mode, setMode] = useState('learn');
  
  // Data State
  const [vocabList, setVocabList] = useState(DEFAULT_DATA);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [allWordsMap, setAllWordsMap] = useState({});
  
  // UI State
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [autoPlay, setAutoPlay] = useState(false);
  
  // AI State
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topicInput, setTopicInput] = useState("");
  const [showAddWordModal, setShowAddWordModal] = useState(false);
  const [newWordInput, setNewWordInput] = useState("");
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [aiHelpContent, setAiHelpContent] = useState(null);
  const [isLoadingHelp, setIsLoadingHelp] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);

  const currentWord = vocabList[currentIndex];
  const totalQuestions = vocabList.length;

  // --- Mobile App Optimization (PWA Meta Injection) ---
  useEffect(() => {
    // 动态注入 meta 标签，让 Web App 在手机上更像原生 App
    const metaTags = [
      { name: 'apple-mobile-web-app-capable', content: 'yes' }, // iOS 全屏
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }, // 状态栏透明
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' } // 禁止缩放
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

    document.title = "竹林背单词"; // 设置 App 标题
  }, []);

  // --- Initialization ---
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = useCallback(() => {
    const progress = loadProgress();
    const savedWords = loadSavedWords();
    const mergedWords = { ...savedWords };
    DEFAULT_DATA.forEach(w => { if (!mergedWords[w.word]) mergedWords[w.word] = w; });
    setAllWordsMap(mergedWords);
    const mastered = Object.values(progress).filter(p => p.status === 'mastered').length;
    setMasteredCount(mastered);
    checkReviewDue();
  }, []);

  // --- SRS Logic ---
  const checkReviewDue = useCallback(() => {
    const progress = loadProgress();
    const allWords = loadSavedWords();
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
    if (!allWords[wordKey]) {
      allWords[wordKey] = { id: word.id, word: word.word, ipa: word.ipa, meaning: word.meaning, options: word.options };
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
    const mastered = Object.values(progress).filter(p => p.status === 'mastered').length;
    setMasteredCount(mastered);
  };

  // --- Quiz Flow Handlers ---
  const startReview = () => {
    const dueWords = checkReviewDue();
    if (dueWords.length > 0) {
      setVocabList(dueWords);
      setMode('review');
      setCurrentView('quiz');
      restartQuiz();
    }
  };

  const startDefaultLearn = () => {
    setVocabList(DEFAULT_DATA);
    setMode('learn');
    setCurrentView('quiz');
    restartQuiz();
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

  useEffect(() => {
    if (currentView === 'quiz' && currentWord) {
      setAiHelpContent(null);
      const options = [...currentWord.options];
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
        checkReviewDue();
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

  const restartQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsCorrect(null);
  };

  // --- AI Functions ---
  const generateNewQuiz = async () => {
    if (!topicInput.trim()) return;
    setIsGeneratingQuiz(true);
    const prompt = `生成5个关于"${topicInput}"的英文单词。返回JSON: { "words": [{ "id": "uuid", "word": "apple", "ipa": "/.../", "meaning": "苹果", "options": ["苹果", "香蕉", "梨", "桃子"] }] }。Options必须包含正确意思。`;
    const data = await callGemini(prompt, true);
    if (data && data.words) {
      const newWords = data.words.map((w, idx) => ({ ...w, id: `ai-${Date.now()}-${idx}` }));
      setVocabList(newWords);
      setMode('learn');
      setCurrentView('quiz');
      restartQuiz();
      setShowTopicModal(false);
    }
    setIsGeneratingQuiz(false);
  };

  const askAiForHelp = async () => {
    if (aiHelpContent) return;
    setIsLoadingHelp(true);
    const text = await callGemini(`单词 "${currentWord.word}" (${currentWord.meaning})。简短提供：1.【助记】中文谐音或联想。2.【例句】英文及中文。`, false);
    setAiHelpContent(text);
    setIsLoadingHelp(false);
  };

  const handleAddWord = async () => {
    if (!newWordInput.trim()) return;
    setIsAddingWord(true);
    const prompt = `
      I want to add the word "${newWordInput}" to my vocabulary app.
      Please provide the following in JSON format:
      - word: the word itself
      - ipa: IPA pronunciation
      - meaning: Concise Chinese definition (max 10 chars preferably)
      - options: An array of 4 strings. One MUST be the correct Chinese meaning, the other 3 are distractors (incorrect meanings).
      Example JSON: { "word": "example", "ipa": "/ɪgˈzɑːmpl/", "meaning": "例子；榜样", "options": ["例子；榜样", "困难；障碍", "测试；实验", "开始；起源"] }
    `;
    const data = await callGemini(prompt, true);
    if (data && data.word) {
       const newWordObj = { id: `custom-${Date.now()}`, ...data };
       const allWords = loadSavedWords();
       allWords[newWordObj.word] = newWordObj;
       localStorage.setItem(STORAGE_KEY_WORDS, JSON.stringify(allWords));
       setAllWordsMap(prev => ({ ...prev, [newWordObj.word]: newWordObj }));
       setNewWordInput("");
       setShowAddWordModal(false);
    } else {
       alert("添加失败，请检查拼写或重试");
    }
    setIsAddingWord(false);
  };

  // --- View Components ---
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
                    <h3 className="text-xl font-bold text-gray-800 mb-1">默认生词本</h3>
                    <p className="text-gray-400 text-sm">共 {totalWords} 词</p>
                </div>
                <button className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-sm group-hover:bg-orange-600 transition">学习中</button>
            </div>
        </div>
        <button onClick={() => setShowAddWordModal(true)} className="mt-12 w-full bg-[#00d2a0] hover:bg-[#00c290] text-white py-4 rounded-full font-bold text-lg shadow-lg shadow-green-200 flex items-center justify-center gap-2 transition-all active:scale-95">
            <Plus className="w-6 h-6" /> 新建生词本
        </button>
      </div>
    );
  };

  const BookDetailView = () => {
    const words = Object.values(allWordsMap);
    return (
      <div className="w-full max-w-md mx-auto h-[calc(100vh-80px)] flex flex-col bg-white animate-in fade-in slide-in-from-right-4">
         <div className="px-4 py-4 flex items-center justify-between border-b border-gray-50">
            <button onClick={() => setCurrentView('books')}><ChevronLeft className="text-gray-600 w-6 h-6" /></button>
            <h2 className="font-bold text-lg text-gray-800">默认生词本</h2>
            <div className="w-6"></div>
         </div>
         <div className="flex items-center gap-6 px-4 py-3 text-sm text-gray-500 font-medium border-b border-gray-100 overflow-x-auto no-scrollbar">
            <span className="text-gray-800 relative after:content-[''] after:absolute after:bottom-[-13px] after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-1 after:bg-[#00d2a0] after:rounded-t-full whitespace-nowrap">全部 ({words.length})</span>
            <span className="whitespace-nowrap">在学单词</span>
            <span className="whitespace-nowrap">未学单词</span>
            <span className="whitespace-nowrap">简单词</span>
         </div>
         <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
            {words.length === 0 ? (
                <div className="text-center text-gray-400 mt-20">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen className="w-8 h-8 text-gray-300" /></div>
                    <p>还没有添加单词哦</p>
                    <button onClick={() => setShowAddWordModal(true)} className="text-[#00d2a0] font-medium mt-2">去添加</button>
                </div>
            ) : (
                words.map((word, idx) => (
                    <div key={idx} className="border-b border-dashed border-gray-100 pb-4 last:border-0">
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-xl font-bold text-gray-800">{word.word}</h3>
                                <span className="text-gray-400 font-serif text-sm">{word.ipa}</span>
                            </div>
                            <button onClick={() => playAudio(word.word)} className="text-[#00d2a0] p-1 hover:bg-green-50 rounded-full"><Volume2 className="w-5 h-5" /></button>
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
             <button className="flex flex-col items-center gap-1 text-gray-400 px-4"><Book className="w-5 h-5" /><span className="text-[10px]">短文填词</span></button>
             <button className="flex flex-col items-center gap-1 text-gray-400 px-4"><RefreshCw className="w-5 h-5" /><span className="text-[10px]">导出词表</span></button>
         </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center font-sans relative overflow-hidden text-gray-800">
      {currentView === 'quiz' && (
          <div className="absolute inset-0 pointer-events-none z-0">
             <div className="absolute top-0 left-0 w-full h-full bg-[#e8f5e9]"></div>
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

      <div className="w-full max-w-md h-screen flex flex-col relative z-10 bg-white/50 backdrop-blur-sm shadow-2xl sm:rounded-3xl sm:h-[800px] sm:my-8 sm:overflow-hidden">
        <div className="flex-1 overflow-y-auto relative no-scrollbar">
            {currentView === 'quiz' && (
                showResult ? (
                     <div className="h-full flex items-center justify-center p-6">
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 w-full text-center border border-white/50">
                          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><Award className="w-10 h-10 text-green-600" /></div>
                          <h2 className="text-2xl font-bold text-gray-800 mb-2">{mode === 'review' ? '复习完成' : (mode === 'custom' ? '生词学习完成' : '学习完成')}</h2>
                          <div className="text-5xl font-bold text-green-600 mb-6">{score} / {vocabList.length}</div>
                          <div className="flex gap-2">
                              <button onClick={startDefaultLearn} className="flex-1 bg-gray-100 py-3 rounded-xl text-sm font-bold text-gray-600">回首页</button>
                              <button onClick={restartQuiz} className="flex-1 bg-green-500 text-white py-3 rounded-xl text-sm font-bold shadow-lg">再来一组</button>
                          </div>
                        </div>
                     </div>
                ) : (
                    <div className="h-full p-6 flex flex-col">
                        <div className="mb-4 flex justify-between items-center">
                             <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded ${mode === 'review' ? 'bg-amber-100 text-amber-700' : (mode === 'custom' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700')}`}>{mode === 'review' ? '复习' : (mode === 'custom' ? '生词本' : '新词')}</span>
                                <span className="text-xs font-medium text-gray-400">{currentIndex + 1}/{totalQuestions}</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer select-none group">
                                    <span className={`text-[10px] font-medium transition-colors ${autoPlay ? 'text-green-600' : 'text-gray-400'}`}>自动发音</span>
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={autoPlay} onChange={(e) => setAutoPlay(e.target.checked)} />
                                        <div className={`w-8 h-4 rounded-full shadow-inner transition-colors duration-300 ${autoPlay ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                                        <div className={`absolute left-0 top-[-2px] w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${autoPlay ? 'translate-x-4 bg-green-50' : 'translate-x-0'}`}></div>
                                    </div>
                                </label>
                                <button onClick={() => setShowTopicModal(true)} className="text-xs bg-white/80 border border-purple-100 text-purple-600 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm"><Sparkles className="w-3 h-3" /> 造词</button>
                             </div>
                        </div>
                        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mb-8">
                            <div className={`h-full transition-all duration-300 ${mode === 'review' ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}></div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <h1 className="text-4xl font-bold text-gray-800">{currentWord?.word}</h1>
                                <button onClick={() => playAudio(currentWord?.word)} className={`p-2 rounded-full ${autoPlay ? 'text-green-600 bg-green-50' : 'text-green-500'}`}><Volume2 className="w-6 h-6" /></button>
                            </div>
                            <div className="text-gray-400 text-lg font-serif italic mb-6">{currentWord?.ipa}</div>
                            {!aiHelpContent && !isLoadingHelp && (<button onClick={askAiForHelp} className="w-fit text-xs text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-1"><BrainCircuit className="w-3 h-3" /> 助记</button>)}
                            {isLoadingHelp && <div className="text-xs text-indigo-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> AI思考中...</div>}
                            {aiHelpContent && <div className="bg-indigo-50 p-3 rounded-xl text-sm text-gray-600 border border-indigo-100 whitespace-pre-wrap">{aiHelpContent}</div>}
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
        <div className="bg-white border-t border-gray-100 h-[60px] flex items-center justify-around px-6 relative z-20">
            <button onClick={() => { setCurrentView('quiz'); setMode('learn'); }} className={`flex flex-col items-center gap-1 ${currentView === 'quiz' ? 'text-green-600' : 'text-gray-400'}`}><Home className="w-6 h-6" /><span className="text-[10px] font-medium">练习</span></button>
            <button onClick={() => setShowAddWordModal(true)} className="bg-[#00d2a0] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-green-200 -mt-6 border-4 border-[#f8f9fa] active:scale-95 transition"><Plus className="w-6 h-6" /></button>
            <button onClick={() => setCurrentView('books')} className={`flex flex-col items-center gap-1 ${currentView.startsWith('book') ? 'text-green-600' : 'text-gray-400'}`}><Book className="w-6 h-6" /><span className="text-[10px] font-medium">生词本</span></button>
        </div>
      </div>

      {showTopicModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-in zoom-in duration-200">
              <h3 className="font-bold text-gray-800 mb-4">AI 主题造词</h3>
              <input className="w-full border rounded-xl p-3 mb-4 bg-gray-50" value={topicInput} onChange={e=>setTopicInput(e.target.value)} placeholder="输入主题..." />
              <div className="flex gap-3">
                  <button onClick={()=>setShowTopicModal(false)} className="flex-1 py-3 text-gray-500">取消</button>
                  <button onClick={generateNewQuiz} disabled={isGeneratingQuiz} className="flex-1 bg-purple-600 text-white rounded-xl flex justify-center items-center gap-2">{isGeneratingQuiz ? <Loader2 className="animate-spin w-4 h-4"/> : "生成"}</button>
              </div>
           </div>
        </div>
      )}

      {showAddWordModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-xl text-gray-800">添加生词</h3><button onClick={() => setShowAddWordModal(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
              <div className="relative mb-6">
                  <input className="w-full border-2 border-green-100 focus:border-green-500 rounded-xl p-4 bg-white text-lg outline-none transition-colors pl-10" value={newWordInput} onChange={e=>setNewWordInput(e.target.value)} placeholder="输入英语单词..." autoFocus />
                  <Search className="w-5 h-5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-xs text-gray-400 mb-4 px-1"><Sparkles className="w-3 h-3 inline mr-1 text-purple-400" /> AI 将自动补充音标、释义和练习题</p>
              <button onClick={handleAddWord} disabled={isAddingWord || !newWordInput.trim()} className="w-full bg-[#00d2a0] hover:bg-[#00c290] text-white py-4 rounded-xl font-bold shadow-md flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all">{isAddingWord ? <Loader2 className="animate-spin w-5 h-5"/> : "添加到生词本"}</button>
           </div>
        </div>
      )}
    </div>
  );
}