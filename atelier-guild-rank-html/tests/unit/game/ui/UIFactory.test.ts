/**
 * UIFactory テスト
 *
 * UIFactory基盤クラスのテストを行う。
 * Phaserはcanvas環境を必要とするため、モックを使用する。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Phaserをモック
vi.mock('phaser', () => {
  // モック用のImageクラス
  class MockImage {
    setTexture = vi.fn();
  }

  return {
    default: {
      Scene: class MockScene {},
      GameObjects: {
        Image: MockImage,
      },
    },
    Scene: class MockScene {},
    GameObjects: {
      Image: MockImage,
    },
  };
});

import Phaser from 'phaser';

// UIFactoryをモック後にインポート
import { UIFactory, DefaultUIStyles } from '@game/ui/UIFactory';
import { Colors } from '@game/config/ColorPalette';

describe('UIFactory', () => {
  let mockScene: any;
  let mockRexUI: any;
  let uiFactory: UIFactory;

  // ボタンモック用ヘルパー
  const createMockButton = () => {
    const mockButton = {
      layout: vi.fn().mockReturnThis(),
      setInteractive: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      disableInteractive: vi.fn().mockReturnThis(),
    };
    return mockButton;
  };

  // RoundRectangleモック用ヘルパー
  const createMockRoundRectangle = () => ({
    setFillStyle: vi.fn().mockReturnThis(),
  });

  beforeEach(() => {
    mockScene = {
      add: {
        graphics: vi.fn().mockReturnValue({
          fillStyle: vi.fn().mockReturnThis(),
          fillRoundedRect: vi.fn().mockReturnThis(),
          lineStyle: vi.fn().mockReturnThis(),
          strokeRoundedRect: vi.fn().mockReturnThis(),
        }),
        text: vi.fn().mockReturnValue({
          setOrigin: vi.fn().mockReturnThis(),
        }),
        image: vi.fn().mockReturnValue({
          setDisplaySize: vi.fn().mockReturnThis(),
        }),
      },
      tweens: {
        add: vi.fn(),
      },
    };

    mockRexUI = {
      add: {
        label: vi.fn().mockReturnValue(createMockButton()),
        roundRectangle: vi.fn().mockReturnValue(createMockRoundRectangle()),
        buttons: vi.fn(),
        dialog: vi.fn(),
      },
    };

    uiFactory = new UIFactory(mockScene, mockRexUI);
  });

  describe('コンストラクタ', () => {
    it('UIFactoryインスタンスを生成できる', () => {
      expect(uiFactory).toBeDefined();
      expect(uiFactory).toBeInstanceOf(UIFactory);
    });

    it('getScene()でシーンを取得できる', () => {
      expect(uiFactory.getScene()).toBe(mockScene);
    });

    it('getRexUI()でrexUIプラグインを取得できる', () => {
      expect(uiFactory.getRexUI()).toBe(mockRexUI);
    });
  });

  describe('DefaultUIStyles', () => {
    it('buttonスタイルが定義されている', () => {
      expect(DefaultUIStyles.button).toBeDefined();
      expect(DefaultUIStyles.button.backgroundColor).toBe(Colors.primary);
      expect(DefaultUIStyles.button.cornerRadius).toBe(8);
    });

    it('panelスタイルが定義されている', () => {
      expect(DefaultUIStyles.panel).toBeDefined();
      expect(DefaultUIStyles.panel.backgroundColor).toBe(Colors.panelBackground);
      expect(DefaultUIStyles.panel.borderWidth).toBe(2);
    });

    it('dialogスタイルが定義されている', () => {
      expect(DefaultUIStyles.dialog).toBeDefined();
      expect(DefaultUIStyles.dialog.borderColor).toBe(Colors.gold);
    });

    it('progressBarスタイルが定義されている', () => {
      expect(DefaultUIStyles.progressBar).toBeDefined();
      expect(DefaultUIStyles.progressBar.backgroundColor).toBe(Colors.backgroundDark);
    });
  });

  describe('createButton', () => {
    it('createButton()でボタンを生成できる', () => {
      const button = uiFactory.createButton({ x: 100, y: 100, text: 'Test' });

      expect(mockRexUI.add.roundRectangle).toHaveBeenCalled();
      expect(mockScene.add.text).toHaveBeenCalled();
      expect(mockRexUI.add.label).toHaveBeenCalled();
      expect(button).toBeDefined();
      expect(button.layout).toHaveBeenCalled();
    });

    it('createButton()は有効なボタンにインタラクションを設定する', () => {
      const mockButton = createMockButton();
      mockRexUI.add.label = vi.fn().mockReturnValue(mockButton);

      uiFactory.createButton({
        x: 100,
        y: 100,
        text: 'Test',
        onClick: vi.fn(),
        disabled: false,
      });

      expect(mockButton.setInteractive).toHaveBeenCalledWith({ useHandCursor: true });
      expect(mockButton.on).toHaveBeenCalledWith('pointerover', expect.any(Function));
      expect(mockButton.on).toHaveBeenCalledWith('pointerout', expect.any(Function));
      expect(mockButton.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
      expect(mockButton.on).toHaveBeenCalledWith('pointerup', expect.any(Function));
    });

    it('createButton()は無効なボタンにインタラクションを設定しない', () => {
      const mockButton = createMockButton();
      mockRexUI.add.label = vi.fn().mockReturnValue(mockButton);

      uiFactory.createButton({
        x: 100,
        y: 100,
        text: 'Test',
        disabled: true,
      });

      expect(mockButton.setInteractive).not.toHaveBeenCalled();
      expect(mockButton.on).not.toHaveBeenCalled();
    });

    it('createButton()はアイコン付きボタンを生成できる', () => {
      uiFactory.createButton({
        x: 100,
        y: 100,
        text: 'Test',
        icon: 'test-icon',
        iconSize: 24,
      });

      expect(mockScene.add.image).toHaveBeenCalledWith(0, 0, 'test-icon');
      expect(mockScene.add.image().setDisplaySize).toHaveBeenCalledWith(24, 24);
    });

    it('createButton()はカスタムスタイルを適用できる', () => {
      uiFactory.createButton({
        x: 100,
        y: 100,
        text: 'Test',
        style: {
          backgroundColor: 0xff0000,
          cornerRadius: 16,
        },
      });

      expect(mockRexUI.add.roundRectangle).toHaveBeenCalledWith(
        0,
        0,
        150, // default width
        44, // default height
        16, // custom cornerRadius
        0xff0000 // custom backgroundColor
      );
    });

    it('createPrimaryButton()でプライマリボタンを生成できる', () => {
      const button = uiFactory.createPrimaryButton({ x: 100, y: 100, text: 'Test' });

      expect(button).toBeDefined();
      expect(mockRexUI.add.roundRectangle).toHaveBeenCalledWith(
        0,
        0,
        expect.any(Number),
        expect.any(Number),
        8,
        Colors.primary
      );
    });

    it('createSecondaryButton()でセカンダリボタンを生成できる', () => {
      const button = uiFactory.createSecondaryButton({ x: 100, y: 100, text: 'Test' });

      expect(button).toBeDefined();
      expect(mockRexUI.add.roundRectangle).toHaveBeenCalledWith(
        0,
        0,
        expect.any(Number),
        expect.any(Number),
        8,
        Colors.secondary
      );
    });

    it('createDangerButton()で危険ボタンを生成できる', () => {
      const button = uiFactory.createDangerButton({ x: 100, y: 100, text: 'Test' });

      expect(button).toBeDefined();
      expect(mockRexUI.add.roundRectangle).toHaveBeenCalledWith(
        0,
        0,
        expect.any(Number),
        expect.any(Number),
        8,
        Colors.danger
      );
    });

    it('setButtonEnabled()でボタンを無効化できる', () => {
      const mockBackground = createMockRoundRectangle();
      const mockButton = {
        ...createMockButton(),
        getElement: vi.fn().mockReturnValue(mockBackground),
      };
      mockRexUI.add.label = vi.fn().mockReturnValue(mockButton);

      const button = uiFactory.createButton({ x: 100, y: 100, text: 'Test' });
      uiFactory.setButtonEnabled(button as any, false);

      expect(mockButton.disableInteractive).toHaveBeenCalled();
      expect(mockBackground.setFillStyle).toHaveBeenCalledWith(Colors.disabled);
    });

    it('setButtonEnabled()でボタンを有効化できる', () => {
      const mockBackground = createMockRoundRectangle();
      const mockButton = {
        ...createMockButton(),
        getElement: vi.fn().mockReturnValue(mockBackground),
      };
      mockRexUI.add.label = vi.fn().mockReturnValue(mockButton);

      const button = uiFactory.createButton({ x: 100, y: 100, text: 'Test' });
      uiFactory.setButtonEnabled(button as any, true);

      expect(mockButton.setInteractive).toHaveBeenCalledWith({ useHandCursor: true });
      expect(mockBackground.setFillStyle).toHaveBeenCalledWith(Colors.primary);
    });
  });

  describe('createLabel', () => {
    it('createLabel()でテキストラベルを生成できる', () => {
      const label = uiFactory.createLabel({ x: 100, y: 100, text: 'Test Label' });

      expect(mockScene.add.text).toHaveBeenCalled();
      expect(mockRexUI.add.label).toHaveBeenCalled();
      expect(label).toBeDefined();
      expect(label.layout).toHaveBeenCalled();
    });

    it('createLabel()でアイコン付きラベルを生成できる', () => {
      uiFactory.createLabel({
        x: 100,
        y: 100,
        text: 'Test',
        icon: 'test-icon',
        iconSize: 24,
      });

      expect(mockScene.add.image).toHaveBeenCalledWith(0, 0, 'test-icon');
      expect(mockScene.add.image().setDisplaySize).toHaveBeenCalledWith(24, 24);
      expect(mockScene.add.text).toHaveBeenCalled();
      expect(mockRexUI.add.label).toHaveBeenCalled();
    });

    it('createLabel()で垂直配置を指定できる', () => {
      uiFactory.createLabel({
        x: 100,
        y: 100,
        text: 'Test',
        orientation: 'vertical',
      });

      expect(mockRexUI.add.label).toHaveBeenCalledWith(
        expect.objectContaining({
          orientation: 'vertical',
        })
      );
    });

    it('createLabel()でアイコンとテキストの間隔を設定できる', () => {
      uiFactory.createLabel({
        x: 100,
        y: 100,
        text: 'Test',
        space: 16,
      });

      expect(mockRexUI.add.label).toHaveBeenCalledWith(
        expect.objectContaining({
          space: { icon: 16 },
        })
      );
    });

    it('createValueLabel()で値ラベルを生成できる', () => {
      const label = uiFactory.createValueLabel({
        x: 100,
        y: 100,
        icon: 'icon-gold',
        value: 1000,
      });

      expect(mockScene.add.image).toHaveBeenCalledWith(0, 0, 'icon-gold');
      expect(mockScene.add.text).toHaveBeenCalled();
      expect(label).toBeDefined();
    });

    it('createValueLabel()で数値を文字列に変換する', () => {
      uiFactory.createValueLabel({
        x: 100,
        y: 100,
        icon: 'icon-gold',
        value: 1234,
      });

      // テキストとして '1234' が渡されることを確認
      expect(mockScene.add.text).toHaveBeenCalledWith(
        0,
        0,
        '1234',
        expect.any(Object)
      );
    });

    it('createTitleLabel()でタイトルラベルを生成できる', () => {
      const title = uiFactory.createTitleLabel({
        x: 640,
        y: 100,
        text: 'Game Title',
        size: 'large',
      });

      expect(mockScene.add.text).toHaveBeenCalled();
      expect(title.setOrigin).toHaveBeenCalledWith(0.5);
    });

    it('createTitleLabel()のデフォルトサイズはmedium', () => {
      uiFactory.createTitleLabel({
        x: 640,
        y: 100,
        text: 'Section Title',
      });

      expect(mockScene.add.text).toHaveBeenCalled();
    });

    it('createDescriptionLabel()で説明ラベルを生成できる', () => {
      const desc = uiFactory.createDescriptionLabel({
        x: 100,
        y: 200,
        text: 'This is a description',
      });

      expect(mockScene.add.text).toHaveBeenCalled();
      expect(desc).toBeDefined();
    });

    it('createDescriptionLabel()でワードラップ幅を設定できる', () => {
      uiFactory.createDescriptionLabel({
        x: 100,
        y: 200,
        text: 'Long description text',
        width: 300,
      });

      expect(mockScene.add.text).toHaveBeenCalledWith(
        100,
        200,
        'Long description text',
        expect.objectContaining({
          wordWrap: { width: 300 },
        })
      );
    });

    it('updateLabelText()でラベルのテキストを更新できる', () => {
      const mockTextObj = { setText: vi.fn() };
      const mockLabel = {
        ...createMockButton(),
        getElement: vi.fn().mockReturnValue(mockTextObj),
      };
      mockRexUI.add.label = vi.fn().mockReturnValue(mockLabel);

      const label = uiFactory.createLabel({ x: 100, y: 100, text: 'Original' });
      uiFactory.updateLabelText(label as any, 'Updated');

      expect(mockLabel.getElement).toHaveBeenCalledWith('text');
      expect(mockTextObj.setText).toHaveBeenCalledWith('Updated');
      expect(mockLabel.layout).toHaveBeenCalled();
    });

    it('updateLabelIcon()でラベルのアイコンを更新できる', () => {
      const mockIconObj = Object.assign(Object.create(Phaser.GameObjects.Image.prototype), {
        setTexture: vi.fn(),
      });
      const mockLabel = {
        ...createMockButton(),
        getElement: vi.fn().mockReturnValue(mockIconObj),
      };
      mockRexUI.add.label = vi.fn().mockReturnValue(mockLabel);

      const label = uiFactory.createLabel({
        x: 100,
        y: 100,
        text: 'Test',
        icon: 'old-icon',
      });
      uiFactory.updateLabelIcon(label as any, 'new-icon');

      expect(mockLabel.getElement).toHaveBeenCalledWith('icon');
      expect(mockIconObj.setTexture).toHaveBeenCalledWith('new-icon');
      expect(mockLabel.layout).toHaveBeenCalled();
    });
  });

  describe('createDialog', () => {
    // ダイアログ用モックを追加
    const createMockDialog = () => ({
      layout: vi.fn().mockReturnThis(),
      setDepth: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    });

    const createDialogMockScene = () => ({
      ...mockScene,
      add: {
        ...mockScene.add,
        rectangle: vi.fn().mockReturnValue({
          setInteractive: vi.fn().mockReturnThis(),
          setDepth: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
          on: vi.fn().mockReturnThis(),
        }),
      },
      cameras: {
        main: {
          centerX: 640,
          centerY: 360,
          width: 1280,
          height: 720,
        },
      },
      input: {
        keyboard: {
          once: vi.fn(),
          off: vi.fn(),
        },
      },
    });

    beforeEach(() => {
      mockRexUI.add.dialog = vi.fn().mockReturnValue(createMockDialog());
    });

    it('createDialog()でダイアログを生成できる', () => {
      const dialogMockScene = createDialogMockScene();
      const factory = new UIFactory(dialogMockScene as any, mockRexUI);

      const result = factory.createDialog({
        title: 'Test Dialog',
        content: 'This is test content',
      });

      expect(mockRexUI.add.dialog).toHaveBeenCalled();
      expect(result.dialog).toBeDefined();
      expect(result.close).toBeInstanceOf(Function);
    });

    it('createDialog()でモーダル背景が生成される', () => {
      const dialogMockScene = createDialogMockScene();
      const factory = new UIFactory(dialogMockScene as any, mockRexUI);

      const result = factory.createDialog({
        title: 'Test',
        content: 'Content',
        modal: true,
      });

      expect(dialogMockScene.add.rectangle).toHaveBeenCalled();
      expect(result.modalBackground).toBeDefined();
    });

    it('createDialog()でモーダル背景を無効にできる', () => {
      const dialogMockScene = createDialogMockScene();
      const factory = new UIFactory(dialogMockScene as any, mockRexUI);

      const result = factory.createDialog({
        title: 'Test',
        content: 'Content',
        modal: false,
      });

      expect(result.modalBackground).toBeUndefined();
    });

    it('createDialog()でボタンを設定できる', () => {
      const dialogMockScene = createDialogMockScene();
      const factory = new UIFactory(dialogMockScene as any, mockRexUI);
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      factory.createDialog({
        title: 'Test',
        content: 'Content',
        buttons: [
          { text: 'Cancel', onClick: onCancel },
          { text: 'OK', onClick: onConfirm, primary: true },
        ],
      });

      // ボタン生成が呼ばれたことを確認（createButtonがlabelを呼ぶ）
      expect(mockRexUI.add.label).toHaveBeenCalled();
    });

    it('close()でダイアログとモーダル背景が破棄される', () => {
      const dialogMockScene = createDialogMockScene();
      const factory = new UIFactory(dialogMockScene as any, mockRexUI);
      const mockDialogObj = createMockDialog();
      mockRexUI.add.dialog = vi.fn().mockReturnValue(mockDialogObj);

      const result = factory.createDialog({
        title: 'Test',
        content: 'Content',
        modal: true,
      });

      result.close();

      expect(mockDialogObj.destroy).toHaveBeenCalled();
    });

    it('createConfirmDialog()で確認ダイアログを生成できる', () => {
      const dialogMockScene = createDialogMockScene();
      const factory = new UIFactory(dialogMockScene as any, mockRexUI);
      const onConfirm = vi.fn();

      const result = factory.createConfirmDialog({
        title: '確認',
        message: '実行しますか？',
        onConfirm,
      });

      expect(mockRexUI.add.dialog).toHaveBeenCalled();
      expect(result.dialog).toBeDefined();
    });

    it('createAlertDialog()で情報ダイアログを生成できる', () => {
      const dialogMockScene = createDialogMockScene();
      const factory = new UIFactory(dialogMockScene as any, mockRexUI);

      const result = factory.createAlertDialog({
        title: 'お知らせ',
        message: '処理が完了しました',
      });

      expect(mockRexUI.add.dialog).toHaveBeenCalled();
      expect(result.dialog).toBeDefined();
    });

    it('ESCキーハンドラが登録される', () => {
      const dialogMockScene = createDialogMockScene();
      const factory = new UIFactory(dialogMockScene as any, mockRexUI);

      factory.createDialog({
        title: 'Test',
        content: 'Content',
      });

      expect(dialogMockScene.input.keyboard.once).toHaveBeenCalledWith(
        'keydown-ESC',
        expect.any(Function)
      );
    });
  });

  describe('createProgressBar', () => {
    // プログレスバー用モックシーンを追加
    const createProgressBarMockScene = () => ({
      add: {
        container: vi.fn().mockReturnValue({
          add: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
        graphics: vi.fn().mockReturnValue({
          fillStyle: vi.fn().mockReturnThis(),
          fillRoundedRect: vi.fn().mockReturnThis(),
          clear: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
        text: vi.fn().mockReturnValue({
          setOrigin: vi.fn().mockReturnThis(),
          setText: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
        image: vi.fn().mockReturnValue({
          setDisplaySize: vi.fn().mockReturnThis(),
        }),
      },
      tweens: {
        add: vi.fn(),
        addCounter: vi.fn().mockReturnValue({
          stop: vi.fn(),
        }),
      },
    });

    it('createProgressBar()でプログレスバーを生成できる', () => {
      const pbMockScene = createProgressBarMockScene();
      const factory = new UIFactory(pbMockScene as any, mockRexUI);

      const result = factory.createProgressBar({
        x: 100,
        y: 100,
        width: 200,
        height: 20,
        value: 50,
        maxValue: 100,
      });

      expect(pbMockScene.add.container).toHaveBeenCalledWith(100, 100);
      expect(pbMockScene.add.graphics).toHaveBeenCalled();
      expect(result.container).toBeDefined();
      expect(result.background).toBeDefined();
      expect(result.bar).toBeDefined();
      expect(result.getValue).toBeInstanceOf(Function);
      expect(result.setValue).toBeInstanceOf(Function);
      expect(result.setMaxValue).toBeInstanceOf(Function);
    });

    it('createProgressBar()でテキスト表示を有効にできる', () => {
      const pbMockScene = createProgressBarMockScene();
      const factory = new UIFactory(pbMockScene as any, mockRexUI);

      const result = factory.createProgressBar({
        x: 100,
        y: 100,
        width: 200,
        height: 20,
        value: 50,
        maxValue: 100,
        showText: true,
      });

      expect(pbMockScene.add.text).toHaveBeenCalled();
      expect(result.text).toBeDefined();
    });

    it('createProgressBar()でテキスト表示がデフォルトで無効', () => {
      const pbMockScene = createProgressBarMockScene();
      const factory = new UIFactory(pbMockScene as any, mockRexUI);

      const result = factory.createProgressBar({
        x: 100,
        y: 100,
        width: 200,
        height: 20,
        value: 50,
        maxValue: 100,
      });

      expect(result.text).toBeUndefined();
    });

    it('getValue()で現在値を取得できる', () => {
      const pbMockScene = createProgressBarMockScene();
      const factory = new UIFactory(pbMockScene as any, mockRexUI);

      const result = factory.createProgressBar({
        x: 100,
        y: 100,
        width: 200,
        height: 20,
        value: 50,
        maxValue: 100,
      });

      expect(result.getValue()).toBe(50);
    });

    it('setValue()で値を即時更新できる', () => {
      const pbMockScene = createProgressBarMockScene();
      const factory = new UIFactory(pbMockScene as any, mockRexUI);

      const result = factory.createProgressBar({
        x: 100,
        y: 100,
        width: 200,
        height: 20,
        value: 50,
        maxValue: 100,
      });

      result.setValue(75);

      expect(result.getValue()).toBe(75);
      // barのclearとfillRoundedRectが呼ばれることを確認
      const mockBar = pbMockScene.add.graphics();
      expect(mockBar.clear).toHaveBeenCalled();
    });

    it('setValue()で値がクランプされる', () => {
      const pbMockScene = createProgressBarMockScene();
      const factory = new UIFactory(pbMockScene as any, mockRexUI);

      const result = factory.createProgressBar({
        x: 100,
        y: 100,
        width: 200,
        height: 20,
        value: 50,
        maxValue: 100,
      });

      // 最大値を超える場合
      result.setValue(150);
      expect(result.getValue()).toBe(100);

      // 負の値の場合
      result.setValue(-10);
      expect(result.getValue()).toBe(0);
    });

    it('setValue()でアニメーション付き更新ができる', () => {
      const pbMockScene = createProgressBarMockScene();
      const factory = new UIFactory(pbMockScene as any, mockRexUI);

      const result = factory.createProgressBar({
        x: 100,
        y: 100,
        width: 200,
        height: 20,
        value: 50,
        maxValue: 100,
      });

      result.setValue(100, true);

      expect(pbMockScene.tweens.addCounter).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 50,
          to: 100,
          duration: 300,
        })
      );
    });

    it('setMaxValue()で最大値を更新できる', () => {
      const pbMockScene = createProgressBarMockScene();
      const factory = new UIFactory(pbMockScene as any, mockRexUI);

      const result = factory.createProgressBar({
        x: 100,
        y: 100,
        width: 200,
        height: 20,
        value: 50,
        maxValue: 100,
      });

      result.setMaxValue(200);

      // 現在値は維持される
      expect(result.getValue()).toBe(50);
    });

    it('createProgressBar()でカスタム色を適用できる', () => {
      const pbMockScene = createProgressBarMockScene();
      const factory = new UIFactory(pbMockScene as any, mockRexUI);

      factory.createProgressBar({
        x: 100,
        y: 100,
        width: 200,
        height: 20,
        value: 50,
        maxValue: 100,
        barColor: 0xff0000,
        backgroundColor: 0x333333,
      });

      const mockBackground = pbMockScene.add.graphics();
      expect(mockBackground.fillStyle).toHaveBeenCalledWith(0x333333);
    });

    it('createProgressBar()でカスタムテキストフォーマットを使用できる', () => {
      const pbMockScene = createProgressBarMockScene();
      const factory = new UIFactory(pbMockScene as any, mockRexUI);

      const customFormat = (value: number, max: number) => `${value}/${max} pts`;

      factory.createProgressBar({
        x: 100,
        y: 100,
        width: 200,
        height: 20,
        value: 50,
        maxValue: 100,
        showText: true,
        textFormat: customFormat,
      });

      const mockText = pbMockScene.add.text();
      expect(mockText.setText).toHaveBeenCalled();
    });

    it('createRankGauge()でランクゲージを生成できる', () => {
      const pbMockScene = createProgressBarMockScene();
      const factory = new UIFactory(pbMockScene as any, mockRexUI);

      const result = factory.createRankGauge({
        x: 100,
        y: 100,
        width: 200,
        height: 20,
        contribution: 500,
        maxContribution: 1000,
      });

      expect(result.container).toBeDefined();
      expect(result.getValue()).toBe(500);
    });

    it('createRankGauge()はテキスト表示がデフォルトで有効', () => {
      const pbMockScene = createProgressBarMockScene();
      const factory = new UIFactory(pbMockScene as any, mockRexUI);

      const result = factory.createRankGauge({
        x: 100,
        y: 100,
        width: 200,
        height: 20,
        contribution: 500,
        maxContribution: 1000,
      });

      expect(result.text).toBeDefined();
    });
  });

  describe('未実装メソッド', () => {
    it('createPanel()はエラーをスローする', () => {
      expect(() => {
        uiFactory.createPanel({ x: 0, y: 0, width: 100, height: 100 });
      }).toThrow('Not implemented - see TASK-0175');
    });

    it('createScrollPanel()はエラーをスローする', () => {
      expect(() => {
        uiFactory.createScrollPanel({
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          content: [],
        });
      }).toThrow('Not implemented - see TASK-0178');
    });

    it('createGridButtons()はエラーをスローする', () => {
      expect(() => {
        uiFactory.createGridButtons({
          x: 0,
          y: 0,
          items: [],
          columns: 4,
          cellWidth: 100,
          cellHeight: 100,
        });
      }).toThrow('Not implemented - see TASK-0179');
    });

    it('showToast()はエラーをスローする', () => {
      expect(() => {
        uiFactory.showToast({ message: 'Test' });
      }).toThrow('Not implemented - see TASK-0180');
    });

    it('addTooltip()はエラーをスローする', () => {
      expect(() => {
        uiFactory.addTooltip({ target: {} as any, text: 'Test' });
      }).toThrow('Not implemented - see TASK-0180');
    });
  });

  describe('ユーティリティメソッド', () => {
    it('createRoundedRect()で角丸四角形を生成できる', () => {
      const result = uiFactory.createRoundedRect(100, 100, 200, 50, 0x333333, 10);

      expect(mockScene.add.graphics).toHaveBeenCalled();
      expect(result.fillStyle).toHaveBeenCalledWith(0x333333);
      expect(result.fillRoundedRect).toHaveBeenCalledWith(0, 75, 200, 50, 10);
    });

    it('createRoundedRect()のradiusはデフォルトで8', () => {
      uiFactory.createRoundedRect(100, 100, 200, 50, 0x333333);

      const graphics = mockScene.add.graphics();
      expect(graphics.fillRoundedRect).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        8
      );
    });

    it('createRoundedRectWithStroke()で枠線付き角丸四角形を生成できる', () => {
      const result = uiFactory.createRoundedRectWithStroke(
        100,
        100,
        200,
        50,
        0x333333,
        0x666666,
        2,
        10
      );

      expect(mockScene.add.graphics).toHaveBeenCalled();
      expect(result.fillStyle).toHaveBeenCalledWith(0x333333);
      expect(result.lineStyle).toHaveBeenCalledWith(2, 0x666666);
    });

    it('createText()でテキストを生成できる', () => {
      const result = uiFactory.createText(100, 100, 'Hello', 'body');

      expect(mockScene.add.text).toHaveBeenCalled();
      expect(result.setOrigin).toHaveBeenCalledWith(0.5);
    });
  });
});
