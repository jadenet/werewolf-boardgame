module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/*.test.[jt]s?(x)"],
  setupFilesAfterEnv: ["<rootDir>/src/jest.setup.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          target: "ES2020",
          module: "CommonJS",
          moduleResolution: "Node",
          esModuleInterop: true,
          jsx: "react-jsx",
          types: ["jest", "node"],
        },
      },
    ],
  },
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.test.ts", "!src/**/*.test.tsx"],
};