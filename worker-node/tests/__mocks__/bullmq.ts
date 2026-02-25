/**
 * Mock for bullmq
 * Provides stub Queue, Worker, and Job classes for tests
 */

let mockJobIdCounter = 1;

export class Queue {
  name: string;
  connection: any;

  constructor(name: string, options?: any) {
    this.name = name;
    this.connection = options?.connection;
  }

  add = jest.fn().mockImplementation((jobName: string, data: any) => {
    const jobId = `mock-job-${mockJobIdCounter++}`;
    return Promise.resolve({
      id: jobId,
      name: jobName,
      data,
      updateProgress: jest.fn().mockResolvedValue(undefined),
      log: jest.fn(),
    });
  });

  close = jest.fn().mockResolvedValue(undefined);
  pause = jest.fn().mockResolvedValue(undefined);
  resume = jest.fn().mockResolvedValue(undefined);
  getJob = jest.fn().mockResolvedValue(null);
  getJobs = jest.fn().mockResolvedValue([]);
}

export class Worker {
  name: string;
  processor: any;
  connection: any;

  constructor(name: string, processor: any, options?: any) {
    this.name = name;
    this.processor = processor;
    this.connection = options?.connection;
  }

  on = jest.fn().mockReturnThis();
  off = jest.fn().mockReturnThis();
  close = jest.fn().mockResolvedValue(undefined);
  pause = jest.fn().mockResolvedValue(undefined);
  resume = jest.fn().mockResolvedValue(undefined);
}

export class Job {
  id: string;
  name: string;
  data: any;

  constructor(name: string, data: any, opts?: any) {
    this.id = opts?.id || `mock-job-${mockJobIdCounter++}`;
    this.name = name;
    this.data = data;
  }

  updateProgress = jest.fn().mockResolvedValue(undefined);
  log = jest.fn();
  remove = jest.fn().mockResolvedValue(undefined);
}

// Reset counter for each test
export const resetMockJobCounter = () => {
  mockJobIdCounter = 1;
};
