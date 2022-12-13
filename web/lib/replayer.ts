import { FuzzyStateWithLine } from "../../elara-lib/pkg/elara_lib";

const DEFAULT_GAME_SPEED = 1; // steps per second

function msPerStep(speed: number): number {
  return 1000 / speed;
}

export class Replayer {
  private states: FuzzyStateWithLine[] = [];

  private speed = DEFAULT_GAME_SPEED;

  private timer_id: number | null = null;

  private index: number = 0;

  // eslint-disable-next-line class-methods-use-this
  private onStep: (state: FuzzyStateWithLine) => void = () => {};

  // eslint-disable-next-line class-methods-use-this
  private onDone: () => void = () => {};

  constructor(
    states: FuzzyStateWithLine[],
    onStep: (state: FuzzyStateWithLine) => void,
    onDone: () => void
  ) {
    this.states = states;
    this.onStep = onStep;
    this.onDone = onDone;
  }

  start() {
    if (this.timer_id) {
      return;
    }
    this.timer_id = window.setInterval(() => {
      this.stepForward();
    }, msPerStep(this.speed));
  }

  stepForward() {
    if (this.index >= this.states.length - 1) {
      this.stop();
      this.onDone();
      return;
    }
    this.index += 1;
    this.onStep(this.states[this.index]);
  }

  stepBackward() {
    if (this.index <= 0) {
      return;
    }
    this.index -= 1;
    this.onStep(this.states[this.index]);
  }

  // Stops the replayer, but does not reset the index.
  pause() {
    if (this.timer_id) {
      window.clearInterval(this.timer_id);
      this.timer_id = null;
    }
  }

  // Stops the replayer and resets the index to 0.
  stop() {
    if (this.timer_id) {
      window.clearInterval(this.timer_id);
      this.timer_id = null;
    }
    this.index = 0;
  }
}
