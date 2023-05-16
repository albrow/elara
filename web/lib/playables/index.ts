export interface Playable {
  play(): void;
  replay(): void;
  pause(): void;
  stop(): void;
  unload(): void;
  isLoaded(): boolean;
}
