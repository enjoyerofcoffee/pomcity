export default class PomodoroTimer {
  constructor({
    taskName = "Unnamed Task",
    workDuration = 25 * 60, // seconds
    shortBreak = 5 * 60,
    longBreak = 15 * 60,
    sessionsBeforeLongBreak = 4,
  } = {}) {
    this.taskName = taskName;
    this.workDuration = workDuration;
    this.shortBreak = shortBreak;
    this.longBreak = longBreak;
    this.sessionsBeforeLongBreak = sessionsBeforeLongBreak;

    // State
    this.mode = "idle"; // "idle" | "work" | "short-break" | "long-break" | "paused" | "awaiting-continue"
    this.isRunning = false;
    this.remainingTime = 0;
    this.currentSession = 0; // counts work sessions started
    this.totalWorkSessions = 0; // counts work sessions completed
    this._interval = null;

    // Continuation suggestion computed at the end of a segment
    this._nextModeSuggestion = null;

    // Optional callbacks
    this.onTick = null; // (remainingSeconds, mode, ctx)
    this.onSegmentStart = null; // (mode, ctx)
    this.onSegmentEnd = null; // (mode, ctx)
    this.onAwaitContinue = null; // (nextMode, ctx) -> prompt UI to call continue()
  }

  // ---------- Public API ----------

  start(taskName) {
    if (
      this.isRunning ||
      this.mode === "paused" ||
      this.mode === "awaiting-continue"
    ) {
      console.warn("Timer already in progress.");
      return;
    }
    if (taskName) this.taskName = taskName;
    this._startWorkSegment(); // always begin with work
  }

  pause() {
    if (!this.isRunning) return;
    clearInterval(this._interval);
    this._interval = null;
    this.isRunning = false;
    this.mode = "paused";
  }

  resume() {
    if (this.mode !== "paused") return;
    this._runTimer(this._onSegmentFinish.bind(this));
    this.isRunning = true;
    // Keep mode as it was before pause; nothing else to do.
  }

  stop() {
    clearInterval(this._interval);
    this._interval = null;
    this.isRunning = false;
    this.mode = "idle";
    this.remainingTime = 0;
  }

  reset() {
    this.stop();
    this.currentSession = 0;
    this.totalWorkSessions = 0;
  }

  /** Proceed with the suggested next mode after onAwaitContinue fires */
  continue() {
    if (this.mode !== "awaiting-continue" || !this._nextModeSuggestion) return;
    const next = this._nextModeSuggestion;
    this._nextModeSuggestion = null;
    if (next === "work") this._startWorkSegment();
    else if (next === "short-break") this._startShortBreak();
    else if (next === "long-break") this._startLongBreak();
  }

  running() {
    return this.isRunning;
  }

  // ---------- Internal helpers ----------

  _startWorkSegment() {
    this.mode = "work";
    this.currentSession += 1;
    this.remainingTime = this.workDuration;
    this._emitStart();
    this._runTimer(this._onSegmentFinish.bind(this));
  }

  _startShortBreak() {
    this.mode = "short-break";
    this.remainingTime = this.shortBreak;
    this._emitStart();
    this._runTimer(this._onSegmentFinish.bind(this));
  }

  _startLongBreak() {
    this.mode = "long-break";
    this.remainingTime = this.longBreak;
    this._emitStart();
    this._runTimer(this._onSegmentFinish.bind(this));
  }

  _runTimer(onEnd) {
    clearInterval(this._interval);
    this.isRunning = true;

    this._interval = setInterval(() => {
      if (!this.isRunning) return;

      this.remainingTime -= 1;
      if (this.remainingTime < 0) this.remainingTime = 0;

      if (this.onTick) this.onTick(this.remainingTime, this.mode, this._ctx());

      if (this.remainingTime === 0) {
        clearInterval(this._interval);
        this._interval = null;
        this.isRunning = false;
        onEnd();
      }
    }, 1000);
  }

  _onSegmentFinish() {
    const finishedMode = this.mode;

    // Update counters
    if (finishedMode === "work") {
      this.totalWorkSessions += 1;
    }

    this._emitEnd();

    // Compute next suggestion but DO NOT auto-continue
    if (finishedMode === "work") {
      const nextIsLong =
        this.currentSession % this.sessionsBeforeLongBreak === 0;
      this._nextModeSuggestion = nextIsLong ? "long-break" : "short-break";
    } else {
      // after any break, suggest work
      this._nextModeSuggestion = "work";
    }

    this.mode = "awaiting-continue";

    if (this.onAwaitContinue) {
      this.onAwaitContinue(this._nextModeSuggestion, this._ctx());
    }
  }

  _emitStart() {
    if (this.onSegmentStart) this.onSegmentStart(this.mode, this._ctx());
  }

  _emitEnd() {
    if (this.onSegmentEnd) this.onSegmentEnd(this.mode, this._ctx());
  }

  _ctx() {
    return {
      taskName: this.taskName,
      currentSession: this.currentSession, // work sessions started (current one if in work)
      totalWorkSessions: this.totalWorkSessions,
      workDuration: this.workDuration,
      shortBreak: this.shortBreak,
      longBreak: this.longBreak,
    };
  }

  // Utility for formatting mm:ss
  static format(seconds) {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }
}
