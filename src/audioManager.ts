// 音频管理器：用于统一管理背景音乐、音效和预生成的语音解说
export const SOUND_KEYS = {
  HOVER: 'hover',
  CLICK: 'click',
  SUCCESS: 'success',
  GENERATING: 'generating',
  GENERATED: 'generated',
};

class AudioManager {
  private static instance: AudioManager;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private bgm: HTMLAudioElement | null = null;
  private isMuted: boolean = false;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // 初始化音效（等待用户提供 GitHub 链接后填入）
  public initSounds(urls: Record<string, string>) {
    Object.entries(urls).forEach(([key, url]) => {
      this.loadSound(key, url);
    });
  }

  // 预加载音效
  public loadSound(id: string, url: string) {
    if (!this.sounds.has(id) && url) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      this.sounds.set(id, audio);
    }
  }

  // 播放短音效（点击、成功、失败等）
  public playSound(id: string, volume: number = 1.0) {
    if (this.isMuted) return;
    const sound = this.sounds.get(id);
    if (sound) {
      sound.volume = volume;
      sound.currentTime = 0;
      sound.play().catch(e => console.warn(`Audio play prevented for ${id}:`, e));
    } else {
      console.log(`[AudioManager] Sound '${id}' triggered but no URL loaded yet.`);
    }
  }

  // 播放背景音乐（循环）
  public playBGM(url: string, volume: number = 0.3) {
    if (this.bgm) {
      this.bgm.pause();
    }
    this.bgm = new Audio(url);
    this.bgm.loop = true;
    this.bgm.volume = volume;
    if (!this.isMuted) {
      this.bgm.play().catch(e => console.warn('BGM play prevented:', e));
    }
  }

  public stopBGM() {
    if (this.bgm) {
      this.bgm.pause();
      this.bgm.currentTime = 0;
    }
  }

  // 播放预生成的语音解说
  public playVoiceover(url: string, onEnded?: () => void): HTMLAudioElement {
    const voice = new Audio(url);
    if (!this.isMuted) {
      voice.play().catch(e => console.warn('Voiceover play prevented:', e));
    }
    if (onEnded) {
      voice.onended = onEnded;
    }
    return voice;
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.bgm) {
      this.bgm.muted = this.isMuted;
    }
    return this.isMuted;
  }
}

export const audioManager = AudioManager.getInstance();
