/**
 * LocationSelectUI - 採取場所選択UIコンポーネント
 *
 * TASK-0113: LocationSelectUI実装
 *
 * @description
 * 採取地カードリストを表示し、手札連動で選択可能な場所をフィルタリングする。
 * 各カードにAPコスト・素材プレビューを表示。
 *
 * @信頼性レベル 🔵 REQ-002・architecture.md・design-interview.md D8に基づく
 */

import { BaseComponent } from '@shared/components';
import { Colors, THEME } from '@shared/theme/theme';
import type { CardId } from '@shared/types';
import type {
  IGatheringLocation,
  ILocationSelectResult,
  IMaterialPreview,
} from '../types/gathering-location';

// =============================================================================
// 定数
// =============================================================================

/** カードのレイアウト定数 */
const CARD_LAYOUT = {
  /** カード幅 */
  WIDTH: 280,
  /** カード高さ */
  HEIGHT: 120,
  /** カード間隔 */
  GAP: 12,
  /** カード内パディング */
  PADDING: 12,
} as const;

/** カード色定数（Colors統一カラーパレットを参照） */
const CARD_COLORS = {
  /** 選択可能カード背景 */
  SELECTABLE_BG: Colors.background.card,
  /** 選択可能カードボーダー（採取カード色） */
  SELECTABLE_BORDER: Colors.cardType.gathering,
  /** 選択不可カード背景 */
  UNSELECTABLE_BG: Colors.background.primary,
  /** 選択不可カードボーダー */
  UNSELECTABLE_BORDER: Colors.border.primary,
  /** ホバー時ボーダー */
  HOVER_BORDER: Colors.border.gold,
} as const;

/** 選択不可時のアルファ値 */
const UNSELECTABLE_ALPHA = 0.5;

/** 空手札メッセージ */
const EMPTY_HAND_MESSAGE = '採取地カードがありません';

/** 出現率ラベルの日本語マッピング */
const DROP_RATE_LABELS: Record<string, string> = {
  high: '◎',
  medium: '○',
  low: '△',
};

// =============================================================================
// LocationSelectUI クラス
// =============================================================================

/**
 * 採取場所選択UIコンポーネント
 *
 * 採取フェーズの場所選択ステージで使用する。
 * 場所カードリストを表示し、手札にあるカードの場所のみ選択可能にする。
 *
 * @信頼性レベル 🔵 REQ-002・architecture.mdに基づく
 */
export class LocationSelectUI extends BaseComponent {
  // ===========================================================================
  // 内部状態
  // ===========================================================================

  /** 現在の場所データ */
  private _locations: readonly IGatheringLocation[] = [];

  /** 場所選択コールバック */
  private _onLocationSelectCallback: ((result: ILocationSelectResult) => void) | null = null;

  /** 空手札メッセージが表示されているか */
  private _showingEmptyMessage = false;

  // ===========================================================================
  // 視覚要素
  // ===========================================================================

  /** 場所カードコンテナ配列 */
  private _locationCardContainers: Phaser.GameObjects.Container[] = [];

  /** 空手札メッセージテキスト */
  private _emptyMessageText: Phaser.GameObjects.Text | null = null;

  /** 初期化済みフラグ */
  private _created = false;

  // ===========================================================================
  // ライフサイクルメソッド
  // ===========================================================================

  /**
   * コンポーネントの初期化処理
   * TASK-0113: 場所選択UIの視覚要素を初期化
   */
  create(): void {
    if (this._created) return;
    this._created = true;
  }

  /**
   * コンポーネントの破棄処理
   */
  destroy(): void {
    this.clearLocationCards();
    if (this._emptyMessageText) {
      this._emptyMessageText.destroy();
      this._emptyMessageText = null;
    }
    this.container.destroy(true);
  }

  // ===========================================================================
  // 公開メソッド
  // ===========================================================================

  /**
   * 場所リストを更新する
   *
   * @param locations - 表示する場所データ（isSelectableフラグ付き）
   */
  updateLocations(locations: readonly IGatheringLocation[]): void {
    this._locations = locations;
    this.clearLocationCards();
    this.hideEmptyMessage();

    // 選択可能な場所があるかチェック
    const hasSelectable = locations.some((l) => l.isSelectable);
    if (!hasSelectable) {
      this.showEmptyMessage();
    }

    // 場所カードを生成
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      if (location) {
        this.createLocationCard(location, i);
      }
    }
  }

  /**
   * 場所選択コールバックを設定する
   *
   * @param callback - 場所選択時に呼ばれるコールバック
   */
  onLocationSelect(callback: (result: ILocationSelectResult) => void): void {
    this._onLocationSelectCallback = callback;
  }

  /**
   * 場所選択をシミュレートする（テスト用）
   *
   * @param cardId - 選択する場所のカードID
   */
  simulateLocationSelect(cardId: CardId): void {
    const location = this._locations.find((l) => l.cardId === cardId);
    if (!location || !location.isSelectable) return;

    if (this._onLocationSelectCallback) {
      this._onLocationSelectCallback({
        cardId: location.cardId,
        locationName: location.name,
        movementAPCost: location.movementAPCost,
      });
    }
  }

  /**
   * 表示中の場所数を取得する
   */
  getLocationCount(): number {
    return this._locations.length;
  }

  /**
   * 選択可能な場所数を取得する
   */
  getSelectableLocationCount(): number {
    return this._locations.filter((l) => l.isSelectable).length;
  }

  /**
   * 空手札メッセージが表示されているかを取得する
   */
  hasEmptyHandMessage(): boolean {
    return this._showingEmptyMessage;
  }

  // ===========================================================================
  // プライベートメソッド
  // ===========================================================================

  /**
   * 場所カードを1つ生成する
   */
  private createLocationCard(location: IGatheringLocation, index: number): void {
    const y = index * (CARD_LAYOUT.HEIGHT + CARD_LAYOUT.GAP);
    const cardContainer = this.scene.add.container(0, y);
    if (this.scene.children?.remove) {
      this.scene.children.remove(cardContainer);
    }

    // カード背景
    const bgColor = location.isSelectable ? CARD_COLORS.SELECTABLE_BG : CARD_COLORS.UNSELECTABLE_BG;
    const borderColor = location.isSelectable
      ? CARD_COLORS.SELECTABLE_BORDER
      : CARD_COLORS.UNSELECTABLE_BORDER;

    const bg = this.scene.add.rectangle(
      CARD_LAYOUT.WIDTH / 2,
      CARD_LAYOUT.HEIGHT / 2,
      CARD_LAYOUT.WIDTH,
      CARD_LAYOUT.HEIGHT,
      bgColor,
    );
    bg.setStrokeStyle(2, borderColor);
    cardContainer.add(bg);

    // 場所名テキスト
    const nameText = this.scene.make.text({
      x: CARD_LAYOUT.PADDING,
      y: CARD_LAYOUT.PADDING,
      text: location.name,
      style: {
        fontSize: `${THEME.sizes.medium}px`,
        color: '#FFFFFF',
        fontStyle: 'bold',
        fontFamily: THEME.fonts.primary,
      },
      add: false,
    });
    cardContainer.add(nameText);

    // APコストテキスト
    const apText = this.scene.make.text({
      x: CARD_LAYOUT.WIDTH - CARD_LAYOUT.PADDING - 60,
      y: CARD_LAYOUT.PADDING,
      text: `AP: ${location.movementAPCost}`,
      style: {
        fontSize: `${THEME.sizes.small}px`,
        color: '#FFD700',
        fontFamily: THEME.fonts.primary,
      },
      add: false,
    });
    cardContainer.add(apText);

    // 素材プレビューテキスト
    const materialsText = this.formatMaterialPreview(location.availableMaterials);
    const materialText = this.scene.make.text({
      x: CARD_LAYOUT.PADDING,
      y: CARD_LAYOUT.PADDING + 28,
      text: materialsText,
      style: {
        fontSize: `${THEME.sizes.small}px`,
        color: '#CCCCCC',
        fontFamily: THEME.fonts.primary,
      },
      add: false,
    });
    cardContainer.add(materialText);

    // 選択不可の場合はアルファ値を下げる
    if (!location.isSelectable) {
      cardContainer.setAlpha(UNSELECTABLE_ALPHA);
    }

    // 選択可能な場合はインタラクションを設定
    if (location.isSelectable) {
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => {
        bg.setStrokeStyle(2, CARD_COLORS.HOVER_BORDER);
      });
      bg.on('pointerout', () => {
        bg.setStrokeStyle(2, CARD_COLORS.SELECTABLE_BORDER);
      });
      bg.on('pointerdown', () => {
        this.handleLocationSelect(location);
      });
    }

    this.container.add(cardContainer);
    this._locationCardContainers.push(cardContainer);
  }

  /**
   * 素材プレビューをフォーマットする
   */
  private formatMaterialPreview(materials: readonly IMaterialPreview[]): string {
    return materials
      .map((m) => `${DROP_RATE_LABELS[m.dropRate] ?? '?'} ${m.name}（${m.rarity}）`)
      .join('  ');
  }

  /**
   * 場所選択ハンドラ
   */
  private handleLocationSelect(location: IGatheringLocation): void {
    if (!this._onLocationSelectCallback) return;

    this._onLocationSelectCallback({
      cardId: location.cardId,
      locationName: location.name,
      movementAPCost: location.movementAPCost,
    });
  }

  /**
   * 場所カードをすべてクリアする
   */
  private clearLocationCards(): void {
    for (const card of this._locationCardContainers) {
      card.destroy(true);
    }
    this._locationCardContainers = [];
  }

  /**
   * 空手札メッセージを表示する
   */
  private showEmptyMessage(): void {
    this._showingEmptyMessage = true;

    if (!this._emptyMessageText) {
      this._emptyMessageText = this.scene.make.text({
        x: CARD_LAYOUT.WIDTH / 2 - 80,
        y: 60,
        text: EMPTY_HAND_MESSAGE,
        style: {
          fontSize: `${THEME.sizes.medium}px`,
          color: '#888888',
          fontFamily: THEME.fonts.primary,
        },
        add: false,
      });
      this.container.add(this._emptyMessageText);
    }

    this._emptyMessageText.setVisible(true);
  }

  /**
   * 空手札メッセージを非表示にする
   */
  private hideEmptyMessage(): void {
    this._showingEmptyMessage = false;
    if (this._emptyMessageText) {
      this._emptyMessageText.setVisible(false);
    }
  }
}
