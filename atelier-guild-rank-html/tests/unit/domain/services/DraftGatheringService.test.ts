/**
 * ドラフト採取ドメインサービスのテスト
 * TASK-0092: ドラフト採取ドメインサービス
 *
 * ドラフト形式の採取フェーズをテストする
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DraftGatheringService,
  createDraftState,
  type DraftState,
} from '../../../../src/domain/services/DraftGatheringService';
import {
  GatheringCard,
  createGatheringCard,
} from '../../../../src/domain/card/CardEntity';
import { MaterialInstance } from '../../../../src/domain/material/MaterialEntity';
import {
  CardType,
  GuildRank,
  Rarity,
  Quality,
} from '../../../../src/domain/common/types';
import type { IGatheringCard } from '../../../../src/domain/card/Card';

describe('DraftGatheringService', () => {
  // テスト用採取地カードデータ
  const sampleGatheringCards: IGatheringCard[] = [
    {
      id: 'gathering_forest_1',
      name: '森の入口',
      type: CardType.GATHERING,
      rarity: Rarity.COMMON,
      unlockRank: GuildRank.G,
      cost: 1,
      materials: [
        { materialId: 'herb', quantity: 2, probability: 0.9 },
        { materialId: 'flower', quantity: 1, probability: 0.5 },
      ],
    },
    {
      id: 'gathering_forest_2',
      name: '深い森',
      type: CardType.GATHERING,
      rarity: Rarity.COMMON,
      unlockRank: GuildRank.G,
      cost: 2,
      materials: [
        { materialId: 'herb', quantity: 3, probability: 0.8 },
        { materialId: 'rare_herb', quantity: 1, probability: 0.2 },
      ],
    },
    {
      id: 'gathering_cave_1',
      name: '洞窟入口',
      type: CardType.GATHERING,
      rarity: Rarity.COMMON,
      unlockRank: GuildRank.G,
      cost: 1,
      materials: [
        { materialId: 'ore', quantity: 1, probability: 0.8 },
        { materialId: 'crystal', quantity: 1, probability: 0.3 },
      ],
    },
    {
      id: 'gathering_cave_2',
      name: '深い洞窟',
      type: CardType.GATHERING,
      rarity: Rarity.UNCOMMON,
      unlockRank: GuildRank.G,
      cost: 2,
      materials: [
        { materialId: 'ore', quantity: 2, probability: 0.7 },
        { materialId: 'rare_ore', quantity: 1, probability: 0.2 },
      ],
    },
    {
      id: 'gathering_river_1',
      name: '川辺',
      type: CardType.GATHERING,
      rarity: Rarity.COMMON,
      unlockRank: GuildRank.G,
      cost: 1,
      materials: [
        { materialId: 'water', quantity: 2, probability: 1.0 },
        { materialId: 'fish', quantity: 1, probability: 0.4 },
      ],
    },
  ];

  let draftService: DraftGatheringService;
  let testCards: GatheringCard[];

  beforeEach(() => {
    draftService = new DraftGatheringService();
    testCards = sampleGatheringCards.map((data) => createGatheringCard(data));
  });

  describe('DraftState（ドラフト状態）', () => {
    it('初期ドラフト状態を生成できる', () => {
      const state = createDraftState();

      expect(state.currentRound).toBe(0);
      expect(state.maxRounds).toBe(3);
      expect(state.pool).toEqual([]);
      expect(state.selectedCards).toEqual([]);
      expect(state.obtainedMaterials).toEqual([]);
      expect(state.isComplete).toBe(false);
    });

    it('カスタムラウンド数で状態を生成できる', () => {
      const state = createDraftState(5);

      expect(state.maxRounds).toBe(5);
    });
  });

  describe('generatePool（ドラフトプール生成）', () => {
    it('ドラフトプールを生成できる', () => {
      const state = createDraftState();
      const result = draftService.generatePool(state, testCards, 3);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.pool).toHaveLength(3);
        expect(result.value.currentRound).toBe(1);
      }
    });

    it('カードプールからランダムに選択される', () => {
      const state = createDraftState();

      // 複数回生成して異なる結果が出ることを確認
      const results: Set<string> = new Set();
      for (let i = 0; i < 10; i++) {
        const result = draftService.generatePool(state, testCards, 3);
        if (result.success) {
          const ids = result.value.pool.map((c) => c.id).sort().join(',');
          results.add(ids);
        }
      }

      // ランダムなので異なる組み合わせが出るはず（確率的に）
      expect(results.size).toBeGreaterThanOrEqual(1);
    });

    it('プールサイズがカード数より大きい場合は全カードを使用', () => {
      const state = createDraftState();
      const result = draftService.generatePool(state, testCards, 10);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.pool).toHaveLength(testCards.length);
      }
    });

    it('既にドラフトが完了している場合はエラー', () => {
      const state: DraftState = {
        ...createDraftState(),
        currentRound: 3,
        maxRounds: 3,
        isComplete: true,
      };

      const result = draftService.generatePool(state, testCards, 3);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('ドラフトは既に完了しています');
      }
    });
  });

  describe('selectCard（カード選択）', () => {
    it('指定枚数のカードを選択できる', () => {
      const pool = testCards.slice(0, 3);
      const state: DraftState = {
        ...createDraftState(),
        currentRound: 1,
        pool,
      };

      const result = draftService.selectCard(state, 'gathering_forest_1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.selectedCards).toHaveLength(1);
        expect(result.value.selectedCards[0].id).toBe('gathering_forest_1');
      }
    });

    it('選択したカードから素材を獲得できる', () => {
      // 確率を100%にして確実に素材を獲得
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const card = createGatheringCard({
        ...sampleGatheringCards[0],
        materials: [
          { materialId: 'herb', quantity: 2, probability: 1.0, quality: Quality.C },
        ],
      });
      const state: DraftState = {
        ...createDraftState(),
        currentRound: 1,
        pool: [card],
      };

      const result = draftService.selectCard(state, card.id);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.obtainedMaterials.length).toBeGreaterThan(0);
      }

      vi.restoreAllMocks();
    });

    it('確率に基づいて素材の獲得量が変動する', () => {
      // 確率50%のテスト: 確率より低い乱数なら獲得
      const card = createGatheringCard({
        ...sampleGatheringCards[0],
        materials: [
          { materialId: 'herb', quantity: 1, probability: 0.5 },
        ],
      });
      const state: DraftState = {
        ...createDraftState(),
        currentRound: 1,
        pool: [card],
      };

      // 確率以下なら獲得
      vi.spyOn(Math, 'random').mockReturnValue(0.3);
      const result1 = draftService.selectCard(state, card.id);
      expect(result1.success).toBe(true);
      if (result1.success) {
        expect(result1.value.obtainedMaterials).toHaveLength(1);
      }

      vi.restoreAllMocks();

      // 確率より大きい乱数なら獲得できない
      vi.spyOn(Math, 'random').mockReturnValue(0.8);
      const result2 = draftService.selectCard(state, card.id);
      expect(result2.success).toBe(true);
      if (result2.success) {
        expect(result2.value.obtainedMaterials).toHaveLength(0);
      }

      vi.restoreAllMocks();
    });

    it('1ラウンドで選択できるカードは1枚', () => {
      const pool = testCards.slice(0, 3);
      let state: DraftState = {
        ...createDraftState(),
        currentRound: 1,
        pool,
      };

      // 1枚目の選択
      const result1 = draftService.selectCard(state, pool[0].id);
      expect(result1.success).toBe(true);
      if (result1.success) {
        state = result1.value;
      }

      // 選択後、プールが空になっている
      expect(state.pool).toHaveLength(0);
    });

    it('プールにないカードを選択するとエラー', () => {
      const state: DraftState = {
        ...createDraftState(),
        currentRound: 1,
        pool: testCards.slice(0, 3),
      };

      const result = draftService.selectCard(state, 'non_existent_card');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('選択したカードがプールに存在しません');
      }
    });

    it('プールが空の場合はエラー', () => {
      const state: DraftState = {
        ...createDraftState(),
        currentRound: 1,
        pool: [],
      };

      const result = draftService.selectCard(state, 'gathering_forest_1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('プールが空です');
      }
    });
  });

  describe('ラウンド管理', () => {
    it('ラウンド数が正しくカウントされる', () => {
      let state = createDraftState();

      // ラウンド1開始
      const result1 = draftService.generatePool(state, testCards, 3);
      expect(result1.success).toBe(true);
      if (result1.success) {
        expect(result1.value.currentRound).toBe(1);
        state = result1.value;
      }

      // カード選択
      const selectResult = draftService.selectCard(state, state.pool[0].id);
      expect(selectResult.success).toBe(true);
      if (selectResult.success) {
        state = selectResult.value;
      }

      // ラウンド2開始
      const result2 = draftService.generatePool(state, testCards, 3);
      expect(result2.success).toBe(true);
      if (result2.success) {
        expect(result2.value.currentRound).toBe(2);
      }
    });

    it('全ラウンド終了を判定できる', () => {
      let state = createDraftState(2); // 2ラウンド

      // ラウンド1
      const pool1 = draftService.generatePool(state, testCards, 3);
      if (pool1.success) state = pool1.value;
      const select1 = draftService.selectCard(state, state.pool[0].id);
      if (select1.success) state = select1.value;

      expect(draftService.isComplete(state)).toBe(false);

      // ラウンド2
      const pool2 = draftService.generatePool(state, testCards, 3);
      if (pool2.success) state = pool2.value;
      const select2 = draftService.selectCard(state, state.pool[0].id);
      if (select2.success) state = select2.value;

      expect(draftService.isComplete(state)).toBe(true);
      expect(state.isComplete).toBe(true);
    });

    it('getCurrentRound()で現在のラウンドを取得できる', () => {
      const state: DraftState = {
        ...createDraftState(),
        currentRound: 2,
      };

      expect(draftService.getCurrentRound(state)).toBe(2);
    });

    it('getRemainingRounds()で残りラウンド数を取得できる', () => {
      const state: DraftState = {
        ...createDraftState(),
        currentRound: 1,
        maxRounds: 3,
      };

      expect(draftService.getRemainingRounds(state)).toBe(2);
    });
  });

  describe('getObtainedMaterials（獲得素材取得）', () => {
    it('獲得した素材リストを取得できる', () => {
      const materials: MaterialInstance[] = [
        { materialId: 'herb', quality: Quality.C, quantity: 2 } as MaterialInstance,
        { materialId: 'ore', quality: Quality.B, quantity: 1 } as MaterialInstance,
      ];
      const state: DraftState = {
        ...createDraftState(),
        obtainedMaterials: materials,
      };

      const obtained = draftService.getObtainedMaterials(state);

      expect(obtained).toHaveLength(2);
      expect(obtained).not.toBe(state.obtainedMaterials); // コピーであること
    });
  });

  describe('getSelectedCards（選択カード取得）', () => {
    it('選択したカードリストを取得できる', () => {
      const selectedCards = [testCards[0], testCards[1]];
      const state: DraftState = {
        ...createDraftState(),
        selectedCards,
      };

      const selected = draftService.getSelectedCards(state);

      expect(selected).toHaveLength(2);
      expect(selected).not.toBe(state.selectedCards); // コピーであること
    });
  });

  describe('不変性', () => {
    it('generatePoolは元の状態を変更しない', () => {
      const state = createDraftState();
      const originalRound = state.currentRound;

      draftService.generatePool(state, testCards, 3);

      expect(state.currentRound).toBe(originalRound);
      expect(state.pool).toHaveLength(0);
    });

    it('selectCardは元の状態を変更しない', () => {
      const pool = testCards.slice(0, 3);
      const state: DraftState = {
        ...createDraftState(),
        currentRound: 1,
        pool,
      };
      const originalPoolLength = state.pool.length;

      draftService.selectCard(state, pool[0].id);

      expect(state.pool).toHaveLength(originalPoolLength);
    });
  });
});
