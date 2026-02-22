/**
 * その他シーン移行テスト
 * TASK-0096: その他シーン移行（RankUp, Shop, GameOver, GameClear, TitleScene）
 *
 * @description
 * 各シーンがsrc/scenes/に正しく移行され、
 * @scenes/からインポートできることを確認する。
 * 後方互換性（@presentation/scenes/）も維持されることを確認。
 */

import { describe, expect, it, vi } from 'vitest';

/**
 * Phaserモック
 */
vi.mock('phaser', () => {
  return {
    default: {
      Scene: class MockScene {},
      GameObjects: {
        Graphics: class MockGraphics {},
        Text: class MockText {},
        Rectangle: class MockRectangle {},
        Container: class MockContainer {},
      },
      Geom: {
        Rectangle: class MockGeomRectangle {
          static Contains = vi.fn();
        },
      },
    },
  };
});

// DIコンテナのモック
vi.mock('@shared/services/di/container', () => ({
  Container: {
    getInstance: vi.fn(() => ({
      resolve: vi.fn(),
    })),
  },
  ServiceKeys: {
    StateManager: 'StateManager',
    RankService: 'RankService',
    ShopService: 'ShopService',
    EventBus: 'EventBus',
  },
}));

// THEMEのモック
vi.mock('@presentation/ui/theme', () => ({
  THEME: {
    colors: {
      primary: 0x4a90d9,
      secondary: 0x666666,
      background: 0xf5f5dc,
      text: 0x333333,
      textLight: 0x999999,
      textOnPrimary: '#ffffff',
      success: 0x228b22,
      error: 0x8b0000,
      disabled: 0x999999,
    },
    fonts: {
      primary: 'Arial',
    },
    sizes: {
      small: 14,
      medium: 16,
      large: 20,
      xlarge: 24,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
  },
  Colors: {
    background: {
      primary: 0x2a2a3d,
      secondary: 0x1a1a2e,
      overlay: 0x000000,
      card: 0x3a3a4d,
      parchment: 0xfffde7,
    },
    border: {
      primary: 0x4a4a5d,
      secondary: 0x5a5a6d,
      highlight: 0x6a6a7d,
      gold: 0xffd700,
      quest: 0xffd54f,
      dark: 0x333333,
    },
    text: {
      primary: 0xffffff,
      secondary: 0xcccccc,
      muted: 0x888888,
      accent: 0xffd700,
      error: 0xff4444,
      success: 0x44ff44,
      dark: 0x333333,
      darkGray: 0x666666,
    },
    quality: {
      common: 0xcccccc,
      uncommon: 0x44ff44,
      rare: 0x4444ff,
      epic: 0xaa44ff,
      legendary: 0xffaa00,
    },
    cardType: {
      gathering: 0x90ee90,
      recipe: 0xffb6c1,
      enhancement: 0xadd8e6,
      default: 0xffffff,
    },
    ui: {
      button: {
        normal: 0x4a4a5d,
        hover: 0x5a5a6d,
        active: 0x6a6a7d,
        disabled: 0x2a2a3d,
        accept: 0x4caf50,
        acceptBorder: 0x388e3c,
      },
      progress: {
        background: 0x2a2a3d,
        fill: 0x4a9eff,
        warning: 0xffaa00,
        danger: 0xff4444,
      },
      placeholder: 0xcccccc,
    },
  },
}));

// TitleScene固有のモック
vi.mock('@presentation/scenes/components/title/types', () => ({
  TITLE_ANIMATION: {
    FADE_DURATION: 500,
    DISABLED_ALPHA: 0.5,
    OVERLAY_ALPHA: 0.7,
    DIALOG_POPUP_DURATION: 200,
  },
  TITLE_DEPTH: { OVERLAY: 100, DIALOG: 200 },
  TITLE_LAYOUT: {
    TITLE_Y: 200,
    SUBTITLE_Y: 280,
    VERSION_OFFSET: 20,
    BUTTON_START_Y: 400,
    BUTTON_SPACING: 70,
  },
  TITLE_SIZES: {
    BUTTON_WIDTH: 200,
    BUTTON_HEIGHT: 50,
    BUTTON_RADIUS: 8,
    CONFIRM_DIALOG_WIDTH: 400,
    CONFIRM_DIALOG_HEIGHT: 200,
    SETTINGS_DIALOG_WIDTH: 400,
    SETTINGS_DIALOG_HEIGHT: 300,
    ERROR_DIALOG_WIDTH: 400,
    ERROR_DIALOG_HEIGHT: 200,
    DIALOG_RADIUS: 12,
    DIALOG_BUTTON_WIDTH: 100,
    DIALOG_BUTTON_HEIGHT: 40,
  },
  TITLE_STYLES: {
    TITLE_FONT_SIZE: '48px',
    TITLE_COLOR: '#DAA520',
    SUBTITLE_FONT_SIZE: '24px',
    SUBTITLE_COLOR: '#666666',
    VERSION_FONT_SIZE: '12px',
    VERSION_COLOR: '#999999',
    BUTTON_FONT_SIZE: '16px',
    DIALOG_TITLE_FONT_SIZE: '20px',
    DIALOG_CONTENT_FONT_SIZE: '14px',
  },
  TITLE_TEXT: {
    TITLE: 'Atelier',
    SUBTITLE: 'Guild Rank',
    VERSION: 'v0.1.0',
    NEW_GAME: '新規ゲーム',
    CONTINUE: 'コンティニュー',
    SETTINGS: '設定',
    CONFIRM_TITLE: '確認',
    CONFIRM_MESSAGE: '本当に新しいゲームを開始しますか？',
    YES: 'はい',
    NO: 'いいえ',
    OK: 'OK',
    SETTINGS_TITLE: '設定',
    SETTINGS_STUB: '設定機能は準備中です',
    ERROR_TITLE: 'エラー',
  },
}));

// keybindingsモック
vi.mock('@shared/constants/keybindings', () => ({
  isKeyForAction: vi.fn(),
}));

// =============================================================================
// TitleScene
// =============================================================================

describe('TitleScene移行（TASK-0096）', () => {
  describe('@scenes/TitleScene からのインポート', () => {
    it('TitleSceneクラスが@scenes/TitleSceneからインポートできること', async () => {
      const mod = await import('@scenes/TitleScene');
      expect(mod.TitleScene).toBeDefined();
      expect(typeof mod.TitleScene).toBe('function');
    });

    it('TitleSceneクラスが@scenes（index.ts）からインポートできること', async () => {
      const mod = await import('@scenes/index');
      expect(mod.TitleScene).toBeDefined();
      expect(typeof mod.TitleScene).toBe('function');
    });
  });

  describe('後方互換性', () => {
    it('@presentation/scenes/TitleSceneからの再エクスポートが動作すること', async () => {
      const mod = await import('@presentation/scenes/TitleScene');
      expect(mod.TitleScene).toBeDefined();
      expect(typeof mod.TitleScene).toBe('function');
    });

    it('@scenes/TitleSceneと@presentation/scenes/TitleSceneが同一クラスであること', async () => {
      const sceneMod = await import('@scenes/TitleScene');
      const presentationMod = await import('@presentation/scenes/TitleScene');
      expect(sceneMod.TitleScene).toBe(presentationMod.TitleScene);
    });
  });
});

// =============================================================================
// RankUpScene
// =============================================================================

describe('RankUpScene移行（TASK-0096）', () => {
  describe('@scenes/RankUpScene からのインポート', () => {
    it('RankUpSceneクラスが@scenes/RankUpSceneからインポートできること', async () => {
      const mod = await import('@scenes/RankUpScene');
      expect(mod.RankUpScene).toBeDefined();
      expect(typeof mod.RankUpScene).toBe('function');
    });

    it('RankUpSceneクラスが@scenes（index.ts）からインポートできること', async () => {
      const mod = await import('@scenes/index');
      expect(mod.RankUpScene).toBeDefined();
      expect(typeof mod.RankUpScene).toBe('function');
    });
  });

  describe('後方互換性', () => {
    it('@presentation/scenes/RankUpSceneからの再エクスポートが動作すること', async () => {
      const mod = await import('@presentation/scenes/RankUpScene');
      expect(mod.RankUpScene).toBeDefined();
      expect(typeof mod.RankUpScene).toBe('function');
    });

    it('@scenes/RankUpSceneと@presentation/scenes/RankUpSceneが同一クラスであること', async () => {
      const sceneMod = await import('@scenes/RankUpScene');
      const presentationMod = await import('@presentation/scenes/RankUpScene');
      expect(sceneMod.RankUpScene).toBe(presentationMod.RankUpScene);
    });
  });
});

// =============================================================================
// ShopScene
// =============================================================================

describe('ShopScene移行（TASK-0096）', () => {
  describe('@scenes/ShopScene からのインポート', () => {
    it('ShopSceneクラスが@scenes/ShopSceneからインポートできること', async () => {
      const mod = await import('@scenes/ShopScene');
      expect(mod.ShopScene).toBeDefined();
      expect(typeof mod.ShopScene).toBe('function');
    });

    it('ShopSceneクラスが@scenes（index.ts）からインポートできること', async () => {
      const mod = await import('@scenes/index');
      expect(mod.ShopScene).toBeDefined();
      expect(typeof mod.ShopScene).toBe('function');
    });
  });

  describe('後方互換性', () => {
    it('@presentation/scenes/ShopSceneからの再エクスポートが動作すること', async () => {
      const mod = await import('@presentation/scenes/ShopScene');
      expect(mod.ShopScene).toBeDefined();
      expect(typeof mod.ShopScene).toBe('function');
    });

    it('@scenes/ShopSceneと@presentation/scenes/ShopSceneが同一クラスであること', async () => {
      const sceneMod = await import('@scenes/ShopScene');
      const presentationMod = await import('@presentation/scenes/ShopScene');
      expect(sceneMod.ShopScene).toBe(presentationMod.ShopScene);
    });
  });
});

// =============================================================================
// GameOverScene
// =============================================================================

describe('GameOverScene移行（TASK-0096）', () => {
  describe('@scenes/GameOverScene からのインポート', () => {
    it('GameOverSceneクラスが@scenes/GameOverSceneからインポートできること', async () => {
      const mod = await import('@scenes/GameOverScene');
      expect(mod.GameOverScene).toBeDefined();
      expect(typeof mod.GameOverScene).toBe('function');
    });

    it('GameOverSceneクラスが@scenes（index.ts）からインポートできること', async () => {
      const mod = await import('@scenes/index');
      expect(mod.GameOverScene).toBeDefined();
      expect(typeof mod.GameOverScene).toBe('function');
    });
  });

  describe('後方互換性', () => {
    it('@presentation/scenes/GameOverSceneからの再エクスポートが動作すること', async () => {
      const mod = await import('@presentation/scenes/GameOverScene');
      expect(mod.GameOverScene).toBeDefined();
      expect(typeof mod.GameOverScene).toBe('function');
    });

    it('@scenes/GameOverSceneと@presentation/scenes/GameOverSceneが同一クラスであること', async () => {
      const sceneMod = await import('@scenes/GameOverScene');
      const presentationMod = await import('@presentation/scenes/GameOverScene');
      expect(sceneMod.GameOverScene).toBe(presentationMod.GameOverScene);
    });
  });
});

// =============================================================================
// GameClearScene
// =============================================================================

describe('GameClearScene移行（TASK-0096）', () => {
  describe('@scenes/GameClearScene からのインポート', () => {
    it('GameClearSceneクラスが@scenes/GameClearSceneからインポートできること', async () => {
      const mod = await import('@scenes/GameClearScene');
      expect(mod.GameClearScene).toBeDefined();
      expect(typeof mod.GameClearScene).toBe('function');
    });

    it('GameClearSceneクラスが@scenes（index.ts）からインポートできること', async () => {
      const mod = await import('@scenes/index');
      expect(mod.GameClearScene).toBeDefined();
      expect(typeof mod.GameClearScene).toBe('function');
    });
  });

  describe('後方互換性', () => {
    it('@presentation/scenes/GameClearSceneからの再エクスポートが動作すること', async () => {
      const mod = await import('@presentation/scenes/GameClearScene');
      expect(mod.GameClearScene).toBeDefined();
      expect(typeof mod.GameClearScene).toBe('function');
    });

    it('@scenes/GameClearSceneと@presentation/scenes/GameClearSceneが同一クラスであること', async () => {
      const sceneMod = await import('@scenes/GameClearScene');
      const presentationMod = await import('@presentation/scenes/GameClearScene');
      expect(sceneMod.GameClearScene).toBe(presentationMod.GameClearScene);
    });
  });
});
