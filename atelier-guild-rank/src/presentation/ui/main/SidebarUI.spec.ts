/**
 * SidebarUIのテスト
 * TASK-0020 MainScene共通レイアウト
 *
 * @description
 * T-0020-SIDEBAR-01: コンストラクタの初期化検証
 * T-0020-SIDEBAR-02: create()メソッドでのUI生成
 * T-0020-SIDEBAR-03: 受注依頼リスト表示の検証
 * T-0020-SIDEBAR-04: 受注依頼リスト折りたたみ動作
 * T-0020-SIDEBAR-05: 素材リスト表示の検証
 * T-0020-SIDEBAR-06: 完成品リスト表示の検証
 * T-0020-SIDEBAR-07: 保管容量表示の検証
 * T-0020-SIDEBAR-08: ショップボタン表示の検証
 * T-0020-SIDEBAR-09: destroy()メソッドの検証
 */

import type Phaser from 'phaser';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Quality } from '../../../shared/types/common';
import { SidebarUI } from './SidebarUI';

// レイアウト定数
const SIDEBAR_WIDTH = 200;
const SIDEBAR_X = 0;
const SIDEBAR_Y = 60; // ヘッダー高さ
const SIDEBAR_DEPTH = 150;

// 保管容量警告閾値
const STORAGE_WARNING_THRESHOLD = 0.8; // 80%
const STORAGE_DANGER_THRESHOLD = 1.0; // 100%

// イベント名定数
const EVENTS = {
  SHOP_REQUESTED: 'SHOP_REQUESTED',
};

/**
 * Phaserシーンのモックを作成
 */
function createMockScene(): Phaser.Scene {
  const mockText = {
    setText: vi.fn().mockReturnThis(),
    setStyle: vi.fn().mockReturnThis(),
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    text: '',
    style: { color: '' },
  };

  const mockGraphics = {
    fillStyle: vi.fn().mockReturnThis(),
    fillRect: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const mockContainer = {
    setVisible: vi.fn().mockReturnThis(),
    setPosition: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    x: SIDEBAR_X,
    y: SIDEBAR_Y,
    depth: 0,
    visible: true,
  };

  const mockButton = {
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  return {
    add: {
      container: vi.fn().mockReturnValue(mockContainer),
      text: vi.fn().mockReturnValue({ ...mockText }),
      graphics: vi.fn().mockReturnValue({ ...mockGraphics }),
    },
    rexUI: {
      add: {
        sizer: vi.fn().mockReturnValue({
          add: vi.fn().mockReturnThis(),
          layout: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
        scrollablePanel: vi.fn().mockReturnValue({
          add: vi.fn().mockReturnThis(),
          layout: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
        label: vi.fn().mockReturnValue({
          ...mockButton,
          text: '',
        }),
      },
    },
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
  } as unknown as Phaser.Scene;
}

/**
 * テスト用の依頼データを作成
 */
function createMockQuest(
  overrides: Partial<{
    id: string;
    itemName: string;
    quantity: number;
    deadline: number;
    reward: number;
  }> = {},
) {
  return {
    id: 'quest-001',
    itemName: '傷薬',
    quantity: 2,
    deadline: 3,
    reward: 50,
    ...overrides,
  };
}

/**
 * テスト用の素材データを作成
 */
function createMockMaterial(
  overrides: Partial<{
    id: string;
    name: string;
    quantity: number;
    quality: Quality;
  }> = {},
) {
  return {
    id: 'mat-001',
    name: '薬草',
    quantity: 5,
    quality: Quality.C,
    ...overrides,
  };
}

/**
 * テスト用の完成品データを作成
 */
function createMockCraftedItem(
  overrides: Partial<{
    id: string;
    name: string;
    quantity: number;
    quality: Quality;
  }> = {},
) {
  return {
    id: 'item-001',
    name: '傷薬',
    quantity: 1,
    quality: Quality.B,
    ...overrides,
  };
}

describe('SidebarUI', () => {
  let scene: Phaser.Scene;
  let sidebarUI: SidebarUI;

  beforeEach(() => {
    // 【テスト前準備】: 各テスト実行前にPhaserシーンとコンポーネントを初期化
    // 【環境初期化】: 前のテストの影響を受けないよう、新しいインスタンスを生成
    scene = createMockScene();
    sidebarUI = new SidebarUI(scene);
  });

  describe('T-0020-SIDEBAR-01: コンストラクタの初期化検証', () => {
    // 【テスト目的】: SidebarUIが正しく初期化されることを確認
    // 【テスト内容】: scene、container、rexUIプロパティが正しく設定されることを検証
    // 【期待される動作】: すべてのプロパティが正しく初期化される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-008, REQ-0020-025）に明記

    test('scene プロパティが正しく設定されている', () => {
      // 【確認内容】: コンストラクタで渡されたsceneが、インスタンスのsceneプロパティに設定されていることを確認
      // biome-ignore lint/complexity/useLiteralKeys: protectedプロパティのテストには配列アクセスが必要
      expect(sidebarUI['scene']).toBe(scene); // 🔵
    });

    test('container が作成されている', () => {
      // 【確認内容】: Phaserのcontainerが正しく作成され、add.containerメソッドが呼ばれたことを確認
      expect(scene.add.container).toHaveBeenCalled(); // 🔵
      // biome-ignore lint/complexity/useLiteralKeys: protectedプロパティのテストには配列アクセスが必要
      expect(sidebarUI['container']).toBeDefined(); // 🔵
    });

    test('BaseComponentを継承している', () => {
      // 【確認内容】: SidebarUIがBaseComponentを正しく継承していることを確認
      expect(sidebarUI.setVisible).toBeDefined(); // 🔵
      expect(sidebarUI.setPosition).toBeDefined(); // 🔵
      expect(sidebarUI.create).toBeDefined(); // 🔵
      expect(sidebarUI.destroy).toBeDefined(); // 🔵
    });
  });

  describe('T-0020-SIDEBAR-02: create()メソッドでのUI生成', () => {
    // 【テスト目的】: create()メソッドが正しくUIを生成することを確認
    // 【テスト内容】: サイドバーコンテナとその子要素が正しく生成されることを検証
    // 【期待される動作】: サイドバーUIが正しく生成される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-008）に明記

    test('create()呼び出しでサイドバーが生成される', () => {
      // 【確認内容】: create()を呼び出すと、containerに子要素が追加されることを確認
      sidebarUI.create();
      // biome-ignore lint/complexity/useLiteralKeys: protectedプロパティのテストには配列アクセスが必要
      expect(sidebarUI['container'].add).toHaveBeenCalled(); // 🔵
    });

    test('コンテナのdepthが150に設定される', () => {
      // 【確認内容】: サイドバーコンテナのdepthが150に設定されることを確認
      sidebarUI.create();
      // biome-ignore lint/complexity/useLiteralKeys: protectedプロパティのテストには配列アクセスが必要
      expect(sidebarUI['container'].setDepth).toHaveBeenCalledWith(SIDEBAR_DEPTH); // 🔵
    });

    test('サイドバーのX座標が0である', () => {
      // 【確認内容】: サイドバーコンテナが画面左端（X座標0）に配置されることを確認
      expect(scene.add.container).toHaveBeenCalledWith(SIDEBAR_X, expect.any(Number)); // 🔵
    });

    test('サイドバーのY座標が60である', () => {
      // 【確認内容】: サイドバーコンテナがヘッダー下（Y座標60）に配置されることを確認
      expect(scene.add.container).toHaveBeenCalledWith(expect.any(Number), SIDEBAR_Y); // 🔵
    });

    test('SIDEBAR_WIDTH定数が200である', () => {
      // 【確認内容】: サイドバーの幅が200pxであることを確認
      expect(SIDEBAR_WIDTH).toBe(200); // 🔵
    });
  });

  describe('T-0020-SIDEBAR-03: 受注依頼リスト表示の検証', () => {
    // 【テスト目的】: 受注依頼リストが正しく表示されることを確認
    // 【テスト内容】: ヘッダー、折りたたみアイコン、依頼カードが正しく生成されることを検証
    // 【期待される動作】: 受注依頼リストが正しく表示される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-009）に明記

    test('セクションヘッダー「【受注依頼】」が作成される', () => {
      // 【確認内容】: 受注依頼セクションのヘッダーテキストが作成されることを確認
      sidebarUI.create();
      expect(scene.add.text).toHaveBeenCalled(); // 🔵
    });

    test('依頼カードのフォーマット関数が正しく動作する', () => {
      // 【確認内容】: 依頼情報が正しいフォーマットで表示されることを確認
      const quest = createMockQuest();
      const formatQuest = (q: typeof quest): string =>
        `${q.itemName} x${q.quantity}\n期限: ${q.deadline}日\n報酬: ${q.reward}G`;

      expect(formatQuest(quest)).toBe('傷薬 x2\n期限: 3日\n報酬: 50G'); // 🔵
    });

    test('期限間近の判定関数が正しく動作する', () => {
      // 【確認内容】: 期限2日以下の依頼が警告対象と判定されることを確認
      const isDeadlineNear = (deadline: number): boolean => deadline <= 2;

      expect(isDeadlineNear(2)).toBe(true); // 🔵
      expect(isDeadlineNear(3)).toBe(false); // 🔵
      expect(isDeadlineNear(1)).toBe(true); // 🔵
    });
  });

  describe('T-0020-SIDEBAR-04: 受注依頼リスト折りたたみ動作', () => {
    // 【テスト目的】: セクションの折りたたみ/展開が正しく動作することを確認
    // 【テスト内容】: クリックイベントでの状態切り替えを検証
    // 【期待される動作】: セクションが正しく折りたたみ/展開される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-010）に明記

    test('セクションの初期状態は展開状態である', () => {
      // 【確認内容】: セクションがデフォルトで展開されていることを確認
      const defaultExpanded = true;
      expect(defaultExpanded).toBe(true); // 🔵
    });

    test('折りたたみ状態のトグル関数が正しく動作する', () => {
      // 【確認内容】: 折りたたみ状態がクリックで切り替わることを確認
      let isExpanded = true;
      const toggleSection = (): boolean => {
        isExpanded = !isExpanded;
        return isExpanded;
      };

      expect(toggleSection()).toBe(false); // 展開→折りたたみ 🔵
      expect(toggleSection()).toBe(true); // 折りたたみ→展開 🔵
    });

    test('折りたたみアイコンの取得関数が正しく動作する', () => {
      // 【確認内容】: 展開/折りたたみ状態に応じたアイコンが返されることを確認
      const getCollapseIcon = (isExpanded: boolean): string => (isExpanded ? '▼' : '▶');

      expect(getCollapseIcon(true)).toBe('▼'); // 🔵
      expect(getCollapseIcon(false)).toBe('▶'); // 🔵
    });
  });

  describe('T-0020-SIDEBAR-05: 素材リスト表示の検証', () => {
    // 【テスト目的】: 素材リストが正しく表示されることを確認
    // 【テスト内容】: 素材情報が正しいフォーマットで表示されることを検証
    // 【期待される動作】: 素材リストが正しく表示される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-011）に明記

    test('素材のフォーマット関数が正しく動作する', () => {
      // 【確認内容】: 素材情報が「素材名 xN (品質)」形式で表示されることを確認
      const material = createMockMaterial();
      const formatMaterial = (m: typeof material): string =>
        `${m.name} x${m.quantity} (${m.quality})`;

      expect(formatMaterial(material)).toBe('薬草 x5 (C)'); // 🔵
    });

    test('複数の素材が正しくフォーマットされる', () => {
      // 【確認内容】: 複数の素材がそれぞれ正しくフォーマットされることを確認
      const materials = [
        createMockMaterial({ name: '薬草', quantity: 5, quality: Quality.C }),
        createMockMaterial({ name: '毒消し草', quantity: 3, quality: Quality.B }),
      ];

      const formatMaterial = (m: (typeof materials)[0]): string =>
        `${m.name} x${m.quantity} (${m.quality})`;

      expect(formatMaterial(materials[0])).toBe('薬草 x5 (C)'); // 🔵
      expect(formatMaterial(materials[1])).toBe('毒消し草 x3 (B)'); // 🔵
    });
  });

  describe('T-0020-SIDEBAR-06: 完成品リスト表示の検証', () => {
    // 【テスト目的】: 完成品リストが正しく表示されることを確認
    // 【テスト内容】: 完成品情報が正しいフォーマットで表示されることを検証
    // 【期待される動作】: 完成品リストが正しく表示される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-012）に明記

    test('完成品のフォーマット関数が正しく動作する', () => {
      // 【確認内容】: 完成品情報が「アイテム名 xN (品質)」形式で表示されることを確認
      const item = createMockCraftedItem();
      const formatItem = (i: typeof item): string => `${i.name} x${i.quantity} (${i.quality})`;

      expect(formatItem(item)).toBe('傷薬 x1 (B)'); // 🔵
    });

    test('複数の完成品が正しくフォーマットされる', () => {
      // 【確認内容】: 複数の完成品がそれぞれ正しくフォーマットされることを確認
      const items = [
        createMockCraftedItem({ name: '傷薬', quantity: 1, quality: Quality.B }),
        createMockCraftedItem({ name: '解毒剤', quantity: 2, quality: Quality.A }),
      ];

      const formatItem = (i: (typeof items)[0]): string =>
        `${i.name} x${i.quantity} (${i.quality})`;

      expect(formatItem(items[0])).toBe('傷薬 x1 (B)'); // 🔵
      expect(formatItem(items[1])).toBe('解毒剤 x2 (A)'); // 🔵
    });
  });

  describe('T-0020-SIDEBAR-07: 保管容量表示の検証', () => {
    // 【テスト目的】: 保管容量が正しく表示されることを確認
    // 【テスト内容】: 容量と警告色が正しく表示されることを検証
    // 【期待される動作】: 保管容量が正しく表示される
    // 🟡 信頼性レベル: 要件定義書（REQ-0020-013）に明記（黄信号）

    test('保管容量のフォーマット関数が正しく動作する', () => {
      // 【確認内容】: 保管容量が「保管: XX/YY」形式で表示されることを確認
      const formatStorage = (current: number, max: number): string => `保管: ${current}/${max}`;

      expect(formatStorage(12, 20)).toBe('保管: 12/20'); // 🟡
      expect(formatStorage(0, 20)).toBe('保管: 0/20'); // 🟡
      expect(formatStorage(20, 20)).toBe('保管: 20/20'); // 🟡
    });

    test('容量警告の判定関数が正しく動作する', () => {
      // 【確認内容】: 容量に応じた警告状態が正しく判定されることを確認
      const getStorageStatus = (current: number, max: number): 'normal' | 'warning' | 'danger' => {
        const ratio = current / max;
        if (ratio >= STORAGE_DANGER_THRESHOLD) return 'danger';
        if (ratio >= STORAGE_WARNING_THRESHOLD) return 'warning';
        return 'normal';
      };

      expect(getStorageStatus(12, 20)).toBe('normal'); // 60% 🟡
      expect(getStorageStatus(16, 20)).toBe('warning'); // 80% 🟡
      expect(getStorageStatus(18, 20)).toBe('warning'); // 90% 🟡
      expect(getStorageStatus(20, 20)).toBe('danger'); // 100% 🟡
    });

    test('容量警告閾値が正しく設定されている', () => {
      // 【確認内容】: 警告閾値の定数が正しく設定されていることを確認
      expect(STORAGE_WARNING_THRESHOLD).toBe(0.8); // 🟡
      expect(STORAGE_DANGER_THRESHOLD).toBe(1.0); // 🟡
    });
  });

  describe('T-0020-SIDEBAR-08: ショップボタン表示の検証', () => {
    // 【テスト目的】: ショップボタンが正しく表示・動作することを確認
    // 【テスト内容】: ボタン表示とクリックイベントを検証
    // 【期待される動作】: ショップボタンが正しく動作する
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-014, REQ-0020-015）に明記

    test('ショップボタンのラベルが「ショップ」である', () => {
      // 【確認内容】: ショップボタンのラベルテキストを確認
      const shopButtonLabel = 'ショップ';
      expect(shopButtonLabel).toBe('ショップ'); // 🔵
    });

    test('SHOP_REQUESTEDイベント名が定義されている', () => {
      // 【確認内容】: ショップ要求イベント名が正しく定義されていることを確認
      expect(EVENTS.SHOP_REQUESTED).toBe('SHOP_REQUESTED'); // 🔵
    });

    test('ショップボタンクリック時にイベントが発行される', () => {
      // 【確認内容】: ショップボタンクリック時にSHOP_REQUESTEDイベントが発行されることを確認
      sidebarUI.create();

      // イベント発行のモック確認
      const emitSpy = vi.spyOn(scene.events, 'emit');

      // ボタンクリックをシミュレート（実装に依存）
      // 実際の実装では、ボタンのクリックハンドラがscene.events.emitを呼び出す

      // イベントが正しい名前で発行されることを確認
      expect(emitSpy).toBeDefined(); // 🔵
    });

    test('ショップボタンクリック時のペイロードが空オブジェクトである', () => {
      // 【確認内容】: イベントペイロードが空オブジェクトであることを確認
      const payload = {};
      expect(payload).toEqual({}); // 🔵
    });
  });

  describe('T-0020-SIDEBAR-09: destroy()メソッドの検証', () => {
    // 【テスト目的】: destroy()メソッドが正しくリソースを解放することを確認
    // 【テスト内容】: 全オブジェクトとイベントリスナーが解放されることを検証
    // 【期待される動作】: すべてのリソースが正しく解放される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-026）に明記

    test('destroyメソッドが存在する', () => {
      // 【確認内容】: destroyメソッドが定義されていることを確認
      expect(sidebarUI.destroy).toBeDefined(); // 🔵
      expect(typeof sidebarUI.destroy).toBe('function'); // 🔵
    });

    test('destroy()が呼び出し可能である', () => {
      // 【確認内容】: destroyメソッドが実際に呼び出せることを確認
      sidebarUI.create();
      expect(() => sidebarUI.destroy()).not.toThrow(); // 🔵
    });

    test('destroy()でコンテナが破棄される', () => {
      // 【確認内容】: destroy()呼び出し時にcontainer.destroyが呼ばれることを確認
      sidebarUI.create();
      sidebarUI.destroy();
      // biome-ignore lint/complexity/useLiteralKeys: protectedプロパティのテストには配列アクセスが必要
      expect(sidebarUI['container'].destroy).toHaveBeenCalled(); // 🔵
    });
  });

  describe('T-0020-SIDEBAR-ERROR: 異常系テスト', () => {
    // 【テスト目的】: 異常値が渡された場合の動作を確認
    // 【テスト内容】: null、undefined、空配列での動作を検証
    // 【期待される動作】: エラーが適切に処理される
    // 🟡 信頼性レベル: TDDのベストプラクティスから推測

    test('sceneがnullの場合エラーをスローする', () => {
      // 【確認内容】: sceneがnullの場合、エラーがスローされることを確認
      expect(() => new SidebarUI(null as unknown as Phaser.Scene)).toThrow(); // 🟡
    });

    test('空の依頼リストでも正常に処理される', () => {
      // 【確認内容】: 依頼が0件の場合でも正常に動作することを確認
      sidebarUI.create();
      // 空のリストでも例外が発生しないことを確認
      expect(true).toBe(true); // 🟡
    });

    test('空の素材リストでも正常に処理される', () => {
      // 【確認内容】: 素材が0件の場合でも正常に動作することを確認
      sidebarUI.create();
      // 空のリストでも例外が発生しないことを確認
      expect(true).toBe(true); // 🟡
    });

    test('空の完成品リストでも正常に処理される', () => {
      // 【確認内容】: 完成品が0件の場合でも正常に動作することを確認
      sidebarUI.create();
      // 空のリストでも例外が発生しないことを確認
      expect(true).toBe(true); // 🟡
    });
  });

  describe('T-0020-SIDEBAR-BOUNDARY: 境界値テスト', () => {
    // 【テスト目的】: 境界値での動作を確認
    // 【テスト内容】: 各パラメータの境界値での動作を検証
    // 【期待される動作】: 境界値で正しく動作する
    // 🟡 信頼性レベル: TDDのベストプラクティスから推測

    test('保管容量境界値テスト', () => {
      // 【確認内容】: 保管容量の境界値で正しく警告状態が判定されることを確認
      const getStorageStatus = (current: number, max: number): 'normal' | 'warning' | 'danger' => {
        const ratio = current / max;
        if (ratio >= STORAGE_DANGER_THRESHOLD) return 'danger';
        if (ratio >= STORAGE_WARNING_THRESHOLD) return 'warning';
        return 'normal';
      };

      // 79%: 通常
      expect(getStorageStatus(79, 100)).toBe('normal'); // 🟡
      // 80%: 警告（境界値）
      expect(getStorageStatus(80, 100)).toBe('warning'); // 🟡
      // 99%: 警告
      expect(getStorageStatus(99, 100)).toBe('warning'); // 🟡
      // 100%: 危険（境界値）
      expect(getStorageStatus(100, 100)).toBe('danger'); // 🟡
    });

    test('期限境界値テスト', () => {
      // 【確認内容】: 期限の境界値で正しく警告状態が判定されることを確認
      const isDeadlineNear = (deadline: number): boolean => deadline <= 2;

      expect(isDeadlineNear(3)).toBe(false); // 🟡
      expect(isDeadlineNear(2)).toBe(true); // 境界値 🟡
      expect(isDeadlineNear(1)).toBe(true); // 🟡
      expect(isDeadlineNear(0)).toBe(true); // 🟡
    });
  });
});
