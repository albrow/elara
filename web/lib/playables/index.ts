export type SoundCategory = "sfx" | "music" | "dialog";

export interface Playable {
  readonly id: string;
  readonly category: SoundCategory;
  play(): void;
  pause(fadeIn?: number): void;
  stop(fadeOut?: number): void;
  setCatGain(gain: number): void;
  isPlaying(): boolean;
}
