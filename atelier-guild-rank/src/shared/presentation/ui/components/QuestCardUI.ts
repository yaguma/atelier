/**
 * QuestCardUIコンポーネント
 * TASK-0022 依頼受注フェーズUI
 * TASK-0054 テーマ定数統一（カラー・アニメーション）
 *
 * @description
 * 個別依頼をカード形式で表示するコンポーネント。
 * 依頼者名、セリフ、依頼内容、報酬情報を表示する。
 * カードクリックで詳細モーダルを開き、そこから受注する。
 */

import type { Quest } from '@domain/entities/Quest';
import { formatCondition } from '@shared/utils';
import type Phaser from 'phaser';
import { Colors } from '../theme';
import { BaseComponent } from './BaseComponent';

/**
 * 依頼カードUIの設定
 */
export interface QuestCardUIConfig {
  /** 表示する依頼 */
  quest: Quest;
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
  /** インタラクティブにするか（デフォルト: true） */
  interactive?: boolean;
  /** アイテム名解決関数（itemId → 日本語名） */
  itemNameResolver?: (itemId: string) => string;
}

/**
 * QuestCardUIコンポーネント
 *
 * 依頼の視覚的表現を管理するコンポーネント。
 * 依頼者名、セリフ、依頼内容、報酬を表示し、
 * カードクリックで詳細モーダルを開く。
 */
export class QuestCardUI extends BaseComponent {
  private config: QuestCardUIConfig;
  private quest: Quest;
  private background!: Phaser.GameObjects.Rectangle;
  private clientNameText!: Phaser.GameObjects.Text;
  private dialogueText!: Phaser.GameObjects.Text;
  private conditionText!: Phaser.GameObjects.Text;
  private rewardText!: Phaser.GameObjects.Text;
  private deadlineText!: Phaser.GameObjects.Text;

  /** create()が既に呼ばれたかのフラグ */
  private isCreated = false;

  /**
   * 【カードの寸法定数】: 依頼カードUIのレイアウトを定義する基本寸法
   * 【設計方針】: 定数化により、将来的なデザイン変更時の保守性を向上
   * 🔵 信頼性レベル: 実装ファイルに基づく
   */
  private static readonly CARD_WIDTH = 280; // 【カード幅】: 3列グリッド配置を考慮した幅
  private static readonly CARD_HEIGHT = 180; // 【カード高】: 依頼情報を収める高さ
  private static readonly PADDING = 12; // 【余白】: 要素間の基本余白

  /**
   * 【テキスト配置オフセット定数】: カード内のテキスト要素の垂直位置調整
   * 【設計方針】: マジックナンバーを排除し、レイアウトの意図を明確化
   * 【保守性】: テキスト配置の調整が容易になる
   * 🔵 信頼性レベル: 既存実装のマジックナンバーを定数化
   */
  private static readonly TEXT_DIALOGUE_OFFSET = 25; // 【セリフの追加オフセット】: 依頼者名の下
  private static readonly TEXT_CONDITION_OFFSET = 80; // 【条件の追加オフセット】: カード下部からの位置
  private static readonly TEXT_REWARD_OFFSET = 60; // 【報酬の追加オフセット】: カード下部からの位置
  private static readonly TEXT_DEADLINE_OFFSET = 40; // 【期限の追加オフセット】: カード下部からの位置

  // Issue #118: ホバー拡大エフェクト定数を削除（カードクリックで詳細モーダルを開く方式に変更）

  constructor(scene: Phaser.Scene, config: QuestCardUIConfig) {
    // バリデーション: configが必須
    if (!config) {
      throw new Error('config is required');
    }

    // バリデーション: questが必須
    if (!config.quest) {
      throw new Error('config.quest is required');
    }

    // Issue #137: 親コンテナに追加されるため、シーンには直接追加しない
    super(scene, config.x, config.y, { addToScene: false });

    this.config = {
      ...config,
      interactive: config.interactive ?? true,
    };
    this.quest = config.quest;

    // 依頼カードUIを生成
    this.create();
  }

  /**
   * 依頼カードUIを生成する（BaseComponentの抽象メソッド実装）
   */
  public create(): void {
    // 既に作成済みの場合はスキップ
    if (this.isCreated) return;
    this.isCreated = true;

    this.createBackground();
    this.createClientName();
    this.createDialogue();
    this.createConditionInfo();
    this.createRewardInfo();
    this.createDeadline();
    this.setupInteraction();
  }

  /**
   * 【カードの背景を作成】: 依頼カードの背景矩形を生成
   * 【配置位置】: カード中央に配置
   * 【デザイン】: 黄色系の温かみのある色合いで依頼感を演出
   * TASK-0054: Colors.background.parchment, Colors.border.quest を使用
   * 🔵 信頼性レベル: 実装ファイルに基づく
   */
  private createBackground(): void {
    this.background = this.scene.add.rectangle(
      0,
      0,
      QuestCardUI.CARD_WIDTH,
      QuestCardUI.CARD_HEIGHT,
      Colors.background.parchment, // 【背景色】: 淡い黄色（Parchment風）
    );
    // 【型安全性】: setStrokeStyleはテストモックで定義されていないため、存在確認してから呼び出す
    if (this.background.setStrokeStyle) {
      this.background.setStrokeStyle(2, Colors.border.quest); // 【枠線】: 濃い黄色で強調
    }
    this.container.add(this.background);
  }

  /**
   * 【依頼者名の作成】: 依頼者名を表示するテキスト要素を生成
   * 【配置位置】: カード上部左寄せに配置
   * 【設計意図】: 依頼者を太字で目立たせ、視認性を向上
   * 【型安全性】: clientがnullの場合、デフォルト値「不明な依頼者」を表示
   * 🔵 信頼性レベル: 実装ファイルに基づく
   */
  private createClientName(): void {
    // 【型安全性】: Optional Chainingでnullチェック、空文字列もチェック
    const clientName = this.quest.client?.name || '';
    const displayName = clientName.trim() === '' ? '不明な依頼者' : clientName;

    // 【Y座標計算】: カード上端 + 余白
    // 【レイアウト意図】: カード最上部に依頼者名を配置
    const nameY = -QuestCardUI.CARD_HEIGHT / 2 + QuestCardUI.PADDING;

    // 【テキスト生成】: 依頼者名を太字で左寄せに表示
    this.clientNameText = this.scene.add.text(
      -QuestCardUI.CARD_WIDTH / 2 + QuestCardUI.PADDING,
      nameY,
      displayName,
      {
        fontSize: '14px',
        color: '#000000',
        fontStyle: 'bold',
      },
    );
    this.clientNameText.setOrigin(0, 0);
    this.container.add(this.clientNameText);
  }

  /**
   * 【セリフの作成】: 依頼のセリフ（フレーバーテキスト）を表示するテキスト要素を生成
   * 【配置位置】: 依頼者名の下に配置
   * 【設計意図】: 依頼の雰囲気を伝え、プレイヤーの没入感を向上
   * 【型安全性】: flavorTextがnullの場合、空文字列を表示
   * 🔵 信頼性レベル: 実装ファイルに基づく
   */
  private createDialogue(): void {
    // 【型安全性】: Optional Chainingでnullチェック
    const dialogue = this.quest.flavorText || '';

    // 【Y座標計算】: カード上端 + 余白 + 依頼者名オフセット
    // 【レイアウト意図】: 依頼者名の下にセリフを配置
    const dialogueY =
      -QuestCardUI.CARD_HEIGHT / 2 + QuestCardUI.PADDING + QuestCardUI.TEXT_DIALOGUE_OFFSET;

    // 【テキスト生成】: セリフを灰色で左寄せに表示
    // 【ワードラップ】: カード幅に収まるように自動改行
    this.dialogueText = this.scene.add.text(
      -QuestCardUI.CARD_WIDTH / 2 + QuestCardUI.PADDING,
      dialogueY,
      dialogue,
      {
        fontSize: '12px',
        color: '#333333',
        wordWrap: { width: QuestCardUI.CARD_WIDTH - QuestCardUI.PADDING * 2 },
      },
    );
    this.dialogueText.setOrigin(0, 0);
    this.container.add(this.dialogueText);
  }

  /**
   * 【条件情報の作成】: 依頼の達成条件を表示するテキスト要素を生成
   * 【配置位置】: セリフの下、報酬の上に配置
   * 【設計意図】: プレイヤーが何を納品すべきか即座に判断できるよう表示
   */
  private createConditionInfo(): void {
    const conditionLabel = formatCondition(this.quest.condition, {
      itemNameResolver: this.config.itemNameResolver,
      withPrefix: true,
    });

    const conditionY =
      QuestCardUI.CARD_HEIGHT / 2 - QuestCardUI.PADDING - QuestCardUI.TEXT_CONDITION_OFFSET;

    this.conditionText = this.scene.add.text(
      -QuestCardUI.CARD_WIDTH / 2 + QuestCardUI.PADDING,
      conditionY,
      conditionLabel,
      {
        fontSize: '12px',
        color: '#1a5276',
        fontStyle: 'bold',
      },
    );
    this.conditionText.setOrigin(0, 0);
    this.container.add(this.conditionText);
  }

  /**
   * 【報酬情報の作成】: 依頼の報酬情報を表示するテキスト要素を生成
   * 【配置位置】: カード下部に配置
   * 【設計意図】: プレイヤーが報酬を即座に判断できるよう視認性を重視
   * 【型安全性】: baseContribution、baseGoldがnullの場合、0を表示
   * 🔵 信頼性レベル: 実装ファイルに基づく
   */
  private createRewardInfo(): void {
    // 【型安全性】: Optional Chainingでnullチェック
    const contribution = this.quest.baseContribution || 0;
    const gold = this.quest.baseGold || 0;
    const rewardText = `${contribution}貢献度 / ${gold}G`;

    // 【Y座標計算】: カード下端 - 余白 - 報酬オフセット
    // 【レイアウト意図】: カード下部に報酬情報を配置
    const rewardY =
      QuestCardUI.CARD_HEIGHT / 2 - QuestCardUI.PADDING - QuestCardUI.TEXT_REWARD_OFFSET;

    // 【テキスト生成】: 報酬情報を黒で左寄せに表示
    this.rewardText = this.scene.add.text(
      -QuestCardUI.CARD_WIDTH / 2 + QuestCardUI.PADDING,
      rewardY,
      rewardText,
      {
        fontSize: '12px',
        color: '#000000',
      },
    );
    this.rewardText.setOrigin(0, 0);
    this.container.add(this.rewardText);
  }

  /**
   * 【期限の作成】: 依頼の期限を表示するテキスト要素を生成
   * 【配置位置】: 報酬情報の下に配置
   * 【設計意図】: プレイヤーが期限を確認できるよう配置
   * 【型安全性】: deadlineがnullの場合、0を表示
   * 🔵 信頼性レベル: 実装ファイルに基づく
   */
  private createDeadline(): void {
    // 【型安全性】: Optional Chainingでnullチェック
    const deadline = this.quest.deadline || 0;
    const deadlineText = `期限: ${deadline}日`;

    // 【Y座標計算】: カード下端 - 余白 - 期限オフセット
    // 【レイアウト意図】: 報酬情報の下に期限を配置
    const deadlineY =
      QuestCardUI.CARD_HEIGHT / 2 - QuestCardUI.PADDING - QuestCardUI.TEXT_DEADLINE_OFFSET;

    // 【テキスト生成】: 期限を灰色で左寄せに表示
    this.deadlineText = this.scene.add.text(
      -QuestCardUI.CARD_WIDTH / 2 + QuestCardUI.PADDING,
      deadlineY,
      deadlineText,
      {
        fontSize: '12px',
        color: '#666666',
      },
    );
    this.deadlineText.setOrigin(0, 0);
    this.container.add(this.deadlineText);
  }

  /**
   * 【インタラクティブ機能の設定】: カードのインタラクション設定
   *
   * 【設計方針】:
   * - カード全体をクリック可能にして、詳細モーダルを開く
   *
   * 🔵 信頼性レベル: 実装ファイルに基づく
   */
  private setupInteraction(): void {
    // 【早期リターン】: インタラクティブ機能が無効な場合は何もしない
    if (!this.config.interactive) return;

    // カード全体をクリック可能にして、詳細モーダルを開けるようにする
    this.background.setInteractive({ useHandCursor: true });
  }

  /**
   * 【背景を取得する】: カードクリックハンドラ設定用にbackgroundを公開
   * @returns 背景のGameObject
   */
  public getBackground(): Phaser.GameObjects.Rectangle {
    return this.background;
  }

  /**
   * 【コンポーネントを破棄する】: すべてのGameObjectsとコンテナを破棄
   * 【メモリリーク防止】: 各要素を個別に破棄し、メモリリークを防止
   * 【型安全性】: 各要素の存在確認を行ってから破棄
   * 🔵 信頼性レベル: 実装ファイルに基づく
   */
  public destroy(): void {
    // 【メモリリーク防止】: すべてのGameObjectsを個別に破棄
    // 【型安全性】: 存在確認してから破棄
    if (this.background) {
      this.background.destroy();
    }
    if (this.clientNameText) {
      this.clientNameText.destroy();
    }
    if (this.dialogueText) {
      this.dialogueText.destroy();
    }
    if (this.conditionText) {
      this.conditionText.destroy();
    }
    if (this.rewardText) {
      this.rewardText.destroy();
    }
    if (this.deadlineText) {
      this.deadlineText.destroy();
    }

    // 【コンテナを破棄】: 最後にコンテナ自体を破棄
    if (this.container) {
      this.container.destroy();
    }
  }

  /**
   * 【依頼データを取得】: このカードが表示している依頼エンティティを返す
   * 【用途】: 親コンポーネントから依頼情報にアクセスするために公開
   * 🔵 信頼性レベル: 実装ファイルに基づく
   *
   * @returns 依頼エンティティ
   */
  public getQuest(): Quest {
    return this.quest;
  }
}
