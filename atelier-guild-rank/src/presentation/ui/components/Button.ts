/**
 * Buttonコンポーネント
 * TASK-0018 Phase 2 共通UIコンポーネント基盤
 *
 * @description
 * ゲーム内で使用される全てのボタンの基底となるコンポーネント。
 * プライマリボタン、セカンダリボタン、テキストボタン、アイコンボタンの4種類を提供。
 * rexUI の Label コンポーネントをラップして、統一されたスタイルとインタラクションを実現。
 */

import type Phaser from 'phaser';
import { THEME } from '../theme';
import { BaseComponent } from './BaseComponent';

/**
 * ボタンの種類
 */
export enum ButtonType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TEXT = 'text',
  ICON = 'icon',
}

/**
 * ボタンの設定
 */
export interface ButtonConfig {
  text: string;
  onClick: () => void;
  type?: ButtonType;
  icon?: string;
  enabled?: boolean;
  width?: number;
  height?: number;
}

/**
 * Buttonコンポーネント
 */
export class Button extends BaseComponent {
  private config: ButtonConfig;
  // 【修正内容】: [W-003]への対応 - 型定義の厳密化
  // 【修正理由】: TypeScriptの型推論を正しく機能させるため
  // 【修正前】: private label: any; （nullの可能性を型に含めていない）
  // 【修正後】: private label: any | null = null; （null許容型として明示）
  // 🔴 信頼性レベル: TypeScriptの一般的なベストプラクティス
  // biome-ignore lint/suspicious/noExplicitAny: rexUI Labelコンポーネントは複雑な型のため
  private label: any | null = null;
  private _enabled: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number, config: ButtonConfig) {
    super(scene, x, y);

    // バリデーション: textが空文字列の場合はエラー（アイコンボタンの場合は除く）
    if (config.text === '' && config.type !== ButtonType.ICON) {
      throw new Error('text is required for non-icon buttons');
    }

    // バリデーション: onClickがnullまたはundefinedの場合はエラー
    if (!config.onClick) {
      throw new Error('onClick callback is required');
    }

    this.config = {
      ...config,
      type: config.type || ButtonType.PRIMARY,
      enabled: config.enabled !== undefined ? config.enabled : true,
    };

    this._enabled = this.config.enabled ?? true;

    // ボタンを生成
    this.create();
  }

  /**
   * ボタンを生成する（BaseComponentの抽象メソッド実装）
   */
  public create(): void {
    const { text, type, width, height } = this.config;

    // スタイルを決定
    let backgroundColor: number;
    let textColor: string;

    switch (type) {
      case ButtonType.PRIMARY:
        backgroundColor = THEME.colors.primary;
        textColor = THEME.colors.textOnPrimary;
        break;
      case ButtonType.SECONDARY:
        backgroundColor = THEME.colors.secondary;
        textColor = THEME.colors.textOnSecondary;
        break;
      case ButtonType.TEXT:
        backgroundColor = 0x000000;
        textColor = `#${THEME.colors.primary.toString(16)}`;
        break;
      case ButtonType.ICON:
        backgroundColor = THEME.colors.secondary;
        textColor = THEME.colors.textOnSecondary;
        break;
      default:
        backgroundColor = THEME.colors.primary;
        textColor = THEME.colors.textOnPrimary;
    }

    // 背景を生成
    const background = this.rexUI.add
      .roundRectangle({
        width: width || 120,
        height: height || 40,
        radius: 8,
      })
      .setFillStyle(backgroundColor);

    // テキストを生成
    const textObject = this.scene.add.text(0, 0, text, {
      fontSize: '16px',
      color: textColor,
    });

    // rexUI Labelを生成
    this.label = this.rexUI.add.label({
      background: background,
      text: textObject,
      align: 'center',
    });

    // インタラクティブに設定
    this.label.setInteractive();

    // クリックイベントを登録
    this.label.on('pointerdown', () => {
      if (this._enabled) {
        this.config.onClick();
      }
    });

    // レイアウトを適用
    this.label.layout();

    // 有効/無効状態を反映
    this.updateEnabledState();
  }

  /**
   * ボタンの有効/無効状態を更新する
   */
  private updateEnabledState(): void {
    if (this._enabled) {
      this.label.setAlpha(1.0);
    } else {
      this.label.setAlpha(0.5);
    }
  }

  /**
   * ボタンの有効/無効を設定する
   * @param enabled 有効にする場合はtrue、無効にする場合はfalse
   * @returns メソッドチェーン用に自身を返す
   */
  public setEnabled(enabled: boolean): this {
    this._enabled = enabled;
    this.updateEnabledState();
    return this;
  }

  /**
   * ボタンが有効かどうかを取得する
   * @returns 有効な場合はtrue、無効な場合はfalse
   */
  public isEnabled(): boolean {
    return this._enabled;
  }

  /**
   * ボタンを破棄する（BaseComponentの抽象メソッド実装）
   *
   * 【修正内容】: [W-002][W-003]への対応
   * 【修正理由】: メモリリーク防止と型安全性の向上
   * 【修正前】: labelのみ破棄、nullチェックがif (this.label)
   * 【修正後】: labelとcontainerを破棄、nullチェックがif (this.label !== null)
   * 🟡 信頼性レベル: Phaserのベストプラクティスに基づく
   */
  public destroy(): void {
    // 【修正ポイント1】: W-003対応 - 厳密なnullチェック
    if (this.label !== null) {
      this.label.destroy();
      this.label = null;
    }

    // 【修正ポイント2】: W-002対応 - containerの破棄を追加
    // BaseComponentが保持するcontainerも破棄してメモリリークを防止
    if (this.container) {
      this.container.destroy();
    }
  }
}
