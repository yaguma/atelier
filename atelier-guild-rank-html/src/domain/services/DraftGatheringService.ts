/**
 * ドラフト採取ドメインサービス
 * TASK-0092: ドラフト採取ドメインサービス
 *
 * ドラフト形式の採取フェーズを管理する
 */

import {
  GatheringCard,
} from '@domain/card/CardEntity';
import {
  MaterialInstance,
  createMaterialInstance,
} from '@domain/material/MaterialEntity';
import { Quality } from '@domain/common/types';

/**
 * 操作結果型
 */
export type Result<T> =
  | { success: true; value: T }
  | { success: false; error: string };

/**
 * ドラフト状態
 */
export interface DraftState {
  /** 現在のラウンド（0はドラフト開始前） */
  currentRound: number;
  /** 最大ラウンド数 */
  maxRounds: number;
  /** 現在のプール（選択可能なカード） */
  pool: GatheringCard[];
  /** 選択済みカード */
  selectedCards: GatheringCard[];
  /** 獲得した素材 */
  obtainedMaterials: MaterialInstance[];
  /** ドラフト完了フラグ */
  isComplete: boolean;
}

/**
 * デフォルトのラウンド数
 */
const DEFAULT_MAX_ROUNDS = 3;

/**
 * デフォルトのプールサイズ
 */
const DEFAULT_POOL_SIZE = 3;

/**
 * ドラフト状態を生成する
 * @param maxRounds 最大ラウンド数（デフォルト3）
 * @returns 初期ドラフト状態
 */
export function createDraftState(maxRounds: number = DEFAULT_MAX_ROUNDS): DraftState {
  return {
    currentRound: 0,
    maxRounds,
    pool: [],
    selectedCards: [],
    obtainedMaterials: [],
    isComplete: false,
  };
}

/**
 * 配列をシャッフルする（Fisher-Yatesアルゴリズム）
 * @param array 対象配列
 * @returns シャッフルされた新しい配列
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * ドラフト採取ドメインサービス
 * ドラフト形式の採取に関するビジネスロジックを提供する
 */
export class DraftGatheringService {
  /**
   * ドラフトプールを生成する
   * @param state 現在のドラフト状態
   * @param availableCards 利用可能なカードプール
   * @param poolSize プールサイズ（デフォルト3）
   * @returns 操作結果
   */
  generatePool(
    state: DraftState,
    availableCards: GatheringCard[],
    poolSize: number = DEFAULT_POOL_SIZE
  ): Result<DraftState> {
    if (state.isComplete) {
      return { success: false, error: 'ドラフトは既に完了しています' };
    }

    // カードをシャッフルしてプールサイズ分を取得
    const shuffled = shuffleArray(availableCards);
    const actualPoolSize = Math.min(poolSize, shuffled.length);
    const pool = shuffled.slice(0, actualPoolSize);

    return {
      success: true,
      value: {
        ...state,
        currentRound: state.currentRound + 1,
        pool: [...pool],
      },
    };
  }

  /**
   * カードを選択する
   * @param state 現在のドラフト状態
   * @param cardId 選択するカードID
   * @returns 操作結果
   */
  selectCard(state: DraftState, cardId: string): Result<DraftState> {
    if (state.pool.length === 0) {
      return { success: false, error: 'プールが空です' };
    }

    const selectedCard = state.pool.find((c) => c.id === cardId);
    if (!selectedCard) {
      return { success: false, error: '選択したカードがプールに存在しません' };
    }

    // 選択したカードから素材を獲得
    const obtainedMaterials = this.determineMaterials(selectedCard);

    // 選択したラウンド数がmaxRoundsに達したら完了
    const isComplete = state.currentRound >= state.maxRounds;

    return {
      success: true,
      value: {
        ...state,
        pool: [], // 1枚選択したらプールは空になる
        selectedCards: [...state.selectedCards, selectedCard],
        obtainedMaterials: [...state.obtainedMaterials, ...obtainedMaterials],
        isComplete,
      },
    };
  }

  /**
   * 採取カードから素材を決定する
   * @param card 採取カード
   * @returns 獲得した素材リスト
   */
  private determineMaterials(card: GatheringCard): MaterialInstance[] {
    const materials: MaterialInstance[] = [];

    for (const material of card.getMaterials()) {
      const roll = Math.random();
      if (roll < material.probability) {
        const instance = createMaterialInstance({
          materialId: material.materialId,
          quality: material.quality ?? Quality.C, // デフォルト品質はC
          quantity: material.quantity,
        });
        materials.push(instance);
      }
    }

    return materials;
  }

  /**
   * ドラフトが完了しているかどうかを判定する
   * @param state ドラフト状態
   * @returns 完了している場合true
   */
  isComplete(state: DraftState): boolean {
    return state.isComplete;
  }

  /**
   * 現在のラウンドを取得する
   * @param state ドラフト状態
   * @returns 現在のラウンド
   */
  getCurrentRound(state: DraftState): number {
    return state.currentRound;
  }

  /**
   * 残りラウンド数を取得する
   * @param state ドラフト状態
   * @returns 残りラウンド数
   */
  getRemainingRounds(state: DraftState): number {
    return Math.max(0, state.maxRounds - state.currentRound);
  }

  /**
   * 獲得した素材リストを取得する
   * @param state ドラフト状態
   * @returns 獲得素材リストのコピー
   */
  getObtainedMaterials(state: DraftState): MaterialInstance[] {
    return [...state.obtainedMaterials];
  }

  /**
   * 選択したカードリストを取得する
   * @param state ドラフト状態
   * @returns 選択カードリストのコピー
   */
  getSelectedCards(state: DraftState): GatheringCard[] {
    return [...state.selectedCards];
  }
}
