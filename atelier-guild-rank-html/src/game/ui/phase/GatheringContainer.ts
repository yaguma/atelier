/**
 * GatheringContainer 実装
 *
 * TASK-0222: GatheringContainer設計
 * TASK-0223: GatheringContainer素材提示実装
 * 採取フェーズコンテナの基本実装
 */

import Phaser from 'phaser';
import { GamePhase } from '../../../domain/common/types';
import { GatheringCard } from '../../../domain/card/CardEntity';
import { Material } from '../../../domain/material/MaterialEntity';
import { BasePhaseContainer } from './BasePhaseContainer';
import type {
  IGatheringContainer,
  GatheringContainerOptions,
  GatheringResult,
} from './IGatheringContainer';
import { GatheringContainerLayout } from './GatheringContainerConstants';
import type { MaterialOption } from '../material/IMaterialOptionView';
import { MaterialOptionView } from '../material/MaterialOptionView';
import { GatheringCostView } from '../gathering/GatheringCostView';
import { GatheringMaterialGenerator } from './GatheringMaterialGenerator';
import { GatheringMaterialPresenter } from './GatheringMaterialPresenter';
import { TextStyles } from '../../config/TextStyles';

/**
 * GatheringContainerクラス
 *
 * 採取フェーズのメインコンテナ。
 * 採取地カード、素材選択肢、APコスト表示を管理する。
 */
export class GatheringContainer extends BasePhaseContainer implements IGatheringContainer {
  public readonly phase = GamePhase.GATHERING;

  private gatheringCard: GatheringCard | null = null;
  private materialOptionView?: MaterialOptionView;
  private costView?: GatheringCostView;
  private materialGenerator: GatheringMaterialGenerator;
  private materialPresenter?: GatheringMaterialPresenter;

  private currentAP: number = 0;
  private maxAP: number = 10;

  private onGatheringComplete?: (result: GatheringResult) => void;
  private onSkip?: () => void;

  // ボタン
  private confirmButton?: Phaser.GameObjects.Container;

  // 素材マスターデータ
  private materialMasterData?: Map<string, Material>;

  // 選択管理
  private maxSelections: number = 3;
  private selectionLimitText?: Phaser.GameObjects.Text;
  private apWarningText?: Phaser.GameObjects.Text;

  // 処理中フラグ
  private isProcessing: boolean = false;

  constructor(options: GatheringContainerOptions) {
    super({
      scene: options.scene,
      eventBus: options.eventBus,
      x: options.x ?? 0,
      y: options.y ?? 0,
      width: GatheringContainerLayout.WIDTH,
      height: GatheringContainerLayout.HEIGHT,
    });

    this.onGatheringComplete = options.onGatheringComplete;
    this.onSkip = options.onSkip;

    // 素材生成・提示コンポーネント初期化
    this.materialGenerator = new GatheringMaterialGenerator();
    this.materialPresenter = new GatheringMaterialPresenter(
      this.scene,
      this.container
    );
  }

  // =====================================================
  // BasePhaseContainer抽象メソッドの実装
  // =====================================================

  protected createContent(): void {
    this.createTitle('🌿 採取フェーズ');
    this.createLayout();
    this.createActions();
  }

  protected async onEnter(): Promise<void> {
    this.resetSelection();
    this.updateConfirmButtonState();
  }

  protected async onExit(): Promise<void> {
    // 特に追加処理なし
  }

  protected onUpdate(_delta: number): void {
    // 特に追加処理なし
  }

  protected getCompletionResult(): GatheringResult | null {
    if (!this.gatheringCard) return null;

    return {
      selectedMaterials: this.getSelectedMaterials(),
      totalAPCost: this.getTotalAPCost(),
      gatheringCard: this.gatheringCard,
    };
  }

  canComplete(): boolean {
    return this.canConfirmGathering();
  }

  // =====================================================
  // レイアウト作成
  // =====================================================

  private createLayout(): void {
    const { CARD_AREA, MATERIAL_AREA, SIDE_PANEL } = GatheringContainerLayout;

    // 採取地カードエリア
    this.createAreaLabel(CARD_AREA.X, CARD_AREA.Y - 20, '採取地');

    // 素材選択エリア
    this.createAreaLabel(MATERIAL_AREA.X, MATERIAL_AREA.Y - 20, '素材を選択');

    // APコストエリア
    this.costView = new GatheringCostView({
      scene: this.scene,
      x: SIDE_PANEL.X,
      y: SIDE_PANEL.Y,
      currentAP: this.currentAP,
      maxAP: this.maxAP,
    });
    this.container.add(this.costView.container);
  }

  private createAreaLabel(x: number, y: number, text: string): void {
    const label = this.scene.add.text(x, y, text, {
      ...TextStyles.body,
      fontSize: '13px',
      color: '#aaaaaa',
    });
    this.container.add(label);
  }

  private createActions(): void {
    const { ACTION_AREA, WIDTH } = GatheringContainerLayout;
    const centerX = WIDTH / 2;

    // 確定ボタン
    this.confirmButton = this.createButton(
      centerX + 60,
      ACTION_AREA.Y,
      '✅ 採取する',
      () => this.confirmGathering(),
      true
    );
    this.container.add(this.confirmButton);

    // スキップボタン
    const skipButton = this.createButton(
      centerX - 60,
      ACTION_AREA.Y,
      'スキップ',
      () => this.handleSkip(),
      false
    );
    this.container.add(skipButton);

    // リセットボタン
    const resetButton = this.createButton(
      WIDTH - 80,
      ACTION_AREA.Y,
      '🔄 リセット',
      () => this.resetSelection(),
      false
    );
    this.container.add(resetButton);
  }

  // =====================================================
  // 採取地カード管理
  // =====================================================

  setGatheringCard(card: GatheringCard): void {
    this.gatheringCard = card;
    this.updateCostDisplay();
    this.updateConfirmButtonState();
  }

  getGatheringCard(): GatheringCard | null {
    return this.gatheringCard;
  }

  /**
   * 素材マスターデータを設定
   * @param materials 素材マスターデータ
   */
  setMaterialMasterData(materials: Map<string, Material>): void {
    this.materialMasterData = materials;
  }

  /**
   * 採取地カードから素材を生成して提示
   * @param card 採取地カード
   * @param useAnimation アニメーションを使用するか
   */
  async generateAndPresentMaterials(
    card: GatheringCard,
    useAnimation: boolean = true
  ): Promise<void> {
    this.setGatheringCard(card);

    // 素材生成
    const options = this.materialGenerator.generateMaterialOptions(
      card,
      this.materialMasterData
    );

    if (useAnimation && this.materialPresenter) {
      // ローディング表示
      this.showLoading('素材を探索中...');

      // 素材提示アニメーション
      await this.materialPresenter.presentMaterials(options, () => {
        this.hideLoading();
        this.setMaterialOptions(options);
      });
    } else {
      // アニメーションなしで即座に表示
      this.setMaterialOptions(options);
    }

    this.eventBus.emit('gathering:materials:generated' as any, { options });
  }

  /**
   * 素材生成（アニメーションなし）
   * @param card 採取地カード
   * @returns 生成された素材選択肢
   */
  generateMaterialOptions(card: GatheringCard): MaterialOption[] {
    return this.materialGenerator.generateMaterialOptions(
      card,
      this.materialMasterData
    );
  }

  /**
   * 素材がレアかどうか判定
   * @param probability 出現確率
   * @returns レア素材かどうか
   */
  isRareMaterial(probability: number): boolean {
    return this.materialGenerator.isRareMaterial(probability);
  }

  // =====================================================
  // 素材選択管理
  // =====================================================

  setMaterialOptions(options: MaterialOption[]): void {
    // 既存のビューを破棄
    if (this.materialOptionView) {
      this.materialOptionView.destroy();
    }

    const { MATERIAL_AREA } = GatheringContainerLayout;

    this.materialOptionView = new MaterialOptionView({
      scene: this.scene,
      x: MATERIAL_AREA.X,
      y: MATERIAL_AREA.Y,
      options: options,
      maxSelections: 3,
      onSelect: (material) => this.handleMaterialSelect(material),
      onDeselect: (material) => this.handleMaterialDeselect(material),
    });
    this.container.add(this.materialOptionView.container);
  }

  private handleMaterialSelect(material: Material): void {
    this.updateCostDisplay();
    this.updateConfirmButtonState();

    const selectedCount = this.getSelectedMaterials().length;

    // 選択上限チェック
    if (selectedCount >= this.maxSelections) {
      this.showSelectionLimitReached();
    }

    this.eventBus.emit('gathering:material:selected' as any, {
      material,
      totalSelected: selectedCount,
      maxSelections: this.maxSelections,
    });
  }

  private handleMaterialDeselect(material: Material): void {
    this.updateCostDisplay();
    this.updateConfirmButtonState();

    // 上限メッセージを消す
    this.hideSelectionLimitReached();

    const selectedCount = this.getSelectedMaterials().length;

    this.eventBus.emit('gathering:material:deselected' as any, {
      material,
      totalSelected: selectedCount,
      maxSelections: this.maxSelections,
    });
  }

  /**
   * 選択上限に達したことを表示
   */
  private showSelectionLimitReached(): void {
    if (this.selectionLimitText) return;

    const { MATERIAL_AREA } = GatheringContainerLayout;
    this.selectionLimitText = this.scene.add.text(
      MATERIAL_AREA.X,
      MATERIAL_AREA.Y + MATERIAL_AREA.HEIGHT + 10,
      `選択上限（${this.maxSelections}個）に達しました`,
      { ...TextStyles.body, fontSize: '12px', color: '#ffaa00' }
    );
    this.container.add(this.selectionLimitText);
  }

  /**
   * 選択上限メッセージを非表示
   */
  private hideSelectionLimitReached(): void {
    if (this.selectionLimitText) {
      this.selectionLimitText.destroy();
      this.selectionLimitText = undefined;
    }
  }

  // =====================================================
  // APコスト管理
  // =====================================================

  private updateCostDisplay(): void {
    const totalCost = this.getTotalAPCost();
    this.costView?.setRequiredAP(totalCost);

    // AP不足チェック
    if (totalCost > this.currentAP && totalCost > 0) {
      this.showAPWarning();
    } else {
      this.hideAPWarning();
    }
  }

  /**
   * AP不足警告を表示
   */
  private showAPWarning(): void {
    if (this.apWarningText) return;

    const shortage = this.getTotalAPCost() - this.currentAP;
    const { SIDE_PANEL } = GatheringContainerLayout;

    this.apWarningText = this.scene.add.text(
      SIDE_PANEL.X,
      SIDE_PANEL.Y + 140,
      `⚠️ AP ${shortage} 不足`,
      { ...TextStyles.body, fontSize: '12px', color: '#ff4444' }
    );
    this.container.add(this.apWarningText);

    // 点滅アニメーション
    this.scene.tweens.add({
      targets: this.apWarningText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * AP不足警告を非表示
   */
  private hideAPWarning(): void {
    if (this.apWarningText) {
      this.scene.tweens.killTweensOf(this.apWarningText);
      this.apWarningText.destroy();
      this.apWarningText = undefined;
    }
  }

  private updateConfirmButtonState(): void {
    const canConfirm = this.canConfirmGathering();
    if (this.confirmButton) {
      this.setButtonEnabled(this.confirmButton, canConfirm);
    }
  }

  private canConfirmGathering(): boolean {
    const selected = this.getSelectedMaterials();
    const totalCost = this.getTotalAPCost();
    return selected.length > 0 && this.currentAP >= totalCost;
  }

  setCurrentAP(current: number, max: number): void {
    this.currentAP = current;
    this.maxAP = max;
    this.costView?.setCurrentAP(current, max);
    this.updateConfirmButtonState();
  }

  getSelectedMaterials(): Material[] {
    return this.materialOptionView?.getSelectedMaterials() ?? [];
  }

  getTotalAPCost(): number {
    // 選択した素材数に応じたコスト計算
    const selectedCount = this.getSelectedMaterials().length;
    const baseCost = this.gatheringCard?.getCost() ?? 1;
    return baseCost * selectedCount;
  }

  // =====================================================
  // 操作
  // =====================================================

  /**
   * 選択上限を設定
   */
  setMaxSelections(max: number): void {
    this.maxSelections = max;
    this.materialOptionView?.setMaxSelections(max);
  }

  /**
   * 選択上限を取得
   */
  getMaxSelections(): number {
    return this.maxSelections;
  }

  /**
   * 処理中かどうか
   */
  getIsProcessing(): boolean {
    return this.isProcessing;
  }

  async confirmGathering(): Promise<void> {
    if (!this.canConfirmGathering()) {
      this.showCannotConfirmFeedback();
      return;
    }
    if (!this.gatheringCard) return;
    if (this.isProcessing) return;

    // 操作を無効化
    this.isProcessing = true;
    this.setEnabled(false);

    // 確定アニメーション
    await this.playGatheringAnimation();

    // 結果生成
    const result: GatheringResult = {
      selectedMaterials: this.getSelectedMaterials(),
      totalAPCost: this.getTotalAPCost(),
      gatheringCard: this.gatheringCard,
    };

    // EventBus発火
    this.eventBus.emit('gathering:confirm' as any, result);

    // 成功メッセージ
    await this.showGatheringSuccess(result);

    // 処理完了
    this.isProcessing = false;

    // コールバック
    if (this.onGatheringComplete) {
      this.onGatheringComplete(result);
    }
  }

  /**
   * 確定できないフィードバック（ボタン揺らし）
   */
  private showCannotConfirmFeedback(): void {
    if (this.confirmButton) {
      const originalX = this.confirmButton.x;
      this.scene.tweens.add({
        targets: this.confirmButton,
        x: originalX + 5,
        duration: 50,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          this.confirmButton!.x = originalX;
        },
      });
    }
  }

  /**
   * 採取アニメーション
   */
  private async playGatheringAnimation(): Promise<void> {
    return new Promise((resolve) => {
      const selectedMaterials = this.getSelectedMaterials();
      const centerX = GatheringContainerLayout.WIDTH / 2;
      const centerY = GatheringContainerLayout.HEIGHT / 2;

      if (selectedMaterials.length === 0) {
        resolve();
        return;
      }

      // 素材が中央に集まるアニメーション
      const particles: Phaser.GameObjects.Text[] = [];

      selectedMaterials.forEach((material, index) => {
        const startX = 260 + 50 + (index % 3) * 100;
        const startY = 100 + Math.floor(index / 3) * 80;

        const emoji = this.getMaterialEmoji(material);
        const particle = this.scene.add
          .text(startX, startY, emoji, {
            fontSize: '24px',
          })
          .setOrigin(0.5);

        this.container.add(particle);
        particles.push(particle);

        // 中央に集まる
        this.scene.tweens.add({
          targets: particle,
          x: centerX,
          y: centerY,
          scaleX: 0.5,
          scaleY: 0.5,
          duration: 500,
          delay: index * 100,
          ease: 'Power2.easeIn',
        });
      });

      // 集合後のエフェクト
      this.scene.time.delayedCall(
        500 + selectedMaterials.length * 100,
        () => {
          // 光のバースト
          const burst = this.scene.add.graphics();
          burst.fillStyle(0x00ff00, 0.5);
          burst.fillCircle(centerX, centerY, 10);
          this.container.add(burst);

          this.scene.tweens.add({
            targets: burst,
            scaleX: 5,
            scaleY: 5,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
              burst.destroy();
              particles.forEach((p) => p.destroy());
              resolve();
            },
          });
        }
      );
    });
  }

  /**
   * 採取成功メッセージ表示
   */
  private async showGatheringSuccess(result: GatheringResult): Promise<void> {
    return new Promise((resolve) => {
      const centerX = GatheringContainerLayout.WIDTH / 2;
      const centerY = GatheringContainerLayout.HEIGHT / 2;

      // 成功メッセージ
      const successText = this.scene.add
        .text(
          centerX,
          centerY,
          `✨ ${result.selectedMaterials.length}個の素材を採取！`,
          {
            ...TextStyles.heading,
            fontSize: '24px',
            color: '#00ff00',
          }
        )
        .setOrigin(0.5);
      this.container.add(successText);

      // AP消費表示
      const apText = this.scene.add
        .text(centerX, centerY + 40, `-${result.totalAPCost} AP`, {
          ...TextStyles.body,
          fontSize: '16px',
          color: '#ffaa00',
        })
        .setOrigin(0.5);
      this.container.add(apText);

      // フェードアウト
      this.scene.tweens.add({
        targets: [successText, apText],
        y: '-=30',
        alpha: 0,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => {
          successText.destroy();
          apText.destroy();
          resolve();
        },
      });
    });
  }

  /**
   * 素材から絵文字を取得
   */
  private getMaterialEmoji(material: { attributes?: string[] }): string {
    const attrs = material.attributes ?? [];

    if (attrs.includes('fire')) return '🔥';
    if (attrs.includes('water')) return '💧';
    if (attrs.includes('earth')) return '🌍';
    if (attrs.includes('wind')) return '💨';
    if (attrs.includes('light')) return '✨';
    if (attrs.includes('dark')) return '🌙';

    return '🌿';
  }

  resetSelection(): void {
    this.materialOptionView?.clearSelection();
    this.hideSelectionLimitReached();
    this.hideAPWarning();
    this.updateCostDisplay();
    this.updateConfirmButtonState();
    this.eventBus.emit('gathering:reset' as any, {});
  }

  private handleSkip(): void {
    if (this.isProcessing) return;
    this.eventBus.emit('gathering:skip' as any, {});
    if (this.onSkip) {
      this.onSkip();
    }
  }

  // =====================================================
  // 破棄
  // =====================================================

  destroy(): void {
    this.hideSelectionLimitReached();
    this.hideAPWarning();
    this.materialOptionView?.destroy();
    this.costView?.destroy();
    super.destroy();
  }
}
