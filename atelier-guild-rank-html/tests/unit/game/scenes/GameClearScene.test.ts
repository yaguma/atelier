/**
 * GameClearScene単体テスト
 *
 * TASK-0248: GameClearScene実装
 * ゲームクリアシーンの定数、型、基本機能をテストする。
 * Phaserはcanvas環境を必要とするため、モックして定数と型のテストを中心に行う。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SceneKeys } from '@game/config/SceneKeys';

// Phaserをモック
vi.mock('phaser', () => {
  return {
    default: {
      Scene: class MockScene {
        sys = { settings: { key: '' } };
        scene = {
          start: vi.fn(),
          launch: vi.fn(),
          pause: vi.fn(),
          stop: vi.fn(),
          resume: vi.fn(),
        };
        plugins = {
          get: vi.fn().mockReturnValue({}),
        };
        registry = {
          set: vi.fn(),
          get: vi.fn(),
        };
        textures = {
          exists: vi.fn().mockReturnValue(false),
        };
        cache = {
          audio: {
            exists: vi.fn().mockReturnValue(false),
          },
        };
        sound = {
          play: vi.fn(),
          stopByKey: vi.fn(),
          stopAll: vi.fn(),
        };
        cameras = {
          main: {
            shake: vi.fn(),
            centerX: 512,
            centerY: 384,
            width: 1024,
            height: 768,
          },
        };
        add = {
          graphics: vi.fn().mockReturnValue({
            fillStyle: vi.fn().mockReturnThis(),
            fillRect: vi.fn().mockReturnThis(),
            fillRoundedRect: vi.fn().mockReturnThis(),
            fillCircle: vi.fn().mockReturnThis(),
            lineStyle: vi.fn().mockReturnThis(),
            strokeRoundedRect: vi.fn().mockReturnThis(),
            clear: vi.fn().mockReturnThis(),
            destroy: vi.fn(),
            x: 0,
            y: 0,
            setAlpha: vi.fn().mockReturnThis(),
            setDepth: vi.fn().mockReturnThis(),
          }),
          container: vi.fn().mockReturnValue({
            add: vi.fn().mockReturnThis(),
            setPosition: vi.fn().mockReturnThis(),
            setSize: vi.fn().mockReturnThis(),
            setInteractive: vi.fn().mockReturnThis(),
            disableInteractive: vi.fn().mockReturnThis(),
            setAlpha: vi.fn().mockReturnThis(),
            setY: vi.fn().mockReturnThis(),
            setDepth: vi.fn().mockReturnThis(),
            on: vi.fn().mockReturnThis(),
            destroy: vi.fn(),
            y: 0,
          }),
          text: vi.fn().mockReturnValue({
            setOrigin: vi.fn().mockReturnThis(),
            setAlpha: vi.fn().mockReturnThis(),
            setScale: vi.fn().mockReturnThis(),
            setText: vi.fn().mockReturnThis(),
            destroy: vi.fn(),
            y: 0,
            style: { color: '#ffffff' },
          }),
          image: vi.fn().mockReturnValue({
            setOrigin: vi.fn().mockReturnThis(),
            setScale: vi.fn().mockReturnThis(),
            destroy: vi.fn(),
          }),
          rectangle: vi.fn().mockReturnValue({
            setOrigin: vi.fn().mockReturnThis(),
            setFillStyle: vi.fn().mockReturnThis(),
            destroy: vi.fn(),
          }),
        };
        events = {
          on: vi.fn(),
          off: vi.fn(),
          emit: vi.fn(),
        };
        time = {
          delayedCall: vi.fn(),
        };
        tweens = {
          add: vi.fn().mockReturnValue({
            on: vi.fn().mockReturnThis(),
          }),
        };
        input = {
          on: vi.fn(),
          off: vi.fn(),
        };
        load = {
          on: vi.fn(),
          start: vi.fn(),
        };
        constructor() {}
        init() {}
        preload() {}
        create() {}
        update() {}
      },
      Math: {
        Between: vi.fn((min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min)),
        FloatBetween: vi.fn((min: number, max: number) => Math.random() * (max - min) + min),
      },
    },
  };
});

// モック後にインポート
import {
  GameClearSceneLayout,
  GameClearColors,
  GameClearAnimations,
  type GameClearStats,
} from '../../../../src/game/scenes/GameClearSceneConstants';
import { GameClearScene, GameClearSceneData } from '../../../../src/game/scenes/GameClearScene';

// =====================================================
// レイアウト定数テスト
// =====================================================

describe('GameClearScene レイアウト定数', () => {
  it('GameClearSceneLayoutがエクスポートされている', () => {
    expect(GameClearSceneLayout).toBeDefined();
  });

  it('画面サイズが正しく定義されている', () => {
    expect(GameClearSceneLayout.SCREEN_WIDTH).toBe(1024);
    expect(GameClearSceneLayout.SCREEN_HEIGHT).toBe(768);
  });

  it('センター位置が正しく定義されている', () => {
    expect(GameClearSceneLayout.CENTER_X).toBe(512);
    expect(GameClearSceneLayout.CENTER_Y).toBe(384);
  });

  it('クリアテキスト設定が定義されている', () => {
    expect(GameClearSceneLayout.CLEAR_TEXT.Y).toBe(-220);
    expect(GameClearSceneLayout.CLEAR_TEXT.FONT_SIZE).toBe('48px');
  });

  it('サブテキスト設定が定義されている', () => {
    expect(GameClearSceneLayout.SUB_TEXT.Y).toBe(-160);
    expect(GameClearSceneLayout.SUB_TEXT.FONT_SIZE).toBe('24px');
  });

  it('トロフィーエリアが定義されている', () => {
    expect(GameClearSceneLayout.TROPHY_AREA.Y).toBe(-60);
    expect(GameClearSceneLayout.TROPHY_AREA.GLOW_RADIUS).toBe(60);
    expect(GameClearSceneLayout.TROPHY_AREA.ICON_SIZE).toBe('64px');
  });

  it('統計パネルが定義されている', () => {
    expect(GameClearSceneLayout.STATS_PANEL.Y).toBe(80);
    expect(GameClearSceneLayout.STATS_PANEL.WIDTH).toBe(500);
    expect(GameClearSceneLayout.STATS_PANEL.HEIGHT).toBe(140);
    expect(GameClearSceneLayout.STATS_PANEL.BORDER_RADIUS).toBe(8);
  });

  it('レアアイテムエリアが定義されている', () => {
    expect(GameClearSceneLayout.RARE_ITEMS_AREA.Y).toBe(170);
    expect(GameClearSceneLayout.RARE_ITEMS_AREA.ITEM_SIZE).toBe(50);
    expect(GameClearSceneLayout.RARE_ITEMS_AREA.ITEM_SPACING).toBe(60);
    expect(GameClearSceneLayout.RARE_ITEMS_AREA.MAX_DISPLAY).toBe(5);
  });

  it('プレイ時間表示が定義されている', () => {
    expect(GameClearSceneLayout.PLAY_TIME.Y).toBe(210);
    expect(GameClearSceneLayout.PLAY_TIME.FONT_SIZE).toBe('14px');
  });

  it('ボタンエリアが定義されている', () => {
    expect(GameClearSceneLayout.BUTTON_AREA.Y).toBe(260);
    expect(GameClearSceneLayout.BUTTON_AREA.BUTTON_WIDTH).toBe(200);
    expect(GameClearSceneLayout.BUTTON_AREA.BUTTON_HEIGHT).toBe(50);
  });
});

// =====================================================
// 色設定テスト
// =====================================================

describe('GameClearScene 色設定', () => {
  it('GameClearColorsがエクスポートされている', () => {
    expect(GameClearColors).toBeDefined();
  });

  it('背景グラデーション色が定義されている', () => {
    expect(GameClearColors.backgroundStart).toEqual({ r: 10, g: 10, b: 30 });
    expect(GameClearColors.backgroundEnd).toEqual({ r: 30, g: 40, b: 80 });
  });

  it('テキスト色が定義されている', () => {
    expect(GameClearColors.text).toBe('#ffcc00');
    expect(GameClearColors.subText).toBe('#ffffff');
  });

  it('統計パネルの色が定義されている', () => {
    expect(GameClearColors.statsBackground).toBe(0x000033);
    expect(GameClearColors.statsBorder).toBe(0xffcc00);
  });

  it('トロフィー光彩色が定義されている', () => {
    expect(GameClearColors.trophyGlow).toBe(0xffcc00);
  });

  it('レアアイテム背景色が定義されている', () => {
    expect(GameClearColors.rareItemBackground).toBe(0xffaa00);
  });

  it('紙吹雪色が定義されている', () => {
    expect(GameClearColors.confettiColors).toHaveLength(6);
    expect(GameClearColors.confettiColors).toContain(0xffcc00);
  });
});

// =====================================================
// アニメーション設定テスト
// =====================================================

describe('GameClearScene アニメーション設定', () => {
  it('GameClearAnimationsがエクスポートされている', () => {
    expect(GameClearAnimations).toBeDefined();
  });

  it('フェードイン設定が定義されている', () => {
    expect(GameClearAnimations.FADE_IN_DURATION).toBe(800);
    expect(GameClearAnimations.FADE_IN_DELAY).toBe(500);
  });

  it('トロフィー光彩アニメーション時間が定義されている', () => {
    expect(GameClearAnimations.TROPHY_GLOW_DURATION).toBe(1500);
  });

  it('星エフェクト設定が定義されている', () => {
    expect(GameClearAnimations.STAR_COUNT).toBe(100);
    expect(GameClearAnimations.STAR_TWINKLE_MIN_DURATION).toBe(1000);
    expect(GameClearAnimations.STAR_TWINKLE_MAX_DURATION).toBe(3000);
  });

  it('紙吹雪設定が定義されている', () => {
    expect(GameClearAnimations.CONFETTI_COUNT).toBe(100);
    expect(GameClearAnimations.CONFETTI_FALL_MIN_DURATION).toBe(3000);
    expect(GameClearAnimations.CONFETTI_FALL_MAX_DURATION).toBe(5000);
    expect(GameClearAnimations.CONFETTI_DELAY_MAX).toBe(2000);
  });
});

// =====================================================
// 型定義テスト
// =====================================================

describe('GameClearScene 型定義', () => {
  it('GameClearStats型が正しく使用できる', () => {
    const stats: GameClearStats = {
      clearDay: 80,
      finalRank: 'S',
      totalQuests: 100,
      totalAlchemy: 200,
      totalGold: 50000,
      rareItems: ['賢者の石', '万能薬'],
      playTime: 7200,
    };

    expect(stats.clearDay).toBe(80);
    expect(stats.finalRank).toBe('S');
    expect(stats.totalQuests).toBe(100);
    expect(stats.totalAlchemy).toBe(200);
    expect(stats.totalGold).toBe(50000);
    expect(stats.rareItems).toHaveLength(2);
    expect(stats.playTime).toBe(7200);
  });
});

// =====================================================
// シーンキーテスト
// =====================================================

describe('GameClearScene シーンキー', () => {
  it('SceneKeys.GAME_CLEARがGameClearSceneである', () => {
    expect(SceneKeys.GAME_CLEAR).toBe('GameClearScene');
  });
});

// =====================================================
// シーンエクスポートテスト
// =====================================================

describe('GameClearScene エクスポート', () => {
  it('GameClearSceneがエクスポートされている', () => {
    expect(GameClearScene).toBeDefined();
  });

  it('GameClearSceneがクラスである', () => {
    expect(typeof GameClearScene).toBe('function');
  });

  it('GameClearSceneインスタンスが作成できる', () => {
    const scene = new GameClearScene();
    expect(scene).toBeInstanceOf(GameClearScene);
  });
});

// =====================================================
// データ型テスト
// =====================================================

describe('GameClearScene データ型', () => {
  it('GameClearSceneData型が正しく使用できる', () => {
    const data: GameClearSceneData = {
      clearDay: 80,
      finalRank: 'S',
      totalQuests: 100,
      totalAlchemy: 200,
      totalGold: 50000,
      rareItems: ['賢者の石'],
      playTime: 3661,
    };

    expect(data.clearDay).toBe(80);
    expect(data.finalRank).toBe('S');
    expect(data.totalQuests).toBe(100);
    expect(data.totalAlchemy).toBe(200);
    expect(data.totalGold).toBe(50000);
    expect(data.rareItems).toHaveLength(1);
    expect(data.playTime).toBe(3661);
  });
});

// =====================================================
// シーン機能テスト
// =====================================================

describe('GameClearScene 機能', () => {
  let scene: GameClearScene;

  beforeEach(() => {
    scene = new GameClearScene();
  });

  it('getStatsメソッドがある', () => {
    expect(typeof scene.getStats).toBe('function');
  });

  it('formatPlayTimeメソッドがある', () => {
    expect(typeof scene.formatPlayTime).toBe('function');
  });

  it('getClearDayメソッドがある', () => {
    expect(typeof scene.getClearDay).toBe('function');
  });

  it('getRareItemsメソッドがある', () => {
    expect(typeof scene.getRareItems).toBe('function');
  });
});

// =====================================================
// プレイ時間フォーマットテスト
// =====================================================

describe('GameClearScene プレイ時間フォーマット', () => {
  let scene: GameClearScene;

  beforeEach(() => {
    scene = new GameClearScene();
  });

  it('1時間1分1秒が「1時間1分」とフォーマットされる', () => {
    const result = scene.formatPlayTime(3661);
    expect(result).toBe('1時間1分');
  });

  it('0時間30分45秒が「30分45秒」とフォーマットされる', () => {
    const result = scene.formatPlayTime(1845);
    expect(result).toBe('30分45秒');
  });

  it('2時間0分0秒が「2時間0分」とフォーマットされる', () => {
    const result = scene.formatPlayTime(7200);
    expect(result).toBe('2時間0分');
  });

  it('0時間0分30秒が「0分30秒」とフォーマットされる', () => {
    const result = scene.formatPlayTime(30);
    expect(result).toBe('0分30秒');
  });

  it('5時間30分が「5時間30分」とフォーマットされる', () => {
    const result = scene.formatPlayTime(19800);
    expect(result).toBe('5時間30分');
  });
});

// =====================================================
// scenesインデックステスト
// =====================================================

describe('GameClearScene scenesインデックス', () => {
  it('scenesインデックスからGameClearSceneがエクスポートされている', async () => {
    const scenes = await import('../../../../src/game/scenes');
    expect(scenes.GameClearScene).toBeDefined();
  });

  it('scenesインデックスからGameClearSceneLayoutがエクスポートされている', async () => {
    const scenes = await import('../../../../src/game/scenes');
    expect(scenes.GameClearSceneLayout).toBeDefined();
  });

  it('scenesインデックスからGameClearColorsがエクスポートされている', async () => {
    const scenes = await import('../../../../src/game/scenes');
    expect(scenes.GameClearColors).toBeDefined();
  });
});
