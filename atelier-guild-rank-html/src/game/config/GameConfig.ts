/**
 * Phaserゲームコンフィグ定義
 *
 * ゲームの基本設定（解像度、レンダラー、プラグイン等）を管理する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/architecture.md
 */
import Phaser from 'phaser';
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';

/** ゲーム解像度: 横幅 */
export const GAME_WIDTH = 1280;

/** ゲーム解像度: 縦幅 */
export const GAME_HEIGHT = 720;

/** ゲームコンテナのDOM要素ID */
export const GAME_CONTAINER_ID = 'game-container';

/** 背景色（羊皮紙風ベージュ） */
export const BACKGROUND_COLOR = '#F5F5DC';

/**
 * Phaserゲームコンフィグを生成する
 * @param scenes 登録するシーンの配列
 * @returns Phaserゲームコンフィグオブジェクト
 */
export const createGameConfig = (
  scenes: Phaser.Types.Scenes.SceneType[]
): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: GAME_CONTAINER_ID,
  backgroundColor: BACKGROUND_COLOR,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  plugins: {
    scene: [
      {
        key: 'rexUI',
        plugin: UIPlugin,
        mapping: 'rexUI',
      },
    ],
  },
  scene: scenes,
  dom: {
    createContainer: false,
  },
});
