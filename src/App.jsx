import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone'; // 導入 Tone.js
// 語音合成已切換回使用瀏覽器內建的 Web Speech API，不需外部 SDK。

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
  'leg': '腿', 'lag': '落後'
};

// IPA Transcriptions for each word based on American English (from user's prompt)
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


// Word pairs for the game based on provided Markdown files
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
      { correct: 'read', incorrect: 'rid' }
    ]
  },
  'longA_shortE': { // 長 a /eɪ/ vs. 短 e /ɛ/
    name: '長 a /eɪ/ vs. 短 e /ɛ/',
    pairs: [
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

// Utility function to shuffle an array
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
  const [score, setScore] = useState(0); // Total score for the set
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackClass, setFeedbackClass] = useState('');
  const [isListening, setIsListening] = useState(false); // Used for spinner on main game play button
  const [gameMode, setGameMode] = useState(null); // 'longE_shortI', 'longA_shortE', 'shortE_shortA', 'all', 'phonemeLearning'
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false); // Used for spinner on main game play button
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Current question index (0-9)
  const [showResult, setShowResult] = useState(false); // To show results at the end of a set
  const [questionHistory, setQuestionHistory] = useState([]); // To store history for results review
  const [hasAudioBeenPlayedThisRound, setHasAudioBeenPlayedThisRound] = useState(false); // New state for audio played status
const [resultAudioPlayingId, setResultAudioPlayingId] = useState(null);


  // 新增狀態：儲存當前回合的隨機不重複配對組
  const [shuffledPairsForRound, setShuffledPairsForRound] = useState([]);

  // Removed audioContextRef as Tone.context is used directly
  const synthRef = useRef(null); // Tone.js synth
  const [audioContextInitialized, setAudioContextInitialized] = useState(false);
  // New state to track if microphone permission has been requested (and potentially granted)
  const [microphonePermissionRequested, setMicrophonePermissionRequested] = useState(false);

  // Initialize Tone.js synth on mount
  useEffect(() => {
    // Initialize Tone.js Synth only once
    if (!synthRef.current) {
      synthRef.current = new Tone.Synth().toDestination();
    }

    // Cleanup function for Tone.js resources
    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
        synthRef.current = null; // Clear ref on unmount
      }
      // Stop any ongoing Web Speech API speech
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
      }
      // Tone.context is globally managed by Tone.js and handles its own lifecycle.
      // Explicitly closing it here might interfere with Tone.js's internal state.
    };
  }, []); // Empty dependency array means this runs once on mount


  // Function to ensure Tone.context is running
  const initializeAudioContext = async () => {
    // Tone.start() handles resuming a suspended context or starting a new one.
    // It should be called after a user gesture.
    if (Tone.context.state !== 'running') {
      console.log('AudioContext not running, attempting Tone.start()... Current state:', Tone.context.state);
      try {
        await Tone.start();
        setAudioContextInitialized(true);
        console.log('AudioContext is now running!');
      } catch (e) {
        console.error('Failed to start AudioContext with Tone.start():', e);
      }
    } else {
      console.log('AudioContext is already running.');
    }
  };

  // Helper function: delay for a given time
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Play correct sound effect (ding-dong)
  const playCorrectSound = async () => {
    console.log("Attempting to play correct sound.");
    await initializeAudioContext(); // Ensure context is running
    if (synthRef.current && Tone.context.state === 'running') {
      console.log("Playing correct sound notes...");
      synthRef.current.triggerAttackRelease("C5", "8n"); // First ding
      await delay(100); // 0.1 second interval
      synthRef.current.triggerAttackRelease("G5", "8n"); // First dong
      await delay(200); // 0.2 second interval (between ding-dong sets)
      synthRef.current.triggerAttackRelease("C5", "8n"); // Second ding
      await delay(100); // 0.1 second interval
      synthRef.current.triggerAttackRelease("G5", "8n"); // Second dong
    } else {
      console.log("Cannot play correct sound: synth not ready or context not running.", synthRef.current, Tone.context.state);
    }
  };

  // Play incorrect sound effect (da-da)
  const playIncorrectSound = async () => {
    console.log("Attempting to play incorrect sound.");
    await initializeAudioContext(); // Ensure context is running
    if (synthRef.current && Tone.context.state === 'running') {
      console.log("Playing incorrect sound notes...");
      synthRef.current.triggerAttackRelease("F4", "8n");
      await delay(250); // Simulate 8n delay
      synthRef.current.triggerAttackRelease("C4", "8n");
    } else {
      console.log("Cannot play incorrect sound: synth not ready or context not running.", synthRef.current, Tone.context.state);
    }
  };


  // State to track the selected option for highlighting
  const [selectedOptionForHighlight, setSelectedOptionForHighlight] = useState(null);

  // Effect to start a new question when gameMode changes or currentQuestionIndex updates
  useEffect(() => {
    // 只有在 gameMode 已選擇、不是學習模式、不顯示結果，並且當回合配對已準備好時才開始新題目
    if (gameMode && gameMode !== 'phonemeLearning' && !showResult && shuffledPairsForRound.length > 0) {
      startNewQuestion();
    }
  }, [gameMode, currentQuestionIndex, showResult, shuffledPairsForRound]); // 新增 shuffledPairsForRound 作為依賴項

  // Function to start a new question within a set
  const startNewQuestion = () => {
    setFeedbackMessage('');
    setFeedbackClass('');
    setButtonsDisabled(false);
    setIsListening(false); // Ensure listening spinner is reset for main game button
    setSelectedOptionForHighlight(null); // CRUCIAL: Reset highlight here before new question content is loaded
    setHasAudioBeenPlayedThisRound(false); // Reset audio played status for new question

    // 從當前回合已隨機排列的不重複配對組中，取出當前題目的配對
    const currentPair = shuffledPairsForRound[currentQuestionIndex];

    if (!currentPair) {
        // 如果沒有更多題目，或配對尚未初始化，則結束回合
        console.log("當前回合已無更多題目或配對尚未初始化。");
        if (currentQuestionIndex >= shuffledPairsForRound.length && shuffledPairsForRound.length > 0) {
            setShowResult(true); // 如果所有生成的題目都已用完，則自動顯示結果
        }
        return;
    }

    let wordToPlay;
    let otherWord;

    // Randomly decide which word from the pair will be the "heard" word
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

  // Web Speech API 的語音合成函數
  const speakText = (text, lang = 'en-US') => {
    return new Promise((resolve, reject) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang; // 設定語言，以獲得更好的發音 (例如 'en-US')

        // 可選：如果需要特定語音，但通常預設即可
        const voices = speechSynthesis.getVoices();
        const englishVoice = voices.find(voice => voice.lang === 'en-US' || voice.lang.startsWith('en-'));
        if (englishVoice) {
          utterance.voice = englishVoice;
        }

        utterance.onend = () => {
          resolve();
        };
        utterance.onerror = (event) => {
          console.error('SpeechSynthesisUtterance.onerror', event);
          reject(new Error('語音合成錯誤。'));
        };

        speechSynthesis.speak(utterance);
      } else {
        reject(new Error('此瀏覽器不支援 Web Speech API。根據瀏覽器安全政策，請從外部網址或 HTTPS 啟用。')); // Modified error message
      }
    });
  };
 // Minimal change: keep speakText as-is; watch speechSynthesis.speaking
const playResultWordAudio = (word, id) => {
  if (resultAudioPlayingId) return; // prevent overlapping plays
  setResultAudioPlayingId(id);

  try {
    speakText(word, 'en-US'); // your existing function
  } catch (err) {
    console.error('Result audio play error:', err);
  }

  // Clear spinner when TTS actually finishes (no await needed)
  let tries = 0;                     // safety guard (~20s max)
  const iv = setInterval(() => {
    const synth = window.speechSynthesis;
    const speaking = !!(synth && synth.speaking);

    if (!speaking || tries++ > 200) {
      clearInterval(iv);
      setResultAudioPlayingId(null);
    }
  }, 100); // check every 100ms; lower if you want snappier updates
};



  // 使用 Web Speech API 播放遊戲單字音檔 (for main game screen)
  const playGameWordAudio = async (text) => {
    setAudioLoading(true); // 顯示載入中旋轉圖示
    setIsListening(true); // 也用於旋轉圖示
    setHasAudioBeenPlayedThisRound(true); // Set audio played to true as soon as playback is triggered
    try {
      await speakText(text, 'en-US'); // 播放單字
    } catch (error) {
      console.error("使用 Web Speech API 播放遊戲單字音檔時出錯：", error);
      setFeedbackMessage("音檔播放失敗，請重試。");
      setFeedbackClass('text-red-500');
    } finally {
      setAudioLoading(false); // 隱藏載入中旋轉圖示
      setIsListening(false); // 隱藏旋轉圖示
    }
  };

  // 處理「播放」按鈕點擊 (針對遊戲單字)
  const handleListenClick = () => {
    if (audioLoading) return; // 防止重複音訊請求
    playGameWordAudio(currentRoundWord);
  };


  // 處理拼寫選項點擊
  const handleOptionClick = (chosenWord) => {
    // Ensure buttons are disabled if audio hasn't been played this round or if already disabled
    if (buttonsDisabled || !hasAudioBeenPlayedThisRound) return;
    setButtonsDisabled(true);
    setSelectedOptionForHighlight(chosenWord); // 設定選取的選項以進行高亮顯示

    const correct = chosenWord === currentRoundWord;

    // 記錄題目歷史以供結果回顧
    setQuestionHistory(prevHistory => [
      ...prevHistory,
      {
        questionNumber: currentQuestionIndex + 1,
        heardWord: currentRoundWord,
        chosenWord: chosenWord,
        isCorrect: correct,
        options: options // 儲存選項以供回顧 (如果需要)
      }
    ]);

    if (correct) {
      setFeedbackMessage('正確！');
      setFeedbackClass('text-[#3e5c76]'); // 正確回饋文字顏色
      setScore(prevScore => prevScore + 10); // 每答對一題得 10 分
      playCorrectSound(); // 播放正確音效
    } else {
      setFeedbackMessage(`錯誤，正確答案是「${currentRoundWord}」。`);
      setFeedbackClass('text-[#1d2d44]'); // 錯誤回饋文字顏色
      playIncorrectSound(); // 播放錯誤音效
    }

    // 短暫延遲後，移至下一題或顯示結果
    setTimeout(() => {
      if (currentQuestionIndex < 9) { // 一個回合有 10 題 (0 到 9)
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      } else {
        setShowResult(true); // 10 題回合結束
      }
    }, 2000);
  };

  // 開始新回合的函數 (重設分數、索引、歷史記錄並準備新的不重複題目)
  const startNewSet = (mode) => {
    setGameMode(mode);
    setScore(0);
    setCurrentQuestionIndex(0);
    setQuestionHistory([]);
    setShowResult(false);
    setSelectedOptionForHighlight(null); // 確保開始新回合時沒有高亮顯示
    setHasAudioBeenPlayedThisRound(false); // Reset audio played status for new set

    let pairsToShuffle;
    if (mode === 'all') {
      // 串聯所有類別的配對
      pairsToShuffle = Object.values(minimalPairs).flatMap(category => category.pairs);
    } else if (minimalPairs[mode]) {
      // 使用選定類別的配對
      pairsToShuffle = minimalPairs[mode].pairs;
    } else {
      console.error("選擇了無效的遊戲模式。");
      pairsToShuffle = []; // 預設值
    }

    // 隨機排列並取出前 10 組不重複的配對組作為本回合題目
    // 如果可用配對少於 10 組，則取所有可用配對
    const uniquePairs = shuffleArray(pairsToShuffle).slice(0, 10);
    setShuffledPairsForRound(uniquePairs);
  };

  // 返回模式選擇 (重設所有遊戲狀態)
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
    setSelectedOptionForHighlight(null); // 確保返回模式選擇時沒有高亮顯示
    setShuffledPairsForRound([]); // 清除隨機配對組
    setHasAudioBeenPlayedThisRound(false); // Reset audio played status
  };

  // 發音學習頁面元件
  const PhonemeLearningPage = ({ onBack }) => {
    const [playingWord, setPlayingWord] = useState(null); // 'word' if playing, 'recorded-word' if recorded audio playing, null if not.
    const [recordingWord, setRecordingWord] = useState(null); // 'word' if recording, null if not.
    const [recordedAudioMap, setRecordedAudioMap] = useState({}); // { 'word': 'blob:url' }
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);


    // Play phoneme example audio
    const playPhonemeAudio = async (wordToPlay) => {
      if (playingWord !== null || recordingWord !== null) return; // Prevent multiple audio or recording at once

      setPlayingWord(wordToPlay);
      try {
        await speakText(wordToPlay, 'en-US');
      } catch (error) {
        console.error(`Error playing phoneme audio (${wordToPlay}):`, error);
      } finally {
        setPlayingWord(null);
      }
    };

    // Start recording for a specific word
    const startRecording = async (wordToRecord) => {
      // If already recording this word, stop it
      if (recordingWord === wordToRecord) {
        stopRecording();
        return;
      }

      if (playingWord !== null || recordingWord !== null) return; // Prevent recording if audio is playing or another recording is active

      try {
        // This getUserMedia will now run after the initial request on the homepage
        // If permission was granted, it will resolve immediately without a prompt.
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // iOS 優先 mp4/AAC，其他瀏覽器退回 webm/opus
const preferredMime =
  (window.MediaRecorder && MediaRecorder.isTypeSupported('audio/mp4;codecs=mp4a.40.2')) ? 'audio/mp4;codecs=mp4a.40.2' :
  (window.MediaRecorder && MediaRecorder.isTypeSupported('audio/mp4')) ? 'audio/mp4' :
  (window.MediaRecorder && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) ? 'audio/webm;codecs=opus' :
  '';

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
 // WebM is commonly supported
          const url = URL.createObjectURL(audioBlob);
          setRecordedAudioMap(prevMap => ({ ...prevMap, [wordToRecord]: url }));
          setRecordingWord(null);
          stream.getTracks().forEach(track => track.stop()); // Stop the microphone stream tracks
        };

        mediaRecorderRef.current.onerror = (event) => {
          console.error("MediaRecorder error:", event.error);
          setRecordingWord(null);
          stream.getTracks().forEach(track => track.stop()); // Stop the microphone stream tracks
          alert('無法存取麥克風或錄音時發生錯誤。'); // Simple alert for microphone errors
        };

        mediaRecorderRef.current.start();
        setRecordingWord(wordToRecord);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('無法存取麥克風。請檢查瀏覽器權限。'); // Simple alert for microphone access errors
        setRecordingWord(null);
      }
    };

    // Stop current recording
    const stopRecording = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };

    // Play recorded audio for a specific word
    const playRecordedAudio = async (wordToPlay) => {
      if (playingWord !== null || recordingWord !== null) return; // Prevent audio or recording at once

      const audioUrl = recordedAudioMap[wordToPlay];
      if (!audioUrl) return;

      const audio = new Audio(audioUrl);
      setPlayingWord(`recorded-${wordToPlay}`); // Unique identifier for playing recorded audio
      audio.onended = () => {
        setPlayingWord(null);
      };
      audio.onerror = (err) => {
        console.error("Error playing recorded audio:", err);
        setPlayingWord(null);
      };
      audio.play();
    };


    return (
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-bold text-[#1d2d44] mb-4">聽示範，說說看，再仔細比對</h2>
        <p className="text-lg text-[#3e5c76] mb-6">仔細聽、開口唸，練習你的發音！</p> {/* 新增的小標題 */}

        {phonemeLearningExamples.map(({ phoneme, word }) => {
          const isCurrentExamplePlaying = playingWord === word;
          const isCurrentRecordedPlaying = playingWord === `recorded-${word}`;
          const isCurrentWordRecording = recordingWord === word;
          const hasRecordedAudio = recordedAudioMap[word] !== undefined;

          return (
            <div key={word} className="flex flex-col items-center mb-6 p-4 rounded-xl bg-[#e6e2da] shadow-lg">
              <p className="text-2xl font-bold text-[#1d2d44] mb-2">{phoneme}</p> {/* 發音標題，現在包含 IPA 符號 */}
              <div className="flex items-center justify-between w-full"> {/* 單字/中文與播放按鈕的容器 */}
                {/* Play Example Audio Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    playPhonemeAudio(word);
                  }}
                  disabled={playingWord !== null || recordingWord !== null} // Disable if any audio is playing or recording
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

                {/* Word, IPA, and Chinese Translation */}
                <div className="flex flex-col text-left flex-grow mx-2">
                  <span className="text-3xl font-extrabold text-[#1d2d44]">{word}</span> {/* 英文單字 */}
                  {wordToIPA[word] && <span className="text-2xl text-[#3e5c76] font-sans">{wordToIPA[word]}</span>} {/* IPA - Changed to font-sans */}
                  <span className="text-xl text-gray-700">{englishToChinese[word]}</span> {/* 中文翻譯 (字體縮小) */}
                </div>

                {/* Record Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startRecording(word);
                  }}
                  disabled={playingWord !== null || (recordingWord !== null && recordingWord !== word)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-md hover:scale-110 transition-transform duration-200 ml-2
                    ${isCurrentWordRecording ? 'bg-red-500 text-white' : 'bg-red-300 hover:bg-red-400 text-red-800'}`}
                >
                  {isCurrentWordRecording ? '■' : '●'} {/* Stop or Record icon */}
                </button>

                {/* Play Recorded Audio Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playRecordedAudio(word);
                  }}
                  disabled={!hasRecordedAudio || playingWord !== null || recordingWord !== null} // Disable if no recording, or any audio is playing/recording
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
    // React 應用程式最外層的 div，它直接就是視覺上的「卡片」。
    // 移除所有會導致裁剪或衝突的 min-h-screen/flex 屬性。
    // 高度將完全由其內容決定，且它會水平居中。
    // 已更新 max-w-* 類別，為手機提供更寬的卡片。
    <div className="bg-[#f0ebd8] p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl w-[calc(100%-24px)] sm:w-[calc(100%-32px)] text-center border-4 border-[#3e5c76] max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-2xl mx-auto flex flex-col items-center">

      <h1 className="text-4xl font-extrabold text-[#1d2d44] mb-2 font-inter">
        🔍母音偵探<br/>
        <span className="text-2xl">Vowel Detective 👂🏻</span> {/* 字體大小縮小，添加 emoji */}
      </h1>
      {gameMode === null ? ( // 初始狀態：顯示模式選擇
        <div className="flex flex-col space-y-4">
          {/* 調整字體大小為 text-2xl */}
          <p className="text-2xl text-[#3e5c76] mt-1 mb-2">破解最容易搞混的母音！</p> 

          {/* 「發音範例」區塊 */}
          {/* 字體大小改為 text-xl，添加 font-bold */}
          <p className="text-xl font-bold text-[#3e5c76] mb-3">聽例字，練發音</p>
          <button
            onClick={async () => {
              if (!microphonePermissionRequested) {
                try {
                  // Attempt to get microphone permission
                  await navigator.mediaDevices.getUserMedia({ audio: true });
                  setMicrophonePermissionRequested(true);
                  setGameMode('phonemeLearning'); // Only set game mode if permission is granted
                } catch (err) {
                  console.error('Error accessing microphone:', err);
                  setMicrophonePermissionRequested(true); // Mark as requested to avoid re-prompting immediately
                  alert('無法存取麥克風。請檢查瀏覽器權限。'); // Inform user about permission issue
                  // Do not set gameMode, stay on homepage
                }
              } else {
                // If permission was already requested (and likely granted), proceed directly
                setGameMode('phonemeLearning');
              }
            }}
            className="bg-[#1d2d44] hover:bg-[#3e5c76] text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition duration-300 hover:scale-105 mb-4 text-xl"
          >
            發音跟讀練習
          </button>

          <div className="mt-5 pt-2 border-t-2 border-dashed border-gray-300 w-full"></div> {/* 分隔線間距縮小 */}
          
          {/* 遊戲模式選擇區塊 */}
          {/* 調整字體大小為 text-2xl */}
          <p className="text-2xl text-[#3e5c76] mb-3 mt-4">開始挑戰，測試你的聽力！</p>
          <h2 className="text-xl font-bold text-[#1d2d44] mb-4">選擇練習模式：</h2> {/* 字體大小不變 */}
          {/* 手動指定練習模式按鈕順序 */}
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
          {/* 版權聲明現在在這裡，且只在 gameMode 為 null 時顯示 */}
          <p className="text-sm text-gray-500 mt-4">© 2025 Christina Yu — All Rights Reserved</p>
        </div>
      ) : gameMode === 'phonemeLearning' ? ( // 發音學習頁面獨立渲染
        <PhonemeLearningPage onBack={backToModeSelection} />
      ) : showResult ? ( // 遊戲結果畫面
        <div className="text-center p-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1d2d44] mb-6 drop-shadow-md">
            挑戰結束！🎉
          </h1>
          <p className="text-3xl md:text-4xl font-bold text-[#1d2d44] mb-3">
            你的最終得分是：
          </p>
          <p className="text-5xl md:text-6xl font-extrabold text-[#1d2d44] bg-[#f0ebd8] p-6 rounded-full inline-block shadow-lg animate-bounce mb-6">
            {score} 分
          </p>

          <h2 className="text-3xl font-bold text-[#1d2d44] mt-6 mb-4 drop-shadow-md">
            題目回顧
          </h2>
          <div className="bg-[#f0ebd8] rounded-xl shadow-lg p-4 md:p-6 overflow-x-auto mx-auto max-w-xl">
            <table className="min-w-full text-left text-lg">
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
            {/* ▶ play button — same style as existing white round buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                playResultWordAudio(item.heardWord, `heard-${index}`);
              }}
              disabled={
                !!resultAudioPlayingId && resultAudioPlayingId !== `heard-${index}`
              }
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl text-[#1d2d44] shadow-md hover:scale-110 transition-transform duration-200"
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
                <div className="text-base font-sans text-[#3e5c76]">
                  {wordToIPA[item.heardWord]}
                </div>
              )}
              <div className="text-sm text-gray-500">
                {englishToChinese[item.heardWord]}
              </div>
            </div>
          </div>
        </td>

        {/* 你的選擇 */}
        <td
          className={`py-2 px-3 font-semibold ${
            item.isCorrect ? 'text-green-600' : 'text-red-600'
          }`}
        >
          <div className="flex items-start gap-2">
            {/* ▶ play button — same style */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                playResultWordAudio(item.chosenWord, `chosen-${index}`);
              }}
              disabled={
                !!resultAudioPlayingId && resultAudioPlayingId !== `chosen-${index}`
              }
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl text-[#1d2d44] shadow-md hover:scale-110 transition-transform duration-200"
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
                <div className="text-base font-sans text-[#3e5c76]">
                  {wordToIPA[item.chosenWord]}
                </div>
              )}
              <div className="text-sm text-gray-500">
                {englishToChinese[item.chosenWord]}
              </div>
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
      ) : ( // 遊戲進行畫面
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
              // 修改後的 className 以符合發音學習頁面的播放按鈕樣式
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl text-[#1d2d44] shadow-md hover:scale-110 transition-transform duration-200"
            >
              {audioLoading ? (
                // 調整旋轉圖示大小和顏色以符合新按鈕樣式
                <svg className="animate-spin h-7 w-7 text-[#1d2d44]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  '▶' // 白色圓圈上的黑色三角形
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
      {wordToIPA[option] && <div className="text-xl font-sans break-all">{wordToIPA[option]}</div>}
      <div className="text-base">{englishToChinese[option]}</div>
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
  );
};

export default App;
