import { Language, VoiceSpeed } from '../types';

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private isSupported: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSupported = true;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  private getBestVoiceForLanguage(lang: Language): { voice: SpeechSynthesisVoice | null; bcp47: string } {
    if (this.voices.length === 0) {
      this.loadVoices();
    }

    const bcp47Map: Record<Language, string[]> = {
      as: ['as-IN', 'as', 'bn-IN', 'hi-IN', 'en-IN'],
      bn: ['bn-IN', 'bn-BD', 'bn', 'hi-IN', 'en-IN'],
      hi: ['hi-IN', 'hi', 'en-IN'],
      en: ['en-IN', 'en-GB', 'en-US', 'en'],
    };

    const targetLocales = bcp47Map[lang] || ['en-IN'];
    for (const locale of targetLocales) {
      const match = this.voices.find(v => v.lang && v.lang.toLowerCase().startsWith(locale.toLowerCase()));
      if (match) {
        return { voice: match, bcp47: match.lang || locale };
      }
    }

    return { voice: null, bcp47: targetLocales[0] };
  }

  public speak(
    text: string,
    language: Language = 'en',
    speed: VoiceSpeed = 'normal',
    onEnd?: () => void
  ): boolean {
    if (!this.synth || !this.isSupported || !text || !text.trim()) {
      if (onEnd) setTimeout(onEnd, 1000);
      return false;
    }

    try {
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      utterance.rate = speed === 'slow' ? 0.8 : 1.0;
      utterance.pitch = 1.0;

      const { voice, bcp47 } = this.getBestVoiceForLanguage(language);
      if (voice) {
        utterance.voice = voice;
      }
      utterance.lang = bcp47;

      utterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      this.synth.speak(utterance);
      return true;
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
      if (onEnd) onEnd();
      return false;
    }
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}

export const speechService = new SpeechService();
