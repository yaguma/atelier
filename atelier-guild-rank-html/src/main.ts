/**
 * Phaser版ゲームエントリーポイント
 *
 * TASK-0256: エントリーポイント更新
 * Phaserゲームインスタンスの初期化、シーンの登録、依存性注入の設定を実装する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/architecture.md
 */

import Phaser from 'phaser';
import {
  createGameConfig,
  GAME_WIDTH,
  GAME_HEIGHT,
} from './game/config/GameConfig';
import { SceneKeys } from './game/config/SceneKeys';

// シーンインポート
import { BootScene } from './game/scenes/BootScene';
import { TitleScene } from './game/scenes/TitleScene';
import { MainScene } from './game/scenes/MainScene';
import { ShopScene } from './game/scenes/ShopScene';
import { RankUpScene } from './game/scenes/RankUpScene';
import { GameOverScene } from './game/scenes/GameOverScene';
import { GameClearScene } from './game/scenes/GameClearScene';

// コアシステムインポート
import { EventBus } from './game/events/EventBus';
import {
  PhaserStateManager,
  createPhaserStateManager,
  getPhaserStateManager,
  resetPhaserStateManager,
} from './game/state/PhaserStateManager';
import {
  PhaserGameFlowManager,
  createPhaserGameFlowManager,
  getPhaserGameFlowManager,
  resetPhaserGameFlowManager,
} from './game/flow/PhaserGameFlowManager';
import {
  PhaserSaveLoadManager,
  createPhaserSaveLoadManager,
  getPhaserSaveLoadManager,
  resetPhaserSaveLoadManager,
} from './game/save/PhaserSaveLoadManager';

// Application層インポート
import { createStateManager, StateManager } from './application/StateManager';

/**
 * グローバル型定義
 */
declare global {
  interface Window {
    game: Phaser.Game | null;
    eventBus: EventBus;
    stateManager: PhaserStateManager | null;
    flowManager: PhaserGameFlowManager | null;
    saveLoadManager: PhaserSaveLoadManager | null;
    /** デバッグ用: シーン一覧取得 */
    getScenes: () => string[];
    /** ローディング進捗更新（HTMLから設定される） */
    updateLoadingProgress: (progress: number) => void;
    /** ローディング画面非表示（HTMLから設定される） */
    hideLoadingScreen: () => void;
  }
}

/**
 * 開発モード判定
 */
const isDevelopment = import.meta.env.DEV;

/**
 * デバッグ設定
 */
const DebugConfig = {
  showFPS: isDevelopment,
  logEvents: isDevelopment,
  logSceneTransitions: isDevelopment,
};

/**
 * シーン一覧
 */
const scenes: Phaser.Types.Scenes.SceneType[] = [
  BootScene,
  TitleScene,
  MainScene,
  ShopScene,
  RankUpScene,
  GameOverScene,
  GameClearScene,
];

/**
 * ゲームを初期化する
 */
async function initializeGame(): Promise<Phaser.Game> {
  console.log('Phaser ゲーム初期化開始...');

  // 既存インスタンスをクリーンアップ
  cleanupExistingInstances();

  // EventBusシングルトンを取得
  const eventBus = EventBus.getInstance();
  window.eventBus = eventBus;

  // 基盤StateManagerを作成
  const baseStateManager = createStateManager();

  // PhaserStateManagerを作成
  const phaserStateManager = createPhaserStateManager(baseStateManager);
  window.stateManager = phaserStateManager;

  // ゲームコンフィグを作成
  const config = createGameConfig(scenes);

  // Phaserゲームインスタンスを作成
  const game = new Phaser.Game(config);
  window.game = game;

  // ゲームインスタンスのレジストリにマネージャーを登録
  game.registry.set('eventBus', eventBus);
  game.registry.set('stateManager', phaserStateManager);
  game.registry.set('baseStateManager', baseStateManager);

  // ゲーム起動後にFlowManagerとSaveLoadManagerを初期化
  game.events.once('ready', () => {
    initializeManagers(game, eventBus, phaserStateManager);
  });

  // デバッグ用ヘルパー
  window.getScenes = () => {
    return game.scene.getScenes(true).map((s) => s.scene.key);
  };

  console.log('Phaser ゲームインスタンス作成完了');

  return game;
}

/**
 * マネージャーを初期化する
 */
function initializeManagers(
  game: Phaser.Game,
  eventBus: EventBus,
  stateManager: PhaserStateManager
): void {
  console.log('マネージャー初期化開始...');

  // PhaserGameFlowManagerを作成
  const flowManager = createPhaserGameFlowManager({
    stateManager,
    eventBus,
    // シーンマネージャーはシーン内から取得するため、ここではnull
    sceneManager: null,
  });
  game.registry.set('flowManager', flowManager);
  window.flowManager = flowManager;

  // PhaserSaveLoadManagerを作成
  const saveLoadManager = createPhaserSaveLoadManager({
    eventBus,
    stateManager,
    flowManager,
  });
  game.registry.set('saveLoadManager', saveLoadManager);
  window.saveLoadManager = saveLoadManager;

  // プレイ時間追跡を開始（ゲームプレイ中に有効化される）
  // saveLoadManager.startPlaytimeTracking();

  console.log('マネージャー初期化完了');

  // デバッグログ
  if (DebugConfig.logEvents) {
    setupEventLogging(eventBus);
  }
}

/**
 * イベントログを設定する（デバッグ用）
 */
function setupEventLogging(eventBus: EventBus): void {
  // 主要なイベントをログ出力
  const eventsToLog = [
    'state:phase:changed',
    'state:day:changed',
    'state:game:changed',
    'scene:transition:start',
    'scene:transition:complete',
    'save:complete',
    'load:complete',
  ] as const;

  eventsToLog.forEach((event) => {
    eventBus.on(event as any, (payload: any) => {
      console.log(`[EventBus] ${event}:`, payload);
    });
  });
}

/**
 * 既存インスタンスをクリーンアップする
 */
function cleanupExistingInstances(): void {
  // EventBusをリセット
  EventBus.resetInstance();

  // PhaserStateManagerをリセット
  resetPhaserStateManager();

  // PhaserGameFlowManagerをリセット
  resetPhaserGameFlowManager();

  // PhaserSaveLoadManagerをリセット
  resetPhaserSaveLoadManager();

  // 既存ゲームインスタンスを破棄
  if (window.game) {
    window.game.destroy(true);
    window.game = null;
  }

  // グローバル参照をクリア
  window.stateManager = null;
  window.flowManager = null;
  window.saveLoadManager = null;
}

/**
 * ウィンドウイベントを設定する
 */
function setupWindowEvents(game: Phaser.Game): void {
  // リサイズハンドラ
  window.addEventListener('resize', () => {
    game.scale.refresh();
  });

  // ページ離脱時の警告
  window.addEventListener('beforeunload', (e) => {
    const stateManager = window.stateManager;
    if (stateManager) {
      try {
        const gameState = stateManager.getGameState();
        // ゲームが開始されている場合のみ警告
        if (gameState.currentDay > 1) {
          e.preventDefault();
          // 標準的な離脱確認ダイアログ
          return '';
        }
      } catch {
        // 状態取得に失敗した場合は警告しない
      }
    }
  });

  // フォーカス/ブラー時の処理
  window.addEventListener('blur', () => {
    if (game.sound) {
      game.sound.pauseAll();
    }

    // プレイ時間追跡を一時停止
    const saveLoadManager = window.saveLoadManager;
    if (saveLoadManager) {
      saveLoadManager.stopPlaytimeTracking();
    }
  });

  window.addEventListener('focus', () => {
    if (game.sound) {
      game.sound.resumeAll();
    }

    // プレイ時間追跡を再開（ゲームがプレイ中の場合）
    const saveLoadManager = window.saveLoadManager;
    const stateManager = window.stateManager;
    if (saveLoadManager && stateManager) {
      try {
        const gameState = stateManager.getGameState();
        if (gameState.currentDay >= 1) {
          saveLoadManager.startPlaytimeTracking();
        }
      } catch {
        // 状態取得に失敗した場合は追跡しない
      }
    }
  });

  // 可視性変更時の処理
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // タブが非表示になった
      if (game.sound) {
        game.sound.pauseAll();
      }
    } else {
      // タブが表示された
      if (game.sound) {
        game.sound.resumeAll();
      }
    }
  });
}

/**
 * エラー表示を行う
 */
function showError(error: unknown): void {
  const container = document.getElementById('game-container');
  if (container) {
    container.innerHTML = `
      <div class="error-message">
        <h2>ゲームの初期化に失敗しました</h2>
        <p>ページを再読み込みしてください。</p>
        <p style="font-size: 12px; color: #888;">${error instanceof Error ? error.message : String(error)}</p>
        <button onclick="location.reload()" style="margin-top: 16px; padding: 8px 16px; cursor: pointer;">
          再読み込み
        </button>
      </div>
    `;
  }
}

/**
 * ローディング表示を消す
 */
function hideLoading(): void {
  const loadingSpinner = document.querySelector('.loading-spinner');
  if (loadingSpinner) {
    loadingSpinner.remove();
  }
}

/**
 * エントリーポイント
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('=================================');
  console.log('アトリエギルドランク - Phaser版');
  console.log(`解像度: ${GAME_WIDTH}x${GAME_HEIGHT}`);
  console.log(`モード: ${isDevelopment ? '開発' : '本番'}`);
  console.log('=================================');

  try {
    const game = await initializeGame();

    // ウィンドウイベントを設定
    setupWindowEvents(game);

    // ローディング表示を消す
    hideLoading();

    console.log('ゲーム初期化完了');
  } catch (error) {
    console.error('ゲーム初期化失敗:', error);
    showError(error);
  }
});
