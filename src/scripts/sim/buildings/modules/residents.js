import config from "../../../config.js";
import { City } from "../../city.js";
import { Zone as ResidentialZone } from "../../buildings/zones/zone.js";
import { DevelopmentState } from "./development.js";
import { SimModule } from "./simModule.js";

/**
 * Logic for residents moving into and out of a building
 */
export class ResidentsModule extends SimModule {
  /**
   * @type {ResidentialZone}
   */
  #zone;

  /**
   * @type {Citizen[]}
   */
  #residents = 0;

  /**
   * @param {ResidentialZone} zone
   */
  constructor(zone) {
    super();
    this.#zone = zone;
  }

  /**
   * Returns the number of residents
   * @type {number}
   */
  get count() {
    return this.#residents.length;
  }

  /**
   * Maximuim number of residents that can live in this building
   * @returns {number}
   */
  get maximum() {
    return Math.pow(
      config.modules.residents.maxResidents,
      this.#zone.development.level
    );
  }

  /**
   * @param {City} city
   */
  simulate(city) {
    if (this.#zone.development.state === DevelopmentState.developed) {
      this.#residents++;
    }

    for (const resident of this.#residents) {
      resident.simulate(city);
    }
  }

  /**
   * Evicts all residents from the building
   */
  #evictAll() {
    for (const resident of this.#residents) {
      resident.dispose();
    }
    this.#residents = [];
  }

  /**
   * Handles any clean up needed before a building is removed
   */
  dispose() {
    this.#evictAll();
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = `<div class="info-heading">Residents (${
      this.#residents.length
    }/${this.maximum})</div>`;

    html += '<ul class="info-citizen-list">';
    for (const resident of this.#residents) {
      html += resident.toHTML();
    }
    html += "</ul>";

    return html;
  }
}
