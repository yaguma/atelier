/**
 * CardUIコンポーネント
 * TASK-0021 カードUIコンポーネント
 * TASK-0054 テーマ定数統一（カラー・アニメーション）
 * TASK-0070 features/deck/components作成
 *
 * @description
 * ゲーム内で使用されるカードの視覚的表現を提供するコンポーネント。
 * カードタイプに応じた色分け、インタラクティブな操作、アニメーション効果を実装。
 */

import { Colors, toColorStr } from '@presentation/ui/theme';
import { AnimationPresets } from '@presentation/ui/utils/AnimationPresets';
import { BaseComponent } from '@shared/components';
import Phaser from 'phaser';
import type { Card } from '../types';

/**
 * カードUIの設定
 */
export interface CardUIConfig {
  /** 表示するカード */
  card: Card;
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
  /** インタラクティブにするか（デフォルト: false） */
  interactive?: boolean;
  /** クリック時のコールバック */
  onClick?: (card: Card) => void;
}

/**
 * CardUIコンポーネント
 *
 * カードの視覚的表現を管理するコンポーネント。
 * 背景、アイコン、名前、コスト、効果テキストを表示し、
 * ホバー時の拡大やクリックイベントをサポートする。
 */
export class CardUI extends BaseComponent {
  private config: CardUIConfig;
  private card: Card;
  private background!: Phaser.GameObjects.Rectangle;
  private iconPlaceholder!: Phaser.GameObjects.Rectangle;
  private nameText!: Phaser.GameObjects.Text;
  private costText!: Phaser.GameObjects.Text;
  private effectText!: Phaser.GameObjects.Text;

  /**
   * 【カードの寸法定数】: カードUIのレイアウトを定義する基本寸法
   * 【設計方針】: 定数化により、将来的なデザイン変更時の保守性を向上
   */
  private static readonly CARD_WIDTH = 120; // 【カード幅】: 手札表示時の横並び配置を考慮
  private static readonly CARD_HEIGHT = 160; // 【カード高】: アイコン、テキスト、効果説明を収める高さ
  private static readonly ICON_SIZE = 80; // 【アイコンサイズ】: カード上部のアイコン領域
  private static readonly PADDING = 8; // 【余白】: 要素間の基本余白

  /**
   * 【テキスト配置オフセット定数】: カード内のテキスト要素の垂直位置調整
   * 【設計方針】: マジックナンバーを排除し、レイアウトの意図を明確化
   * 【保守性】: テキスト配置の調整が容易になる
   * 🔵 信頼性レベル: 既存実装のマジックナンバーを定数化
   */
  private static readonly TEXT_NAME_OFFSET = 0; // 【カード名の追加オフセット】: アイコン直下
  private static readonly TEXT_COST_OFFSET = 20; // 【コストの追加オフセット】: 名前の下
  private static readonly TEXT_EFFECT_OFFSET = 40; // 【効果テキストの追加オフセット】: コストの下

  constructor(scene: Phaser.Scene, config: CardUIConfig) {
    super(scene, config.x, config.y);

    // バリデーション: cardが必須
    if (!config.card) {
      throw new Error('CardUI: card is required');
    }

    this.config = {
      ...config,
      interactive: config.interactive ?? false,
    };
    this.card = config.card;

    // カードUIを生成
    this.create();
  }

  /**
   * カードUIを生成する（BaseComponentの抽象メソッド実装）
   */
  public create(): void {
    this.createBackground();
    this.createIcon();
    this.createName();
    this.createCost();
    this.createEffect();
    this.setupInteraction();
  }

  /**
   * カードの背景を作成
   * カードタイプに応じて色を変更する
   */
  private createBackground(): void {
    const color = this.getCardTypeColor();
    this.background = new Phaser.GameObjects.Rectangle(
      this.scene,
      0,
      0,
      CardUI.CARD_WIDTH,
      CardUI.CARD_HEIGHT,
      color,
    );
    this.background.setStrokeStyle(2, Colors.text.primary);
    this.container.add(this.background);
  }

  /**
   * カードタイプに応じた色を取得
   * TASK-0054: Colors.cardType から統一カラーパレットを使用
   *
   * @returns カードタイプごとの色コード
   */
  private getCardTypeColor(): number {
    switch (this.card.type) {
      case 'GATHERING':
        return Colors.cardType.gathering;
      case 'RECIPE':
        return Colors.cardType.recipe;
      case 'ENHANCEMENT':
        return Colors.cardType.enhancement;
      default:
        return Colors.cardType.default;
    }
  }

  /**
   * カードアイコンを作成
   * 現在はプレースホルダーとして矩形を表示
   */
  private createIcon(): void {
    const iconY = -CardUI.CARD_HEIGHT / 2 + CardUI.ICON_SIZE / 2 + CardUI.PADDING;

    // プレースホルダー：将来的には画像に置き換え
    this.iconPlaceholder = new Phaser.GameObjects.Rectangle(
      this.scene,
      0,
      iconY,
      CardUI.ICON_SIZE,
      CardUI.ICON_SIZE,
      Colors.ui.placeholder,
    );
    this.iconPlaceholder.setStrokeStyle(1, Colors.text.secondary);
    this.container.add(this.iconPlaceholder);
  }

  /**
   * 【カード名の作成】: カード名を表示するテキスト要素を生成
   * 【配置位置】: アイコンの直下、カード中央に配置
   * 【設計意図】: カード名を太字で目立たせ、視認性を向上
   * 🔵 信頼性レベル: 実装ファイルに基づく
   */
  private createName(): void {
    // 【Y座標計算】: カード上端 + アイコン領域 + 余白 + 追加オフセット
    // 【レイアウト意図】: アイコンの直下にカード名を配置
    const nameY =
      -CardUI.CARD_HEIGHT / 2 + CardUI.ICON_SIZE + CardUI.PADDING * 2 + CardUI.TEXT_NAME_OFFSET;

    // 【テキスト生成】: カード名を太字で中央揃えに表示
    // 【ワードラップ】: カード幅に収まるように自動改行
    this.nameText = this.scene.make.text({
      x: 0,
      y: nameY,
      text: this.card.name,
      style: {
        fontSize: '16px',
        color: toColorStr(Colors.text.dark),
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: CardUI.CARD_WIDTH - CardUI.PADDING * 2 },
      },
      add: false,
    });
    this.nameText.setOrigin(0.5, 0);
    this.container.add(this.nameText);
  }

  /**
   * 【カードコストの作成】: カードの使用コストを表示するテキスト要素を生成
   * 【配置位置】: カード名の下、エネルギーアイコン付きで表示
   * 【設計意図】: プレイヤーがコストを即座に判断できるよう視認性を重視
   * 🔵 信頼性レベル: 実装ファイルに基づく
   */
  private createCost(): void {
    // 【Y座標計算】: カード上端 + アイコン領域 + 余白 + コストオフセット
    // 【レイアウト意図】: カード名とのバランスを考慮した配置
    const costY =
      -CardUI.CARD_HEIGHT / 2 + CardUI.ICON_SIZE + CardUI.PADDING * 3 + CardUI.TEXT_COST_OFFSET;

    // 【テキスト生成】: エネルギーアイコン（⚡）とコスト値を表示
    // 【ユーザビリティ】: アイコンにより直感的な理解を促進
    this.costText = this.scene.make.text({
      x: 0,
      y: costY,
      text: `⚡ ${this.card.cost}`,
      style: {
        fontSize: '16px',
        color: toColorStr(Colors.text.dark),
        align: 'center',
      },
      add: false,
    });
    this.costText.setOrigin(0.5, 0);
    this.container.add(this.costText);
  }

  /**
   * 【カード効果テキストの作成】: カードの効果説明を表示するテキスト要素を生成
   * 【配置位置】: コスト表示の下、カード下部に配置
   * 【設計意図】: カードの効果を簡潔に伝え、プレイヤーの意思決定を支援
   * 🔵 信頼性レベル: 実装ファイルに基づく
   */
  private createEffect(): void {
    // 【Y座標計算】: カード上端 + アイコン領域 + 余白 + 効果テキストオフセット
    // 【レイアウト意図】: カード下部に十分なスペースを確保して説明文を配置
    const effectY =
      -CardUI.CARD_HEIGHT / 2 + CardUI.ICON_SIZE + CardUI.PADDING * 4 + CardUI.TEXT_EFFECT_OFFSET;

    // 【効果テキストの生成】: カードタイプに応じた効果説明を取得
    // 【簡易版実装】: 基本的な効果説明のみを表示（将来的に拡張可能）
    const effectDescription = this.getEffectDescription();

    // 【テキスト生成】: 小さめのフォントで灰色の説明文を表示
    // 【ワードラップ】: カード幅に収まるように自動改行
    // 【可読性】: やや小さめのフォントで情報密度を確保
    this.effectText = this.scene.make.text({
      x: 0,
      y: effectY,
      text: effectDescription,
      style: {
        fontSize: '16px',
        color: toColorStr(Colors.text.primary),
        align: 'center',
        wordWrap: { width: CardUI.CARD_WIDTH - CardUI.PADDING * 2 },
      },
      add: false,
    });
    this.effectText.setOrigin(0.5, 0);
    this.container.add(this.effectText);
  }

  /**
   * カードの効果説明を取得（簡易版）
   *
   * @returns 効果の説明文
   */
  private getEffectDescription(): string {
    // カードタイプに応じた基本的な説明を生成
    if (this.card.isGatheringCard()) {
      const materialCount = this.card.master.materialPool?.length || 0;
      return `素材を${materialCount}種類採取`;
    }

    if (this.card.isRecipeCard()) {
      return `アイテムを調合`;
    }

    if (this.card.isEnhancementCard()) {
      return `効果を発動`;
    }

    return 'カード効果';
  }

  /**
   * 【インタラクティブ機能の設定】: ホバー時の拡大とクリックイベントを追加
   * 【ユーザビリティ】: カードが操作可能であることを視覚的にフィードバック
   * 【設計方針】: interactiveフラグによる条件付き有効化
   * 🔵 信頼性レベル: 実装ファイルに基づく
   */
  private setupInteraction(): void {
    // 【早期リターン】: インタラクティブ機能が無効な場合は何もしない
    if (!this.config.interactive) return;

    // 【カーソル設定】: ホバー時にポインターカーソルを表示
    // 【ユーザビリティ】: クリック可能であることを視覚的に示す
    this.background.setInteractive({ useHandCursor: true });

    // 【ホバー時の拡大エフェクト】: カードを1.1倍に拡大してフィードバック
    // TASK-0054: AnimationPresets.scale.hoverLarge を使用
    // 【アニメーション設計】:
    //   - スケール: 1.1倍（控えめな拡大で他のカードを邪魔しない）
    //   - 時間: 100ms（素早いレスポンスでストレスフリー）
    //   - イージング: Power2（自然な加速・減速）
    // 【UX効果】: ユーザーの操作に即座に反応し、選択意図を明確化
    // 🔵 信頼性レベル: 実装ファイルに基づく
    this.background.on('pointerover', () => {
      this.scene.tweens.add({
        targets: this.container,
        ...AnimationPresets.scale.hoverLarge,
      });
    });

    // 【ホバー解除時の縮小エフェクト】: カードを元のサイズに戻す
    // TASK-0054: AnimationPresets.scale.resetXY を使用
    // 【アニメーション設計】:
    //   - スケール: 1.0倍（元のサイズに復帰）
    //   - 時間: 100ms（拡大時と同じ時間で統一感）
    //   - イージング: Power2（拡大時と同じイージングで自然な動き）
    // 【UX効果】: 他のカードとの視覚的整合性を保つ
    // 🔵 信頼性レベル: 実装ファイルに基づく
    this.background.on('pointerout', () => {
      this.scene.tweens.add({
        targets: this.container,
        ...AnimationPresets.scale.resetXY,
      });
    });

    // 【クリックイベント】: カードクリック時にコールバックを実行
    // 【イベント伝播】: optional chaining（?.）で安全にコールバック実行
    // 【設計意図】: 親コンポーネント（HandDisplayなど）にカード選択を通知
    this.background.on('pointerdown', () => {
      this.config.onClick?.(this.card);
    });
  }

  /**
   * コンポーネントを破棄する（BaseComponentの抽象メソッド実装）
   */
  public destroy(): void {
    // すべてのGameObjectsを破棄
    if (this.background) {
      this.background.destroy();
    }
    if (this.iconPlaceholder) {
      this.iconPlaceholder.destroy();
    }
    if (this.nameText) {
      this.nameText.destroy();
    }
    if (this.costText) {
      this.costText.destroy();
    }
    if (this.effectText) {
      this.effectText.destroy();
    }

    // コンテナを破棄
    if (this.container) {
      this.container.destroy();
    }
  }

  /**
   * カードデータを取得
   *
   * @returns カードエンティティ
   */
  public getCard(): Card {
    return this.card;
  }

  /**
   * コンテナを取得
   * HandDisplayなどの親コンポーネントからアクセスするために公開
   *
   * @returns Phaserコンテナ
   */
  public override getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }
}
