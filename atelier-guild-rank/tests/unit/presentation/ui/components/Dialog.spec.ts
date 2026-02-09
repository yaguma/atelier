// @ts-nocheck
/**
 * Dialogコンポーネントのテスト
 * TASK-0018 Phase 2 共通UIコンポーネント基盤
 *
 * @description
 * T-0018-DLG-01: 確認ダイアログの生成と表示
 * T-0018-DLG-02: 情報ダイアログの生成と表示
 * T-0018-DLG-03: 選択ダイアログの生成と表示
 * T-0018-DLG-04: ダイアログの表示アニメーション
 * T-0018-DLG-05: ダイアログの非表示アニメーション
 * T-0018-DLG-06: ダイアログボタンのクリックとコールバック実行
 * T-0018-DLG-07: ダイアログの深度（depth）設定
 * T-0018-DLG-08: タイトルが空の場合
 * T-0018-DLG-09: actionsが空配列の場合
 * T-0018-DLG-10: 既に表示中のダイアログをshow()で呼ぶ
 * T-0018-DLG-11: 最小幅のダイアログ生成
 * T-0018-DLG-12: 長いメッセージのダイアログ生成
 * T-0018-DLG-13: 多数のアクションボタン
 */

import { Dialog, DialogType } from '@presentation/ui/components/Dialog';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// rexUIプラグイン拡張シーンインターフェース（テスト用）
interface RexUIScene extends Phaser.Scene {
  rexUI: {
    add: {
      label: ReturnType<typeof vi.fn>;
      roundRectangle: ReturnType<typeof vi.fn>;
      dialog?: ReturnType<typeof vi.fn>;
      sizer?: ReturnType<typeof vi.fn>;
    };
  };
}

// ButtonTypeを一時的に定義（Redフェーズでは実装ファイルが存在しないため）
enum ButtonType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TEXT = 'text',
  ICON = 'icon',
}

interface MockDialog {
  layout: ReturnType<typeof vi.fn>;
  popUp: ReturnType<typeof vi.fn>;
  scaleDownDestroy: ReturnType<typeof vi.fn>;
  setDepth: ReturnType<typeof vi.fn>;
  setVisible: ReturnType<typeof vi.fn>;
  visible: boolean;
}

interface MockContainer {
  setVisible: ReturnType<typeof vi.fn>;
  setPosition: ReturnType<typeof vi.fn>;
  x: number;
  y: number;
  visible: boolean;
}

interface MockOverlay {
  setDepth: ReturnType<typeof vi.fn>;
  setVisible: ReturnType<typeof vi.fn>;
  setAlpha: ReturnType<typeof vi.fn>;
}

describe('Dialog', () => {
  let scene: RexUIScene;
  let mockYes: () => void;
  let mockNo: () => void;
  let mockClose: () => void;
  let mockDialog: MockDialog;
  let mockContainer: MockContainer;
  let mockOverlay: MockOverlay;

  beforeEach(() => {
    // 【テスト前準備】: 各テスト実行前にPhaserシーンとrexUIプラグインをモック化し、一貫したテスト条件を保証
    // 【環境初期化】: DialogコンポーネントがrexUIプラグインに依存するため、適切なモックを用意
    // 【前提条件確認】: scene.rexUIが存在し、add.dialogメソッドが利用可能であることを前提とする

    mockYes = vi.fn() as () => void;
    mockNo = vi.fn() as () => void;
    mockClose = vi.fn() as () => void;

    // モックのDialogコンポーネント
    mockDialog = {
      layout: vi.fn().mockReturnThis(),
      popUp: vi.fn().mockReturnThis(),
      scaleDownDestroy: vi.fn().mockReturnThis(),
      setDepth: vi.fn().mockReturnThis(),
      setVisible: vi.fn().mockReturnThis(),
      visible: false,
    };

    // モックのOverlay（背景）
    mockOverlay = {
      setDepth: vi.fn().mockReturnThis(),
      setVisible: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
    };

    // モックのContainer
    mockContainer = {
      setVisible: vi.fn().mockReturnThis(),
      setPosition: vi.fn().mockReturnThis(),
      x: 0,
      y: 0,
      visible: true,
    };

    // Phaserシーンのモックを作成
    scene = {
      add: {
        container: vi.fn().mockReturnValue(mockContainer),
        rectangle: vi.fn().mockReturnValue(mockOverlay),
        text: vi.fn().mockReturnValue({
          setStyle: vi.fn().mockReturnThis(),
        }),
      },
      rexUI: {
        add: {
          dialog: vi.fn().mockReturnValue(mockDialog),
          label: vi.fn().mockImplementation(() => ({
            setInteractive: vi.fn().mockReturnThis(),
            on: vi.fn().mockReturnThis(),
            layout: vi.fn().mockReturnThis(),
          })),
          roundRectangle: vi.fn().mockReturnValue({
            setFillStyle: vi.fn().mockReturnThis(),
          }),
          sizer: vi.fn().mockReturnValue({
            add: vi.fn().mockReturnThis(),
            layout: vi.fn().mockReturnThis(),
          }),
        },
      },
    } as unknown as RexUIScene;
  });

  describe('T-0018-DLG-01: 確認ダイアログの生成と表示', () => {
    // 【テスト目的】: 確認ダイアログが設計書通りに生成されることを確認
    // 【テスト内容】: タイトル、メッセージ、「はい」「いいえ」ボタンを含むダイアログが生成されることを検証
    // 【期待される動作】: rexUI.add.dialogが呼ばれ、正しいパラメータでダイアログが生成される
    // 🔵 信頼性レベル: UI設計書 overview.md セクション 5.3 に明記

    test('確認ダイアログが正しく生成される', () => {
      // 【テストデータ準備】: 確認ダイアログの標準的な設定を用意
      new Dialog(scene, 640, 360, {
        title: '確認',
        content: '本当にこの操作を実行しますか？',
        type: DialogType.CONFIRM,
        actions: [
          { label: 'はい', type: ButtonType.PRIMARY, callback: mockYes },
          { label: 'いいえ', type: ButtonType.SECONDARY, callback: mockNo },
        ],
      });

      // 【結果検証】: rexUI.add.dialogが呼ばれたことを確認
      // 【期待値確認】: ダイアログが正しく生成されていることを検証
      expect(scene.rexUI.add.dialog).toHaveBeenCalled(); // 🔵
    });

    test('タイトルが正しく設定されている', () => {
      // 【確認内容】: ダイアログのタイトルが指定した値で設定されていることを確認
      new Dialog(scene, 640, 360, {
        title: '確認',
        content: '本当にこの操作を実行しますか？',
        type: DialogType.CONFIRM,
        actions: [{ label: 'はい', type: ButtonType.PRIMARY, callback: mockYes }],
      });

      // タイトルテキストが生成されたことを確認
      expect(scene.add.text).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        '確認',
        expect.anything(),
      ); // 🔵
    });

    test('2つのアクションボタンが存在する', () => {
      // 【確認内容】: 「はい」「いいえ」の2つのボタンが生成されていることを確認
      new Dialog(scene, 640, 360, {
        title: '確認',
        content: '本当にこの操作を実行しますか？',
        type: DialogType.CONFIRM,
        actions: [
          { label: 'はい', type: ButtonType.PRIMARY, callback: mockYes },
          { label: 'いいえ', type: ButtonType.SECONDARY, callback: mockNo },
        ],
      });

      // 2つのボタンが生成されたことを確認（labelが2回呼ばれる）
      expect(scene.rexUI.add.label).toHaveBeenCalledTimes(2); // 🔵
    });
  });

  describe('T-0018-DLG-02: 情報ダイアログの生成と表示', () => {
    // 【テスト目的】: 情報ダイアログが正しく生成されることを確認
    // 【テスト内容】: タイトル、メッセージ、「閉じる」ボタンを含むダイアログが生成されることを検証
    // 【期待される動作】: 情報ダイアログが設計書通りに生成される
    // 🔵 信頼性レベル: UI設計書 overview.md セクション 5.3 に明記

    test('情報ダイアログが正しく生成される', () => {
      // 【テストデータ準備】: 情報ダイアログの標準的な設定を用意
      new Dialog(scene, 640, 360, {
        title: '情報',
        content: 'アイテムを入手しました！',
        type: DialogType.INFO,
        actions: [{ label: '閉じる', type: ButtonType.PRIMARY, callback: mockClose }],
      });

      // 【結果検証】: rexUI.add.dialogが呼ばれたことを確認
      expect(scene.rexUI.add.dialog).toHaveBeenCalled(); // 🔵
    });

    test('1つのアクションボタンが存在する', () => {
      // 【確認内容】: 「閉じる」ボタンが1つだけ生成されていることを確認
      new Dialog(scene, 640, 360, {
        title: '情報',
        content: 'アイテムを入手しました！',
        type: DialogType.INFO,
        actions: [{ label: '閉じる', type: ButtonType.PRIMARY, callback: mockClose }],
      });

      // 1つのボタンが生成されたことを確認
      expect(scene.rexUI.add.label).toHaveBeenCalledTimes(1); // 🔵
    });
  });

  describe('T-0018-DLG-03: 選択ダイアログの生成と表示', () => {
    // 【テスト目的】: 選択ダイアログが正しく生成されることを確認
    // 【テスト内容】: タイトル、メッセージ、複数の選択肢ボタンを含むダイアログが生成されることを検証
    // 【期待される動作】: 選択ダイアログが設計書通りに生成される
    // 🔵 信頼性レベル: UI設計書 overview.md セクション 5.3 に明記

    test('選択ダイアログが正しく生成される', () => {
      // 【テストデータ準備】: 選択ダイアログの標準的な設定を用意
      const mockOpt1 = vi.fn();
      const mockOpt2 = vi.fn();
      const mockOpt3 = vi.fn();

      new Dialog(scene, 640, 360, {
        title: '選択',
        content: '以下から選択してください',
        type: DialogType.CHOICE,
        actions: [
          { label: 'オプション1', type: ButtonType.PRIMARY, callback: mockOpt1 },
          { label: 'オプション2', type: ButtonType.SECONDARY, callback: mockOpt2 },
          { label: 'オプション3', type: ButtonType.SECONDARY, callback: mockOpt3 },
        ],
      });

      // 【結果検証】: rexUI.add.dialogが呼ばれたことを確認
      expect(scene.rexUI.add.dialog).toHaveBeenCalled(); // 🔵
    });

    test('3つのアクションボタンが存在する', () => {
      // 【確認内容】: 3つの選択肢ボタンが生成されていることを確認
      const mockOpt1 = vi.fn();
      const mockOpt2 = vi.fn();
      const mockOpt3 = vi.fn();

      new Dialog(scene, 640, 360, {
        title: '選択',
        content: '以下から選択してください',
        type: DialogType.CHOICE,
        actions: [
          { label: 'オプション1', type: ButtonType.PRIMARY, callback: mockOpt1 },
          { label: 'オプション2', type: ButtonType.SECONDARY, callback: mockOpt2 },
          { label: 'オプション3', type: ButtonType.SECONDARY, callback: mockOpt3 },
        ],
      });

      // 3つのボタンが生成されたことを確認
      expect(scene.rexUI.add.label).toHaveBeenCalledTimes(3); // 🔵
    });
  });

  describe('T-0018-DLG-04: ダイアログの表示アニメーション', () => {
    // 【テスト目的】: 表示アニメーションが正しく動作することを確認
    // 【テスト内容】: show()メソッドでダイアログがアニメーション付きで表示されることを検証
    // 【期待される動作】: popUpアニメーション（スケール: 0→1）で表示される
    // 🔵 信頼性レベル: Phase 2要件定義書 セクション 2.2.3 に公開メソッドとして記載

    test('show()メソッドでダイアログが表示される', () => {
      // 【テストデータ準備】: ダイアログを生成
      const dialog = new Dialog(scene, 640, 360, {
        title: '情報',
        content: 'メッセージ',
        type: DialogType.INFO,
        actions: [{ label: '閉じる', type: ButtonType.PRIMARY, callback: mockClose }],
      });

      // 【実際の処理実行】: show()メソッドを呼び出す
      dialog.show();

      // 【結果検証】: popUpアニメーションが呼ばれたことを確認
      // 【期待値確認】: アニメーション付きで表示されることを検証
      expect(mockDialog.popUp).toHaveBeenCalled(); // 🔵
    });

    test('アニメーション時間を指定できる', () => {
      // 【確認内容】: show()メソッドにアニメーション時間を指定できることを確認
      const dialog = new Dialog(scene, 640, 360, {
        title: '情報',
        content: 'メッセージ',
        type: DialogType.INFO,
        actions: [{ label: '閉じる', type: ButtonType.PRIMARY, callback: mockClose }],
      });

      dialog.show(500);

      // アニメーション時間が指定されたことを確認
      expect(mockDialog.popUp).toHaveBeenCalledWith(500); // 🔵
    });
  });

  describe('T-0018-DLG-05: ダイアログの非表示アニメーション', () => {
    // 【テスト目的】: 非表示アニメーションが正しく動作することを確認
    // 【テスト内容】: hide()メソッドでダイアログがアニメーション付きで非表示になることを検証
    // 【期待される動作】: scaleDownアニメーション（スケール: 1→0）で非表示になる
    // 🔵 信頼性レベル: Phase 2要件定義書 セクション 2.2.3 に公開メソッドとして記載

    test('hide()メソッドでダイアログが非表示になる', () => {
      // 【テストデータ準備】: ダイアログを生成
      const dialog = new Dialog(scene, 640, 360, {
        title: '情報',
        content: 'メッセージ',
        type: DialogType.INFO,
        actions: [{ label: '閉じる', type: ButtonType.PRIMARY, callback: mockClose }],
      });

      // 【実際の処理実行】: hide()メソッドを呼び出す
      dialog.hide();

      // 【結果検証】: scaleDownDestroyアニメーションが呼ばれたことを確認
      expect(mockDialog.scaleDownDestroy).toHaveBeenCalled(); // 🔵
    });

    test('アニメーション時間を指定できる', () => {
      // 【確認内容】: hide()メソッドにアニメーション時間を指定できることを確認
      const dialog = new Dialog(scene, 640, 360, {
        title: '情報',
        content: 'メッセージ',
        type: DialogType.INFO,
        actions: [{ label: '閉じる', type: ButtonType.PRIMARY, callback: mockClose }],
      });

      dialog.hide(500);

      // アニメーション時間が指定されたことを確認
      expect(mockDialog.scaleDownDestroy).toHaveBeenCalledWith(500); // 🔵
    });
  });

  describe('T-0018-DLG-06: ダイアログボタンのクリックとコールバック実行', () => {
    // 【テスト目的】: ボタンクリックが正しく動作することを確認
    // 【テスト内容】: ダイアログのボタンをクリックしたときに正しいコールバックが実行されることを検証
    // 【期待される動作】: ボタンクリック時に対応するコールバックが呼ばれ、ダイアログが閉じる
    // 🔵 信頼性レベル: Phase 2要件定義書 セクション 4.1.3 に使用例として記載

    test('「はい」ボタンをクリックするとコールバックが実行される', () => {
      // 【テストデータ準備】: 確認ダイアログを生成
      new Dialog(scene, 640, 360, {
        title: '確認',
        content: '本当にこの操作を実行しますか？',
        type: DialogType.CONFIRM,
        actions: [
          { label: 'はい', type: ButtonType.PRIMARY, callback: mockYes },
          { label: 'いいえ', type: ButtonType.SECONDARY, callback: mockNo },
        ],
      });

      // 【実際の処理実行】: 「はい」ボタンのクリックをシミュレート
      // rexUI.add.labelの1回目の呼び出しが「はい」ボタン
      const yesButton = scene.rexUI.add.label.mock.results[0].value;
      const onPointerDown = yesButton.on.mock.calls.find(
        (call: unknown[]) => call[0] === 'pointerdown',
      )?.[1];

      if (onPointerDown) {
        onPointerDown();
      }

      // 【結果検証】: 「はい」コールバックが呼ばれたことを確認
      expect(mockYes).toHaveBeenCalledTimes(1); // 🔵

      // 【確認内容】: 「いいえ」コールバックは呼ばれていないことを確認
      expect(mockNo).not.toHaveBeenCalled(); // 🔵
    });

    test('「いいえ」ボタンをクリックするとコールバックが実行される', () => {
      // 【確認内容】: 「いいえ」ボタンのコールバックが正しく実行されることを確認
      new Dialog(scene, 640, 360, {
        title: '確認',
        content: '本当にこの操作を実行しますか？',
        type: DialogType.CONFIRM,
        actions: [
          { label: 'はい', type: ButtonType.PRIMARY, callback: mockYes },
          { label: 'いいえ', type: ButtonType.SECONDARY, callback: mockNo },
        ],
      });

      // 「いいえ」ボタンのクリックをシミュレート（2回目の呼び出し）
      const noButton = scene.rexUI.add.label.mock.results[1].value;
      const onPointerDown = noButton.on.mock.calls.find(
        (call: unknown[]) => call[0] === 'pointerdown',
      )?.[1];

      if (onPointerDown) {
        onPointerDown();
      }

      expect(mockNo).toHaveBeenCalledTimes(1); // 🔵
      expect(mockYes).not.toHaveBeenCalled(); // 🔵
    });
  });

  describe('T-0018-DLG-07: ダイアログの深度（depth）設定', () => {
    // 【テスト目的】: 深度設定が正しいことを確認
    // 【テスト内容】: ダイアログとオーバーレイが正しいdepthで表示されることを検証
    // 【期待される動作】: オーバーレイがdepth 300、ダイアログがdepth 400で表示される
    // 🔵 信頼性レベル: UI設計書 overview.md セクション 4.2 に明記

    test('ダイアログがdepth 400で表示される', () => {
      // 【テストデータ準備】: ダイアログを生成
      const dialog = new Dialog(scene, 640, 360, {
        title: '情報',
        content: 'メッセージ',
        type: DialogType.INFO,
        actions: [{ label: '閉じる', type: ButtonType.PRIMARY, callback: mockClose }],
      });

      // 【実際の処理実行】: show()でダイアログを表示
      dialog.show();

      // 【結果検証】: ダイアログのdepthが400に設定されたことを確認
      expect(mockDialog.setDepth).toHaveBeenCalledWith(400); // 🔵
    });

    test('オーバーレイがdepth 300で表示される', () => {
      // 【確認内容】: オーバーレイ（背景）のdepthが300に設定されていることを確認
      const dialog = new Dialog(scene, 640, 360, {
        title: '情報',
        content: 'メッセージ',
        type: DialogType.INFO,
        actions: [{ label: '閉じる', type: ButtonType.PRIMARY, callback: mockClose }],
      });

      dialog.show();

      // オーバーレイのdepthが300に設定されたことを確認
      expect(mockOverlay.setDepth).toHaveBeenCalledWith(300); // 🔵
    });
  });

  describe('T-0018-DLG-08: タイトルが空の場合', () => {
    // 【テスト目的】: タイトル検証を確認
    // 【テスト内容】: titleプロパティが空文字列の場合の動作を検証
    // 【期待される動作】: エラーをスローする、またはデフォルトタイトルを表示する
    // 🟡 信頼性レベル: Phase 2要件定義書から推測

    test('タイトルが空の場合にエラーが発生する', () => {
      // 【テストデータ準備】: 空のタイトルを含む不正な設定を用意
      // 【実際の処理実行】: 空のタイトルでダイアログ生成を試みる

      // 【結果検証】: エラーがスローされることを確認
      expect(() => {
        new Dialog(scene, 640, 360, {
          title: '',
          content: 'メッセージ',
          type: DialogType.INFO,
          actions: [{ label: '閉じる', type: ButtonType.PRIMARY, callback: mockClose }],
        });
      }).toThrow(); // 🟡
    });
  });

  describe('T-0018-DLG-09: actionsが空配列の場合', () => {
    // 【テスト目的】: ボタンの存在を確認
    // 【テスト内容】: actionsプロパティが空配列の場合の動作を検証
    // 【期待される動作】: エラーをスローする、またはデフォルトボタンを追加する
    // 🟡 信頼性レベル: Phase 2要件定義書から推測

    test('actionsが空配列の場合にエラーが発生する', () => {
      // 【テストデータ準備】: 空のactions配列を含む不正な設定を用意
      // 【実際の処理実行】: 空のactionsでダイアログ生成を試みる

      // 【結果検証】: エラーがスローされることを確認
      expect(() => {
        new Dialog(scene, 640, 360, {
          title: '通知',
          content: 'メッセージ',
          actions: [],
        });
      }).toThrow(); // 🟡
    });
  });

  describe('T-0018-DLG-10: 既に表示中のダイアログをshow()で呼ぶ', () => {
    // 【テスト目的】: 多重表示防止を確認
    // 【テスト内容】: 既に表示されているダイアログに対してshow()を再度呼ぶ動作を検証
    // 【期待される動作】: 2回目のshow()呼び出しは無視される
    // 🟡 信頼性レベル: Phase 2要件定義書 セクション 4.3.2 にエッジケースとして記載

    test('既に表示中のダイアログをshow()しても2回目は無視される', () => {
      // 【テストデータ準備】: ダイアログを生成
      const dialog = new Dialog(scene, 640, 360, {
        title: '情報',
        content: 'メッセージ',
        type: DialogType.INFO,
        actions: [{ label: '閉じる', type: ButtonType.PRIMARY, callback: mockClose }],
      });

      // 【実際の処理実行】: show()を2回呼び出す
      mockDialog.visible = false;
      dialog.show();
      mockDialog.visible = true;
      dialog.show();

      // 【結果検証】: popUpが1回だけ呼ばれたことを確認（2回目は無視される）
      expect(mockDialog.popUp).toHaveBeenCalledTimes(1); // 🟡
    });
  });

  describe('T-0018-DLG-11: 最小幅のダイアログ生成', () => {
    // 【テスト目的】: 最小サイズでの動作を確認
    // 【テスト内容】: ダイアログの最小サイズを設定し、レイアウトが崩れないことを検証
    // 【期待される動作】: ダイアログが最小幅で生成される
    // 🟡 信頼性レベル: Phase 2要件定義書から推測

    test('最小幅のダイアログが正しく生成される', () => {
      // 【テストデータ準備】: 最小幅を指定したダイアログ設定を用意
      new Dialog(scene, 640, 360, {
        title: 'OK',
        content: 'OK',
        width: 200,
        actions: [{ label: 'OK', type: ButtonType.PRIMARY, callback: mockClose }],
      });

      // 【結果検証】: ダイアログが生成されることを確認
      expect(scene.rexUI.add.dialog).toHaveBeenCalled(); // 🟡
    });
  });

  describe('T-0018-DLG-12: 長いメッセージのダイアログ生成', () => {
    // 【テスト目的】: 長いメッセージでのレイアウトを確認
    // 【テスト内容】: 長いメッセージでもレイアウトが崩れないことを検証
    // 【期待される動作】: テキストが適切にスクロールまたは折り返される
    // 🟡 信頼性レベル: Phase 2要件定義書から推測

    test('長いメッセージのダイアログが正しく生成される', () => {
      // 【テストデータ準備】: 非常に長いメッセージを含むダイアログ設定を用意
      const longMessage = 'これは非常に長いメッセージです。'.repeat(20);
      new Dialog(scene, 640, 360, {
        title: '情報',
        content: longMessage,
        actions: [{ label: '閉じる', type: ButtonType.PRIMARY, callback: mockClose }],
      });

      // 【結果検証】: ダイアログが生成されることを確認
      expect(scene.rexUI.add.dialog).toHaveBeenCalled(); // 🟡
    });
  });

  describe('T-0018-DLG-13: 多数のアクションボタン', () => {
    // 【テスト目的】: 多数のボタンでのレイアウトを確認
    // 【テスト内容】: 多数のボタンを含むダイアログでもレイアウトが崩れないことを検証
    // 【期待される動作】: ボタンが適切に配置される
    // 🟡 信頼性レベル: Phase 2要件定義書から推測

    test('10個のアクションボタンを持つダイアログが正しく生成される', () => {
      // 【テストデータ準備】: 10個のアクションボタンを含むダイアログ設定を用意
      const mockCallbacks = Array.from({ length: 10 }, () => vi.fn());
      const actions = Array.from({ length: 10 }, (_, i) => ({
        label: `オプション${i + 1}`,
        type: ButtonType.SECONDARY,
        callback: mockCallbacks[i],
      }));

      new Dialog(scene, 640, 360, {
        title: '選択',
        content: '以下から選択してください',
        actions,
      });

      // 【結果検証】: ダイアログが生成されることを確認
      expect(scene.rexUI.add.dialog).toHaveBeenCalled(); // 🟡

      // 【確認内容】: 10個のボタンが生成されたことを確認
      expect(scene.rexUI.add.label).toHaveBeenCalledTimes(10); // 🟡
    });
  });
});
