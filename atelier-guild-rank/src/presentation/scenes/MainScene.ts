/**
 * MainScene.ts - メインゲームシーン
 * TASK-0008: Phaser基本設定とBootScene
 *
 * 【機能概要】: ゲームのメイン画面を表示する仮実装シーン 🔵
 * 【実装方針】: 最小限の実装でテストを通す（詳細実装は後続タスクで行う） 🔵
 * 【テスト対応】: シーン配列にMainSceneが登録されることを確認するテストを通す 🔵
 */

import Phaser from 'phaser';

/**
 * MainScene - メインゲーム画面シーン
 *
 * 【責務】:
 * - ゲームのメイン画面を表示
 * - ゲームロジックの実行（将来実装）
 * - UI操作の受付（将来実装）
 *
 * 🔵 信頼性レベル: note.mdのMainScene仮実装に記載
 */
export class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  /**
   * create() - メイン画面の生成
   *
   * 【機能概要】: ゲームタイトルと説明テキストを表示する
   * 【実装方針】: 最小限のテキスト表示のみ（ゲームロジックは後続タスクで実装）
   * 【テスト対応】: シーン遷移が正常に動作することを確認するテストを通す
   * 🔵 信頼性レベル: 既存のmain.tsのMainSceneを参考に実装
   */
  create(): void {
    // 【画面中央座標取得】: テキストを中央に配置するための座標を取得 🔵
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // 【タイトル表示】: ゲームタイトルを表示 🔵
    // 【実装内容】: Atelier Guild Rankのタイトルテキスト
    this.add
      .text(centerX, centerY - 50, 'Atelier Guild Rank', {
        fontSize: '48px',
        color: '#ffffff',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);

    // 【サブタイトル表示】: ゲームの説明を表示 🔵
    // 【実装内容】: ゲームジャンルの説明テキスト
    this.add
      .text(centerX, centerY + 20, '錬金術師ギルドランク制デッキ構築RPG', {
        fontSize: '24px',
        color: '#aaaaaa',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);

    // 【技術スタック表示】: 使用技術を表示 🔵
    // 【実装内容】: Phaser + rexUI + TypeScriptの表示
    this.add
      .text(centerX, centerY + 80, 'Phaser 3 + rexUI + TypeScript', {
        fontSize: '18px',
        color: '#666666',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);

    // 【ステータス表示】: 仮実装完了のメッセージ 🔵
    // 【実装内容】: 開発状況の表示
    this.add
      .text(centerX, centerY + 150, 'Main Scene - 仮実装完了', {
        fontSize: '16px',
        color: '#00ff00',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);
  }
}
