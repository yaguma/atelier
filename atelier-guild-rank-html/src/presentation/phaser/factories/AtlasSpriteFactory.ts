import Phaser from 'phaser';
import { AtlasLoader, createPlaceholderAtlas } from '../loaders/AtlasLoader';

/**
 * フレーム名マッピング設定
 */
export interface FrameMappingConfig {
  [category: string]: string;
}

/**
 * アトラス対応スプライトファクトリー
 *
 * テクスチャアトラスからスプライトやイメージを効率的に作成する。
 * 描画バッチを減らしてパフォーマンスを向上させる。
 */
export class AtlasSpriteFactory {
  private scene: Phaser.Scene;
  private atlasLoader: AtlasLoader;
  private placeholderCreated: Set<string> = new Set();

  /**
   * カードタイプとフレーム名のマッピング
   */
  private static readonly CARD_FRAMES: FrameMappingConfig = {
    gathering: 'card-gathering',
    recipe: 'card-recipe',
    enhancement: 'card-enhancement',
  };

  /**
   * 素材カテゴリとフレーム名のマッピング
   */
  private static readonly MATERIAL_FRAMES: FrameMappingConfig = {
    herb: 'mat-herb',
    ore: 'mat-ore',
    liquid: 'mat-liquid',
    crystal: 'mat-crystal',
    monster: 'mat-monster',
  };

  /**
   * UI要素とフレーム名のマッピング
   */
  private static readonly UI_FRAMES: FrameMappingConfig = {
    button: 'ui-button',
    buttonHover: 'ui-button-hover',
    buttonPressed: 'ui-button-pressed',
    panel: 'ui-panel',
    panelDark: 'ui-panel-dark',
    dialogBg: 'ui-dialog-bg',
    progressBar: 'ui-progress-bar',
    progressFill: 'ui-progress-fill',
    iconGold: 'icon-gold',
    iconAP: 'icon-ap',
    iconDay: 'icon-day',
    iconRank: 'icon-rank',
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.atlasLoader = new AtlasLoader(scene);
  }

  /**
   * アトラスローダーを取得
   */
  getAtlasLoader(): AtlasLoader {
    return this.atlasLoader;
  }

  /**
   * カードスプライトを作成
   */
  createCardSprite(
    cardType: string,
    x: number,
    y: number
  ): Phaser.GameObjects.Sprite | null {
    const frameName = AtlasSpriteFactory.CARD_FRAMES[cardType];

    if (!frameName) {
      console.warn(`[AtlasSpriteFactory] Unknown card type: ${cardType}`);
      return this.createFallbackSprite(x, y, 0x4a7c59, cardType);
    }

    if (!this.atlasLoader.hasFrame('cards-atlas', frameName)) {
      // プレースホルダーを作成
      this.ensurePlaceholderAtlas('cards-atlas', Object.values(AtlasSpriteFactory.CARD_FRAMES));
    }

    if (this.atlasLoader.hasFrame('cards-atlas', frameName)) {
      return this.atlasLoader.createSprite('cards-atlas', frameName, x, y);
    }

    return this.createFallbackSprite(x, y, 0x4a7c59, cardType);
  }

  /**
   * 素材スプライトを作成
   */
  createMaterialSprite(
    materialCategory: string,
    x: number,
    y: number
  ): Phaser.GameObjects.Sprite | null {
    const frameName = AtlasSpriteFactory.MATERIAL_FRAMES[materialCategory];

    if (!frameName) {
      console.warn(`[AtlasSpriteFactory] Unknown material category: ${materialCategory}`);
      return this.createFallbackSprite(x, y, 0x7c4a5c, materialCategory);
    }

    if (!this.atlasLoader.hasFrame('materials-atlas', frameName)) {
      this.ensurePlaceholderAtlas('materials-atlas', Object.values(AtlasSpriteFactory.MATERIAL_FRAMES));
    }

    if (this.atlasLoader.hasFrame('materials-atlas', frameName)) {
      return this.atlasLoader.createSprite('materials-atlas', frameName, x, y);
    }

    return this.createFallbackSprite(x, y, 0x7c4a5c, materialCategory);
  }

  /**
   * UIスプライトを作成
   */
  createUISprite(
    uiElement: string,
    x: number,
    y: number
  ): Phaser.GameObjects.Sprite | null {
    const frameName = AtlasSpriteFactory.UI_FRAMES[uiElement] ?? uiElement;

    if (!this.atlasLoader.hasFrame('ui-atlas', frameName)) {
      this.ensurePlaceholderAtlas('ui-atlas', Object.values(AtlasSpriteFactory.UI_FRAMES));
    }

    if (this.atlasLoader.hasFrame('ui-atlas', frameName)) {
      return this.atlasLoader.createSprite('ui-atlas', frameName, x, y);
    }

    return this.createFallbackSprite(x, y, 0x5c5a7c, uiElement);
  }

  /**
   * UIイメージを作成
   */
  createUIImage(
    uiElement: string,
    x: number,
    y: number
  ): Phaser.GameObjects.Image | null {
    const frameName = AtlasSpriteFactory.UI_FRAMES[uiElement] ?? uiElement;

    if (!this.atlasLoader.hasFrame('ui-atlas', frameName)) {
      this.ensurePlaceholderAtlas('ui-atlas', Object.values(AtlasSpriteFactory.UI_FRAMES));
    }

    if (this.atlasLoader.hasFrame('ui-atlas', frameName)) {
      return this.atlasLoader.createImage('ui-atlas', frameName, x, y);
    }

    return null;
  }

  /**
   * アイコンを作成
   */
  createIcon(
    iconName: string,
    x: number,
    y: number
  ): Phaser.GameObjects.Image | Phaser.GameObjects.Graphics {
    const frameName = `icon-${iconName}`;

    if (this.atlasLoader.hasFrame('ui-atlas', frameName)) {
      return this.atlasLoader.createImage('ui-atlas', frameName, x, y);
    }

    // フォールバック: 円形プレースホルダー
    return this.createIconPlaceholder(x, y, iconName);
  }

  /**
   * アイコンプレースホルダーを作成
   */
  private createIconPlaceholder(
    x: number,
    y: number,
    name: string
  ): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();
    graphics.setPosition(x, y);

    // アイコンタイプに応じた色
    const colors: Record<string, number> = {
      gold: 0xffd700,
      ap: 0x00ff00,
      day: 0x87ceeb,
      rank: 0xff6b6b,
    };
    const color = colors[name] ?? 0x666666;

    graphics.fillStyle(color, 1);
    graphics.fillCircle(0, 0, 12);
    graphics.lineStyle(2, 0xffffff, 0.5);
    graphics.strokeCircle(0, 0, 12);

    return graphics;
  }

  /**
   * 9スライスパネルを作成
   */
  createNineSlicePanel(
    atlasKey: string,
    frameName: string,
    x: number,
    y: number,
    width: number,
    height: number,
    leftWidth: number = 10,
    rightWidth: number = 10,
    topHeight: number = 10,
    bottomHeight: number = 10
  ): Phaser.GameObjects.NineSlice | null {
    if (!this.atlasLoader.hasFrame(atlasKey, frameName)) {
      console.warn(`[AtlasSpriteFactory] Frame not found: ${atlasKey}/${frameName}`);
      return null;
    }

    return this.scene.add.nineslice(
      x,
      y,
      atlasKey,
      frameName,
      width,
      height,
      leftWidth,
      rightWidth,
      topHeight,
      bottomHeight
    );
  }

  /**
   * フォールバック用スプライトを作成
   */
  private createFallbackSprite(
    x: number,
    y: number,
    color: number,
    label: string
  ): Phaser.GameObjects.Sprite | null {
    // 動的テクスチャを作成
    const key = `fallback-${label}`;

    if (!this.scene.textures.exists(key)) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;

      // 背景
      ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
      ctx.fillRect(0, 0, 64, 64);

      // 枠線
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, 60, 60);

      // ラベル
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label.substring(0, 6), 32, 32);

      this.scene.textures.addCanvas(key, canvas);
    }

    return this.scene.add.sprite(x, y, key);
  }

  /**
   * プレースホルダーアトラスを確保
   */
  private ensurePlaceholderAtlas(atlasKey: string, frames: string[]): void {
    if (this.placeholderCreated.has(atlasKey)) {
      return;
    }

    if (!this.scene.textures.exists(atlasKey)) {
      createPlaceholderAtlas(this.scene, atlasKey, frames, 64);
      this.placeholderCreated.add(atlasKey);
    }
  }

  /**
   * カードフレーム一覧を取得
   */
  getCardFrames(): string[] {
    return Object.values(AtlasSpriteFactory.CARD_FRAMES);
  }

  /**
   * 素材フレーム一覧を取得
   */
  getMaterialFrames(): string[] {
    return Object.values(AtlasSpriteFactory.MATERIAL_FRAMES);
  }

  /**
   * UIフレーム一覧を取得
   */
  getUIFrames(): string[] {
    return Object.values(AtlasSpriteFactory.UI_FRAMES);
  }

  /**
   * デバッグ情報を出力
   */
  logDebugInfo(): void {
    console.group('[AtlasSpriteFactory] Debug Info');
    console.log('Card frames:', this.getCardFrames());
    console.log('Material frames:', this.getMaterialFrames());
    console.log('UI frames:', this.getUIFrames());
    console.log('Placeholder atlases created:', Array.from(this.placeholderCreated));
    this.atlasLoader.logDebugInfo();
    console.groupEnd();
  }
}
