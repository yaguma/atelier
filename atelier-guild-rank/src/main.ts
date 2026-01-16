/**
 * main.ts - Phaserゲームエントリーポイント
 * TASK-0008: Phaser基本設定とBootScene
 *
 * 【機能概要】: Phaserゲームインスタンスを生成し、ゲームを起動する 🔵
 * 【実装方針】: ゲームコンフィグを設定し、シーンを登録してPhaser.Gameを生成 🔵
 * 【テスト対応】: T-0008-01, T-0008-03のテストケースを通すための実装 🔵
 */

import { BootScene, MainScene, TitleScene } from '@presentation/scenes';
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

  /** 背景色（ベージュ / 羊皮紙風） 🔵 */
  backgroundColor: '#F5F5DC',

  /** シーン配列（起動順序） 🔵 */
  scene: [
    BootScene, // アセット読み込み・初期化
    TitleScene, // タイトル画面
    MainScene, // メインゲーム
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
new Phaser.Game(config);
