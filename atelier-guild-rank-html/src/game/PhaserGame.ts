/**
 * Phaserゲームインスタンス管理
 *
 * Phaserゲームの初期化と破棄を管理するシングルトンクラス。
 * 設計文書: docs/design/atelier-guild-rank-phaser/architecture.md
 */
import Phaser from 'phaser';
import { createGameConfig } from './config/GameConfig';

/**
 * Phaserゲームインスタンス管理クラス
 */
export class PhaserGame {
  /** シングルトンインスタンス */
  private static instance: Phaser.Game | null = null;

  /**
   * ゲームインスタンスを作成する
   * @param scenes 登録するシーンの配列
   * @returns 作成されたPhaserゲームインスタンス
   */
  public static create(scenes: Phaser.Types.Scenes.SceneType[]): Phaser.Game {
    if (this.instance) {
      this.instance.destroy(true);
    }
    this.instance = new Phaser.Game(createGameConfig(scenes));
    return this.instance;
  }

  /**
   * 現在のゲームインスタンスを取得する
   * @returns ゲームインスタンス（未作成の場合はnull）
   */
  public static getInstance(): Phaser.Game | null {
    return this.instance;
  }

  /**
   * ゲームインスタンスを破棄する
   */
  public static destroy(): void {
    if (this.instance) {
      this.instance.destroy(true);
      this.instance = null;
    }
  }
}
