/**
 * DraftGatheringUseCaseテスト
 * TASK-0107: ドラフト採取ユースケース
 *
 * ドラフト形式での素材採取処理をテストする
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  DraftGatheringUseCase,
  createDraftGatheringUseCase,
  DraftState,
} from '@application/DraftGatheringUseCase';
import { StateManager, createStateManager } from '@application/StateManager';
import { EventBus, createEventBus } from '@domain/events/GameEvents';
import { GuildRank, CardType, Rarity } from '@domain/common/types';
import { GatheringCard, createGatheringCard } from '@domain/card/CardEntity';
import { IGatheringCard } from '@domain/card/Card';

describe('DraftGatheringUseCase', () => {
  let draftGatheringUseCase: DraftGatheringUseCase;
  let stateManager: StateManager;
  let eventBus: EventBus;

  // テスト用の採取地カードデータ
  const createTestGatheringCard = (id: string): IGatheringCard => ({
    id,
    name: `採取地${id}`,
    type: CardType.GATHERING,
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.G,
    cost: 1,
    materials: [
      {
        materialId: `material_${id}`,
        probability: 1.0, // 100%獲得
        quantity: 1,
      },
    ],
  });

  // 複数のテスト用採取地カードを作成
  const testCards: GatheringCard[] = [
    createGatheringCard(createTestGatheringCard('card1')),
    createGatheringCard(createTestGatheringCard('card2')),
    createGatheringCard(createTestGatheringCard('card3')),
    createGatheringCard(createTestGatheringCard('card4')),
    createGatheringCard(createTestGatheringCard('card5')),
  ];

  beforeEach(() => {
    // イベントバスを生成
    eventBus = createEventBus();
    // ステートマネージャーを生成
    stateManager = createStateManager();

    // 初期状態を設定
    const playerState = stateManager.getPlayerState();
    stateManager.updatePlayerState({
      ...playerState,
      actionPoints: 3,
    });

    // デッキにカードを設定
    stateManager.updateDeckState({
      cards: testCards,
      hand: [],
      discardPile: [],
    });

    // ユースケースを生成
    draftGatheringUseCase = createDraftGatheringUseCase(stateManager, eventBus);
  });

  describe('ドラフト開始', () => {
    it('ドラフトを開始できる', async () => {
      const result = await draftGatheringUseCase.startDraft();

      expect(result.success).toBe(true);
    });

    it('開始時に採取地カード3枚が表示される', async () => {
      const result = await draftGatheringUseCase.startDraft();

      expect(result.success).toBe(true);
      expect(result.draftState?.availableCards).toHaveLength(3);
    });

    it('開始時は1ラウンド目', async () => {
      const result = await draftGatheringUseCase.startDraft();

      expect(result.draftState?.currentRound).toBe(1);
    });

    it('行動ポイント不足でドラフトできない', async () => {
      // 行動ポイントを0に設定
      const playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        actionPoints: 0,
      });

      const result = await draftGatheringUseCase.startDraft();

      expect(result.success).toBe(false);
      expect(result.error).toBe('INSUFFICIENT_ACTION_POINTS');
    });
  });

  describe('カード選択', () => {
    it('カードを選択できる', async () => {
      await draftGatheringUseCase.startDraft();
      const draftState = draftGatheringUseCase.getDraftState();
      const selectedCardId = draftState!.availableCards[0].id;

      const result = await draftGatheringUseCase.selectCard(selectedCardId);

      expect(result.success).toBe(true);
    });

    it('選択したカードから素材を獲得できる', async () => {
      await draftGatheringUseCase.startDraft();
      const draftState = draftGatheringUseCase.getDraftState();
      const selectedCardId = draftState!.availableCards[0].id;

      const result = await draftGatheringUseCase.selectCard(selectedCardId);

      expect(result.success).toBe(true);
      expect(result.obtainedMaterials).toBeDefined();
      expect(result.obtainedMaterials!.length).toBeGreaterThan(0);
    });

    it('存在しないカードは選択できない', async () => {
      await draftGatheringUseCase.startDraft();

      const result = await draftGatheringUseCase.selectCard('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_CARD');
    });
  });

  describe('ラウンド進行', () => {
    it('カード選択後にラウンドが進行する', async () => {
      await draftGatheringUseCase.startDraft();
      const draftState = draftGatheringUseCase.getDraftState();
      const selectedCardId = draftState!.availableCards[0].id;

      await draftGatheringUseCase.selectCard(selectedCardId);
      const newDraftState = draftGatheringUseCase.getDraftState();

      expect(newDraftState?.currentRound).toBe(2);
    });

    it('次ラウンドで残り2枚 + 新規1枚の3枚が表示される', async () => {
      await draftGatheringUseCase.startDraft();
      const draftState = draftGatheringUseCase.getDraftState();
      const selectedCardId = draftState!.availableCards[0].id;

      await draftGatheringUseCase.selectCard(selectedCardId);
      const newDraftState = draftGatheringUseCase.getDraftState();

      expect(newDraftState?.availableCards).toHaveLength(3);
    });
  });

  describe('ドラフト終了', () => {
    it('3ラウンド終了後にドラフトが終了する', async () => {
      await draftGatheringUseCase.startDraft();

      // 3ラウンド実行
      for (let i = 0; i < 3; i++) {
        const draftState = draftGatheringUseCase.getDraftState();
        if (!draftState || draftState.isCompleted) break;
        const selectedCardId = draftState.availableCards[0].id;
        await draftGatheringUseCase.selectCard(selectedCardId);
      }

      const finalDraftState = draftGatheringUseCase.getDraftState();
      expect(finalDraftState?.isCompleted).toBe(true);
    });

    it('ドラフト終了後は新しいカード選択ができない', async () => {
      await draftGatheringUseCase.startDraft();

      // 3ラウンド実行
      for (let i = 0; i < 3; i++) {
        const draftState = draftGatheringUseCase.getDraftState();
        if (!draftState || draftState.isCompleted) break;
        const selectedCardId = draftState.availableCards[0].id;
        await draftGatheringUseCase.selectCard(selectedCardId);
      }

      // 終了後に選択を試みる
      const result = await draftGatheringUseCase.selectCard('card1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('DRAFT_NOT_STARTED');
    });
  });

  describe('行動ポイント', () => {
    it('ドラフト終了時に行動ポイントを1消費する', async () => {
      const beforeAP = stateManager.getPlayerState().actionPoints;

      await draftGatheringUseCase.startDraft();

      // 3ラウンド実行
      for (let i = 0; i < 3; i++) {
        const draftState = draftGatheringUseCase.getDraftState();
        if (!draftState || draftState.isCompleted) break;
        const selectedCardId = draftState.availableCards[0].id;
        await draftGatheringUseCase.selectCard(selectedCardId);
      }

      const afterAP = stateManager.getPlayerState().actionPoints;
      expect(afterAP).toBe(beforeAP - 1);
    });
  });

  describe('素材獲得', () => {
    it('獲得した素材がインベントリに追加される', async () => {
      await draftGatheringUseCase.startDraft();

      // 3ラウンド実行
      for (let i = 0; i < 3; i++) {
        const draftState = draftGatheringUseCase.getDraftState();
        if (!draftState || draftState.isCompleted) break;
        const selectedCardId = draftState.availableCards[0].id;
        await draftGatheringUseCase.selectCard(selectedCardId);
      }

      const inventoryState = stateManager.getInventoryState();
      expect(inventoryState.materials.length).toBeGreaterThan(0);
    });
  });
});
