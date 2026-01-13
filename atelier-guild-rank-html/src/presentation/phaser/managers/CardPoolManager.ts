import Phaser from 'phaser';
import { ObjectPool, PoolStats } from '../utils/ObjectPool';
import { PoolableCardView, CardData } from '../ui/cards/PoolableCardView';

/**
 * カードプール管理設定
 */
export interface CardPoolConfig {
  /** 初期プールサイズ（デフォルト: 20） */
  initialSize?: number;
  /** 最大プールサイズ（デフォルト: 50） */
  maxSize?: number;
  /** 自動拡張（デフォルト: true） */
  autoExpand?: boolean;
}

/**
 * カードプール管理クラス
 *
 * カードビューの生成・破棄を効率化するためのプール管理を行う。
 * 頻繁に生成・破棄されるカードオブジェクトを再利用することで、
 * GCの発生を抑制し、パフォーマンスを向上させる。
 */
export class CardPoolManager {
  private pool: ObjectPool<PoolableCardView>;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, config: CardPoolConfig = {}) {
    this.scene = scene;

    this.pool = new ObjectPool<PoolableCardView>({
      scene,
      factory: () => new PoolableCardView(scene),
      initialSize: config.initialSize ?? 20,
      maxSize: config.maxSize ?? 50,
      autoExpand: config.autoExpand ?? true,
    });
  }

  /**
   * カードビューを取得
   * @param cardData カードデータ
   * @param x X座標
   * @param y Y座標
   * @returns カードビュー、またはプール枯渇時はnull
   */
  acquireCard(cardData: CardData, x: number = 0, y: number = 0): PoolableCardView | null {
    const card = this.pool.acquire();

    if (card) {
      card.setPosition(x, y);
      card.setCardData(cardData);
    }

    return card;
  }

  /**
   * 複数のカードビューを取得
   * @param cardDataList カードデータのリスト
   * @param startX 開始X座標
   * @param startY 開始Y座標
   * @param spacing カード間隔
   * @param direction 配置方向（horizontal/vertical）
   * @returns カードビューのリスト
   */
  acquireCards(
    cardDataList: CardData[],
    startX: number = 0,
    startY: number = 0,
    spacing: number = 110,
    direction: 'horizontal' | 'vertical' = 'horizontal'
  ): PoolableCardView[] {
    const cards: PoolableCardView[] = [];

    cardDataList.forEach((data, index) => {
      const x = direction === 'horizontal' ? startX + index * spacing : startX;
      const y = direction === 'vertical' ? startY + index * spacing : startY;

      const card = this.acquireCard(data, x, y);
      if (card) {
        cards.push(card);
      }
    });

    return cards;
  }

  /**
   * カードビューを返却
   * @param card 返却するカードビュー
   */
  releaseCard(card: PoolableCardView): void {
    this.pool.release(card);
  }

  /**
   * 複数のカードビューを返却
   * @param cards 返却するカードビューのリスト
   */
  releaseCards(cards: PoolableCardView[]): void {
    cards.forEach((card) => this.pool.release(card));
  }

  /**
   * 全カードを返却
   */
  releaseAll(): void {
    this.pool.releaseAll();
  }

  /**
   * カードをアニメーション付きで返却
   * @param card 返却するカードビュー
   * @param duration アニメーション時間（ms）
   */
  releaseCardWithAnimation(card: PoolableCardView, duration: number = 200): void {
    this.scene.tweens.add({
      targets: card,
      alpha: 0,
      scaleX: 0.8,
      scaleY: 0.8,
      duration,
      ease: 'Power2',
      onComplete: () => {
        this.pool.release(card);
      },
    });
  }

  /**
   * カードをアニメーション付きで表示
   * @param card 表示するカードビュー
   * @param duration アニメーション時間（ms）
   */
  showCardWithAnimation(card: PoolableCardView, duration: number = 200): void {
    card.setAlpha(0);
    card.setScale(0.8);

    this.scene.tweens.add({
      targets: card,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration,
      ease: 'Back.easeOut',
    });
  }

  /**
   * プールをプリウォーム
   * @param count 事前生成数
   */
  prewarm(count: number): void {
    this.pool.prewarm(count);
  }

  /**
   * 統計情報を取得
   */
  getStats(): PoolStats {
    return this.pool.getStats();
  }

  /**
   * アクティブなカードを取得
   */
  getActiveCards(): PoolableCardView[] {
    return this.pool.getActiveObjects();
  }

  /**
   * 特定のIDのカードを検索
   * @param cardId カードID
   */
  findCardById(cardId: string): PoolableCardView | undefined {
    return this.pool.getActiveObjects().find((card) => card.getCardId() === cardId);
  }

  /**
   * プールが枯渇しているかチェック
   */
  isExhausted(): boolean {
    return this.pool.isExhausted();
  }

  /**
   * 破棄
   */
  destroy(): void {
    this.pool.destroy();
  }

  /**
   * 統計をリセット
   */
  resetStats(): void {
    this.pool.resetStats();
  }

  /**
   * デバッグ情報をコンソールに出力
   */
  logDebugInfo(): void {
    const stats = this.getStats();
    console.group('[CardPoolManager] Debug Info');
    console.log('Total:', stats.total);
    console.log('Active:', stats.active);
    console.log('Available:', stats.available);
    console.log('Acquire Count:', stats.acquireCount);
    console.log('Release Count:', stats.releaseCount);
    console.log('Expand Count:', stats.expandCount);
    console.groupEnd();
  }
}
