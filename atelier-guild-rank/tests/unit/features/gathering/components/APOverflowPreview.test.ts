/**
 * APOverflowPreview テスト
 * TASK-0115: APOverflowPreview実装
 *
 * @description
 * AP超過プレビューダイアログの表示、コールバック、データ表示を検証する。
 *
 * @信頼性レベル 🟡 NFR-102・design-interview.md D7から妥当な推測
 */

import type { IAPOverflowResult } from '@features/gathering';
import type { IAPOverflowPreviewData } from '@features/gathering/components/APOverflowPreview';
import { APOverflowPreview } from '@features/gathering/components/APOverflowPreview';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モックヘルパー
// =============================================================================

function createMockContainer() {
  return {
    setPosition: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    setScale: vi.fn().mockReturnThis(),
    setInteractive: vi.fn().mockReturnThis(),
    removeInteractive: vi.fn().mockReturnThis(),
    removeAllListeners: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    removeAll: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    x: 0,
    y: 0,
    name: '',
  };
}

function createMockText() {
  return {
    setOrigin: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    text: '',
  };
}

function createMockRexUI() {
  const mockLabel = {
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    layout: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const mockRoundRect = {
    setFillStyle: vi.fn().mockReturnThis(),
    setStrokeStyle: vi.fn().mockReturnThis(),
    setInteractive: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  return {
    add: {
      label: vi.fn().mockReturnValue(mockLabel),
      roundRectangle: vi.fn().mockReturnValue(mockRoundRect),
      dialog: vi.fn().mockReturnValue({
        layout: vi.fn().mockReturnThis(),
        setDepth: vi.fn().mockReturnThis(),
        setVisible: vi.fn().mockReturnThis(),
        popUp: vi.fn().mockReturnThis(),
        scaleDownDestroy: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      }),
    },
  };
}

function createMockScene(): Phaser.Scene {
  const mockRexUI = createMockRexUI();

  const scene = {
    add: {
      container: vi.fn().mockImplementation(() => createMockContainer()),
      rectangle: vi.fn().mockImplementation(() => ({
        setOrigin: vi.fn().mockReturnThis(),
        setStrokeStyle: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        setAlpha: vi.fn().mockReturnThis(),
        setFillStyle: vi.fn().mockReturnThis(),
        setDepth: vi.fn().mockReturnThis(),
        setVisible: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        off: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      })),
      text: vi.fn().mockImplementation(() => createMockText()),
    },
    make: {
      text: vi.fn().mockImplementation(() => createMockText()),
      container: vi.fn().mockImplementation(() => createMockContainer()),
    },
    cameras: {
      main: { width: 1280, height: 720 },
    },
    children: {
      remove: vi.fn(),
    },
    scale: {
      width: 1280,
      height: 720,
    },
    tweens: {
      add: vi.fn().mockReturnValue({ stop: vi.fn() }),
    },
    time: {
      delayedCall: vi.fn(),
    },
    rexUI: mockRexUI,
  } as unknown as Phaser.Scene;

  return scene;
}

function createSamplePreviewData(): IAPOverflowPreviewData {
  return {
    actionName: '採取',
    currentAP: 1,
    consumeAP: 3,
    overflowAP: 2,
    daysConsumed: 1,
    nextDayAP: 1,
  };
}

function createSampleOverflowResult(): IAPOverflowResult {
  return {
    hasOverflow: true,
    overflowAP: 2,
    daysConsumed: 1,
    nextDayAP: 1,
    remainingAP: 0,
  };
}

// =============================================================================
// テスト
// =============================================================================

describe('APOverflowPreview（TASK-0115）', () => {
  let mockScene: Phaser.Scene;

  beforeEach(() => {
    vi.clearAllMocks();
    mockScene = createMockScene();
  });

  // ===========================================================================
  // テストケース1: プレビューダイアログの表示
  // ===========================================================================

  describe('プレビューダイアログの表示', () => {
    it('T-0115-01: show()でプレビューデータが設定される', () => {
      // 【テスト目的】: AP超過プレビューダイアログが表示されること
      // 🟡 NFR-102・design-interview.md D7から妥当な推測

      const preview = new APOverflowPreview(mockScene);
      preview.create();

      const data = createSamplePreviewData();
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      preview.show(data, onConfirm, onCancel);

      expect(preview.isVisible()).toBe(true);
      expect(preview.getPreviewData()).toEqual(data);
    });

    it('create()直後はisVisible()がfalse', () => {
      const preview = new APOverflowPreview(mockScene);
      preview.create();

      expect(preview.isVisible()).toBe(false);
      expect(preview.getPreviewData()).toBeNull();
    });
  });

  // ===========================================================================
  // テストケース2: 続行ボタンでコールバック
  // ===========================================================================

  describe('続行ボタンでコールバック', () => {
    it('T-0115-02: confirm()でonConfirmコールバックが呼ばれる', () => {
      // 【テスト目的】: 「続行」ボタンでonConfirmコールバックが呼ばれること
      // 🟡 NFR-102から妥当な推測

      const preview = new APOverflowPreview(mockScene);
      preview.create();

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      preview.show(createSamplePreviewData(), onConfirm, onCancel);
      preview.confirm();

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(preview.isVisible()).toBe(false);
    });

    it('confirm()後にgetPreviewData()がnullを返す', () => {
      const preview = new APOverflowPreview(mockScene);
      preview.create();

      preview.show(createSamplePreviewData(), vi.fn(), vi.fn());
      preview.confirm();

      expect(preview.getPreviewData()).toBeNull();
    });
  });

  // ===========================================================================
  // テストケース3: キャンセルボタンでコールバック
  // ===========================================================================

  describe('キャンセルボタンでコールバック', () => {
    it('T-0115-03: cancel()でonCancelコールバックが呼ばれる', () => {
      // 【テスト目的】: 「キャンセル」ボタンでonCancelコールバックが呼ばれること
      // 🟡 NFR-102から妥当な推測

      const preview = new APOverflowPreview(mockScene);
      preview.create();

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      preview.show(createSamplePreviewData(), onConfirm, onCancel);
      preview.cancel();

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(preview.isVisible()).toBe(false);
    });

    it('cancel()後にgetPreviewData()がnullを返す', () => {
      const preview = new APOverflowPreview(mockScene);
      preview.create();

      preview.show(createSamplePreviewData(), vi.fn(), vi.fn());
      preview.cancel();

      expect(preview.getPreviewData()).toBeNull();
    });
  });

  // ===========================================================================
  // テストケース4: fromOverflowResult静的メソッド
  // ===========================================================================

  describe('fromOverflowResult静的メソッド', () => {
    it('IAPOverflowResultからIAPOverflowPreviewDataを生成できる', () => {
      const result = createSampleOverflowResult();
      const data = APOverflowPreview.createPreviewData(result, '採取', 1, 3);

      expect(data.actionName).toBe('採取');
      expect(data.currentAP).toBe(1);
      expect(data.consumeAP).toBe(3);
      expect(data.overflowAP).toBe(2);
      expect(data.daysConsumed).toBe(1);
      expect(data.nextDayAP).toBe(1);
    });
  });

  // ===========================================================================
  // テストケース5: 非表示時のconfirm/cancel
  // ===========================================================================

  describe('非表示時の操作', () => {
    it('show()前にconfirm()を呼んでもエラーにならない', () => {
      const preview = new APOverflowPreview(mockScene);
      preview.create();

      expect(() => preview.confirm()).not.toThrow();
    });

    it('show()前にcancel()を呼んでもエラーにならない', () => {
      const preview = new APOverflowPreview(mockScene);
      preview.create();

      expect(() => preview.cancel()).not.toThrow();
    });
  });

  // ===========================================================================
  // テストケース6: destroy
  // ===========================================================================

  describe('destroy', () => {
    it('destroy()でリソースが解放される', () => {
      const preview = new APOverflowPreview(mockScene);
      preview.create();

      expect(() => preview.destroy()).not.toThrow();
    });

    it('show()中にdestroy()してもエラーにならない', () => {
      const preview = new APOverflowPreview(mockScene);
      preview.create();

      preview.show(createSamplePreviewData(), vi.fn(), vi.fn());

      expect(() => preview.destroy()).not.toThrow();
    });
  });
});
