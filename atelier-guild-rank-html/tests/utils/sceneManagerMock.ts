/**
 * SceneManagerモック
 *
 * 【目的】: テスト環境でシーン遷移をシミュレート
 * 【理由】: 統合テストでシーン遷移ロジックをテストするため
 * 【信頼性】: 🔵 設計文書（core-systems.md）に基づく実装
 */

import { vi } from 'vitest';

/**
 * SceneManagerモックの作成
 *
 * 【機能】: シーン遷移、オーバーレイ管理、二重遷移防止をモック
 * 【戻り値】: SceneManagerモックオブジェクトとゲームインスタンス更新関数
 */
export function createMockSceneManager(
  game: any,
  eventBus: any,
  validScenes: string[]
) {
  // 【状態管理】: 現在アクティブなシーンと遷移中フラグ
  let currentActiveScene = 'BootScene';
  let isTransitioning = false;

  // 【初期状態】: BootSceneをアクティブに設定
  // 【設計方針】: ゲーム起動時は常にBootSceneから開始
  game.scene.isActive = vi.fn((key: string) => key === currentActiveScene);

  const sceneManager = {
    /**
     * goTo: シーン遷移
     *
     * 【機能概要】: 指定されたシーンへ遷移する
     * 【二重遷移防止】: 遷移中フラグで制御
     * 【エラー処理】: 存在しないシーンへの遷移はエラーイベントを発火
     * 【非同期処理】: 実際のシーン遷移に時間がかかることをシミュレート
     *
     * @param sceneKey 遷移先のシーンキー
     * @param data シーンに渡すデータ
     * @param transition 遷移アニメーション設定
     */
    goTo: vi.fn(
      async (sceneKey: string, data?: Record<string, unknown>, transition?: any) => {
        // 【二重遷移防止】: 遷移中の場合は警告を出して無視
        // 【設計方針】: ユーザーの連続クリックなどによる二重遷移を防ぐ
        if (isTransitioning) {
          console.warn(
            'Scene transition already in progress. Ignoring new transition request.'
          );
          return;
        }

        // 【エラー処理】: 存在しないシーンへの遷移チェック
        // 【設計方針】: 不正なシーンキーを早期に検出してエラーイベントを発火
        if (!validScenes.includes(sceneKey as any)) {
          eventBus.emit('app:error:occurred', {
            message: `Scene not found: ${sceneKey}`,
            code: 'SCENE_NOT_FOUND',
          });
          return;
        }

        // 【遷移開始】: 遷移中フラグを立てる
        isTransitioning = true;

        // 【非同期処理】: 遷移に少し時間がかかることをシミュレート（50ms）
        // 【設計方針】: 実際のPhaserのシーン遷移は非同期なので、それを再現
        await new Promise((resolve) => setTimeout(resolve, 50));

        // 【シーン遷移実行】: currentActiveSceneを更新
        // 【状態更新】: game.scene.isActiveを新しいシーンに対してtrueを返すよう更新
        const from = currentActiveScene;
        currentActiveScene = sceneKey;
        game.scene.isActive = vi.fn((key: string) => key === currentActiveScene);

        // 【イベント発火】: シーン遷移完了イベントを発火
        // 【ペイロード】: from（遷移元シーン）、to（遷移先シーン）
        eventBus.emit('scene:transition:complete', { from, to: sceneKey });

        // 【遷移完了】: 遷移中フラグを解除
        isTransitioning = false;
      }
    ),

    /**
     * openOverlay: オーバーレイシーンを開く
     *
     * 【機能概要】: 指定されたシーンをオーバーレイ表示する
     * 【オーバーレイ特性】: 背景シーンもアクティブのまま保持
     * 【用途】: ショップ、昇格試験などのオーバーレイシーン
     *
     * @param sceneKey オーバーレイ表示するシーンキー
     * @param data シーンに渡すデータ
     * @param transition 遷移アニメーション設定
     */
    openOverlay: vi.fn(
      async (sceneKey: string, data?: Record<string, unknown>, transition?: any) => {
        // 【オーバーレイ表示】: 背景シーンとオーバーレイシーンの両方をアクティブに
        // 【設計方針】: 両方のシーンに対してisActive()がtrueを返すようにする
        game.scene.isActive = vi.fn(
          (key: string) => key === currentActiveScene || key === sceneKey
        );

        // 【イベント発火】: オーバーレイ開始イベントを発火
        // 【ペイロード】: sceneKey（オーバーレイシーンキー）
        eventBus.emit('scene:overlay:opened', { sceneKey });
      }
    ),

    /**
     * closeOverlay: オーバーレイシーンを閉じる
     *
     * 【機能概要】: オーバーレイシーンを終了し、背景シーンのみをアクティブにする
     * 【状態復元】: 背景シーンのみがアクティブになる
     *
     * @param sceneKey 閉じるオーバーレイシーンキー
     * @param transition 遷移アニメーション設定
     */
    closeOverlay: vi.fn(async (sceneKey: string, transition?: any) => {
      // 【オーバーレイ終了】: 背景シーンのみをアクティブに戻す
      // 【設計方針】: currentActiveSceneに対してのみisActive()がtrueを返すようにする
      game.scene.isActive = vi.fn((key: string) => key === currentActiveScene);

      // 【イベント発火】: オーバーレイ終了イベントを発火
      // 【ペイロード】: sceneKey（閉じたオーバーレイシーンキー）
      eventBus.emit('scene:overlay:closed', { sceneKey });
    }),

    /**
     * getCurrentScene: 現在のアクティブシーンを取得
     *
     * 【機能概要】: 現在アクティブなシーンのキーを返す
     * 【戻り値】: 現在のシーンキー
     */
    getCurrentScene: vi.fn(() => currentActiveScene),

    /**
     * isTransitioning: 遷移中かどうかを判定
     *
     * 【機能概要】: 現在シーン遷移中かどうかを返す
     * 【用途】: 二重遷移防止チェック
     * 【戻り値】: 遷移中の場合true
     */
    isTransitioning: vi.fn(() => isTransitioning),
  };

  return sceneManager;
}
