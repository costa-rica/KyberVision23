/**
 * Mock for ioredis
 * Prevents real Redis connections during tests
 */

class MockRedis {
  connect = jest.fn().mockResolvedValue(undefined);
  disconnect = jest.fn().mockResolvedValue(undefined);
  quit = jest.fn().mockResolvedValue(undefined);
  get = jest.fn().mockResolvedValue(null);
  set = jest.fn().mockResolvedValue('OK');
  del = jest.fn().mockResolvedValue(1);
  keys = jest.fn().mockResolvedValue([]);
  flushall = jest.fn().mockResolvedValue('OK');
  ping = jest.fn().mockResolvedValue('PONG');
  status = 'ready';

  // Support for event listeners
  on = jest.fn().mockReturnThis();
  once = jest.fn().mockReturnThis();
  off = jest.fn().mockReturnThis();
  emit = jest.fn().mockReturnThis();
}

export default MockRedis;
