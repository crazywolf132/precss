module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    coverageThreshold: {
        global: 90
    },
    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/index.ts"
    ],
    coveragePathIgnorePatterns: [
        "node_modules"
    ]
}