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
    this.eventBus.emit('gathering:material:selected' as any, { material });
  }

  private handleMaterialDeselect(material: Material): void {
    this.updateCostDisplay();
    this.updateConfirmButtonState();
    this.eventBus.emit('gathering:material:deselected' as any, { material });
  }

  // =====================================================
  // APコスト管理
  // =====================================================

  private updateCostDisplay(): void {
    const totalCost = this.getTotalAPCost();
    this.costView?.setRequiredAP(totalCost);
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

  confirmGathering(): void {
    if (!this.canConfirmGathering()) return;
    if (!this.gatheringCard) return;

    const result: GatheringResult = {
      selectedMaterials: this.getSelectedMaterials(),
      totalAPCost: this.getTotalAPCost(),
      gatheringCard: this.gatheringCard,
    };

    this.eventBus.emit('gathering:confirm' as any, result);

    if (this.onGatheringComplete) {
      this.onGatheringComplete(result);
    }
  }

  resetSelection(): void {
    this.materialOptionView?.clearSelection();
    this.updateCostDisplay();
    this.updateConfirmButtonState();
    this.eventBus.emit('gathering:reset' as any, {});
  }

  private handleSkip(): void {
    this.eventBus.emit('gathering:skip' as any, {});
    if (this.onSkip) {
      this.onSkip();
    }
  }

  // =====================================================
  // 破棄
  // =====================================================

  destroy(): void {
    this.materialOptionView?.destroy();
    this.costView?.destroy();
    super.destroy();
  }
}
