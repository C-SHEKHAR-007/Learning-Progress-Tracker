/**
 * Analytics validation schemas
 */
const logProgressSchema = {
    itemId: { required: true, type: "number" },
    progress: { type: "number", min: 0, max: 100 },
    timeSpent: { type: "number" },
};

module.exports = {
    logProgressSchema,
};
