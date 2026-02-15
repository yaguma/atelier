/**
 * TitleLogoコンポーネント
 * TASK-0058 TitleSceneリファクタリング
 *
 * @description
 * タイトルシーンのロゴ部分を表示するコンポーネント
 * - タイトル「ATELIER GUILD」
 * - サブタイトル「錬金術師ギルド」
 * - バージョン情報
 */

import { BaseComponent } from '@presentation/ui/components/BaseComponent';
import { THEME } from '@presentation/ui/theme';
import { TITLE_LAYOUT, TITLE_STYLES, TITLE_TEXT } from './types';

/**
 * TitleLogoコンポーネント
 * タイトル画面のロゴ・サブタイトル・バージョン情報を担当
 */
export class TitleLogo extends BaseComponent {
  /** タイトルテキスト */
  private titleText: Phaser.GameObjects.Text | null = null;

  /** サブタイトルテキスト */
  private subtitleText: Phaser.GameObjects.Text | null = null;

  /** バージョンテキスト */
  private versionText: Phaser.GameObjects.Text | null = null;

  /**
   * コンポーネントを作成
   */
  create(): void {
    // タイトルテキスト
    this.titleText = this.scene.add.text(this.container.x, TITLE_LAYOUT.TITLE_Y, TITLE_TEXT.TITLE, {
      fontFamily: THEME.fonts.primary,
      fontSize: TITLE_STYLES.TITLE_FONT_SIZE,
      color: TITLE_STYLES.TITLE_COLOR,
    });
    this.titleText.setOrigin(0.5);

    // サブタイトルテキスト
    this.subtitleText = this.scene.add.text(
      this.container.x,
      TITLE_LAYOUT.SUBTITLE_Y,
      TITLE_TEXT.SUBTITLE,
      {
        fontFamily: THEME.fonts.primary,
        fontSize: TITLE_STYLES.SUBTITLE_FONT_SIZE,
        color: TITLE_STYLES.SUBTITLE_COLOR,
      },
    );
    this.subtitleText.setOrigin(0.5);

    // バージョン情報テキスト
    const cameraWidth = this.scene.cameras.main.width;
    const cameraHeight = this.scene.cameras.main.height;
    this.versionText = this.scene.add.text(
      cameraWidth - TITLE_LAYOUT.VERSION_OFFSET,
      cameraHeight - TITLE_LAYOUT.VERSION_OFFSET,
      TITLE_TEXT.VERSION,
      {
        fontFamily: THEME.fonts.primary,
        fontSize: TITLE_STYLES.VERSION_FONT_SIZE,
        color: TITLE_STYLES.VERSION_COLOR,
      },
    );
    this.versionText.setOrigin(1, 1);
  }

  /**
   * コンポーネントを破棄
   */
  destroy(): void {
    if (this.titleText) {
      this.titleText.destroy();
      this.titleText = null;
    }
    if (this.subtitleText) {
      this.subtitleText.destroy();
      this.subtitleText = null;
    }
    if (this.versionText) {
      this.versionText.destroy();
      this.versionText = null;
    }
    this.container.destroy();
  }
}
