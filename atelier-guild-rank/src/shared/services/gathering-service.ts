/**
 * gathering-service.ts - GatheringService実装
 *
 * TASK-0011: GatheringService実装（ドラフト採取）
 *
 * @description
 * ドラフト採取サービスの実装。
 * 採取地カードを使用して素材をドラフト形式で獲得する機能を提供する。
 *
 * @信頼性レベル 🔵
 * - note.mdに基づいた実装
 * - 素材オプションは常に3つ
 * - 選択個数に応じたコスト増加
 */

import type { Card } from '@domain/entities/Card';
import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type {
  DraftSession,
  GatheringCostResult,
  GatheringResult,
  IGatheringService,
  MaterialOption,
} from '@domain/interfaces/gathering-service.interface';
import type { IMasterDataRepository } from '@domain/interfaces/master-data-repository.interface';
import type { IMaterialService } from '@domain/interfaces/material-service.interface';
import { calculateExtraGatheringApCost } from '@features/gathering/services/extra-gathering-ap-cost';
import type { IEventBus } from '@shared/services/event-bus';
import type { MaterialId } from '@shared/types';
import { ApplicationError, ErrorCodes } from '@shared/types/errors';
import { GameEventType } from '@shared/types/events';
import { isEnhancementCardMaster, isGatheringCardMaster } from '@shared/types/master-data';
import type { RandomFn } from '@shared/utils';
import { defaultRandomFn, generateUniqueId } from '@shared/utils';

/**
 * 【機能概要】: GatheringServiceクラス
 * 【実装方針】: ドラフト採取セッション管理、素材オプション生成、採取コスト計算を提供
 * 【テスト対応】: T-0011-01 〜 T-0011-B06 を通すための実装
 * 🔵 信頼性レベル: note.md・要件定義書に明記
 */
export class GatheringService implements IGatheringService {
  /** ランダム関数（テスト時に差し替え可能） */
  private readonly randomFn: RandomFn;
  /**
   * 【プライベートプロパティ】: アクティブな採取セッション
   * 【実装内容】: セッションIDをキーとしたMap
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  private activeSessions: Map<string, DraftSession> = new Map();

  /**
   * 【プライベートプロパティ】: 現在のセッションID
   * 【実装内容】: 現在アクティブなセッションのID（1つのみ）
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  private currentSessionId: string | null = null;

  /**
   * 【機能概要】: GatheringServiceのコンストラクタ
   * 【実装方針】: 依存性注入でMaterialService、MasterDataRepository、EventBusを受け取る
   * 【テスト対応】: モックを使用したテストで依存注入を確認
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @param materialService - 素材サービス
   * @param masterDataRepo - マスターデータリポジトリ
   * @param eventBus - イベントバス
   */
  constructor(
    private readonly materialService: IMaterialService,
    private readonly masterDataRepo: IMasterDataRepository,
    private readonly eventBus: IEventBus,
    randomFn?: RandomFn,
  ) {
    this.randomFn = randomFn ?? defaultRandomFn;
  }

  // =============================================================================
  // ドラフト採取セッション管理メソッド
  // =============================================================================

  /**
   * 【機能概要】: ドラフト採取セッション開始
   * 【実装方針】: セッションIDを生成し、素材オプションを3つ提示する
   * 【処理フロー】:
   *   1. カードタイプチェック（採取地カードか）
   *   2. セッションID生成
   *   3. 提示回数決定（カード基本値 + 強化カード効果）
   *   4. 素材オプション生成（3つ）
   *   5. DraftSession作成
   *   6. セッション保存
   *   7. GATHERING_STARTEDイベント発行
   * 【テスト対応】: T-0011-01 ドラフト採取開始（基本動作）
   * 🔵 信頼性レベル: note.md・要件定義書に明記
   */
  startDraftGathering(card: Card, enhancementCards?: Card[]): DraftSession {
    // 【マスターデータ読み込みチェック】: マスターデータが読み込まれているか確認
    // 【エラー処理】: マスターデータ未読み込み時はエラー
    // 🟡 信頼性レベル: 要件定義書に記載あり（エラーコードは既存定義を使用）
    if (!this.masterDataRepo.isLoaded()) {
      throw new ApplicationError(ErrorCodes.DATA_NOT_LOADED, 'Master data not loaded');
    }

    // 【カードタイプチェック】: 採取地カードかどうかを判定
    // 【エラー処理】: 採取地カード以外の場合はエラー
    // 🔵 信頼性レベル: note.md・要件定義書に明記
    if (!card.isGatheringCard()) {
      throw new ApplicationError(
        ErrorCodes.INVALID_CARD_TYPE,
        `Card is not a gathering card: ${card.master.name} (type: ${card.master.type})`,
      );
    }

    // 【セッションID生成】: generateUniqueId()で一意なIDを生成
    // 【形式】: `draft_session_{timestamp}_{random}`
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const sessionId = generateUniqueId('draft_session');

    // 【提示回数の決定】: カード基本値 + 強化カード効果を適用
    // 【強化カード】: 「精霊の導き」（提示回数+1）、「古代の地図」（提示回数+1）
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const presentationCount = this.calculatePresentationCount(card, enhancementCards);

    // 【最大ラウンド数の決定】: バスケット容量ベース（Issue #408）
    // basketCapacityが設定されていればそちらを使用、なければpresentationCountにフォールバック
    const maxRounds = this.calculateMaxRounds(card, enhancementCards);

    // 【素材オプション生成】: 3つの素材オプションを生成
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const currentOptions = this.generateMaterialOptions(card);

    // 【セッション作成】: DraftSessionオブジェクトを作成
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const session: DraftSession = {
      sessionId,
      card,
      currentRound: 1,
      maxRounds,
      presentationCount,
      selectedMaterials: [],
      currentOptions,
      isComplete: false,
    };

    // 【セッションを保存】: activeSessionsに保存
    // 🔵 信頼性レベル: note.md・設計文書に明記
    this.activeSessions.set(sessionId, session);
    this.currentSessionId = sessionId;

    // 【イベント発行】: GATHERING_STARTEDイベントを発行
    // 【用途】: 他のサービスやUIに採取開始を通知
    // 🔵 信頼性レベル: note.md・設計文書に明記
    this.eventBus.emit(GameEventType.GATHERING_STARTED, { session });

    // 【結果返却】: セッション情報を返す
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return session;
  }

  /**
   * 【機能概要】: 素材を選択
   * 【実装方針】: 提示された素材オプションから1つを選択し、インスタンス化して獲得
   * 【処理フロー】:
   *   1. セッション存在チェック
   *   2. インデックス範囲チェック（0〜2）
   *   3. MaterialServiceで素材インスタンス生成
   *   4. セッションに素材追加
   *   5. ラウンド進行
   *   6. 次のラウンドの素材オプション生成（最終ラウンドでない場合）
   *   7. MATERIAL_SELECTEDイベント発行
   * 【テスト対応】: T-0011-02 素材選択（基本動作）
   * 🔵 信頼性レベル: note.md・要件定義書に明記
   */
  selectMaterial(sessionId: string, materialIndex: number): MaterialInstance {
    // 【セッション取得】: セッションIDからセッションを取得
    // 【エラー処理】: セッションが存在しない場合はエラー
    // 🔵 信頼性レベル: note.md・要件定義書に明記
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new ApplicationError(
        ErrorCodes.SESSION_NOT_FOUND,
        `Gathering session not found: ${sessionId}`,
      );
    }

    // 【インデックスチェック】: 素材オプションの範囲内か確認（0〜2）
    // 【エラー処理】: 範囲外の場合はエラー
    // 🔵 信頼性レベル: note.md・要件定義書に明記
    if (materialIndex < 0 || materialIndex >= session.currentOptions.length) {
      throw new ApplicationError(
        ErrorCodes.INVALID_SELECTION,
        `Invalid material index: ${materialIndex}, expected 0-${session.currentOptions.length - 1}`,
      );
    }

    // 【選択された素材オプション】: インデックスから素材オプションを取得
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const option = session.currentOptions[materialIndex];

    // 【MaterialServiceで素材インスタンス生成】: createInstance()を使用
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const materialInstance = this.materialService.createInstance(option.materialId, option.quality);

    // 【セッションに追加】: 選択した素材をselectedMaterialsに追加
    // 🔵 信頼性レベル: note.md・設計文書に明記
    session.selectedMaterials.push(materialInstance);

    // 【ラウンドを進める】: currentRoundを+1
    // 🔵 信頼性レベル: note.md・設計文書に明記
    session.currentRound++;

    // 【最終ラウンド判定】: currentRoundがmaxRoundsを超えたか確認
    // 【処理方針】: 超えた場合はisCompleteをtrueにし、次のオプションは生成しない
    // 🔵 信頼性レベル: note.md・設計文書に明記
    if (session.currentRound > session.maxRounds) {
      session.isComplete = true;
      session.currentOptions = [];
    } else {
      // 【次のラウンドの素材オプションを生成】: generateMaterialOptions()を使用
      // 🔵 信頼性レベル: note.md・設計文書に明記
      session.currentOptions = this.generateMaterialOptions(session.card);
    }

    // 【イベント発行】: MATERIAL_SELECTEDイベントを発行
    // 【用途】: 他のサービスやUIに素材選択を通知
    // 🔵 信頼性レベル: note.md・設計文書に明記
    this.eventBus.emit(GameEventType.MATERIAL_SELECTED, { material: materialInstance });

    // 【結果返却】: 生成した素材インスタンスを返す
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return materialInstance;
  }

  /**
   * 【機能概要】: 素材選択をスキップ
   * 【実装方針】: 素材を選ばずに次のラウンドに進む
   * 【処理フロー】:
   *   1. セッション存在チェック
   *   2. ラウンド進行
   *   3. 次のラウンドの素材オプション生成（最終ラウンドでない場合）
   * 【テスト対応】: T-0011-03 素材スキップ（基本動作）
   * 🔵 信頼性レベル: note.md・要件定義書に明記
   */
  skipSelection(sessionId: string): void {
    // 【セッション取得】: セッションIDからセッションを取得
    // 【エラー処理】: セッションが存在しない場合はエラー
    // 🔵 信頼性レベル: note.md・要件定義書に明記
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new ApplicationError(
        ErrorCodes.SESSION_NOT_FOUND,
        `Gathering session not found: ${sessionId}`,
      );
    }

    // 【ラウンドを進める】: currentRoundを+1
    // 🔵 信頼性レベル: note.md・設計文書に明記
    session.currentRound++;

    // 【最終ラウンド判定】: currentRoundがmaxRoundsを超えたか確認
    // 【処理方針】: 超えた場合はisCompleteをtrueにし、次のオプションは生成しない
    // 🔵 信頼性レベル: note.md・設計文書に明記
    if (session.currentRound > session.maxRounds) {
      session.isComplete = true;
      session.currentOptions = [];
    } else {
      // 【次のラウンドの素材オプションを生成】: generateMaterialOptions()を使用
      // 🔵 信頼性レベル: note.md・設計文書に明記
      session.currentOptions = this.generateMaterialOptions(session.card);
    }
  }

  /**
   * 【機能概要】: 採取を終了
   * 【実装方針】: 獲得した素材とコストを計算し、セッションを削除
   * 【処理フロー】:
   *   1. セッション存在チェック
   *   2. コスト計算（calculateGatheringCost()）
   *   3. セッション削除
   *   4. GATHERING_ENDEDイベント発行
   *   5. GatheringResult返却
   * 【テスト対応】: T-0011-04 採取終了（獲得素材リスト返却、コスト計算）
   * 🔵 信頼性レベル: note.md・要件定義書に明記
   */
  endGathering(sessionId: string): GatheringResult {
    // 【セッション取得】: セッションIDからセッションを取得
    // 【エラー処理】: セッションが存在しない場合はエラー
    // 🔵 信頼性レベル: note.md・要件定義書に明記
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new ApplicationError(
        ErrorCodes.SESSION_NOT_FOUND,
        `Gathering session not found: ${sessionId}`,
      );
    }

    // 【コスト計算】: calculateGatheringCost()でコストを計算
    // 🔵 信頼性レベル: note.md・設計文書に明記
    // 【型ガード】: session.cardは必ず採取地カードであることを保証
    if (!isGatheringCardMaster(session.card.master)) {
      throw new ApplicationError(
        ErrorCodes.INVALID_CARD_TYPE,
        `Card is not a gathering card: ${session.card.id}`,
      );
    }
    const baseCost = this.calculateGatheringCost(
      session.card.master.baseCost,
      session.selectedMaterials.length,
    );

    // 【追加APコスト累計】: presentationCount超過ラウンドごとの追加APコストを累計
    // 各追加ラウンドの超過数に対してcalculateExtraGatheringApCostを呼び、合計する
    // Issue #408: basketCapacity > presentationCount の場合、超過分の追加APコストが発生
    let totalExtraApCost = 0;
    for (let round = 1; round <= session.maxRounds; round++) {
      totalExtraApCost += calculateExtraGatheringApCost(round, session.presentationCount);
    }

    const cost = {
      actionPointCost: baseCost.actionPointCost + totalExtraApCost,
      extraDays: baseCost.extraDays,
    };

    // 【セッションを削除】: activeSessionsから削除
    // 【メモリ管理】: 終了したセッションは必ず削除
    // 🔵 信頼性レベル: note.md・設計文書に明記
    this.activeSessions.delete(sessionId);
    if (this.currentSessionId === sessionId) {
      this.currentSessionId = null;
    }

    // 【イベント発行】: GATHERING_ENDEDイベントを発行
    // 【用途】: 他のサービスやUIに採取終了を通知
    // 🔵 信頼性レベル: note.md・設計文書に明記
    this.eventBus.emit(GameEventType.GATHERING_ENDED, {
      materials: session.selectedMaterials,
      cost,
    });

    // 【結果返却】: GatheringResultを返す
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return {
      materials: session.selectedMaterials,
      cost,
    };
  }

  /**
   * 【機能概要】: 現在のセッションを取得
   * 【実装方針】: アクティブなセッションを返す、セッションがない場合はnull
   * 【テスト対応】: T-0011-B06 nullセッションでgetCurrentSession()を実行
   * 🔵 信頼性レベル: note.md・要件定義書に明記
   */
  getCurrentSession(): DraftSession | null {
    // 【現在のセッション取得】: currentSessionIdからセッションを取得
    // 【null処理】: セッションがない場合はnullを返す
    // 🔵 信頼性レベル: note.md・要件定義書に明記
    if (!this.currentSessionId) {
      return null;
    }

    return this.activeSessions.get(this.currentSessionId) ?? null;
  }

  /**
   * 【機能概要】: 採取可能かどうかを判定
   * 【実装方針】: カードタイプが採取地カードかどうかを判定
   * 🔵 信頼性レベル: note.md・要件定義書に明記
   */
  canGather(card: Card): boolean {
    // 【カードタイプ判定】: 採取地カードかどうかを判定
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return card.isGatheringCard();
  }

  // =============================================================================
  // リロール（素材候補再生成）
  // =============================================================================

  /**
   * 素材候補をリロール（再生成）する
   * Issue #445: APを消費して現在の素材候補を再生成する
   *
   * @param sessionId - セッションID
   * @returns 再生成された素材オプション
   */
  rerollOptions(sessionId: string): MaterialOption[] {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new ApplicationError(
        ErrorCodes.SESSION_NOT_FOUND,
        `Gathering session not found: ${sessionId}`,
      );
    }

    if (session.isComplete) {
      throw new ApplicationError(
        ErrorCodes.INVALID_SELECTION,
        'Cannot reroll options: session is complete',
      );
    }

    // 素材オプションを再生成
    session.currentOptions = this.generateMaterialOptions(session.card);

    return session.currentOptions;
  }

  // =============================================================================
  // コスト計算メソッド
  // =============================================================================

  /**
   * 【機能概要】: 採取コストを計算
   * 【実装方針】: 基本コスト + 選択個数に応じた追加コストを計算
   * 【コスト計算】:
   *   - 0個: +0
   *   - 1〜2個: +1
   *   - 3〜4個: +2
   *   - 5〜6個: +3
   *   - 7個以上: +3、extraDays: +1
   * 【テスト対応】:
   *   - T-0011-B03 0個選択（偵察のみ）でのコスト計算
   *   - T-0011-B04 7個選択（翌日持越しペナルティ）でのコスト計算
   *   - T-0011-B05 6個選択（ペナルティなし上限）でのコスト計算
   * 🔵 信頼性レベル: note.md・要件定義書に明記
   */
  calculateGatheringCost(baseCost: number, selectedCount: number): GatheringCostResult {
    // 【追加コスト計算】: 選択個数に応じた追加コストを計算
    // 🔵 信頼性レベル: note.md・要件定義書に明記
    let additionalCost: number;
    let extraDays = 0;

    if (selectedCount === 0) {
      // 【偵察のみ】: 0個選択の場合は追加コストなし
      // 🔵 信頼性レベル: note.md・要件定義書に明記
      additionalCost = 0;
    } else if (selectedCount <= 2) {
      // 【軽い採取】: 1〜2個選択の場合は追加コスト1
      // 🔵 信頼性レベル: note.md・要件定義書に明記
      additionalCost = 1;
    } else if (selectedCount <= 4) {
      // 【普通の採取】: 3〜4個選択の場合は追加コスト2
      // 🔵 信頼性レベル: note.md・要件定義書に明記
      additionalCost = 2;
    } else if (selectedCount <= 6) {
      // 【重い採取】: 5〜6個選択の場合は追加コスト3
      // 🔵 信頼性レベル: note.md・要件定義書に明記
      additionalCost = 3;
    } else {
      // 【大量採取】: 7個以上選択の場合は追加コスト3 + 翌日持越しペナルティ
      // 🔵 信頼性レベル: note.md・要件定義書に明記
      additionalCost = 3;
      extraDays = 1;
    }

    // 【総コスト計算】: 基本コスト + 追加コスト
    // 🔵 信頼性レベル: note.md・要件定義書に明記
    const actionPointCost = baseCost + additionalCost;

    // 【結果返却】: GatheringCostResultを返す
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return {
      actionPointCost,
      extraDays,
    };
  }

  // =============================================================================
  // プライベートメソッド
  // =============================================================================

  /**
   * 【機能概要】: 基本採取回数（presentationCount）を計算
   * 【実装方針】: カード基本値 + 強化カード効果を合計
   * 【強化カード効果】:
   *   - 「精霊の導き」: 提示回数+1
   *   - 「古代の地図」（アーティファクト）: 提示回数+1
   * 🟡 信頼性レベル: note.md・要件定義書に記載あり（強化カードの具体的な実装は推測）
   */
  private calculatePresentationCount(card: Card, enhancementCards?: Card[]): number {
    if (!isGatheringCardMaster(card.master)) {
      throw new ApplicationError(
        ErrorCodes.INVALID_CARD_TYPE,
        `Card is not a gathering card: ${card.id}`,
      );
    }
    let count = card.master.presentationCount;

    if (enhancementCards && enhancementCards.length > 0) {
      for (const enhancementCard of enhancementCards) {
        if (!isEnhancementCardMaster(enhancementCard.master)) {
          continue;
        }
        if (
          enhancementCard.master.effect.type === 'INCREASE_PRESENTATION' ||
          enhancementCard.master.name === '精霊の導き' ||
          enhancementCard.master.name === '古代の地図'
        ) {
          count += 1;
        }
      }
    }

    return count;
  }

  /**
   * 【機能概要】: 最大ラウンド数を計算（バスケット容量ベース）
   * 【実装方針】: basketCapacityが設定されていればそちらを使用、なければpresentationCountにフォールバック
   * 【Issue #408】: かごの容量分だけ繰り返し採取できるようにする
   * 🔵 信頼性レベル: Issue #408の要件に基づく
   */
  private calculateMaxRounds(card: Card, enhancementCards?: Card[]): number {
    if (!isGatheringCardMaster(card.master)) {
      throw new ApplicationError(
        ErrorCodes.INVALID_CARD_TYPE,
        `Card is not a gathering card: ${card.id}`,
      );
    }

    // basketCapacityが設定されている場合はそちらを使用
    // 【設計意図】: basketCapacityはカードの物理的な容量を表し、強化カード効果の影響を受けない。
    // 強化カード（精霊の導き等）はpresentationCount（素材提示回数）のみに影響する。
    // これにより basketCapacity > presentationCount の場合、超過ラウンドに追加APコストが発生する。
    if (card.master.basketCapacity !== undefined && card.master.basketCapacity > 0) {
      return card.master.basketCapacity;
    }

    // フォールバック: presentationCount + 強化カード効果
    return this.calculatePresentationCount(card, enhancementCards);
  }

  /**
   * 【機能概要】: 素材オプションを生成
   * 【実装方針】: 素材プールからランダムに3つ選択（重複あり）
   * 【処理フロー】:
   *   1. 素材プール取得（card.master.materialPool）
   *   2. 3つの素材オプションをランダム生成
   *   3. MaterialServiceでランダム品質を生成
   * 【テスト対応】: T-0011-01 ドラフト採取開始（素材オプション3つ生成）
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  private generateMaterialOptions(card: Card): MaterialOption[] {
    // 【カードタイプチェック】: 採取地カードであることを確認
    // 🔵 信頼性レベル: note.md・設計文書に明記
    if (!card.isGatheringCard()) {
      return [];
    }

    // 【型ガード】: cardは必ず採取地カードであることを保証
    if (!isGatheringCardMaster(card.master)) {
      return [];
    }

    // 【素材プール取得】: カードから素材プールを取得
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const materialPool = card.master.materialPool;

    // 【素材オプション生成】: 3つの素材オプションをランダム生成
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const options: MaterialOption[] = [];

    for (let i = 0; i < 3; i++) {
      // 【素材選択】: 素材プールからランダム選択
      // 【レア出現率】: adjustedRareRateは将来的な拡張のために計算（現在は未使用）
      // 🔵 信頼性レベル: note.md・設計文書に明記
      const randomIndex = Math.floor(this.randomFn() * materialPool.length);
      const materialId = materialPool[randomIndex] as MaterialId;

      // 【マスターデータ取得】: 素材IDに対応するマスターデータを取得
      // 🔵 信頼性レベル: note.md・設計文書に明記
      const material = this.masterDataRepo.getMaterialById(materialId);

      // 【品質生成】: MaterialServiceでランダム品質を生成
      // 【処理方針】: マスターデータが取得できない場合はスキップ
      // 🔵 信頼性レベル: note.md・設計文書に明記
      if (material) {
        const quality = this.materialService.generateRandomQuality(material.baseQuality);

        options.push({
          materialId,
          quality,
          quantity: 1,
        });
      }
    }

    // 【結果返却】: 生成した素材オプション配列を返す
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return options;
  }
}
