/**
 * BaseComponentのテスト
 * TASK-0018 共通UIコンポーネント基盤
 *
 * @description
 * T-0018-BASE-01: コンストラクタの初期化検証
 * T-0018-BASE-02: setVisibleメソッドの検証
 * T-0018-BASE-03: setPositionメソッドの検証
 * T-0018-BASE-04: 抽象メソッドの存在確認
 * T-0018-BASE-05: メソッドチェーンの検証
 */

import type Phaser from 'phaser';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { BaseComponent } from './BaseComponent';

// テスト用の具象クラス
class TestComponent extends BaseComponent {
  create(): void {
    // テスト用の空実装
  }

  destroy(): void {
    // テスト用の空実装
  }
}

describe('BaseComponent', () => {
  let scene: Phaser.Scene;
  let component: TestComponent;

  beforeEach(() => {
    // 【テスト前準備】: 各テスト実行前にPhaserシーンとコンポーネントを初期化し、一貫したテスト条件を保証
    // 【環境初期化】: 前のテストの影響を受けないよう、新しいシーンとコンポーネントインスタンスを生成

    // Phaserシーンのモックを作成
    scene = {
      add: {
        container: vi.fn().mockReturnValue({
          setVisible: vi.fn().mockReturnThis(),
          setPosition: vi.fn().mockReturnThis(),
          x: 0,
          y: 0,
          visible: true,
        }),
      },
      rexUI: {}, // rexUIプラグインのモック
    } as unknown as Phaser.Scene;

    component = new TestComponent(scene, 100, 200);
  });

  describe('T-0018-BASE-01: コンストラクタの初期化検証', () => {
    // 【テスト目的】: BaseComponentが正しく初期化されることを確認
    // 【テスト内容】: scene、container、rexUIプロパティが正しく設定され、containerの座標が指定した値に設定されることを検証
    // 【期待される動作】: すべてのプロパティが正しく初期化される
    // 🔵 信頼性レベル: タスク定義（TASK-0018.md）に明記

    test('scene プロパティが正しく設定されている', () => {
      // 【確認内容】: コンストラクタで渡されたsceneが、インスタンスのsceneプロパティに設定されていることを確認
      expect(component['scene']).toBe(scene); // 🔵
    });

    test('container が作成されている', () => {
      // 【確認内容】: Phaserのcontainerが正しく作成され、add.containerメソッドが呼ばれたことを確認
      expect(scene.add.container).toHaveBeenCalledWith(100, 200); // 🔵
      expect(component['container']).toBeDefined(); // 🔵
    });

    test('rexUI プラグインへの参照が設定されている', () => {
      // 【確認内容】: シーンのrexUIプラグインへの参照が、コンポーネントのrexUIプロパティに設定されていることを確認
      expect(component['rexUI']).toBe(scene.rexUI); // 🔵
    });

    test('container の座標が指定した値に設定されている', () => {
      // 【確認内容】: コンストラクタで指定したx, y座標でcontainerが作成されたことを確認
      expect(scene.add.container).toHaveBeenCalledWith(100, 200); // 🔵
    });
  });

  describe('T-0018-BASE-02: setVisibleメソッドの検証', () => {
    // 【テスト目的】: 可視性の制御が正しく動作することを確認
    // 【テスト内容】: setVisible(true/false)でcontainerの可視性が変更され、メソッドチェーンが可能であることを検証
    // 【期待される動作】: 可視性が正しく制御され、メソッドチェーンが可能
    // 🔵 信頼性レベル: タスク定義（TASK-0018.md）に明記

    test('setVisible(true) で container が表示される', () => {
      // 【確認内容】: setVisible(true)を呼び出すと、containerのsetVisibleメソッドがtrueで呼ばれることを確認
      const result = component.setVisible(true);
      expect(component['container'].setVisible).toHaveBeenCalledWith(true); // 🔵
    });

    test('setVisible(false) で container が非表示になる', () => {
      // 【確認内容】: setVisible(false)を呼び出すと、containerのsetVisibleメソッドがfalseで呼ばれることを確認
      const result = component.setVisible(false);
      expect(component['container'].setVisible).toHaveBeenCalledWith(false); // 🔵
    });

    test('setVisible はthisを返す（メソッドチェーン可能）', () => {
      // 【確認内容】: setVisibleメソッドが自身（this）を返すことで、メソッドチェーンが可能であることを確認
      const result = component.setVisible(true);
      expect(result).toBe(component); // 🔵
    });
  });

  describe('T-0018-BASE-03: setPositionメソッドの検証', () => {
    // 【テスト目的】: 位置の変更が正しく動作することを確認
    // 【テスト内容】: setPosition(x, y)でcontainerの座標が変更され、メソッドチェーンが可能であることを検証
    // 【期待される動作】: 位置が正しく変更され、メソッドチェーンが可能
    // 🔵 信頼性レベル: タスク定義（TASK-0018.md）に明記

    test('setPosition(x, y) で container の座標が変更される', () => {
      // 【確認内容】: setPosition(x, y)を呼び出すと、containerのsetPositionメソッドが指定した座標で呼ばれることを確認
      const result = component.setPosition(300, 400);
      expect(component['container'].setPosition).toHaveBeenCalledWith(300, 400); // 🔵
    });

    test('setPosition はthisを返す（メソッドチェーン可能）', () => {
      // 【確認内容】: setPositionメソッドが自身（this）を返すことで、メソッドチェーンが可能であることを確認
      const result = component.setPosition(300, 400);
      expect(result).toBe(component); // 🔵
    });
  });

  describe('T-0018-BASE-04: 抽象メソッドの存在確認', () => {
    // 【テスト目的】: 抽象メソッドが定義されていることを確認
    // 【テスト内容】: create/destroyメソッドが抽象メソッドとして定義されていることを型レベルで確認
    // 【期待される動作】: サブクラスで実装が必須となる
    // 🔵 信頼性レベル: タスク定義（TASK-0018.md）に明記

    test('create メソッドが存在する', () => {
      // 【確認内容】: サブクラスでcreateメソッドが実装されていることを確認（抽象メソッドの実装確認）
      expect(component.create).toBeDefined(); // 🔵
      expect(typeof component.create).toBe('function'); // 🔵
    });

    test('destroy メソッドが存在する', () => {
      // 【確認内容】: サブクラスでdestroyメソッドが実装されていることを確認（抽象メソッドの実装確認）
      expect(component.destroy).toBeDefined(); // 🔵
      expect(typeof component.destroy).toBe('function'); // 🔵
    });

    test('create メソッドが呼び出し可能である', () => {
      // 【確認内容】: createメソッドが実際に呼び出せることを確認
      expect(() => component.create()).not.toThrow(); // 🔵
    });

    test('destroy メソッドが呼び出し可能である', () => {
      // 【確認内容】: destroyメソッドが実際に呼び出せることを確認
      expect(() => component.destroy()).not.toThrow(); // 🔵
    });
  });

  describe('T-0018-BASE-05: メソッドチェーンの検証', () => {
    // 【テスト目的】: 複数のメソッドを連続して呼び出せることを確認
    // 【テスト内容】: setVisible().setPosition()のようなメソッドチェーンが動作することを検証
    // 【期待される動作】: メソッドチェーンが正しく動作する
    // 🟡 信頼性レベル: Fluent Interfaceパターンから推測

    test('setVisible().setPosition() のメソッドチェーンが動作する', () => {
      // 【確認内容】: setVisibleとsetPositionを連続して呼び出せることを確認
      const result = component.setVisible(true).setPosition(500, 600);
      expect(result).toBe(component); // 🟡
      expect(component['container'].setVisible).toHaveBeenCalledWith(true); // 🟡
      expect(component['container'].setPosition).toHaveBeenCalledWith(500, 600); // 🟡
    });

    test('setPosition().setVisible() のメソッドチェーンが動作する', () => {
      // 【確認内容】: setPositionとsetVisibleを連続して呼び出せることを確認（順序を変えても動作）
      const result = component.setPosition(700, 800).setVisible(false);
      expect(result).toBe(component); // 🟡
      expect(component['container'].setPosition).toHaveBeenCalledWith(700, 800); // 🟡
      expect(component['container'].setVisible).toHaveBeenCalledWith(false); // 🟡
    });

    test('複数回のメソッドチェーンが動作する', () => {
      // 【確認内容】: 3回以上のメソッドチェーンが動作することを確認
      const result = component.setPosition(100, 200).setVisible(true).setPosition(300, 400);
      expect(result).toBe(component); // 🟡
    });
  });
});
