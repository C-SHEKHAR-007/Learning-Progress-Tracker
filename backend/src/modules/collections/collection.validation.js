/**
 * Collection validation schemas
 */
const createCollectionSchema = {
  name: { required: true, type: "string", minLength: 1, maxLength: 100 },
  color: { type: "string" },
  icon: { type: "string" },
};

const updateCollectionSchema = {
  name: { type: "string", minLength: 1, maxLength: 100 },
  color: { type: "string" },
  icon: { type: "string" },
};

const reorderCollectionsSchema = {
  collections: { required: true, type: "array" },
};

module.exports = {
  createCollectionSchema,
  updateCollectionSchema,
  reorderCollectionsSchema,
};
