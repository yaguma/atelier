/**
 * GatheringPhaseUI.ts - 採取フェーズUIコンポーネント
 * TASK-0044: 品質に応じた視覚効果
 * TASK-0114: GatheringStage状態遷移、LocationSelectUI統合、セッション中断確認
 *
 * @description
 * 採取フェーズのUI実装。
 * 場所選択ステージ（LocationSelectUI）→ドラフト採取セッション→採取結果の
 * GatheringStage状態遷移を管理する。
 *
 * @信頼性レベル
 * 🔵 TASK-0023・REQ-002・dataflow.md セクション4に基づく
 *
 * TODO(TASK-0074): このファイルは507行で300行上限を超過している。
 * キーボード操作関連のメソッドを別ファイル（gathering-keyboard-handler.ts等）に分離を検討する。
 */

import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type {
  DraftSession,
  IGatheringService,
} from '@domain/interfaces/gathering-service.interface';
import { Button } from '@presentation/ui/components/Button';
import { THEME } from '@presentation/ui/theme';
import { BaseComponent } from '@shared/components';
import { getSelectionIndexFromKey, isKeyForAction } from '@shared/constants/keybindings';
import type { MaterialId, Quality } from '@shared/types';
import type Phaser from 'phaser';
import type { ILocationSelectResult } from '../types/gathering-location';
import { GatheringStage } from '../types/gathering-location';
import { LocationSelectUI } from './LocationSelectUI';
import { type MaterialDisplay, MaterialSlotUI } from './MaterialSlotUI';

/** 採取フェーズUIレイアウト定数 */
const GATHERING_LAYOUT = {
  /** コンテンツ領域の視覚的中央X（画面全体の中央1280/2=640からサイドバー200を引く） */
  CONTENT_CENTER_X: 440,
  /** 素材プール開始X（3列を中央揃え: 440 - 120 = 320） */
  POOL_START_X: 320,
  /** 素材プール開始Y */
  POOL_START_Y: 130,
  /** 素材プール列間隔 */
  POOL_SPACING_X: 120,
  /** 素材プール行間隔 */
  POOL_SPACING_Y: 120,
  /** 獲得素材タイトルY */
  GATHERED_TITLE_Y: 370,
  /** 獲得素材表示Y */
  GATHERED_DISPLAY_Y: 410,
  /** 獲得素材アイテム開始X（6列を中央揃え: 440 - 250 = 190） */
  GATHERED_ITEM_START_X: 190,
  /** 採取終了ボタンX */
  END_BUTTON_X: 440,
  /** 採取終了ボタンY */
  END_BUTTON_Y: 470,
} as const;

/**
 * GatheringPhaseUI - 採取フェーズUIコンポーネント
 *
 * 【責務】:
 * - 素材プールの表示(6スロット、2行3列)
 * - 残り選択回数の表示
 * - 獲得素材の表示
 * - 採取終了ボタン
 */
export class GatheringPhaseUI extends BaseComponent {
  private materialSlots: MaterialSlotUI[] = [];
  private gatheredDisplay!: Phaser.GameObjects.Container;
  private gatheredMaterialTexts: Phaser.GameObjects.Text[] = [];
  private remainingText!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;
  private endButton!: Button;

  private session: DraftSession | null = null;
  private onEndCallback?: () => void;

  /** キーボードイベントハンドラ参照（Issue #135） */
  private keyboardHandler: ((event: { key: string }) => void) | null = null;

  /** 現在のフォーカスインデックス（キーボードナビゲーション用） */
  private focusedSlotIndex = 0;

  // ===========================================================================
  // TASK-0114: GatheringStage状態遷移
  // ===========================================================================

  /** 現在のGatheringStage */
  private _currentStage: GatheringStage = GatheringStage.LOCATION_SELECT;

  /** LocationSelectUIコンポーネント */
  private _locationSelectUI: LocationSelectUI | null = null;

  /** フェーズ離脱確認のコールバック */
  private _pendingLeaveConfirm: (() => void) | null = null;
  private _pendingLeaveCancel: (() => void) | null = null;

  /**
   * コンストラクタ
   * Issue #116: コンテンツコンテナが既にオフセット済みなので(0, 0)を使用
   *
   * @param scene - Phaserシーン
   * @param gatheringService - 採取サービス
   * @param onEnd - 採取終了時のコールバック
   */
  constructor(
    scene: Phaser.Scene,
    private gatheringService: IGatheringService,
    onEnd?: () => void,
  ) {
    // Issue #137: 親コンテナに追加されるため、シーンには直接追加しない
    super(scene, 0, 0, { addToScene: false });
    this.onEndCallback = onEnd;
  }

  /**
   * UIコンポーネントを作成
   */
  create(): void {
    this.createTitle();
    this.createRemainingCounter();
    this.createMaterialPool();
    this.createGatheredDisplay();
    this.createEndButton();
    this.setupKeyboardListener();
  }

  /**
   * タイトルを作成
   */
  private createTitle(): void {
    this.titleText = this.scene.make
      .text({
        x: GATHERING_LAYOUT.CONTENT_CENTER_X,
        y: 20,
        text: '🌿 採取フェーズ',
        style: {
          fontSize: `${THEME.sizes.xlarge}px`,
          color: `#${THEME.colors.text.toString(16).padStart(6, '0')}`,
          fontFamily: THEME.fonts.primary,
          fontStyle: 'bold',
        },
        add: false,
      })
      .setOrigin(0.5);

    this.container.add(this.titleText);
  }

  /**
   * 残り選択回数カウンターを作成
   */
  private createRemainingCounter(): void {
    this.remainingText = this.scene.make
      .text({
        x: GATHERING_LAYOUT.CONTENT_CENTER_X,
        y: 60,
        text: '残り選択回数: 0/0',
        style: {
          fontSize: `${THEME.sizes.medium}px`,
          color: `#${THEME.colors.text.toString(16).padStart(6, '0')}`,
          fontFamily: THEME.fonts.primary,
        },
        add: false,
      })
      .setOrigin(0.5);

    this.container.add(this.remainingText);
  }

  /**
   * 素材プールを作成(2行3列のグリッド)
   */
  private createMaterialPool(): void {
    const startX = GATHERING_LAYOUT.POOL_START_X;
    const startY = GATHERING_LAYOUT.POOL_START_Y;
    const spacingX = GATHERING_LAYOUT.POOL_SPACING_X;
    const spacingY = GATHERING_LAYOUT.POOL_SPACING_Y;

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;

        const slot = new MaterialSlotUI(this.scene, x, y, (material) => {
          this.onMaterialSelect(material);
        });
        slot.create();

        this.materialSlots.push(slot);
        this.container.add(slot.getContainer());
      }
    }
  }

  /**
   * 獲得素材表示エリアを作成
   */
  private createGatheredDisplay(): void {
    const gatheredTitle = this.scene.make
      .text({
        x: GATHERING_LAYOUT.CONTENT_CENTER_X,
        y: GATHERING_LAYOUT.GATHERED_TITLE_Y,
        text: '獲得素材:',
        style: {
          fontSize: `${THEME.sizes.medium}px`,
          color: `#${THEME.colors.text.toString(16).padStart(6, '0')}`,
          fontFamily: THEME.fonts.primary,
          fontStyle: 'bold',
        },
        add: false,
      })
      .setOrigin(0.5);

    this.gatheredDisplay = this.scene.make.container({
      x: 0,
      y: GATHERING_LAYOUT.GATHERED_DISPLAY_Y,
      add: false,
    });
    this.gatheredDisplay.name = 'GatheringPhaseUI.gatheredDisplay';

    this.container.add(gatheredTitle);
    this.container.add(this.gatheredDisplay);
  }

  /**
   * 採取終了ボタンを作成
   */
  private createEndButton(): void {
    this.endButton = new Button(
      this.scene,
      GATHERING_LAYOUT.END_BUTTON_X,
      GATHERING_LAYOUT.END_BUTTON_Y,
      {
        text: '採取終了',
        onClick: () => {
          this.endGathering();
        },
        width: 120,
        height: 40,
      },
    );
    this.endButton.create();

    this.container.add(this.endButton.getContainer());
  }

  /**
   * セッションを更新
   *
   * @param session - 採取セッション
   */
  updateSession(session: DraftSession): void {
    this.session = session;

    // 残り選択回数を更新
    const remaining = session.maxRounds - session.currentRound + 1;
    this.remainingText.setText(`残り選択回数: ${remaining}/${session.maxRounds}`);

    // 素材プールを更新
    this.updateMaterialPool(session.currentOptions);

    // 獲得素材を更新
    this.updateGatheredMaterials(session.selectedMaterials);

    // 終了判定
    if (session.isComplete) {
      this.disableMaterialSelection();
    }
  }

  /**
   * 素材プールを更新
   *
   * @param options - 素材オプションのリスト
   */
  private updateMaterialPool(
    options: Array<{ materialId: MaterialId; quality: Quality; quantity: number }>,
  ): void {
    // 各スロットに素材を設定
    options.forEach((option, index) => {
      if (index < this.materialSlots.length) {
        // MaterialDisplay型に変換
        const material: MaterialDisplay = {
          id: option.materialId,
          name: this.getMaterialName(option.materialId),
          type: this.getMaterialType(option.materialId),
          quality: option.quality,
        };

        this.materialSlots[index].setMaterial(material);
        this.materialSlots[index].setInteractive(true);
      }
    });

    // 余ったスロットは空にする
    for (let i = options.length; i < this.materialSlots.length; i++) {
      this.materialSlots[i].setEmpty();
      this.materialSlots[i].setInteractive(false);
    }
  }

  /**
   * 獲得素材を更新
   *
   * @param materials - 獲得した素材のリスト
   */
  private updateGatheredMaterials(materials: MaterialInstance[]): void {
    // 既存の表示をクリア
    for (const text of this.gatheredMaterialTexts) {
      text.destroy();
    }
    this.gatheredMaterialTexts = [];
    this.gatheredDisplay.removeAll();

    // 素材を表示
    materials.forEach((material, index) => {
      const x = (index % 6) * 100 + GATHERING_LAYOUT.GATHERED_ITEM_START_X;
      const y = Math.floor(index / 6) * 30;

      const materialText = this.scene.make
        .text({
          x,
          y,
          text: `[${this.getMaterialName(material.master.id)} ${material.quality}]`,
          style: {
            fontSize: `${THEME.sizes.small}px`,
            color: `#${THEME.colors.text.toString(16).padStart(6, '0')}`,
            fontFamily: THEME.fonts.primary,
          },
          add: false,
        })
        .setOrigin(0, 0.5);

      this.gatheredMaterialTexts.push(materialText);
      this.gatheredDisplay.add(materialText);

      // フェードインアニメーション
      materialText.setAlpha(0);
      this.scene.tweens.add({
        targets: materialText,
        alpha: 1,
        duration: 300,
        ease: 'Power2',
      });
    });
  }

  /**
   * 素材選択時の処理
   *
   * @param material - 選択された素材
   */
  private onMaterialSelect(material: MaterialDisplay): void {
    if (!this.session) return;

    try {
      // 選択インデックスを取得(currentOptionsから)
      const optionIndex = this.session.currentOptions.findIndex(
        (opt) => opt.materialId === material.id,
      );

      if (optionIndex === -1) return;

      // GatheringServiceで選択を実行
      this.gatheringService.selectMaterial(this.session.sessionId, optionIndex);

      // 更新されたセッションを取得
      const updatedSession = this.gatheringService.getCurrentSession();
      if (!updatedSession) return;

      // UI更新
      this.updateSession(updatedSession);

      // 選択上限チェック
      if (updatedSession.isComplete) {
        this.endGathering();
      }
    } catch (error) {
      console.error('Failed to select material:', error);
    }
  }

  /**
   * 素材選択を無効化
   */
  private disableMaterialSelection(): void {
    this.materialSlots.forEach((slot) => {
      slot.setInteractive(false);
    });
  }

  /**
   * 採取終了処理
   */
  private endGathering(): void {
    this.disableMaterialSelection();

    if (this.onEndCallback) {
      this.onEndCallback();
    }
  }

  /**
   * 素材IDから素材名を取得
   *
   * @param materialId - 素材ID
   * @returns 素材名
   */
  private getMaterialName(materialId: MaterialId): string {
    const nameMap: Record<string, string> = {
      herb: '薬草',
      ore: '鉄鉱',
      mushroom: 'キノコ',
      gem: '宝石',
      bone: '骨',
      flower: '花',
      water: '水',
      fire: '火',
      ice: '氷',
      wood: '木材',
    };

    return nameMap[materialId] || materialId;
  }

  /**
   * 素材IDから素材タイプを取得
   *
   * @param materialId - 素材ID
   * @returns 素材タイプ
   */
  private getMaterialType(materialId: MaterialId): string {
    // 素材IDがそのままタイプとして使用される
    return materialId;
  }

  // =============================================================================
  // TASK-0114: GatheringStage管理 公開メソッド
  // =============================================================================

  /**
   * 採取フェーズを表示し、LOCATION_SELECTステージで開始する
   *
   * 【機能概要】: 採取フェーズ進入時の初期表示
   * 【実装方針】: GatheringStageをLOCATION_SELECTに設定し、LocationSelectUIを表示
   * 🔵 dataflow.md セクション4.2に基づく
   */
  show(): void {
    this._currentStage = GatheringStage.LOCATION_SELECT;
    this.showLocationSelectStage();
  }

  /**
   * 現在のGatheringStageを取得する
   */
  getCurrentStage(): GatheringStage {
    return this._currentStage;
  }

  /**
   * アクティブなドラフトセッションがあるかを判定する
   */
  hasActiveSession(): boolean {
    return this.session !== null && !this.session.isComplete;
  }

  /**
   * 場所選択結果を処理し、DRAFT_SESSIONに遷移する
   *
   * 【機能概要】: LocationSelectUIからの場所選択をハンドリング
   * 【実装方針】: GatheringServiceでセッションを開始し、ステージを遷移
   * 🔵 dataflow.md セクション4.2に基づく
   *
   * @param result - 場所選択結果
   */
  handleLocationSelected(result: ILocationSelectResult): void {
    // ドラフト採取セッションを開始
    // cardIdからCardオブジェクトを取得する処理は上位層が担当
    // ここではサービスに直接委譲
    // TODO(TASK-0114): startDraftGatheringの引数型をcardId直接受け取りに拡張する
    const draftSession = this.gatheringService.startDraftGathering({ id: result.cardId } as never);

    if (!draftSession) {
      console.warn(
        'GatheringPhaseUI: startDraftGathering returned null for cardId:',
        result.cardId,
      );
      return;
    }

    this.session = draftSession;
    this._currentStage = GatheringStage.DRAFT_SESSION;
    this.showDraftSessionStage();
    this.updateSession(draftSession);
  }

  /**
   * フェーズ離脱を要求する
   *
   * 【機能概要】: フェーズ切り替え時のセッション中断確認
   * 【実装方針】: アクティブセッション中は確認が必要、それ以外は即座にコールバック
   * 🟡 EDGE-001・REQ-001-03・design-interview.md D3から妥当な推測
   *
   * @param onConfirm - 離脱確定時のコールバック
   * @param onCancel - 離脱キャンセル時のコールバック
   * @returns 確認が必要な場合はtrue
   */
  requestLeavePhase(onConfirm: () => void, onCancel: () => void): boolean {
    if (!this.hasActiveSession()) {
      onConfirm();
      return false;
    }

    // アクティブセッション中は確認が必要
    // ダイアログ表示はrexUI依存のため、コールバックを保持して上位層に委譲
    this._pendingLeaveConfirm = onConfirm;
    this._pendingLeaveCancel = onCancel;
    return true;
  }

  /**
   * セッション中断確認に「中断する」で応答する
   */
  confirmLeavePhase(): void {
    if (this._pendingLeaveConfirm) {
      this.discardSession();
      const callback = this._pendingLeaveConfirm;
      this._pendingLeaveConfirm = null;
      this._pendingLeaveCancel = null;
      callback();
    }
  }

  /**
   * セッション中断確認に「キャンセル」で応答する
   */
  cancelLeavePhase(): void {
    if (this._pendingLeaveCancel) {
      const callback = this._pendingLeaveCancel;
      this._pendingLeaveConfirm = null;
      this._pendingLeaveCancel = null;
      callback();
    }
  }

  /**
   * 現在のドラフトセッションを破棄し、LOCATION_SELECTに戻る
   *
   * 【機能概要】: セッション破棄時のステージリセット
   * 🔵 完了条件「セッション破棄時にLOCATION_SELECTに戻る」に基づく
   */
  discardSession(): void {
    if (this.session) {
      this.gatheringService.endGathering(this.session.sessionId);
    }
    this.session = null;
    this._currentStage = GatheringStage.LOCATION_SELECT;
    this.showLocationSelectStage();
  }

  // =============================================================================
  // TASK-0114: ステージ表示切り替え プライベートメソッド
  // =============================================================================

  /**
   * LOCATION_SELECTステージの表示
   */
  private showLocationSelectStage(): void {
    // ドラフトセッションUIを非表示
    this.hideDraftSessionUI();

    // LocationSelectUIを表示（未作成の場合は作成）
    if (!this._locationSelectUI) {
      this._locationSelectUI = new LocationSelectUI(this.scene, 0, 0, { addToScene: false });
      this._locationSelectUI.create();
      this._locationSelectUI.onLocationSelect((result) => {
        this.handleLocationSelected(result);
      });
      this.container.add(this._locationSelectUI.getContainer());
    }
    this._locationSelectUI.setVisible(true);
  }

  /**
   * DRAFT_SESSIONステージの表示
   */
  private showDraftSessionStage(): void {
    // LocationSelectUIを非表示
    if (this._locationSelectUI) {
      this._locationSelectUI.setVisible(false);
    }

    // ドラフトセッションUIを表示
    this.showDraftSessionUI();
  }

  /**
   * ドラフトセッションUI要素を表示する
   */
  private showDraftSessionUI(): void {
    // 既存のUI要素（タイトル、カウンター、素材プール、獲得表示、ボタン）を表示
    if (this.titleText) this.titleText.setVisible(true);
    if (this.remainingText) this.remainingText.setVisible(true);
    for (const slot of this.materialSlots) {
      slot.setVisible(true);
    }
    if (this.endButton) this.endButton.setVisible(true);
  }

  /**
   * ドラフトセッションUI要素を非表示にする
   */
  private hideDraftSessionUI(): void {
    if (this.titleText) this.titleText.setVisible(false);
    if (this.remainingText) this.remainingText.setVisible(false);
    for (const slot of this.materialSlots) {
      slot.setVisible(false);
    }
    if (this.endButton) this.endButton.setVisible(false);
  }

  /**
   * コンポーネントを破棄
   */
  destroy(): void {
    this.removeKeyboardListener();
    // TASK-0114: LocationSelectUIの破棄
    if (this._locationSelectUI) {
      this._locationSelectUI.destroy();
      this._locationSelectUI = null;
    }
    this._pendingLeaveConfirm = null;
    this._pendingLeaveCancel = null;
    for (const slot of this.materialSlots) {
      slot.destroy();
    }
    this.materialSlots = [];
    this.gatheredMaterialTexts = [];
    this.container.destroy();
  }

  // =============================================================================
  // Issue #135: キーボード操作
  // =============================================================================

  /**
   * キーボードリスナーを設定
   */
  private setupKeyboardListener(): void {
    this.keyboardHandler = (event: { key: string }) => this.handleKeyboardInput(event);
    this.scene?.input?.keyboard?.on('keydown', this.keyboardHandler);
  }

  /**
   * キーボードリスナーを解除
   */
  private removeKeyboardListener(): void {
    if (this.keyboardHandler) {
      this.scene?.input?.keyboard?.off('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  /**
   * キーボード入力を処理
   *
   * @param event - キーボードイベント
   */
  private handleKeyboardInput(event: { key: string }): void {
    // 数字キーで素材スロットを直接選択（1-6）
    const selectionIndex = getSelectionIndexFromKey(event.key);
    if (selectionIndex !== null && selectionIndex <= this.materialSlots.length) {
      const slot = this.materialSlots[selectionIndex - 1];
      if (slot) {
        // フォーカスを更新
        this.focusedSlotIndex = selectionIndex - 1;
        this.updateSlotFocus();
        // 選択を実行
        this.selectSlotByIndex(selectionIndex - 1);
      }
      return;
    }

    // 矢印キーでナビゲーション（2行3列グリッド）
    if (isKeyForAction(event.key, 'LEFT')) {
      this.moveFocus(-1, 0);
    } else if (isKeyForAction(event.key, 'RIGHT')) {
      this.moveFocus(1, 0);
    } else if (isKeyForAction(event.key, 'UP')) {
      this.moveFocus(0, -1);
    } else if (isKeyForAction(event.key, 'DOWN')) {
      this.moveFocus(0, 1);
    }
    // Enter/Spaceで選択中のスロットを選択
    else if (isKeyForAction(event.key, 'CONFIRM')) {
      this.selectSlotByIndex(this.focusedSlotIndex);
    }
    // Nキーで採取終了
    else if (isKeyForAction(event.key, 'NEXT_PHASE')) {
      this.endGathering();
    }
  }

  /**
   * フォーカスを移動（2行3列グリッド）
   *
   * @param deltaCol - 列方向の移動量
   * @param deltaRow - 行方向の移動量
   */
  private moveFocus(deltaCol: number, deltaRow: number): void {
    const COLS = 3;
    const ROWS = 2;

    const currentCol = this.focusedSlotIndex % COLS;
    const currentRow = Math.floor(this.focusedSlotIndex / COLS);

    let newCol = currentCol + deltaCol;
    let newRow = currentRow + deltaRow;

    // 範囲内に収める
    if (newCol < 0) newCol = 0;
    if (newCol >= COLS) newCol = COLS - 1;
    if (newRow < 0) newRow = 0;
    if (newRow >= ROWS) newRow = ROWS - 1;

    const newIndex = newRow * COLS + newCol;
    if (newIndex !== this.focusedSlotIndex && newIndex < this.materialSlots.length) {
      this.focusedSlotIndex = newIndex;
      this.updateSlotFocus();
    }
  }

  /**
   * スロットフォーカスを視覚的に更新
   */
  private updateSlotFocus(): void {
    const FOCUSED_SCALE = 1.1;
    const DEFAULT_SCALE = 1.0;

    this.materialSlots.forEach((slot, index) => {
      const container = slot.getContainer();
      if (!container) return;

      // setScaleメソッドが存在する場合のみスケール変更
      if (typeof container.setScale === 'function') {
        if (index === this.focusedSlotIndex) {
          container.setScale(FOCUSED_SCALE);
        } else {
          container.setScale(DEFAULT_SCALE);
        }
      }
    });
  }

  /**
   * インデックスでスロットを選択
   *
   * @param index - スロットインデックス
   */
  private selectSlotByIndex(index: number): void {
    if (!this.session) return;

    const options = this.session.currentOptions;
    if (index >= 0 && index < options.length) {
      const option = options[index];
      const material: MaterialDisplay = {
        id: option.materialId,
        name: this.getMaterialName(option.materialId),
        type: this.getMaterialType(option.materialId),
        quality: option.quality,
      };
      this.onMaterialSelect(material);
    }
  }
}
