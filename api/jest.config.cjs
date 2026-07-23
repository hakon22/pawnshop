/** @type {import('jest').Config} */
module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  testMatch: ['**/*.e2e-spec.ts', '**/*.spec.ts'],
  setupFiles: ['<rootDir>/src/tests/setup.env.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ESNext',
          moduleResolution: 'node',
          esModuleInterop: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          strictPropertyInitialization: false,
          isolatedModules: true,
          paths: {
            '@shared/*': ['../shared/*'],
            '@api/*': ['src/*'],
            '@infrastructure/*': ['src/infrastructure/*'],
          },
          baseUrl: '.',
        },
        diagnostics: false,
      },
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@shared/(.*)$': '<rootDir>/../shared/$1',
    '^@api/(.*)$': '<rootDir>/src/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^lodash-es$': '<rootDir>/src/tests/helpers/lodash-es-proxy.ts',
  },
  testTimeout: 60000,
};
