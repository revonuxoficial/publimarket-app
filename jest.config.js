// jest.config.js
module.exports = {
  // Directorios donde Jest buscará archivos de prueba
  roots: ['<rootDir>/src'],

  // Configuraciones de transformación para archivos
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // Ignorar ciertos directorios para la transformación
  transformIgnorePatterns: [
    '/node_modules/',
  ],

  // Mapear módulos para manejar importaciones no JS (como CSS, imágenes)
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy', // O un mock adecuado para CSS Modules
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js', // Mock para archivos estáticos
  },

  // Configurar el entorno de prueba (simula un entorno de navegador)
  testEnvironment: 'jsdom',

  // Configurar archivos de configuración adicionales antes de ejecutar las pruebas
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Archivo para configuraciones como @testing-library/jest-dom

  // Extensiones de archivo que Jest buscará
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Opcional: Cobertura de código
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts', // Si tienes un archivo index.ts principal
    '!src/lib/supabase/server.ts', // Excluir archivos de configuración de Supabase si es necesario
    '!src/lib/supabase/client.ts',
  ],
  coverageDirectory: 'coverage',
};
