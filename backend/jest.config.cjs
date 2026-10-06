module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          target: "ES2020",
          module: "CommonJS",
          moduleResolution: "Node",
          esModuleInterop: true,
          resolveJsonModule: true,
          types: ["jest", "node"],
        },
      },
    ],
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.test.ts"],
};