import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone'; // 導入 Tone.js
// 語音合成已切換回使用瀏覽器內建的 Web Speech API，不需外部 SDK。

// ---- iOS 檢測 ----
const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// Chinese translations for English words in the minimal pairs
const englishToChinese = {
  'sheep': '綿羊', 'ship': '大船',
  'beat': '節拍/打敗',
  'bit': '一點點',
  'seat': '座位', 'sit': '坐',
  'feel': '感覺', 'fill': '填滿',
  'peel': '剝皮', 'pill': '藥丸',
  'deep': '深', 'dip': '浸泡',
  'teen': '青少年', 'tin': '錫罐',
  'bean': '豆子', 'bin': '垃圾桶',
  'seek': '尋找', 'sick': '生病',
  'cheap': '便宜', 'chip': '薯片',
  'reach': '到達', 'rich': '富有',
  'meal': '一餐', 'mill': '磨坊',
  'heel': '腳跟', 'hill': '小山',
  'leak': '漏水', 'lick': '舔',
  'heat': '熱', 'hit': '打',
  'seal': '印章/海豹',
  'sill': '窗台',
  'wheel': '輪子', 'will': '將會',
  'read': '閱讀', 'rid': '擺脫',
  'mate': '夥伴',
  'late': '晚', 'let': '讓',
  'gate': '大門', 'get': '得到',
  'sale': '銷售', 'sell': '賣',
  'tail': '尾巴', 'tell': '告訴',
  'pain': '疼痛',
  'pen': '鋼筆',
  'cane': '拐杖', 'Ken': '人名',
  'date': '日期', 'debt': '債務',
  'made': '製造', 'med': '醫學的',
  'fade': '褪色',
  'bake': '烘烤', 'Beck': '人名',
  'aid': '幫助',
  'bait': '誘餌',
  'raid': '突襲',
  'red': '紅色',
  'pan': '平底鍋',
  'men': '男人們', 'man': '男人',
  'bet': '打賭', 'bat': '蝙蝠/球棒',
  'net': '網子', 'gnat': '小飛蟲',
  'set': '設定', 'sat': '坐下了',
  'pet': '寵物', 'pat': '輕拍',
  'den': '獸穴', 'Dan': '人名',
  'led': '引導了', 'lad': '小伙子',
  'rad': '激進的',
  'bed': '床', 'bad': '壞的',
  'send': '寄送', 'sand': '沙子',
  'lend': '借出', 'land': '土地',
  'fed': '餵食',
  'met': '遇見了',
  'mat': '墊子',
  'peck': '啄', 'pack': '包裹',
  'Ed': '人名',
  'add': '加',
  'fad': '一時的風潮',
  'leg': '腿', 'lag': '落後',
'test': '測試',
  'taste': '品嚐/味道',
  'pest': '害蟲',
  'paste': '糊/醬',
  'past': '過去',
  'passed': '通過了',
  'laughed': '笑了',
  'left': '左邊/離開了',
  'wet': '濕的',
  'wait': '等待',
  'west': '西方',
  'waist': '腰部',
  'waste': '浪費',
  'raced': '賽跑了',
  'rest': '休息',
  'been': '曾經是',
  'said': '說了',
  'sad': '傷心',
  'Dad': '爸爸',
  'dead': '死亡的',
  'math': '數學',
  'meth': '甲基安非他命',
  'reap': '收割',
  'rip': '撕裂',
  'pace': '步速',
  'pass': '通過',
  'cheek': '臉頰',
  'chick': '小雞',
  'wren': '鷦鷯',
  'rain': '雨',
  'ran': '跑了',
};

// IPA Transcriptions for each word based on American English
const wordToIPA = {
  'sheep': '/ʃip/', 'ship': '/ʃɪp/',
  'beat': '/bit/', 'bit': '/bɪt/',
  'seat': '/sit/', 'sit': '/sɪt/',
  'feel': '/fil/', 'fill': '/fɪl/',
  'peel': '/pil/', 'pill': '/pɪl/',
  'deep': '/dip/', 'dip': '/dɪp/',
  'teen': '/tin/', 'tin': '/tɪn/',
  'bean': '/bin/', 'bin': '/bɪn/',
  'seek': '/sik/', 'sick': '/sɪk/',
  'cheap': '/tʃip/', 'chip': '/tʃɪp/',
  'reach': '/ritʃ/', 'rich': '/rɪtʃ/',
  'meal': '/mil/', 'mill': '/mɪl/',
  'heel': '/hil/', 'hill': '/hɪl/',
  'leak': '/lik/', 'lick': '/lɪk/',
  'heat': '/hit/', 'hit': '/hɪt/',
  'seal': '/sil/', 'sill': '/sɪl/',
  'wheel': '/wil/', 'will': '/wɪl/',
  'read': '/rid/', 'rid': '/rɪd/',
  'mate': '/meɪt/', 'met': '/mɛt/',
  'late': '/leɪt/', 'let': '/lɛt/',
  'gate': '/ɡeɪt/', 'get': '/ɡɛt/',
  'sale': '/seɪl/', 'sell': '/sɛl/',
  'tail': '/teɪl/', 'tell': '/tɛl/',
  'pain': '/peɪn/', 'pen': '/pɛn/',
  'cane': '/keɪn/', 'Ken': '/kɛn/',
  'date': '/deɪt/', 'debt': '/dɛt/',
  'made': '/meɪd/', 'med': '/mɛd/',
  'fade': '/feɪd/', 'fed': '/fɛd/',
  'bake': '/beɪk/', 'Beck': '/bɛk/',
  'aid': '/eɪd/', 'Ed': '/ɛd/',
  'bait': '/beɪt/', 'bet': '/bɛt/',
  'raid': '/reɪd/', 'red': '/rɛd/',
  'pan': '/pæn/',
  'men': '/mɛn/', 'man': '/mæn/',
  'bat': '/bæt/',
  'net': '/nɛt/', 'gnat': '/næt/',
  'set': '/sɛt/', 'sat': '/sæt/',
  'pet': '/pɛt/', 'pat': '/pæt/',
  'den': '/dɛn/', 'Dan': '/dæn/',
  'led': '/lɛd/', 'lad': '/læd/',
  'rad': '/ræd/',
  'bed': '/bɛd/', 'bad': '/bæd/',
  'send': '/sɛnd/', 'sand': '/sænd/',
  'lend': '/lɛnd/', 'land': '/lænd/',
  'mat': '/mæt/',
  'peck': '/pɛk/', 'pack': '/pæk/',
  'add': '/æd/',
  'fad': '/fæd/',
  'leg': '/lɛɡ/', 'lag': '/læɡ/',
'test': '/tɛst/',
  'taste': '/teɪst/',
  'pest': '/pɛst/',
  'paste': '/peɪst/',
  'past': '/pæst/',
  'passed': '/pæst/',
  'laughed': '/læft/',
  'left': '/lɛft/',
  'wet': '/wɛt/',
  'wait': '/weɪt/',
  'west': '/wɛst/',
  'waist': '/weɪst/',
  'waste': '/weɪst/',
  'raced': '/reɪst/',
  'rest': '/rɛst/',
  'been': '/bɪn/',
  'said': '/sɛd/',
  'sad': '/sæd/',
  'Dad': '/dæd/',
  'dead': '/dɛd/',
  'math': '/mæθ/',
  'meth': '/mɛθ/',
  'reap': '/rip/',
  'rip': '/rɪp/',
  'pace': '/peɪs/',
  'pass': '/pæs/',
  'cheek': '/tʃik/',
  'chick': '/tʃɪk/',
  'wren': '/rɛn/',
  'rain': '/reɪn/',
  'ran': '/ræn/',

  // IPA for words in phonemeLearningExamples
  'about': '/əˈbaʊt/',
  'boot': '/but/',
  'book': '/bʊk/',
  'bought': '/bɔt/',
  'bot': '/bɑt/',
  'but': '/bʌt/',
  'Burt': '/bɝt/',
  'bitter': '/ˈbɪtɚ/',
  'bite': '/baɪt/',
  'boat': '/boʊt/',
  'boy': '/bɔɪ/',
  'bout': '/baʊt/',
};

// Word pairs for the game
const minimalPairs = {
  'longE_shortI': { // 長 e /i/ vs. 短 i /ɪ/
    name: '長 e /i/ vs. 短 i /ɪ/',
    pairs: [
      { correct: 'sheep', incorrect: 'ship' },
      { correct: 'beat', incorrect: 'bit' },
      { correct: 'seat', incorrect: 'sit' },
      { correct: 'feel', incorrect: 'fill' },
      { correct: 'peel', incorrect: 'pill' },
      { correct: 'deep', incorrect: 'dip' },
      { correct: 'teen', incorrect: 'tin' },
      { correct: 'bean', incorrect: 'bin' },
      { correct: 'seek', incorrect: 'sick' },
      { correct: 'cheap', incorrect: 'chip' },
      { correct: 'reach', incorrect: 'rich' },
      { correct: 'meal', incorrect: 'mill' },
      { correct: 'heel', incorrect: 'hill' },
      { correct: 'leak', incorrect: 'lick' },
      { correct: 'heat', incorrect: 'hit' },
      { correct: 'seal', incorrect: 'sill' },
      { correct: 'wheel', incorrect: 'will' },
      { correct: 'read', incorrect: 'rid' },
{ correct: 'reap', incorrect: 'rip' },
{ correct: 'cheek', incorrect: 'chick' },
{ correct: 'bean', incorrect: 'been' },
    ]
  },
  'longA_shortE': { // 長 a /eɪ/ vs. 短 e /ɛ/
    name: '長 a /eɪ/ vs. 短 e /ɛ/',
    pairs: [
{ correct: 'taste', incorrect: 'test' },
{ correct: 'paste', incorrect: 'pest' },
{ correct: 'wait', incorrect: 'wet' },
{ correct: 'waste', incorrect: 'west' },
{ correct: 'waist', incorrect: 'west' },
{ correct: 'raced', incorrect: 'rest' },
{ correct: 'rain', incorrect: 'wren' },
      { correct: 'mate', incorrect: 'met' },
      { correct: 'late', incorrect: 'let' },
      { correct: 'gate', incorrect: 'get' },
      { correct: 'sale', incorrect: 'sell' },
      { correct: 'tail', incorrect: 'tell' },
      { correct: 'pain', incorrect: 'pen' },
      { correct: 'cane', incorrect: 'Ken' },
      { correct: 'date', incorrect: 'debt' },
      { correct: 'made', incorrect: 'med' },
      { correct: 'fade', incorrect: 'fed' },
      { correct: 'bake', incorrect: 'Beck' },
      { correct: 'aid', incorrect: 'Ed' },
      { correct: 'bait', incorrect: 'bet' },
      { correct: 'raid', incorrect: 'red' }
    ]
  },
  'shortE_shortA': { // 短 e /ɛ/ vs. 短 a /æ/
    name: '短 e /ɛ/ vs. 短 a /æ/',
    pairs: [
{ correct: 'pest', incorrect: 'past' },
{ correct: 'pest', incorrect: 'passed' },
{ correct: 'left', incorrect: 'laughed' },
{ correct: 'said', incorrect: 'sad' },
{ correct: 'dead', incorrect: 'Dad' },
{ correct: 'wren', incorrect: 'ran' },
{ correct: 'meth', incorrect: 'math' },
      { correct: 'pen', incorrect: 'pan' },
      { correct: 'men', incorrect: 'man' },
      { correct: 'bet', incorrect: 'bat' },
      { correct: 'net', incorrect: 'gnat' },
      { correct: 'set', incorrect: 'sat' },
      { correct: 'pet', incorrect: 'pat' },
      { correct: 'den', incorrect: 'Dan' },
      { correct: 'led', incorrect: 'lad' },
      { correct: 'red', incorrect: 'rad' },
      { correct: 'bed', incorrect: 'bad' },
      { correct: 'send', incorrect: 'sand' },
      { correct: 'lend', incorrect: 'land' },
      { correct: 'fed', incorrect: 'fad' },
      { correct: 'met', incorrect: 'mat' },
      { correct: 'peck', incorrect: 'pack' },
      { correct: 'leg', incorrect: 'lag' }
    ]
  }
};

// Utility: shuffle
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Reverted phonemeLearningExamples to include IPA in phoneme string for title
const phonemeLearningExamples = [
  { phoneme: '短 e /ɛ/', word: 'bet' },
  { phoneme: '長 a /eɪ/', word: 'bait' },
  { phoneme: '短 a /æ/', word: 'bat' },
  { phoneme: '長 e /i/', word: 'beat' },
  { phoneme: '短 i /ɪ/', word: 'bit' },
];

const App = () => {
  const [currentRoundWord, setCurrentRoundWord] = useState('');
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackClass, setFeedbackClass] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [gameMode, setGameMode] = useState(null); // 'longE_shortI', 'longA_shortE', 'shortE_shortA', 'all', 'phonemeLearning'
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [hasAudioBeenPlayedThisRound, setHasAudioBeenPlayedThisRound] = useState(false);
  const [resultAudioPlayingId, setResultAudioPlayingId] = useState(null);
  const [shuffledPairsForRound, setShuffledPairsForRound] = useState([]);
  const synthRef = useRef(null);
  const [audioContextInitialized, setAudioContextInitialized] = useState(false);
  const [microphonePermissionRequested, setMicrophonePermissionRequested] = useState(false);
  const [selectedOptionForHighlight, setSelectedOptionForHighlight] = useState(null);

  // Initialize Tone.js synth on mount
  useEffect(() => {
    if (!synthRef.current) {
      synthRef.current = new Tone.Synth().toDestination();
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
        synthRef.current = null;
      }
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Ensure Tone.context is running (must be called in user gesture on iOS)
  const initializeAudioContext = async () => {
    if (Tone.context.state !== 'running') {
      try {
        await Tone.start();
        if (Tone.context && Tone.context.state !== 'running') {
          // 兼容性保險
          await Tone.context.resume();
        }
        setAudioContextInitialized(true);
      } catch (e) {
        console.error('Failed to start/resume AudioContext:', e);
      }
    }
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const playCorrectSound = async () => {
    await initializeAudioContext();
    if (synthRef.current && Tone.context.state === 'running') {
      synthRef.current.triggerAttackRelease('C5', '8n');
      await delay(100);
      synthRef.current.triggerAttackRelease('G5', '8n');
      await delay(200);
      synthRef.current.triggerAttackRelease('C5', '8n');
      await delay(100);
      synthRef.current.triggerAttackRelease('G5', '8n');
    }
  };

  const playIncorrectSound = async () => {
    await initializeAudioContext();
    if (synthRef.current && Tone.context.state === 'running') {
      synthRef.current.triggerAttackRelease('F4', '8n');
      await delay(250);
      synthRef.current.triggerAttackRelease('C4', '8n');
    }
  };

  // New question when deps change
  useEffect(() => {
    if (gameMode && gameMode !== 'phonemeLearning' && !showResult && shuffledPairsForRound.length > 0) {
      startNewQuestion();
    }
  }, [gameMode, currentQuestionIndex, showResult, shuffledPairsForRound]);

  const startNewQuestion = () => {
    setFeedbackMessage('');
    setFeedbackClass('');
    setButtonsDisabled(false);
    setIsListening(false);
    setSelectedOptionForHighlight(null);
    setHasAudioBeenPlayedThisRound(false);

    const currentPair = shuffledPairsForRound[currentQuestionIndex];

    if (!currentPair) {
      if (currentQuestionIndex >= shuffledPairsForRound.length && shuffledPairsForRound.length > 0) {
        setShowResult(true);
      }
      return;
    }

    let wordToPlay;
    let otherWord;
    if (Math.random() < 0.5) {
      wordToPlay = currentPair.correct;
      otherWord = currentPair.incorrect;
    } else {
      wordToPlay = currentPair.incorrect;
      otherWord = currentPair.correct;
    }

    setCurrentRoundWord(wordToPlay);
    setOptions(shuffleArray([wordToPlay, otherWord]));
  };

  // ---- Web Speech API ----
  const speakText = (text, lang = 'en-US') => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('此瀏覽器不支援 Web Speech API。請改用 HTTPS 與支援的瀏覽器。'));
        return;
      }

      try {
        // iOS 有時需要先取消殘留發音
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;

        // 嘗試挑選英語語音（若取不到就用預設）
        const voices = speechSynthesis.getVoices?.() || [];
        const englishVoice = voices.find(
          (voice) => voice.lang === 'en-US' || (voice.lang && voice.lang.startsWith('en-'))
        );
        if (englishVoice) {
          utterance.voice = englishVoice;
        }

        utterance.onend = () => resolve();
        utterance.onerror = (event) => {
          console.error('SpeechSynthesisUtterance.onerror', event);
          reject(new Error('語音合成錯誤。'));
        };

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        reject(e);
      }
    });
  };

  const playResultWordAudio = (word, id) => {
    if (resultAudioPlayingId) return; // prevent overlapping plays
    setResultAudioPlayingId(id);

    try {
      speakText(word, 'en-US');
    } catch (err) {
      console.error('Result audio play error:', err);
    }

    // 有些 iOS 環境 onend 可能不穩，保險用 polling 收斂 spinner
    let tries = 0;
    const iv = setInterval(() => {
      const synth = window.speechSynthesis;
      const speaking = !!(synth && synth.speaking);
      if (!speaking || tries++ > 200) {
        clearInterval(iv);
        setResultAudioPlayingId(null);
      }
    }, 100);
  };

  // 播放遊戲題目發音
  const playGameWordAudio = async (text) => {
    setAudioLoading(true);
    setIsListening(true);
    setHasAudioBeenPlayedThisRound(true);
    try {
      await speakText(text, 'en-US');
    } catch (error) {
      console.error('使用 Web Speech API 播放遊戲單字音檔時出錯：', error);
      setFeedbackMessage('音檔播放失敗，請重試。');
      setFeedbackClass('text-red-500');
    } finally {
      setAudioLoading(false);
      setIsListening(false);
    }
  };

  // ✅ iOS：點擊播放前強制開啟 AudioContext
  const handleListenClick = async () => {
    if (audioLoading) return;
    await initializeAudioContext();
    playGameWordAudio(currentRoundWord);
  };

  const handleOptionClick = (chosenWord) => {
    if (buttonsDisabled || !hasAudioBeenPlayedThisRound) return;
    setButtonsDisabled(true);
    setSelectedOptionForHighlight(chosenWord);

    const correct = chosenWord === currentRoundWord;

    setQuestionHistory((prev) => [
      ...prev,
      {
        questionNumber: currentQuestionIndex + 1,
        heardWord: currentRoundWord,
        chosenWord,
        isCorrect: correct,
        options,
      },
    ]);

    if (correct) {
      setFeedbackMessage('正確！');
      setFeedbackClass('text-[#3e5c76]');
      setScore((prevScore) => prevScore + 10);
      playCorrectSound();
    } else {
      setFeedbackMessage(`錯誤，正確答案是「${currentRoundWord}」。`);
      setFeedbackClass('text-[#1d2d44]');
      playIncorrectSound();
    }

    setTimeout(() => {
      if (currentQuestionIndex < 9) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setShowResult(true);
      }
    }, 2000);
  };

  // 開始新回合
  const startNewSet = (mode) => {
    setGameMode(mode);
    setScore(0);
    setCurrentQuestionIndex(0);
    setQuestionHistory([]);
    setShowResult(false);
    setSelectedOptionForHighlight(null);
    setHasAudioBeenPlayedThisRound(false);

    let pairsToShuffle;
    if (mode === 'all') {
      pairsToShuffle = Object.values(minimalPairs).flatMap((c) => c.pairs);
    } else if (minimalPairs[mode]) {
      pairsToShuffle = minimalPairs[mode].pairs;
    } else {
      console.error('選擇了無效的遊戲模式。');
      pairsToShuffle = [];
    }

    const uniquePairs = shuffleArray(pairsToShuffle).slice(0, 10);
    setShuffledPairsForRound(uniquePairs);
  };

  // 返回模式選擇
  const backToModeSelection = () => {
    setGameMode(null);
    setScore(0);
    setCurrentQuestionIndex(0);
    setFeedbackMessage('');
    setFeedbackClass('');
    setIsListening(false);
    setButtonsDisabled(false);
    setAudioLoading(false);
    setCurrentRoundWord('');
    setOptions([]);
    setQuestionHistory([]);
    setShowResult(false);
    setSelectedOptionForHighlight(null);
    setShuffledPairsForRound([]);
    setHasAudioBeenPlayedThisRound(false);
  };

  // ---- 發音學習頁面 ----
  const PhonemeLearningPage = ({ onBack }) => {
    const [playingWord, setPlayingWord] = useState(null); // 'word' or `recorded-${word}`
    const [recordingWord, setRecordingWord] = useState(null);
    const [recordedAudioMap, setRecordedAudioMap] = useState({}); // { word: blobUrl }
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const objectUrlsRef = useRef([]); // 釋放 URL 用

    // 清理 object URLs
    useEffect(() => {
      return () => {
        objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
        objectUrlsRef.current = [];
      };
    }, []);

    // 播放示範發音（TTS）
    const playPhonemeAudio = async (wordToPlay) => {
      if (playingWord !== null || recordingWord !== null) return;
      setPlayingWord(wordToPlay);
      try {
        await initializeAudioContext(); // ✅ iOS: 互動時開啟
        await speakText(wordToPlay, 'en-US');
      } catch (error) {
        console.error(`Error playing phoneme audio (${wordToPlay}):`, error);
      } finally {
        setPlayingWord(null);
      }
    };

    // 開始錄音
    const startRecording = async (wordToRecord) => {
      // 重複點擊同一個單字 -> 停止
      if (recordingWord === wordToRecord) {
        stopRecording();
        return;
      }
      if (playingWord !== null || recordingWord !== null) return;

      try {
        await initializeAudioContext(); // ✅ iOS: 互動時開啟
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert('本裝置或瀏覽器不支援錄音。');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // ✅ iOS 優先使用 AAC/MP4
        const preferredMime =
          (window.MediaRecorder && MediaRecorder.isTypeSupported('audio/mp4;codecs=mp4a.40.2')) ? 'audio/mp4;codecs=mp4a.40.2' :
          (window.MediaRecorder && MediaRecorder.isTypeSupported('audio/mp4')) ? 'audio/mp4' :
          (window.MediaRecorder && MediaRecorder.isTypeSupported('audio/m4a')) ? 'audio/m4a' :
          (window.MediaRecorder && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) ? 'audio/webm;codecs=opus' :
          '';

        if (!window.MediaRecorder) {
          alert('此瀏覽器不支援 MediaRecorder。請改用支援的瀏覽器（iOS 需 iOS 14 以上）。');
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        mediaRecorderRef.current = preferredMime
          ? new MediaRecorder(stream, { mimeType: preferredMime })
          : new MediaRecorder(stream);

        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const chosenType = (mediaRecorderRef.current && mediaRecorderRef.current.mimeType) || preferredMime || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: chosenType });
          const url = URL.createObjectURL(audioBlob);
          objectUrlsRef.current.push(url); // 收集以便釋放
          setRecordedAudioMap((prev) => ({ ...prev, [wordToRecord]: url }));
          setRecordingWord(null);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorderRef.current.onerror = (event) => {
          console.error('MediaRecorder error:', event.error);
          setRecordingWord(null);
          stream.getTracks().forEach((track) => track.stop());
          alert('無法存取麥克風或錄音時發生錯誤。');
        };

        mediaRecorderRef.current.start();
        setRecordingWord(wordToRecord);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('無法存取麥克風。請檢查瀏覽器權限。');
        setRecordingWord(null);
      }
    };

    const stopRecording = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };

    // 播放已錄音
    const playRecordedAudio = async (wordToPlay) => {
      if (playingWord !== null || recordingWord !== null) return;

      const audioUrl = recordedAudioMap[wordToPlay];
      if (!audioUrl) return;

      const audio = new Audio(audioUrl);
      // ✅ iOS: 避免進入全螢幕播放器
      audio.playsInline = true;
      audio.preload = 'auto';
      audio.load();
      audio.currentTime = 0;

      setPlayingWord(`recorded-${wordToPlay}`);
      audio.onended = () => setPlayingWord(null);
      audio.onerror = (err) => {
        console.error('Error playing recorded audio:', err);
        setPlayingWord(null);
      };

      try {
        await initializeAudioContext(); // ✅ iOS: 互動時開啟
        await audio.play();
      } catch (e) {
        console.error('audio.play() failed:', e);
        setPlayingWord(null);
      }
    };

    return (
      <div className="flex flex-col space-y-4 w-full">
        <h2 className="text-xl font-bold text-[#1d2d44] mb-4">聽示範，說說看，仔細比對</h2>
        <p className="text-lg text-[#3e5c76] mb-6">仔細聽、開口唸，練習發音！</p>

        {phonemeLearningExamples.map(({ phoneme, word }) => {
          const isCurrentExamplePlaying = playingWord === word;
          const isCurrentRecordedPlaying = playingWord === `recorded-${word}`;
          const isCurrentWordRecording = recordingWord === word;
          const hasRecordedAudio = recordedAudioMap[word] !== undefined;

          return (
            <div key={word} className="flex flex-col items-center mb-6 p-4 rounded-xl bg-[#e6e2da] shadow-lg">
              <p className="text-2xl font-bold text-[#1d2d44] mb-2">{phoneme}</p>

              <div className="flex items-center justify-between w-full">
                {/* ▶ 播放示範 */}
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await playPhonemeAudio(word);
                  }}
                  disabled={playingWord !== null || recordingWord !== null}
                  className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl text-[#1d2d44] shadow-md hover:scale-110 transition-transform duration-200 mr-2"
                >
                  {isCurrentExamplePlaying ? (
                    <svg className="animate-spin h-5 w-5 text-[#1d2d44]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    '▶'
                  )}
                </button>

                {/* 單字 + IPA + 中譯 */}
                <div className="flex flex-col text-left flex-grow mx-2">
                  <span className="text-3xl font-bold text-[#1d2d44]">{word}</span>
                  {wordToIPA[word] && <span className="text-xl text-[#3e5c76] font-sans">{wordToIPA[word]}</span>}
                  <span className="text-lg text-gray-700">{englishToChinese[word]}</span>
                </div>

                {/* ● 錄音 / ■ 停止 */}
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await startRecording(word);
                  }}
                  disabled={playingWord !== null || (recordingWord !== null && recordingWord !== word)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-md hover:scale-110 transition-transform duration-200 ml-2
                    ${isCurrentWordRecording ? 'bg-red-500 text-white' : 'bg-red-300 hover:bg-red-400 text-red-800'}`}
                >
                  {isCurrentWordRecording ? '■' : '●'}
                </button>

                {/* ▶ 播放自己的錄音 */}
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await playRecordedAudio(word);
                  }}
                  disabled={!hasRecordedAudio || playingWord !== null || recordingWord !== null}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-md hover:scale-110 transition-transform duration-200 ml-2
                    ${hasRecordedAudio && !playingWord && !recordingWord ? 'bg-green-300 hover:bg-green-400 text-green-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  {isCurrentRecordedPlaying ? (
                    <svg className="animate-spin h-5 w-5 text-[#1d2d44]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    '▶'
                  )}
                </button>
              </div>
            </div>
          );
        })}
        <button
          onClick={onBack}
          className="bg-[#1d2d44] hover:bg-[#3e5c76] text-white font-bold py-2 px-6 rounded-full shadow transform transition duration-300 hover:scale-105 mt-6"
        >
          返回首頁
        </button>
      </div>
    );
  };

  return (
    // 外層容器
    <div className="w-full min-h-screen flex justify-center items-center sm:p-4 bg-gray-100">
      <div className="bg-[#f0ebd8] p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl w-full text-center border-4 border-[#3e5c76] md:max-w-[720px] flex flex-col items-center min-h-screen sm:min-h-0">
        <h1 className="text-4xl font-extrabold text-[#1d2d44] mb-2 font-inter">
          🔍母音偵探<br />
          <span className="text-2xl">Vowel Detective 👂🏻</span>
        </h1>

        {gameMode === null ? (
          <div className="flex flex-col space-y-4 w-full">
            <p className="text-xl sm:text-2xl text-[#3e5c76] mt-1 mb-2">破解最容易搞混的母音！</p>

            {/* 發音範例入口（點擊中同時請麥克風權限 + 啟動 AudioContext） */}
            <p className="text-xl font-bold text-[#3e5c76] mb-3">聽例字，練發音</p>
            <button
              onClick={async () => {
                try {
                  await initializeAudioContext(); // ✅ iOS: 互動時開啟
                  if (!microphonePermissionRequested) {
                    await navigator.mediaDevices.getUserMedia({ audio: true });
                    setMicrophonePermissionRequested(true);
                  }
                  setGameMode('phonemeLearning');
                } catch (err) {
                  console.error('Error accessing microphone:', err);
                  setMicrophonePermissionRequested(true); // 避免反覆彈窗
                  alert('無法存取麥克風。請檢查瀏覽器權限。');
                }
              }}
              className="bg-[#1d2d44] hover:bg-[#3e5c76] text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition duration-300 hover:scale-105 mb-4 text-xl"
            >
              發音跟讀練習
            </button>

            <div className="mt-5 pt-2 border-t-2 border-dashed border-gray-300 w-full"></div>

            {/* 遊戲模式 */}
            <p className="text-xl sm:text-2xl text-[#3e5c76] mb-3 mt-4">開始挑戰，測試你的聽力！</p>
            <h2 className="text-xl font-bold text-[#1d2d44] mb-4">選擇練習模式：</h2>

            <button
              onClick={() => startNewSet('longA_shortE')}
              className="bg-[#748cab] hover:bg-[#3e5c76] text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition duration-300 hover:scale-105 text-xl"
            >
              {minimalPairs['longA_shortE'].name}
            </button>
            <button
              onClick={() => startNewSet('shortE_shortA')}
              className="bg-[#748cab] hover:bg-[#3e5c76] text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition duration-300 hover:scale-105 text-xl"
            >
              {minimalPairs['shortE_shortA'].name}
            </button>
            <button
              onClick={() => startNewSet('longE_shortI')}
              className="bg-[#748cab] hover:bg-[#3e5c76] text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition duration-300 hover:scale-105 text-xl"
            >
              {minimalPairs['longE_shortI'].name}
            </button>
            <button
              onClick={() => startNewSet('all')}
              className="bg-[#3e5c76] hover:bg-[#748cab] text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition duration-300 hover:scale-105 text-xl"
            >
              綜合練習
            </button>

            <p className="text-sm text-gray-500 mt-4">© 2025 Christina Yu — All Rights Reserved</p>
          </div>
        ) : gameMode === 'phonemeLearning' ? (
          <PhonemeLearningPage onBack={backToModeSelection} />
        ) : showResult ? (
          <div className="text-center p-4 w-full">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1d2d44] mb-6 drop-shadow-md">
              挑戰結束！🎉
            </h1>
            <p className="text-3xl md:text-3xl font-bold text-[#1d2d44] mb-3">你的最終得分是：</p>
            <p className="text-5xl md:text-5xl font-extrabold text-[#1d2d44] bg-[#f0ebd8] p-6 rounded-full inline-block shadow-lg animate-bounce mb-6">
              {score} 分
            </p>

            <h2 className="text-2xl font-bold text-[#1d2d44] mt-6 mb-4 drop-shadow-md">題目回顧</h2>
            <div className="bg-[#f0ebd8] rounded-xl shadow-lg p-1 md:p-6 overflow-x-auto mx-auto w-full">
              <table className="min-w-full text-left text-xl">
                <thead>
                  <tr className="bg-[#3e5c76] text-white">
                    <th className="py-2 px-3 border-b border-[#1d2d44]">聽到的單字</th>
                    <th className="py-2 px-3 border-b border-[#1d2d44]">你的選擇</th>
                  </tr>
                </thead>
                <tbody>
                  {questionHistory.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-[#f0ebd8] last:border-b-0 hover:bg-[#e6e2da] transition-colors duration-200"
                    >
                      {/* 聽到的單字 */}
                      <td className="py-2 px-3 font-bold text-[#1d2d44]">
                        <div className="flex items-start gap-2">
                          {/* ▶ play button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playResultWordAudio(item.heardWord, `heard-${index}`);
                            }}
                            disabled={!!resultAudioPlayingId && resultAudioPlayingId !== `heard-${index}`}
                            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg text-[#1d2d44] shadow-md hover:scale-110 transition-transform duration-200"
                            aria-label={`Play ${item.heardWord}`}
                            title="播放"
                          >
                            {resultAudioPlayingId === `heard-${index}` ? (
                              <svg
                                className="animate-spin h-5 w-5 text-[#1d2d44]"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            ) : (
                              '▶'
                            )}
                          </button>

                          {/* Word + IPA + Chinese */}
                          <div>
                            <div>{item.heardWord}</div>
                            {wordToIPA[item.heardWord] && (
                              <div className="text-lg font-sans text-[#3e5c76]">{wordToIPA[item.heardWord]}</div>
                            )}
                            <div className="text-base text-gray-500">{englishToChinese[item.heardWord]}</div>
                          </div>
                        </div>
                      </td>

                      {/* 你的選擇 */}
                      <td
                        className={`py-2 px-3 font-semibold ${item.isCorrect ? 'text-green-600' : 'text-red-600'}`}
                      >
                        <div className="flex items-start gap-2">
                          {/* ▶ play button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playResultWordAudio(item.chosenWord, `chosen-${index}`);
                            }}
                            disabled={!!resultAudioPlayingId && resultAudioPlayingId !== `chosen-${index}`}
                            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg text-[#1d2d44] shadow-md hover:scale-110 transition-transform duration-200"
                            aria-label={`Play ${item.chosenWord}`}
                            title="播放"
                          >
                            {resultAudioPlayingId === `chosen-${index}` ? (
                              <svg
                                className="animate-spin h-5 w-5 text-[#1d2d44]"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            ) : (
                              '▶'
                            )}
                          </button>

                          {/* Word + IPA + Chinese */}
                          <div>
                            <div>{item.chosenWord}</div>
                            {wordToIPA[item.chosenWord] && (
                              <div className="text-lg font-sans text-[#3e5c76]">{wordToIPA[item.chosenWord]}</div>
                            )}
                            <div className="text-base text-gray-500">{englishToChinese[item.chosenWord]}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col md:flex-row justify-center gap-4">
              <button
                onClick={backToModeSelection}
                className="px-8 py-4 rounded-full text-2xl font-bold bg-[#1d2d44] text-white hover:bg-[#3e5c76] transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                重新選擇模式 🔄
              </button>
              <button
                onClick={() => startNewSet(gameMode)}
                className="px-8 py-4 rounded-full text-2xl font-bold bg-[#3e5c76] text-white hover:bg-[#1d2d44] transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                再玩一次！✨
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-2xl font-bold text-[#1d2d44]">
                得分：<span className="text-[#3e5c76]">{score}</span> / <span className="text-[#3e5c76]">100</span>
              </p>
              <p className="text-xl text-[#1d2d44] mt-2">
                題目：<span className="text-[#3e5c76]">{currentQuestionIndex + 1}</span> / 10
              </p>
            </div>

            <p className="text-lg text-[#1d2d44] mb-6">聽一聽，選對字！</p>

            <div className="mb-8 relative h-16 flex items-center justify-center">
              <button
                onClick={handleListenClick}
                disabled={audioLoading || buttonsDisabled}
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl text-[#1d2d44] shadow-md hover:scale-110 transition-transform duration-200"
              >
                {audioLoading ? (
                  <svg className="animate-spin h-7 w-7 text-[#1d2d44]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  '▶'
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 w-full self-stretch">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleOptionClick(option)}
                  disabled={buttonsDisabled || !hasAudioBeenPlayedThisRound}
                  className={`
                    w-full min-w-0 break-words py-4 px-4 rounded-xl text-center shadow-md
                    transform transition duration-200 hover:scale-105
                    ${selectedOptionForHighlight === option
                      ? (option === currentRoundWord
                          ? 'ring-4 ring-inset ring-[#3e5c76]'
                          : 'ring-4 ring-inset ring-[#1d2d44]')
                      : ''}
                    ${(buttonsDisabled || !hasAudioBeenPlayedThisRound)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#3e5c76] hover:bg-[#1d2d44] text-white'}
                  `}
                >
                  <div className="text-3xl font-extrabold">{option}</div>
                  {wordToIPA[option] && <div className="text-2xl font-sans break-all">{wordToIPA[option]}</div>}
                  <div className="text-xl">{englishToChinese[option]}</div>
                </button>
              ))}
            </div>

            {feedbackMessage && (
              <p className={`text-xl font-semibold mb-6 ${feedbackClass}`}>
                {feedbackMessage}
              </p>
            )}

            <button
              onClick={backToModeSelection}
              className="bg-[#1d2d44] hover:bg-[#3e5c76] text-white font-bold py-2 px-6 rounded-full shadow transform transition duration-300 hover:scale-105"
            >
              返回模式選擇
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default App;

