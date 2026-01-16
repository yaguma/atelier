import { vi } from 'vitest';

// グローバルモックの設定
vi.mock('phaser', () => ({
  Game: vi.fn(),
  Scene: vi.fn(),
  AUTO: 'AUTO',
}));

// LocalStorageモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// requestAnimationFrameモック
vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
  return setTimeout(() => callback(Date.now()), 0);
});

// cancelAnimationFrameモック
vi.stubGlobal('cancelAnimationFrame', (id: number) => {
  clearTimeout(id);
});
