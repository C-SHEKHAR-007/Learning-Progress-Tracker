/**
 * Items module index
 */
const routes = require("./item.routes");
const service = require("./item.service");
const controller = require("./item.controller");

module.exports = {
    routes,
    service,
    controller,
};
