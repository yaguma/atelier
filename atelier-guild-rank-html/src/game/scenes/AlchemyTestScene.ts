/**
 * AlchemyTestScene - 調合機能テスト用シーン
 *
 * TASK-0230: AlchemyContainerテスト
 * AlchemyContainerの動作確認およびビジュアルテスト用シーン。
 */

import { BaseGameScene, SceneInitData } from './BaseGameScene';
import { AlchemyContainer } from '../ui/phase/AlchemyContainer';
import type { AlchemyResult } from '../ui/phase/IAlchemyContainer';
import { RecipeCard } from '@domain/card/CardEntity';
import { Material } from '@domain/material/MaterialEntity';
import {
  CardType,
  GuildRank,
  Quality,
  Rarity,
  ItemCategory,
  Attribute,
} from '@domain/common/types';

/**
 * AlchemyTestSceneクラス
 *
 * 調合フェーズコンテナの動作確認を行うテスト用シーン：
 * - AlchemyContainerの初期化・表示
 * - レシピ選択のテスト
 * - 素材選択のテスト
 * - 調合実行のテスト
 * - イベントログの表示
 */
export class AlchemyTestScene extends BaseGameScene {
  private alchemyContainer!: AlchemyContainer;
  private logText!: Phaser.GameObjects.Text;
  private logs: string[] = [];

  constructor() {
    super('AlchemyTestScene');
  }

  protected onInit(_data?: SceneInitData): void {
    this.logs = [];
  }

  protected onPreload(): void {
    // 特にアセット読み込みなし
  }

  protected onCreate(_data?: SceneInitData): void {
    // 背景色設定
    this.cameras.main.setBackgroundColor('#16213e');

    // タイトル
    this.add
      .text(640, 30, '調合コンテナテスト', {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);

    // AlchemyContainer作成
    this.alchemyContainer = new AlchemyContainer({
      scene: this,
      eventBus: this.eventBus,
      x: 20,
      y: 80,
      onAlchemyComplete: (result: AlchemyResult) => {
        this.addLog(`調合完了: ${result.craftedItemName} (品質: ${result.quality})`);
      },
      onSkip: () => {
        this.addLog('調合スキップ');
      },
    });

    // テストデータ設定
    this.alchemyContainer.setRecipeCards(this.createTestRecipes());
    this.alchemyContainer.setAvailableMaterials(this.createTestMaterials());
    this.alchemyContainer.enter();

    // ログ表示エリア
    this.add.text(840, 80, 'イベントログ:', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial',
    });

    const logBg = this.add.graphics();
    logBg.fillStyle(0x1a1a2e, 0.9);
    logBg.fillRoundedRect(840, 100, 400, 500, 8);

    this.logText = this.add.text(850, 110, '', {
      fontSize: '12px',
      color: '#cccccc',
      fontFamily: 'monospace',
      wordWrap: { width: 380 },
    });

    // テストコントロールボタン
    this.createTestControls();
  }

  /**
   * テスト用レシピカードを作成
   */
  private createTestRecipes(): RecipeCard[] {
    return [
      new RecipeCard({
        id: 'recipe-heal',
        name: '回復薬',
        type: CardType.RECIPE,
        rarity: Rarity.COMMON,
        unlockRank: GuildRank.G,
        description: '体力を回復する薬',
        cost: 2,
        requiredMaterials: [
          { materialId: 'mat-herb1', quantity: 1 },
          { materialId: 'mat-liquid1', quantity: 1 },
        ],
        outputItemId: 'item-heal',
        category: ItemCategory.MEDICINE,
      }),
      new RecipeCard({
        id: 'recipe-bomb',
        name: '爆弾',
        type: CardType.RECIPE,
        rarity: Rarity.UNCOMMON,
        unlockRank: GuildRank.F,
        description: '爆発する危険な薬',
        cost: 3,
        requiredMaterials: [
          { materialId: 'mat-mineral1', quantity: 1 },
          { materialId: 'mat-powder1', quantity: 1 },
        ],
        outputItemId: 'item-bomb',
        category: ItemCategory.ADVENTURE,
      }),
      new RecipeCard({
        id: 'recipe-staff',
        name: '魔法の杖',
        type: CardType.RECIPE,
        rarity: Rarity.RARE,
        unlockRank: GuildRank.E,
        description: '魔力を込めた杖',
        cost: 4,
        requiredMaterials: [
          { materialId: 'mat-monster1', quantity: 1 },
          { materialId: 'mat-mineral2', quantity: 1 },
        ],
        outputItemId: 'item-staff',
        category: ItemCategory.MAGIC,
      }),
    ];
  }

  /**
   * テスト用素材を作成
   */
  private createTestMaterials(): Material[] {
    return [
      new Material({
        id: 'mat-herb1',
        name: '薬草',
        baseQuality: Quality.C,
        attributes: [Attribute.GRASS],
        isRare: false,
        description: '基本的な薬草',
      }),
      new Material({
        id: 'mat-herb2',
        name: '赤い花',
        baseQuality: Quality.B,
        attributes: [Attribute.GRASS, Attribute.FIRE],
        isRare: false,
        description: '回復効果のある花',
      }),
      new Material({
        id: 'mat-liquid1',
        name: '清水',
        baseQuality: Quality.C,
        attributes: [Attribute.WATER],
        isRare: false,
        description: '清らかな水',
      }),
      new Material({
        id: 'mat-liquid2',
        name: '聖水',
        baseQuality: Quality.A,
        attributes: [Attribute.WATER],
        isRare: true,
        description: '神聖な水',
      }),
      new Material({
        id: 'mat-mineral1',
        name: '鉄鉱石',
        baseQuality: Quality.C,
        attributes: [Attribute.EARTH],
        isRare: false,
        description: '一般的な鉱石',
      }),
      new Material({
        id: 'mat-mineral2',
        name: '銀鉱石',
        baseQuality: Quality.B,
        attributes: [Attribute.EARTH],
        isRare: false,
        description: '銀を含む鉱石',
      }),
      new Material({
        id: 'mat-powder1',
        name: '火薬',
        baseQuality: Quality.C,
        attributes: [Attribute.FIRE],
        isRare: false,
        description: '爆発する粉',
      }),
      new Material({
        id: 'mat-monster1',
        name: '魔物の骨',
        baseQuality: Quality.B,
        attributes: [Attribute.WIND],
        isRare: true,
        description: '魔物の骨',
      }),
    ];
  }

  /**
   * テスト用コントロールボタンを作成
   */
  private createTestControls(): void {
    const startY = 620;
    const buttonSpacing = 120;

    // リセットボタン
    this.createButton(50, startY, 'リセット', () => {
      this.alchemyContainer.clearMaterials();
      this.addLog('素材選択をリセット');
    });

    // 素材追加ボタン
    this.createButton(50 + buttonSpacing, startY, '素材追加', () => {
      const newMaterial = new Material({
        id: `mat-${Date.now()}`,
        name: `新素材${Math.floor(Math.random() * 100)}`,
        baseQuality: [Quality.C, Quality.B, Quality.A][
          Math.floor(Math.random() * 3)
        ] as Quality,
        attributes: [Attribute.GRASS],
        isRare: Math.random() > 0.8,
        description: 'ランダムに生成された素材',
      });
      this.alchemyContainer.setAvailableMaterials([
        ...this.createTestMaterials(),
        newMaterial,
      ]);
      this.addLog(`素材追加: ${newMaterial.name}`);
    });

    // 次のレシピボタン
    this.createButton(50 + buttonSpacing * 2, startY, '次レシピ', () => {
      this.alchemyContainer.selectNextRecipe();
      const recipe = this.alchemyContainer.getSelectedRecipe();
      if (recipe) {
        this.addLog(`次のレシピ: ${recipe.name}`);
      }
    });

    // 前のレシピボタン
    this.createButton(50 + buttonSpacing * 3, startY, '前レシピ', () => {
      this.alchemyContainer.selectPreviousRecipe();
      const recipe = this.alchemyContainer.getSelectedRecipe();
      if (recipe) {
        this.addLog(`前のレシピ: ${recipe.name}`);
      }
    });

    // 調合ボタン
    this.createButton(50 + buttonSpacing * 4, startY, '調合実行', async () => {
      if (this.alchemyContainer.canCraft()) {
        await this.alchemyContainer.craft();
      } else {
        this.addLog('調合できません（条件未達成）');
      }
    });

    // ログクリアボタン
    this.createButton(50 + buttonSpacing * 5, startY, 'ログクリア', () => {
      this.logs = [];
      this.updateLogDisplay();
    });
  }

  /**
   * ボタンを作成するヘルパーメソッド
   */
  private createButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void
  ): Phaser.GameObjects.Text {
    const btn = this.add
      .text(x, y, label, {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 12, y: 8 },
      })
      .setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      btn.setStyle({ backgroundColor: '#555555' });
    });

    btn.on('pointerout', () => {
      btn.setStyle({ backgroundColor: '#333333' });
    });

    btn.on('pointerdown', onClick);

    return btn;
  }

  /**
   * ログを追加
   */
  private addLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.unshift(`[${timestamp}] ${message}`);
    if (this.logs.length > 20) {
      this.logs.pop();
    }
    this.updateLogDisplay();
  }

  /**
   * ログ表示を更新
   */
  private updateLogDisplay(): void {
    this.logText.setText(this.logs.join('\n'));
  }

  protected setupEventListeners(): void {
    // レシピ選択イベント
    const recipeSelected = this.eventBus.on(
      'alchemy:recipe:selected' as any,
      (data: any) => {
        this.addLog(`レシピ選択: ${data.recipe?.name ?? '不明'}`);
      }
    );
    this.subscribe(recipeSelected);

    // レシピ変更イベント
    const recipeChanged = this.eventBus.on(
      'alchemy:recipe:changed' as any,
      (data: any) => {
        this.addLog(`レシピ変更: ${data.newRecipe?.name ?? '不明'}`);
      }
    );
    this.subscribe(recipeChanged);

    // 素材選択イベント
    const materialSelected = this.eventBus.on(
      'alchemy:material:selected' as any,
      (data: any) => {
        this.addLog(`素材選択: ${data.material?.name ?? '不明'}`);
      }
    );
    this.subscribe(materialSelected);

    // 素材選択解除イベント
    const materialDeselected = this.eventBus.on(
      'alchemy:material:deselected' as any,
      (data: any) => {
        this.addLog(`素材解除: ${data.material?.name ?? '不明'}`);
      }
    );
    this.subscribe(materialDeselected);

    // 素材クリアイベント
    const materialsCleared = this.eventBus.onVoid(
      'alchemy:materials:cleared' as any,
      () => {
        this.addLog('素材クリア');
      }
    );
    this.subscribe(materialsCleared);

    // 素材選択完了イベント
    const materialsComplete = this.eventBus.on(
      'alchemy:materials:complete' as any,
      (_data: any) => {
        this.addLog('素材選択完了');
      }
    );
    this.subscribe(materialsComplete);

    // 調合イベント
    const craft = this.eventBus.on('alchemy:craft' as any, (result: any) => {
      this.addLog(`調合イベント: ${result?.craftedItemName ?? '不明'}`);
    });
    this.subscribe(craft);

    // スキップイベント
    const skip = this.eventBus.onVoid('alchemy:skip' as any, () => {
      this.addLog('スキップイベント');
    });
    this.subscribe(skip);
  }

  protected onUpdate(_time: number, _delta: number): void {
    // 特にフレーム更新処理なし
  }

  protected onShutdown(): void {
    if (this.alchemyContainer) {
      this.alchemyContainer.destroy();
    }
  }
}
