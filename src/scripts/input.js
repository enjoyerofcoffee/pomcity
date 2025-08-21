/**
 * Manages mouse and keyboard input
 */
export class InputManager {
  /**
   * Last mouse position
   * @type {x: number, y: number}
   */
  mouse = { x: 0, y: 0 };
  /**
   * True if left mouse button is currently down
   * @type {boolean}
   */
  isLeftMouseDown = false;
  /**
   * True if the middle mouse button is currently down
   * @type {boolean}
   */
  isMiddleMouseDown = false;
  /**
   * True if the right mouse button is currently down
   * @type {boolean}
   */
  isRightMouseDown = false;

  keyboardMovement = { w: false, a: false, s: false, d: false };
  arrowMovement = { up: false, down: false, left: false, right: false };

  constructor() {
    window.ui.gameWindow.addEventListener(
      "mousedown",
      this.#onMouseDown.bind(this),
      false
    );
    window.ui.gameWindow.addEventListener(
      "mouseup",
      this.#onMouseUp.bind(this),
      false
    );
    window.ui.gameWindow.addEventListener(
      "mousemove",
      this.#onMouseMove.bind(this),
      false
    );
    window.document.addEventListener(
      "keydown",
      this.#onKeyDown.bind(this),
      false
    );
    window.document.addEventListener("keyup", this.#onKeyUp.bind(this), false);
    window.ui.gameWindow.addEventListener(
      "contextmenu",
      (event) => event.preventDefault(),
      false
    );
  }

  /**
   * Event handler for `mousedown` event
   * @param {MouseEvent} event
   */
  #onMouseDown(event) {
    if (event.button === 0) {
      this.isLeftMouseDown = true;
    }
    if (event.button === 1) {
      this.isMiddleMouseDown = true;
    }
    if (event.button === 2) {
      this.isRightMouseDown = true;
    }
  }

  /**
   * Event handler for `mouseup` event
   * @param {MouseEvent} event
   */
  #onMouseUp(event) {
    if (event.button === 0) {
      this.isLeftMouseDown = false;
    }
    if (event.button === 1) {
      this.isMiddleMouseDown = false;
    }
    if (event.button === 2) {
      this.isRightMouseDown = false;
    }
  }

  /**
   * Event handler for 'mousemove' event
   * @param {MouseEvent} event
   */
  #onMouseMove(event) {
    this.isLeftMouseDown = event.buttons & 1;
    this.isRightMouseDown = event.buttons & 2;
    this.isMiddleMouseDown = event.buttons & 4;
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
  }

  #onKeyDown(event) {
    const key = event.key;
    switch (key) {
      case "w":
        this.keyboardMovement = { ...this.keyboardMovement, w: true };
        break;
      case "a":
        this.keyboardMovement = { ...this.keyboardMovement, a: true };
        break;
      case "s":
        this.keyboardMovement = { ...this.keyboardMovement, s: true };
        break;
      case "d":
        this.keyboardMovement = { ...this.keyboardMovement, d: true };
        break;
      default:
        this.keyboardMovement = { w: false, a: false, s: false, d: false };
        break;
    }
  }

  #onKeyUp(event) {
    const key = event.key;

    switch (key) {
      case "w":
        this.keyboardMovement = { ...this.keyboardMovement, w: false };
        break;
      case "a":
        this.keyboardMovement = { ...this.keyboardMovement, a: false };
        break;
      case "s":
        this.keyboardMovement = { ...this.keyboardMovement, s: false };
        break;
      case "d":
        this.keyboardMovement = { ...this.keyboardMovement, d: false };
        break;
      default:
        this.keyboardMovement = { w: true, a: true, s: true, d: true };
        break;
    }
  }
}
