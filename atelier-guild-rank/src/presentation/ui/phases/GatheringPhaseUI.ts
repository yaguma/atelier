/**
 * GatheringPhaseUI.ts - 採取フェーズUIコンポーネント
 * TASK-0044: 品質に応じた視覚効果
 *
 * @description
 * ドラフト採取フェーズのUI実装。
 * 素材プールから選択、獲得素材の表示を行う。
 *
 * @信頼性レベル
 * 🔵 TASK-0023の設計に基づく実装
 */

import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type {
  DraftSession,
  IGatheringService,
} from '@domain/interfaces/gathering-service.interface';
import type { MaterialId, Quality } from '@shared/types';
import type Phaser from 'phaser';
import { BaseComponent } from '../components/BaseComponent';
import { Button } from '../components/Button';
import { type MaterialDisplay, MaterialSlotUI } from '../components/MaterialSlotUI';
import { THEME } from '../theme';

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
    super(scene, 0, 0);
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
  }

  /**
   * タイトルを作成
   */
  private createTitle(): void {
    this.titleText = this.scene.add
      .text(0, 0, '🌿 採取フェーズ', {
        fontSize: `${THEME.sizes.xlarge}px`,
        color: `#${THEME.colors.text.toString(16).padStart(6, '0')}`,
        fontFamily: THEME.fonts.primary,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.container.add(this.titleText);
  }

  /**
   * 残り選択回数カウンターを作成
   */
  private createRemainingCounter(): void {
    this.remainingText = this.scene.add
      .text(0, 40, '残り選択回数: 0/0', {
        fontSize: `${THEME.sizes.medium}px`,
        color: `#${THEME.colors.text.toString(16).padStart(6, '0')}`,
        fontFamily: THEME.fonts.primary,
      })
      .setOrigin(0.5);

    this.container.add(this.remainingText);
  }

  /**
   * 素材プールを作成(2行3列のグリッド)
   */
  private createMaterialPool(): void {
    const startX = -200;
    const startY = 100;
    const spacingX = 120;
    const spacingY = 120;

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
    const titleY = 350;
    const displayY = 390;

    const gatheredTitle = this.scene.add
      .text(0, titleY, '獲得素材:', {
        fontSize: `${THEME.sizes.medium}px`,
        color: `#${THEME.colors.text.toString(16).padStart(6, '0')}`,
        fontFamily: THEME.fonts.primary,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.gatheredDisplay = this.scene.add.container(0, displayY);

    this.container.add(gatheredTitle);
    this.container.add(this.gatheredDisplay);
  }

  /**
   * 採取終了ボタンを作成
   */
  private createEndButton(): void {
    this.endButton = new Button(this.scene, 250, 450, {
      text: '採取終了',
      onClick: () => {
        this.endGathering();
      },
      width: 120,
      height: 40,
    });
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
      const x = (index % 6) * 100 - 250;
      const y = Math.floor(index / 6) * 30;

      const materialText = this.scene.add
        .text(x, y, `[${this.getMaterialName(material.master.id)} ${material.quality}]`, {
          fontSize: `${THEME.sizes.small}px`,
          color: `#${THEME.colors.text.toString(16).padStart(6, '0')}`,
          fontFamily: THEME.fonts.primary,
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

  /**
   * コンポーネントを破棄
   */
  destroy(): void {
    for (const slot of this.materialSlots) {
      slot.destroy();
    }
    this.materialSlots = [];
    this.gatheredMaterialTexts = [];
    this.container.destroy();
  }
}
