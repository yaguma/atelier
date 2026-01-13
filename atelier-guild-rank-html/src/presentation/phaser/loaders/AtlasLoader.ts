import Phaser from 'phaser';

/**
 * アトラス定義
 */
export interface AtlasDefinition {
  /** アトラスキー */
  key: string;
  /** テクスチャURL */
  textureURL: string;
  /** アトラスJSON URL */
  atlasURL: string;
  /** 説明 */
  description?: string;
}

/**
 * アトラス定義一覧
 */
export const ATLAS_DEFINITIONS: AtlasDefinition[] = [
  {
    key: 'cards-atlas',
    textureURL: 'assets/atlas/cards.png',
    atlasURL: 'assets/atlas/cards.json',
    description: 'カード画像アトラス',
  },
  {
    key: 'materials-atlas',
    textureURL: 'assets/atlas/materials.png',
    atlasURL: 'assets/atlas/materials.json',
    description: '素材画像アトラス',
  },
  {
    key: 'ui-atlas',
    textureURL: 'assets/atlas/ui.png',
    atlasURL: 'assets/atlas/ui.json',
    description: 'UI画像アトラス',
  },
];

/**
 * アトラス読み込み状態
 */
export interface AtlasLoadState {
  key: string;
  loaded: boolean;
  error?: string;
}

/**
 * アトラスローダーユーティリティ
 *
 * 複数のテクスチャをアトラスとしてまとめて管理し、
 * 描画バッチを減らしてパフォーマンスを向上させる
 */
export class AtlasLoader {
  private scene: Phaser.Scene;
  private loadStates: Map<string, AtlasLoadState> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 全アトラスをプリロード
   */
  preloadAllAtlases(): void {
    for (const atlas of ATLAS_DEFINITIONS) {
      this.preloadAtlas(atlas.key);
    }
  }

  /**
   * 特定のアトラスをプリロード
   */
  preloadAtlas(key: string): void {
    const atlas = ATLAS_DEFINITIONS.find((a) => a.key === key);

    if (!atlas) {
      console.warn(`[AtlasLoader] Atlas definition not found: ${key}`);
      return;
    }

    // 読み込み状態を初期化
    this.loadStates.set(key, { key, loaded: false });

    // アトラスをロード
    this.scene.load.atlas(atlas.key, atlas.textureURL, atlas.atlasURL);

    // 読み込み完了イベント
    this.scene.load.once(`filecomplete-atlasjson-${atlas.key}`, () => {
      this.loadStates.set(key, { key, loaded: true });
      console.log(`[AtlasLoader] Loaded: ${key}`);
    });

    // エラーイベント
    this.scene.load.once(`loaderror`, (file: Phaser.Loader.File) => {
      if (file.key === atlas.key) {
        this.loadStates.set(key, {
          key,
          loaded: false,
          error: `Failed to load: ${file.url}`,
        });
        console.error(`[AtlasLoader] Error loading: ${key}`);
      }
    });
  }

  /**
   * アトラスがロードされているか確認
   */
  isAtlasLoaded(key: string): boolean {
    return this.loadStates.get(key)?.loaded ?? false;
  }

  /**
   * 全アトラスの読み込み状態を取得
   */
  getLoadStates(): AtlasLoadState[] {
    return Array.from(this.loadStates.values());
  }

  /**
   * アトラスからスプライトを作成
   */
  createSprite(
    atlasKey: string,
    frameName: string,
    x: number,
    y: number
  ): Phaser.GameObjects.Sprite {
    return this.scene.add.sprite(x, y, atlasKey, frameName);
  }

  /**
   * アトラスからイメージを作成
   */
  createImage(
    atlasKey: string,
    frameName: string,
    x: number,
    y: number
  ): Phaser.GameObjects.Image {
    return this.scene.add.image(x, y, atlasKey, frameName);
  }

  /**
   * フレーム名一覧を取得
   */
  getFrameNames(atlasKey: string): string[] {
    const texture = this.scene.textures.get(atlasKey);

    if (!texture) {
      console.warn(`[AtlasLoader] Atlas texture not found: ${atlasKey}`);
      return [];
    }

    return texture.getFrameNames();
  }

  /**
   * フレームが存在するか確認
   */
  hasFrame(atlasKey: string, frameName: string): boolean {
    const texture = this.scene.textures.get(atlasKey);

    if (!texture) {
      return false;
    }

    return texture.has(frameName);
  }

  /**
   * フレーム情報を取得
   */
  getFrame(
    atlasKey: string,
    frameName: string
  ): Phaser.Textures.Frame | null {
    const texture = this.scene.textures.get(atlasKey);

    if (!texture || !texture.has(frameName)) {
      return null;
    }

    return texture.get(frameName);
  }

  /**
   * アトラスのテクスチャサイズを取得
   */
  getAtlasSize(atlasKey: string): { width: number; height: number } | null {
    const texture = this.scene.textures.get(atlasKey);

    if (!texture) {
      return null;
    }

    const source = texture.getSourceImage();
    return {
      width: source.width,
      height: source.height,
    };
  }

  /**
   * デバッグ情報を出力
   */
  logDebugInfo(): void {
    console.group('[AtlasLoader] Debug Info');

    for (const atlas of ATLAS_DEFINITIONS) {
      const state = this.loadStates.get(atlas.key);
      const size = this.getAtlasSize(atlas.key);
      const frames = this.getFrameNames(atlas.key);

      console.group(atlas.key);
      console.log('Description:', atlas.description);
      console.log('Loaded:', state?.loaded ?? false);
      console.log('Error:', state?.error ?? 'None');
      console.log('Size:', size ? `${size.width}x${size.height}` : 'N/A');
      console.log('Frames:', frames.length);
      console.groupEnd();
    }

    console.groupEnd();
  }
}

/**
 * プレースホルダーアトラスを生成（開発用）
 */
export function createPlaceholderAtlas(
  scene: Phaser.Scene,
  key: string,
  frames: string[],
  frameSize: number = 64
): void {
  // キャンバスで動的にテクスチャを生成
  const cols = Math.ceil(Math.sqrt(frames.length));
  const rows = Math.ceil(frames.length / cols);
  const width = cols * frameSize;
  const height = rows * frameSize;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // フレームデータ
  const frameData: Record<string, { frame: { x: number; y: number; w: number; h: number } }> = {};

  frames.forEach((frameName, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = col * frameSize;
    const y = row * frameSize;

    // プレースホルダー描画
    ctx.fillStyle = `hsl(${(index * 30) % 360}, 50%, 50%)`;
    ctx.fillRect(x, y, frameSize, frameSize);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(x, y, frameSize, frameSize);

    // フレーム名を描画
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(frameName.substring(0, 8), x + frameSize / 2, y + frameSize / 2);

    frameData[frameName] = {
      frame: { x, y, w: frameSize, h: frameSize },
    };
  });

  // テクスチャを追加
  scene.textures.addCanvas(key, canvas);

  // フレームを追加
  const texture = scene.textures.get(key);
  for (const [frameName, data] of Object.entries(frameData)) {
    texture.add(
      frameName,
      0,
      data.frame.x,
      data.frame.y,
      data.frame.w,
      data.frame.h
    );
  }

  console.log(`[AtlasLoader] Created placeholder atlas: ${key} (${frames.length} frames)`);
}
