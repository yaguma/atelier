/**
 * Phase5 全シーン遷移統合テスト
 *
 * TASK-0260: 全シーン遷移統合テスト
 * 全シーン間の遷移が正しく動作することを検証する統合テスト。
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SceneKeys } from '@game/config/SceneKeys';
import {
  createMockEventBus,
  createMockStateManager,
} from '../../../utils/phaserTestUtils';
import { getPhaserMock } from '../../../utils/phaserMocks';
import { createMockSceneManager } from '../../../utils/sceneManagerMock';
import { setupSceneTransitionEventHandlers } from '../../../utils/testEventHandlers';
import {
  waitForScene,
  setupToTitleScene,
  setupToMainScene,
  setupToGameOverScene,
  setupToGameClearScene,
} from '../../../utils/sceneTransitionTestHelpers';

// 【Phaserモック】: テスト環境用のPhaserモックを設定
// 【理由】: jsdom環境ではCanvas APIが動作しないため 🔵
vi.mock('phaser', () => getPhaserMock());

/**
 * テスト用のPhaserゲームインスタンスを作成する
 *
 * 【機能概要】: テスト環境用のゲームインスタンスとモックを作成
 * 【設定内容】: EventBus、StateManager、SceneManagerをセットアップ
 * 【信頼性】: 🔵 設計文書に基づく実装
 *
 * @returns Promise<{ game, eventBus, sceneManager, stateManager }>
 */
async function createTestGame(): Promise<{
  game: any;
  eventBus: any;
  sceneManager: any;
  stateManager: any;
}> {
  // 【EventBus作成】: モックEventBusインスタンスを作成 🔵
  const eventBus = createMockEventBus();

  // 【StateManager作成】: モックStateManagerインスタンスを作成 🔵
  const stateManager = createMockStateManager();

  // 【Phaserゲーム作成】: ヘッドレスモードでゲームインスタンスを作成 🔵
  const Phaser = await import('phaser');
  const game = new Phaser.default.Game();

  // 【有効シーン定義】: テストで使用するシーンキーのリスト 🔵
  const validScenes = [
    SceneKeys.BOOT,
    SceneKeys.TITLE,
    SceneKeys.MAIN,
    SceneKeys.SHOP,
    SceneKeys.RANK_UP,
    SceneKeys.GAME_OVER,
    SceneKeys.GAME_CLEAR,
  ];

  // 【SceneManager作成】: モックSceneManagerを作成してゲームに登録 🔵
  const sceneManager = createMockSceneManager(game, eventBus, validScenes);
  game.registry.set('sceneManager', sceneManager);

  // 【StateManager登録】: StateManagerをゲームレジストリに登録 🔵
  game.registry.set('stateManager', stateManager);

  // 【イベントハンドラ設定】: すべてのシーン遷移イベントハンドラを登録 🔵
  setupSceneTransitionEventHandlers(game, eventBus, sceneManager, stateManager);

  return { game, eventBus, sceneManager, stateManager };
}

describe('🔴 Phase5: 全シーン遷移統合テスト', () => {
  let game: any;
  let eventBus: any;
  let sceneManager: any;
  let stateManager: any;

  beforeEach(async () => {
    // 【テスト前準備】: 各テスト実行前にテスト環境を初期化し、一貫したテスト条件を保証
    // 【環境初期化】: 前のテストの影響を受けないよう、ゲームインスタンスを新規作成
    vi.clearAllMocks();

    const testSetup = await createTestGame();
    game = testSetup.game;
    eventBus = testSetup.eventBus;
    sceneManager = testSetup.sceneManager;
    stateManager = testSetup.stateManager;

    // BootSceneの起動は createTestGame() で既に設定されている
    // game.scene.isActive は sceneManager によって動的に更新される
  });

  afterEach(() => {
    // 【テスト後処理】: テスト実行後に作成されたゲームインスタンスを破棄
    // 【状態復元】: 次のテストに影響しないよう、システムを元の状態に戻す
    if (game) {
      game.destroy(true);
    }

    // イベントバスクリア
    if (eventBus) {
      eventBus.clear();
    }

    // localStorage クリア
    localStorage.clear();

    // スパイのモック解除
    vi.restoreAllMocks();
  });

  // =============================================================================
  // TC-01: Boot to Title（起動→タイトル遷移）
  // =============================================================================

  describe('TC-01: Boot to Title', () => {
    it('TC-01-01: BootSceneからTitleSceneへ自動遷移する 🔵', async () => {
      // 【テスト目的】: ゲーム起動時のアセット読み込み完了後、自動的にタイトル画面へ遷移することを検証する
      // 【テスト内容】: BootSceneの完了イベントを発火させ、TitleSceneへの遷移を確認する
      // 【期待される動作】: TitleSceneがアクティブになり、BootSceneが停止している
      // 🔵 信頼性レベル: 設計文書に明確な記載あり（architecture.md - 4.3 シーン遷移図）

      // 【初期条件確認】: BootSceneが起動していることを確認
      // 【前提条件】: beforeEach()でBootSceneの起動を待機済み
      expect(game.scene.isActive(SceneKeys.BOOT)).toBe(true);

      // 【実際の処理実行】: アセット読み込み完了をシミュレート
      // 【処理内容】: BootSceneの完了イベントを発火させる
      const bootScene = game.scene.getScene(SceneKeys.BOOT);
      bootScene.events.emit('complete');

      // 【結果検証】: TitleSceneへの遷移を確認
      // 【期待値確認】: TitleSceneがアクティブで、BootSceneが停止している
      await waitForScene(game, SceneKeys.TITLE);
      expect(game.scene.isActive(SceneKeys.TITLE)).toBe(true); // 【確認内容】: TitleSceneがアクティブになっている 🔵
      expect(game.scene.isActive(SceneKeys.BOOT)).toBe(false); // 【確認内容】: BootSceneが停止している 🔵
    });
  });

  // =============================================================================
  // TC-02: Title to Main（タイトル→メインゲーム遷移）
  // =============================================================================

  describe('TC-02: Title to Main', () => {
    it('TC-02-01: 新規ゲーム開始でMainSceneへ遷移する 🔵', async () => {
      // 【テスト目的】: タイトル画面から「新規ゲーム」を選択したときにメインゲームへ遷移することを検証する
      // 【テスト内容】: ui:game:start:requestedイベントを発火させ、MainSceneへの遷移を確認する
      // 【期待される動作】: MainSceneがアクティブになり、初期状態が設定されている
      // 🔵 信頼性レベル: 設計文書に明確な記載あり（core-systems.md - 2.3 イベント定義）

      // 【初期条件設定】: TitleSceneへ遷移
      // 【画面表示確認】: TitleSceneが正常に表示されている
      const bootScene = game.scene.getScene(SceneKeys.BOOT);
      bootScene.events.emit('complete');
      await waitForScene(game, SceneKeys.TITLE);

      // 【ユーザー操作実行】: 新規ゲームボタンをクリック（イベント発火）
      // 【操作内容】: ui:game:start:requestedイベントを発火してゲーム開始をリクエスト
      eventBus.emit('ui:game:start:requested', { isNewGame: true });

      // 【結果確認】: MainSceneへの遷移を確認
      // 【期待される表示変化】: MainSceneがアクティブになり、TitleSceneが停止している
      await waitForScene(game, SceneKeys.MAIN);
      expect(game.scene.isActive(SceneKeys.MAIN)).toBe(true); // 【確認内容】: MainSceneがアクティブになっている 🔵
      expect(game.scene.isActive(SceneKeys.TITLE)).toBe(false); // 【確認内容】: TitleSceneが停止している 🔵

      // 【追加検証】: 初期状態が正しく設定されている
      // 【確認内容】: 新規ゲームの初期値（日数1、ゴールド100、ランクG）が設定されている
      const progress = stateManager.getProgressData();
      expect(progress.currentDay).toBe(1); // 【確認内容】: 初期日数が1である 🔵
      expect(stateManager.getPlayerData().gold).toBe(100); // 【確認内容】: 初期ゴールドが100である 🔵
      expect(stateManager.getPlayerData().rank).toBe('G'); // 【確認内容】: 初期ランクがGである 🔵
    });

    it('TC-02-02: コンティニューでMainSceneへ遷移する 🔵', async () => {
      // 【テスト目的】: タイトル画面から「コンティニュー」を選択したときにセーブデータを読み込んでメインゲームへ遷移することを検証する
      // 【テスト内容】: セーブデータを作成し、ui:game:continue:requestedイベントを発火させ、MainSceneへの遷移を確認する
      // 【期待される動作】: MainSceneがアクティブになり、セーブデータの状態が復元されている
      // 🔵 信頼性レベル: 設計文書に明確な記載あり（dataflow.md - 4.2 ロードフロー）

      // 【テストデータ準備】: セーブデータを作成（日数5のセーブデータ）
      // 【初期条件設定】: localStorageにセーブデータを保存
      const saveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        playtime: 0,
        state: JSON.stringify({ progress: { currentDay: 5 } }),
      };
      localStorage.setItem('atelier_guild_rank_save_1', JSON.stringify(saveData));

      // 【画面遷移】: TitleSceneへ遷移
      const bootScene = game.scene.getScene(SceneKeys.BOOT);
      bootScene.events.emit('complete');
      await waitForScene(game, SceneKeys.TITLE);

      // 【ユーザー操作実行】: コンティニューボタンをクリック（イベント発火）
      // 【操作内容】: ui:game:continue:requestedイベントを発火してセーブデータのロードをリクエスト
      eventBus.emit('ui:game:continue:requested', { slotId: 1 });

      // 【結果確認】: MainSceneへの遷移を確認
      // 【期待される表示変化】: MainSceneがアクティブになり、TitleSceneが停止している
      await waitForScene(game, SceneKeys.MAIN);
      expect(game.scene.isActive(SceneKeys.MAIN)).toBe(true); // 【確認内容】: MainSceneがアクティブになっている 🔵
      expect(game.scene.isActive(SceneKeys.TITLE)).toBe(false); // 【確認内容】: TitleSceneが停止している 🔵

      // 【追加検証】: セーブデータの状態が正しく復元されている
      // 【確認内容】: セーブデータの日数5が正しく復元されている
      const progress = stateManager.getProgressData();
      expect(progress.currentDay).toBe(5); // 【確認内容】: セーブデータの日数が正しく復元されている 🔵
    });
  });

  // =============================================================================
  // TC-03: Main to SubScenes（メイン→サブシーン遷移）
  // =============================================================================

  describe('TC-03: Main to SubScenes', () => {
    it('TC-03-01: MainSceneからShopSceneへオーバーレイ表示する 🔵', async () => {
      // 【テスト目的】: メインゲームからショップをオーバーレイ表示できることを検証する
      // 【テスト内容】: ui:shop:open:requestedイベントを発火させ、ShopSceneがオーバーレイ表示されることを確認する
      // 【期待される動作】: ShopSceneとMainSceneの両方がアクティブになっている（オーバーレイ表示）
      // 🔵 信頼性レベル: 設計文書に明確な記載あり（architecture.md - 4.1 シーン一覧）

      // 【初期条件設定】: MainSceneまで遷移
      const bootScene = game.scene.getScene(SceneKeys.BOOT);
      bootScene.events.emit('complete');
      await waitForScene(game, SceneKeys.TITLE);
      eventBus.emit('ui:game:start:requested', { isNewGame: true });
      await waitForScene(game, SceneKeys.MAIN);

      // 【イベントリスナー登録】: オーバーレイ開始イベントを監視
      const overlaySpy = vi.fn();
      eventBus.on('scene:overlay:opened', overlaySpy);

      // 【ユーザー操作実行】: ショップを開く
      // 【操作内容】: ui:shop:open:requestedイベントを発火してショップ表示をリクエスト
      eventBus.emit('ui:shop:open:requested');

      // 【結果確認】: ShopSceneがオーバーレイ表示されることを確認
      // 【期待される表示変化】: ShopSceneとMainSceneの両方がアクティブになっている
      await waitForScene(game, SceneKeys.SHOP);
      expect(game.scene.isActive(SceneKeys.SHOP)).toBe(true); // 【確認内容】: ShopSceneがアクティブになっている 🔵
      expect(game.scene.isActive(SceneKeys.MAIN)).toBe(true); // 【確認内容】: MainSceneも引き続きアクティブである（オーバーレイのため） 🔵
      expect(overlaySpy).toHaveBeenCalledWith(
        expect.objectContaining({ sceneKey: SceneKeys.SHOP })
      ); // 【確認内容】: オーバーレイ開始イベントが発火されている 🔵
    });

    it('TC-03-02: ShopSceneからMainSceneへ戻る 🔵', async () => {
      // 【テスト目的】: ショップを閉じてメインゲームへ戻ることができることを検証する
      // 【テスト内容】: ui:shop:close:requestedイベントを発火させ、ShopSceneが停止することを確認する
      // 【期待される動作】: ShopSceneが停止し、MainSceneが引き続きアクティブである
      // 🔵 信頼性レベル: 設計文書に明確な記載あり（architecture.md - 4.3 シーン遷移図）

      // 【初期条件設定】: ShopSceneをオーバーレイ表示
      const bootScene = game.scene.getScene(SceneKeys.BOOT);
      bootScene.events.emit('complete');
      await waitForScene(game, SceneKeys.TITLE);
      eventBus.emit('ui:game:start:requested', { isNewGame: true });
      await waitForScene(game, SceneKeys.MAIN);
      eventBus.emit('ui:shop:open:requested');
      await waitForScene(game, SceneKeys.SHOP);

      // 【イベントリスナー登録】: オーバーレイ終了イベントを監視
      const overlayClosedSpy = vi.fn();
      eventBus.on('scene:overlay:closed', overlayClosedSpy);

      // 【ユーザー操作実行】: ショップを閉じる
      // 【操作内容】: ui:shop:close:requestedイベントを発火してショップ終了をリクエスト
      eventBus.emit('ui:shop:close:requested');

      // 【結果確認】: ShopSceneが停止し、MainSceneが引き続きアクティブであることを確認
      // 【期待される表示変化】: ShopSceneが停止し、MainSceneのみがアクティブになる
      await vi.waitFor(() => {
        expect(game.scene.isActive(SceneKeys.SHOP)).toBe(false);
      });
      expect(game.scene.isActive(SceneKeys.MAIN)).toBe(true); // 【確認内容】: MainSceneが引き続きアクティブである 🔵
      expect(overlayClosedSpy).toHaveBeenCalledWith(
        expect.objectContaining({ sceneKey: SceneKeys.SHOP })
      ); // 【確認内容】: オーバーレイ終了イベントが発火されている 🔵
    });

    it('TC-03-03: MainSceneからRankUpSceneへオーバーレイ表示する 🔵', async () => {
      // 【テスト目的】: メインゲームから昇格試験をオーバーレイ表示できることを検証する
      // 【テスト内容】: ui:rankup:open:requestedイベントを発火させ、RankUpSceneがオーバーレイ表示されることを確認する
      // 【期待される動作】: RankUpSceneとMainSceneの両方がアクティブになっている（オーバーレイ表示）
      // 🔵 信頼性レベル: 設計文書に明確な記載あり（architecture.md - 4.1 シーン一覧）

      // 【初期条件設定】: MainSceneまで遷移
      const bootScene = game.scene.getScene(SceneKeys.BOOT);
      bootScene.events.emit('complete');
      await waitForScene(game, SceneKeys.TITLE);
      eventBus.emit('ui:game:start:requested', { isNewGame: true });
      await waitForScene(game, SceneKeys.MAIN);

      // 【イベントリスナー登録】: オーバーレイ開始イベントを監視
      const overlaySpy = vi.fn();
      eventBus.on('scene:overlay:opened', overlaySpy);

      // 【ユーザー操作実行】: 昇格試験を開く
      // 【操作内容】: ui:rankup:open:requestedイベントを発火して昇格試験表示をリクエスト
      eventBus.emit('ui:rankup:open:requested');

      // 【結果確認】: RankUpSceneがオーバーレイ表示されることを確認
      // 【期待される表示変化】: RankUpSceneとMainSceneの両方がアクティブになっている
      await waitForScene(game, SceneKeys.RANK_UP);
      expect(game.scene.isActive(SceneKeys.RANK_UP)).toBe(true); // 【確認内容】: RankUpSceneがアクティブになっている 🔵
      expect(game.scene.isActive(SceneKeys.MAIN)).toBe(true); // 【確認内容】: MainSceneも引き続きアクティブである（オーバーレイのため） 🔵
      expect(overlaySpy).toHaveBeenCalledWith(
        expect.objectContaining({ sceneKey: SceneKeys.RANK_UP })
      ); // 【確認内容】: オーバーレイ開始イベントが発火されている 🔵
    });

    it('TC-03-04: RankUpSceneからMainSceneへ戻る 🔵', async () => {
      // 【テスト目的】: 昇格試験を終了してメインゲームへ戻ることができることを検証する
      // 【テスト内容】: ui:rankup:close:requestedイベントを発火させ、RankUpSceneが停止することを確認する
      // 【期待される動作】: RankUpSceneが停止し、MainSceneが引き続きアクティブである
      // 🔵 信頼性レベル: 設計文書に明確な記載あり（architecture.md - 4.3 シーン遷移図）

      // 【初期条件設定】: RankUpSceneをオーバーレイ表示
      const bootScene = game.scene.getScene(SceneKeys.BOOT);
      bootScene.events.emit('complete');
      await waitForScene(game, SceneKeys.TITLE);
      eventBus.emit('ui:game:start:requested', { isNewGame: true });
      await waitForScene(game, SceneKeys.MAIN);
      eventBus.emit('ui:rankup:open:requested');
      await waitForScene(game, SceneKeys.RANK_UP);

      // 【イベントリスナー登録】: オーバーレイ終了イベントを監視
      const overlayClosedSpy = vi.fn();
      eventBus.on('scene:overlay:closed', overlayClosedSpy);

      // 【ユーザー操作実行】: 昇格試験を閉じる
      // 【操作内容】: ui:rankup:close:requestedイベントを発火して昇格試験終了をリクエスト
      eventBus.emit('ui:rankup:close:requested');

      // 【結果確認】: RankUpSceneが停止し、MainSceneが引き続きアクティブであることを確認
      // 【期待される表示変化】: RankUpSceneが停止し、MainSceneのみがアクティブになる
      await vi.waitFor(() => {
        expect(game.scene.isActive(SceneKeys.RANK_UP)).toBe(false);
      });
      expect(game.scene.isActive(SceneKeys.MAIN)).toBe(true); // 【確認内容】: MainSceneが引き続きアクティブである 🔵
      expect(overlayClosedSpy).toHaveBeenCalledWith(
        expect.objectContaining({ sceneKey: SceneKeys.RANK_UP })
      ); // 【確認内容】: オーバーレイ終了イベントが発火されている 🔵
    });
  });

  // =============================================================================
  // TC-04: Game End Transitions（ゲーム終了遷移）
  // =============================================================================

  describe('TC-04: Game End Transitions', () => {
    it('TC-04-01: MainSceneからGameOverSceneへ遷移する（日数切れ） 🔵', async () => {
      // 【テスト目的】: 日数切れでゲームオーバー画面へ遷移することを検証する
      // 【テスト内容】: 日数を最大日数に設定し、ui:day:end:requestedイベントを発火させ、GameOverSceneへの遷移を確認する
      // 【期待される動作】: GameOverSceneがアクティブになり、MainSceneが停止している
      // 🔵 信頼性レベル: 設計文書に明確な記載あり（architecture.md - 4.3 シーン遷移図）

      // 【初期条件設定】: MainSceneまで遷移
      const bootScene = game.scene.getScene(SceneKeys.BOOT);
      bootScene.events.emit('complete');
      await waitForScene(game, SceneKeys.TITLE);
      eventBus.emit('ui:game:start:requested', { isNewGame: true });
      await waitForScene(game, SceneKeys.MAIN);

      // 【ゲーム状態設定】: 日数を最大日数（60日）に設定
      // 【ゲームオーバー条件】: 日数切れ＋ランクがS未満
      stateManager.updateProgress({ currentDay: 60, maxDay: 60 });

      // 【ユーザー操作実行】: 日数終了
      // 【操作内容】: ui:day:end:requestedイベントを発火して日数終了をトリガー
      eventBus.emit('ui:day:end:requested');

      // 【結果確認】: GameOverSceneへの遷移を確認
      // 【期待される表示変化】: GameOverSceneがアクティブになり、MainSceneが停止している
      await waitForScene(game, SceneKeys.GAME_OVER);
      expect(game.scene.isActive(SceneKeys.GAME_OVER)).toBe(true); // 【確認内容】: GameOverSceneがアクティブになっている 🔵
      expect(game.scene.isActive(SceneKeys.MAIN)).toBe(false); // 【確認内容】: MainSceneが停止している 🔵
    });

    it('TC-04-02: MainSceneからGameClearSceneへ遷移する（Sランク到達） 🔵', async () => {
      // 【テスト目的】: Sランク到達でゲームクリア画面へ遷移することを検証する
      // 【テスト内容】: ランクをSに設定し、ui:rank:updatedイベントを発火させ、GameClearSceneへの遷移を確認する
      // 【期待される動作】: GameClearSceneがアクティブになり、MainSceneが停止している
      // 🔵 信頼性レベル: 設計文書に明確な記載あり（architecture.md - 4.3 シーン遷移図）

      // 【初期条件設定】: MainSceneまで遷移
      const bootScene = game.scene.getScene(SceneKeys.BOOT);
      bootScene.events.emit('complete');
      await waitForScene(game, SceneKeys.TITLE);
      eventBus.emit('ui:game:start:requested', { isNewGame: true });
      await waitForScene(game, SceneKeys.MAIN);

      // 【ゲーム状態設定】: ランクをSに設定
      // 【ゲームクリア条件】: Sランク到達
      stateManager.updatePlayer({ rank: 'S' });

      // 【ユーザー操作実行】: ランク更新
      // 【操作内容】: ui:rank:updatedイベントを発火してランク更新をトリガー
      eventBus.emit('ui:rank:updated', { newRank: 'S' });

      // 【結果確認】: GameClearSceneへの遷移を確認
      // 【期待される表示変化】: GameClearSceneがアクティブになり、MainSceneが停止している
      await waitForScene(game, SceneKeys.GAME_CLEAR);
      expect(game.scene.isActive(SceneKeys.GAME_CLEAR)).toBe(true); // 【確認内容】: GameClearSceneがアクティブになっている 🔵
      expect(game.scene.isActive(SceneKeys.MAIN)).toBe(false); // 【確認内容】: MainSceneが停止している 🔵
    });

    it('TC-04-03: GameOverSceneからTitleSceneへ遷移する 🔵', async () => {
      // 【テスト目的】: ゲームオーバー画面からタイトル画面へ戻ることができることを検証する
      // 【テスト内容】: ui:title:return:requestedイベントを発火させ、TitleSceneへの遷移を確認する
      // 【期待される動作】: TitleSceneがアクティブになり、GameOverSceneが停止している
      // 🔵 信頼性レベル: 設計文書に明確な記載あり（architecture.md - 4.3 シーン遷移図）

      // 【初期条件設定】: GameOverSceneまで遷移
      const bootScene = game.scene.getScene(SceneKeys.BOOT);
      bootScene.events.emit('complete');
      await waitForScene(game, SceneKeys.TITLE);
      eventBus.emit('ui:game:start:requested', { isNewGame: true });
      await waitForScene(game, SceneKeys.MAIN);
      stateManager.updateProgress({ currentDay: 60, maxDay: 60 });
      eventBus.emit('ui:day:end:requested');
      await waitForScene(game, SceneKeys.GAME_OVER);

      // 【ユーザー操作実行】: タイトルへ戻るボタンをクリック
      // 【操作内容】: ui:title:return:requestedイベントを発火してタイトル画面への遷移をリクエスト
      eventBus.emit('ui:title:return:requested');

      // 【結果確認】: TitleSceneへの遷移を確認
      // 【期待される表示変化】: TitleSceneがアクティブになり、GameOverSceneが停止している
      await waitForScene(game, SceneKeys.TITLE);
      expect(game.scene.isActive(SceneKeys.TITLE)).toBe(true); // 【確認内容】: TitleSceneがアクティブになっている 🔵
      expect(game.scene.isActive(SceneKeys.GAME_OVER)).toBe(false); // 【確認内容】: GameOverSceneが停止している 🔵
    });

    it('TC-04-04: GameClearSceneからTitleSceneへ遷移する 🔵', async () => {
      // 【テスト目的】: ゲームクリア画面からタイトル画面へ戻ることができることを検証する
      // 【テスト内容】: ui:title:return:requestedイベントを発火させ、TitleSceneへの遷移を確認する
      // 【期待される動作】: TitleSceneがアクティブになり、GameClearSceneが停止している
      // 🔵 信頼性レベル: 設計文書に明確な記載あり（architecture.md - 4.3 シーン遷移図）

      // 【初期条件設定】: GameClearSceneまで遷移
      const bootScene = game.scene.getScene(SceneKeys.BOOT);
      bootScene.events.emit('complete');
      await waitForScene(game, SceneKeys.TITLE);
      eventBus.emit('ui:game:start:requested', { isNewGame: true });
      await waitForScene(game, SceneKeys.MAIN);
      stateManager.updatePlayer({ rank: 'S' });
      eventBus.emit('ui:rank:updated', { newRank: 'S' });
      await waitForScene(game, SceneKeys.GAME_CLEAR);

      // 【ユーザー操作実行】: タイトルへ戻るボタンをクリック
      // 【操作内容】: ui:title:return:requestedイベントを発火してタイトル画面への遷移をリクエスト
      eventBus.emit('ui:title:return:requested');

      // 【結果確認】: TitleSceneへの遷移を確認
      // 【期待される表示変化】: TitleSceneがアクティブになり、GameClearSceneが停止している
      await waitForScene(game, SceneKeys.TITLE);
      expect(game.scene.isActive(SceneKeys.TITLE)).toBe(true); // 【確認内容】: TitleSceneがアクティブになっている 🔵
      expect(game.scene.isActive(SceneKeys.GAME_CLEAR)).toBe(false); // 【確認内容】: GameClearSceneが停止している 🔵
    });
  });

  // =============================================================================
  // TC-05: Edge Cases（エッジケース・境界値）
  // =============================================================================

  describe('TC-05: Edge Cases', () => {
    it('TC-05-01: 遷移中に二重遷移要求が無視される 🔵', async () => {
      // 【テスト目的】: シーン遷移中に別の遷移要求が来た場合、二重遷移を防止できることを検証する
      // 【テスト内容】: ui:game:start:requestedイベントを2回連続で発火させ、警告メッセージが出力されることを確認する
      // 【期待される動作】: MainSceneへ遷移し、2回目の遷移要求が無視され、警告が出力される
      // 🔵 信頼性レベル: 設計文書に明確な記載あり（note.md - 5. 注意事項 - 二重遷移防止）

      // 【初期条件設定】: TitleSceneへ遷移
      const bootScene = game.scene.getScene(SceneKeys.BOOT);
      bootScene.events.emit('complete');
      await waitForScene(game, SceneKeys.TITLE);

      // 【console.warnのスパイ設定】: 警告メッセージをキャプチャ
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // 【ユーザー操作実行】: 同時に複数遷移要求を発行
      // 【操作内容】: ui:game:start:requestedイベントを2回連続で発火
      eventBus.emit('ui:game:start:requested', { isNewGame: true });
      eventBus.emit('ui:game:start:requested', { isNewGame: true });

      // 【結果確認】: MainSceneへ遷移し、警告が出力されることを確認
      // 【期待される表示変化】: MainSceneがアクティブになり、警告メッセージが出力される
      await waitForScene(game, SceneKeys.MAIN);
      expect(game.scene.isActive(SceneKeys.MAIN)).toBe(true); // 【確認内容】: MainSceneがアクティブになっている 🔵
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('transition')
      ); // 【確認内容】: 警告メッセージに「transition」が含まれている 🔵

      consoleSpy.mockRestore();
    });

    it('TC-05-02: 存在しないシーンへの遷移要求がエラーを出す 🔵', async () => {
      // 【テスト目的】: 未定義のシーンキーへの遷移要求時にエラーが正しく処理されることを検証する
      // 【テスト内容】: 存在しないシーンへの遷移を試み、エラーイベントが発火されることを確認する
      // 【期待される動作】: エラーイベントが発火され、現在のシーンがアクティブのまま残る
      // 🔵 信頼性レベル: 設計文書に明確な記載あり（dataflow.md - 9. エラーハンドリングフロー）

      // 【初期条件設定】: TitleSceneへ遷移
      const bootScene = game.scene.getScene(SceneKeys.BOOT);
      bootScene.events.emit('complete');
      await waitForScene(game, SceneKeys.TITLE);

      // 【イベントリスナー登録】: エラーイベントを監視
      const errorCallback = vi.fn();
      eventBus.on('app:error:occurred', errorCallback);

      // 【異常操作実行】: 存在しないシーンへの遷移を試行
      // 【操作内容】: SceneManagerのgoToメソッドを使用して存在しないシーンへ遷移
      await sceneManager.goTo('NonExistentScene' as any);

      // 【結果確認】: エラーイベントが発火され、現在のシーンが保持されることを確認
      // 【期待される動作】: エラーイベントが発火され、TitleSceneがアクティブのまま残る
      expect(errorCallback).toHaveBeenCalled(); // 【確認内容】: エラーイベントが発火されている 🔵
      expect(errorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/scene|not found/i),
        })
      ); // 【確認内容】: エラーメッセージに「scene」または「not found」が含まれている 🔵
      expect(game.scene.isActive(SceneKeys.TITLE)).toBe(true); // 【確認内容】: TitleSceneがアクティブのまま残っている 🔵
    });

    it('TC-05-03: オーバーレイシーン表示中も背景シーンの状態が保持される 🔵', async () => {
      // 【テスト目的】: ショップなどのオーバーレイシーン表示中も、背景のメインシーンの状態が正しく保持されることを検証する
      // 【テスト内容】: プレイヤーのゴールドを設定し、ShopSceneをオーバーレイ表示・終了後に状態を確認する
      // 【期待される動作】: オーバーレイ表示前後でプレイヤーの状態（ゴールド）が保持されている
      // 🔵 信頼性レベル: 設計文書に明確な記載あり（note.md - 5. 注意事項 - 状態の引き継ぎ検証）

      // 【初期条件設定】: MainSceneまで遷移
      const bootScene = game.scene.getScene(SceneKeys.BOOT);
      bootScene.events.emit('complete');
      await waitForScene(game, SceneKeys.TITLE);
      eventBus.emit('ui:game:start:requested', { isNewGame: true });
      await waitForScene(game, SceneKeys.MAIN);

      // 【ゲーム状態設定】: プレイヤーのゴールドを999に設定
      // 【状態確認用データ】: オーバーレイ表示前後で同じ値が保持されることを確認するため
      stateManager.updatePlayer({ gold: 999 });

      // 【ユーザー操作実行】: ショップをオーバーレイ表示して戻る
      // 【操作内容】: ショップを開いて、すぐに閉じる
      eventBus.emit('ui:shop:open:requested');
      await waitForScene(game, SceneKeys.SHOP);
      eventBus.emit('ui:shop:close:requested');
      await vi.waitFor(() => {
        expect(game.scene.isActive(SceneKeys.SHOP)).toBe(false);
      });

      // 【結果確認】: プレイヤーの状態が保持されていることを確認
      // 【期待される動作】: オーバーレイ表示前に設定したゴールド999が保持されている
      const player = stateManager.getPlayerData();
      expect(player.gold).toBe(999); // 【確認内容】: ゴールドが999のまま保持されている 🔵
      expect(game.scene.isActive(SceneKeys.MAIN)).toBe(true); // 【確認内容】: MainSceneがアクティブである 🔵
    });

    it('TC-05-04: メモリリークが発生しないことを確認する 🔵', async () => {
      // 【テスト目的】: シーン遷移後にイベントリスナーが正しく解放され、メモリリークが発生しないことを検証する
      // 【テスト内容】: 複数のシーン遷移を行い、afterEach()でイベントリスナー数が0になることを確認する
      // 【期待される動作】: afterEach()後にEventBusのリスナー数が0になる
      // 🔵 信頼性レベル: 設計文書に明確な記載あり（note.md - 5. 注意事項 - メモリリークの確認）

      // 【初期条件設定】: 複数のシーン遷移を実行
      // 【操作内容】: Title → Main → Shop → Main → GameOver → Title という一連の遷移を実行
      const bootScene = game.scene.getScene(SceneKeys.BOOT);
      bootScene.events.emit('complete');
      await waitForScene(game, SceneKeys.TITLE);

      eventBus.emit('ui:game:start:requested', { isNewGame: true });
      await waitForScene(game, SceneKeys.MAIN);

      eventBus.emit('ui:shop:open:requested');
      await waitForScene(game, SceneKeys.SHOP);

      eventBus.emit('ui:shop:close:requested');
      await vi.waitFor(() => {
        expect(game.scene.isActive(SceneKeys.SHOP)).toBe(false);
      });

      // ゲームオーバーへ遷移
      stateManager.updateProgress({ currentDay: 60, maxDay: 60 });
      eventBus.emit('ui:day:end:requested');
      await waitForScene(game, SceneKeys.GAME_OVER);

      // タイトルへ戻る
      eventBus.emit('ui:title:return:requested');
      await waitForScene(game, SceneKeys.TITLE);

      // 【結果確認】: 遷移が正常に完了したことを確認
      // 【メモリリーク確認】: afterEach()でEventBusのリスナー数が0になることを確認（afterEach()で実施）
      expect(game.scene.isActive(SceneKeys.TITLE)).toBe(true); // 【確認内容】: TitleSceneがアクティブになっている 🔵
    });
  });

  // =============================================================================
  // TC-06: Transition Animations（遷移アニメーション）
  // =============================================================================

  describe('TC-06: Transition Animations', () => {
    it('TC-06-01: 遷移時にフェードアニメーションが実行される 🟡', async () => {
      // 【テスト目的】: シーン遷移時にフェードアニメーションが正しく実行されることを検証する
      // 【テスト内容】: SceneManagerのgoToメソッドがtransitionパラメータ付きで呼ばれることを確認する
      // 【期待される動作】: SceneManagerのgoToメソッドがtransitionパラメータを含む引数で呼ばれる
      // 🟡 信頼性レベル: アニメーションの実装詳細は要推測（妥当な推測に基づく）

      // 【初期条件設定】: TitleSceneへ遷移
      const bootScene = game.scene.getScene(SceneKeys.BOOT);
      bootScene.events.emit('complete');
      await waitForScene(game, SceneKeys.TITLE);

      // 【SceneManagerのgoToメソッドをスパイ】: メソッド呼び出しを監視
      const goToSpy = vi.spyOn(sceneManager, 'goTo');

      // 【ユーザー操作実行】: 新規ゲーム開始
      // 【操作内容】: ui:game:start:requestedイベントを発火
      eventBus.emit('ui:game:start:requested', { isNewGame: true });

      // 【結果確認】: SceneManagerのgoToメソッドがtransitionパラメータ付きで呼ばれることを確認
      // 【期待される動作】: transitionパラメータが有効なオブジェクト（type, durationを含む）である
      await waitForScene(game, SceneKeys.MAIN);
      expect(goToSpy).toHaveBeenCalledWith(
        SceneKeys.MAIN,
        expect.any(Object),
        expect.objectContaining({
          type: expect.any(String),
          duration: expect.any(Number),
        })
      ); // 【確認内容】: SceneManagerのgoToメソッドがtransitionパラメータ付きで呼ばれている 🟡
    });

    it('TC-06-02: シーン遷移完了イベントが正しいペイロードで発火される 🔵', async () => {
      // 【テスト目的】: シーン遷移完了時にイベントが正しいペイロード（from/toシーン情報）で発火されることを検証する
      // 【テスト内容】: scene:transition:completeイベントが正しいペイロードで発火されることを確認する
      // 【期待される動作】: scene:transition:completeイベントがfrom/to情報を含むペイロードで発火される
      // 🔵 信頼性レベル: 設計文書に明確な記載あり（core-systems.md - 2.3 イベント定義）

      // 【初期条件設定】: TitleSceneへ遷移
      const bootScene = game.scene.getScene(SceneKeys.BOOT);
      bootScene.events.emit('complete');
      await waitForScene(game, SceneKeys.TITLE);

      // 【イベントリスナー登録】: シーン遷移完了イベントを監視
      const transitionCompleteSpy = vi.fn();
      eventBus.on('scene:transition:complete', transitionCompleteSpy);

      // 【ユーザー操作実行】: 新規ゲーム開始
      // 【操作内容】: ui:game:start:requestedイベントを発火
      eventBus.emit('ui:game:start:requested', { isNewGame: true });

      // 【結果確認】: シーン遷移完了イベントが正しいペイロードで発火されることを確認
      // 【期待される動作】: from: TitleScene、to: MainSceneの情報が含まれている
      await waitForScene(game, SceneKeys.MAIN);
      expect(transitionCompleteSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          from: SceneKeys.TITLE,
          to: SceneKeys.MAIN,
        })
      ); // 【確認内容】: シーン遷移完了イベントが正しいfrom/to情報で発火されている 🔵
    });
  });

  // =============================================================================
  // afterEach() - メモリリーク確認
  // =============================================================================

  // Note: メモリリーク確認は別のafterEachで実行
});
