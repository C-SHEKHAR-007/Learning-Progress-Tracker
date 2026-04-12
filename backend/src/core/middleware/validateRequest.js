/**
 * Request validation middleware
 * Validates request body, query, and params against schemas
 */
const { ValidationError } = require("../errors");

/**
 * Creates a validation middleware for the specified location
 *
 * @param {Object} schema - Validation schema with validate method (e.g., Joi schema)
 * @param {string} location - Where to validate: 'body', 'query', or 'params'
 * @returns {Function} Express middleware
 *
 * @example
 * const schema = {
 *   name: { required: true, type: 'string' },
 *   color: { type: 'string', default: '#6366f1' }
 * };
 * router.post('/items', validate(schema, 'body'), controller.create);
 */
const validate = (schema, location = "body") => {
  return (req, res, next) => {
    const data = req[location];
    const errors = [];

    // Simple validation (can be replaced with Joi/Yup)
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      // Check required
      if (rules.required && (value === undefined || value === null || value === "")) {
        errors.push({ field, message: `${field} is required` });
        continue;
      }

      // Skip optional undefined fields
      if (value === undefined && !rules.required) {
        continue;
      }

      // Check type
      if (rules.type && value !== undefined) {
        const actualType = Array.isArray(value) ? "array" : typeof value;
        if (actualType !== rules.type) {
          errors.push({ field, message: `${field} must be a ${rules.type}` });
        }
      }

      // Check enum values
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push({ field, message: `${field} must be one of: ${rules.enum.join(", ")}` });
      }

      // Check min/max for numbers
      if (rules.type === "number" && typeof value === "number") {
        if (rules.min !== undefined && value < rules.min) {
          errors.push({ field, message: `${field} must be at least ${rules.min}` });
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push({ field, message: `${field} must be at most ${rules.max}` });
        }
      }

      // Check minLength/maxLength for strings
      if (rules.type === "string" && typeof value === "string") {
        if (rules.minLength !== undefined && value.length < rules.minLength) {
          errors.push({ field, message: `${field} must be at least ${rules.minLength} characters` });
        }
        if (rules.maxLength !== undefined && value.length > rules.maxLength) {
          errors.push({ field, message: `${field} must be at most ${rules.maxLength} characters` });
        }
      }
    }

    if (errors.length > 0) {
      return next(new ValidationError("Validation failed", errors));
    }

    next();
  };
};

/**
 * Shorthand validators for common patterns
 */
const validateBody = (schema) => validate(schema, "body");
const validateQuery = (schema) => validate(schema, "query");
const validateParams = (schema) => validate(schema, "params");

module.exports = { validate, validateBody, validateQuery, validateParams };
