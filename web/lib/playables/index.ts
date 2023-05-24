export interface Playable {
  play(): void;
  pause(): void;
  stop(): void;
  setGroupGain(gain: number): void;
}
