/**
 * setup.ts - サービス初期化セットアップ
 *
 * TASK-0028: サービス統合・DI設定
 * 依存関係の順序を守り、全サービスを初期化してDIコンテナに登録する
 */

import { EventBus } from '@application/events/event-bus';
import { AlchemyService } from '@application/services/alchemy-service';
import { ArtifactService } from '@application/services/artifact-service';
import { DeckService } from '@application/services/deck-service';
import { GameFlowManager } from '@application/services/game-flow-manager';
import { GatheringService } from '@application/services/gathering-service';
import { InventoryService } from '@application/services/inventory-service';
import { MaterialService } from '@application/services/material-service';
import { QuestService } from '@application/services/quest-service';
import { RankService } from '@application/services/rank-service';
import { ShopService } from '@application/services/shop-service';
import { StateManager } from '@application/services/state-manager';
import { ContributionCalculator } from '@domain/services/contribution-calculator';
import { ApplicationError, ErrorCodes } from '@shared/types';
import { LocalStorageSaveRepository } from '../repositories/local-storage-save-repository';
import { MasterDataRepository } from '../repositories/master-data-repository';
import { Container, ServiceKeys } from './container';

/**
 * 【機能概要】: サービス初期化設定
 * 【実装方針】: マスターデータロードのリトライ設定
 * 🟡 信頼性レベル: 設計文書から妥当な推測
 */
export interface ServiceInitializationConfig {
  /** マスターデータロードのリトライ回数 */
  maxRetries?: number;
  /** マスターデータロードのリトライ間隔（ミリ秒） */
  retryDelayMs?: number;
  /** マスターデータのベースパス */
  masterDataBasePath?: string;
}

/**
 * 【機能概要】: デフォルト設定
 * 🟡 信頼性レベル: 設計文書から妥当な推測
 */
const DEFAULT_CONFIG: Required<ServiceInitializationConfig> = {
  maxRetries: 3,
  retryDelayMs: 1000,
  masterDataBasePath: '/assets/data/master',
};

/**
 * 【機能概要】: サービス初期化関数
 * 【実装方針】: 依存関係の順序を守って全サービスを初期化
 * 【初期化順序】:
 *   1. EventBus（依存なし）
 *   2. MasterDataRepository（非同期ロード、リトライ機能付き）
 *   3. SaveDataRepository（依存なし）
 *   4. StateManager（EventBusに依存）
 *   5. ContributionCalculator（依存なし）
 *   6. DeckService（MasterDataRepository、EventBusに依存）
 *   7. MaterialService（MasterDataRepository、EventBusに依存）
 *   8. GatheringService（MaterialService、MasterDataRepository、EventBusに依存）
 *   9. AlchemyService（MasterDataRepository、MaterialService、EventBusに依存）
 *   10. QuestService（MasterDataRepository、EventBusに依存）
 *   11. InventoryService（依存なし）
 *   12. RankService（MasterDataRepositoryに依存）
 * 🔵 信頼性レベル: 設計文書に記載
 *
 * @param config 初期化設定（オプション）
 * @returns 初期化済みDIコンテナ
 * @throws マスターデータの読み込みに失敗した場合
 *
 * @example
 * ```typescript
 * const container = await initializeServices();
 * const eventBus = container.resolve<IEventBus>(ServiceKeys.EventBus);
 * ```
 */
export async function initializeServices(config?: ServiceInitializationConfig): Promise<Container> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const container = Container.getInstance();

  // 既に初期化済みの場合は何もしない
  if (container.has(ServiceKeys.EventBus)) {
    return container;
  }

  try {
    // =============================================================================
    // 1. EventBus初期化（依存なし）
    // =============================================================================
    const eventBus = new EventBus();
    container.register(ServiceKeys.EventBus, eventBus);

    // =============================================================================
    // 2. MasterDataRepository初期化（非同期ロード、リトライ機能付き）
    // =============================================================================
    const masterDataRepo = new MasterDataRepository({
      basePath: finalConfig.masterDataBasePath,
    });

    // リトライ機能付きでマスターデータをロード
    await loadMasterDataWithRetry(masterDataRepo, finalConfig.maxRetries, finalConfig.retryDelayMs);

    container.register(ServiceKeys.MasterDataRepository, masterDataRepo);

    // =============================================================================
    // 3. SaveDataRepository初期化（依存なし）
    // =============================================================================
    const saveDataRepo = new LocalStorageSaveRepository();
    container.register(ServiceKeys.SaveDataRepository, saveDataRepo);

    // =============================================================================
    // 4. StateManager初期化（EventBusに依存）
    // =============================================================================
    const stateManager = new StateManager(eventBus);
    container.register(ServiceKeys.StateManager, stateManager);

    // =============================================================================
    // 5. ContributionCalculator初期化（依存なし）
    // =============================================================================
    const contributionCalculator = new ContributionCalculator();
    container.register(ServiceKeys.ContributionCalculator, contributionCalculator);

    // =============================================================================
    // 6. DeckService初期化（MasterDataRepository、EventBusに依存）
    // =============================================================================
    const deckService = new DeckService(masterDataRepo, eventBus);
    container.register(ServiceKeys.DeckService, deckService);

    // =============================================================================
    // 7. MaterialService初期化（MasterDataRepository、EventBusに依存）
    // =============================================================================
    const materialService = new MaterialService(masterDataRepo, eventBus);
    container.register(ServiceKeys.MaterialService, materialService);

    // =============================================================================
    // 8. GatheringService初期化（MaterialService、MasterDataRepository、EventBusに依存）
    // =============================================================================
    const gatheringService = new GatheringService(materialService, masterDataRepo, eventBus);
    container.register(ServiceKeys.GatheringService, gatheringService);

    // =============================================================================
    // 9. AlchemyService初期化（MasterDataRepository、MaterialService、EventBusに依存）
    // =============================================================================
    const alchemyService = new AlchemyService(masterDataRepo, materialService, eventBus);
    container.register(ServiceKeys.AlchemyService, alchemyService);

    // =============================================================================
    // 10. QuestService初期化（MasterDataRepository、EventBusに依存）
    // =============================================================================
    const questService = new QuestService(masterDataRepo, eventBus);
    container.register(ServiceKeys.QuestService, questService);

    // =============================================================================
    // 11. InventoryService初期化（依存なし）
    // =============================================================================
    const inventoryService = new InventoryService();
    container.register(ServiceKeys.InventoryService, inventoryService);

    // =============================================================================
    // 12. RankService初期化（MasterDataRepositoryに依存）
    // =============================================================================
    const rankService = new RankService(masterDataRepo);
    container.register(ServiceKeys.RankService, rankService);

    // =============================================================================
    // 13. ArtifactService初期化（InventoryService、MasterDataRepositoryに依存）
    // =============================================================================
    const artifactService = new ArtifactService(inventoryService, masterDataRepo);
    container.register(ServiceKeys.ArtifactService, artifactService);

    // =============================================================================
    // 14. ShopService初期化（DeckService、InventoryService、MasterDataRepositoryに依存）
    // =============================================================================
    // ShopServiceは複雑な依存関係を持つため、StateManagerから状態を取得する関数を渡す
    const shopService = new ShopService(
      deckService,
      inventoryService,
      masterDataRepo,
      [], // shopItems - 初期化時は空配列
      () => stateManager.getState().gold, // getGold関数
      (amount: number) => {
        // spendGold関数
        const currentGold = stateManager.getState().gold;
        stateManager.updateState({ gold: currentGold - amount });
      },
      () => stateManager.getState().currentRank, // getCurrentRank関数
    );
    container.register(ServiceKeys.ShopService, shopService);

    // =============================================================================
    // 15. GameFlowManager初期化（StateManager、DeckService、QuestService、EventBusに依存）
    // =============================================================================
    const gameFlowManager = new GameFlowManager(stateManager, deckService, questService, eventBus);
    container.register(ServiceKeys.GameFlowManager, gameFlowManager);

    return container;
  } catch (error) {
    // 初期化失敗時はコンテナをクリアする
    container.clear();

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCodes.INITIALIZATION_FAILED,
      'Failed to initialize services',
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * 【機能概要】: マスターデータをリトライ機能付きでロードする
 * 【実装方針】: 指定回数失敗するまでリトライを繰り返す
 * 【エラーハンドリング】: 最終的に失敗した場合はエラーを投げる
 * 🔵 信頼性レベル: 設計文書に記載
 *
 * @param masterDataRepo マスターデータリポジトリ
 * @param maxRetries 最大リトライ回数
 * @param delayMs リトライ間隔（ミリ秒）
 * @throws マスターデータの読み込みに失敗した場合
 */
async function loadMasterDataWithRetry(
  masterDataRepo: MasterDataRepository,
  maxRetries: number,
  delayMs: number,
): Promise<void> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await masterDataRepo.load();
      return; // 成功したら終了
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 最終試行でない場合はリトライ
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  // 全てのリトライが失敗した場合
  throw new ApplicationError(
    ErrorCodes.DATA_LOAD_FAILED,
    `Failed to load master data after ${maxRetries + 1} attempts`,
    lastError,
  );
}

/**
 * 【機能概要】: サービスをリセットする（テスト用）
 * 【実装方針】: DIコンテナをリセットし、次回initializeServices()時に新規初期化される
 * 【用途】: 主にテスト時の状態リセット
 * 🟡 信頼性レベル: 設計文書から妥当な推測
 */
export function resetServices(): void {
  Container.reset();
}
