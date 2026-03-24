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
  // /u/ vs. /ʊ/
  'boot': '靴子', 'book': '書',
  'fool': '傻瓜', 'full': '滿的',
  'pool': '游泳池', 'pull': '拉',
  'Luke': '人名', 'look': '看',
  'cooed': '咕咕叫', 'could': '能夠',
  'wooed': '追求', 'wood': '木頭',
  "who'd": '誰會', 'hood': '頭罩',
  'shooed': '趕走', 'should': '應該',
  // /oʊ/ vs. /ɔ/
  'boat': '船', 'bought': '買了',
  'low': '低', 'law': '法律',
  'so': '所以', 'saw': '看見了',
  'no': '不', 'gnaw': '啃',
  'Joe': '人名', 'jaw': '下巴',
  'row': '排/划', 'raw': '生的',
  'coat': '外套', 'caught': '抓住了',
  'tote': '手提袋', 'taught': '教了',
  'woke': '醒來', 'walk': '走路',
  'pole': '桿子', 'Paul': '人名',
  'bowl': '碗', 'ball': '球',
  'coal': '煤炭', 'call': '叫',
  'toll': '過路費', 'tall': '高的',
  'sole': '唯一/鞋底', 'Saul': '人名',
  'note': '筆記', 'naught': '零',
  'cold': '冷的', 'called': '叫了',
  'bold': '大膽的', 'bald': '禿的',
  // /ʌ/ vs. /ɑ/
  'bug': '蟲子', 'bog': '沼澤',
  'but': '但是', 'bot': '機器人',
  'buck': '美元(口語)/雄鹿', 'bock': '黑啤酒',
  'cup': '杯子', 'cop': '警察',
  'cut': '切', 'cot': '嬰兒床',
  'cub': '幼獸', 'cob': '玉米穗軸',
  'duck': '鴨子', 'dock': '碼頭',
  'dug': '挖了', 'dog': '狗',
  'gut': '腸子/直覺', 'got': '得到了',
  'hug': '擁抱', 'hog': '豬',
  'hut': '小屋', 'hot': '熱的',
  'luck': '運氣', 'lock': '鎖',
  'lung': '肺', 'long': '長的',
  'muck': '泥濘', 'mock': '嘲笑',
  'nut': '堅果', 'not': '不',
  'putt': '推桿(高爾夫)', 'pot': '鍋子',
  'rub': '搓/擦', 'rob': '搶劫',
  'rung': '梯級/響了', 'wrong': '錯的',
  'stuck': '卡住了', 'stock': '股票/庫存',
  'sung': '唱了', 'song': '歌',
  'tuck': '塞入', 'tock': '滴答聲',
  'come': '來', 'calm': '冷靜',
  'buddy': '好朋友', 'body': '身體',
  'color': '顏色', 'collar': '衣領',
  'rubber': '橡皮', 'robber': '強盜',
  'utter': '完全的/說出', 'otter': '水獺',
  'wonder': '想知道/奇蹟', 'wander': '漫步',
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
  // /u/ vs. /ʊ/
  'fool': '/ful/', 'full': '/fʊl/',
  'pool': '/pul/', 'pull': '/pʊl/',
  'Luke': '/luk/', 'look': '/lʊk/',
  'cooed': '/kud/', 'could': '/kʊd/',
  'wooed': '/wud/', 'wood': '/wʊd/',
  "who'd": '/hud/', 'hood': '/hʊd/',
  'shooed': '/ʃud/', 'should': '/ʃʊd/',
  // /oʊ/ vs. /ɔ/
  'low': '/loʊ/', 'law': '/lɔ/',
  'so': '/soʊ/', 'saw': '/sɔ/',
  'no': '/noʊ/', 'gnaw': '/nɔ/',
  'Joe': '/dʒoʊ/', 'jaw': '/dʒɔ/',
  'row': '/roʊ/', 'raw': '/rɔ/',
  'coat': '/koʊt/', 'caught': '/kɔt/',
  'tote': '/toʊt/', 'taught': '/tɔt/',
  'woke': '/woʊk/', 'walk': '/wɔk/',
  'pole': '/poʊl/', 'Paul': '/pɔl/',
  'bowl': '/boʊl/', 'ball': '/bɔl/',
  'coal': '/koʊl/', 'call': '/kɔl/',
  'toll': '/toʊl/', 'tall': '/tɔl/',
  'sole': '/soʊl/', 'Saul': '/sɔl/',
  'note': '/noʊt/', 'naught': '/nɔt/',
  'cold': '/koʊld/', 'called': '/kɔld/',
  'bold': '/boʊld/', 'bald': '/bɔld/',
  // /ʌ/ vs. /ɑ/
  'bug': '/bʌɡ/', 'bog': '/bɑɡ/',
  'buck': '/bʌk/', 'bock': '/bɑk/',
  'cup': '/kʌp/', 'cop': '/kɑp/',
  'cut': '/kʌt/', 'cot': '/kɑt/',
  'cub': '/kʌb/', 'cob': '/kɑb/',
  'duck': '/dʌk/', 'dock': '/dɑk/',
  'dug': '/dʌɡ/', 'dog': '/dɑɡ/',
  'gut': '/ɡʌt/', 'got': '/ɡɑt/',
  'hug': '/hʌɡ/', 'hog': '/hɑɡ/',
  'hut': '/hʌt/', 'hot': '/hɑt/',
  'luck': '/lʌk/', 'lock': '/lɑk/',
  'lung': '/lʌŋ/', 'long': '/lɑŋ/',
  'muck': '/mʌk/', 'mock': '/mɑk/',
  'nut': '/nʌt/', 'not': '/nɑt/',
  'putt': '/pʌt/', 'pot': '/pɑt/',
  'rub': '/rʌb/', 'rob': '/rɑb/',
  'rung': '/rʌŋ/', 'wrong': '/rɑŋ/',
  'stuck': '/stʌk/', 'stock': '/stɑk/',
  'sung': '/sʌŋ/', 'song': '/sɑŋ/',
  'tuck': '/tʌk/', 'tock': '/tɑk/',
  'come': '/kʌm/', 'calm': '/kɑm/',
  'buddy': '/ˈbʌdi/', 'body': '/ˈbɑdi/',
  'color': '/ˈkʌlɚ/', 'collar': '/ˈkɑlɚ/',
  'rubber': '/ˈrʌbɚ/', 'robber': '/ˈrɑbɚ/',
  'utter': '/ˈʌtɚ/', 'otter': '/ˈɑtɚ/',
  'wonder': '/ˈwʌndɚ/', 'wander': '/ˈwɑndɚ/',
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
  },
  'longOO_shortOO': { // 長 u /u/ vs. 短 oo /ʊ/
    name: '長 u /u/ vs. 短 oo /ʊ/',
    pairs: [
      { correct: 'fool', incorrect: 'full' },
      { correct: 'pool', incorrect: 'pull' },
      { correct: 'Luke', incorrect: 'look' },
      { correct: 'cooed', incorrect: 'could' },
      { correct: 'wooed', incorrect: 'wood' },
      { correct: "who'd", incorrect: 'hood' },
      { correct: 'shooed', incorrect: 'should' },
    ]
  },
  'longO_shortO': { // 長 o /oʊ/ vs. aw /ɔ/
    name: '長 o /oʊ/ vs. aw /ɔ/',
    pairs: [
      { correct: 'low', incorrect: 'law' },
      { correct: 'so', incorrect: 'saw' },
      { correct: 'no', incorrect: 'gnaw' },
      { correct: 'Joe', incorrect: 'jaw' },
      { correct: 'row', incorrect: 'raw' },
      { correct: 'coat', incorrect: 'caught' },
      { correct: 'boat', incorrect: 'bought' },
      { correct: 'tote', incorrect: 'taught' },
      { correct: 'woke', incorrect: 'walk' },
      { correct: 'pole', incorrect: 'Paul' },
      { correct: 'bowl', incorrect: 'ball' },
      { correct: 'coal', incorrect: 'call' },
      { correct: 'toll', incorrect: 'tall' },
      { correct: 'sole', incorrect: 'Saul' },
      { correct: 'note', incorrect: 'naught' },
      { correct: 'cold', incorrect: 'called' },
      { correct: 'bold', incorrect: 'bald' },
    ]
  },
  'shortU_shortO': { // 短 u /ʌ/ vs. 短 o /ɑ/
    name: '短 u /ʌ/ vs. 短 o /ɑ/',
    pairs: [
      { correct: 'bug', incorrect: 'bog' },
      { correct: 'but', incorrect: 'bot' },
      { correct: 'buck', incorrect: 'bock' },
      { correct: 'cup', incorrect: 'cop' },
      { correct: 'cut', incorrect: 'cot' },
      { correct: 'cub', incorrect: 'cob' },
      { correct: 'duck', incorrect: 'dock' },
      { correct: 'dug', incorrect: 'dog' },
      { correct: 'gut', incorrect: 'got' },
      { correct: 'hug', incorrect: 'hog' },
      { correct: 'hut', incorrect: 'hot' },
      { correct: 'luck', incorrect: 'lock' },
      { correct: 'muck', incorrect: 'mock' },
      { correct: 'nut', incorrect: 'not' },
      { correct: 'putt', incorrect: 'pot' },
      { correct: 'rub', incorrect: 'rob' },
      { correct: 'stuck', incorrect: 'stock' },
      { correct: 'sung', incorrect: 'song' },
      { correct: 'tuck', incorrect: 'tock' },
      { correct: 'come', incorrect: 'calm' },
      { correct: 'buddy', incorrect: 'body' },
      { correct: 'color', incorrect: 'collar' },
      { correct: 'rubber', incorrect: 'robber' },
      { correct: 'utter', incorrect: 'otter' },
      { correct: 'wonder', incorrect: 'wander' },
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
  { phoneme: '長 u /u/', word: 'boot' },
  { phoneme: '短 oo /ʊ/', word: 'book' },
  { phoneme: '長 o /oʊ/', word: 'boat' },
  { phoneme: 'aw /ɔ/', word: 'bought' },
  { phoneme: '短 u /ʌ/', word: 'but' },
  { phoneme: '短 o /ɑ/', word: 'bot' },
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
      // Web Speech API 僅作為 fallback，仍保留清理
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

  // ---- 播放 mp3 音檔（Azure TTS 預先生成） ----
  const wordToFilename = (word) => {
    return word.trim().toLowerCase().replace(/ /g, '_').replace(/\//g, '').replace(/'/g, '') + '.mp3';
  };

  const speakText = (text) => {
    return new Promise((resolve, reject) => {
      const filename = wordToFilename(text);
      const basePath = import.meta.env.BASE_URL || '/';
      const audioUrl = `${basePath}audio/${filename}`;
      const audio = new Audio(audioUrl);
      audio.playsInline = true;
      audio.preload = 'auto';

      audio.onended = () => resolve();
      audio.onerror = (event) => {
        console.error(`mp3 播放失敗 (${audioUrl})，fallback 到 Web Speech API`, event);
        // Fallback: Web Speech API
        if ('speechSynthesis' in window) {
          if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          utterance.onend = () => resolve();
          utterance.onerror = () => reject(new Error('語音播放失敗。'));
          window.speechSynthesis.speak(utterance);
        } else {
          reject(new Error('音檔載入失敗，且瀏覽器不支援語音合成。'));
        }
      };

      audio.play().catch((e) => {
        console.error('audio.play() failed:', e);
        reject(e);
      });
    });
  };

  const playResultWordAudio = async (word, id) => {
    if (resultAudioPlayingId) return; // prevent overlapping plays
    setResultAudioPlayingId(id);

    try {
      await speakText(word);
    } catch (err) {
      console.error('Result audio play error:', err);
    } finally {
      setResultAudioPlayingId(null);
    }
  };

  // 播放遊戲題目發音
  const playGameWordAudio = async (text) => {
    setAudioLoading(true);
    setIsListening(true);
    setHasAudioBeenPlayedThisRound(true);
    try {
      await speakText(text);
    } catch (error) {
      console.error('播放遊戲單字音檔時出錯：', error);
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
      if (currentQuestionIndex < shuffledPairsForRound.length - 1) {
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

    const maxQuestions = Math.min(10, pairsToShuffle.length);
    const uniquePairs = shuffleArray(pairsToShuffle).slice(0, maxQuestions);
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
        await speakText(wordToPlay);
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
    <div className="w-full min-h-screen flex justify-center items-center p-1 sm:p-4 bg-gray-100">
      <div className="bg-[#f0ebd8] p-3 sm:p-6 md:p-8 rounded-2xl shadow-xl w-full text-center border-4 border-[#3e5c76] md:max-w-[720px] flex flex-col items-center min-h-screen sm:min-h-0">
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
              onClick={() => startNewSet('longOO_shortOO')}
              className="bg-[#748cab] hover:bg-[#3e5c76] text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition duration-300 hover:scale-105 text-xl"
            >
              {minimalPairs['longOO_shortOO'].name}
            </button>
            <button
              onClick={() => startNewSet('longO_shortO')}
              className="bg-[#748cab] hover:bg-[#3e5c76] text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition duration-300 hover:scale-105 text-xl"
            >
              {minimalPairs['longO_shortO'].name}
            </button>
            <button
              onClick={() => startNewSet('shortU_shortO')}
              className="bg-[#748cab] hover:bg-[#3e5c76] text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition duration-300 hover:scale-105 text-xl"
            >
              {minimalPairs['shortU_shortO'].name}
            </button>
            <button
              onClick={() => startNewSet('all')}
              className="bg-[#3e5c76] hover:bg-[#748cab] text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition duration-300 hover:scale-105 text-xl"
            >
              綜合練習
            </button>

            <div className="mt-8 pt-4 border-t-2 border-dashed border-gray-300 w-full flex flex-col items-center">
              <div className="flex items-center justify-center gap-4 mb-3">
                <a href="mailto:mamahowma@gmail.com" aria-label="Email mamahowma" className="text-[#3e5c76] hover:text-[#1d2d44] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="w-6 h-6"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>
                </a>
                <a href="https://www.facebook.com/mamahowma" target="_blank" rel="noopener noreferrer" aria-label="mamahowma Facebook Page" className="text-[#3e5c76] hover:text-[#1d2d44] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="w-6 h-6"><path d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256C0 376 82.7 476.8 194.2 504.5V334.2H141.4V256h52.8V222.3c0-87.1 39.4-127.5 125-127.5c16.2 0 44.2 3.2 55.7 6.4V172c-6-.6-16.5-1-29.6-1c-42 0-58.2 15.9-58.2 57.2V256h83.6l-14.4 78.2H287V512c11.5 1.5 23.2 2.7 35 3.3C409.4 480.6 512 376 512 256z"/></svg>
                </a>
                <a href="https://portaly.cc/mamahowma/support" target="_blank" rel="noopener noreferrer" aria-label="Support mamahowma" className="text-[#3e5c76] hover:text-[#1d2d44] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" className="w-6 h-6"><path d="M96 64c0-17.7 14.3-32 32-32H448h64c70.7 0 128 57.3 128 128s-57.3 128-128 128H480c0 53-43 96-96 96H192c-53 0-96-43-96-96L96 64zM480 224h32c35.3 0 64-28.7 64-64s-28.7-64-64-64H480V224zM32 416H544c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/></svg>
                </a>
              </div>
              <a
                href="https://portaly.cc/mamahowma/support"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mb-4 px-5 py-2 bg-[#3e5c76] text-white rounded-full text-sm font-bold hover:bg-[#1d2d44] transition-colors shadow"
              >
                喜歡這個免費工具嗎？☕ 請杯咖啡鼓勵我
              </a>
              <p className="text-sm text-gray-500 mb-2">🔡 More English Tools:</p>
              <div className="flex flex-wrap justify-center gap-2 mb-4 px-2">
                <a href="https://jinshuanyu.github.io/Dolch-List-by-spelling-patterns/" target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1.5 bg-[#dbeafe] text-[#1d4ed8] rounded-full text-sm no-underline hover:bg-[#bfdbfe] transition-colors">Dolch 高頻詞拼讀</a>
                <a href="https://jinshuanyu.github.io/word-mapper/" target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1.5 bg-[#dbeafe] text-[#1d4ed8] rounded-full text-sm no-underline hover:bg-[#bfdbfe] transition-colors">英文拼字 x 聲音對照</a>
                <a href="https://jinshuanyu.github.io/englishplaylistsforkids/" target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1.5 bg-[#dbeafe] text-[#1d4ed8] rounded-full text-sm no-underline hover:bg-[#bfdbfe] transition-colors">英語影片片單</a>
                <a href="https://jinshuanyu.github.io/ipa-guide/" target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1.5 bg-[#dbeafe] text-[#1d4ed8] rounded-full text-sm no-underline hover:bg-[#bfdbfe] transition-colors">IPA 音標指南</a>
              </div>
              <p className="text-sm text-gray-500">© 2025 Christina Yu — All Rights Reserved</p>
            </div>
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
                得分：<span className="text-[#3e5c76]">{score}</span> / <span className="text-[#3e5c76]">{shuffledPairsForRound.length * 10}</span>
              </p>
              <p className="text-xl text-[#1d2d44] mt-2">
                題目：<span className="text-[#3e5c76]">{currentQuestionIndex + 1}</span> / {shuffledPairsForRound.length}
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

