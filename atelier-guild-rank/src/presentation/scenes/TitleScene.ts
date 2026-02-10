/**
 * TitleScene.ts - タイトルシーン
 * TASK-0019: TitleScene実装
 * TASK-0058: TitleSceneリファクタリング（コンポーネント分割）
 * Issue #111: MainSceneで本日の依頼が表示されない問題を修正
 *
 * ゲームのタイトル画面を表示するシーン。
 * タイトルロゴ、サブタイトル、バージョン情報、メニューボタンを表示し、
 * ユーザー操作に応じてゲームの開始やセーブデータの管理を行う。
 *
 * @信頼性レベル 🔵 設計文書準拠
 * @see docs/design/atelier-guild-rank/ui-design/screens/title.md
 */

import type { RexDialog, RexLabel, RexUIPlugin } from '@presentation/types/rexui';
import { isKeyForAction } from '@shared/constants/keybindings';
import Phaser from 'phaser';
import { THEME } from '../ui/theme';
import {
  TITLE_ANIMATION,
  TITLE_DEPTH,
  TITLE_LAYOUT,
  TITLE_SIZES,
  TITLE_STYLES,
  TITLE_TEXT,
} from './components/title/types';

/** デフォルト画面サイズ */
const DEFAULT_SCREEN = { WIDTH: 1280, HEIGHT: 720 } as const;

/** セーブデータリポジトリのインターフェース */
export interface ISaveDataRepository {
  exists(): boolean;
  load(): Promise<SaveData | null>;
  save(data: SaveData): Promise<void>;
  delete(): Promise<void>;
}

/** セーブデータの型定義 */
export interface SaveData {
  playerName: string;
  rank: string;
  day: number;
}

interface DialogAction {
  text: string;
  color: number;
  onClick: () => void;
}

interface DialogConfig {
  title: string;
  content: string;
  width: number;
  height: number;
  actions: DialogAction[];
  backgroundColor?: number;
}

/**
 * TitleScene - タイトル画面シーン
 * タイトルロゴ・メニューボタン・ダイアログの表示を担当
 */
export class TitleScene extends Phaser.Scene {
  // ===========================================================================
  // プロパティ
  // ===========================================================================

  /**
   * rexUIプラグイン参照（テストでモックされる）
   * TASK-0059: rexUI型定義を適用
   * rexUIはプラグインによって注入されるため、definite assignment assertionを使用
   */
  declare rexUI: RexUIPlugin;

  /**
   * セーブデータリポジトリ（テストでモックされる）
   */
  protected saveDataRepository: ISaveDataRepository | null = null;

  /**
   * ボタン参照（破棄時に使用）
   * TASK-0059: rexUI型定義を適用
   */
  private buttons: RexLabel[] = [];

  /**
   * コンティニューボタン参照（有効/無効制御に使用）
   * TASK-0059: rexUI型定義を適用
   */
  private continueButton: RexLabel | null = null;

  /**
   * コンティニューボタン有効状態
   */
  private continueEnabled = false;

  /**
   * 現在選択中のメニューインデックス（キーボードナビゲーション用）
   * 0: 新規ゲーム, 1: コンティニュー, 2: 設定
   */
  private selectedMenuIndex = 0;

  /**
   * キーボードイベントハンドラ参照
   */
  private keyboardHandler: ((event: { key: string }) => void) | null = null;

  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    const centerX = this.cameras.main.centerX;
    this.createTitleLogo(centerX);
    this.createSubtitle(centerX);
    this.createVersionInfo();
    const hasSaveData = this.saveDataRepository?.exists() ?? false;
    this.continueEnabled = hasSaveData;
    this.createMenuButtons(centerX, hasSaveData);
    this.checkSaveDataIntegrity();
    this.setupKeyboardListener();
    this.updateMenuSelection();
    this.fadeIn();
  }

  shutdown(): void {
    this.removeKeyboardListener();
    for (const button of this.buttons) button?.destroy();
    this.buttons = [];
    this.continueButton = null;
  }

  private createTitleLogo(centerX: number): void {
    this.add
      .text(centerX, TITLE_LAYOUT.TITLE_Y, TITLE_TEXT.TITLE, {
        fontFamily: THEME.fonts.primary,
        fontSize: TITLE_STYLES.TITLE_FONT_SIZE,
        color: TITLE_STYLES.TITLE_COLOR,
      })
      .setOrigin(0.5);
  }

  private createSubtitle(centerX: number): void {
    this.add
      .text(centerX, TITLE_LAYOUT.SUBTITLE_Y, TITLE_TEXT.SUBTITLE, {
        fontFamily: THEME.fonts.primary,
        fontSize: TITLE_STYLES.SUBTITLE_FONT_SIZE,
        color: TITLE_STYLES.SUBTITLE_COLOR,
      })
      .setOrigin(0.5);
  }

  private createVersionInfo(): void {
    const { width, height } = this.cameras.main;
    this.add
      .text(
        width - TITLE_LAYOUT.VERSION_OFFSET,
        height - TITLE_LAYOUT.VERSION_OFFSET,
        TITLE_TEXT.VERSION,
        {
          fontFamily: THEME.fonts.primary,
          fontSize: TITLE_STYLES.VERSION_FONT_SIZE,
          color: TITLE_STYLES.VERSION_COLOR,
        },
      )
      .setOrigin(1, 1);
  }

  private createMenuButtons(centerX: number, hasSaveData: boolean): void {
    const { BUTTON_START_Y, BUTTON_SPACING } = TITLE_LAYOUT;
    this.buttons.push(
      this.createButton(centerX, BUTTON_START_Y, TITLE_TEXT.NEW_GAME, THEME.colors.primary, () =>
        this.onNewGameClick(),
      ),
    );
    this.continueButton = this.createButton(
      centerX,
      BUTTON_START_Y + BUTTON_SPACING,
      TITLE_TEXT.CONTINUE,
      THEME.colors.primary,
      () => this.onContinueClick(),
    );
    if (!hasSaveData) this.continueButton.setAlpha(TITLE_ANIMATION.DISABLED_ALPHA);
    this.buttons.push(this.continueButton);
    this.buttons.push(
      this.createButton(
        centerX,
        BUTTON_START_Y + BUTTON_SPACING * 2,
        TITLE_TEXT.SETTINGS,
        THEME.colors.secondary,
        () => this.onSettingsClick(),
      ),
    );
  }

  /**
   * ボタンを生成する共通メソッド
   * @param x X座標
   * @param y Y座標
   * @param text ボタンテキスト
   * @param backgroundColor 背景色
   * @param onClick クリック時のコールバック
   * @returns 生成されたボタン（rexUI Labelコンポーネント）
   * TASK-0059: rexUI型定義を適用
   */
  private createButton(
    x: number,
    y: number,
    text: string,
    bgColor: number,
    onClick: () => void,
  ): RexLabel {
    const buttonBackground = this.rexUI.add.roundRectangle(
      0,
      0,
      TITLE_SIZES.BUTTON_WIDTH,
      TITLE_SIZES.BUTTON_HEIGHT,
      TITLE_SIZES.BUTTON_RADIUS,
      bgColor,
    );
    const label = this.add.text(0, 0, text, {
      fontFamily: THEME.fonts.primary,
      fontSize: TITLE_STYLES.BUTTON_FONT_SIZE,
      color: THEME.colors.textOnPrimary,
    });
    const button = this.rexUI.add.label({
      width: TITLE_SIZES.BUTTON_WIDTH,
      height: TITLE_SIZES.BUTTON_HEIGHT,
      background: buttonBackground,
      text: label,
      align: 'center',
      space: { left: 10, right: 10, top: 10, bottom: 10 },
      x,
      y,
    });
    button.setInteractive();
    button.on('pointerdown', onClick);
    button.layout();
    return button;
  }

  private onNewGameClick(): void {
    this.saveDataRepository?.exists() ? this.showConfirmDialog() : this.startNewGameAndTransition();
  }

  /**
   * 新規ゲームを開始してMainSceneに遷移
   * Issue #111: MainSceneでstartNewGame()を呼ぶようにシーンデータを渡す
   */
  private startNewGameAndTransition(): void {
    // MainSceneにシーンデータとして isNewGame: true を渡す
    // MainSceneのcreate()でこのフラグを見てstartNewGame()を呼ぶ
    this.fadeOutToScene('MainScene', { isNewGame: true });
  }

  private async onContinueClick(): Promise<void> {
    if (!this.continueEnabled) return;
    try {
      const saveData = await this.saveDataRepository?.load();
      if (saveData) this.fadeOutToScene('MainScene', { saveData });
    } catch {
      this.showErrorDialog('エラー: セーブデータの読み込みに失敗しました');
    }
  }

  private onSettingsClick(): void {
    this.showSettingsDialog();
  }

  private showConfirmDialog(): void {
    const { overlay, centerX, centerY } = this.createDialogOverlay();
    const dialog = this.createDialog(centerX, centerY, {
      title: TITLE_TEXT.CONFIRM_TITLE,
      content: TITLE_TEXT.CONFIRM_MESSAGE,
      width: TITLE_SIZES.CONFIRM_DIALOG_WIDTH,
      height: TITLE_SIZES.CONFIRM_DIALOG_HEIGHT,
      actions: [
        {
          text: TITLE_TEXT.YES,
          color: THEME.colors.primary,
          onClick: () => {
            this.saveDataRepository?.delete();
            overlay.destroy();
            dialog.destroy();
            // Issue #111: fadeOutToSceneの前にstartNewGame()を呼ぶ
            this.startNewGameAndTransition();
          },
        },
        {
          text: TITLE_TEXT.NO,
          color: THEME.colors.secondary,
          onClick: () => {
            overlay.destroy();
            dialog.destroy();
          },
        },
      ],
    });
  }

  private showSettingsDialog(): void {
    const { overlay, centerX, centerY } = this.createDialogOverlay();
    const dialog = this.createDialog(centerX, centerY, {
      title: TITLE_TEXT.SETTINGS_TITLE,
      content: TITLE_TEXT.SETTINGS_STUB,
      width: TITLE_SIZES.SETTINGS_DIALOG_WIDTH,
      height: TITLE_SIZES.SETTINGS_DIALOG_HEIGHT,
      actions: [
        {
          text: TITLE_TEXT.OK,
          color: THEME.colors.primary,
          onClick: () => {
            overlay.destroy();
            dialog.destroy();
          },
        },
      ],
    });
  }

  private showErrorDialog(message: string): void {
    const { overlay, centerX, centerY } = this.createDialogOverlay();
    const dialog = this.createDialog(centerX, centerY, {
      title: TITLE_TEXT.ERROR_TITLE,
      content: message,
      width: TITLE_SIZES.ERROR_DIALOG_WIDTH,
      height: TITLE_SIZES.ERROR_DIALOG_HEIGHT,
      backgroundColor: THEME.colors.error || THEME.colors.secondary,
      actions: [
        {
          text: TITLE_TEXT.OK,
          color: THEME.colors.primary,
          onClick: () => {
            overlay.destroy();
            dialog.destroy();
          },
        },
      ],
    });
  }

  private createDialogOverlay(): {
    overlay: Phaser.GameObjects.Rectangle;
    centerX: number;
    centerY: number;
  } {
    const { centerX, centerY } = this.cameras.main;
    const sceneWidth = this.scale?.width || DEFAULT_SCREEN.WIDTH;
    const sceneHeight = this.scale?.height || DEFAULT_SCREEN.HEIGHT;
    const overlay = this.add.rectangle(
      sceneWidth / 2,
      sceneHeight / 2,
      sceneWidth,
      sceneHeight,
      0x000000,
    );
    overlay.setAlpha(TITLE_ANIMATION.OVERLAY_ALPHA);
    overlay.setDepth(TITLE_DEPTH.OVERLAY);
    return { overlay, centerX, centerY };
  }

  /**
   * ダイアログを作成する共通メソッド
   * @param centerX 中央X座標
   * @param centerY 中央Y座標
   * @param config ダイアログ設定
   * @returns 生成されたダイアログ
   * TASK-0059: rexUI型定義を適用
   */
  private createDialog(centerX: number, centerY: number, config: DialogConfig): RexDialog {
    // 背景を先に作成（描画順序のため）
    const dialogBackground = this.rexUI.add.roundRectangle(
      0,
      0,
      config.width,
      config.height,
      TITLE_SIZES.DIALOG_RADIUS,
      config.backgroundColor ?? THEME.colors.secondary,
    );
    const title = this.add.text(0, 0, config.title, {
      fontFamily: THEME.fonts.primary,
      fontSize: TITLE_STYLES.DIALOG_TITLE_FONT_SIZE,
      color: THEME.colors.textOnPrimary,
    });
    const content = this.add.text(0, 0, config.content, {
      fontFamily: THEME.fonts.primary,
      fontSize: TITLE_STYLES.DIALOG_CONTENT_FONT_SIZE,
      color: THEME.colors.textOnPrimary,
    });
    const actionButtons = config.actions.map((action) => this.createDialogButton(action));
    const dialog = this.rexUI.add.dialog({
      x: centerX,
      y: centerY,
      width: config.width,
      height: config.height,
      background: dialogBackground,
      title,
      content,
      actions: actionButtons,
    });
    dialog.layout();
    dialog.setDepth(TITLE_DEPTH.DIALOG);
    dialog.popUp(TITLE_ANIMATION.DIALOG_POPUP_DURATION);
    return dialog;
  }

  // biome-ignore lint/suspicious/noExplicitAny: rexUI Labelの型は複雑
  private createDialogButton(action: DialogAction): any {
    const bg = this.rexUI.add.roundRectangle(
      0,
      0,
      TITLE_SIZES.DIALOG_BUTTON_WIDTH,
      TITLE_SIZES.DIALOG_BUTTON_HEIGHT,
      TITLE_SIZES.BUTTON_RADIUS,
      action.color,
    );
    const text = this.add.text(0, 0, action.text, {
      fontFamily: THEME.fonts.primary,
      fontSize: TITLE_STYLES.BUTTON_FONT_SIZE,
      color: THEME.colors.textOnPrimary,
    });
    const button = this.rexUI.add.label({
      width: TITLE_SIZES.DIALOG_BUTTON_WIDTH,
      height: TITLE_SIZES.DIALOG_BUTTON_HEIGHT,
      background: bg,
      text,
      align: 'center',
      space: { left: 5, right: 5, top: 5, bottom: 5 },
    });
    button.setInteractive();
    button.on('pointerdown', action.onClick);
    button.layout();
    return button;
  }

  private async checkSaveDataIntegrity(): Promise<void> {
    if (!this.saveDataRepository?.exists()) return;
    try {
      await this.saveDataRepository.load();
    } catch (error) {
      console.warn('Save data is corrupted:', error);
      this.continueEnabled = false;
      this.continueButton?.setAlpha(TITLE_ANIMATION.DISABLED_ALPHA);
    }
  }

  private fadeIn(): void {
    this.cameras.main.fadeIn(TITLE_ANIMATION.FADE_DURATION, 0, 0, 0);
  }

  // biome-ignore lint/suspicious/noExplicitAny: シーンデータは任意の型を許容
  private fadeOutToScene(targetScene: string, sceneData?: any): void {
    this.cameras.main.fadeOut(TITLE_ANIMATION.FADE_DURATION, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      sceneData !== undefined
        ? this.scene.start(targetScene, sceneData)
        : this.scene.start(targetScene);
    });
  }

  // ===========================================================================
  // キーボード操作（Issue #135）
  // ===========================================================================

  /**
   * キーボードリスナーを設定
   */
  private setupKeyboardListener(): void {
    // キーボード入力が利用可能な場合のみリスナーを設定
    if (!this.input?.keyboard?.on) {
      return;
    }
    this.keyboardHandler = (event: { key: string }) => this.handleKeyboardInput(event);
    this.input.keyboard.on('keydown', this.keyboardHandler);
  }

  /**
   * キーボードリスナーを解除
   */
  private removeKeyboardListener(): void {
    if (this.keyboardHandler) {
      this.input?.keyboard?.off('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  /**
   * キーボード入力を処理
   *
   * @param event - キーボードイベント
   */
  private handleKeyboardInput(event: { key: string }): void {
    const key = event.key;

    // 上下矢印キーでメニュー選択
    if (isKeyForAction(key, 'UP')) {
      this.moveMenuSelection(-1);
    } else if (isKeyForAction(key, 'DOWN')) {
      this.moveMenuSelection(1);
    }
    // Enter/Spaceで決定
    else if (isKeyForAction(key, 'CONFIRM')) {
      this.executeMenuAction();
    }
    // 数字キーで直接選択（1: 新規ゲーム, 2: コンティニュー, 3: 設定）
    else if (key === '1') {
      this.selectedMenuIndex = 0;
      this.updateMenuSelection();
      this.executeMenuAction();
    } else if (key === '2' && this.continueEnabled) {
      this.selectedMenuIndex = 1;
      this.updateMenuSelection();
      this.executeMenuAction();
    } else if (key === '3') {
      this.selectedMenuIndex = 2;
      this.updateMenuSelection();
      this.executeMenuAction();
    }
  }

  /**
   * メニュー選択を移動
   *
   * @param direction - 移動方向（-1: 上, 1: 下）
   */
  private moveMenuSelection(direction: number): void {
    const menuCount = 3; // 新規ゲーム, コンティニュー, 設定
    let newIndex = this.selectedMenuIndex + direction;

    // ループナビゲーション
    if (newIndex < 0) {
      newIndex = menuCount - 1;
    } else if (newIndex >= menuCount) {
      newIndex = 0;
    }

    // コンティニューが無効の場合はスキップ
    if (newIndex === 1 && !this.continueEnabled) {
      newIndex = direction > 0 ? 2 : 0;
    }

    this.selectedMenuIndex = newIndex;
    this.updateMenuSelection();
  }

  /**
   * メニュー選択の視覚的更新
   */
  private updateMenuSelection(): void {
    const SELECTED_SCALE = 1.1;
    const DEFAULT_SCALE = 1.0;

    this.buttons.forEach((button, index) => {
      if (!button) return;

      // setScaleメソッドが存在する場合のみスケール変更
      if (typeof button.setScale === 'function') {
        if (index === this.selectedMenuIndex) {
          // 選択中のボタンをハイライト
          button.setScale(SELECTED_SCALE);
        } else {
          // 非選択のボタンは通常表示
          button.setScale(DEFAULT_SCALE);
        }
      }
    });
  }

  /**
   * 選択中のメニューアクションを実行
   */
  private executeMenuAction(): void {
    switch (this.selectedMenuIndex) {
      case 0:
        this.onNewGameClick();
        break;
      case 1:
        if (this.continueEnabled) {
          this.onContinueClick();
        }
        break;
      case 2:
        this.onSettingsClick();
        break;
    }
  }
}
