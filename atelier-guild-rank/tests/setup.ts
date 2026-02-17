import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { vi } from 'vitest';

// GameObjectモックファクトリ（共通プロパティ）
const createMockGameObjectBase = () => ({
  setOrigin: vi.fn().mockReturnThis(),
  setPosition: vi.fn().mockReturnThis(),
  setVisible: vi.fn().mockReturnThis(),
  setDepth: vi.fn().mockReturnThis(),
  setAlpha: vi.fn().mockReturnThis(),
  setScale: vi.fn().mockReturnThis(),
  setInteractive: vi.fn().mockReturnThis(),
  removeInteractive: vi.fn().mockReturnThis(),
  removeAllListeners: vi.fn().mockReturnThis(),
  setData: vi.fn().mockReturnThis(),
  setBlendMode: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  off: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  x: 0,
  y: 0,
  visible: true,
});

// コンストラクタ対応のモッククラスファクトリ
// vi.fn()のmockImplementationはnew演算子に対応しないため、classベースで定義
class MockRectangle {
  setOrigin = vi.fn().mockReturnValue(this);
  setPosition = vi.fn().mockReturnValue(this);
  setVisible = vi.fn().mockReturnValue(this);
  setDepth = vi.fn().mockReturnValue(this);
  setAlpha = vi.fn().mockReturnValue(this);
  setScale = vi.fn().mockReturnValue(this);
  setInteractive = vi.fn().mockReturnValue(this);
  removeInteractive = vi.fn().mockReturnValue(this);
  removeAllListeners = vi.fn().mockReturnValue(this);
  setData = vi.fn().mockReturnValue(this);
  setBlendMode = vi.fn().mockReturnValue(this);
  on = vi.fn().mockReturnValue(this);
  off = vi.fn().mockReturnValue(this);
  destroy = vi.fn();
  setFillStyle = vi.fn().mockReturnValue(this);
  setStrokeStyle = vi.fn().mockReturnValue(this);
  setSize = vi.fn().mockReturnValue(this);
  x = 0;
  y = 0;
  visible = true;
}

class MockArc {
  setOrigin = vi.fn().mockReturnValue(this);
  setPosition = vi.fn().mockReturnValue(this);
  setVisible = vi.fn().mockReturnValue(this);
  setDepth = vi.fn().mockReturnValue(this);
  setAlpha = vi.fn().mockReturnValue(this);
  setScale = vi.fn().mockReturnValue(this);
  setInteractive = vi.fn().mockReturnValue(this);
  removeInteractive = vi.fn().mockReturnValue(this);
  removeAllListeners = vi.fn().mockReturnValue(this);
  setData = vi.fn().mockReturnValue(this);
  setBlendMode = vi.fn().mockReturnValue(this);
  on = vi.fn().mockReturnValue(this);
  off = vi.fn().mockReturnValue(this);
  destroy = vi.fn();
  setFillStyle = vi.fn().mockReturnValue(this);
  setStrokeStyle = vi.fn().mockReturnValue(this);
  x = 0;
  y = 0;
  visible = true;
}

class MockGraphics {
  setOrigin = vi.fn().mockReturnValue(this);
  setPosition = vi.fn().mockReturnValue(this);
  setVisible = vi.fn().mockReturnValue(this);
  setDepth = vi.fn().mockReturnValue(this);
  setAlpha = vi.fn().mockReturnValue(this);
  setScale = vi.fn().mockReturnValue(this);
  setInteractive = vi.fn().mockReturnValue(this);
  removeInteractive = vi.fn().mockReturnValue(this);
  removeAllListeners = vi.fn().mockReturnValue(this);
  setData = vi.fn().mockReturnValue(this);
  setBlendMode = vi.fn().mockReturnValue(this);
  on = vi.fn().mockReturnValue(this);
  off = vi.fn().mockReturnValue(this);
  destroy = vi.fn();
  clear = vi.fn().mockReturnValue(this);
  fillStyle = vi.fn().mockReturnValue(this);
  fillRect = vi.fn().mockReturnValue(this);
  fillRoundedRect = vi.fn().mockReturnValue(this);
  fillCircle = vi.fn().mockReturnValue(this);
  lineStyle = vi.fn().mockReturnValue(this);
  strokeRect = vi.fn().mockReturnValue(this);
  strokeRoundedRect = vi.fn().mockReturnValue(this);
  strokePath = vi.fn().mockReturnValue(this);
  beginPath = vi.fn().mockReturnValue(this);
  moveTo = vi.fn().mockReturnValue(this);
  lineTo = vi.fn().mockReturnValue(this);
  generateTexture = vi.fn().mockReturnValue(this);
  x = 0;
  y = 0;
  visible = true;
}

// グローバルモックの設定
const PhaserMock = {
  Game: vi.fn(),
  Scene: class Scene {
    cameras = { main: { centerX: 640, centerY: 360 } };
    scale = { width: 1280, height: 720 };
    add = {};
    make = {};
    scene = {};
  },
  AUTO: 'AUTO',
  GameObjects: {
    Rectangle: vi.fn(function (this: MockRectangle) {
      Object.assign(this, new MockRectangle());
    }),
    Arc: vi.fn(function (this: MockArc) {
      Object.assign(this, new MockArc());
    }),
    Graphics: vi.fn(function (this: MockGraphics) {
      Object.assign(this, new MockGraphics());
    }),
    Container: vi.fn().mockImplementation(() => ({
      ...createMockGameObjectBase(),
      add: vi.fn().mockReturnThis(),
      removeAll: vi.fn().mockReturnThis(),
      bringToTop: vi.fn().mockReturnThis(),
      setSize: vi.fn().mockReturnThis(),
      list: [],
    })),
    Text: vi.fn().mockImplementation(() => ({
      ...createMockGameObjectBase(),
      setText: vi.fn().mockReturnThis(),
      setStyle: vi.fn().mockReturnThis(),
      setColor: vi.fn().mockReturnThis(),
      text: '',
    })),
    Particles: {
      ParticleEmitter: vi.fn(),
    },
  },
  Geom: {
    Rectangle: Object.assign(vi.fn(), {
      Contains: vi.fn().mockReturnValue(true),
    }),
  },
  BlendModes: {
    ADD: 1,
    NORMAL: 0,
  },
  Tweens: {
    Tween: vi.fn(),
  },
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
