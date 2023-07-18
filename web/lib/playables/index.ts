export type SoundCategory = "sfx" | "music" | "dialog";

export interface Playable {
  readonly id: string;
  readonly category: SoundCategory;
  play(): void;
  pause(): void;
  stop(): void;
  setCatGain(gain: number): void;
}
