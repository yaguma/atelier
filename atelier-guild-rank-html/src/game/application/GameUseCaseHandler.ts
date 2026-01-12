/**
 * GameUseCaseHandler
 *
 * TASK-0251: EventBus-UseCase連携実装
 * EventBusアダプターを経由してUIからのリクエストをApplication層UseCaseに転送する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/dataflow.md
 */

import type { IUIEventHandler } from '@game/events/EventHandlers';
import type { EventBusAdapter } from '@game/events/EventBusAdapter';
import type { StateManager } from '@application/StateManager';
import type { AcceptQuestUseCase } from '@application/AcceptQuestUseCase';
import type { DeliverItemUseCase } from '@application/DeliverItemUseCase';
import type { DraftGatheringUseCase } from '@application/DraftGatheringUseCase';
import type { CraftItemUseCase } from '@application/CraftItemUseCase';
import type { PurchaseItemUseCase } from '@application/PurchaseItemUseCase';
import type { PhaseTransitionUseCase } from '@application/PhaseTransitionUseCase';
import type { AdvanceDayUseCase } from '@application/AdvanceDayUseCase';
import type { AutoSaveUseCase } from '@application/AutoSaveUseCase';
import type { ContinueGameUseCase } from '@application/ContinueGameUseCase';
import type { StartPromotionTestUseCase } from '@application/StartPromotionTestUseCase';
import type {
  QuestAcceptRequestEvent,
  QuestDeliveryRequestEvent,
  GatheringExecuteRequestEvent,
  AlchemyCraftRequestEvent,
  ShopPurchaseRequestEvent,
  CardDrawRequestEvent,
  PhaseSkipRequestEvent,
  GameSaveRequestEvent,
  GameLoadRequestEvent,
  RankUpChallengeRequestEvent,
} from '@game/events/GameEvents';
import { Quality } from '@domain/common/types';

/**
 * UseCase依存性の型定義
 */
export interface UseCaseDependencies {
  /** 依頼受注UseCase */
  acceptQuestUseCase: AcceptQuestUseCase;
  /** 納品UseCase */
  deliverItemUseCase: DeliverItemUseCase;
  /** 採取UseCase */
  draftGatheringUseCase: DraftGatheringUseCase;
  /** 調合UseCase */
  craftItemUseCase: CraftItemUseCase;
  /** ショップ購入UseCase */
  purchaseItemUseCase: PurchaseItemUseCase;
  /** フェーズ遷移UseCase */
  phaseTransitionUseCase: PhaseTransitionUseCase;
  /** 日送りUseCase */
  advanceDayUseCase: AdvanceDayUseCase;
  /** 自動保存UseCase */
  autoSaveUseCase: AutoSaveUseCase;
  /** ゲーム継続UseCase */
  continueGameUseCase: ContinueGameUseCase;
  /** 昇格試験開始UseCase */
  startPromotionTestUseCase: StartPromotionTestUseCase;
}

/**
 * GameUseCaseHandlerオプション
 */
export interface GameUseCaseHandlerOptions {
  /** EventBusアダプター */
  eventBusAdapter: EventBusAdapter;
  /** StateManager */
  stateManager: StateManager;
  /** UseCase依存性 */
  useCases: Partial<UseCaseDependencies>;
}

/**
 * GameUseCaseHandlerクラス
 *
 * UIからのイベントをApplication層のUseCaseに転送し、
 * 結果をEventBus経由でUIに通知する。
 *
 * @example
 * ```typescript
 * const handler = new GameUseCaseHandler({
 *   eventBusAdapter,
 *   stateManager,
 *   useCases: {
 *     acceptQuestUseCase,
 *     craftItemUseCase,
 *     // ...
 *   },
 * });
 * ```
 */
export class GameUseCaseHandler implements IUIEventHandler {
  private eventBusAdapter: EventBusAdapter;
  private stateManager: StateManager;
  private useCases: Partial<UseCaseDependencies>;

  constructor(options: GameUseCaseHandlerOptions) {
    this.eventBusAdapter = options.eventBusAdapter;
    this.stateManager = options.stateManager;
    this.useCases = options.useCases;

    // 自身をハンドラとして登録
    this.eventBusAdapter.setUIEventHandler(this);
  }

  /**
   * 依頼受注リクエストを処理
   */
  async handleQuestAcceptRequest(
    payload: QuestAcceptRequestEvent['payload']
  ): Promise<void> {
    try {
      if (!this.useCases.acceptQuestUseCase) {
        throw new Error('AcceptQuestUseCase is not available');
      }

      const result = await this.useCases.acceptQuestUseCase.execute(
        payload.questId
      );

      if (result.success) {
        const questState = this.stateManager.getQuestState();
        this.eventBusAdapter.emitToUI({
          type: 'quest:accepted',
          payload: {
            quest: questState.activeQuests.find(
              (q) => q.quest.id === payload.questId
            )?.quest,
            acceptedQuests: questState.activeQuests,
          },
        });

        this.emitGameStateUpdate();
      } else {
        this.handleError('quest:accept', new Error(result.error));
      }
    } catch (error) {
      this.handleError('quest:accept', error);
    }
  }

  /**
   * 依頼納品リクエストを処理
   */
  async handleQuestDeliveryRequest(
    payload: QuestDeliveryRequestEvent['payload']
  ): Promise<void> {
    try {
      if (!this.useCases.deliverItemUseCase) {
        throw new Error('DeliverItemUseCase is not available');
      }

      const result = await this.useCases.deliverItemUseCase.execute({
        questId: payload.questId,
        itemInstanceId: payload.itemIds[0] ?? '',
      });

      if (result.success) {
        this.eventBusAdapter.emitToUI({
          type: 'quest:delivered',
          payload: {
            quest: null,
            rewards: {
              gold: result.reward?.gold ?? 0,
              exp: result.reward?.contribution ?? 0,
              items: [],
            },
            rewardCards: [],
          },
        });

        this.emitInventoryUpdate();
        this.emitGameStateUpdate();
      } else {
        this.handleError('quest:delivery', new Error(result.error ?? 'Unknown error'));
      }
    } catch (error) {
      this.handleError('quest:delivery', error);
    }
  }

  /**
   * 採取実行リクエストを処理
   */
  async handleGatheringExecuteRequest(
    payload: GatheringExecuteRequestEvent['payload']
  ): Promise<void> {
    try {
      if (!this.useCases.draftGatheringUseCase) {
        throw new Error('DraftGatheringUseCase is not available');
      }

      const result = await this.useCases.draftGatheringUseCase.selectCard(
        payload.cardId
      );

      if (result.success) {
        const playerState = this.stateManager.getPlayerState();
        this.eventBusAdapter.emitToUI({
          type: 'gathering:complete',
          payload: {
            materials: result.obtainedMaterials ?? [],
            apUsed: 1,
            remainingAp: playerState.actionPoints,
          },
        });

        this.emitInventoryUpdate();
        this.emitHandUpdate();
        this.emitDeckUpdate();
        this.emitGameStateUpdate();
      } else {
        this.handleError('gathering', new Error(result.error ?? 'Unknown error'));
      }
    } catch (error) {
      this.handleError('gathering', error);
    }
  }

  /**
   * 調合リクエストを処理
   */
  async handleAlchemyCraftRequest(
    payload: AlchemyCraftRequestEvent['payload']
  ): Promise<void> {
    try {
      if (!this.useCases.craftItemUseCase) {
        throw new Error('CraftItemUseCase is not available');
      }

      const result = await this.useCases.craftItemUseCase.execute({
        recipeCardId: payload.recipeCardId,
        materialSelections: (payload.materialIds ?? []).map((materialId: string) => ({
          materialId,
          quality: Quality.C,
          quantity: 1,
        })),
      });

      if (result.success) {
        this.eventBusAdapter.emitToUI({
          type: 'alchemy:crafted',
          payload: {
            item: result.craftedItem ?? null,
            quality: 0,
            traits: [],
            success: true,
          },
        });

        this.emitInventoryUpdate();
        this.emitHandUpdate();
        this.emitDeckUpdate();
        this.emitGameStateUpdate();
      } else {
        this.eventBusAdapter.emitToUI({
          type: 'alchemy:crafted',
          payload: {
            item: null,
            quality: 0,
            traits: [],
            success: false,
          },
        });
        this.handleError('alchemy', new Error(result.error ?? 'Unknown error'));
      }
    } catch (error) {
      this.handleError('alchemy', error);
    }
  }

  /**
   * ショップ購入リクエストを処理
   */
  async handleShopPurchaseRequest(
    payload: ShopPurchaseRequestEvent['payload']
  ): Promise<void> {
    try {
      if (!this.useCases.purchaseItemUseCase) {
        throw new Error('PurchaseItemUseCase is not available');
      }

      const result = await this.useCases.purchaseItemUseCase.execute({
        shopItemId: payload.itemId,
      });

      if (result.success) {
        const playerState = this.stateManager.getPlayerState();
        this.eventBusAdapter.emitToUI({
          type: 'shop:purchased',
          payload: {
            item: result.purchasedItem,
            quantity: payload.quantity ?? 1,
            newGold: playerState.gold,
          },
        });

        if (payload.category === 'material') {
          this.emitInventoryUpdate();
        } else if (payload.category === 'card') {
          this.emitHandUpdate();
          this.emitDeckUpdate();
        }

        this.emitGameStateUpdate();
      } else {
        this.handleError('shop', new Error(result.error));
      }
    } catch (error) {
      this.handleError('shop', error);
    }
  }

  /**
   * カードドローリクエストを処理
   */
  async handleCardDrawRequest(
    payload: CardDrawRequestEvent['payload']
  ): Promise<void> {
    try {
      // ドロー機能はStateManagerのデッキ状態を直接操作
      const deckState = this.stateManager.getDeckState();
      const drawCount = Math.min(payload.count, deckState.cards.length);

      if (drawCount > 0) {
        const drawnCards = deckState.cards.slice(0, drawCount);
        const newHand = [...deckState.hand, ...drawnCards];
        const newCards = deckState.cards.slice(drawCount);

        this.stateManager.updateDeckState({
          hand: newHand,
          cards: newCards,
          discardPile: deckState.discardPile,
        });
      }

      const updatedDeckState = this.stateManager.getDeckState();
      this.eventBusAdapter.emitToUI({
        type: 'hand:updated',
        payload: {
          cards: updatedDeckState.hand,
        },
      });

      this.eventBusAdapter.emitToUI({
        type: 'deck:updated',
        payload: {
          deckCount: updatedDeckState.cards.length,
          discardCount: updatedDeckState.discardPile.length,
        },
      });

      this.emitGameStateUpdate();
    } catch (error) {
      this.handleError('card:draw', error);
    }
  }

  /**
   * デッキシャッフルリクエストを処理
   */
  async handleDeckShuffleRequest(): Promise<void> {
    try {
      const deckState = this.stateManager.getDeckState();

      // 捨て札をデッキに戻してシャッフル
      const combined = [...deckState.cards, ...deckState.discardPile];
      const shuffled = this.shuffleArray(combined);

      this.stateManager.updateDeckState({
        cards: shuffled,
        hand: deckState.hand,
        discardPile: [],
      });

      const updatedDeckState = this.stateManager.getDeckState();
      this.eventBusAdapter.emitToUI({
        type: 'deck:updated',
        payload: {
          deckCount: updatedDeckState.cards.length,
          discardCount: updatedDeckState.discardPile.length,
        },
      });
    } catch (error) {
      this.handleError('deck:shuffle', error);
    }
  }

  /**
   * フェーズスキップリクエストを処理
   */
  async handlePhaseSkipRequest(
    payload: PhaseSkipRequestEvent['payload']
  ): Promise<void> {
    try {
      if (!this.useCases.phaseTransitionUseCase) {
        throw new Error('PhaseTransitionUseCase is not available');
      }

      const previousPhase = payload.phase;
      const result = await this.useCases.phaseTransitionUseCase.execute();

      if (result.success) {
        const gameState = this.stateManager.getGameState();
        this.eventBusAdapter.emitToUI({
          type: 'phase:changed',
          payload: {
            previousPhase,
            currentPhase: gameState.currentPhase,
            phaseData: {},
          },
        });

        this.emitGameStateUpdate();
      } else {
        this.handleError('phase:skip', new Error('Phase transition failed'));
      }
    } catch (error) {
      this.handleError('phase:skip', error);
    }
  }

  /**
   * 日終了リクエストを処理
   */
  async handleDayEndRequest(): Promise<void> {
    try {
      if (!this.useCases.advanceDayUseCase) {
        throw new Error('AdvanceDayUseCase is not available');
      }

      const result = await this.useCases.advanceDayUseCase.execute();

      if (result.success) {
        this.eventBusAdapter.emitToUI({
          type: 'day:ended',
          payload: {
            newDay: result.newDay ?? 1,
            summary: {
              questsCompleted: 0,
              itemsCrafted: 0,
              goldEarned: 0,
            },
          },
        });

        // ゲームオーバー判定
        if (result.isGameOver) {
          this.eventBusAdapter.emitToUI({
            type: 'game:over',
            payload: {
              reason: result.gameOverReason ?? 'Unknown',
              stats: {},
            },
          });
        }

        this.emitGameStateUpdate();
      } else {
        this.handleError('day:end', new Error('Day advance failed'));
      }
    } catch (error) {
      this.handleError('day:end', error);
    }
  }

  /**
   * ゲームセーブリクエストを処理
   */
  async handleGameSaveRequest(
    payload: GameSaveRequestEvent['payload']
  ): Promise<void> {
    try {
      if (!this.useCases.autoSaveUseCase) {
        throw new Error('AutoSaveUseCase is not available');
      }

      await this.useCases.autoSaveUseCase.execute('PHASE_END' as never);

      // 成功通知
      this.emitGameStateUpdate();
    } catch (error) {
      this.handleError('game:save', error);
    }
  }

  /**
   * ゲームロードリクエストを処理
   */
  async handleGameLoadRequest(
    payload: GameLoadRequestEvent['payload']
  ): Promise<void> {
    try {
      if (!this.useCases.continueGameUseCase) {
        throw new Error('ContinueGameUseCase is not available');
      }

      const result = await this.useCases.continueGameUseCase.execute();

      if (result.success) {
        // 全状態更新
        this.emitFullStateUpdate();
      } else {
        this.handleError('game:load', new Error(result.error));
      }
    } catch (error) {
      this.handleError('game:load', error);
    }
  }

  /**
   * 昇格試験リクエストを処理
   */
  async handleRankUpChallengeRequest(
    payload: RankUpChallengeRequestEvent['payload']
  ): Promise<void> {
    try {
      if (!this.useCases.startPromotionTestUseCase) {
        throw new Error('StartPromotionTestUseCase is not available');
      }

      const result = await this.useCases.startPromotionTestUseCase.execute();

      if (result.success) {
        this.eventBusAdapter.emitToUI({
          type: 'rankup:success',
          payload: {
            newRank: result.toRank ?? payload.targetRank,
            rewards: [],
          },
        });
      } else {
        this.eventBusAdapter.emitToUI({
          type: 'rankup:failed',
          payload: {
            reason: result.error ?? 'Unknown reason',
          },
        });
      }

      this.emitGameStateUpdate();
    } catch (error) {
      this.handleError('rankup', error);
    }
  }

  // ===== ヘルパーメソッド =====

  /**
   * ゲーム状態更新を通知
   */
  private emitGameStateUpdate(): void {
    try {
      const gameState = this.stateManager.getGameState();
      const playerState = this.stateManager.getPlayerState();

      this.eventBusAdapter.emitToUI({
        type: 'game:state:updated',
        payload: {
          currentPhase: gameState.currentPhase,
          currentDay: gameState.currentDay,
          playerRank: playerState.rank,
          gold: playerState.gold,
          ap: { current: playerState.actionPoints, max: playerState.actionPointsMax },
        },
      });
    } catch (error) {
      console.error('[GameUseCaseHandler] Failed to emit game state update:', error);
    }
  }

  /**
   * インベントリ更新を通知
   */
  private emitInventoryUpdate(): void {
    try {
      const inventoryState = this.stateManager.getInventoryState();
      this.eventBusAdapter.emitToUI({
        type: 'inventory:updated',
        payload: { items: inventoryState.items },
      });
    } catch (error) {
      console.error('[GameUseCaseHandler] Failed to emit inventory update:', error);
    }
  }

  /**
   * 手札更新を通知
   */
  private emitHandUpdate(): void {
    try {
      const deckState = this.stateManager.getDeckState();
      this.eventBusAdapter.emitToUI({
        type: 'hand:updated',
        payload: { cards: deckState.hand },
      });
    } catch (error) {
      console.error('[GameUseCaseHandler] Failed to emit hand update:', error);
    }
  }

  /**
   * デッキ更新を通知
   */
  private emitDeckUpdate(): void {
    try {
      const deckState = this.stateManager.getDeckState();
      this.eventBusAdapter.emitToUI({
        type: 'deck:updated',
        payload: {
          deckCount: deckState.cards.length,
          discardCount: deckState.discardPile.length,
        },
      });
    } catch (error) {
      console.error('[GameUseCaseHandler] Failed to emit deck update:', error);
    }
  }

  /**
   * 全状態更新を通知
   */
  private emitFullStateUpdate(): void {
    this.emitGameStateUpdate();
    this.emitInventoryUpdate();
    this.emitHandUpdate();
    this.emitDeckUpdate();
  }

  /**
   * エラーハンドリング
   */
  private handleError(operation: string, error: unknown): void {
    console.error(`[GameUseCaseHandler] Error in ${operation}:`, error);

    const message =
      error instanceof Error ? error.message : '不明なエラーが発生しました';

    this.eventBusAdapter.emitToUI({
      type: 'error:occurred',
      payload: {
        code: operation,
        message,
        recoverable: true,
      },
    });
  }

  /**
   * 配列をシャッフル（Fisher-Yates）
   */
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

/**
 * GameUseCaseHandlerを生成する
 */
export function createGameUseCaseHandler(
  options: GameUseCaseHandlerOptions
): GameUseCaseHandler {
  return new GameUseCaseHandler(options);
}
