import { FuzzyStateWithLine } from "../../elara-lib/pkg/elara_lib";

const DEFAULT_GAME_SPEED = 1; // steps per second

export class Replayer {
  private _states: FuzzyStateWithLine[] = [];
  private _speed = DEFAULT_GAME_SPEED;
  private _timer_id: number | null = null;
  private _index: number = 0;
  private _onStep: (state: FuzzyStateWithLine) => void = () => {};
  private _onDone: () => void = () => {};

  constructor(
    states: FuzzyStateWithLine[],
    onStep: (state: FuzzyStateWithLine) => void,
    onDone: () => void
  ) {
    this._states = states;
    this._onStep = onStep;
    this._onDone = onDone;
  }

  start() {
    if (this._timer_id) {
      return;
    }
    this._timer_id = window.setInterval(() => {
      this.stepForward();
    }, ms_per_step(this._speed));
  }

  stepForward() {
    if (this._index >= this._states.length - 1) {
      this.stop();
      this._onDone();
      return;
    }
    this._index += 1;
    this._onStep(this._states[this._index]);
  }

  stepBackward() {
    if (this._index <= 0) {
      return;
    }
    this._index -= 1;
    this._onStep(this._states[this._index]);
  }

  // Stops the replayer, but does not reset the index.
  pause() {
    if (this._timer_id) {
      window.clearInterval(this._timer_id);
      this._timer_id = null;
    }
  }

  // Stops the replayer and resets the index to 0.
  stop() {
    if (this._timer_id) {
      window.clearInterval(this._timer_id);
      this._timer_id = null;
    }
    this._index = 0;
  }
}

function ms_per_step(speed: number): number {
  return 1000 / speed;
}
