/**
 * Dialogコンポーネント
 * TASK-0018 Phase 2 共通UIコンポーネント基盤
 *
 * @description
 * モーダルダイアログを表示・管理するコンポーネント。
 * 確認ダイアログ、情報ダイアログ、選択ダイアログの3種類を提供。
 * rexUI の Dialog コンポーネントをラップして、統一されたスタイルとアニメーションを実現。
 */

import type Phaser from 'phaser';
import { THEME } from '../theme';
import { BaseComponent } from './BaseComponent';

/**
 * ダイアログの種類
 */
export enum DialogType {
  CONFIRM = 'confirm',
  INFO = 'info',
  CHOICE = 'choice',
}

/**
 * ダイアログのアクションボタン
 */
export interface DialogAction {
  label: string;
  type?: string; // ButtonTypeと互換性を持たせる
  callback: () => void;
}

/**
 * ダイアログの設定
 */
export interface DialogConfig {
  title: string;
  content: string;
  type?: DialogType;
  actions?: DialogAction[];
  width?: number;
  height?: number;
  onClose?: () => void;
}

/**
 * Dialogコンポーネント
 */
export class Dialog extends BaseComponent {
  private config: DialogConfig;
  private dialog: any; // rexUI Dialogコンポーネント
  private overlay: any; // 背景オーバーレイ
  private _visible: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: DialogConfig) {
    super(scene, x, y);

    // バリデーション: titleが空の場合はエラー
    if (!config.title || config.title === '') {
      throw new Error('title is required');
    }

    // バリデーション: actionsが明示的に空配列の場合はエラー
    if (config.actions !== undefined && config.actions.length === 0) {
      throw new Error('actions cannot be empty');
    }

    this.config = {
      ...config,
      type: config.type || DialogType.INFO,
      actions: config.actions || [],
      width: config.width || 400,
      height: config.height || 300,
    };

    // ダイアログを生成
    this.createDialog();
  }

  /**
   * ダイアログを生成する
   */
  private createDialog(): void {
    const { title, content, type, actions, width, height } = this.config;

    // オーバーレイ背景を生成
    const sceneWidth = this.scene.scale?.width || 1280;
    const sceneHeight = this.scene.scale?.height || 720;

    this.overlay = this.scene.add.rectangle(
      sceneWidth / 2,
      sceneHeight / 2,
      sceneWidth,
      sceneHeight,
      0x000000,
    );
    this.overlay.setAlpha(0.7);
    this.overlay.setDepth(300);
    this.overlay.setVisible(false);

    // ダイアログタイプに応じたアクションボタンを設定
    let dialogActions: DialogAction[] = actions || [];

    if (type === DialogType.CONFIRM && dialogActions.length === 0) {
      dialogActions = [
        { label: 'はい', type: 'primary', callback: () => {} },
        { label: 'いいえ', type: 'secondary', callback: () => {} },
      ];
    } else if (type === DialogType.INFO && dialogActions.length === 0) {
      dialogActions = [{ label: 'OK', type: 'primary', callback: () => {} }];
    } else if (type === DialogType.CHOICE && dialogActions.length === 0) {
      dialogActions = [
        { label: '選択肢1', type: 'primary', callback: () => {} },
        { label: '選択肢2', type: 'secondary', callback: () => {} },
        { label: '選択肢3', type: 'text', callback: () => {} },
      ];
    }

    // タイトルテキストを生成
    const titleText = this.scene.add.text(0, 0, title, {
      fontSize: '20px',
      color: THEME.colors.textOnPrimary,
    });

    // コンテンツテキストを生成
    const contentText = this.scene.add.text(0, 0, content, {
      fontSize: '16px',
      color: THEME.colors.textOnPrimary,
    });

    // アクションボタンを生成
    const actionButtons = dialogActions.map((action) => {
      const button = (this.scene as any).rexUI.add.label({
        background: (this.scene as any).rexUI.add
          .roundRectangle({
            width: 100,
            height: 40,
            radius: 8,
          })
          .setFillStyle(THEME.colors.primary),
        text: this.scene.add.text(0, 0, action.label, {
          fontSize: '16px',
          color: THEME.colors.textOnPrimary,
        }),
        align: 'center',
      });

      button.setInteractive();
      button.on('pointerdown', () => {
        action.callback();
        this.hide();
      });
      button.layout();

      return button;
    });

    // rexUI Dialogを生成
    this.dialog = (this.scene as any).rexUI.add.dialog({
      x: sceneWidth / 2,
      y: sceneHeight / 2,
      width: width,
      height: height,
      background: (this.scene as any).rexUI.add
        .roundRectangle({
          width: width,
          height: height,
          radius: 12,
        })
        .setFillStyle(THEME.colors.secondary),
      title: titleText,
      content: contentText,
      actions: actionButtons,
    });

    this.dialog.layout();
    this.dialog.setDepth(400);
    this.dialog.setVisible(false);
  }

  /**
   * ダイアログを表示する
   * @param duration アニメーション時間（ミリ秒、デフォルト: 300）
   * @returns メソッドチェーン用に自身を返す
   */
  public show(duration: number = 300): this {
    if (!this._visible) {
      this._visible = true;
      this.overlay.setVisible(true);
      this.dialog.setVisible(true);
      this.dialog.popUp(duration);
    }
    return this;
  }

  /**
   * ダイアログを非表示にする
   * @param duration アニメーション時間（ミリ秒、デフォルト: 300）
   * @returns メソッドチェーン用に自身を返す
   */
  public hide(duration: number = 300): this {
    this._visible = false;
    this.dialog.scaleDownDestroy(duration);
    this.overlay.setVisible(false);
    this.dialog.setVisible(false);

    // onCloseコールバックを実行
    if (this.config.onClose) {
      this.config.onClose();
    }
    return this;
  }

  /**
   * ダイアログが表示中かどうかを取得する
   * @returns 表示中の場合はtrue、非表示の場合はfalse
   */
  public isVisible(): boolean {
    return this._visible;
  }
}
