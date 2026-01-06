/**
 * ドラフト採取ユースケース
 * TASK-0107: ドラフト採取ユースケース
 *
 * ドラフト形式での素材採取処理を担当するユースケース
 * 3枚のカードから1枚選択 × 3ラウンドで素材を獲得する
 */

import { StateManager } from '@application/StateManager';
import { EventBus } from '@domain/events/GameEvents';
import { GatheringCard } from '@domain/card/CardEntity';
import { CardType, Quality } from '@domain/common/types';
import { ICard } from '@domain/card/Card';
import { createMaterialInstance } from '@domain/material/MaterialEntity';

/**
 * 最大ラウンド数
 */
const MAX_ROUNDS = 3;

/**
 * ドラフトに表示するカード数
 */
const DRAFT_CARD_COUNT = 3;

/**
 * ドラフト採取のコスト
 */
const DRAFT_COST = 1;

/**
 * 獲得した素材情報
 */
export interface ObtainedMaterial {
  materialId: string;
  quality: Quality;
  quantity: number;
}

/**
 * ドラフト状態
 */
export interface DraftState {
  /** 現在のラウンド（1-3） */
  currentRound: number;
  /** 利用可能なカード */
  availableCards: GatheringCard[];
  /** ドラフト完了フラグ */
  isCompleted: boolean;
}

/**
 * ドラフト開始結果
 */
export interface StartDraftResult {
  /** 成功したかどうか */
  success: boolean;
  /** ドラフト状態 */
  draftState?: DraftState;
  /** エラータイプ */
  error?: 'INSUFFICIENT_ACTION_POINTS' | 'NO_GATHERING_CARDS';
}

/**
 * カード選択結果
 */
export interface SelectCardResult {
  /** 成功したかどうか */
  success: boolean;
  /** 獲得した素材 */
  obtainedMaterials?: ObtainedMaterial[];
  /** エラータイプ */
  error?: 'DRAFT_NOT_STARTED' | 'INVALID_CARD';
}

/**
 * ドラフト採取ユースケースインターフェース
 */
export interface DraftGatheringUseCase {
  /**
   * ドラフトを開始する
   * @returns 開始結果
   */
  startDraft(): Promise<StartDraftResult>;

  /**
   * カードを選択する
   * @param cardId 選択するカードID
   * @returns 選択結果
   */
  selectCard(cardId: string): Promise<SelectCardResult>;

  /**
   * 現在のドラフト状態を取得する
   * @returns ドラフト状態（未開始の場合はnull）
   */
  getDraftState(): DraftState | null;
}

/**
 * ドラフト採取ユースケースを生成する
 * @param stateManager ステートマネージャー
 * @param eventBus イベントバス
 * @returns ドラフト採取ユースケース
 */
export function createDraftGatheringUseCase(
  stateManager: StateManager,
  eventBus: EventBus
): DraftGatheringUseCase {
  // ドラフト状態（セッション内で保持）
  let draftState: DraftState | null = null;
  // デッキから引いたカードのプール
  let cardPool: GatheringCard[] = [];

  /**
   * デッキから採取地カードを取得する
   */
  const getGatheringCardsFromDeck = (): GatheringCard[] => {
    const deckState = stateManager.getDeckState();
    const gatheringCards: GatheringCard[] = [];

    // デッキ内のカードから採取地カードをフィルタ
    for (const card of deckState.cards) {
      if (card.type === CardType.GATHERING) {
        gatheringCards.push(card as GatheringCard);
      }
    }

    return gatheringCards;
  };

  /**
   * カードプールからN枚取得する
   */
  const drawCardsFromPool = (count: number): GatheringCard[] => {
    const drawn: GatheringCard[] = [];
    for (let i = 0; i < count && cardPool.length > 0; i++) {
      const index = Math.floor(Math.random() * cardPool.length);
      drawn.push(cardPool.splice(index, 1)[0]);
    }
    return drawn;
  };

  /**
   * 素材を獲得する
   */
  const obtainMaterials = (card: GatheringCard): ObtainedMaterial[] => {
    const materials = card.determineMaterials();
    const obtained: ObtainedMaterial[] = [];

    for (const material of materials) {
      // 数量を取得（固定値）
      const quantity = material.quantity;

      // ランダムな品質を決定（簡易実装）
      const qualities: Quality[] = [Quality.S, Quality.A, Quality.B, Quality.C];
      const qualityIndex = Math.floor(Math.random() * 3) + 1; // B, C が多め
      const quality = material.quality ?? qualities[qualityIndex] ?? Quality.C;

      obtained.push({
        materialId: material.materialId,
        quality,
        quantity,
      });
    }

    return obtained;
  };

  /**
   * インベントリに素材を追加する
   */
  const addMaterialsToInventory = (materials: ObtainedMaterial[]): void => {
    const inventoryState = stateManager.getInventoryState();
    const newMaterials = [...inventoryState.materials];

    for (const material of materials) {
      // 同じ素材・品質のアイテムを検索
      const existingIndex = newMaterials.findIndex(
        (m) => m.materialId === material.materialId && m.quality === material.quality
      );

      if (existingIndex >= 0) {
        // 既存アイテムの数量を増加（addQuantityを使用）
        newMaterials[existingIndex] = newMaterials[existingIndex].addQuantity(material.quantity);
      } else {
        // 新規アイテムを追加
        newMaterials.push(
          createMaterialInstance({
            materialId: material.materialId,
            quality: material.quality,
            quantity: material.quantity,
          })
        );
      }
    }

    stateManager.updateInventoryState({
      ...inventoryState,
      materials: newMaterials,
    });
  };

  return {
    async startDraft(): Promise<StartDraftResult> {
      const playerState = stateManager.getPlayerState();

      // 行動ポイントチェック
      if (playerState.actionPoints < DRAFT_COST) {
        return {
          success: false,
          error: 'INSUFFICIENT_ACTION_POINTS',
        };
      }

      // デッキから採取地カードを取得
      const gatheringCards = getGatheringCardsFromDeck();
      if (gatheringCards.length === 0) {
        return {
          success: false,
          error: 'NO_GATHERING_CARDS',
        };
      }

      // カードプールを初期化（シャッフル）
      cardPool = [...gatheringCards].sort(() => Math.random() - 0.5);

      // 初期のドラフト用カードを取得
      const availableCards = drawCardsFromPool(DRAFT_CARD_COUNT);

      // ドラフト状態を初期化
      draftState = {
        currentRound: 1,
        availableCards,
        isCompleted: false,
      };

      return {
        success: true,
        draftState: { ...draftState },
      };
    },

    async selectCard(cardId: string): Promise<SelectCardResult> {
      // ドラフト未開始チェック
      if (!draftState || draftState.isCompleted) {
        return {
          success: false,
          error: 'DRAFT_NOT_STARTED',
        };
      }

      // 選択したカードを検索
      const selectedCardIndex = draftState.availableCards.findIndex(
        (c) => c.id === cardId
      );
      if (selectedCardIndex < 0) {
        return {
          success: false,
          error: 'INVALID_CARD',
        };
      }

      const selectedCard = draftState.availableCards[selectedCardIndex];

      // 素材を獲得
      const obtainedMaterials = obtainMaterials(selectedCard);
      addMaterialsToInventory(obtainedMaterials);

      // 選択されなかったカードを保持（次ラウンド用）
      const remainingCards = draftState.availableCards.filter(
        (_, i) => i !== selectedCardIndex
      );

      // 次のラウンドへ
      const nextRound = draftState.currentRound + 1;

      if (nextRound > MAX_ROUNDS) {
        // ドラフト終了
        draftState = {
          currentRound: nextRound,
          availableCards: [],
          isCompleted: true,
        };

        // 行動ポイントを消費
        const playerState = stateManager.getPlayerState();
        stateManager.updatePlayerState({
          ...playerState,
          actionPoints: playerState.actionPoints - DRAFT_COST,
        });
      } else {
        // 次ラウンドの準備（残りカード + 新規1枚）
        const newCard = drawCardsFromPool(1);
        const nextAvailableCards = [...remainingCards, ...newCard];

        draftState = {
          currentRound: nextRound,
          availableCards: nextAvailableCards,
          isCompleted: false,
        };
      }

      return {
        success: true,
        obtainedMaterials,
      };
    },

    getDraftState(): DraftState | null {
      if (!draftState) return null;
      return {
        ...draftState,
        availableCards: [...draftState.availableCards],
      };
    },
  };
}
