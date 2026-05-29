import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  clearMocks: true,
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFiles: ["<rootDir>/test/integration/jest.env.ts"],
  setupFilesAfterEnv: ["<rootDir>/test/integration/jest.setup.ts"],
  testEnvironment: "node",
  testMatch: ["<rootDir>/__tests__/integration/**/*.test.ts"],
  testTimeout: 60000,
};

export default createJestConfig(customJestConfig);
