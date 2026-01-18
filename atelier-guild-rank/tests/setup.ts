import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

// fetchモック（ファイルシステムから直接読み込み）
global.fetch = vi.fn((input: RequestInfo | URL, _init?: RequestInit) => {
  const urlString = typeof input === 'string' ? input : input.toString();

  // テスト環境用のファイルパス解決
  const filePath = resolve(__dirname, '..', urlString);

  try {
    const content = readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);

    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(json),
      text: () => Promise.resolve(content),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    } as Response);
  } catch (error) {
    return Promise.resolve({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.reject(error),
      text: () => Promise.reject(error),
      headers: new Headers(),
    } as Response);
  }
}) as typeof fetch;
