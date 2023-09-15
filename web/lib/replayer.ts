import { StateWithLines } from "../../elara-lib/pkg/elara_lib";
import { DEFAULT_GAME_SPEED } from "./constants";

function msPerStep(speed: number): number {
  return 1000 / speed;
}

export class Replayer {
  private states: StateWithLines[] = [];

  private speed = DEFAULT_GAME_SPEED;

  private timer_id: number | null = null;

  private index: number = 0;

  // eslint-disable-next-line class-methods-use-this
  private onStep: (stepIndex: number, state: StateWithLines) => void = () => {};

  // eslint-disable-next-line class-methods-use-this
  private onDone: () => void = () => {};

  constructor(
    states: StateWithLines[],
    onStep: (stepIndex: number, state: StateWithLines) => void,
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
    this.onStep(this.index, this.states[this.index]);
  }

  stepBackward() {
    if (this.index <= 0) {
      return;
    }
    this.index -= 1;
    this.onStep(this.index, this.states[this.index]);
  }

  goToStep(index: number) {
    this.pause();
    if (index < 0 || index >= this.states.length) {
      throw new Error(
        `goToStep called with invalid index: ${index} (max should be this${
          this.states.length - 1
        })`
      );
    }
    this.index = index;
    this.onStep(this.index, this.states[this.index]);
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
