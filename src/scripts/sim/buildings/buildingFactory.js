import { BuildingType } from "./buildingType.js";
import { CommercialZone } from "./zones/commercial.js";
import { ResidentialBuilding } from "./zones/residential.js";
import { IndustrialZone } from "./zones/industrial.js";
import { Road } from "./transportation/road.js";
import { Building } from "./building.js";

/**
 * Creates a new building object
 * @param {number} x The x-coordinate of the building
 * @param {number} y The y-coordinate of the building
 * @param {string} type The building type
 * @returns {Building} A new building object
 */
export function createBuilding(x, y, type) {
  switch (type) {
    case BuildingType.residential:
      return new ResidentialBuilding();
    case BuildingType.commercial:
      return new CommercialZone();
    case BuildingType.industrial:
      return new IndustrialZone();
    case BuildingType.road:
      return new Road();
    default:
      console.error(`${type} is not a recognized building type.`);
  }
}
