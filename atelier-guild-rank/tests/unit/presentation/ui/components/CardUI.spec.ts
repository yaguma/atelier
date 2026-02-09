// @ts-nocheck
/**
 * CardUIコンポーネントのテスト
 * TASK-0021 カードUIコンポーネント
 *
 * @description
 * T-0021-01: カード表示テスト
 * T-0021-02: タイプ別色分けテスト
 * T-0021-03: インタラクティブ機能テスト
 * T-0021-04: カード情報表示テスト
 */

import { Card } from '@domain/entities/Card';
import { CardUI } from '@presentation/ui/components/CardUI';
import type { CardId } from '@shared/types';
import { CardType } from '@shared/types/common';
import type { CardMaster } from '@shared/types/master-data';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, test, vi } from 'vitest';

interface MockTweens {
  add: ReturnType<typeof vi.fn>;
}

interface MockRectangle {
  setStrokeStyle: ReturnType<typeof vi.fn>;
  setInteractive: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

interface MockText {
  setOrigin: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

interface MockContainer {
  add: ReturnType<typeof vi.fn>;
  setVisible: ReturnType<typeof vi.fn>;
  setPosition: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  x: number;
  y: number;
  visible: boolean;
}

describe('CardUI', () => {
  let scene: Phaser.Scene;
  let mockContainer: MockContainer;
  let mockRectangle: MockRectangle;
  let mockText: MockText;
  let mockTweens: MockTweens;
  let gatheringCard: Card;
  let recipeCard: Card;
  let enhancementCard: Card;

  beforeEach(() => {
    // モックのRectangleコンポーネント
    mockRectangle = {
      setStrokeStyle: vi.fn().mockReturnThis(),
      setInteractive: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    };

    // モックのTextコンポーネント
    mockText = {
      setOrigin: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    };

    // モックのContainer
    mockContainer = {
      add: vi.fn().mockReturnThis(),
      setVisible: vi.fn().mockReturnThis(),
      setPosition: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
      x: 0,
      y: 0,
      visible: true,
    };

    // モックのTweens
    mockTweens = {
      add: vi.fn(),
    };

    // Phaserシーンのモックを作成
    scene = {
      add: {
        container: vi.fn().mockReturnValue(mockContainer),
        rectangle: vi.fn().mockReturnValue(mockRectangle),
        text: vi.fn().mockReturnValue(mockText),
      },
      tweens: mockTweens,
    } as unknown as Phaser.Scene;

    // テスト用カードマスターデータ
    // @ts-expect-error - テスト用の簡易的なCardMaster定義
    const gatheringMaster: CardMaster = {
      id: 'gather_001',
      name: '採取カード',
      type: CardType.GATHERING,
      baseCost: 1,
      materialPool: ['herb', 'stone', 'wood'],
      baseQuantity: 3,
      rarity: 'COMMON',
    };

    // @ts-expect-error - テスト用の簡易的なCardMaster定義
    const recipeMaster: CardMaster = {
      id: 'recipe_001',
      name: 'レシピカード',
      type: CardType.RECIPE,
      cost: 2,
      requiredMaterials: ['herb', 'stone'],
      resultItemId: 'potion_001',
      rarity: 'COMMON',
    };

    // @ts-expect-error - テスト用の簡易的なCardMaster定義
    const enhancementMaster: CardMaster = {
      id: 'enhance_001',
      name: '強化カード',
      type: CardType.ENHANCEMENT,
      cost: 1,
      effect: 'QUALITY_UP',
      target: 'ALCHEMY',
      value: 1,
      rarity: 'COMMON',
    };

    // カードインスタンスを作成
    gatheringCard = new Card('card_001' as CardId, gatheringMaster as CardMaster);
    recipeCard = new Card('card_002' as CardId, recipeMaster as CardMaster);
    enhancementCard = new Card('card_003' as CardId, enhancementMaster as CardMaster);
  });

  describe('T-0021-01: カード表示', () => {
    test('正しいデザインでカードが表示される', () => {
      // CardUIを生成
      const cardUI = new CardUI(scene, {
        card: gatheringCard,
        x: 100,
        y: 200,
      });

      // 背景が作成されたことを確認
      expect(scene.add.rectangle).toHaveBeenCalled();
      expect(mockRectangle.setStrokeStyle).toHaveBeenCalledWith(2, 0x333333);

      // コンテナにGameObjectsが追加されたことを確認
      expect(mockContainer.add).toHaveBeenCalled();

      // テキストが作成されたことを確認
      expect(scene.add.text).toHaveBeenCalled();

      cardUI.destroy();
    });

    test('cardが指定されていない場合はエラー', () => {
      expect(() => {
        new CardUI(scene, {
          card: null as unknown as Card,
          x: 0,
          y: 0,
        });
      }).toThrow('CardUI: card is required');
    });
  });

  describe('T-0021-02: タイプ別色', () => {
    test('採取カードは緑色', () => {
      const cardUI = new CardUI(scene, {
        card: gatheringCard,
        x: 0,
        y: 0,
      });

      // 緑色（0x90ee90）で背景が作成されたことを確認
      expect(scene.add.rectangle).toHaveBeenCalledWith(0, 0, 120, 160, 0x90ee90);

      cardUI.destroy();
    });

    test('レシピカードはピンク色', () => {
      const cardUI = new CardUI(scene, {
        card: recipeCard,
        x: 0,
        y: 0,
      });

      // ピンク色（0xffb6c1）で背景が作成されたことを確認
      expect(scene.add.rectangle).toHaveBeenCalledWith(0, 0, 120, 160, 0xffb6c1);

      cardUI.destroy();
    });

    test('強化カードは青色', () => {
      const cardUI = new CardUI(scene, {
        card: enhancementCard,
        x: 0,
        y: 0,
      });

      // 青色（0xadd8e6）で背景が作成されたことを確認
      expect(scene.add.rectangle).toHaveBeenCalledWith(0, 0, 120, 160, 0xadd8e6);

      cardUI.destroy();
    });
  });

  describe('T-0021-03: インタラクティブ機能', () => {
    test('interactiveがtrueの場合、ホバーイベントが設定される', () => {
      const cardUI = new CardUI(scene, {
        card: gatheringCard,
        x: 0,
        y: 0,
        interactive: true,
      });

      // インタラクティブに設定されたことを確認
      expect(mockRectangle.setInteractive).toHaveBeenCalledWith({
        useHandCursor: true,
      });

      // イベントリスナーが登録されたことを確認
      expect(mockRectangle.on).toHaveBeenCalledWith('pointerover', expect.any(Function));
      expect(mockRectangle.on).toHaveBeenCalledWith('pointerout', expect.any(Function));
      expect(mockRectangle.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));

      cardUI.destroy();
    });

    test('interactiveがfalseの場合、ホバーイベントは設定されない', () => {
      const cardUI = new CardUI(scene, {
        card: gatheringCard,
        x: 0,
        y: 0,
        interactive: false,
      });

      // インタラクティブに設定されていないことを確認
      expect(mockRectangle.setInteractive).not.toHaveBeenCalled();

      cardUI.destroy();
    });

    test('クリック時にコールバックが実行される', () => {
      const onClickMock = vi.fn();
      const cardUI = new CardUI(scene, {
        card: gatheringCard,
        x: 0,
        y: 0,
        interactive: true,
        onClick: onClickMock,
      });

      // pointerdownイベントのコールバックを取得して実行
      const pointerdownCall = (mockRectangle.on as ReturnType<typeof vi.fn>).mock.calls.find(
        (call) => call[0] === 'pointerdown',
      );

      if (pointerdownCall) {
        const callback = pointerdownCall[1];
        callback();
      }

      // コールバックが実行されたことを確認
      expect(onClickMock).toHaveBeenCalledWith(gatheringCard);

      cardUI.destroy();
    });

    test('ホバー時にスケールアニメーションが開始される', () => {
      const cardUI = new CardUI(scene, {
        card: gatheringCard,
        x: 0,
        y: 0,
        interactive: true,
      });

      // pointeroverイベントのコールバックを取得して実行
      const pointeroverCall = (mockRectangle.on as ReturnType<typeof vi.fn>).mock.calls.find(
        (call) => call[0] === 'pointerover',
      );

      if (pointeroverCall) {
        const callback = pointeroverCall[1];
        callback();
      }

      // Tweensアニメーションが開始されたことを確認
      expect(mockTweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 100,
        }),
      );

      cardUI.destroy();
    });

    test('ホバー解除時に元のサイズに戻る', () => {
      // 【テスト目的】: ホバー解除時のアニメーション効果が正しく動作することを確認
      // 【テスト内容】: pointeroutイベントでTweenアニメーションが開始されること
      // 【期待される動作】: コンテナのscaleX/scaleYが1.0に、100msでアニメーションされる
      // 🔵 信頼性レベル: 実装ファイルと要件定義書に基づく

      const cardUI = new CardUI(scene, {
        card: gatheringCard,
        x: 0,
        y: 0,
        interactive: true,
      });

      // 【実際の処理実行】: pointeroutイベントのコールバックを取得して実行
      // 【処理内容】: ホバー解除時の処理が実行される
      const pointeroutCall = (mockRectangle.on as ReturnType<typeof vi.fn>).mock.calls.find(
        (call) => call[0] === 'pointerout',
      );

      if (pointeroutCall) {
        const callback = pointeroutCall[1];
        callback();
      }

      // 【結果検証】: Tweensアニメーションが正しいパラメータで開始されたことを確認
      // 【期待値確認】: カードが元のサイズ（1.0倍）に戻り、他のカードとの視覚的整合性を保つ
      expect(mockTweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          scaleX: 1,
          scaleY: 1,
          duration: 100,
        }),
      ); // 【確認内容】: Tweenアニメーションが正しく元のサイズに戻すこと

      cardUI.destroy();
    });
  });

  describe('T-0021-04: カード情報表示', () => {
    test('カード名が正しく表示される', () => {
      const cardUI = new CardUI(scene, {
        card: gatheringCard,
        x: 0,
        y: 0,
      });

      // カード名のテキストが作成されたことを確認
      const textCalls = (scene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const nameTextCall = textCalls.find((call) => call[2] === '採取カード');

      expect(nameTextCall).toBeDefined();

      cardUI.destroy();
    });

    test('カードコストが正しく表示される', () => {
      const cardUI = new CardUI(scene, {
        card: gatheringCard,
        x: 0,
        y: 0,
      });

      // コストのテキストが作成されたことを確認
      const textCalls = (scene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const costTextCall = textCalls.find((call) => call[2] === '⚡ 1');

      expect(costTextCall).toBeDefined();

      cardUI.destroy();
    });

    test('getCard()でカードデータが取得できる', () => {
      const cardUI = new CardUI(scene, {
        card: gatheringCard,
        x: 0,
        y: 0,
      });

      expect(cardUI.getCard()).toBe(gatheringCard);

      cardUI.destroy();
    });
  });

  describe('境界値テスト', () => {
    test('未知のカードタイプは白色で表示される', () => {
      // 【テスト目的】: 予期しないデータでも安全に動作することを確認
      // 【テスト内容】: 定義されていないカードタイプに対してデフォルト色（白）が適用されること
      // 【期待される動作】: エラーにならず、デフォルト色で表示される
      // 🔵 信頼性レベル: 実装ファイルに基づく

      // 【テストデータ準備】: 未知のカードタイプを持つカードマスターデータを用意
      // 【初期条件設定】: TypeScriptの型チェックを回避して、存在しないカードタイプを設定
      // @ts-expect-error - テスト用の未知のカードタイプ
      const unknownTypeMaster: CardMaster = {
        id: 'unknown_001',
        name: '未知のカード',
        type: 'UNKNOWN' as const,
        baseCost: 1,
        rarity: 'COMMON',
      };

      const unknownCard = new Card('card_unknown' as CardId, unknownTypeMaster as CardMaster);

      // 【実際の処理実行】: 未知のカードタイプでCardUIを生成
      // 【処理内容】: getCardTypeColor()のdefaultケースが実行される
      const cardUI = new CardUI(scene, {
        card: unknownCard,
        x: 0,
        y: 0,
      });

      // 【結果検証】: 白色（0xffffff）で背景が作成されたことを確認
      // 【期待値確認】: switch文のdefaultケースが正しく動作すること
      expect(scene.add.rectangle).toHaveBeenCalledWith(0, 0, 120, 160, 0xffffff); // 【確認内容】: 未知のタイプでもUIが壊れず、デフォルト色（白）で表示される

      cardUI.destroy();
    });
  });

  describe('destroy()', () => {
    test('すべてのGameObjectsが破棄される', () => {
      const cardUI = new CardUI(scene, {
        card: gatheringCard,
        x: 0,
        y: 0,
      });

      cardUI.destroy();

      // GameObjectsのdestroyが呼ばれたことを確認
      expect(mockRectangle.destroy).toHaveBeenCalled();
      expect(mockText.destroy).toHaveBeenCalled();
      expect(mockContainer.destroy).toHaveBeenCalled();
    });
  });
});
