/**
 * Analytics module index
 */
const routes = require("./analytics.routes");
const service = require("./analytics.service");
const controller = require("./analytics.controller");

module.exports = {
    routes,
    service,
    controller,
};
