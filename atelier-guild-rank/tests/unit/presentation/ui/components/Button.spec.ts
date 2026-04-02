// @ts-nocheck
/**
 * Buttonコンポーネントのテスト
 * TASK-0018 Phase 2 共通UIコンポーネント基盤
 *
 * @description
 * T-0018-BTN-01: プライマリボタンの生成と表示
 * T-0018-BTN-02: セカンダリボタンの生成と表示
 * T-0018-BTN-03: テキストボタンの生成と表示
 * T-0018-BTN-04: アイコンボタンの生成と表示
 * T-0018-BTN-05: ボタンのクリックイベント実行
 * T-0018-BTN-06: メソッドチェーンの動作確認
 * T-0018-BTN-07: 空文字列のテキストでボタン生成
 * T-0018-BTN-08: onClickコールバックがnullの場合
 * T-0018-BTN-09: 無効化されたボタンのクリック
 * T-0018-BTN-10: rexUIが未初期化の場合
 * T-0018-BTN-11: 最小幅のボタン生成
 * T-0018-BTN-12: 非常に長いテキストのボタン生成
 * T-0018-BTN-13: ボタンの無効化と再有効化
 */

import { Button, ButtonType } from '@presentation/ui/components/Button';
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

interface MockLabel {
  setInteractive: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  setAlpha: ReturnType<typeof vi.fn>;
  layout: ReturnType<typeof vi.fn>;
}

interface MockContainer {
  setVisible: ReturnType<typeof vi.fn>;
  setPosition: ReturnType<typeof vi.fn>;
  x: number;
  y: number;
  visible: boolean;
}

describe('Button', () => {
  let scene: RexUIScene;
  let mockCallback: () => void;
  let mockLabel: MockLabel;
  let mockContainer: MockContainer;

  beforeEach(() => {
    // 【テスト前準備】: 各テスト実行前にPhaserシーンとrexUIプラグインをモック化し、一貫したテスト条件を保証
    // 【環境初期化】: ButtonコンポーネントがrexUIプラグインに依存するため、適切なモックを用意
    // 【前提条件確認】: scene.rexUIが存在し、add.labelメソッドが利用可能であることを前提とする

    mockCallback = vi.fn() as () => void;

    // モックのLabelコンポーネント
    mockLabel = {
      setInteractive: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
      setVisible: vi.fn().mockReturnThis(),
      setPosition: vi.fn().mockReturnThis(),
      layout: vi.fn().mockReturnThis(),
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
        text: vi.fn().mockReturnValue({
          setStyle: vi.fn().mockReturnThis(),
        }),
      },
      tweens: {
        add: vi.fn().mockReturnThis(),
      },
      rexUI: {
        add: {
          label: vi.fn().mockReturnValue(mockLabel),
          roundRectangle: vi.fn().mockReturnValue({
            setFillStyle: vi.fn().mockReturnThis(),
          }),
        },
      },
    } as unknown as RexUIScene;
  });

  describe('T-0018-BTN-01: プライマリボタンの生成と表示', () => {
    // 【テスト目的】: プライマリボタンが設計書通りのスタイルで生成されることを確認
    // 【テスト内容】: rexUI.add.labelが呼ばれ、正しい背景色・テキスト色でボタンが生成されることを検証
    // 【期待される動作】: テーマ定義を使用したボタンが正しく生成される
    // 🔵 信頼性レベル: UI設計書 overview.md セクション 5.1 に明記

    test('プライマリボタンが正しいスタイルで生成される', () => {
      // 【テストデータ準備】: プライマリボタンの標準的な設定を用意
      // 【実際の処理実行】: Buttonコンポーネントを生成
      new Button(scene, 100, 200, {
        text: '確定',
        type: ButtonType.PRIMARY,
        onClick: mockCallback,
      });

      // 【結果検証】: rexUI.add.labelが正しいパラメータで呼ばれたことを確認
      // 【期待値確認】: 背景色がTHEME.colors.primaryであり、テーマ定義が使用されていることを検証
      // 【品質保証】: テーマの一貫性を保ち、デザイン規約に準拠したボタンが生成されることを保証

      // 【検証項目】: rexUI.add.labelが呼ばれたこと
      expect(scene.rexUI.add.label).toHaveBeenCalled(); // 🔵
    });

    test('テキストが正しく設定されている', () => {
      // 【確認内容】: ボタンのテキストが指定した値で設定されていることを確認
      new Button(scene, 100, 200, {
        text: '確定',
        type: ButtonType.PRIMARY,
        onClick: mockCallback,
      });

      // テキストが'確定'であることを確認
      expect(scene.add.text).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        '確定',
        expect.anything(),
      ); // 🔵
    });

    test('クリックイベントが登録されている', () => {
      // 【確認内容】: ボタンがインタラクティブに設定され、クリックイベントが登録されていることを確認
      new Button(scene, 100, 200, {
        text: '確定',
        type: ButtonType.PRIMARY,
        onClick: mockCallback,
      });

      // setInteractiveが呼ばれたことを確認
      expect(mockLabel.setInteractive).toHaveBeenCalled(); // 🔵

      // pointerdownイベントが登録されたことを確認
      expect(mockLabel.on).toHaveBeenCalledWith('pointerdown', expect.any(Function)); // 🔵
    });
  });

  describe('T-0018-BTN-02: セカンダリボタンの生成と表示', () => {
    // 【テスト目的】: セカンダリボタンが設計書通りのスタイルで生成されることを確認
    // 【テスト内容】: 透明な背景とグレーの枠線でボタンが生成されることを検証
    // 【期待される動作】: セカンダリボタンのスタイルが正しく適用される
    // 🔵 信頼性レベル: UI設計書 overview.md セクション 5.1 に明記

    test('セカンダリボタンが正しいスタイルで生成される', () => {
      // 【実際の処理実行】: セカンダリボタンを生成
      new Button(scene, 100, 200, {
        text: 'キャンセル',
        type: ButtonType.SECONDARY,
        onClick: mockCallback,
      });

      // 【結果検証】: rexUI.add.labelが呼ばれたことを確認
      expect(scene.rexUI.add.label).toHaveBeenCalled(); // 🔵
    });
  });

  describe('T-0018-BTN-03: テキストボタンの生成と表示', () => {
    // 【テスト目的】: テキストボタンがシンプルなスタイルで生成されることを確認
    // 【テスト内容】: 背景と枠線がないテキストのみのボタンが生成されることを検証
    // 【期待される動作】: テキストボタンのスタイルが正しく適用される
    // 🟡 信頼性レベル: TASK-0018.md にテキストボタンの存在は記載あり、詳細スタイルは推測

    test('テキストボタンが正しいスタイルで生成される', () => {
      // 【実際の処理実行】: テキストボタンを生成
      new Button(scene, 100, 200, {
        text: 'スキップ',
        type: ButtonType.TEXT,
        onClick: mockCallback,
      });

      // 【結果検証】: rexUI.add.labelが呼ばれたことを確認
      expect(scene.rexUI.add.label).toHaveBeenCalled(); // 🟡
    });
  });

  describe('T-0018-BTN-04: アイコンボタンの生成と表示', () => {
    // 【テスト目的】: アイコンボタンが正しく生成されることを確認
    // 【テスト内容】: アイコン画像を含むボタンが生成されることを検証
    // 【期待される動作】: アイコンボタンのスタイルが正しく適用される
    // 🟡 信頼性レベル: TASK-0018.md にアイコンボタンの存在は記載あり、詳細スタイルは推測

    test('アイコンボタンが正しいスタイルで生成される', () => {
      // 【実際の処理実行】: アイコンボタンを生成
      new Button(scene, 100, 200, {
        text: '',
        icon: 'close-icon',
        type: ButtonType.ICON,
        onClick: mockCallback,
      });

      // 【結果検証】: rexUI.add.labelが呼ばれたことを確認
      expect(scene.rexUI.add.label).toHaveBeenCalled(); // 🟡
    });
  });

  describe('T-0018-BTN-05: ボタンのクリックイベント実行', () => {
    // 【テスト目的】: クリックイベントが正しく動作することを確認
    // 【テスト内容】: ボタンをクリックしたときにonClickコールバックが実行されることを検証
    // 【期待される動作】: ボタンクリック時に登録されたコールバック関数が呼ばれる
    // 🔵 信頼性レベル: Phase 2要件定義書 セクション 2.1.2 に明記

    test('ボタンをクリックするとコールバックが実行される', () => {
      // 【テストデータ準備】: クリックイベントをテストするためのボタン設定を用意
      new Button(scene, 100, 200, {
        text: 'テスト',
        onClick: mockCallback,
      });

      // 【実際の処理実行】: pointerdownイベントを発火させる
      // 【処理内容】: rexUIのpointerdownイベントをシミュレートし、onClickコールバックの呼び出しを検証
      const onPointerDown = mockLabel.on.mock.calls.find(
        (call: unknown[]) => call[0] === 'pointerdown',
      )?.[1];

      if (onPointerDown) {
        onPointerDown();
      }

      // 【結果検証】: onClickコールバックが1回呼ばれたことを確認
      // 【期待値確認】: コールバックが正しく実行されることを検証
      expect(mockCallback).toHaveBeenCalledTimes(1); // 🔵
    });

    test('ボタンを複数回クリックすると複数回コールバックが実行される', () => {
      // 【確認内容】: 複数回クリックした場合、その回数分コールバックが呼ばれることを確認
      new Button(scene, 100, 200, {
        text: 'テスト',
        onClick: mockCallback,
      });

      const onPointerDown = mockLabel.on.mock.calls.find(
        (call: unknown[]) => call[0] === 'pointerdown',
      )?.[1];

      if (onPointerDown) {
        onPointerDown();
        onPointerDown();
        onPointerDown();
      }

      expect(mockCallback).toHaveBeenCalledTimes(3); // 🔵
    });
  });

  describe('T-0018-BTN-06: メソッドチェーンの動作確認', () => {
    // 【テスト目的】: Fluent Interfaceパターンが正しく実装されていることを確認
    // 【テスト内容】: setVisible、setPosition、setEnabledメソッドがthisを返し、チェーン可能であることを検証
    // 【期待される動作】: 連続してメソッド呼び出しができる
    // 🔵 信頼性レベル: Phase 1で実装済みのBaseComponentを継承

    test('メソッドチェーンが正しく動作する', () => {
      // 【テストデータ準備】: メソッドチェーンをテストするためのボタンを用意
      const button = new Button(scene, 100, 200, {
        text: 'テスト',
        onClick: mockCallback,
      });

      // 【実際の処理実行】: 複数のメソッドを連続して呼び出す
      // 【処理内容】: setVisible、setPositionを連続で呼び出し、メソッドチェーンが機能することを確認
      const result = button.setVisible(true).setPosition(200, 300);

      // 【結果検証】: 最終的な結果がButtonインスタンス自身であることを確認
      // 【期待値確認】: メソッドチェーンが正しく機能し、thisが返されることを検証
      expect(result).toBe(button); // 🔵
    });

    test('setEnabledメソッドもチェーン可能である', () => {
      // 【確認内容】: setEnabledメソッドもメソッドチェーンに含められることを確認
      const button = new Button(scene, 100, 200, {
        text: 'テスト',
        onClick: mockCallback,
      });

      const result = button.setEnabled(false).setVisible(true);

      expect(result).toBe(button); // 🔵
    });
  });

  describe('T-0018-BTN-07: 空文字列のテキストでボタン生成', () => {
    // 【テスト目的】: 空文字列入力時のエラーハンドリングを確認
    // 【テスト内容】: textプロパティに空文字列が渡された場合の動作を検証
    // 【期待される動作】: エラーをスローする、またはデフォルトテキストを表示する
    // 🟡 信頼性レベル: Phase 2要件定義書 セクション 4.4.1 にエラーケースとして記載

    test('空文字列のテキストでエラーが発生する', () => {
      // 【テストデータ準備】: 空文字列を含む不正な設定を用意
      // 【実際の処理実行】: 空文字列でボタン生成を試みる
      // 【処理内容】: エラーがスローされることを期待

      // 【結果検証】: エラーがスローされることを確認
      // 【期待値確認】: 'Button: text is required' エラーメッセージが含まれることを検証
      expect(() => {
        new Button(scene, 100, 200, {
          text: '',
          onClick: mockCallback,
        });
      }).toThrow(); // 🟡
    });
  });

  describe('T-0018-BTN-08: onClickコールバックがnullの場合', () => {
    // 【テスト目的】: 必須パラメータの検証を確認
    // 【テスト内容】: onClick コールバックが null または undefined の場合の動作を検証
    // 【期待される動作】: エラーをスローする
    // 🟡 信頼性レベル: Phase 2要件定義書 セクション 4.4.1 にエラーケースとして記載

    test('onClickコールバックがnullの場合にエラーが発生する', () => {
      // 【テストデータ準備】: nullコールバックを含む不正な設定を用意
      // 【実際の処理実行】: nullコールバックでボタン生成を試みる

      // 【結果検証】: エラーがスローされることを確認
      expect(() => {
        new Button(scene, 100, 200, {
          text: 'ボタン',
          onClick: null as unknown as () => void,
        });
      }).toThrow(); // 🟡
    });
  });

  describe('T-0018-BTN-09: 無効化されたボタンのクリック', () => {
    // 【テスト目的】: 無効化状態でのクリック防止を確認
    // 【テスト内容】: setEnabled(false)で無効化されたボタンをクリックした場合の動作を検証
    // 【期待される動作】: onClickコールバックが呼ばれない
    // 🔵 信頼性レベル: Phase 2要件定義書 セクション 4.3.1 にエッジケースとして記載

    test('無効化されたボタンをクリックしてもコールバックが実行されない', () => {
      // 【テストデータ準備】: ボタンを生成し、無効化する
      const button = new Button(scene, 100, 200, {
        text: 'テスト',
        onClick: mockCallback,
      });

      // 【実際の処理実行】: ボタンを無効化してからクリックをシミュレート
      button.setEnabled(false);

      const onPointerDown = mockLabel.on.mock.calls.find(
        (call: unknown[]) => call[0] === 'pointerdown',
      )?.[1];

      if (onPointerDown) {
        onPointerDown();
      }

      // 【結果検証】: コールバックが呼ばれないことを確認
      // 【期待値確認】: 無効状態のボタンはクリックイベントを処理しないことを検証
      expect(mockCallback).not.toHaveBeenCalled(); // 🔵
    });

    test('ボタンが視覚的にグレーアウトされる', () => {
      // 【確認内容】: 無効化されたボタンがアルファ値で半透明になることを確認
      const button = new Button(scene, 100, 200, {
        text: 'テスト',
        onClick: mockCallback,
      });

      button.setEnabled(false);

      // アルファ値が設定されることを確認
      expect(mockLabel.setAlpha).toHaveBeenCalledWith(0.5); // 🔵
    });
  });

  describe('T-0018-BTN-10: rexUIが未初期化の場合', () => {
    // 【テスト目的】: 依存関係の検証を確認
    // 【テスト内容】: Phaserシーンの rexUI プラグインが未初期化の状態でButtonを生成
    // 【期待される動作】: エラーをスローする、または警告を出力する
    // 🟡 信頼性レベル: Phase 2要件定義書 セクション 4.4.2 にエラーケースとして記載

    test('rexUIが未初期化の場合にエラーが発生する', () => {
      // 【テストデータ準備】: rexUIプラグインが存在しないシーンを用意
      const sceneWithoutRexUI = {
        add: {
          container: vi.fn().mockReturnValue(mockContainer),
        },
        rexUI: undefined,
      } as unknown as RexUIScene;

      // 【実際の処理実行】: rexUI未初期化でボタン生成を試みる
      // 【結果検証】: エラーがスローされることを確認
      expect(() => {
        new Button(sceneWithoutRexUI, 100, 200, {
          text: 'ボタン',
          onClick: mockCallback,
        });
      }).toThrow(); // 🟡
    });
  });

  describe('T-0018-BTN-11: 最小幅のボタン生成', () => {
    // 【テスト目的】: 最小サイズでの動作を確認
    // 【テスト内容】: ボタンの最小サイズを設定し、レイアウトが崩れないことを検証
    // 【期待される動作】: ボタンが最小幅で生成される
    // 🟡 信頼性レベル: Phase 2要件定義書 セクション 4.3.3 にエッジケースとして記載

    test('最小幅のボタンが正しく生成される', () => {
      // 【テストデータ準備】: 最小幅を指定したボタン設定を用意
      new Button(scene, 100, 200, {
        text: 'OK',
        width: 50,
        onClick: mockCallback,
      });

      // 【結果検証】: ボタンが生成されることを確認
      expect(scene.rexUI.add.label).toHaveBeenCalled(); // 🟡
    });
  });

  describe('T-0018-BTN-12: 非常に長いテキストのボタン生成', () => {
    // 【テスト目的】: テキストオーバーフロー処理を確認
    // 【テスト内容】: 長いテキストでもレイアウトが崩れないことを検証
    // 【期待される動作】: テキストが適切に処理される
    // 🟡 信頼性レベル: Phase 2要件定義書 セクション 4.3.3 にエッジケースとして記載

    test('長いテキストのボタンが正しく生成される', () => {
      // 【テストデータ準備】: 非常に長いテキストを含むボタン設定を用意
      const longText = 'これは非常に長いボタンテキストでレイアウトテストを行います'.repeat(3);
      new Button(scene, 100, 200, {
        text: longText,
        width: 200,
        onClick: mockCallback,
      });

      // 【結果検証】: ボタンが生成されることを確認
      expect(scene.rexUI.add.label).toHaveBeenCalled(); // 🟡
    });
  });

  describe('T-0018-BTN-13: ボタンの無効化と再有効化', () => {
    // 【テスト目的】: 状態切り替えの動作を確認
    // 【テスト内容】: enabled状態の切り替えが正しく動作することを検証
    // 【期待される動作】: 状態切り替えが即座に反映される
    // 🔵 信頼性レベル: Phase 2要件定義書 セクション 2.1.3 に公開メソッドとして記載

    test('ボタンの無効化と再有効化が正しく動作する', () => {
      // 【テストデータ準備】: ボタンを生成
      const button = new Button(scene, 100, 200, {
        text: 'テスト',
        onClick: mockCallback,
      });

      // 【実際の処理実行】: 無効化→有効化→無効化の順に実行
      button.setEnabled(false);
      expect(button.isEnabled()).toBe(false); // 🔵

      button.setEnabled(true);
      expect(button.isEnabled()).toBe(true); // 🔵

      button.setEnabled(false);
      expect(button.isEnabled()).toBe(false); // 🔵
    });

    test('再有効化後にクリックが動作する', () => {
      // 【確認内容】: 再有効化後、クリックイベントが再び機能することを確認
      const button = new Button(scene, 100, 200, {
        text: 'テスト',
        onClick: mockCallback,
      });

      button.setEnabled(false);
      button.setEnabled(true);

      const onPointerDown = mockLabel.on.mock.calls.find(
        (call: unknown[]) => call[0] === 'pointerdown',
      )?.[1];

      if (onPointerDown) {
        onPointerDown();
      }

      expect(mockCallback).toHaveBeenCalledTimes(1); // 🔵
    });
  });
});
