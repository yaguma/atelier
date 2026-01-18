import { vi } from 'vitest';

// グローバルモックの設定
const PhaserMock = {
  Game: vi.fn(),
  Scene: class Scene {
    cameras = { main: { centerX: 640, centerY: 360 } };
    scale = { width: 1280, height: 720 };
    add = {};
    scene = {};
  },
  AUTO: 'AUTO',
};

vi.mock('phaser', () => ({
  default: PhaserMock,
  ...PhaserMock,
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
