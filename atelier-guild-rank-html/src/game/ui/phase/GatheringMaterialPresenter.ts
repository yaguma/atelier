/**
 * GatheringMaterialPresenter 実装
 *
 * TASK-0223: GatheringContainer素材提示実装
 * 素材選択肢のアニメーション付き表示を担当する
 */

import Phaser from 'phaser';
import type { MaterialOption } from '../material/IMaterialOptionView';
import { GatheringMaterialGenerator } from './GatheringMaterialGenerator';
import { TextStyles } from '../../config/TextStyles';

/**
 * GatheringMaterialPresenterクラス
 *
 * 素材選択肢を視覚的に印象的に表示する。
 * レア素材には特別なエフェクトを付与する。
 */
export class GatheringMaterialPresenter {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private generator: GatheringMaterialGenerator;

  /**
   * コンストラクタ
   * @param scene Phaserシーン
   * @param container 表示先コンテナ
   */
  constructor(scene: Phaser.Scene, container: Phaser.GameObjects.Container) {
    this.scene = scene;
    this.container = container;
    this.generator = new GatheringMaterialGenerator();
  }

  /**
   * 素材選択肢を順次表示
   * @param options 素材選択肢
   * @param onComplete 完了時のコールバック
   */
  async presentMaterials(
    options: MaterialOption[],
    onComplete: () => void
  ): Promise<void> {
    // ローディングエフェクト
    const loadingText = this.scene.add
      .text(200, 200, '🔍 素材を探索中...', {
        ...TextStyles.body,
        fontSize: '16px',
      })
      .setOrigin(0.5);
    this.container.add(loadingText);

    // ローディングアニメーション
    this.scene.tweens.add({
      targets: loadingText,
      alpha: 0.5,
      duration: 300,
      yoyo: true,
      repeat: 3,
    });

    await this.delay(1200);
    loadingText.destroy();

    // 素材を順次表示
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      const isRare = this.generator.isRareMaterial(option.probability ?? 1);

      if (isRare) {
        await this.presentRareMaterial(option, i);
      } else {
        await this.presentNormalMaterial(option, i);
      }

      await this.delay(200);
    }

    onComplete();
  }

  /**
   * 通常素材の表示
   */
  private async presentNormalMaterial(
    option: MaterialOption,
    index: number
  ): Promise<void> {
    return new Promise((resolve) => {
      const particle = this.createMaterialParticle(option, index);

      particle.setAlpha(0);
      particle.setScale(0.5);

      this.scene.tweens.add({
        targets: particle,
        alpha: 1,
        scale: 1,
        duration: 300,
        ease: 'Back.easeOut',
        onComplete: () => resolve(),
      });
    });
  }

  /**
   * レア素材の表示（特別なエフェクト付き）
   */
  private async presentRareMaterial(
    option: MaterialOption,
    index: number
  ): Promise<void> {
    return new Promise((resolve) => {
      const x = 100 + (index % 3) * 100;
      const y = 100 + Math.floor(index / 3) * 80;

      // 光のエフェクト
      const glow = this.scene.add.graphics();
      glow.fillStyle(0xffd700, 0.5);
      glow.fillCircle(x, y, 40);
      this.container.add(glow);

      // グローのパルスアニメーション
      this.scene.tweens.add({
        targets: glow,
        alpha: 0,
        scaleX: 2,
        scaleY: 2,
        duration: 500,
        ease: 'Power2',
        onComplete: () => glow.destroy(),
      });

      // 素材パーティクル
      const particle = this.createMaterialParticle(option, index);
      particle.setAlpha(0);
      particle.setScale(0);

      this.scene.tweens.add({
        targets: particle,
        alpha: 1,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 400,
        ease: 'Back.easeOut',
        onComplete: () => {
          // バウンス
          this.scene.tweens.add({
            targets: particle,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Bounce.easeOut',
            onComplete: () => resolve(),
          });
        },
      });

      // レア表示テキスト
      const rareText = this.scene.add
        .text(x, y - 30, '★ RARE ★', {
          fontSize: '10px',
          color: '#ffd700',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      this.container.add(rareText);

      this.scene.tweens.add({
        targets: rareText,
        y: y - 50,
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => rareText.destroy(),
      });
    });
  }

  /**
   * 素材パーティクルを作成
   */
  private createMaterialParticle(
    option: MaterialOption,
    index: number
  ): Phaser.GameObjects.Text {
    const x = 100 + (index % 3) * 100;
    const y = 100 + Math.floor(index / 3) * 80;

    const emoji = this.getMaterialEmoji(option.material);
    const particle = this.scene.add
      .text(x, y, emoji, {
        fontSize: '32px',
      })
      .setOrigin(0.5);

    this.container.add(particle);
    return particle;
  }

  /**
   * 素材から絵文字を取得
   */
  private getMaterialEmoji(material: { attributes?: string[] }): string {
    const attrs = material.attributes ?? [];

    if (attrs.includes('fire')) return '🔥';
    if (attrs.includes('water')) return '💧';
    if (attrs.includes('earth')) return '🌍';
    if (attrs.includes('wind')) return '💨';
    if (attrs.includes('light')) return '✨';
    if (attrs.includes('dark')) return '🌙';

    return '🌿';
  }

  /**
   * 遅延ヘルパー
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => this.scene.time.delayedCall(ms, resolve));
  }
}
