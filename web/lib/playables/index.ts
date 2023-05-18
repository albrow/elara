export interface Playable {
  play(): void;
  replay(): void;
  pause(): void;
  stop(): void;
  setGroupGain(gain: number): void;
  load(): void;
  isLoaded(): boolean;
}
