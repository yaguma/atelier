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

import type { IGameFlowManager } from '@application/services/game-flow-manager.interface';
import { Container, ServiceKeys } from '@infrastructure/di/container';
import type { RexDialog, RexLabel, RexUIPlugin } from '@presentation/types/rexui';
import Phaser from 'phaser';
import {
  TITLE_ANIMATION,
  TITLE_DEPTH,
  TITLE_LAYOUT,
  TITLE_SIZES,
  TITLE_STYLES,
  TITLE_TEXT,
} from '../ui/scenes/components/title/types';
import { THEME } from '../ui/theme';

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
   * GameFlowManager参照
   * Issue #111: ゲーム開始時にstartNewGame()を呼ぶために追加
   */
  private gameFlowManager: IGameFlowManager | null = null;

  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    // DIコンテナからGameFlowManagerを取得
    // Issue #111: ゲーム開始時にstartNewGame()を呼ぶために追加
    this.initializeGameFlowManager();

    const centerX = this.cameras.main.centerX;
    this.createTitleLogo(centerX);
    this.createSubtitle(centerX);
    this.createVersionInfo();
    const hasSaveData = this.saveDataRepository?.exists() ?? false;
    this.continueEnabled = hasSaveData;
    this.createMenuButtons(centerX, hasSaveData);
    this.checkSaveDataIntegrity();
    this.fadeIn();
  }

  /**
   * DIコンテナからGameFlowManagerを取得
   * Issue #111: ゲーム開始時にstartNewGame()を呼ぶために追加
   */
  private initializeGameFlowManager(): void {
    const container = Container.getInstance();
    if (container.has(ServiceKeys.GameFlowManager)) {
      this.gameFlowManager = container.resolve<IGameFlowManager>(ServiceKeys.GameFlowManager);
    }
  }

  shutdown(): void {
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
   * Issue #111: fadeOutToSceneの前にstartNewGame()を呼ぶ
   */
  private startNewGameAndTransition(): void {
    // GameFlowManagerで新規ゲームを開始（依頼生成などの初期化処理が実行される）
    this.gameFlowManager?.startNewGame();
    this.fadeOutToScene('MainScene');
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
}
