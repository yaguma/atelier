/**
 * LocationSelectUI - 採取場所選択UIコンポーネント（マップ形式）
 *
 * Issue #288: 採取場所選択UIをマップ形式に変更（REQ-002-01）
 *
 * @description
 * 採取地をマップ形式（2D座標ベース）で表示し、手札連動で選択可能な場所をフィルタリングする。
 * 各場所をmapX, mapY座標に基づいてマップ上に配置し、APコスト・素材プレビューを表示。
 *
 * @信頼性レベル 🔵 REQ-002-01・architecture.md・design-interview.md D8に基づく
 */

import { BaseComponent } from '@shared/components';
import { Colors, THEME } from '@shared/theme/theme';
import type { CardId } from '@shared/types';
import type {
  DropRateLabel,
  IGatheringLocation,
  ILocationSelectResult,
  IMaterialPreview,
} from '../types/gathering-location';

// =============================================================================
// 定数
// =============================================================================

/** マップレイアウト定数 */
const MAP_LAYOUT = {
  /** マップタイトルY座標 */
  TITLE_Y: 15,
  /** マップ背景左端X */
  BG_X: 10,
  /** マップ背景上端Y */
  BG_Y: 40,
  /** マップ背景幅 */
  BG_WIDTH: 600,
  /** マップ背景高さ */
  BG_HEIGHT: 410,
  /** マップ内パディング（ノードが端に寄りすぎないための余白） */
  PADDING: 50,
  /** ロケーションノード半径 */
  NODE_RADIUS: 24,
  /** ノード名テキストのY方向オフセット（ノード中心からの距離） */
  NAME_OFFSET_Y: 34,
  /** APバッジテキストのX方向オフセット */
  AP_OFFSET_X: 20,
  /** APバッジテキストのY方向オフセット */
  AP_OFFSET_Y: -20,
  /** 素材テキストのY方向オフセット */
  MATERIAL_OFFSET_Y: 52,
  /** 素材プレビューのフォントサイズ */
  MATERIAL_FONT_SIZE: 12,
} as const;

/** マップ色定数（Colors統一カラーパレットを参照） */
const MAP_COLORS = {
  /** マップ背景色 */
  MAP_BG: Colors.background.secondary,
  /** マップボーダー色 */
  MAP_BORDER: Colors.border.primary,
  /** 選択可能ノード背景 */
  SELECTABLE_NODE: Colors.cardType.gathering,
  /** 選択不可ノード背景 */
  UNSELECTABLE_NODE: Colors.background.primary,
  /** 選択可能ノードボーダー */
  SELECTABLE_BORDER: Colors.cardType.gathering,
  /** 選択不可ノードボーダー */
  UNSELECTABLE_BORDER: Colors.border.primary,
  /** ホバー時ボーダー */
  HOVER_BORDER: Colors.border.gold,
} as const;

/** 選択不可時のアルファ値 */
const UNSELECTABLE_ALPHA = 0.4;

/** 空手札メッセージ */
const EMPTY_HAND_MESSAGE = '採取地カードがありません';

/** 出現率ラベルの日本語マッピング */
const DROP_RATE_LABELS: Record<DropRateLabel, string> = {
  high: '◎',
  medium: '○',
  low: '△',
};

// =============================================================================
// マップ座標計算（純粋関数）
// =============================================================================

/** マップ座標の境界 */
interface MapBounds {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
}

/**
 * 場所データからマップ座標の境界を計算する（純粋関数）
 *
 * 単一場所の場合はデフォルト範囲を使用し、中央に配置する。
 * 同一座標の場合もデフォルト範囲にフォールバックする。
 */
function calculateMapBounds(locations: readonly IGatheringLocation[]): MapBounds {
  if (locations.length === 0) {
    return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
  }

  if (locations.length === 1) {
    const loc = locations[0];
    if (!loc) return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
    return {
      minX: loc.mapX - 100,
      maxX: loc.mapX + 100,
      minY: loc.mapY - 100,
      maxY: loc.mapY + 100,
    };
  }

  let minX = Number.MAX_SAFE_INTEGER;
  let maxX = Number.MIN_SAFE_INTEGER;
  let minY = Number.MAX_SAFE_INTEGER;
  let maxY = Number.MIN_SAFE_INTEGER;

  for (const loc of locations) {
    if (loc.mapX < minX) minX = loc.mapX;
    if (loc.mapX > maxX) maxX = loc.mapX;
    if (loc.mapY < minY) minY = loc.mapY;
    if (loc.mapY > maxY) maxY = loc.mapY;
  }

  // 同一座標の場合はデフォルト範囲を使用
  if (minX === maxX) {
    minX -= 100;
    maxX += 100;
  }
  if (minY === maxY) {
    minY -= 100;
    maxY += 100;
  }

  return { minX, maxX, minY, maxY };
}

/**
 * マップ座標をUI座標に変換する（純粋関数）
 *
 * mapX, mapYの生データをマップ表示エリア内の座標に線形スケーリングする。
 */
function scaleToMapArea(mapX: number, mapY: number, bounds: MapBounds): { x: number; y: number } {
  const areaLeft = MAP_LAYOUT.BG_X + MAP_LAYOUT.PADDING;
  const areaRight = MAP_LAYOUT.BG_X + MAP_LAYOUT.BG_WIDTH - MAP_LAYOUT.PADDING;
  const areaTop = MAP_LAYOUT.BG_Y + MAP_LAYOUT.PADDING;
  const areaBottom = MAP_LAYOUT.BG_Y + MAP_LAYOUT.BG_HEIGHT - MAP_LAYOUT.PADDING;

  const rangeX = bounds.maxX - bounds.minX;
  const rangeY = bounds.maxY - bounds.minY;

  // range === 0 の場合はエリア中央に配置（NaN防止）
  const x =
    rangeX === 0
      ? (areaLeft + areaRight) / 2
      : areaLeft + ((mapX - bounds.minX) / rangeX) * (areaRight - areaLeft);
  const y =
    rangeY === 0
      ? (areaTop + areaBottom) / 2
      : areaTop + ((mapY - bounds.minY) / rangeY) * (areaBottom - areaTop);

  return { x, y };
}

// =============================================================================
// LocationSelectUI クラス
// =============================================================================

/**
 * 採取場所選択UIコンポーネント（マップ形式）
 *
 * 採取フェーズの場所選択ステージで使用する。
 * 場所をマップ上にmapX, mapY座標ベースで配置し、
 * 手札にあるカードの場所のみ選択可能にする。
 *
 * @信頼性レベル 🔵 REQ-002-01・architecture.mdに基づく
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

  /** 場所ノードコンテナ配列 */
  private _locationNodeContainers: Phaser.GameObjects.Container[] = [];

  /** 空手札メッセージテキスト */
  private _emptyMessageText: Phaser.GameObjects.Text | null = null;

  /** マップ背景 */
  private _mapBackground: Phaser.GameObjects.Rectangle | null = null;

  /** マップタイトルテキスト */
  private _titleText: Phaser.GameObjects.Text | null = null;

  /** 初期化済みフラグ */
  private _created = false;

  // ===========================================================================
  // ライフサイクルメソッド
  // ===========================================================================

  /**
   * コンポーネントの初期化処理
   * Issue #288: マップ背景とタイトルを生成
   */
  create(): void {
    if (this._created) return;
    this._created = true;
    this.createMapBackground();
    this.createTitle();
  }

  /**
   * コンポーネントの破棄処理
   */
  destroy(): void {
    this.clearLocationNodes();
    if (this._emptyMessageText) {
      this._emptyMessageText.destroy();
      this._emptyMessageText = null;
    }
    if (this._mapBackground) {
      this._mapBackground.destroy();
      this._mapBackground = null;
    }
    if (this._titleText) {
      this._titleText.destroy();
      this._titleText = null;
    }
    this.container.destroy(true);
  }

  // ===========================================================================
  // 公開メソッド
  // ===========================================================================

  /**
   * 場所リストを更新し、マップ上にノードを配置する
   *
   * @param locations - 表示する場所データ（isSelectableフラグ付き）
   */
  updateLocations(locations: readonly IGatheringLocation[]): void {
    this._locations = locations;
    this.clearLocationNodes();
    this.hideEmptyMessage();

    // 選択可能な場所があるかチェック
    const hasSelectable = locations.some((l) => l.isSelectable);
    if (!hasSelectable) {
      this.showEmptyMessage();
    }

    if (locations.length === 0) return;

    // マップ座標の境界を計算し、各場所ノードを配置
    const bounds = calculateMapBounds(locations);
    for (const location of locations) {
      const { x, y } = scaleToMapArea(location.mapX, location.mapY, bounds);
      this.createLocationNode(location, x, y);
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
   * マップ背景を生成する
   */
  private createMapBackground(): void {
    this._mapBackground = this.scene.add.rectangle(
      MAP_LAYOUT.BG_X + MAP_LAYOUT.BG_WIDTH / 2,
      MAP_LAYOUT.BG_Y + MAP_LAYOUT.BG_HEIGHT / 2,
      MAP_LAYOUT.BG_WIDTH,
      MAP_LAYOUT.BG_HEIGHT,
      MAP_COLORS.MAP_BG,
    );
    this._mapBackground.setStrokeStyle(2, MAP_COLORS.MAP_BORDER);
    if (this.scene.children?.remove) {
      this.scene.children.remove(this._mapBackground);
    }
    this.container.add(this._mapBackground);
  }

  /**
   * マップタイトルを生成する
   */
  private createTitle(): void {
    this._titleText = this.scene.make.text({
      x: MAP_LAYOUT.BG_X + MAP_LAYOUT.BG_WIDTH / 2,
      y: MAP_LAYOUT.TITLE_Y,
      text: '採取地マップ',
      style: {
        fontSize: `${THEME.sizes.large}px`,
        color: '#FFFFFF',
        fontStyle: 'bold',
        fontFamily: THEME.fonts.primary,
      },
      add: false,
    });
    this._titleText.setOrigin(0.5);
    this.container.add(this._titleText);
  }

  /**
   * 場所ノードを1つ生成し、マップ上の指定座標に配置する
   */
  private createLocationNode(location: IGatheringLocation, x: number, y: number): void {
    const nodeContainer = this.scene.add.container(x, y);
    if (this.scene.children?.remove) {
      this.scene.children.remove(nodeContainer);
    }

    // ノード円形背景
    const nodeColor = location.isSelectable
      ? MAP_COLORS.SELECTABLE_NODE
      : MAP_COLORS.UNSELECTABLE_NODE;
    const borderColor = location.isSelectable
      ? MAP_COLORS.SELECTABLE_BORDER
      : MAP_COLORS.UNSELECTABLE_BORDER;

    const circle = this.scene.add.circle(0, 0, MAP_LAYOUT.NODE_RADIUS, nodeColor);
    circle.setStrokeStyle(2, borderColor);
    if (this.scene.children?.remove) {
      this.scene.children.remove(circle);
    }
    nodeContainer.add(circle);

    // 場所名テキスト（ノード下）
    const nameText = this.scene.make.text({
      x: 0,
      y: MAP_LAYOUT.NAME_OFFSET_Y,
      text: location.name,
      style: {
        fontSize: `${THEME.sizes.medium}px`,
        color: '#FFFFFF',
        fontStyle: 'bold',
        fontFamily: THEME.fonts.primary,
      },
      add: false,
    });
    nameText.setOrigin(0.5);
    nodeContainer.add(nameText);

    // APコストバッジ（ノード右上）
    const apText = this.scene.make.text({
      x: MAP_LAYOUT.AP_OFFSET_X,
      y: MAP_LAYOUT.AP_OFFSET_Y,
      text: `AP:${location.movementAPCost}`,
      style: {
        fontSize: `${THEME.sizes.small}px`,
        color: '#FFD700',
        fontFamily: THEME.fonts.primary,
      },
      add: false,
    });
    apText.setOrigin(0.5);
    nodeContainer.add(apText);

    // 素材プレビューテキスト（場所名下）
    const materialsStr = this.formatMaterialPreview(location.availableMaterials);
    const materialText = this.scene.make.text({
      x: 0,
      y: MAP_LAYOUT.MATERIAL_OFFSET_Y,
      text: materialsStr,
      style: {
        fontSize: `${MAP_LAYOUT.MATERIAL_FONT_SIZE}px`,
        color: '#CCCCCC',
        fontFamily: THEME.fonts.primary,
      },
      add: false,
    });
    materialText.setOrigin(0.5);
    nodeContainer.add(materialText);

    // 選択不可の場合はアルファ値を下げる
    if (!location.isSelectable) {
      nodeContainer.setAlpha(UNSELECTABLE_ALPHA);
    }

    // 選択可能な場合はインタラクションを設定
    if (location.isSelectable) {
      circle.setInteractive({ useHandCursor: true });
      circle.on('pointerover', () => {
        circle.setStrokeStyle(3, MAP_COLORS.HOVER_BORDER);
      });
      circle.on('pointerout', () => {
        circle.setStrokeStyle(2, MAP_COLORS.SELECTABLE_BORDER);
      });
      circle.on('pointerdown', () => {
        this.handleLocationSelect(location);
      });
    }

    this.container.add(nodeContainer);
    this._locationNodeContainers.push(nodeContainer);
  }

  /**
   * 素材プレビューをフォーマットする（マップ用コンパクト表示）
   */
  private formatMaterialPreview(materials: readonly IMaterialPreview[]): string {
    return materials.map((m) => `${DROP_RATE_LABELS[m.dropRate] ?? '?'}${m.name}`).join(' ');
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
   * 場所ノードをすべてクリアする
   *
   * 各ノードのcircle要素に登録されたイベントリスナーを明示的に解除してから破棄する。
   */
  private clearLocationNodes(): void {
    for (const node of this._locationNodeContainers) {
      // コンテナ内のcircle要素のイベントリスナーを明示的に解除
      const children = node.list;
      if (children) {
        for (const child of children) {
          if ('off' in child && typeof child.off === 'function') {
            child.off('pointerover');
            child.off('pointerout');
            child.off('pointerdown');
          }
        }
      }
      node.destroy(true);
    }
    this._locationNodeContainers = [];
  }

  /**
   * 空手札メッセージを表示する
   */
  private showEmptyMessage(): void {
    this._showingEmptyMessage = true;

    if (!this._emptyMessageText) {
      this._emptyMessageText = this.scene.make.text({
        x: MAP_LAYOUT.BG_X + MAP_LAYOUT.BG_WIDTH / 2,
        y: MAP_LAYOUT.BG_Y + MAP_LAYOUT.BG_HEIGHT / 2,
        text: EMPTY_HAND_MESSAGE,
        style: {
          fontSize: `${THEME.sizes.medium}px`,
          color: '#888888',
          fontFamily: THEME.fonts.primary,
        },
        add: false,
      });
      this._emptyMessageText.setOrigin(0.5);
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
