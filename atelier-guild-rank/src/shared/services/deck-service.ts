/**
 * deck-service.ts - DeckService実装
 *
 * TASK-0009: カードエンティティ・DeckService実装
 *
 * @description
 * デッキサービスの実装。
 * 山札・手札・捨て札の状態管理とカード操作を提供する。
 *
 * @信頼性レベル 🔵
 * - note.mdに基づいた実装
 * - Fisher-Yatesアルゴリズムを使用
 * - デッキ枯渇時の自動リシャッフル対応
 */

import { Card } from '@domain/entities/Card';
import type { IDeckService } from '@domain/interfaces/deck-service.interface';
import type { IMasterDataRepository } from '@domain/interfaces/master-data-repository.interface';
import type { IEventBus } from '@shared/services/event-bus';
import type { CardId } from '@shared/types';
import { ApplicationError, ErrorCodes } from '@shared/types/errors';
import { GameEventType } from '@shared/types/events';

/**
 * 【機能概要】: DeckServiceクラス
 * 【実装方針】: デッキ（山札・手札・捨て札）の状態管理とカード操作を提供
 * 【テスト対応】: T-0009-01 〜 T-DECK-05 を通すための実装
 * 🔵 信頼性レベル: note.md・設計文書に明記
 */
export class DeckService implements IDeckService {
  /**
   * 【定数定義】: 手札の上限枚数
   * 【制限値】: 手札は最大5枚まで
   * 【ゲームバランス】: カードゲームの標準的な手札枚数
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  private readonly HAND_SIZE = 5;

  /**
   * 【定数定義】: デッキの上限枚数
   * 【制限値】: デッキは最大30枚まで
   * 【ゲームバランス】: デッキ構築の多様性を保ちつつ、戦略的な選択を促す
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  private readonly MAX_DECK_SIZE = 30;

  /**
   * 【プライベートプロパティ】: 山札（デッキ）
   * 【実装内容】: Cardインスタンスの配列
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  private deck: Card[] = [];

  /**
   * 【プライベートプロパティ】: 手札
   * 【実装内容】: Cardインスタンスの配列
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  private hand: Card[] = [];

  /**
   * 【プライベートプロパティ】: 捨て札
   * 【実装内容】: Cardインスタンスの配列
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  private discard: Card[] = [];

  /**
   * 【機能概要】: DeckServiceのコンストラクタ
   * 【実装方針】: 依存性注入でMasterDataRepositoryとEventBusを受け取る
   * 【テスト対応】: モックを使用したテストで依存注入を確認
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @param masterDataRepo - マスターデータリポジトリ
   * @param eventBus - イベントバス
   */
  constructor(
    private readonly masterDataRepo: IMasterDataRepository,
    private readonly _eventBus: IEventBus,
  ) {
    // 【実装内容】: 依存性注入のみ、初期化処理はinitialize()で行う
    // 🔵 信頼性レベル: note.md・設計文書に明記
  }

  // =============================================================================
  // 初期化メソッド
  // =============================================================================

  /**
   * 【機能概要】: 初期デッキを構築してシャッフル
   * 【実装方針】: カードIDからCardインスタンスを生成し、デッキに追加してシャッフル
   * 【テスト対応】: T-0009-01 initialize()で初期デッキ構築
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  initialize(cardIds: CardId[]): void {
    // 【初期化処理】: まず状態をリセット
    // 🔵 信頼性レベル: note.md・設計文書に明記
    this.reset();

    // 【カード生成】: カードIDからCardインスタンスを生成してデッキに追加
    // 🔵 信頼性レベル: note.md・設計文書に明記
    for (const cardId of cardIds) {
      // 【マスターデータ取得】: カードIDに対応するマスターデータを取得
      // 🔵 信頼性レベル: note.md・設計文書に明記
      const cardMaster = this.masterDataRepo.getCardById(cardId);
      if (cardMaster) {
        // 【Cardインスタンス生成】: CardIDとマスターデータからインスタンスを作成
        // 🔵 信頼性レベル: note.md・設計文書に明記
        const card = new Card(cardId, cardMaster);
        this.deck.push(card);
      }
    }

    // 【シャッフル実行】: 初期化時に自動的にシャッフル
    // 🔵 信頼性レベル: note.md・設計文書に明記
    this.shuffle();
  }

  /**
   * 【機能概要】: 山札・手札・捨て札をクリア
   * 【実装方針】: 全ての内部配列を空にする
   * 【テスト対応】: T-DECK-01 reset()で状態リセット
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  reset(): void {
    // 【状態クリア】: 全ての内部配列を空配列で初期化
    // 🔵 信頼性レベル: note.md・設計文書に明記
    this.deck = [];
    this.hand = [];
    this.discard = [];
  }

  // =============================================================================
  // デッキ操作メソッド
  // =============================================================================

  /**
   * 【機能概要】: 山札をFisher-Yatesアルゴリズムでシャッフル
   * 【実装方針】: 要素を保持したまま順序のみをランダム化
   * 【アルゴリズム詳細】:
   *   - 配列の末尾から順に、ランダムな位置の要素と交換
   *   - 各要素が各位置に来る確率が等しくなる（公平性が保証される）
   *   - in-placeアルゴリズムのため、追加のメモリを使用しない
   * 【パフォーマンス】:
   *   - 時間計算量: O(n) - 配列の要素数に比例
   *   - 空間計算量: O(1) - 追加のメモリ不要
   * 【テスト対応】: T-0009-02 shuffle()でランダムにシャッフル
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  shuffle(): void {
    // 【Fisher-Yatesアルゴリズム】: 公平なランダムシャッフル
    // 【処理フロー】:
    //   1. 配列の最後の要素から開始（i = length - 1）
    //   2. 0からiまでのランダムな位置jを選択
    //   3. i番目とj番目の要素を交換
    //   4. iを1減らして、次の要素へ
    //   5. iが0になるまで繰り返す
    // 🔵 信頼性レベル: note.md・設計文書に明記
    for (let i = this.deck.length - 1; i > 0; i--) {
      // 【ランダムインデックス取得】: 0からiまでのランダムなインデックスを取得
      // 【公平性保証】: Math.random()により、全ての位置が等確率で選ばれる
      // 🔵 信頼性レベル: note.md・設計文書に明記
      const j = Math.floor(Math.random() * (i + 1));

      // 【要素交換】: 分割代入構文で配列の要素を交換
      // 【効率性】: 一時変数を使わずに交換できる
      // 🔵 信頼性レベル: note.md・設計文書に明記
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  /**
   * 【機能概要】: 山札から指定枚数をドロー
   * 【実装方針】: デッキ枯渇時は捨て札を自動的にシャッフルして山札に戻す
   * 【処理フロー】:
   *   1. 指定枚数分のドロー処理をループ
   *   2. 山札が空の場合、捨て札をシャッフルして山札に戻す
   *   3. 山札からカードを取り出し、手札に追加
   *   4. 山札も捨て札も空の場合は、ドロー可能な枚数まで取得
   * 【プレイヤー体験】: デッキ枯渇時も自動リシャッフルにより、ゲームが継続できる
   * 【テスト対応】: T-0009-03 draw()で手札にカードが追加される、T-0009-04 デッキ枯渇時のドロー
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  draw(count: number): Card[] {
    // 【ドローしたカード】: 戻り値として返す配列
    // 【用途】: ドロー結果をUI更新などに利用するため
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const drawn: Card[] = [];

    // 【ドロー処理】: 指定枚数までループ
    // 【実装内容】: 1枚ずつドローし、デッキ枯渇時は自動リシャッフル
    // 🔵 信頼性レベル: note.md・設計文書に明記
    for (let i = 0; i < count; i++) {
      // 【デッキ枯渇チェック】: 山札が空なら捨て札をシャッフルして補充
      // 【条件】: 山札が空（length === 0）かつ捨て札がある（length > 0）
      // 【重要性】: プレイヤー体験を維持するため、自動的に補充する
      // 🔵 信頼性レベル: note.md・設計文書に明記
      if (this.deck.length === 0 && this.discard.length > 0) {
        // 【自動リシャッフル】: 捨て札をシャッフルして山札に戻す
        // 【実装】: reshuffleDiscard()メソッドを呼び出し
        // 🔵 信頼性レベル: note.md・設計文書に明記
        this.reshuffleDiscard();
      }

      // 【ドロー終了判定】: 山札が空ならループを終了
      // 【条件】: 山札も捨て札も空の場合、これ以上ドローできない
      // 【結果】: ドロー可能な枚数までしか取得できない
      // 🔵 信頼性レベル: note.md・設計文書に明記
      if (this.deck.length === 0) {
        break;
      }

      // 【カードドロー】: 山札からカードを取り出す
      // 【実装】: Array.pop()で配列の末尾から取得（スタック構造）
      // 🔵 信頼性レベル: note.md・設計文書に明記
      const card = this.deck.pop();
      if (card) {
        // 【手札に追加】: ドローしたカードを手札に追加
        // 【同時処理】: 戻り値用の配列にも追加
        // 🔵 信頼性レベル: note.md・設計文書に明記
        this.hand.push(card);
        drawn.push(card);
      }
    }

    // 【イベント発行】: CARD_DRAWNイベントを発行
    // 【用途】: 他のサービスやUIにドロー操作を通知
    // 🔵 信頼性レベル: note.md・設計文書に明記
    if (drawn.length > 0) {
      this._eventBus.emit(GameEventType.CARD_DRAWN, { cards: drawn });
    }

    // 【結果返却】: ドローしたカードの配列を返す
    // 【用途】: UIでドローアニメーションを表示するなど
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return drawn;
  }

  /**
   * 【機能概要】: 手札からカードを使用し、捨て札に移動
   * 【実装方針】: 手札から指定カードを削除し、捨て札に追加
   * 【テスト対応】: T-0009-05 playCard()で手札から捨て札に移動
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  playCard(card: Card): void {
    // 【手札チェック】: 指定されたカードが手札にあるか確認
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const index = this.hand.indexOf(card);
    if (index === -1) {
      // 【エラー処理】: 手札にないカードをプレイしようとした場合にエラー
      // 🔵 信頼性レベル: note.md・設計文書に明記
      throw new ApplicationError(ErrorCodes.CARD_NOT_IN_HAND, 'Card is not in hand');
    }

    // 【削除処理】: splice()で配列から削除
    // 🔵 信頼性レベル: note.md・設計文書に明記
    this.hand.splice(index, 1);

    // 【捨て札に追加】: 削除したカードを捨て札に追加
    // 🔵 信頼性レベル: note.md・設計文書に明記
    this.discard.push(card);

    // 【イベント発行】: CARD_PLAYEDイベントを発行
    // 【用途】: 他のサービスやUIにカードプレイ操作を通知
    // 🔵 信頼性レベル: note.md・設計文書に明記
    this._eventBus.emit(GameEventType.CARD_PLAYED, { card });
  }

  /**
   * 【機能概要】: 手札を全て捨て札に移動
   * 【実装方針】: 手札配列の全要素を捨て札に移動し、手札を空にする
   * 【テスト対応】: T-DECK-02 discardHand()で手札を全て捨て札に移動
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  discardHand(): void {
    // 【破棄するカード】: イベント発行用に手札のコピーを保存
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const discardedCards = [...this.hand];

    // 【手札を捨て札に移動】: スプレッド演算子で配列を結合
    // 🔵 信頼性レベル: note.md・設計文書に明記
    this.discard.push(...this.hand);

    // 【手札をクリア】: 手札配列を空にする
    // 🔵 信頼性レベル: note.md・設計文書に明記
    this.hand = [];

    // 【イベント発行】: CARD_DISCARDEDイベントを発行
    // 【用途】: 他のサービスやUIに手札破棄操作を通知
    // 🔵 信頼性レベル: note.md・設計文書に明記
    if (discardedCards.length > 0) {
      this._eventBus.emit(GameEventType.CARD_DISCARDED, { cards: discardedCards });
    }
  }

  /**
   * 【機能概要】: 手札が5枚になるまでドロー
   * 【実装方針】: HAND_SIZE（5枚）まで不足分をドロー
   * 【テスト対応】: T-0009-06 refillHand()で手札を5枚まで補充
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  refillHand(): void {
    // 【不足枚数計算】: 手札上限から現在の手札枚数を引いた値
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const needed = this.HAND_SIZE - this.hand.length;

    // 【補充処理】: 不足分をドロー
    // 🔵 信頼性レベル: note.md・設計文書に明記
    if (needed > 0) {
      this.draw(needed);

      // 【イベント発行】: HAND_REFILLEDイベントを発行
      // 【用途】: 他のサービスやUIに手札補充操作を通知
      // 🔵 信頼性レベル: note.md・設計文書に明記
      this._eventBus.emit(GameEventType.HAND_REFILLED, { count: needed });
    }
  }

  // =============================================================================
  // 状態取得メソッド
  // =============================================================================

  /**
   * 【機能概要】: 山札の内容を取得（読み取り専用）
   * 【実装方針】: 内部配列のコピーをreadonly配列として返す
   * 【テスト対応】: T-DECK-06 getDeck()で山札を取得
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  getDeck(): readonly Card[] {
    // 【不変性保証】: スプレッド演算子で配列をコピーして返す
    // 【外部変更防止】: 内部配列への直接アクセスを防ぐ
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return [...this.deck];
  }

  /**
   * 【機能概要】: 手札の内容を取得（読み取り専用）
   * 【実装方針】: 内部配列のコピーをreadonly配列として返す
   * 【テスト対応】: T-DECK-07 getHand()で手札を取得
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  getHand(): readonly Card[] {
    // 【不変性保証】: スプレッド演算子で配列をコピーして返す
    // 【外部変更防止】: 内部配列への直接アクセスを防ぐ
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return [...this.hand];
  }

  /**
   * 【機能概要】: 捨て札の内容を取得（読み取り専用）
   * 【実装方針】: 内部配列のコピーをreadonly配列として返す
   * 【テスト対応】: T-DECK-08 getDiscard()で捨て札を取得
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  getDiscard(): readonly Card[] {
    // 【不変性保証】: スプレッド演算子で配列をコピーして返す
    // 【外部変更防止】: 内部配列への直接アクセスを防ぐ
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return [...this.discard];
  }

  /**
   * 【機能概要】: 手札の枚数を取得
   * 【実装方針】: 手札配列の長さを返す
   * 【テスト対応】: T-DECK-09 getHandSize()で手札枚数を取得
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  getHandSize(): number {
    // 【枚数返却】: 手札配列の長さを返す
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return this.hand.length;
  }

  // =============================================================================
  // デッキ構築メソッド
  // =============================================================================

  /**
   * 【機能概要】: デッキにカードを追加
   * 【実装方針】: マスターデータからCardインスタンスを生成し、デッキに追加
   * 【テスト対応】: T-DECK-04 addCard()でカードをデッキに追加
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  addCard(cardId: CardId): void {
    // 【マスターデータ読み込みチェック】: マスターデータが読み込まれているか確認
    // 🔵 信頼性レベル: note.md・設計文書に明記
    if (!this.masterDataRepo.isLoaded()) {
      // 【エラー処理】: マスターデータ未読み込み時にエラー
      // 🔵 信頼性レベル: note.md・設計文書に明記
      throw new ApplicationError(ErrorCodes.DATA_NOT_LOADED, 'Master data not loaded');
    }

    // 【デッキ上限チェック】: デッキが上限に達していないか確認
    // 🔵 信頼性レベル: note.md・設計文書に明記
    if (this.deck.length >= this.MAX_DECK_SIZE) {
      // 【エラー処理】: デッキ上限超過時にエラー
      // 🔵 信頼性レベル: note.md・設計文書に明記
      throw new ApplicationError(
        ErrorCodes.DECK_FULL,
        `Deck is full (max: ${this.MAX_DECK_SIZE} cards)`,
      );
    }

    // 【マスターデータ取得】: カードIDに対応するマスターデータを取得
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const cardMaster = this.masterDataRepo.getCardById(cardId);
    if (!cardMaster) {
      // 【エラー処理】: 存在しないカードID時にエラー
      // 🔵 信頼性レベル: note.md・設計文書に明記
      throw new ApplicationError(ErrorCodes.INVALID_CARD_ID, `Card not found: ${cardId}`);
    }

    // 【Cardインスタンス生成】: CardIDとマスターデータからインスタンスを作成
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const card = new Card(cardId, cardMaster);

    // 【デッキに追加】: 生成したカードをデッキに追加
    // 🔵 信頼性レベル: note.md・設計文書に明記
    this.deck.push(card);
  }

  /**
   * 【機能概要】: デッキからカードを削除
   * 【実装方針】: 指定されたカードIDに一致する最初のカードを削除
   * 【テスト対応】: T-DECK-05 removeCard()でカードをデッキから削除
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  removeCard(cardId: CardId): void {
    // 【カード検索】: 指定されたカードIDに一致する最初のカードを検索
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const index = this.deck.findIndex((card) => card.id === cardId);

    // 【削除処理】: カードが見つかった場合、配列から削除
    // 🔵 信頼性レベル: note.md・設計文書に明記
    if (index !== -1) {
      this.deck.splice(index, 1);
    }
  }

  // =============================================================================
  // プライベートメソッド
  // =============================================================================

  /**
   * 【機能概要】: 捨て札をシャッフルして山札に戻す
   * 【実装方針】: 捨て札を山札に移動し、シャッフルして、捨て札を空にする
   * 【テスト対応】: T-0009-04 デッキ枯渇時のドロー（間接的に使用）
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  private reshuffleDiscard(): void {
    // 【捨て札を山札に移動】: スプレッド演算子で配列を結合
    // 🔵 信頼性レベル: note.md・設計文書に明記
    this.deck = [...this.discard];

    // 【捨て札をクリア】: 捨て札配列を空にする
    // 🔵 信頼性レベル: note.md・設計文書に明記
    this.discard = [];

    // 【シャッフル実行】: 山札をシャッフル
    // 🔵 信頼性レベル: note.md・設計文書に明記
    this.shuffle();
  }
}
