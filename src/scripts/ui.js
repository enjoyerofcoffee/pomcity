import { Game } from "./game";
import { SimObject } from "./sim/simObject";
import playIconUrl from "/icons/play-color.png";
import pauseIconUrl from "/icons/pause-color.png";
import PomodoroTimer from "./pomodoro";

export class GameUI {
  /**
   * Currently selected tool
   * @type {string}
   */
  activeToolId = "select";
  /**
   * @type {HTMLElement | null }
   */
  selectedControl = document.getElementById("button-select");
  /**
   * True if the game is currently paused
   * @type {boolean}
   */
  isPaused = false;

  nextStep = false;

  pomodoro = null;

  get gameWindow() {
    return document.getElementById("render-target");
  }

  showLoadingText() {
    document.getElementById("loading").style.visibility = "visible";
  }

  hideLoadingText() {
    document.getElementById("loading").style.visibility = "hidden";
  }

  onStart() {
    document.getElementById("start").textContent = "Pause";

    if (this.pomodoro && this.pomodoro.running()) {
      this.pomodoro.pause();
      document.getElementById("start").textContent = "Start";
      return;
    }

    if (!this.pomodoro) {
      this.pomodoro = new PomodoroTimer({
        taskName: "Write blog post",
        workDuration: 5, // short values for testing
        shortBreak: 3,
        longBreak: 7,
        sessionsBeforeLongBreak: 2,
      });

      this.pomodoro.start();
    }

    this.pomodoro.onTick = (remaining, mode) => {
      document.getElementById("time").textContent = remaining;
    };

    this.pomodoro.onSegmentStart = (mode, ctx) => {
      console.log(
        `Started ${mode} for "${ctx.taskName}" (session ${ctx.currentSession})`
      );
    };

    this.pomodoro.onSegmentEnd = (mode, ctx) => {
      console.log(
        `Ended ${mode}. Completed work sessions: ${ctx.totalWorkSessions}`
      );
    };

    this.pomodoro.onAwaitContinue = (nextMode, ctx) => {
      console.log(`Awaiting confirmation… Continue with: ${nextMode}?`);
      // In a real UI, show buttons. For demo, auto-continue after 2s:
      setTimeout(() => timer.continue(), 2000);
    };

    this.pomodoro.resume();
    // You can call timer.pause(), timer.resume(), timer.stop(), timer.reset() from UI controls.
    this.nextStep = true;
  }

  onStop() {
    this.pomodoro.stop();
    document.getElementById("time").textContent = 0;
    delete this.pomodoro;
  }

  /**
   *
   * @param {*} event
   */
  onToolSelected(event) {
    // Deselect previously selected button and selected this one
    if (this.selectedControl) {
      this.selectedControl.classList.remove("selected");
    }
    this.selectedControl = event.target;
    this.selectedControl.classList.add("selected");

    this.activeToolId = this.selectedControl.getAttribute("data-type");
  }

  /**
   * Toggles the pause state of the game
   */
  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      document.getElementById("pause-button-icon").src = playIconUrl;
      document.getElementById("paused-text").style.visibility = "visible";
    } else {
      document.getElementById("pause-button-icon").src = pauseIconUrl;
      document.getElementById("paused-text").style.visibility = "hidden";
    }
  }

  /**
   * Updates the values in the title bar
   * @param {Game} game
   */
  updateTitleBar(game) {
    document.getElementById("city-name").innerHTML = game.city.name;
    document.getElementById("population-counter").innerHTML =
      game.city.population;

    const date = new Date("1/1/2023");
    date.setDate(date.getDate() + game.city.simTime);
    document.getElementById("sim-time").innerHTML = date.toLocaleDateString();
  }

  /**
   * Updates the info panel with the information in the object
   * @param {SimObject} object
   */
  updateInfoPanel(object) {
    const infoElement = document.getElementById("info-panel");
    if (object) {
      infoElement.style.visibility = "visible";
      infoElement.innerHTML = object.toHTML();
    } else {
      infoElement.style.visibility = "hidden";
      infoElement.innerHTML = "";
    }
  }
}

window.ui = new GameUI();
