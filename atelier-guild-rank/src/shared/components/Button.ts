/**
 * Buttonコンポーネント
 * TASK-0018 Phase 2 共通UIコンポーネント基盤
 *
 * @description
 * ゲーム内で使用される全てのボタンの基底となるコンポーネント。
 * プライマリボタン、セカンダリボタン、テキストボタン、アイコンボタンの4種類を提供。
 *
 * Issue #450: rexUI LabelはPhaserのcontainer階層と互換性がないため、
 * PhaserネイティブのRoundedRectangle + Textで実装し、container階層で
 * 正しく位置・可視性・深度が管理されるようにする。
 */

import { THEME } from '@presentation/ui/theme';
import Phaser from 'phaser';
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
  /** trueの場合、コンテナをシーンのdisplayListに追加しない（親containerに追加する場合） */
  addToScene?: boolean;
}

/**
 * Buttonコンポーネント
 *
 * PhaserネイティブのGameObjectsのみで構成し、
 * BaseComponentのcontainer階層で正しく管理される。
 */
export class Button extends BaseComponent {
  private config: ButtonConfig;
  private _enabled: boolean;
  private bg: Phaser.GameObjects.Rectangle | null = null;
  private textObj: Phaser.GameObjects.Text | null = null;
  private normalColor: number = 0;
  private hoverColor: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, config: ButtonConfig) {
    super(scene, x, y, { addToScene: config.addToScene ?? true });

    if (config.text === '' && config.type !== ButtonType.ICON) {
      throw new Error('text is required for non-icon buttons');
    }

    if (!config.onClick) {
      throw new Error('onClick callback is required');
    }

    this.config = {
      ...config,
      type: config.type || ButtonType.PRIMARY,
      enabled: config.enabled !== undefined ? config.enabled : true,
    };

    this._enabled = this.config.enabled ?? true;

    this.create();
  }

  public create(): void {
    const { text, type, width = 120, height = 40 } = this.config;

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
        textColor = `#${THEME.colors.primary.toString(16).padStart(6, '0')}`;
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

    this.normalColor = backgroundColor;
    this.hoverColor = hoverColor;

    // 背景（角丸Rectangle）をcontainerローカル座標(0,0)に配置
    // scene.addはdisplayListに追加するため、container.add後にdisplayListから除去する
    this.bg = this.scene.add.rectangle(0, 0, width, height, backgroundColor);
    this.bg.setOrigin(0.5);
    this.scene.children.remove(this.bg);
    this.container.add(this.bg);

    // テキストをcontainerローカル座標(0,0)に中央配置
    this.textObj = this.scene.add.text(0, 0, text, {
      fontSize: '16px',
      color: textColor,
    });
    this.textObj.setOrigin(0.5);
    this.scene.children.remove(this.textObj);
    this.container.add(this.textObj);

    // containerをインタラクティブに設定（背景サイズでヒット領域を定義）
    this.container.setSize(width, height);
    this.container.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains,
    );

    // ホバーエフェクト・クリックイベント
    this.container.on('pointerover', () => this.onPointerOver());
    this.container.on('pointerout', () => this.onPointerOut());
    this.container.on('pointerdown', () => this.onPointerDown());
    this.container.on('pointerup', () => this.onPointerUp());

    this.updateEnabledState();
  }

  private updateEnabledState(): void {
    if (this._enabled) {
      this.container.setAlpha(1.0);
    } else {
      this.container.setAlpha(0.5);
    }
  }

  private onPointerOver(): void {
    if (!this._enabled) return;
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 100,
      ease: 'Power2',
    });
    if (this.bg) {
      this.bg.setFillStyle(this.hoverColor);
    }
  }

  private onPointerOut(): void {
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1,
      scaleY: 1,
      duration: 100,
      ease: 'Power2',
    });
    if (this.bg) {
      this.bg.setFillStyle(this.normalColor);
    }
  }

  private onPointerDown(): void {
    if (!this._enabled) return;
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 50,
    });
    this.config.onClick();
  }

  private onPointerUp(): void {
    if (!this._enabled) return;
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 50,
    });
  }

  public setEnabled(enabled: boolean): this {
    this._enabled = enabled;
    this.updateEnabledState();
    return this;
  }

  public isEnabled(): boolean {
    return this._enabled;
  }

  public destroy(): void {
    this.container.off('pointerover');
    this.container.off('pointerout');
    this.container.off('pointerdown');
    this.container.off('pointerup');

    if (this.bg !== null) {
      this.bg.destroy();
      this.bg = null;
    }
    if (this.textObj !== null) {
      this.textObj.destroy();
      this.textObj = null;
    }
    if (this.container) {
      this.container.destroy();
    }
  }
}
