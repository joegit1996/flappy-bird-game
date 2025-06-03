/**
 * Sound Manager class for generating and playing game sound effects
 * Uses Web Audio API for self-contained audio generation
 */
export class SoundManager {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    this.initializeAudio();
  }

  /**
   * Initialize Web Audio API
   */
  private initializeAudio(): void {
    try {
      // Create audio context with user gesture handling
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Handle audio context state
      if (this.audioContext.state === 'suspended') {
        // Audio context starts suspended, will be resumed on first user interaction
        document.addEventListener('click', () => this.resumeAudio(), { once: true });
        document.addEventListener('keydown', () => this.resumeAudio(), { once: true });
        document.addEventListener('touchstart', () => this.resumeAudio(), { once: true });
      }
      
      console.log('🔊 Sound Manager initialized');
    } catch (error) {
      console.warn('Audio not supported:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Resume audio context (required for Chrome's autoplay policy)
   */
  private resumeAudio(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
      console.log('🔊 Audio context resumed');
    }
  }

  /**
   * Generate and play jump sound effect
   */
  public playJumpSound(): void {
    if (!this.isEnabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Connect audio nodes
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Jump sound: quick upward sweep
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    // Play sound
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  /**
   * Generate and play star collection sound effect
   */
  public playStarSound(): void {
    if (!this.isEnabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Connect audio nodes
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Star sound: bright chime effect
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.2);
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    // Play sound
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  /**
   * Generate and play crash sound effect
   */
  public playCrashSound(): void {
    if (!this.isEnabled || !this.audioContext) return;

    // Create multiple oscillators for a complex crash sound
    this.createCrashOscillator(150, 0.5, 0.3);
    this.createCrashOscillator(200, 0.4, 0.25);
    this.createCrashOscillator(100, 0.6, 0.2);
    
    // Add noise component
    this.createNoiseForCrash();
  }

  /**
   * Create an oscillator for crash sound
   */
  private createCrashOscillator(frequency: number, volume: number, duration: number): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Crash sound: harsh, descending tone
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + duration);
    
    // Volume envelope
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  /**
   * Create noise component for crash sound
   */
  private createNoiseForCrash(): void {
    if (!this.audioContext) return;

    // Create white noise using a buffer
    const bufferSize = this.audioContext.sampleRate * 0.2; // 200ms of noise
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Fill with white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = this.audioContext.createBufferSource();
    const noiseGain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    // Connect noise chain
    noiseSource.buffer = buffer;
    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.audioContext.destination);
    
    // Filter settings for crash-like noise
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
    
    // Volume envelope for noise
    noiseGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    
    // Play noise
    noiseSource.start(this.audioContext.currentTime);
    noiseSource.stop(this.audioContext.currentTime + 0.2);
  }

  /**
   * Enable or disable sound effects
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`🔊 Sound effects ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if sound is enabled and working
   */
  public isAudioEnabled(): boolean {
    return this.isEnabled && this.audioContext !== null;
  }

  /**
   * Clean up audio resources
   */
  public destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      console.log('🔊 Sound Manager destroyed');
    }
  }
} 