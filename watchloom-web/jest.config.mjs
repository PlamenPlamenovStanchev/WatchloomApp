import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  clearMocks: true,
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFiles: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "node",
  testMatch: ["<rootDir>/__tests__/**/*.test.ts"],
};

export default createJestConfig(customJestConfig);
