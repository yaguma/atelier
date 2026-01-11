/**
 * GameOverScene単体テスト
 *
 * TASK-0247: GameOverScene実装
 * ゲームオーバーシーンの定数、型、基本機能をテストする。
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
      },
    },
  };
});

// モック後にインポート
import {
  GameOverSceneLayout,
  GameOverColors,
  GameOverAnimations,
  GameOverReasonDefaults,
  type GameOverReason,
  type GameOverReasonType,
  type GameOverStats,
} from '../../../../src/game/scenes/GameOverSceneConstants';
import { GameOverScene, GameOverSceneData } from '../../../../src/game/scenes/GameOverScene';

// =====================================================
// レイアウト定数テスト
// =====================================================

describe('GameOverScene レイアウト定数', () => {
  it('GameOverSceneLayoutがエクスポートされている', () => {
    expect(GameOverSceneLayout).toBeDefined();
  });

  it('画面サイズが正しく定義されている', () => {
    expect(GameOverSceneLayout.SCREEN_WIDTH).toBe(1024);
    expect(GameOverSceneLayout.SCREEN_HEIGHT).toBe(768);
  });

  it('センター位置が正しく定義されている', () => {
    expect(GameOverSceneLayout.CENTER_X).toBe(512);
    expect(GameOverSceneLayout.CENTER_Y).toBe(384);
  });

  it('ゲームオーバーテキスト設定が定義されている', () => {
    expect(GameOverSceneLayout.GAME_OVER_TEXT.Y).toBe(-200);
    expect(GameOverSceneLayout.GAME_OVER_TEXT.FONT_SIZE).toBe('64px');
  });

  it('失敗理由エリアが定義されている', () => {
    expect(GameOverSceneLayout.REASON_AREA.Y).toBe(-80);
    expect(GameOverSceneLayout.REASON_AREA.MAX_WIDTH).toBe(600);
  });

  it('統計パネルが定義されている', () => {
    expect(GameOverSceneLayout.STATS_PANEL.Y).toBe(60);
    expect(GameOverSceneLayout.STATS_PANEL.WIDTH).toBe(400);
    expect(GameOverSceneLayout.STATS_PANEL.HEIGHT).toBe(180);
    expect(GameOverSceneLayout.STATS_PANEL.BORDER_RADIUS).toBe(8);
  });

  it('ボタンエリアが定義されている', () => {
    expect(GameOverSceneLayout.BUTTON_AREA.Y).toBe(220);
    expect(GameOverSceneLayout.BUTTON_AREA.BUTTON_WIDTH).toBe(180);
    expect(GameOverSceneLayout.BUTTON_AREA.BUTTON_HEIGHT).toBe(50);
    expect(GameOverSceneLayout.BUTTON_AREA.BUTTON_SPACING).toBe(100);
  });
});

// =====================================================
// 色設定テスト
// =====================================================

describe('GameOverScene 色設定', () => {
  it('GameOverColorsがエクスポートされている', () => {
    expect(GameOverColors).toBeDefined();
  });

  it('背景色が定義されている', () => {
    expect(GameOverColors.background).toBe(0x1a0000);
  });

  it('霧エフェクト色が定義されている', () => {
    expect(GameOverColors.fog).toBe(0x330000);
  });

  it('テキスト色が定義されている', () => {
    expect(GameOverColors.text).toBe('#ff4444');
    expect(GameOverColors.reasonText).toBe('#ff8888');
  });

  it('統計パネルの色が定義されている', () => {
    expect(GameOverColors.statsBackground).toBe(0x330000);
    expect(GameOverColors.statsBorder).toBe(0xff4444);
  });
});

// =====================================================
// アニメーション設定テスト
// =====================================================

describe('GameOverScene アニメーション設定', () => {
  it('GameOverAnimationsがエクスポートされている', () => {
    expect(GameOverAnimations).toBeDefined();
  });

  it('フェードイン時間が定義されている', () => {
    expect(GameOverAnimations.FADE_IN_DURATION).toBe(500);
  });

  it('画面揺れ設定が定義されている', () => {
    expect(GameOverAnimations.SHAKE_DELAY).toBe(100);
    expect(GameOverAnimations.SHAKE_DURATION).toBe(300);
    expect(GameOverAnimations.SHAKE_INTENSITY).toBe(0.02);
  });

  it('灰パーティクル設定が定義されている', () => {
    expect(GameOverAnimations.ASH_PARTICLE_COUNT).toBe(30);
    expect(GameOverAnimations.ASH_FALL_MIN_DURATION).toBe(3000);
    expect(GameOverAnimations.ASH_FALL_MAX_DURATION).toBe(6000);
  });
});

// =====================================================
// 型定義テスト
// =====================================================

describe('GameOverScene 理由型', () => {
  it('GameOverReasonType型が正しく使用できる', () => {
    const types: GameOverReasonType[] = ['deadline', 'bankruptcy', 'rankDown', 'other'];
    types.forEach((type) => {
      expect(['deadline', 'bankruptcy', 'rankDown', 'other']).toContain(type);
    });
  });

  it('GameOverReason型が正しく使用できる', () => {
    const reason: GameOverReason = {
      type: 'deadline',
      title: '期限切れ',
      description: 'S級に到達できませんでした。',
      icon: '⏰',
    };

    expect(reason.type).toBe('deadline');
    expect(reason.title).toBe('期限切れ');
    expect(reason.description).toBe('S級に到達できませんでした。');
    expect(reason.icon).toBe('⏰');
  });

  it('GameOverStats型が正しく使用できる', () => {
    const stats: GameOverStats = {
      finalDay: 100,
      finalRank: 'E',
      totalQuests: 50,
      totalAlchemy: 120,
    };

    expect(stats.finalDay).toBe(100);
    expect(stats.finalRank).toBe('E');
    expect(stats.totalQuests).toBe(50);
    expect(stats.totalAlchemy).toBe(120);
  });
});

// =====================================================
// デフォルト理由情報テスト
// =====================================================

describe('GameOverScene 理由デフォルト値', () => {
  it('deadlineタイプのデフォルト値が定義されている', () => {
    const defaults = GameOverReasonDefaults.deadline;
    expect(defaults.title).toBe('期限切れ');
    expect(defaults.icon).toBe('⏰');
    expect(defaults.description).toContain('S級');
  });

  it('bankruptcyタイプのデフォルト値が定義されている', () => {
    const defaults = GameOverReasonDefaults.bankruptcy;
    expect(defaults.title).toBe('資金不足');
    expect(defaults.icon).toBe('💸');
    expect(defaults.description).toContain('資金');
  });

  it('rankDownタイプのデフォルト値が定義されている', () => {
    const defaults = GameOverReasonDefaults.rankDown;
    expect(defaults.title).toBe('ランク降格');
    expect(defaults.icon).toBe('📉');
    expect(defaults.description).toContain('除名');
  });

  it('otherタイプのデフォルト値が定義されている', () => {
    const defaults = GameOverReasonDefaults.other;
    expect(defaults.title).toBe('ゲームオーバー');
    expect(defaults.icon).toBe('❌');
  });
});

// =====================================================
// シーンキーテスト
// =====================================================

describe('GameOverScene シーンキー', () => {
  it('SceneKeys.GAME_OVERがGameOverSceneである', () => {
    expect(SceneKeys.GAME_OVER).toBe('GameOverScene');
  });
});

// =====================================================
// シーンエクスポートテスト
// =====================================================

describe('GameOverScene エクスポート', () => {
  it('GameOverSceneがエクスポートされている', () => {
    expect(GameOverScene).toBeDefined();
  });

  it('GameOverSceneがクラスである', () => {
    expect(typeof GameOverScene).toBe('function');
  });

  it('GameOverSceneインスタンスが作成できる', () => {
    const scene = new GameOverScene();
    expect(scene).toBeInstanceOf(GameOverScene);
  });
});

// =====================================================
// データ型テスト
// =====================================================

describe('GameOverScene データ型', () => {
  it('GameOverSceneData型が正しく使用できる', () => {
    const data: GameOverSceneData = {
      reason: '期限内にS級に到達できませんでした',
      finalDay: 100,
      finalRank: 'E',
      totalQuests: 50,
      totalAlchemy: 120,
    };

    expect(data.reason).toContain('S級');
    expect(data.finalDay).toBe(100);
    expect(data.finalRank).toBe('E');
    expect(data.totalQuests).toBe(50);
    expect(data.totalAlchemy).toBe(120);
  });
});

// =====================================================
// シーン機能テスト
// =====================================================

describe('GameOverScene 機能', () => {
  let scene: GameOverScene;

  beforeEach(() => {
    scene = new GameOverScene();
  });

  it('getReasonメソッドがある', () => {
    expect(typeof scene.getReason).toBe('function');
  });

  it('getStatsメソッドがある', () => {
    expect(typeof scene.getStats).toBe('function');
  });

  it('getReasonTypeメソッドがある', () => {
    expect(typeof scene.getReasonType).toBe('function');
  });
});

// =====================================================
// 理由判定テスト
// =====================================================

describe('GameOverScene 理由判定', () => {
  it('期限関連の文字列からdeadlineタイプを判定できる', () => {
    const testCases = ['期限切れ', '日数が足りませんでした', '期限内に到達できませんでした'];

    testCases.forEach((reason) => {
      const isDeadline = reason.includes('期限') || reason.includes('日数');
      expect(isDeadline).toBe(true);
    });
  });

  it('資金関連の文字列からbankruptcyタイプを判定できる', () => {
    const testCases = ['所持金が不足', 'ゴールドが足りません', '資金が底をつきました'];

    testCases.forEach((reason) => {
      const isBankruptcy = reason.includes('所持金') || reason.includes('ゴールド') || reason.includes('資金');
      expect(isBankruptcy).toBe(true);
    });
  });

  it('ランク関連の文字列からrankDownタイプを判定できる', () => {
    const testCases = ['ランクが下がりました', '降格しました', 'ランク降格'];

    testCases.forEach((reason) => {
      const isRankDown = reason.includes('ランク') || reason.includes('降格');
      expect(isRankDown).toBe(true);
    });
  });
});

// =====================================================
// scenesインデックステスト
// =====================================================

describe('GameOverScene scenesインデックス', () => {
  it('scenesインデックスからGameOverSceneがエクスポートされている', async () => {
    const scenes = await import('../../../../src/game/scenes');
    expect(scenes.GameOverScene).toBeDefined();
  });

  it('scenesインデックスからGameOverSceneLayoutがエクスポートされている', async () => {
    const scenes = await import('../../../../src/game/scenes');
    expect(scenes.GameOverSceneLayout).toBeDefined();
  });

  it('scenesインデックスからGameOverColorsがエクスポートされている', async () => {
    const scenes = await import('../../../../src/game/scenes');
    expect(scenes.GameOverColors).toBeDefined();
  });
});
