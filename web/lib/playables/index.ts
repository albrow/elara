export type SoundCategory = "sfx" | "music" | "dialog";

export interface Playable {
  /** A unique identifier for the sound. */
  readonly id: string;
  readonly category: SoundCategory;
  /** Plays the sound. If the sound is not currently loaded, automatically loads it. */
  play(): void;
  pause(fadeOut?: number): void;
  stop(fadeOut?: number): void;
  /**
   * Mutes the sound, usually temporarily.
   */
  mute(): void;
  /**
   * Unmutes the sound, setting the game to the sounds base gain * category gain.
   */
  unmute(): void;
  /**
   * Sets the gain for the category this sound belongs to. Overall gain is calculated
   * by multiplying the category gain by the sound's base gain.
   *
   * @param gain A value from 0.0 to 1.0
   */
  setCatGain(gain: number): void;
  isPlaying(): boolean;
  /**
   * Unloads the sound from memory. This is useful for longer sounds and helps
   * cut down on memory usage.
   */
  unload(): void;
}
