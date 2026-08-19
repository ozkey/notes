/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  setupFiles: ['<rootDir>/src/jest.setup.ts'],
  moduleNameMapper: {
    '^!!raw-loader!.*$': '<rootDir>/src/__mocks__/rawLoaderMock.ts',
    '\\.css$': '<rootDir>/src/__mocks__/styleMock.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        moduleResolution: 'node',
        jsx: 'react-jsx',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        types: ['jest', 'node'],
      }
    }]
  },
  collectCoverageFrom: [
    'src/contexts/BibleContextUtils.ts',
    'src/contexts/notesUtils.ts',
    'src/contexts/bibleTextLoader.ts',
    'src/contexts/notesFileIO.ts',
    'src/components/utils/BibleUtils.ts',
    'src/components/Editor/utils.ts',
    'src/components/Editor/formattingUtils.ts',
    'src/components/Editor/linkUtils.ts',
    'src/components/Editor/tableUtils.ts',
    'src/components/Editor/imageUtils.ts',
    'src/components/Editor/selectionUtils.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
