import { Language, VoiceSpeed } from '../types';

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private isSupported: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSupported = true;
    }
  }

  public speak(
    text: string,
    language: Language = 'en',
    speed: VoiceSpeed = 'normal',
    onEnd?: () => void
  ): boolean {
    if (!this.synth || !this.isSupported) {
      if (onEnd) setTimeout(onEnd, 1500);
      return false;
    }

    try {
      this.synth.cancel(); // Stop any ongoing speech

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Rate: Slow = 0.8, Normal = 1.0
      utterance.rate = speed === 'slow' ? 0.8 : 1.0;
      utterance.pitch = 1.0;

      // Map language to BCP-47
      const langMap: Record<Language, string> = {
        en: 'en-IN',
        as: 'as-IN',
        bn: 'bn-IN',
        hi: 'hi-IN',
      };
      utterance.lang = langMap[language] || 'en-IN';

      if (onEnd) {
        utterance.onend = () => {
          this.currentUtterance = null;
          onEnd();
        };
        utterance.onerror = () => {
          this.currentUtterance = null;
          onEnd();
        };
      }

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
