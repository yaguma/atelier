/**
 * Buttonコンポーネント
 * TASK-0018 Phase 2 共通UIコンポーネント基盤
 *
 * @description
 * ゲーム内で使用される全てのボタンの基底となるコンポーネント。
 * プライマリボタン、セカンダリボタン、テキストボタン、アイコンボタンの4種類を提供。
 * rexUI の Label コンポーネントをラップして、統一されたスタイルとインタラクションを実現。
 */

import type { RexLabel, RexRoundRectangle } from '@presentation/types/rexui';
import { THEME } from '@presentation/ui/theme';
import type Phaser from 'phaser';
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
  // TASK-0059: rexUI型定義を適用
  private label: RexLabel | null = null;
  private _enabled: boolean;
  // TASK-0039: ホバーエフェクト用のプロパティ
  // TASK-0059: rexUI型定義を適用
  private background: RexRoundRectangle | null = null;
  private normalColor: number = 0;
  private hoverColor: number = 0;

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
    let hoverColor: number;
    let textColor: string;

    switch (type) {
      case ButtonType.PRIMARY:
        backgroundColor = THEME.colors.primary;
        hoverColor = THEME.colors.primaryHover;
        textColor = THEME.colors.textOnPrimary;
        break;
      case ButtonType.SECONDARY:
        backgroundColor = THEME.colors.secondary;
        hoverColor = THEME.colors.secondaryHover;
        textColor = THEME.colors.textOnSecondary;
        break;
      case ButtonType.TEXT:
        backgroundColor = 0x000000;
        hoverColor = 0x000000;
        textColor = `#${THEME.colors.primary.toString(16)}`;
        break;
      case ButtonType.ICON:
        backgroundColor = THEME.colors.secondary;
        hoverColor = THEME.colors.secondaryHover;
        textColor = THEME.colors.textOnSecondary;
        break;
      default:
        backgroundColor = THEME.colors.primary;
        hoverColor = THEME.colors.primaryHover;
        textColor = THEME.colors.textOnPrimary;
    }

    // TASK-0039: ホバーエフェクト用に色を保存
    this.normalColor = backgroundColor;
    this.hoverColor = hoverColor;

    // 背景を生成
    this.background = this.rexUI.add
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
      background: this.background,
      text: textObject,
      align: 'center',
    });

    // インタラクティブに設定
    this.label.setInteractive();

    // TASK-0039: ホバーエフェクトのイベントリスナーを登録
    this.label.on('pointerover', () => this.onPointerOver());
    this.label.on('pointerout', () => this.onPointerOut());
    this.label.on('pointerdown', () => this.onPointerDown());
    this.label.on('pointerup', () => this.onPointerUp());

    // レイアウトを適用
    this.label.layout();

    // 有効/無効状態を反映
    this.updateEnabledState();
  }

  /**
   * ボタンの有効/無効状態を更新する
   */
  private updateEnabledState(): void {
    if (!this.label) return;
    if (this._enabled) {
      this.label.setAlpha(1.0);
    } else {
      this.label.setAlpha(0.5);
    }
  }

  /**
   * TASK-0039: マウスオーバー時の処理
   * ボタンを拡大し、背景色を変更する
   */
  private onPointerOver(): void {
    if (!this._enabled) return;

    // 拡大アニメーション
    this.scene.tweens.add({
      targets: this.label,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 100,
      ease: 'Power2',
    });

    // 背景色変更
    this.setHighlight(true);
  }

  /**
   * TASK-0039: マウスアウト時の処理
   * ボタンを元のサイズに戻し、背景色を元に戻す
   */
  private onPointerOut(): void {
    // 元のサイズに戻す
    this.scene.tweens.add({
      targets: this.label,
      scaleX: 1,
      scaleY: 1,
      duration: 100,
      ease: 'Power2',
    });

    // 背景色を元に戻す
    this.setHighlight(false);
  }

  /**
   * TASK-0039: マウス押下時の処理
   * ボタンを縮小してフィードバックを与える
   */
  private onPointerDown(): void {
    if (!this._enabled) return;

    // 縮小アニメーション
    this.scene.tweens.add({
      targets: this.label,
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 50,
    });

    // onClick コールバックを実行
    this.config.onClick();
  }

  /**
   * TASK-0039: マウスボタン解放時の処理
   * ホバー状態のサイズに戻す
   */
  private onPointerUp(): void {
    if (!this._enabled) return;

    // ホバー状態のサイズに戻す
    this.scene.tweens.add({
      targets: this.label,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 50,
    });
  }

  /**
   * TASK-0039: 背景色のハイライト設定
   * @param enabled ハイライトを有効にする場合はtrue、無効にする場合はfalse
   */
  private setHighlight(enabled: boolean): void {
    if (!this.background) return;

    const color = enabled ? this.hoverColor : this.normalColor;
    this.background.setFillStyle(color);
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

    // TASK-0039: backgroundの破棄を追加
    if (this.background !== null) {
      this.background.destroy();
      this.background = null;
    }

    // 【修正ポイント2】: W-002対応 - containerの破棄を追加
    // BaseComponentが保持するcontainerも破棄してメモリリークを防止
    if (this.container) {
      this.container.destroy();
    }
  }
}
