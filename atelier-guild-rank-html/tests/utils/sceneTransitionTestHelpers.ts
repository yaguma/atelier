/**
 * シーン遷移テストヘルパー関数
 *
 * 【目的】: テストケースの重複コードを削減
 * 【理由】: 多くのテストケースで同じ初期化処理が繰り返されているため
 * 【信頼性】: 🔵 テストケースの共通パターンを抽出
 */

import { SceneKeys } from '@game/config/SceneKeys';

/**
 * 指定したシーンがアクティブになるまで待機する
 *
 * 【機能概要】: シーン遷移完了を待機するヘルパー関数
 * 【タイムアウト】: デフォルト5秒（5000ms）
 * 【ポーリング間隔】: 100ms
 * 【エラー処理】: タイムアウト時はErrorをthrow
 *
 * @param game Phaserゲームインスタンス
 * @param sceneKey 待機するシーンキー
 * @param timeout タイムアウト時間（ミリ秒）
 * @returns Promise<void>
 */
export async function waitForScene(
  game: any,
  sceneKey: string,
  timeout: number = 5000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    // 【ポーリング】: 100msごとにシーンのアクティブ状態をチェック
    const checkInterval = setInterval(() => {
      // 【成功条件】: シーンがアクティブになったら完了
      if (game.scene.isActive(sceneKey)) {
        clearInterval(checkInterval);
        resolve();
      }

      // 【タイムアウト】: 指定時間を超えたらエラー
      if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error(`Timeout waiting for scene: ${sceneKey}`));
      }
    }, 100);
  });
}

/**
 * TitleSceneまで遷移するヘルパー関数
 *
 * 【機能概要】: Boot → Title遷移を実行
 * 【用途】: TitleSceneから開始するテストケースの初期化
 *
 * @param game Phaserゲームインスタンス
 * @returns Promise<void>
 */
export async function setupToTitleScene(game: any): Promise<void> {
  // 【Boot完了】: BootSceneの完了イベントを発火
  const bootScene = game.scene.getScene(SceneKeys.BOOT);
  bootScene.events.emit('complete');

  // 【遷移待機】: TitleSceneがアクティブになるまで待機
  await waitForScene(game, SceneKeys.TITLE);
}

/**
 * MainSceneまで遷移するヘルパー関数（新規ゲーム）
 *
 * 【機能概要】: Boot → Title → Main遷移を実行（新規ゲーム）
 * 【用途】: MainSceneから開始するテストケースの初期化
 * 【初期状態】: 日数1、ゴールド100、ランクG
 *
 * @param game Phaserゲームインスタンス
 * @param eventBus EventBusインスタンス
 * @returns Promise<void>
 */
export async function setupToMainScene(game: any, eventBus: any): Promise<void> {
  // 【Title遷移】: TitleSceneまで遷移
  await setupToTitleScene(game);

  // 【新規ゲーム開始】: ui:game:start:requestedイベントを発火
  eventBus.emit('ui:game:start:requested', { isNewGame: true });

  // 【遷移待機】: MainSceneがアクティブになるまで待機
  await waitForScene(game, SceneKeys.MAIN);
}

/**
 * MainSceneまで遷移するヘルパー関数（コンティニュー）
 *
 * 【機能概要】: Boot → Title → Main遷移を実行（コンティニュー）
 * 【用途】: セーブデータをロードしてMainSceneから開始するテストケースの初期化
 * 【前提条件】: localStorageにセーブデータが存在すること
 *
 * @param game Phaserゲームインスタンス
 * @param eventBus EventBusインスタンス
 * @param saveData セーブデータ（オプション）
 * @returns Promise<void>
 */
export async function setupToMainSceneWithSave(
  game: any,
  eventBus: any,
  saveData?: any
): Promise<void> {
  // 【セーブデータ作成】: saveDataが指定されていればlocalStorageに保存
  if (saveData) {
    const saveDataStr = {
      version: '1.0.0',
      timestamp: Date.now(),
      playtime: 0,
      state: JSON.stringify(saveData),
    };
    localStorage.setItem('atelier_guild_rank_save_1', JSON.stringify(saveDataStr));
  }

  // 【Title遷移】: TitleSceneまで遷移
  await setupToTitleScene(game);

  // 【コンティニュー】: ui:game:continue:requestedイベントを発火
  eventBus.emit('ui:game:continue:requested', { slotId: 1 });

  // 【遷移待機】: MainSceneがアクティブになるまで待機
  await waitForScene(game, SceneKeys.MAIN);
}

/**
 * GameOverSceneまで遷移するヘルパー関数
 *
 * 【機能概要】: Boot → Title → Main → GameOver遷移を実行
 * 【用途】: GameOverSceneから開始するテストケースの初期化
 * 【ゲームオーバー条件】: 日数切れ（60日）
 *
 * @param game Phaserゲームインスタンス
 * @param eventBus EventBusインスタンス
 * @param stateManager StateManagerインスタンス
 * @returns Promise<void>
 */
export async function setupToGameOverScene(
  game: any,
  eventBus: any,
  stateManager: any
): Promise<void> {
  // 【Main遷移】: MainSceneまで遷移
  await setupToMainScene(game, eventBus);

  // 【ゲームオーバー条件設定】: 日数を最大日数（60日）に設定
  stateManager.updateProgress({ currentDay: 60, maxDay: 60 });

  // 【日数終了】: ui:day:end:requestedイベントを発火
  eventBus.emit('ui:day:end:requested');

  // 【遷移待機】: GameOverSceneがアクティブになるまで待機
  await waitForScene(game, SceneKeys.GAME_OVER);
}

/**
 * GameClearSceneまで遷移するヘルパー関数
 *
 * 【機能概要】: Boot → Title → Main → GameClear遷移を実行
 * 【用途】: GameClearSceneから開始するテストケースの初期化
 * 【ゲームクリア条件】: Sランク到達
 *
 * @param game Phaserゲームインスタンス
 * @param eventBus EventBusインスタンス
 * @param stateManager StateManagerインスタンス
 * @returns Promise<void>
 */
export async function setupToGameClearScene(
  game: any,
  eventBus: any,
  stateManager: any
): Promise<void> {
  // 【Main遷移】: MainSceneまで遷移
  await setupToMainScene(game, eventBus);

  // 【ゲームクリア条件設定】: ランクをSに設定
  stateManager.updatePlayer({ rank: 'S' });

  // 【ランク更新】: ui:rank:updatedイベントを発火
  eventBus.emit('ui:rank:updated', { newRank: 'S' });

  // 【遷移待機】: GameClearSceneがアクティブになるまで待機
  await waitForScene(game, SceneKeys.GAME_CLEAR);
}
