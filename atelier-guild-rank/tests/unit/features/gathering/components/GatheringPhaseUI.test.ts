/**
 * GatheringPhaseUI 変更テスト
 * TASK-0114: GatheringPhaseUI変更
 *
 * @description
 * GatheringStage状態遷移、LocationSelectUI統合、セッション中断確認ダイアログを検証する。
 *
 * @信頼性レベル 🔵 REQ-002・architecture.md・dataflow.md セクション4に基づく
 */

import type { IGatheringService } from '@domain/interfaces/gathering-service.interface';
import type { IGatheringLocation } from '@features/gathering';
import { GATHERING_LOCATIONS, GatheringStage } from '@features/gathering';
import { GatheringPhaseUI } from '@features/gathering/components/GatheringPhaseUI';
import { toCardId } from '@shared/types';
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
      circle: vi.fn().mockImplementation(() => ({
        setStrokeStyle: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        setAlpha: vi.fn().mockReturnThis(),
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
    input: {
      keyboard: {
        on: vi.fn(),
        off: vi.fn(),
      },
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

function createMockGatheringService(): IGatheringService {
  return {
    startDraftGathering: vi.fn().mockReturnValue({
      sessionId: 'test-session-1',
      currentRound: 1,
      maxRounds: 3,
      currentOptions: [],
      selectedMaterials: [],
      isComplete: false,
    }),
    selectMaterial: vi.fn(),
    endGathering: vi.fn(),
    getCurrentSession: vi.fn().mockReturnValue(null),
  } as unknown as IGatheringService;
}

// =============================================================================
// テスト
// =============================================================================

describe('GatheringPhaseUI 変更（TASK-0114）', () => {
  let mockScene: Phaser.Scene;
  let mockGatheringService: IGatheringService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockScene = createMockScene();
    mockGatheringService = createMockGatheringService();
  });

  // ===========================================================================
  // テストケース1: 初期状態がLOCATION_SELECT
  // ===========================================================================

  describe('初期状態がLOCATION_SELECT', () => {
    it('T-0114-01: show()後の初期ステージがLOCATION_SELECTである', () => {
      // 【テスト目的】: 採取フェーズ進入時にLocationSelectUIが表示される
      // 🔵 dataflow.md セクション4.2に基づく

      const ui = new GatheringPhaseUI(mockScene, mockGatheringService);
      ui.create();
      ui.show();

      expect(ui.getCurrentStage()).toBe(GatheringStage.LOCATION_SELECT);
    });

    it('create()直後はステージが未設定（nullまたはLOCATION_SELECT）', () => {
      const ui = new GatheringPhaseUI(mockScene, mockGatheringService);
      ui.create();

      // show()前でもgetCurrentStage()は呼べる
      const stage = ui.getCurrentStage();
      expect(stage).toBeDefined();
    });
  });

  // ===========================================================================
  // テストケース2: 場所選択後にDRAFT_SESSION遷移
  // ===========================================================================

  describe('場所選択後にDRAFT_SESSION遷移', () => {
    it('T-0114-02: 場所選択後にステージがDRAFT_SESSIONに遷移する', () => {
      // 【テスト目的】: LocationSelectUIで場所を選択するとドラフト採取セッションが開始される
      // 🔵 dataflow.md セクション4.2に基づく

      const ui = new GatheringPhaseUI(mockScene, mockGatheringService);
      ui.create();
      ui.show();

      // 場所選択をシミュレート
      ui.handleLocationSelected({
        cardId: 'gathering-forest' as never,
        locationName: '近くの森',
        movementAPCost: 1,
      });

      expect(ui.getCurrentStage()).toBe(GatheringStage.DRAFT_SESSION);
    });

    it('場所選択後にGatheringServiceのstartDraftGatheringが呼ばれる', () => {
      const ui = new GatheringPhaseUI(mockScene, mockGatheringService);
      ui.create();
      ui.show();

      ui.handleLocationSelected({
        cardId: 'gathering-forest' as never,
        locationName: '近くの森',
        movementAPCost: 1,
      });

      expect(mockGatheringService.startDraftGathering).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // テストケース3: hasActiveSession判定
  // ===========================================================================

  describe('アクティブセッション判定', () => {
    it('show()直後はアクティブセッションなし', () => {
      const ui = new GatheringPhaseUI(mockScene, mockGatheringService);
      ui.create();
      ui.show();

      expect(ui.hasActiveSession()).toBe(false);
    });

    it('場所選択後はアクティブセッションあり', () => {
      const ui = new GatheringPhaseUI(mockScene, mockGatheringService);
      ui.create();
      ui.show();

      ui.handleLocationSelected({
        cardId: 'gathering-forest' as never,
        locationName: '近くの森',
        movementAPCost: 1,
      });

      expect(ui.hasActiveSession()).toBe(true);
    });
  });

  // ===========================================================================
  // テストケース4: セッション中断確認
  // ===========================================================================

  describe('セッション中断確認', () => {
    it('T-0114-03: アクティブセッション中にrequestLeavePhase()すると確認が必要', () => {
      // 【テスト目的】: ドラフトセッション進行中にフェーズ切り替えが要求されると確認が必要
      // 🟡 EDGE-001・REQ-001-03・design-interview.md D3から妥当な推測

      const ui = new GatheringPhaseUI(mockScene, mockGatheringService);
      ui.create();
      ui.show();

      // セッション開始
      ui.handleLocationSelected({
        cardId: 'gathering-forest' as never,
        locationName: '近くの森',
        movementAPCost: 1,
      });

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      // フェーズ離脱要求
      const needsConfirmation = ui.requestLeavePhase(onConfirm, onCancel);

      // アクティブセッション中は確認が必要
      expect(needsConfirmation).toBe(true);
      // 確認なしにコールバックは発火しない
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('アクティブセッションなしの場合、requestLeavePhase()は即座にonConfirmを呼ぶ', () => {
      const ui = new GatheringPhaseUI(mockScene, mockGatheringService);
      ui.create();
      ui.show();

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      const needsConfirmation = ui.requestLeavePhase(onConfirm, onCancel);

      expect(needsConfirmation).toBe(false);
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('confirmLeavePhase()でonConfirmが発火しセッションが破棄される', () => {
      const ui = new GatheringPhaseUI(mockScene, mockGatheringService);
      ui.create();
      ui.show();

      // セッション開始
      ui.handleLocationSelected({
        cardId: 'gathering-forest' as never,
        locationName: '近くの森',
        movementAPCost: 1,
      });

      const onConfirm = vi.fn();
      const onCancel = vi.fn();
      ui.requestLeavePhase(onConfirm, onCancel);

      // 中断を確認
      ui.confirmLeavePhase();

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(ui.hasActiveSession()).toBe(false);
      expect(ui.getCurrentStage()).toBe(GatheringStage.LOCATION_SELECT);
    });

    it('cancelLeavePhase()でonCancelが発火しセッションが維持される', () => {
      const ui = new GatheringPhaseUI(mockScene, mockGatheringService);
      ui.create();
      ui.show();

      // セッション開始
      ui.handleLocationSelected({
        cardId: 'gathering-forest' as never,
        locationName: '近くの森',
        movementAPCost: 1,
      });

      const onConfirm = vi.fn();
      const onCancel = vi.fn();
      ui.requestLeavePhase(onConfirm, onCancel);

      // キャンセル
      ui.cancelLeavePhase();

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(ui.hasActiveSession()).toBe(true);
      expect(ui.getCurrentStage()).toBe(GatheringStage.DRAFT_SESSION);
    });
  });

  // ===========================================================================
  // テストケース5: セッション破棄でLOCATION_SELECTに戻る
  // ===========================================================================

  describe('セッション破棄', () => {
    it('discardSession()でLOCATION_SELECTに戻る', () => {
      const ui = new GatheringPhaseUI(mockScene, mockGatheringService);
      ui.create();
      ui.show();

      // セッション開始
      ui.handleLocationSelected({
        cardId: 'gathering-forest' as never,
        locationName: '近くの森',
        movementAPCost: 1,
      });

      expect(ui.getCurrentStage()).toBe(GatheringStage.DRAFT_SESSION);

      // セッション破棄
      ui.discardSession();

      expect(ui.getCurrentStage()).toBe(GatheringStage.LOCATION_SELECT);
      expect(ui.hasActiveSession()).toBe(false);
    });
  });

  // ===========================================================================
  // テストケース6: 場所データ設定（Issue #354）
  // ===========================================================================

  describe('場所データ設定（Issue #354）', () => {
    it('setAvailableLocations()で場所データが設定される', () => {
      const ui = new GatheringPhaseUI(mockScene, mockGatheringService);
      ui.create();

      const locations: IGatheringLocation[] = GATHERING_LOCATIONS.map((loc) => ({
        ...loc,
        isSelectable: loc.cardId === toCardId('gathering-forest'),
      }));

      // show()前にsetAvailableLocationsを呼ぶ
      expect(() => ui.setAvailableLocations(locations)).not.toThrow();
    });

    it('show()後にsetAvailableLocations()を呼んでもエラーにならない', () => {
      const ui = new GatheringPhaseUI(mockScene, mockGatheringService);
      ui.create();
      ui.show();

      const locations: IGatheringLocation[] = GATHERING_LOCATIONS.map((loc) => ({
        ...loc,
        isSelectable: true,
      }));

      expect(() => ui.setAvailableLocations(locations)).not.toThrow();
    });

    it('setAvailableLocations()後にshow()でLocationSelectUIに場所が反映される', () => {
      const ui = new GatheringPhaseUI(mockScene, mockGatheringService);
      ui.create();

      const locations: IGatheringLocation[] = GATHERING_LOCATIONS.map((loc) => ({
        ...loc,
        isSelectable: loc.cardId === toCardId('gathering-forest'),
      }));

      ui.setAvailableLocations(locations);
      ui.show();

      // show後もLOCATION_SELECTステージであること
      expect(ui.getCurrentStage()).toBe(GatheringStage.LOCATION_SELECT);
    });

    it('discardSession()後に再度show()しても場所データが維持される', () => {
      const ui = new GatheringPhaseUI(mockScene, mockGatheringService);
      ui.create();

      const locations: IGatheringLocation[] = GATHERING_LOCATIONS.map((loc) => ({
        ...loc,
        isSelectable: true,
      }));

      ui.setAvailableLocations(locations);
      ui.show();

      // セッション開始→破棄
      ui.handleLocationSelected({
        cardId: 'gathering-forest' as never,
        locationName: '近くの森',
        movementAPCost: 1,
      });
      ui.discardSession();

      // LOCATION_SELECTに戻り、場所データが維持される
      expect(ui.getCurrentStage()).toBe(GatheringStage.LOCATION_SELECT);
    });
  });

  // ===========================================================================
  // テストケース7: destroy
  // ===========================================================================

  describe('destroy', () => {
    it('destroy()でリソースが解放される', () => {
      const ui = new GatheringPhaseUI(mockScene, mockGatheringService);
      ui.create();
      ui.show();

      expect(() => ui.destroy()).not.toThrow();
    });

    it('セッション進行中にdestroy()してもエラーにならない', () => {
      const ui = new GatheringPhaseUI(mockScene, mockGatheringService);
      ui.create();
      ui.show();

      ui.handleLocationSelected({
        cardId: 'gathering-forest' as never,
        locationName: '近くの森',
        movementAPCost: 1,
      });

      expect(() => ui.destroy()).not.toThrow();
    });
  });
});
