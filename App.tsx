import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Star, Bot, Sparkles, AlertCircle, Search, CheckCircle2, Trophy, ArrowRight, MonitorSmartphone, Volume2, Square, Loader2 } from 'lucide-react';
import { generateSpeech } from './services/ttsService';

type LevelId = 'level1' | 'level2' | 'level3' | 'level4' | 'summary';

export default function App() {
  const [activeLevel, setActiveLevel] = useState<LevelId>('level1');
  const [stars, setStars] = useState<Record<string, boolean>>({});

  const unlockStar = (level: string) => {
    if (!stars[level]) {
      setStars(prev => ({ ...prev, [level]: true }));
    }
  };

  const levels = [
    { id: 'level1', title: '第一关：AI 的眼睛', subtitle: 'AI 是怎么认出苹果的？', icon: <Search className="w-6 h-6" /> },
    { id: 'level2', title: '第二关：超级文字接龙', subtitle: 'ChatGPT 是怎么说话的？', icon: <Bot className="w-6 h-6" /> },
    { id: 'level3', title: '第三关：AI 的小迷糊', subtitle: '为什么 AI 会一本正经地胡说八道？', icon: <AlertCircle className="w-6 h-6" /> },
    { id: 'level4', title: '第四关：魔法咒语', subtitle: '怎么让 AI 听你的话？', icon: <Sparkles className="w-6 h-6" /> },
    { id: 'summary', title: '探险总结', subtitle: '你都学到了什么？', icon: <Trophy className="w-6 h-6" /> },
  ];

  const totalStars = Object.keys(stars).length;

  return (
    <div className="min-h-screen bg-indigo-50 text-slate-800 font-sans flex flex-col md:flex-row overflow-hidden">
      {/* 侧边栏导航 */}
      <aside className="w-full md:w-80 bg-white border-r border-indigo-100 flex flex-col shadow-lg z-10">
        <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-3xl">
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="w-8 h-8 text-yellow-300" />
            <h1 className="text-2xl font-black tracking-wider">AI 奇妙探险</h1>
          </div>
          <div className="bg-white/20 rounded-xl p-3 flex items-center justify-between backdrop-blur-sm">
            <span className="font-medium">我的星星：</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(i => (
                <Star key={i} className={`w-6 h-6 ${i <= totalStars ? 'fill-yellow-400 text-yellow-400' : 'text-white/30'}`} />
              ))}
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-3 overflow-y-auto mt-4">
          {levels.map((level) => {
            // 如果是总结页，且还没有集齐4颗星，则不在侧边栏显示，作为隐藏奖励
            if (level.id === 'summary' && totalStars < 4) return null;

            const isActive = activeLevel === level.id;
            const isCompleted = stars[level.id] || (level.id === 'summary' && totalStars === 4);
            
            return (
              <button
                key={level.id}
                onClick={() => setActiveLevel(level.id as LevelId)}
                className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border-2 relative overflow-hidden group ${
                  isActive 
                    ? 'bg-indigo-50 border-indigo-400 shadow-md transform scale-[1.02]' 
                    : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-500'}`}>
                    {level.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {level.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{level.subtitle}</p>
                  </div>
                  {isCompleted && level.id !== 'summary' && (
                    <div className="absolute top-4 right-4 text-yellow-500">
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div className="max-w-3xl mx-auto pb-20">
          <AnimatePresence mode="wait">
            {activeLevel === 'level1' && <Level1 key="l1" onComplete={() => unlockStar('level1')} onNext={() => setActiveLevel('level2')} />}
            {activeLevel === 'level2' && <Level2 key="l2" onComplete={() => unlockStar('level2')} onNext={() => setActiveLevel('level3')} />}
            {activeLevel === 'level3' && <Level3 key="l3" onComplete={() => unlockStar('level3')} onNext={() => setActiveLevel('level4')} />}
            {activeLevel === 'level4' && <Level4 key="l4" onComplete={() => unlockStar('level4')} onNext={() => setActiveLevel('summary')} />}
            {activeLevel === 'summary' && <Summary key="summary" />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- 语音播放组件 ---
function AudioPlayer({ text }: { text: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const handlePlay = async () => {
    if (isPlaying) {
      sourceNodeRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    const base64 = await generateSpeech(text);
    setIsLoading(false);

    if (base64) {
      try {
        // Gemini TTS returns raw PCM data (24000Hz, 1 channel, 16-bit)
        // We need to convert base64 to ArrayBuffer, then decode it manually
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Create AudioContext if not exists
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;

        // Convert 16-bit PCM to Float32Array
        const int16Array = new Int16Array(bytes.buffer);
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
          float32Array[i] = int16Array[i] / 32768.0;
        }

        // Create AudioBuffer (24000Hz sample rate is standard for Gemini TTS)
        const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
        audioBuffer.getChannelData(0).set(float32Array);

        // Play the buffer
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
        
        sourceNodeRef.current = source;
        setIsPlaying(true);
      } catch (e) {
        console.error("Audio play failed:", e);
        alert("音频播放失败。");
        setIsPlaying(false);
      }
    } else {
      alert("语音生成失败，请稍后再试。");
    }
  };

  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <button 
      onClick={handlePlay}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors mb-6 ${
        isPlaying ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 
        'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
      }`}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 
       isPlaying ? <Square className="w-4 h-4 fill-current" /> : 
       <Volume2 className="w-4 h-4" />}
      {isLoading ? '正在生成语音...' : isPlaying ? '停止播放' : '听听讲解'}
    </button>
  );
}

// --- 关卡 1：特征识别 ---
function Level1({ onComplete, onNext }: { onComplete: () => void, onNext: () => void }) {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  const features = [
    { id: 'red', label: '红彤彤的', color: 'bg-red-100 text-red-700 border-red-300' },
    { id: 'round', label: '圆圆的', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { id: 'sweet', label: '吃起来脆甜', color: 'bg-green-100 text-green-700 border-green-300' },
    { id: 'long', label: '长条形的', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { id: 'furry', label: '毛茸茸的', color: 'bg-stone-100 text-stone-700 border-stone-300' },
  ];

  const toggleFeature = (id: string) => {
    if (selectedFeatures.includes(id)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== id));
    } else {
      setSelectedFeatures([...selectedFeatures, id]);
    }
  };

  const isApple = selectedFeatures.includes('red') && selectedFeatures.includes('round') && selectedFeatures.includes('sweet') && !selectedFeatures.includes('long') && !selectedFeatures.includes('furry');
  
  if (isApple) {
    setTimeout(onComplete, 500);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10"></div>
        
        <h2 className="text-3xl font-black text-indigo-900 mb-4 flex items-center gap-3">
          <Search className="w-8 h-8 text-indigo-500" />
          AI 的眼睛
        </h2>
        
        <AudioPlayer text="很多人以为 AI 是长着手脚的铁皮机器人，其实不是哦！AI 是一段运行在电脑里的超级程序。人类看一眼就知道那是苹果，但 AI 程序没有真正的眼睛。它是通过寻找线索来猜东西的！请你帮 AI 挑出正确的线索，让它猜出苹果！" />

        <div className="prose prose-lg text-slate-600 mb-8">
          <p>
            很多人以为 AI 是长着手脚的“铁皮机器人”，其实不是哦！<strong>AI（人工智能）是一段运行在电脑里的超级程序</strong>。
          </p>
          <p>
            人类看一眼就知道那是“苹果”，但 AI 程序没有真正的眼睛。
            它是通过寻找<strong>“线索（特征）”</strong>来猜东西的！
          </p>
          <p className="font-bold text-indigo-600">
            任务：请你帮 AI 挑出正确的线索，让它猜出“苹果”！
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8">
          <h3 className="font-bold text-slate-700 mb-4">点击选择线索：</h3>
          <div className="flex flex-wrap gap-3">
            {features.map(f => (
              <button
                key={f.id}
                onClick={() => toggleFeature(f.id)}
                className={`px-6 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 border-2 ${
                  selectedFeatures.includes(f.id) 
                    ? `${f.color} shadow-md ring-4 ring-indigo-200` 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-8 bg-indigo-50 rounded-2xl border-2 border-dashed border-indigo-200 min-h-[200px]">
          {isApple ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center w-full">
              <div className="text-8xl mb-4">🍎</div>
              <h3 className="text-2xl font-black text-green-600 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-8 h-8" />
                太棒了！AI 认出苹果了！
              </h3>
              <p className="text-slate-600 mt-2 mb-6">这就是 AI 的“图像识别”原理哦！</p>
              <motion.button
                onClick={onNext}
                className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 flex items-center justify-center gap-2 mx-auto transition-transform hover:scale-105 shadow-lg"
              >
                进入下一关 <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          ) : (
            <div className="text-center text-slate-400">
              <MonitorSmartphone className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">AI 程序正在思考中...</p>
              <p className="text-sm mt-2">（提示：苹果是什么颜色？什么形状？什么味道？）</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// --- 关卡 2：文字接龙 ---
function Level2({ onComplete, onNext }: { onComplete: () => void, onNext: () => void }) {
  const [sentence, setSentence] = useState<string[]>(['从前']);
  
  const options: Record<string, { word: string, isGood: boolean }[]> = {
    '从前': [
      { word: '有座山', isGood: true },
      { word: '有个手机', isGood: false },
      { word: '有只小猪', isGood: true },
    ],
    '有座山': [
      { word: '山里有个庙', isGood: true },
      { word: '山里有外星人', isGood: false },
    ],
    '有只小猪': [
      { word: '它爱吃蛋糕', isGood: true },
      { word: '它会开飞机', isGood: false },
    ],
    '山里有个庙': [
      { word: '庙里有个老和尚', isGood: true },
    ],
    '它爱吃蛋糕': [
      { word: '变成了一个胖子', isGood: true },
    ]
  };

  const currentWord = sentence[sentence.length - 1];
  const currentOptions = options[currentWord] || [];
  
  const handleSelect = (word: string) => {
    const newSentence = [...sentence, word];
    setSentence(newSentence);
    if (newSentence.length >= 4) {
      setTimeout(onComplete, 500);
    }
  };

  const reset = () => setSentence(['从前']);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-purple-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -z-10"></div>
        
        <h2 className="text-3xl font-black text-purple-900 mb-4 flex items-center gap-3">
          <Bot className="w-8 h-8 text-purple-500" />
          超级文字接龙
        </h2>
        
        <AudioPlayer text="你知道吗？像 ChatGPT 这么聪明的 AI，它其实是在玩一个超级高级的文字接龙游戏！它读了人类写过的无数本书，所以它能猜出下一句话最可能是什么。假装你是 AI，根据前面的词，选出最合理的下一个词，编一个故事！" />

        <div className="prose prose-lg text-slate-600 mb-8">
          <p>
            你知道吗？像 ChatGPT 这么聪明的 AI，它其实是在玩一个超级高级的<strong>“文字接龙”</strong>游戏！
            它读了人类写过的无数本书，所以它能猜出下一句话最可能是什么。
          </p>
          <p className="font-bold text-purple-600">
            任务：假装你是 AI，根据前面的词，选出最合理的下一个词，编一个故事！
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl shadow-inner mb-8 min-h-[120px] flex items-center flex-wrap gap-2">
          {sentence.map((word, idx) => (
            <motion.span 
              initial={{ scale: 0 }} animate={{ scale: 1 }} 
              key={idx} 
              className="text-2xl font-bold text-white bg-purple-600 px-4 py-2 rounded-xl"
            >
              {word}
            </motion.span>
          ))}
          {currentOptions.length > 0 && (
            <span className="inline-block w-4 h-8 bg-purple-400 animate-pulse ml-2 rounded-full"></span>
          )}
        </div>

        {currentOptions.length > 0 ? (
          <div>
            <h3 className="font-bold text-slate-700 mb-4">AI 预测下一个词可能是：</h3>
            <div className="flex flex-wrap gap-4">
              {currentOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(opt.word)}
                  className="px-6 py-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-xl font-bold text-xl text-purple-800 transition-transform transform hover:-translate-y-1 shadow-sm"
                >
                  {opt.word}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center bg-green-50 p-6 rounded-2xl border-2 border-green-200 w-full">
            <h3 className="text-2xl font-black text-green-600 mb-2 flex items-center justify-center gap-2">
              <Trophy className="w-8 h-8" />
              故事编完啦！
            </h3>
            <p className="text-slate-600 mb-6">大语言模型（LLM）就是这样，一个词一个词蹦出来的！</p>
            <div className="flex justify-center gap-4">
              <button onClick={reset} className="px-6 py-3 bg-white border-2 border-slate-200 rounded-full font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                再玩一次
              </button>
              <button onClick={onNext} className="px-8 py-3 bg-purple-600 text-white rounded-full font-bold text-lg hover:bg-purple-700 flex items-center gap-2 transition-transform hover:scale-105 shadow-lg">
                进入下一关 <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// --- 关卡 3：AI 的局限 ---
function Level3({ onComplete, onNext }: { onComplete: () => void, onNext: () => void }) {
  const [foundMistake, setFoundMistake] = useState(false);

  const handleFindMistake = () => {
    setFoundMistake(true);
    setTimeout(onComplete, 500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-amber-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10"></div>
        
        <h2 className="text-3xl font-black text-amber-900 mb-4 flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-amber-500" />
          AI 的小迷糊
        </h2>
        
        <AudioPlayer text="AI 虽然读了很多书，但它没有真正在现实世界生活过。它不知道火是烫的，水是湿的。所以有时候，它会一本正经地胡说八道。下面是 AI 写的一篇日记，里面有一个人类绝对不会犯的常识错误，请把它找出来并点击它！" />

        <div className="prose prose-lg text-slate-600 mb-8">
          <p>
            AI 虽然读了很多书，但它<strong>没有真正在现实世界生活过</strong>。它不知道火是烫的，水是湿的。
            所以有时候，它会一本正经地胡说八道（科学家管这叫“AI 幻觉”）。
          </p>
          <p className="font-bold text-amber-600">
            任务：下面是 AI 写的一篇日记，里面有一个人类绝对不会犯的常识错误，请把它找出来并点击它！
          </p>
        </div>

        <div className="bg-amber-50 p-8 rounded-2xl border-2 border-amber-200 text-lg leading-loose text-slate-700 font-medium">
          今天天气真好，我决定去公园散步。
          公园里的花都开了，非常漂亮。
          走着走着我有点渴了，
          <button 
            onClick={handleFindMistake}
            className={`inline-block mx-1 transition-all ${foundMistake ? 'bg-red-500 text-white px-2 rounded-lg scale-110 shadow-lg' : 'hover:bg-amber-200 px-1 rounded cursor-pointer'}`}
          >
            于是我拿起一块石头，咕咚咕咚喝了下去。
          </button>
          喝完之后感觉好多了，我又继续开心地散步。
        </div>

        {foundMistake && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-6 bg-green-50 rounded-2xl border-2 border-green-200 text-center">
            <h3 className="text-2xl font-black text-green-600 mb-2">
              找对啦！石头怎么能喝呢！
            </h3>
            <p className="text-slate-600 mb-6">
              因为 AI 只是在做“文字接龙”，它发现“渴了”后面经常跟着“喝”，但它不理解“石头”是不能喝的。
              <br/><strong>所以，我们不能盲目相信 AI，要用我们人类的聪明大脑去判断！</strong>
            </p>
            <button onClick={onNext} className="px-8 py-3 bg-amber-600 text-white rounded-full font-bold text-lg hover:bg-amber-700 flex items-center justify-center gap-2 mx-auto transition-transform hover:scale-105 shadow-lg">
              进入下一关 <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// --- 关卡 4：提示词工程 ---
function Level4({ onComplete, onNext }: { onComplete: () => void, onNext: () => void }) {
  const [role, setRole] = useState('');
  const [task, setTask] = useState('');
  const [detail, setDetail] = useState('');

  const isComplete = role !== '' && task !== '' && detail !== '';

  if (isComplete) {
    setTimeout(onComplete, 500);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-emerald-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10"></div>
        
        <h2 className="text-3xl font-black text-emerald-900 mb-4 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-emerald-500" />
          魔法咒语（提示词）
        </h2>
        
        <AudioPlayer text="想让 AI 帮你做事，你需要学会念魔法咒语，也就是提示词。咒语越清晰，AI 做得越好！一个完美的咒语通常包含三部分：身份，任务，和细节。拼凑一个完美的咒语，让 AI 帮你写一篇有趣的作文！" />

        <div className="prose prose-lg text-slate-600 mb-8">
          <p>
            想让 AI 帮你做事，你需要学会念“魔法咒语”（Prompt 提示词）。
            咒语越清晰，AI 做得越好！一个完美的咒语通常包含三部分：<strong>身份 + 任务 + 细节</strong>。
          </p>
          <p className="font-bold text-emerald-600">
            任务：拼凑一个完美的咒语，让 AI 帮你写一篇有趣的作文！
          </p>
        </div>

        <div className="space-y-6">
          {/* 身份 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-3">1. 给 AI 分配一个身份：</h3>
            <div className="flex gap-3">
              {['你是一个童话作家', '你是一个严厉的老师'].map(opt => (
                <button 
                  key={opt} onClick={() => setRole(opt)}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${role === opt ? 'bg-emerald-500 text-white shadow-md' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 任务 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-3">2. 告诉它要做什么任务：</h3>
            <div className="flex gap-3">
              {['请帮我写一个关于恐龙的故事', '请帮我做数学题'].map(opt => (
                <button 
                  key={opt} onClick={() => setTask(opt)}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${task === opt ? 'bg-emerald-500 text-white shadow-md' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 细节 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-3">3. 补充具体的要求（细节）：</h3>
            <div className="flex gap-3">
              {['字数在100字左右，要好笑一点', '用文言文写'].map(opt => (
                <button 
                  key={opt} onClick={() => setDetail(opt)}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${detail === opt ? 'bg-emerald-500 text-white shadow-md' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 结果展示 */}
        <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-white shadow-inner">
          <h3 className="text-emerald-400 font-bold mb-2 text-sm uppercase tracking-wider">你合成的魔法咒语：</h3>
          <p className="text-xl leading-relaxed">
            {role ? <span className="text-blue-300">[{role}]</span> : <span className="text-slate-600">[身份]</span>}，
            {task ? <span className="text-yellow-300">[{task}]</span> : <span className="text-slate-600">[任务]</span>}，
            {detail ? <span className="text-pink-300">[{detail}]</span> : <span className="text-slate-600">[细节要求]</span>}。
          </p>
          
          {isComplete && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 pt-6 border-t border-slate-700 text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold mb-4">
                <Bot className="w-5 h-5" /> AI 的回答：
              </div>
              <p className="text-slate-300 italic mb-6">
                "没问题！从前有一只霸王龙，它因为手太短，永远没法给自己挠痒痒，结果每天都在树干上蹭来蹭去，跳起了搞笑的街舞..."
              </p>
              <div className="mb-6 text-emerald-400 font-black text-xl">
                恭喜你！掌握了驾驭 AI 的魔法！🎉
              </div>
              <button onClick={onNext} className="px-8 py-3 bg-emerald-500 text-white rounded-full font-bold text-lg hover:bg-emerald-600 flex items-center justify-center gap-2 mx-auto transition-transform hover:scale-105 shadow-lg shadow-emerald-500/30">
                查看探险总结 <Trophy className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// --- 探险总结 ---
function Summary() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-yellow-200 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50 rounded-bl-full -z-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-50 rounded-tr-full -z-10"></div>
        
        <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6 drop-shadow-md" />
        <h2 className="text-4xl font-black text-slate-800 mb-4">恭喜通关！</h2>
        
        <div className="flex justify-center mb-6">
          <AudioPlayer text="恭喜通关！你已经掌握了 AI 的核心秘密！其实刚才玩的游戏，对应的都是大学里真正的 AI 知识哦。包括计算机视觉、大语言模型、AI 幻觉和提示词工程。记住，AI 不是魔法，它是人类编写的超级聪明的程序。掌握了它的原理，你就能成为驾驭 AI 的小主人！" />
        </div>

        <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto">
          你已经掌握了 AI 的核心秘密！其实刚才玩的游戏，对应的都是大学里真正的 AI 知识哦。来看看你都学到了什么：
        </p>

        <div className="grid gap-4 text-left max-w-2xl mx-auto">
          <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-5 items-center hover:shadow-md transition-shadow">
            <div className="p-4 bg-indigo-500 text-white rounded-xl shadow-inner"><Search className="w-6 h-6" /></div>
            <div>
              <h3 className="font-bold text-indigo-900 text-lg mb-1">1. 计算机视觉 (Computer Vision)</h3>
              <p className="text-slate-600 text-sm leading-relaxed">对应第一关：AI 并不像人一样“看”东西，而是通过提取颜色、形状等“特征”来识别图像。</p>
            </div>
          </div>
          
          <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 flex gap-5 items-center hover:shadow-md transition-shadow">
            <div className="p-4 bg-purple-500 text-white rounded-xl shadow-inner"><Bot className="w-6 h-6" /></div>
            <div>
              <h3 className="font-bold text-purple-900 text-lg mb-1">2. 大语言模型 (LLM)</h3>
              <p className="text-slate-600 text-sm leading-relaxed">对应第二关：ChatGPT 的本质是根据海量的阅读经验，计算概率并进行“超级文字接龙”。</p>
            </div>
          </div>
          
          <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex gap-5 items-center hover:shadow-md transition-shadow">
            <div className="p-4 bg-amber-500 text-white rounded-xl shadow-inner"><AlertCircle className="w-6 h-6" /></div>
            <div>
              <h3 className="font-bold text-amber-900 text-lg mb-1">3. AI 幻觉 (AI Hallucination)</h3>
              <p className="text-slate-600 text-sm leading-relaxed">对应第三关：AI 缺乏真实世界的常识，有时会拼凑出看似合理但完全错误的话，所以不能盲目相信它。</p>
            </div>
          </div>
          
          <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-5 items-center hover:shadow-md transition-shadow">
            <div className="p-4 bg-emerald-500 text-white rounded-xl shadow-inner"><Sparkles className="w-6 h-6" /></div>
            <div>
              <h3 className="font-bold text-emerald-900 text-lg mb-1">4. 提示词工程 (Prompt Engineering)</h3>
              <p className="text-slate-600 text-sm leading-relaxed">对应第四关：通过“身份+任务+细节”的公式，精准地向 AI 下达指令，让它更好地为你服务。</p>
            </div>
          </div>
        </div>

        <div className="mt-10 p-6 bg-slate-800 rounded-2xl text-slate-300 text-base max-w-2xl mx-auto shadow-inner">
          <strong className="text-white text-lg block mb-2">记住：</strong>
          AI 不是魔法，也不是拥有独立意识的“钢铁机器人”，它是人类编写的超级聪明的程序。掌握了它的原理，你就能成为驾驭 AI 的小主人！
        </div>
      </div>
    </motion.div>
  );
}
