/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @returns {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor Sheet Partials
    "systems/fate_v2/templates/actors/parts/actor-warnings.html",

    "systems/fate_v2/templates/actors/parts/actor-inventory.html",

    // Item Sheet Partials
    "systems/fate_v2/templates/items/parts/item-description.html",
    "systems/fate_v2/templates/items/parts/attribute-description.html"
  ]);
};
