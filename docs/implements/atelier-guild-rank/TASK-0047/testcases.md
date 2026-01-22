# TASK-0047 テストケース定義書: 共通UIコンポーネント視覚実装

## 基本情報

| 項目 | 値 |
|------|-----|
| **タスクID** | TASK-0047 |
| **タスク名** | 共通UIコンポーネント視覚実装 |
| **テストタイプ** | ユニットテスト（視覚要素検証） |
| **テストフレームワーク** | Vitest |
| **作成日** | 2026-01-22 |

---

## 1. テストファイル構成

| ファイルパス | 対象コンポーネント | テストケース数 |
|-------------|------------------|---------------|
| `tests/unit/presentation/ui/components/HeaderUI.visual.test.ts` | HeaderUI | 16 |
| `tests/unit/presentation/ui/components/SidebarUI.visual.test.ts` | SidebarUI | 8 |
| `tests/unit/presentation/ui/components/FooterUI.visual.test.ts` | FooterUI | 10 |

**合計: 34テストケース**

---

## 2. Phaserモック仕様

### 2.1 共通モック定義

```typescript
/**
 * Phaserシーンモックインターフェース
 */
interface MockScene extends Phaser.Scene {
  add: {
    container: ReturnType<typeof vi.fn>;
    text: ReturnType<typeof vi.fn>;
    graphics: ReturnType<typeof vi.fn>;
    rectangle: ReturnType<typeof vi.fn>;
    circle: ReturnType<typeof vi.fn>;
  };
  tweens: {
    add: ReturnType<typeof vi.fn>;
    killTweensOf: ReturnType<typeof vi.fn>;
  };
  cameras: {
    main: {
      width: number;
      height: number;
    };
  };
}

/**
 * Textモックインターフェース
 */
interface MockText {
  setText: ReturnType<typeof vi.fn>;
  setStyle: ReturnType<typeof vi.fn>;
  setColor: ReturnType<typeof vi.fn>;
  setAlpha: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  text: string;
}

/**
 * Graphicsモックインターフェース
 */
interface MockGraphics {
  fillStyle: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

/**
 * Rectangleモックインターフェース
 */
interface MockRectangle {
  setFillStyle: ReturnType<typeof vi.fn>;
  setStrokeStyle: ReturnType<typeof vi.fn>;
  setInteractive: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

/**
 * Containerモックインターフェース
 */
interface MockContainer {
  add: ReturnType<typeof vi.fn>;
  setPosition: ReturnType<typeof vi.fn>;
  setVisible: ReturnType<typeof vi.fn>;
  setDepth: ReturnType<typeof vi.fn>;
  getAt: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}
```

### 2.2 モック生成関数

```typescript
/**
 * Phaserシーンのモックを作成する
 */
const createMockScene = (): MockScene => {
  const mockText: MockText = {
    setText: vi.fn().mockReturnThis(),
    setStyle: vi.fn().mockReturnThis(),
    setColor: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    text: '',
  };

  const mockGraphics: MockGraphics = {
    fillStyle: vi.fn().mockReturnThis(),
    fillRect: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const mockRectangle: MockRectangle = {
    setFillStyle: vi.fn().mockReturnThis(),
    setStrokeStyle: vi.fn().mockReturnThis(),
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const mockContainer: MockContainer = {
    add: vi.fn().mockReturnThis(),
    setPosition: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    getAt: vi.fn(),
    destroy: vi.fn(),
  };

  return {
    add: {
      container: vi.fn().mockReturnValue(mockContainer),
      text: vi.fn().mockReturnValue(mockText),
      graphics: vi.fn().mockReturnValue(mockGraphics),
      rectangle: vi.fn().mockReturnValue(mockRectangle),
      circle: vi.fn().mockReturnValue({
        setFillStyle: vi.fn().mockReturnThis(),
        setStrokeStyle: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      }),
    },
    tweens: {
      add: vi.fn().mockReturnValue({ stop: vi.fn() }),
      killTweensOf: vi.fn(),
    },
    cameras: {
      main: {
        width: 1280,
        height: 720,
      },
    },
  } as unknown as MockScene;
};
```

---

## 3. HeaderUI視覚テストケース（16ケース）

### 3.1 テストスイート: HeaderUI視覚実装

| テストID | テストケース | 対応要件 | 優先度 |
|----------|-------------|---------|--------|
| HUI-V-01 | create()でランク表示テキストが生成されること | REQ-047-01 | 高 |
| HUI-V-02 | update()でランクテキストが更新されること | REQ-047-01 | 高 |
| HUI-V-03 | create()で昇格ゲージ背景バーが生成されること | REQ-047-02 | 高 |
| HUI-V-04 | create()で昇格ゲージフィルバーが生成されること | REQ-047-02 | 高 |
| HUI-V-05 | update()で昇格ゲージ幅が変更されること | REQ-047-02 | 高 |
| HUI-V-06 | 昇格ゲージ30%未満で赤色(0xFF6B6B)になること | REQ-047-03 | 高 |
| HUI-V-07 | 昇格ゲージ30-59%で黄色(0xFFD93D)になること | REQ-047-03 | 高 |
| HUI-V-08 | 昇格ゲージ60-99%で緑色(0x6BCB77)になること | REQ-047-03 | 高 |
| HUI-V-09 | 昇格ゲージ100%で水色(0x4ECDC4)になること | REQ-047-03 | 高 |
| HUI-V-10 | create()で残り日数テキストが生成されること | REQ-047-04 | 高 |
| HUI-V-11 | 残り日数11日以上で白色(0xFFFFFF)になること | REQ-047-04 | 高 |
| HUI-V-12 | 残り日数6-10日で黄色(0xFFD93D)になること | REQ-047-04 | 高 |
| HUI-V-13 | 残り日数4-5日で赤色(0xFF6B6B)になること | REQ-047-04 | 高 |
| HUI-V-14 | 残り日数3日以下で点滅Tweenが開始されること | REQ-047-05 | 中 |
| HUI-V-15 | create()で所持金テキストが生成されること | REQ-047-06 | 高 |
| HUI-V-16 | create()で行動ポイントテキストが生成されること | REQ-047-07 | 高 |

### 3.2 テストコード詳細

```typescript
/**
 * HeaderUI - 視覚実装テスト
 * TASK-0047 共通UIコンポーネント視覚実装
 */

import { HeaderUI } from '@presentation/ui/main/HeaderUI';
import type Phaser from 'phaser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// UI色定数
const UI_COLORS = {
  RED: 0xFF6B6B,
  YELLOW: 0xFFD93D,
  GREEN: 0x6BCB77,
  CYAN: 0x4ECDC4,
  WHITE: 0xFFFFFF,
  BRIGHT_RED: 0xFF0000,
};

describe('HeaderUI 視覚実装テスト', () => {
  let scene: Phaser.Scene;
  let headerUI: HeaderUI;

  // デフォルトの状態
  const defaultState = {
    rank: 'G' as const,
    promotionGauge: { current: 0, max: 100 },
    remainingDays: 30,
    gold: 100,
    actionPoints: { current: 3, max: 3 },
  };

  beforeEach(() => {
    scene = createMockScene();
    headerUI = new HeaderUI(scene);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // =================================================================
  // 3.2.1 ランク表示テスト
  // =================================================================

  describe('ランク表示', () => {
    describe('HUI-V-01: create()でランク表示テキストが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後にランク表示テキストが生成されることを確認
      // 【対応要件】: REQ-047-01

      it('HUI-V-01: ランク表示テキストが生成される', () => {
        // Given: HeaderUIが初期化済み
        // When: create()を呼び出す
        headerUI.create();

        // Then:
        // - rankTextフィールドがnullではない
        const rankText = headerUI['rankText'];
        expect(rankText).not.toBeNull();
        // - scene.add.textが呼び出される
        expect(scene.add.text).toHaveBeenCalled();
      });
    });

    describe('HUI-V-02: update()でランクテキストが更新されること', () => {
      // 【テスト目的】: update()呼び出し時にランクテキストが正しく更新されることを確認
      // 【対応要件】: REQ-047-01

      it('HUI-V-02: ランク更新時にテキストが変更される', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: ランクをFに更新する
        headerUI.update({ ...defaultState, rank: 'F' });

        // Then:
        // - setTextが呼び出される
        const rankText = headerUI['rankText'];
        expect(rankText.setText).toHaveBeenCalledWith(expect.stringContaining('F'));
      });
    });
  });

  // =================================================================
  // 3.2.2 昇格ゲージテスト
  // =================================================================

  describe('昇格ゲージ', () => {
    describe('HUI-V-03: create()で昇格ゲージ背景バーが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に昇格ゲージ背景バーが生成されることを確認
      // 【対応要件】: REQ-047-02

      it('HUI-V-03: 昇格ゲージの背景バーが生成される', () => {
        // Given: HeaderUIが初期化済み
        // When: create()を呼び出す
        headerUI.create();

        // Then:
        // - gaugeBackgroundフィールドがnullではない
        const gaugeBackground = headerUI['gaugeBackground'];
        expect(gaugeBackground).not.toBeNull();
        // - scene.add.graphicsが呼び出される
        expect(scene.add.graphics).toHaveBeenCalled();
      });
    });

    describe('HUI-V-04: create()で昇格ゲージフィルバーが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に昇格ゲージフィルバーが生成されることを確認
      // 【対応要件】: REQ-047-02

      it('HUI-V-04: 昇格ゲージのフィルバーが生成される', () => {
        // Given: HeaderUIが初期化済み
        // When: create()を呼び出す
        headerUI.create();

        // Then:
        // - gaugeFillフィールドがnullではない
        const gaugeFill = headerUI['gaugeFill'];
        expect(gaugeFill).not.toBeNull();
      });
    });

    describe('HUI-V-05: update()で昇格ゲージ幅が変更されること', () => {
      // 【テスト目的】: update()呼び出し時にゲージ幅が正しく変更されることを確認
      // 【対応要件】: REQ-047-02

      it('HUI-V-05: 昇格ゲージ更新時にバー幅が変更される', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 昇格ゲージを50%に更新する
        headerUI.update({ ...defaultState, promotionGauge: { current: 50, max: 100 } });

        // Then:
        // - gaugeFillのfillRectが適切な幅で呼び出される
        const gaugeFill = headerUI['gaugeFill'];
        expect(gaugeFill.clear).toHaveBeenCalled();
        expect(gaugeFill.fillRect).toHaveBeenCalled();
      });
    });

    describe('HUI-V-06: 昇格ゲージ30%未満で赤色になること', () => {
      // 【テスト目的】: 昇格ゲージが30%未満の時に赤色で表示されることを確認
      // 【対応要件】: REQ-047-03

      it('HUI-V-06: 昇格ゲージ20%で赤色(0xFF6B6B)になる', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 昇格ゲージを20%に更新する
        headerUI.update({ ...defaultState, promotionGauge: { current: 20, max: 100 } });

        // Then:
        // - fillStyleが赤色(0xFF6B6B)で呼び出される
        const gaugeFill = headerUI['gaugeFill'];
        expect(gaugeFill.fillStyle).toHaveBeenCalledWith(UI_COLORS.RED, expect.any(Number));
      });
    });

    describe('HUI-V-07: 昇格ゲージ30-59%で黄色になること', () => {
      // 【テスト目的】: 昇格ゲージが30-59%の時に黄色で表示されることを確認
      // 【対応要件】: REQ-047-03

      it('HUI-V-07: 昇格ゲージ45%で黄色(0xFFD93D)になる', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 昇格ゲージを45%に更新する
        headerUI.update({ ...defaultState, promotionGauge: { current: 45, max: 100 } });

        // Then:
        // - fillStyleが黄色(0xFFD93D)で呼び出される
        const gaugeFill = headerUI['gaugeFill'];
        expect(gaugeFill.fillStyle).toHaveBeenCalledWith(UI_COLORS.YELLOW, expect.any(Number));
      });
    });

    describe('HUI-V-08: 昇格ゲージ60-99%で緑色になること', () => {
      // 【テスト目的】: 昇格ゲージが60-99%の時に緑色で表示されることを確認
      // 【対応要件】: REQ-047-03

      it('HUI-V-08: 昇格ゲージ75%で緑色(0x6BCB77)になる', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 昇格ゲージを75%に更新する
        headerUI.update({ ...defaultState, promotionGauge: { current: 75, max: 100 } });

        // Then:
        // - fillStyleが緑色(0x6BCB77)で呼び出される
        const gaugeFill = headerUI['gaugeFill'];
        expect(gaugeFill.fillStyle).toHaveBeenCalledWith(UI_COLORS.GREEN, expect.any(Number));
      });
    });

    describe('HUI-V-09: 昇格ゲージ100%で水色になること', () => {
      // 【テスト目的】: 昇格ゲージが100%の時に水色で表示されることを確認
      // 【対応要件】: REQ-047-03

      it('HUI-V-09: 昇格ゲージ100%で水色(0x4ECDC4)になる', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 昇格ゲージを100%に更新する
        headerUI.update({ ...defaultState, promotionGauge: { current: 100, max: 100 } });

        // Then:
        // - fillStyleが水色(0x4ECDC4)で呼び出される
        const gaugeFill = headerUI['gaugeFill'];
        expect(gaugeFill.fillStyle).toHaveBeenCalledWith(UI_COLORS.CYAN, expect.any(Number));
      });
    });
  });

  // =================================================================
  // 3.2.3 残り日数テスト
  // =================================================================

  describe('残り日数', () => {
    describe('HUI-V-10: create()で残り日数テキストが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に残り日数テキストが生成されることを確認
      // 【対応要件】: REQ-047-04

      it('HUI-V-10: 残り日数テキストが生成される', () => {
        // Given: HeaderUIが初期化済み
        // When: create()を呼び出す
        headerUI.create();

        // Then:
        // - daysTextフィールドがnullではない
        const daysText = headerUI['daysText'];
        expect(daysText).not.toBeNull();
      });
    });

    describe('HUI-V-11: 残り日数11日以上で白色になること', () => {
      // 【テスト目的】: 残り日数が11日以上の時に白色で表示されることを確認
      // 【対応要件】: REQ-047-04

      it('HUI-V-11: 残り日数15日で白色(0xFFFFFF)になる', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 残り日数を15日に更新する
        headerUI.update({ ...defaultState, remainingDays: 15 });

        // Then:
        // - setColorまたはsetStyleが白色で呼び出される
        const daysText = headerUI['daysText'];
        expect(daysText.setColor).toHaveBeenCalledWith('#FFFFFF');
      });
    });

    describe('HUI-V-12: 残り日数6-10日で黄色になること', () => {
      // 【テスト目的】: 残り日数が6-10日の時に黄色で表示されることを確認
      // 【対応要件】: REQ-047-04

      it('HUI-V-12: 残り日数8日で黄色になる', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 残り日数を8日に更新する
        headerUI.update({ ...defaultState, remainingDays: 8 });

        // Then:
        // - setColorが黄色で呼び出される
        const daysText = headerUI['daysText'];
        expect(daysText.setColor).toHaveBeenCalledWith('#FFD93D');
      });
    });

    describe('HUI-V-13: 残り日数4-5日で赤色になること', () => {
      // 【テスト目的】: 残り日数が4-5日の時に赤色で表示されることを確認
      // 【対応要件】: REQ-047-04

      it('HUI-V-13: 残り日数5日で赤色になる', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 残り日数を5日に更新する
        headerUI.update({ ...defaultState, remainingDays: 5 });

        // Then:
        // - setColorが赤色で呼び出される
        const daysText = headerUI['daysText'];
        expect(daysText.setColor).toHaveBeenCalledWith('#FF6B6B');
      });
    });

    describe('HUI-V-14: 残り日数3日以下で点滅Tweenが開始されること', () => {
      // 【テスト目的】: 残り日数が3日以下の時に点滅アニメーションが開始されることを確認
      // 【対応要件】: REQ-047-05

      it('HUI-V-14: 残り日数3日で点滅Tweenが開始される', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 残り日数を3日に更新する
        headerUI.update({ ...defaultState, remainingDays: 3 });

        // Then:
        // - scene.tweens.addが呼び出される
        expect(scene.tweens.add).toHaveBeenCalled();
      });

      it('HUI-V-14b: 残り日数4日以上で点滅が停止される', () => {
        // Given: HeaderUIが初期化済み、残り日数3日で点滅中
        headerUI.create();
        headerUI.update({ ...defaultState, remainingDays: 3 });

        // When: 残り日数を5日に更新する
        headerUI.update({ ...defaultState, remainingDays: 5 });

        // Then:
        // - killTweensOfが呼び出される
        expect(scene.tweens.killTweensOf).toHaveBeenCalled();
      });
    });
  });

  // =================================================================
  // 3.2.4 所持金・行動ポイントテスト
  // =================================================================

  describe('所持金・行動ポイント', () => {
    describe('HUI-V-15: create()で所持金テキストが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に所持金テキストが生成されることを確認
      // 【対応要件】: REQ-047-06

      it('HUI-V-15: 所持金テキストが生成される', () => {
        // Given: HeaderUIが初期化済み
        // When: create()を呼び出す
        headerUI.create();

        // Then:
        // - goldTextフィールドがnullではない
        const goldText = headerUI['goldText'];
        expect(goldText).not.toBeNull();
      });

      it('HUI-V-15b: 所持金更新時にテキストが変更される', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 所持金を500に更新する
        headerUI.update({ ...defaultState, gold: 500 });

        // Then:
        // - setTextが呼び出される
        const goldText = headerUI['goldText'];
        expect(goldText.setText).toHaveBeenCalledWith(expect.stringContaining('500'));
      });
    });

    describe('HUI-V-16: create()で行動ポイントテキストが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に行動ポイントテキストが生成されることを確認
      // 【対応要件】: REQ-047-07

      it('HUI-V-16: 行動ポイントテキストが生成される', () => {
        // Given: HeaderUIが初期化済み
        // When: create()を呼び出す
        headerUI.create();

        // Then:
        // - actionPointsTextフィールドがnullではない
        const actionPointsText = headerUI['actionPointsText'];
        expect(actionPointsText).not.toBeNull();
      });

      it('HUI-V-16b: 行動ポイント更新時にテキストが変更される', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 行動ポイントを2/3に更新する
        headerUI.update({ ...defaultState, actionPoints: { current: 2, max: 3 } });

        // Then:
        // - setTextが「2/3 AP」形式で呼び出される
        const actionPointsText = headerUI['actionPointsText'];
        expect(actionPointsText.setText).toHaveBeenCalledWith('2/3 AP');
      });
    });
  });
});
```

---

## 4. SidebarUI視覚テストケース（8ケース）

### 4.1 テストスイート: SidebarUI視覚実装

| テストID | テストケース | 対応要件 | 優先度 |
|----------|-------------|---------|--------|
| SUI-V-01 | create()で受注依頼セクションヘッダーが生成されること | REQ-047-08 | 高 |
| SUI-V-02 | create()で素材セクションヘッダーが生成されること | REQ-047-09 | 高 |
| SUI-V-03 | create()で完成品セクションヘッダーが生成されること | REQ-047-10 | 高 |
| SUI-V-04 | toggleSection()でアイコンが変化すること | REQ-047-11 | 中 |
| SUI-V-05 | create()で保管容量テキストが生成されること | REQ-047-12 | 高 |
| SUI-V-06 | updateStorage()で保管容量テキストが更新されること | REQ-047-12 | 高 |
| SUI-V-07 | create()でショップボタンが生成されること | REQ-047-13 | 高 |
| SUI-V-08 | ショップボタンがクリック可能であること | REQ-047-13 | 高 |

### 4.2 テストコード詳細

```typescript
/**
 * SidebarUI - 視覚実装テスト
 * TASK-0047 共通UIコンポーネント視覚実装
 */

import { SidebarUI } from '@presentation/ui/main/SidebarUI';
import type Phaser from 'phaser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('SidebarUI 視覚実装テスト', () => {
  let scene: Phaser.Scene;
  let sidebarUI: SidebarUI;

  beforeEach(() => {
    scene = createMockScene();

    // localStorageのモック
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock as unknown as Storage;

    sidebarUI = new SidebarUI(scene);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // =================================================================
  // 4.2.1 セクションヘッダーテスト
  // =================================================================

  describe('セクションヘッダー', () => {
    describe('SUI-V-01: create()で受注依頼セクションヘッダーが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に受注依頼セクションヘッダーが生成されることを確認
      // 【対応要件】: REQ-047-08

      it('SUI-V-01: 受注依頼セクションヘッダーが生成される', () => {
        // Given: SidebarUIが初期化済み
        // When: create()を呼び出す
        sidebarUI.create();

        // Then:
        // - questSectionフィールドがnullではない
        const questSection = sidebarUI['questSection'];
        expect(questSection).not.toBeNull();
        // - タイトルが「【受注依頼】」である
        expect(questSection.title.text).toBe('【受注依頼】');
      });
    });

    describe('SUI-V-02: create()で素材セクションヘッダーが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に素材セクションヘッダーが生成されることを確認
      // 【対応要件】: REQ-047-09

      it('SUI-V-02: 素材セクションヘッダーが生成される', () => {
        // Given: SidebarUIが初期化済み
        // When: create()を呼び出す
        sidebarUI.create();

        // Then:
        // - materialSectionフィールドがnullではない
        const materialSection = sidebarUI['materialSection'];
        expect(materialSection).not.toBeNull();
        // - タイトルが「【素材】」である
        expect(materialSection.title.text).toBe('【素材】');
      });
    });

    describe('SUI-V-03: create()で完成品セクションヘッダーが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に完成品セクションヘッダーが生成されることを確認
      // 【対応要件】: REQ-047-10

      it('SUI-V-03: 完成品セクションヘッダーが生成される', () => {
        // Given: SidebarUIが初期化済み
        // When: create()を呼び出す
        sidebarUI.create();

        // Then:
        // - itemSectionフィールドがnullではない
        const itemSection = sidebarUI['itemSection'];
        expect(itemSection).not.toBeNull();
        // - タイトルが「【完成品】」である
        expect(itemSection.title.text).toBe('【完成品】');
      });
    });

    describe('SUI-V-04: toggleSection()でアイコンが変化すること', () => {
      // 【テスト目的】: セクションの折りたたみ/展開時にアイコンが変化することを確認
      // 【対応要件】: REQ-047-11

      it('SUI-V-04: セクション折りたたみ時にアイコンが▶になる', () => {
        // Given: SidebarUIが初期化済み
        sidebarUI.create();
        const questSection = sidebarUI['questSection'];

        // 初期状態は展開（▼）
        expect(questSection.icon.text).toBe('▼');

        // When: セクションを折りたたむ
        sidebarUI['toggleSection'](questSection);

        // Then:
        // - アイコンが▶になる
        expect(questSection.icon.setText).toHaveBeenCalledWith('▶');
      });

      it('SUI-V-04b: セクション展開時にアイコンが▼になる', () => {
        // Given: SidebarUIが初期化済み、セクションが折りたたまれている
        sidebarUI.create();
        const questSection = sidebarUI['questSection'];
        sidebarUI['toggleSection'](questSection); // 折りたたむ

        // When: セクションを展開する
        sidebarUI['toggleSection'](questSection);

        // Then:
        // - アイコンが▼になる
        expect(questSection.icon.setText).toHaveBeenCalledWith('▼');
      });
    });
  });

  // =================================================================
  // 4.2.2 保管容量テスト
  // =================================================================

  describe('保管容量', () => {
    describe('SUI-V-05: create()で保管容量テキストが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に保管容量テキストが生成されることを確認
      // 【対応要件】: REQ-047-12

      it('SUI-V-05: 保管容量テキストが生成される', () => {
        // Given: SidebarUIが初期化済み
        // When: create()を呼び出す
        sidebarUI.create();

        // Then:
        // - storageTextフィールドがnullではない
        const storageText = sidebarUI['storageText'];
        expect(storageText).not.toBeNull();
      });
    });

    describe('SUI-V-06: updateStorage()で保管容量テキストが更新されること', () => {
      // 【テスト目的】: updateStorage()呼び出し時に保管容量テキストが正しく更新されることを確認
      // 【対応要件】: REQ-047-12

      it('SUI-V-06: 保管容量更新時にテキストが変更される', () => {
        // Given: SidebarUIが初期化済み
        sidebarUI.create();

        // When: 保管容量を10/20に更新する
        sidebarUI.updateStorage(10, 20);

        // Then:
        // - setTextが「保管: 10/20」形式で呼び出される
        const storageText = sidebarUI['storageText'];
        expect(storageText.setText).toHaveBeenCalledWith('保管: 10/20');
      });

      it('SUI-V-06b: 保管容量80%以上で警告色になる', () => {
        // Given: SidebarUIが初期化済み
        sidebarUI.create();

        // When: 保管容量を16/20（80%）に更新する
        sidebarUI.updateStorage(16, 20);

        // Then:
        // - setColorが警告色で呼び出される
        const storageText = sidebarUI['storageText'];
        expect(storageText.setColor).toHaveBeenCalledWith('#FFD93D');
      });
    });
  });

  // =================================================================
  // 4.2.3 ショップボタンテスト
  // =================================================================

  describe('ショップボタン', () => {
    describe('SUI-V-07: create()でショップボタンが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後にショップボタンが生成されることを確認
      // 【対応要件】: REQ-047-13

      it('SUI-V-07: ショップボタンが生成される', () => {
        // Given: SidebarUIが初期化済み
        // When: create()を呼び出す
        sidebarUI.create();

        // Then:
        // - shopButtonフィールドがnullではない
        const shopButton = sidebarUI['shopButton'];
        expect(shopButton).not.toBeNull();
      });
    });

    describe('SUI-V-08: ショップボタンがクリック可能であること', () => {
      // 【テスト目的】: ショップボタンにインタラクティブ領域が設定されていることを確認
      // 【対応要件】: REQ-047-13

      it('SUI-V-08: ショップボタンがクリック可能である', () => {
        // Given: SidebarUIが初期化済み
        sidebarUI.create();

        // Then:
        // - setInteractiveが呼び出されている
        const shopButton = sidebarUI['shopButton'];
        expect(shopButton.setInteractive).toHaveBeenCalled();
      });
    });
  });
});
```

---

## 5. FooterUI視覚テストケース（10ケース）

### 5.1 テストスイート: FooterUI視覚実装

| テストID | テストケース | 対応要件 | 優先度 |
|----------|-------------|---------|--------|
| FUI-V-01 | create()でフェーズインジケーターが4つ生成されること | REQ-047-14 | 高 |
| FUI-V-02 | 現在フェーズのインジケーターがハイライトされること | REQ-047-15 | 高 |
| FUI-V-03 | 完了フェーズのインジケーターが完了スタイルになること | REQ-047-16 | 中 |
| FUI-V-04 | 未到達フェーズのインジケーターがグレーアウトされること | REQ-047-16 | 中 |
| FUI-V-05 | create()で手札プレースホルダーが5つ生成されること | REQ-047-17 | 高 |
| FUI-V-06 | create()で次へボタンが生成されること | REQ-047-18 | 高 |
| FUI-V-07 | 次へボタンがクリック可能であること | REQ-047-18 | 高 |
| FUI-V-08 | QUEST_ACCEPTフェーズでボタンラベルが「採取へ」になること | REQ-047-19 | 高 |
| FUI-V-09 | GATHERINGフェーズでボタンラベルが「調合へ」になること | REQ-047-19 | 高 |
| FUI-V-10 | setNextButtonEnabled(false)でボタンがグレーアウトされること | REQ-047-19 | 高 |

### 5.2 テストコード詳細

```typescript
/**
 * FooterUI - 視覚実装テスト
 * TASK-0047 共通UIコンポーネント視覚実装
 */

import { FooterUI } from '@presentation/ui/main/FooterUI';
import type Phaser from 'phaser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// フェーズインジケーター色定数
const PHASE_COLORS = {
  PENDING: 0x6B7280,   // 未到達（グレー）
  CURRENT: 0x6366F1,   // 現在（プライマリ）
  COMPLETED: 0x10B981, // 完了（緑）
};

describe('FooterUI 視覚実装テスト', () => {
  let scene: Phaser.Scene;
  let footerUI: FooterUI;

  // デフォルトの状態
  const defaultState = {
    currentPhase: 'QUEST_ACCEPT' as const,
    completedPhases: [] as string[],
    hand: [],
  };

  beforeEach(() => {
    scene = createMockScene();
    footerUI = new FooterUI(scene);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // =================================================================
  // 5.2.1 フェーズインジケーターテスト
  // =================================================================

  describe('フェーズインジケーター', () => {
    describe('FUI-V-01: create()でフェーズインジケーターが4つ生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に4つのフェーズインジケーターが生成されることを確認
      // 【対応要件】: REQ-047-14

      it('FUI-V-01: フェーズインジケーターが4つ生成される', () => {
        // Given: FooterUIが初期化済み
        // When: create()を呼び出す
        footerUI.create();

        // Then:
        // - phaseIndicatorsの長さが4
        const phaseIndicators = footerUI['phaseIndicators'];
        expect(phaseIndicators).toHaveLength(4);
      });
    });

    describe('FUI-V-02: 現在フェーズのインジケーターがハイライトされること', () => {
      // 【テスト目的】: 現在のフェーズがハイライト色で表示されることを確認
      // 【対応要件】: REQ-047-15

      it('FUI-V-02: 現在フェーズ(GATHERING)がハイライトされる', () => {
        // Given: FooterUIが初期化済み
        footerUI.create();

        // When: フェーズをGATHERINGに更新する
        footerUI.update({ ...defaultState, currentPhase: 'GATHERING' });

        // Then:
        // - GATHERINGインジケーター（インデックス1）がCURRENT色(0x6366F1)になる
        const phaseIndicators = footerUI['phaseIndicators'];
        expect(phaseIndicators[1].setFillStyle).toHaveBeenCalledWith(PHASE_COLORS.CURRENT);
      });
    });

    describe('FUI-V-03: 完了フェーズのインジケーターが完了スタイルになること', () => {
      // 【テスト目的】: 完了したフェーズが完了色で表示されることを確認
      // 【対応要件】: REQ-047-16

      it('FUI-V-03: 完了フェーズ(QUEST_ACCEPT)が完了スタイルになる', () => {
        // Given: FooterUIが初期化済み
        footerUI.create();

        // When: QUEST_ACCEPTを完了してGATHERINGに移行する
        footerUI.update({
          ...defaultState,
          currentPhase: 'GATHERING',
          completedPhases: ['QUEST_ACCEPT'],
        });

        // Then:
        // - QUEST_ACCEPTインジケーター（インデックス0）がCOMPLETED色(0x10B981)になる
        const phaseIndicators = footerUI['phaseIndicators'];
        expect(phaseIndicators[0].setFillStyle).toHaveBeenCalledWith(PHASE_COLORS.COMPLETED);
      });
    });

    describe('FUI-V-04: 未到達フェーズのインジケーターがグレーアウトされること', () => {
      // 【テスト目的】: 未到達のフェーズがグレー色で表示されることを確認
      // 【対応要件】: REQ-047-16

      it('FUI-V-04: 未到達フェーズ(ALCHEMY, DELIVERY)がグレーアウトされる', () => {
        // Given: FooterUIが初期化済み
        footerUI.create();

        // When: QUEST_ACCEPTフェーズで更新する
        footerUI.update({ ...defaultState, currentPhase: 'QUEST_ACCEPT' });

        // Then:
        // - ALCHEMYインジケーター（インデックス2）がPENDING色(0x6B7280)になる
        // - DELIVERYインジケーター（インデックス3）がPENDING色(0x6B7280)になる
        const phaseIndicators = footerUI['phaseIndicators'];
        expect(phaseIndicators[2].setFillStyle).toHaveBeenCalledWith(PHASE_COLORS.PENDING);
        expect(phaseIndicators[3].setFillStyle).toHaveBeenCalledWith(PHASE_COLORS.PENDING);
      });
    });
  });

  // =================================================================
  // 5.2.2 手札表示エリアテスト
  // =================================================================

  describe('手札表示エリア', () => {
    describe('FUI-V-05: create()で手札プレースホルダーが5つ生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に5つの手札プレースホルダーが生成されることを確認
      // 【対応要件】: REQ-047-17

      it('FUI-V-05: 手札プレースホルダーが5つ生成される', () => {
        // Given: FooterUIが初期化済み
        // When: create()を呼び出す
        footerUI.create();

        // Then:
        // - handPlaceholdersの長さが5
        const handPlaceholders = footerUI['handPlaceholders'];
        expect(handPlaceholders).toHaveLength(5);
      });

      it('FUI-V-05b: プレースホルダーがRectangleで作成される', () => {
        // Given: FooterUIが初期化済み
        // When: create()を呼び出す
        footerUI.create();

        // Then:
        // - scene.add.rectangleが5回呼び出される
        expect(scene.add.rectangle).toHaveBeenCalledTimes(5);
      });
    });
  });

  // =================================================================
  // 5.2.3 次へボタンテスト
  // =================================================================

  describe('次へボタン', () => {
    describe('FUI-V-06: create()で次へボタンが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に次へボタンが生成されることを確認
      // 【対応要件】: REQ-047-18

      it('FUI-V-06: 次へボタンが生成される', () => {
        // Given: FooterUIが初期化済み
        // When: create()を呼び出す
        footerUI.create();

        // Then:
        // - nextButtonフィールドがnullではない
        const nextButton = footerUI['nextButton'];
        expect(nextButton).not.toBeNull();
      });
    });

    describe('FUI-V-07: 次へボタンがクリック可能であること', () => {
      // 【テスト目的】: 次へボタンにインタラクティブ領域が設定されていることを確認
      // 【対応要件】: REQ-047-18

      it('FUI-V-07: 次へボタンがクリック可能である', () => {
        // Given: FooterUIが初期化済み
        footerUI.create();

        // Then:
        // - setInteractiveが呼び出されている
        const nextButton = footerUI['nextButton'];
        expect(nextButton.setInteractive).toHaveBeenCalled();
      });
    });

    describe('FUI-V-08: QUEST_ACCEPTフェーズでボタンラベルが「採取へ」になること', () => {
      // 【テスト目的】: QUEST_ACCEPTフェーズ時にボタンラベルが「採取へ」であることを確認
      // 【対応要件】: REQ-047-19

      it('FUI-V-08: QUEST_ACCEPTフェーズでボタンラベルが「採取へ」になる', () => {
        // Given: FooterUIが初期化済み
        footerUI.create();

        // When: QUEST_ACCEPTフェーズで更新する
        footerUI.update({ ...defaultState, currentPhase: 'QUEST_ACCEPT' });

        // Then:
        // - ボタンラベルが「採取へ」である
        const nextButton = footerUI['nextButton'];
        expect(nextButton.getAt(1).text).toBe('採取へ');
      });
    });

    describe('FUI-V-09: GATHERINGフェーズでボタンラベルが「調合へ」になること', () => {
      // 【テスト目的】: GATHERINGフェーズ時にボタンラベルが「調合へ」であることを確認
      // 【対応要件】: REQ-047-19

      it('FUI-V-09: GATHERINGフェーズでボタンラベルが「調合へ」になる', () => {
        // Given: FooterUIが初期化済み
        footerUI.create();

        // When: GATHERINGフェーズで更新する
        footerUI.update({ ...defaultState, currentPhase: 'GATHERING' });

        // Then:
        // - ボタンラベルが「調合へ」である
        const nextButton = footerUI['nextButton'];
        expect(nextButton.getAt(1).text).toBe('調合へ');
      });

      it('FUI-V-09b: ALCHEMYフェーズでボタンラベルが「納品へ」になる', () => {
        // Given: FooterUIが初期化済み
        footerUI.create();

        // When: ALCHEMYフェーズで更新する
        footerUI.update({ ...defaultState, currentPhase: 'ALCHEMY' });

        // Then:
        // - ボタンラベルが「納品へ」である
        const nextButton = footerUI['nextButton'];
        expect(nextButton.getAt(1).text).toBe('納品へ');
      });

      it('FUI-V-09c: DELIVERYフェーズでボタンラベルが「日終了」になる', () => {
        // Given: FooterUIが初期化済み
        footerUI.create();

        // When: DELIVERYフェーズで更新する
        footerUI.update({ ...defaultState, currentPhase: 'DELIVERY' });

        // Then:
        // - ボタンラベルが「日終了」である
        const nextButton = footerUI['nextButton'];
        expect(nextButton.getAt(1).text).toBe('日終了');
      });
    });

    describe('FUI-V-10: setNextButtonEnabled(false)でボタンがグレーアウトされること', () => {
      // 【テスト目的】: ボタン無効時にグレーアウト表示されることを確認
      // 【対応要件】: REQ-047-19

      it('FUI-V-10: ボタン無効時にグレーアウトされる', () => {
        // Given: FooterUIが初期化済み
        footerUI.create();

        // When: ボタンを無効化する
        footerUI.setNextButtonEnabled(false);

        // Then:
        // - ボタンの背景色がdisabled色になる
        const nextButton = footerUI['nextButton'];
        expect(nextButton.getAt(0).setFillStyle).toHaveBeenCalledWith(0x4B5563);
      });

      it('FUI-V-10b: ボタン有効時に通常色になる', () => {
        // Given: FooterUIが初期化済み、ボタンが無効化されている
        footerUI.create();
        footerUI.setNextButtonEnabled(false);

        // When: ボタンを有効化する
        footerUI.setNextButtonEnabled(true);

        // Then:
        // - ボタンの背景色がprimary色になる
        const nextButton = footerUI['nextButton'];
        expect(nextButton.getAt(0).setFillStyle).toHaveBeenCalledWith(0x6366F1);
      });
    });
  });
});
```

---

## 6. 境界値テストケース

### 6.1 昇格ゲージ境界値

| テストID | 値 | 期待色 | 対応要件 |
|----------|-----|-------|---------|
| HUI-BV-01 | 0% | 赤 (0xFF6B6B) | REQ-047-03 |
| HUI-BV-02 | 29% | 赤 (0xFF6B6B) | REQ-047-03 |
| HUI-BV-03 | 30% | 黄 (0xFFD93D) | REQ-047-03 |
| HUI-BV-04 | 59% | 黄 (0xFFD93D) | REQ-047-03 |
| HUI-BV-05 | 60% | 緑 (0x6BCB77) | REQ-047-03 |
| HUI-BV-06 | 99% | 緑 (0x6BCB77) | REQ-047-03 |
| HUI-BV-07 | 100% | 水色 (0x4ECDC4) | REQ-047-03 |

### 6.2 残り日数境界値

| テストID | 値 | 期待色 | 点滅 | 対応要件 |
|----------|-----|-------|------|---------|
| HUI-BV-08 | 11日 | 白 | なし | REQ-047-04 |
| HUI-BV-09 | 10日 | 黄 | なし | REQ-047-04 |
| HUI-BV-10 | 6日 | 黄 | なし | REQ-047-04 |
| HUI-BV-11 | 5日 | 赤 | なし | REQ-047-04 |
| HUI-BV-12 | 4日 | 赤 | なし | REQ-047-04 |
| HUI-BV-13 | 3日 | 赤 | あり | REQ-047-05 |
| HUI-BV-14 | 1日 | 赤 | あり | REQ-047-05 |

---

## 7. 異常系テストケース

| テストID | テストケース | 期待動作 |
|----------|-------------|---------|
| ERR-01 | create()未呼び出しでupdate()を呼び出した場合 | エラーなく無視される |
| ERR-02 | destroy()後にupdate()を呼び出した場合 | エラーなく無視される |
| ERR-03 | 無効なフェーズ名を渡した場合 | デフォルト値が使用される |
| ERR-04 | 負の日数を渡した場合 | 0として扱われる |
| ERR-05 | max=0のゲージ値を渡した場合 | 0%として扱われる |

---

## 8. 既存テストとの互換性

### 8.1 既存テストファイル

以下の既存テストが引き続きパスすることを確認する。

| ファイルパス | テストケース数 |
|-------------|---------------|
| `tests/unit/presentation/ui/main/SidebarUI.test.ts` | 7 |

### 8.2 互換性要件

- 既存のモック構造（`scene.add.container`, `scene.add.text`等）を維持
- 既存のプライベートフィールドアクセスパターンを維持
- localStorage関連のテストパターンを維持

---

## 9. テスト実行計画

### 9.1 実行コマンド

```bash
# 全視覚テスト実行
pnpm test tests/unit/presentation/ui/components/

# HeaderUI視覚テストのみ
pnpm test tests/unit/presentation/ui/components/HeaderUI.visual.test.ts

# SidebarUI視覚テストのみ
pnpm test tests/unit/presentation/ui/components/SidebarUI.visual.test.ts

# FooterUI視覚テストのみ
pnpm test tests/unit/presentation/ui/components/FooterUI.visual.test.ts

# カバレッジ確認
pnpm test:coverage tests/unit/presentation/ui/components/
```

### 9.2 成功基準

- 全34テストケースがパスすること
- カバレッジが80%以上であること
- 既存テスト7件が引き続きパスすること

---

## 変更履歴

| 日付 | 変更内容 |
|------|---------|
| 2026-01-22 | 初版作成 |
