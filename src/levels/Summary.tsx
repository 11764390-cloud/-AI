import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Search, Bot, AlertCircle, Sparkles, RotateCcw } from 'lucide-react';
import { AudioPlayer } from '../components/AudioPlayer';
import { audioManager, SOUND_KEYS } from '../utils/audioManager';

export function Summary({ onComplete, onNext }: { onComplete?: () => void, onNext?: () => void }) {
  useEffect(() => {
    audioManager.playSound(SOUND_KEYS.SUCCESS);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
      <div className="bg-[#1E293B]/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-[#818CF8]/30 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#A3E635]/10 rounded-bl-full -z-10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#4C1D95]/20 rounded-tr-full -z-10 blur-2xl"></div>
        
        <Trophy className="w-24 h-24 text-[#A3E635] mx-auto mb-6 drop-shadow-[0_0_15px_rgba(163,230,53,0.6)]" />
        <h2 className="text-4xl font-black text-white mb-4 drop-shadow-md">恭喜通关！</h2>
        
        <div className="flex justify-center mb-6">
          <AudioPlayer text="恭喜通关！你已经掌握了 AI 的核心秘密！其实刚才玩的游戏，对应的都是大学里真正的 AI 知识哦。包括计算机视觉、大语言模型、AI 幻觉和提示词工程。记住，AI 不是魔法，它是人类编写的超级聪明的程序。掌握了它的原理，你就能成为驾驭 AI 的小主人！" />
        </div>

        <p className="text-lg text-[#E2E8F0] mb-10 max-w-xl mx-auto">
          你已经掌握了 AI 的核心秘密！其实刚才玩的游戏，对应的都是大学里真正的 AI 知识哦。来看看你都学到了什么：
        </p>

        <div className="grid gap-4 text-left max-w-2xl mx-auto">
          <div className="p-5 bg-[#0F172A]/60 rounded-2xl border border-[#475569] flex gap-5 items-center hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:border-[#818CF8]/50 transition-all">
            <div className="p-4 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white rounded-xl shadow-[0_0_10px_rgba(99,102,241,0.4)]"><Search className="w-6 h-6" /></div>
            <div>
              <h3 className="font-bold text-[#C7D2FE] text-lg mb-1">1. 计算机视觉 (Computer Vision)</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">对应第一关：AI 并不像人一样“看”东西，而是通过提取颜色、形状等“特征”来识别图像。</p>
            </div>
          </div>
          
          <div className="p-5 bg-[#0F172A]/60 rounded-2xl border border-[#475569] flex gap-5 items-center hover:shadow-[0_0_15px_rgba(167,139,250,0.2)] hover:border-[#A78BFA]/50 transition-all">
            <div className="p-4 bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-white rounded-xl shadow-[0_0_10px_rgba(167,139,250,0.4)]"><Bot className="w-6 h-6" /></div>
            <div>
              <h3 className="font-bold text-[#E9D5FF] text-lg mb-1">2. 大语言模型 (LLM)</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">对应第二关：ChatGPT 的本质是根据海量的阅读经验，计算概率并进行“超级文字接龙”。</p>
            </div>
          </div>
          
          <div className="p-5 bg-[#0F172A]/60 rounded-2xl border border-[#475569] flex gap-5 items-center hover:shadow-[0_0_15px_rgba(244,114,182,0.2)] hover:border-[#F472B6]/50 transition-all">
            <div className="p-4 bg-gradient-to-br from-[#DB2777] to-[#E11D48] text-white rounded-xl shadow-[0_0_10px_rgba(244,114,182,0.4)]"><AlertCircle className="w-6 h-6" /></div>
            <div>
              <h3 className="font-bold text-[#FBCFE8] text-lg mb-1">3. AI 幻觉 (AI Hallucination)</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">对应第三关：AI 缺乏真实世界的常识，有时会拼凑出看似合理但完全错误的话，所以不能盲目相信它。</p>
            </div>
          </div>
          
          <div className="p-5 bg-[#0F172A]/60 rounded-2xl border border-[#475569] flex gap-5 items-center hover:shadow-[0_0_15px_rgba(163,230,53,0.2)] hover:border-[#A3E635]/50 transition-all">
            <div className="p-4 bg-gradient-to-br from-[#65A30D] to-[#84CC16] text-white rounded-xl shadow-[0_0_10px_rgba(163,230,53,0.4)]"><Sparkles className="w-6 h-6" /></div>
            <div>
              <h3 className="font-bold text-[#D9F99D] text-lg mb-1">4. 提示词工程 (Prompt Engineering)</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">对应第四关：通过“身份+任务+细节”的公式，精准地向 AI 下达指令，让它更好地为你服务。</p>
            </div>
          </div>
        </div>

        <div className="mt-10 p-6 bg-[#0F172A]/90 rounded-2xl text-[#94A3B8] text-base max-w-2xl mx-auto shadow-inner border border-[#334155] relative overflow-hidden">
          {/* 科技感背景 */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#818CF812_1px,transparent_1px),linear-gradient(to_bottom,#818CF812_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <strong className="text-[#A3E635] text-lg block mb-2 drop-shadow-[0_0_5px_rgba(163,230,53,0.5)]">记住：</strong>
            AI 不是魔法，也不是拥有独立意识的“钢铁机器人”，它是人类编写的超级聪明的程序。掌握了它的原理，你就能成为驾驭 AI 的小主人！
          </div>
        </div>
        
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => {
              audioManager.playSound(SOUND_KEYS.CLICK);
              // We need a way to reset the whole app, or just navigate back to level 1.
              // For now, we'll just call onNext if it's provided, or maybe we should pass a specific reset function.
              // Since we don't have a reset function passed in, let's just trigger onNext which might not do anything if it's the last level.
              // Actually, looking at App.tsx, we can just let the user click the sidebar to go back.
              // Or we can add a 'Play Again' button that just re-renders the summary for now, or we can add a reset function to App.tsx.
              // Let's just make it a visual button for now that maybe reloads the page or goes to level 1 if we had a way.
              window.location.reload(); // Simple way to reset the whole experience
            }}
            className="px-8 py-3 bg-[#1E293B] border-2 border-[#475569] text-[#E2E8F0] rounded-full font-bold text-lg hover:bg-[#334155] hover:border-[#818CF8] flex items-center justify-center gap-2 transition-transform hover:scale-105"
          >
            <RotateCcw className="w-5 h-5" /> 重新开始探险
          </button>
        </div>
      </div>
    </motion.div>
  );
}
