/**
 * Smoke test - verifies Jest is configured correctly
 */

describe("Jest Configuration", () => {
  it("should run tests successfully", () => {
    expect(true).toBe(true);
  });

  it("should have access to environment variables", () => {
    expect(process.env.NODE_ENV).toBe("testing");
    expect(process.env.NAME_APP).toBe("KyberVision23Queuer-Test");
  });

  it("should support TypeScript", () => {
    const testValue: string = "TypeScript works";
    expect(testValue).toBe("TypeScript works");
  });

  it("should support async/await", async () => {
    const result = await Promise.resolve("async works");
    expect(result).toBe("async works");
  });
});
