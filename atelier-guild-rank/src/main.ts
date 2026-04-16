/**
 * main.ts - Phaserゲームエントリーポイント
 * TASK-0008: Phaser基本設定とBootScene
 *
 * 【機能概要】: Phaserゲームインスタンスを生成し、ゲームを起動する 🔵
 * 【実装方針】: ゲームコンフィグを設定し、シーンを登録してPhaser.Gameを生成 🔵
 * 【テスト対応】: T-0008-01, T-0008-03のテストケースを通すための実装 🔵
 */

import {
  BootScene,
  GameClearScene,
  GameOverScene,
  MainScene,
  TitleScene,
} from '@presentation/scenes';
import { Container, ServiceKeys } from '@shared/services/di/container';
import type { IStateManager } from '@shared/services/state-manager';
import { Colors, toColorStr } from '@shared/theme';
// debug.ts でグローバル型 (window.game, window.gameState, window.debug) が定義されている
import { DebugTools } from '@shared/utils/debug';
import Phaser from 'phaser';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';

/**
 * Phaserゲーム設定
 *
 * 【設定内容】:
 * - 解像度: 1280x720（基準解像度）
 * - レンダラー: WebGL優先、Canvas fallback
 * - スケール: FIT mode（アスペクト比維持）
 * - シーン: BootScene → TitleScene → MainScene
 * - プラグイン: rexUI（UI構築用）
 *
 * 🔵 信頼性レベル: 設計文書（architecture-phaser.md）に明記
 */
const config: Phaser.Types.Core.GameConfig = {
  /** レンダラータイプ（WebGL優先、Canvas fallback） 🔵 */
  type: Phaser.AUTO,

  /** ゲーム幅（基準解像度） 🔵 */
  width: 1280,

  /** ゲーム高さ（基準解像度） 🔵 */
  height: 720,

  /** 親要素ID 🔵 */
  parent: 'game-container',

  /** 背景色（プライマリ背景色） 🔵 */
  backgroundColor: toColorStr(Colors.background.primary),

  /** シーン配列（起動順序） 🔵 */
  scene: [
    BootScene, // アセット読み込み・初期化
    TitleScene, // タイトル画面
    MainScene, // メインゲーム
    GameClearScene, // ゲームクリア画面
    GameOverScene, // ゲームオーバー画面
  ],

  /** プラグイン設定 🔵 */
  plugins: {
    scene: [
      {
        /** rexUIプラグインキー 🔵 */
        key: 'rexUI',
        /** rexUIプラグイン本体 🔵 */
        plugin: RexUIPlugin,
        /** シーン内でのマッピング名（this.rexUIでアクセス可能） 🔵 */
        mapping: 'rexUI',
      },
    ],
  },

  /** スケール設定 🔵 */
  scale: {
    /** スケールモード（FIT: アスペクト比維持してフィット） 🔵 */
    mode: Phaser.Scale.FIT,
    /** 自動センタリング（画面中央に配置） 🔵 */
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

/**
 * ゲームインスタンス生成
 *
 * 【処理内容】: Phaser.Gameコンストラクタを呼び出してゲームを起動
 * 【実装方針】: 設定オブジェクトを渡してゲームインスタンスを生成
 * 🔵 信頼性レベル: Phaser標準の起動方法
 */
const game = new Phaser.Game(config);

// =============================================================================
// E2Eテスト用グローバル公開
// =============================================================================

/**
 * window.game - Phaserゲームインスタンスを公開
 *
 * 【用途】: E2Eテストでのシーン状態確認、デバッグ用途
 * 【注意】: 本番環境でも公開されるが、直接操作は推奨しない
 */
window.game = game;

/**
 * window.gameState - 現在のゲーム状態を取得する関数
 *
 * 【用途】: E2Eテストでのゲーム状態検証
 * 【実装方針】: Phaserシーンマネージャーから現在のシーン情報を取得し、
 *              StateManagerが初期化されている場合はそこからゲーム状態も取得
 * 【注意】: StateManagerが初期化されていない場合はシーン情報のみ返す
 */
window.gameState = () => {
  // 現在アクティブなシーンを取得
  const activeScene = game.scene.scenes.find(
    (scene) => scene.sys.isActive() && scene.sys.settings.key !== 'BootScene',
  );
  const currentScene =
    activeScene?.sys.settings.key ??
    game.scene.scenes.find((s) => s.sys.isActive())?.sys.settings.key;

  // LocalStorageからセーブデータの存在を確認
  const saveDataKey = 'atelier-guild-rank-save';
  const hasSaveData = localStorage.getItem(saveDataKey) !== null;

  // StateManagerが初期化されている場合は状態を取得
  let stateFromManager: Partial<{
    currentPhase: string;
    remainingDays: number;
    gold: number;
    currentRank: string;
    actionPoints: number;
    currentDay: number;
    apOverflow: number;
    acceptedQuestCount: number;
    boardQuestCount: number;
    visitorQuestCount: number;
  }> = {};

  try {
    const container = Container.getInstance();
    if (container.has(ServiceKeys.StateManager)) {
      const stateManager = container.resolve<IStateManager>(ServiceKeys.StateManager);
      const state = stateManager.getState();
      stateFromManager = {
        currentPhase: state.currentPhase,
        remainingDays: state.remainingDays,
        gold: state.gold,
        currentRank: state.currentRank,
        actionPoints: state.actionPoints,
        currentDay: state.currentDay,
        apOverflow: state.apOverflow,
        boardQuestCount: state.questBoard?.boardQuests?.length ?? 0,
        visitorQuestCount: state.questBoard?.visitorQuests?.length ?? 0,
      };
    }
  } catch {
    // StateManagerが初期化されていない場合は無視
  }

  // ゲームクリア/ゲームオーバー判定
  const isGameClear = currentScene === 'GameClearScene';
  const isGameOver = currentScene === 'GameOverScene';

  return {
    currentScene,
    hasSaveData,
    currentPhase: stateFromManager.currentPhase,
    remainingDays: stateFromManager.remainingDays,
    gold: stateFromManager.gold,
    currentRank: stateFromManager.currentRank,
    actionPoints: stateFromManager.actionPoints,
    currentDay: stateFromManager.currentDay,
    apOverflow: stateFromManager.apOverflow,
    boardQuestCount: stateFromManager.boardQuestCount,
    visitorQuestCount: stateFromManager.visitorQuestCount,
    isGameClear,
    isGameOver,
  };
};

/**
 * window.debug - デバッグツールを公開（同期初期化）
 *
 * 【用途】: 開発時のゲーム状態操作、E2Eテスト補助
 * 【注意】: 本番ビルドでは別途削除を検討
 * Issue #365: 非同期importではE2Eテスト実行時に初期化が間に合わないため同期importに変更
 */
window.debug = DebugTools;
