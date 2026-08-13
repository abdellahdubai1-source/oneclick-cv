import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement crypto.randomUUID in older versions — polyfill for id generation tests.
if (typeof globalThis.crypto === 'undefined' || typeof globalThis.crypto.randomUUID !== 'function') {
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    configurable: true,
    value: () => '00000000-0000-4000-8000-000000000000',
  });
}
