/**
 * Seed default data
 * Insert default collection
 */

const seed = `
  -- Insert default collection if none exists
  INSERT INTO collections (name, color, icon, order_index)
  VALUES ('General', '#6366f1', 'folder', 0)
  ON CONFLICT (name) DO NOTHING;
`;

module.exports = { seed };
