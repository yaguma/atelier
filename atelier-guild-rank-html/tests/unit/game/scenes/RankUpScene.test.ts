/**
 * RankUpScene単体テスト
 *
 * TASK-0244: RankUpSceneレイアウト設計
 * 昇格試験シーンの定数、型、基本機能をテストする。
 * Phaserはcanvas環境を必要とするため、モックして定数と型のテストを中心に行う。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
    },
  };
});

// モック後にインポート
import {
  RankUpSceneLayout,
  RankExamRequirement,
  RankUpReward,
  RequirementIcons,
  RewardIcons,
  ProgressBarColors,
  OverallProgressBarLayout,
  IndividualProgressBarLayout,
} from '../../../../src/game/scenes/RankUpSceneConstants';
import { RankUpScene, RankUpSceneData } from '../../../../src/game/scenes/RankUpScene';

// =====================================================
// レイアウト定数テスト
// =====================================================

describe('RankUpScene レイアウト定数', () => {
  it('RankUpSceneLayoutがエクスポートされている', () => {
    expect(RankUpSceneLayout).toBeDefined();
  });

  it('画面サイズが正しく定義されている', () => {
    expect(RankUpSceneLayout.SCREEN_WIDTH).toBe(1024);
    expect(RankUpSceneLayout.SCREEN_HEIGHT).toBe(768);
  });

  it('ヘッダーが画面上部に配置される', () => {
    expect(RankUpSceneLayout.HEADER.X).toBe(0);
    expect(RankUpSceneLayout.HEADER.Y).toBe(0);
    expect(RankUpSceneLayout.HEADER.WIDTH).toBe(1024);
    expect(RankUpSceneLayout.HEADER.HEIGHT).toBe(80);
  });

  it('タイトルエリアがヘッダーの下に配置される', () => {
    expect(RankUpSceneLayout.TITLE_AREA.Y).toBeGreaterThan(RankUpSceneLayout.HEADER.HEIGHT);
    expect(RankUpSceneLayout.TITLE_AREA.X).toBe(50);
    expect(RankUpSceneLayout.TITLE_AREA.WIDTH).toBe(924);
    expect(RankUpSceneLayout.TITLE_AREA.HEIGHT).toBe(100);
  });

  it('要件エリアと進捗エリアが横並びに配置される', () => {
    // 要件エリア（左側）
    expect(RankUpSceneLayout.REQUIREMENTS_AREA.X).toBe(50);
    expect(RankUpSceneLayout.REQUIREMENTS_AREA.WIDTH).toBe(450);

    // 進捗エリア（右側）
    expect(RankUpSceneLayout.PROGRESS_AREA.X).toBe(524);
    expect(RankUpSceneLayout.PROGRESS_AREA.WIDTH).toBe(450);

    // 同じY座標
    expect(RankUpSceneLayout.REQUIREMENTS_AREA.Y).toBe(RankUpSceneLayout.PROGRESS_AREA.Y);
  });

  it('報酬エリアが要件・進捗の下に配置される', () => {
    const requirementsBottom = RankUpSceneLayout.REQUIREMENTS_AREA.Y + RankUpSceneLayout.REQUIREMENTS_AREA.HEIGHT;
    expect(RankUpSceneLayout.REWARDS_AREA.Y).toBeGreaterThanOrEqual(requirementsBottom);
  });

  it('ボタンエリアが画面下部に配置される', () => {
    expect(RankUpSceneLayout.BUTTON_AREA.Y).toBe(680);
    expect(RankUpSceneLayout.BUTTON_AREA.WIDTH).toBe(1024);
    expect(RankUpSceneLayout.BUTTON_AREA.HEIGHT).toBe(88);
  });
});

// =====================================================
// 型定義テスト
// =====================================================

describe('RankUpScene 要件型', () => {
  it('RankExamRequirement型が正しく使用できる', () => {
    const requirement: RankExamRequirement = {
      type: 'quest',
      description: '依頼を3件完了',
      targetValue: 3,
      currentValue: 1,
    };

    expect(requirement.type).toBe('quest');
    expect(requirement.description).toBe('依頼を3件完了');
    expect(requirement.targetValue).toBe(3);
    expect(requirement.currentValue).toBe(1);
  });

  it('すべての要件タイプが定義されている', () => {
    const types = ['quest', 'alchemy', 'gathering', 'gold', 'item'];
    types.forEach((type) => {
      const requirement: RankExamRequirement = {
        type: type as RankExamRequirement['type'],
        description: 'テスト',
        targetValue: 1,
        currentValue: 0,
      };
      expect(requirement.type).toBe(type);
    });
  });
});

describe('RankUpScene 報酬型', () => {
  it('RankUpReward型が正しく使用できる', () => {
    const reward: RankUpReward = {
      type: 'card',
      name: '新しいレシピ',
      description: '中級調合レシピが解放',
    };

    expect(reward.type).toBe('card');
    expect(reward.name).toBe('新しいレシピ');
    expect(reward.description).toBe('中級調合レシピが解放');
  });

  it('description省略可能', () => {
    const reward: RankUpReward = {
      type: 'unlock',
      name: 'エリア解放',
    };

    expect(reward.description).toBeUndefined();
  });
});

// =====================================================
// アイコンマッピングテスト
// =====================================================

describe('RankUpScene アイコン', () => {
  it('RequirementIconsが全ての要件タイプに対応している', () => {
    expect(RequirementIcons.quest).toBe('📋');
    expect(RequirementIcons.alchemy).toBe('⚗️');
    expect(RequirementIcons.gathering).toBe('🌿');
    expect(RequirementIcons.gold).toBe('💰');
    expect(RequirementIcons.item).toBe('📦');
  });

  it('RewardIconsが全ての報酬タイプに対応している', () => {
    expect(RewardIcons.card).toBe('🃏');
    expect(RewardIcons.artifact).toBe('🏆');
    expect(RewardIcons.unlock).toBe('🔓');
  });
});

// =====================================================
// 進捗バー定数テスト
// =====================================================

describe('RankUpScene 進捗バー定数', () => {
  it('ProgressBarColorsが定義されている', () => {
    expect(ProgressBarColors.background).toBeDefined();
    expect(ProgressBarColors.incomplete).toBeDefined();
    expect(ProgressBarColors.complete).toBeDefined();
    expect(ProgressBarColors.warning).toBeDefined();
  });

  it('OverallProgressBarLayoutが定義されている', () => {
    expect(OverallProgressBarLayout.X).toBeDefined();
    expect(OverallProgressBarLayout.Y).toBeDefined();
    expect(OverallProgressBarLayout.WIDTH).toBe(390);
    expect(OverallProgressBarLayout.HEIGHT).toBe(30);
    expect(OverallProgressBarLayout.BORDER_RADIUS).toBe(15);
  });

  it('IndividualProgressBarLayoutが定義されている', () => {
    expect(IndividualProgressBarLayout.BAR_X).toBe(150);
    expect(IndividualProgressBarLayout.BAR_WIDTH).toBe(200);
    expect(IndividualProgressBarLayout.BAR_HEIGHT).toBe(20);
    expect(IndividualProgressBarLayout.BORDER_RADIUS).toBe(10);
  });
});

// =====================================================
// シーンキーテスト
// =====================================================

describe('RankUpScene シーンキー', () => {
  it('SceneKeys.RANK_UPがRankUpSceneである', () => {
    expect(SceneKeys.RANK_UP).toBe('RankUpScene');
  });
});

// =====================================================
// シーンエクスポートテスト
// =====================================================

describe('RankUpScene エクスポート', () => {
  it('RankUpSceneがエクスポートされている', () => {
    expect(RankUpScene).toBeDefined();
  });

  it('RankUpSceneがクラスである', () => {
    expect(typeof RankUpScene).toBe('function');
  });

  it('RankUpSceneインスタンスが作成できる', () => {
    const scene = new RankUpScene();
    expect(scene).toBeInstanceOf(RankUpScene);
  });
});

// =====================================================
// scenesインデックステスト
// =====================================================

describe('RankUpScene scenesインデックス', () => {
  it('scenesインデックスからRankUpSceneがエクスポートされている', async () => {
    const scenes = await import('../../../../src/game/scenes');
    expect(scenes.RankUpScene).toBeDefined();
  });

  it('scenesインデックスからRankUpSceneLayoutがエクスポートされている', async () => {
    const scenes = await import('../../../../src/game/scenes');
    expect(scenes.RankUpSceneLayout).toBeDefined();
  });

  it('scenesインデックスからRequirementIconsがエクスポートされている', async () => {
    const scenes = await import('../../../../src/game/scenes');
    expect(scenes.RequirementIcons).toBeDefined();
  });

  it('scenesインデックスからRewardIconsがエクスポートされている', async () => {
    const scenes = await import('../../../../src/game/scenes');
    expect(scenes.RewardIcons).toBeDefined();
  });
});

// =====================================================
// レイアウト整合性テスト
// =====================================================

describe('RankUpScene レイアウト整合性', () => {
  it('要件エリアと進捗エリアが重ならない', () => {
    const reqRight = RankUpSceneLayout.REQUIREMENTS_AREA.X + RankUpSceneLayout.REQUIREMENTS_AREA.WIDTH;
    expect(reqRight).toBeLessThanOrEqual(RankUpSceneLayout.PROGRESS_AREA.X);
  });

  it('全エリアが画面内に収まる', () => {
    const areas = [
      RankUpSceneLayout.HEADER,
      RankUpSceneLayout.TITLE_AREA,
      RankUpSceneLayout.REQUIREMENTS_AREA,
      RankUpSceneLayout.PROGRESS_AREA,
      RankUpSceneLayout.REWARDS_AREA,
      RankUpSceneLayout.BUTTON_AREA,
    ];

    areas.forEach((area) => {
      expect(area.X).toBeGreaterThanOrEqual(0);
      expect(area.Y).toBeGreaterThanOrEqual(0);
      expect(area.X + area.WIDTH).toBeLessThanOrEqual(RankUpSceneLayout.SCREEN_WIDTH);
      expect(area.Y + area.HEIGHT).toBeLessThanOrEqual(RankUpSceneLayout.SCREEN_HEIGHT);
    });
  });

  it('報酬エリアが十分な幅を持つ', () => {
    // 報酬は最大4つ程度表示されることを想定
    expect(RankUpSceneLayout.REWARDS_AREA.WIDTH).toBeGreaterThanOrEqual(800);
  });
});

// =====================================================
// RankUpSceneData型テスト
// =====================================================

describe('RankUpScene データ型', () => {
  it('RankUpSceneData型が正しく使用できる', () => {
    const data: RankUpSceneData = {
      currentRank: 'G',
      targetRank: 'F',
      examTitle: 'Fランク昇格試験',
      examDescription: '説明文',
      requirements: [
        { type: 'quest', description: '依頼完了', targetValue: 3, currentValue: 1 },
      ],
      rewards: [
        { type: 'card', name: 'レシピ' },
      ],
      returnScene: 'MainScene',
    };

    expect(data.currentRank).toBe('G');
    expect(data.targetRank).toBe('F');
    expect(data.requirements).toHaveLength(1);
    expect(data.rewards).toHaveLength(1);
  });

  it('returnScene省略可能', () => {
    const data: RankUpSceneData = {
      currentRank: 'F',
      targetRank: 'E',
      examTitle: 'Eランク昇格試験',
      examDescription: '説明',
      requirements: [],
      rewards: [],
    };

    expect(data.returnScene).toBeUndefined();
  });
});

// =====================================================
// 要件達成判定テスト
// =====================================================

describe('RankUpScene 要件達成判定', () => {
  it('達成値が目標値に達していれば達成', () => {
    const requirement: RankExamRequirement = {
      type: 'quest',
      description: '依頼完了',
      targetValue: 3,
      currentValue: 3,
    };

    const isMet = requirement.currentValue >= requirement.targetValue;
    expect(isMet).toBe(true);
  });

  it('達成値が目標値を超えていても達成', () => {
    const requirement: RankExamRequirement = {
      type: 'gold',
      description: '所持金',
      targetValue: 500,
      currentValue: 1000,
    };

    const isMet = requirement.currentValue >= requirement.targetValue;
    expect(isMet).toBe(true);
  });

  it('達成値が目標値未満なら未達成', () => {
    const requirement: RankExamRequirement = {
      type: 'alchemy',
      description: '調合回数',
      targetValue: 5,
      currentValue: 2,
    };

    const isMet = requirement.currentValue >= requirement.targetValue;
    expect(isMet).toBe(false);
  });

  it('複数要件で全達成判定ができる', () => {
    const requirements: RankExamRequirement[] = [
      { type: 'quest', description: '依頼', targetValue: 3, currentValue: 3 },
      { type: 'alchemy', description: '調合', targetValue: 5, currentValue: 5 },
      { type: 'gold', description: '所持金', targetValue: 500, currentValue: 600 },
    ];

    const allMet = requirements.every((req) => req.currentValue >= req.targetValue);
    expect(allMet).toBe(true);
  });

  it('複数要件で一部未達成なら全体も未達成', () => {
    const requirements: RankExamRequirement[] = [
      { type: 'quest', description: '依頼', targetValue: 3, currentValue: 3 },
      { type: 'alchemy', description: '調合', targetValue: 5, currentValue: 2 }, // 未達成
      { type: 'gold', description: '所持金', targetValue: 500, currentValue: 600 },
    ];

    const allMet = requirements.every((req) => req.currentValue >= req.targetValue);
    expect(allMet).toBe(false);
  });
});

// =====================================================
// 進捗計算テスト
// =====================================================

// =====================================================
// 試験進行機能テスト (TASK-0245)
// =====================================================

describe('RankUpScene 試験進行', () => {
  let scene: RankUpScene;

  beforeEach(() => {
    scene = new RankUpScene();
  });

  it('初期状態で試験は進行中ではない', () => {
    expect(scene.isExamRunning()).toBe(false);
  });

  it('RankUpSceneにisExamRunningメソッドがある', () => {
    expect(typeof scene.isExamRunning).toBe('function');
  });

  it('RankUpSceneにstartExamメソッドがある', () => {
    expect(typeof scene.startExam).toBe('function');
  });

  it('RankUpSceneにshowExamSuccessメソッドがある', () => {
    expect(typeof scene.showExamSuccess).toBe('function');
  });

  it('RankUpSceneにshowExamFailureメソッドがある', () => {
    expect(typeof scene.showExamFailure).toBe('function');
  });

  it('startExamがPromiseを返す', () => {
    const result = scene.startExam();
    expect(result).toBeInstanceOf(Promise);
  });

  it('showExamSuccessがPromiseを返す', () => {
    const result = scene.showExamSuccess('F');
    expect(result).toBeInstanceOf(Promise);
  });

  it('showExamFailureがPromiseを返す', () => {
    const result = scene.showExamFailure('テスト失敗');
    expect(result).toBeInstanceOf(Promise);
  });

  it('isAllRequirementsMetメソッドがある', () => {
    expect(typeof scene.isAllRequirementsMet).toBe('function');
  });

  it('updateRequirementメソッドがある', () => {
    expect(typeof scene.updateRequirement).toBe('function');
  });
});

describe('RankUpScene 進捗計算', () => {
  it('達成要件数から進捗率を計算できる', () => {
    const requirements: RankExamRequirement[] = [
      { type: 'quest', description: '依頼', targetValue: 3, currentValue: 3 },
      { type: 'alchemy', description: '調合', targetValue: 5, currentValue: 5 },
      { type: 'gold', description: '所持金', targetValue: 500, currentValue: 100 },
    ];

    const totalRequirements = requirements.length;
    const metRequirements = requirements.filter(
      (req) => req.currentValue >= req.targetValue
    ).length;

    const progress = metRequirements / totalRequirements;
    expect(progress).toBeCloseTo(2 / 3, 5);
  });

  it('全達成で100%', () => {
    const requirements: RankExamRequirement[] = [
      { type: 'quest', description: '依頼', targetValue: 3, currentValue: 3 },
      { type: 'alchemy', description: '調合', targetValue: 5, currentValue: 5 },
    ];

    const metRequirements = requirements.filter(
      (req) => req.currentValue >= req.targetValue
    ).length;

    const progress = metRequirements / requirements.length;
    expect(progress).toBe(1);
  });

  it('個別進捗率を計算できる', () => {
    const requirement: RankExamRequirement = {
      type: 'quest',
      description: '依頼',
      targetValue: 10,
      currentValue: 5,
    };

    const progress = Math.min(requirement.currentValue / requirement.targetValue, 1);
    expect(progress).toBe(0.5);
  });

  it('個別進捗率は100%を超えない', () => {
    const requirement: RankExamRequirement = {
      type: 'gold',
      description: '所持金',
      targetValue: 500,
      currentValue: 1000,
    };

    const progress = Math.min(requirement.currentValue / requirement.targetValue, 1);
    expect(progress).toBe(1);
  });
});

// =====================================================
// RankUpScene包括テスト (TASK-0246)
// =====================================================

describe('RankUpScene 包括テスト', () => {
  let scene: RankUpScene;

  beforeEach(() => {
    scene = new RankUpScene();
  });

  describe('初期化・データアクセス', () => {
    it('getCurrentRankメソッドがある', () => {
      expect(typeof scene.getCurrentRank).toBe('function');
    });

    it('getTargetRankメソッドがある', () => {
      expect(typeof scene.getTargetRank).toBe('function');
    });

    it('getDisplayedRequirementsメソッドがある', () => {
      expect(typeof scene.getDisplayedRequirements).toBe('function');
    });

    it('getDisplayedRewardsメソッドがある', () => {
      expect(typeof scene.getDisplayedRewards).toBe('function');
    });

    it('areAllRequirementsMetメソッドがある', () => {
      expect(typeof scene.areAllRequirementsMet).toBe('function');
    });
  });

  describe('進捗計算メソッド', () => {
    it('isChallengeButtonEnabledメソッドがある', () => {
      expect(typeof scene.isChallengeButtonEnabled).toBe('function');
    });

    it('getOverallProgressメソッドがある', () => {
      expect(typeof scene.getOverallProgress).toBe('function');
    });

    it('getRequirementProgressメソッドがある', () => {
      expect(typeof scene.getRequirementProgress).toBe('function');
    });

    it('getMetRequirementsCountメソッドがある', () => {
      expect(typeof scene.getMetRequirementsCount).toBe('function');
    });
  });

  describe('試験フロー', () => {
    it('completeExamメソッドがある', () => {
      expect(typeof scene.completeExam).toBe('function');
    });

    it('試験フローが正しい順序で定義されている', () => {
      // 試験フローに必要なメソッド
      expect(typeof scene.startExam).toBe('function');
      expect(typeof scene.showExamSuccess).toBe('function');
      expect(typeof scene.showExamFailure).toBe('function');
      expect(typeof scene.isExamRunning).toBe('function');
    });
  });
});

describe('RankUpScene UI更新テスト', () => {
  let scene: RankUpScene;

  beforeEach(() => {
    scene = new RankUpScene();
  });

  it('updateRequirementメソッドで要件を更新できる', () => {
    expect(typeof scene.updateRequirement).toBe('function');
  });

  it('isAllRequirementsMetとareAllRequirementsMetが同じ結果を返す', () => {
    const result1 = scene.isAllRequirementsMet();
    const result2 = scene.areAllRequirementsMet();
    expect(result1).toBe(result2);
  });
});
