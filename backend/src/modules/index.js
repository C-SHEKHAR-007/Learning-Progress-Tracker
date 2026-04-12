/**
 * Modules Index
 * Exports all module routes for easy registration
 */
const collections = require("./collections");
const items = require("./items");
const analytics = require("./analytics");
const pdf = require("./pdf");
const health = require("./health");

module.exports = {
    collections,
    items,
    analytics,
    pdf,
    health,
};
