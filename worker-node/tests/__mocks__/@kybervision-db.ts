/**
 * Mock for @kybervision/db
 * Provides stub Sequelize models and initialization functions
 */

// Mock Video model
export const Video = {
  findByPk: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  build: jest.fn(),
};

// Mock sequelize instance
export const sequelize = {
  sync: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
  authenticate: jest.fn().mockResolvedValue(undefined),
  query: jest.fn().mockResolvedValue([]),
  transaction: jest.fn(),
  define: jest.fn(),
};

// Mock initModels function
export const initModels = jest.fn().mockReturnValue(undefined);

// Export other models as needed (currently only Video is used in worker-node)
export default {
  Video,
  sequelize,
  initModels,
};
