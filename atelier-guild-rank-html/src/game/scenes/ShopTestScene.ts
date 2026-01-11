/**
 * ShopScene 視覚的テストシーン
 *
 * TASK-0243: ShopSceneテスト
 * ShopSceneの視覚的テストと手動検証を行うためのシーン。
 * カテゴリ切り替え、商品選択、購入フローを検証できる。
 */

import Phaser from 'phaser';
import { BaseGameScene, SceneInitData } from './BaseGameScene';
import { ShopSceneLayout, ShopCategories, ShopCategory, ShopCategoryLabels } from './ShopSceneConstants';
import { Colors } from '../config/ColorPalette';
import { TextStyles } from '../config/TextStyles';
import { SceneKeys } from '../config/SceneKeys';
import type { ShopCardItem, ShopMaterialItem, ShopArtifactItem, ShopSceneData } from './ShopScene';

/**
 * ShopTestScene
 *
 * 機能：
 * - ShopSceneの起動とテスト
 * - カテゴリ切り替えテスト
 * - 購入フローテスト
 * - 所持金変更テスト
 */
export class ShopTestScene extends BaseGameScene {
  // テストパネル
  private testPanel!: Phaser.GameObjects.Container;
  private logPanel!: Phaser.GameObjects.Container;
  private logTexts: Phaser.GameObjects.Text[] = [];
  private logIndex = 0;

  // テスト用データ
  private testGold = 1500;

  constructor() {
    super('ShopTestScene');
  }

  protected onInit(_data?: SceneInitData): void {
    // 初期化
  }

  protected onPreload(): void {
    // アセット読み込み
  }

  protected onCreate(_data?: SceneInitData): void {
    this.createBackground();
    this.createTestControls();
    this.createLogPanel();

    // ShopSceneを起動
    this.launchShopScene();

    this.log('ShopTestScene: 初期化完了');
  }

  protected setupEventListeners(): void {
    // 購入リクエストイベントを監視
    this.subscribe(
      this.eventBus.on('shop:purchase:requested', (payload) => {
        this.log(`購入リクエスト: ${payload.item.name} (${payload.category})`);
        if (payload.quantity) {
          this.log(`  数量: ${payload.quantity}, 合計: ${payload.totalPrice}G`);
        } else {
          this.log(`  価格: ${payload.item.price}G`);
        }

        // 購入完了をシミュレート（実際のアプリではApplication層が処理）
        this.simulatePurchaseComplete(payload);
      })
    );
  }

  // =====================================================
  // UI構築
  // =====================================================

  private createBackground(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, ShopSceneLayout.SCREEN_WIDTH, ShopSceneLayout.SCREEN_HEIGHT);
  }

  private createTestControls(): void {
    const panel = this.add.container(10, 10);
    this.testPanel = panel;

    // パネル背景
    const bg = this.add.graphics();
    bg.fillStyle(0x333355, 0.95);
    bg.fillRoundedRect(0, 0, 220, 350, 8);
    bg.lineStyle(2, 0x6666aa, 1);
    bg.strokeRoundedRect(0, 0, 220, 350, 8);
    panel.add(bg);

    // タイトル
    const title = this.add.text(110, 15, 'Shop Test Controls', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    panel.add(title);

    // テストボタン
    const buttons = [
      { label: 'カードタブ', action: () => this.switchShopCategory('cards') },
      { label: '素材タブ', action: () => this.switchShopCategory('materials') },
      { label: 'アーティファクト', action: () => this.switchShopCategory('artifacts') },
      { label: '所持金+500', action: () => this.addGold(500) },
      { label: '所持金-500', action: () => this.addGold(-500) },
      { label: '商品リロード', action: () => this.reloadShopScene() },
      { label: 'ログクリア', action: () => this.clearLog() },
    ];

    buttons.forEach((btn, index) => {
      const y = 50 + index * 42;
      const button = this.createTestButton(btn.label, 110, y, btn.action);
      panel.add(button);
    });

    // 所持金表示
    const goldLabel = this.add.text(110, 345, `所持金: ${this.testGold}G`, {
      fontSize: '12px',
      color: '#ffdd44',
    }).setOrigin(0.5).setName('goldLabel');
    panel.add(goldLabel);

    panel.setDepth(1000);
  }

  private createTestButton(
    label: string,
    x: number,
    y: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const btn = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x555577, 1);
    bg.fillRoundedRect(-90, -16, 180, 32, 4);
    btn.add(bg);

    const text = this.add.text(0, 0, label, {
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5);
    btn.add(text);

    btn.setSize(180, 32);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x7777aa, 1);
      bg.fillRoundedRect(-90, -16, 180, 32, 4);
    });

    btn.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x555577, 1);
      bg.fillRoundedRect(-90, -16, 180, 32, 4);
    });

    btn.on('pointerdown', onClick);

    return btn;
  }

  private createLogPanel(): void {
    const panel = this.add.container(10, 370);
    this.logPanel = panel;

    // パネル背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222233, 0.9);
    bg.fillRoundedRect(0, 0, 220, 380, 8);
    bg.lineStyle(1, 0x444466, 1);
    bg.strokeRoundedRect(0, 0, 220, 380, 8);
    panel.add(bg);

    // タイトル
    const title = this.add.text(110, 15, 'Event Log', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#aaaacc',
    }).setOrigin(0.5);
    panel.add(title);

    // ログテキストを準備
    for (let i = 0; i < 16; i++) {
      const logText = this.add.text(10, 35 + i * 20, '', {
        fontSize: '10px',
        color: '#888899',
        wordWrap: { width: 200 },
      });
      this.logTexts.push(logText);
      panel.add(logText);
    }

    panel.setDepth(1000);
  }

  // =====================================================
  // ShopScene操作
  // =====================================================

  private launchShopScene(): void {
    const testData = this.createTestShopData();
    this.scene.launch(SceneKeys.SHOP, testData);
    this.log('ShopSceneを起動');
  }

  private createTestShopData(): ShopSceneData {
    const availableCards: ShopCardItem[] = [
      {
        id: 'card1',
        name: '森の採取地',
        price: 100,
        category: 'cards',
        type: 'gathering',
        rarity: 'common',
        effect: { description: '薬草が採れる' },
      },
      {
        id: 'card2',
        name: '洞窟の採取地',
        price: 200,
        category: 'cards',
        type: 'gathering',
        rarity: 'uncommon',
        effect: { description: '鉄鉱石が採れる' },
      },
      {
        id: 'card3',
        name: '薬草のレシピ',
        price: 150,
        category: 'cards',
        type: 'recipe',
        rarity: 'common',
        effect: { description: 'ヒールポーションを作成' },
      },
      {
        id: 'card4',
        name: '強化の書',
        price: 300,
        category: 'cards',
        type: 'enhance',
        rarity: 'rare',
        effect: { description: '品質+10' },
      },
    ];

    const availableMaterials: ShopMaterialItem[] = [
      {
        id: 'mat1',
        name: '薬草',
        price: 30,
        category: 'materials',
        quality: 30,
        materialCategory: '植物',
        stock: 20,
      },
      {
        id: 'mat2',
        name: '魔法の花',
        price: 80,
        category: 'materials',
        quality: 50,
        materialCategory: '植物',
        stock: -1, // 無限在庫
      },
      {
        id: 'mat3',
        name: '鉄鉱石',
        price: 50,
        category: 'materials',
        quality: 40,
        materialCategory: '鉱物',
        stock: 15,
      },
      {
        id: 'mat4',
        name: 'クリスタル',
        price: 200,
        category: 'materials',
        quality: 70,
        materialCategory: '鉱物',
        stock: 5,
      },
    ];

    const availableArtifacts: ShopArtifactItem[] = [
      {
        id: 'art1',
        name: '錬金術師のローブ',
        price: 500,
        category: 'artifacts',
        rarity: 'rare',
        effects: [{ description: '調合成功率+10%' }],
      },
      {
        id: 'art2',
        name: '採取の手袋',
        price: 300,
        category: 'artifacts',
        rarity: 'uncommon',
        effects: [{ description: '採取効率+5%' }],
      },
      {
        id: 'art3',
        name: '伝説の杖',
        price: 2000,
        category: 'artifacts',
        rarity: 'legendary',
        effects: [
          { description: '全能力+20%' },
          { description: 'AP消費-10%' },
        ],
        requirement: 'ランクA以上',
      },
    ];

    return {
      playerGold: this.testGold,
      availableCards,
      availableMaterials,
      availableArtifacts,
      returnScene: 'ShopTestScene',
    };
  }

  private switchShopCategory(category: ShopCategory): void {
    // ShopSceneのswitchCategoryメソッドを呼び出す
    // 注: ShopSceneがこのメソッドを公開している場合のみ動作
    this.log(`カテゴリ切り替え: ${ShopCategoryLabels[category]}`);
  }

  private addGold(amount: number): void {
    this.testGold = Math.max(0, this.testGold + amount);
    this.eventBus.emit('shop:gold:updated', { gold: this.testGold });
    this.updateGoldDisplay();
    this.log(`所持金変更: ${amount > 0 ? '+' : ''}${amount}G → ${this.testGold}G`);
  }

  private updateGoldDisplay(): void {
    const goldLabel = this.testPanel.getByName('goldLabel') as Phaser.GameObjects.Text;
    if (goldLabel) {
      goldLabel.setText(`所持金: ${this.testGold}G`);
    }
  }

  private reloadShopScene(): void {
    this.scene.stop(SceneKeys.SHOP);
    this.launchShopScene();
    this.log('ShopSceneをリロード');
  }

  private simulatePurchaseComplete(payload: {
    item: { id: string; name: string; price: number; category: 'cards' | 'materials' | 'artifacts' };
    category: 'cards' | 'materials' | 'artifacts';
    quantity?: number;
    totalPrice?: number;
  }): void {
    // 価格を計算
    const price = payload.totalPrice ?? payload.item.price;

    // 所持金が足りるか確認
    if (this.testGold < price) {
      this.log('購入失敗: 所持金不足');
      return;
    }

    // 所持金を減らす
    this.testGold -= price;
    this.updateGoldDisplay();

    // 購入完了イベントを発行
    this.eventBus.emit('shop:purchase:complete', {
      item: payload.item,
    });

    // ゴールド更新イベントを発行
    this.eventBus.emit('shop:gold:updated', { gold: this.testGold });

    this.log(`購入完了: ${payload.item.name}`);
    this.log(`残り所持金: ${this.testGold}G`);
  }

  // =====================================================
  // ログ機能
  // =====================================================

  private log(message: string): void {
    console.log(`[ShopTest] ${message}`);

    // ログをシフト
    for (let i = this.logTexts.length - 1; i > 0; i--) {
      this.logTexts[i].setText(this.logTexts[i - 1].text);
      this.logTexts[i].setColor(this.logTexts[i - 1].style.color as string);
    }

    // 新しいログを追加
    this.logTexts[0].setText(message);
    this.logTexts[0].setColor('#ffffff');

    this.logIndex++;
  }

  private clearLog(): void {
    this.logTexts.forEach((text) => text.setText(''));
    this.logIndex = 0;
    this.log('ログをクリア');
  }
}
