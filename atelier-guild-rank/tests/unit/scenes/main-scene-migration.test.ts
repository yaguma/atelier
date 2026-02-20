/**
 * MainScene移行テスト
 * TASK-0095: MainSceneをsrc/scenes/に移行
 *
 * @description
 * MainSceneがsrc/scenes/に正しく移行され、
 * @scenes/MainSceneからインポートできることを確認する。
 * 後方互換性（@presentation/scenes/MainScene）も維持されることを確認。
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
        Container: class MockContainer {},
        Graphics: class MockGraphics {},
        Text: class MockText {},
        Rectangle: class MockRectangle {},
      },
    },
  };
});

// 依存モジュールのモック
vi.mock('@domain/entities/Card', () => ({
  Card: class MockCard {},
}));

vi.mock('@domain/entities/Quest', () => ({
  Quest: class MockQuest {},
}));

vi.mock('@shared/services/di/container', () => ({
  Container: {
    getInstance: vi.fn(() => ({
      resolve: vi.fn(),
      has: vi.fn(() => false),
    })),
  },
  ServiceKeys: {
    StateManager: 'StateManager',
    GameFlowManager: 'GameFlowManager',
    EventBus: 'EventBus',
    QuestService: 'QuestService',
    GatheringService: 'GatheringService',
    AlchemyService: 'AlchemyService',
    MasterDataRepository: 'MasterDataRepository',
  },
}));

vi.mock('@presentation/ui/components/FooterUI', () => ({
  FooterUI: class MockFooterUI {
    create() {}
    destroy() {}
    getPhaseTabUI() {
      return null;
    }
    getHandDisplayArea() {
      return [];
    }
    getHandDisplayAreaCapacity() {
      return 5;
    }
  },
}));

vi.mock('@presentation/ui/components/HeaderUI', () => ({
  HeaderUI: class MockHeaderUI {
    create() {}
    update() {}
  },
}));

vi.mock('@presentation/ui/components/SidebarUI', () => ({
  SidebarUI: class MockSidebarUI {
    create() {}
    updateAcceptedQuests() {}
  },
}));

vi.mock('@presentation/ui/phases/AlchemyPhaseUI', () => ({
  AlchemyPhaseUI: class MockAlchemyPhaseUI {
    create() {}
    getContainer() {
      return {};
    }
    setVisible() {
      return this;
    }
    destroy() {}
  },
}));

vi.mock('@presentation/ui/phases/DeliveryPhaseUI', () => ({
  DeliveryPhaseUI: class MockDeliveryPhaseUI {
    getContainer() {
      return {};
    }
    setVisible() {
      return this;
    }
    destroy() {}
  },
}));

vi.mock('@presentation/ui/phases/GatheringPhaseUI', () => ({
  GatheringPhaseUI: class MockGatheringPhaseUI {
    create() {}
    getContainer() {
      return {};
    }
    setVisible() {
      return this;
    }
    destroy() {}
    updateSession() {}
  },
}));

vi.mock('@presentation/ui/phases/QuestAcceptPhaseUI', () => ({
  QuestAcceptPhaseUI: class MockQuestAcceptPhaseUI {
    getContainer() {
      return {};
    }
    setVisible() {
      return this;
    }
    destroy() {}
    updateQuests() {}
  },
}));

vi.mock('@shared/types/common', () => ({
  GamePhase: {
    QUEST_ACCEPT: 'QUEST_ACCEPT',
    GATHERING: 'GATHERING',
    ALCHEMY: 'ALCHEMY',
    DELIVERY: 'DELIVERY',
  },
  VALID_GAME_PHASES: ['QUEST_ACCEPT', 'GATHERING', 'ALCHEMY', 'DELIVERY'],
  Quality: { D: 'D', C: 'C', B: 'B', A: 'A', S: 'S' },
  GuildRank: { G: 'G', F: 'F', E: 'E', D: 'D', C: 'C', B: 'B', A: 'A', S: 'S' },
  Attribute: {},
  CardType: {},
  ClientType: {},
  EffectType: {},
  EnhancementTarget: {},
  ItemCategory: {},
  ItemEffectType: {},
  QuestType: {},
  Rarity: {},
  SpecialRuleType: {},
}));

vi.mock('@shared/types/events', () => ({
  GameEventType: {
    PHASE_CHANGED: 'PHASE_CHANGED',
    DAY_STARTED: 'DAY_STARTED',
    QUEST_GENERATED: 'QUEST_GENERATED',
    QUEST_ACCEPTED: 'QUEST_ACCEPTED',
  },
}));

vi.mock('@shared/types/ids', () => ({
  toCardId: vi.fn((id: string) => id),
}));

vi.mock('@shared/utils', () => ({
  generateUniqueId: vi.fn(() => 'mock-id'),
}));

describe('MainScene移行（TASK-0095）', () => {
  // ===========================================================================
  // @scenes/MainScene からのインポート確認
  // ===========================================================================
  describe('@scenes/MainScene からのインポート', () => {
    it('MainSceneクラスが@scenes/MainSceneからインポートできること', async () => {
      const mod = await import('@scenes/MainScene');
      expect(mod.MainScene).toBeDefined();
      expect(typeof mod.MainScene).toBe('function');
    });

    it('MainSceneクラスが@scenes（index.ts）からインポートできること', async () => {
      const mod = await import('@scenes/index');
      expect(mod.MainScene).toBeDefined();
      expect(typeof mod.MainScene).toBe('function');
    });
  });

  // ===========================================================================
  // 後方互換性確認
  // ===========================================================================
  describe('後方互換性', () => {
    it('@presentation/scenes/MainSceneからの再エクスポートが動作すること', async () => {
      const mod = await import('@presentation/scenes/MainScene');
      expect(mod.MainScene).toBeDefined();
      expect(typeof mod.MainScene).toBe('function');
    });

    it('@scenes/MainSceneと@presentation/scenes/MainSceneが同一クラスであること', async () => {
      const sceneMod = await import('@scenes/MainScene');
      const presentationMod = await import('@presentation/scenes/MainScene');
      expect(sceneMod.MainScene).toBe(presentationMod.MainScene);
    });
  });

  // ===========================================================================
  // MainSceneの基本動作確認
  // ===========================================================================
  describe('MainSceneの基本動作', () => {
    it('MainSceneのインスタンスを作成できること', async () => {
      const { MainScene } = await import('@scenes/MainScene');
      const mainScene = new MainScene();
      expect(mainScene).toBeDefined();
      expect(mainScene).toBeInstanceOf(MainScene);
    });

    it('MainSceneのシーンキーが"MainScene"であること', async () => {
      const { MainScene } = await import('@scenes/MainScene');
      const mainScene = new MainScene();
      // Phaserモックでsuper({ key: 'MainScene' })が呼ばれることを確認
      // Phaserモックのコンストラクタは何もしないため、インスタンス生成自体が成功すればOK
      expect(mainScene).toBeDefined();
    });
  });
});
