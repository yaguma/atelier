/**
 * MaterialSlotUI.ts - 素材スロットUIコンポーネント
 * TASK-0044: 品質に応じた視覚効果
 *
 * @description
 * 素材を表示するスロットUIコンポーネント。
 * 品質に応じた視覚効果(枠色、光彩、パーティクル)を実装。
 *
 * @信頼性レベル
 * 🔵 品質ごとの枠色定義
 * 🟡 光彩効果とパーティクル(Phaser機能から推測)
 *
 * TODO(TASK-0074): このファイルは350行で300行上限を超過している。
 * 品質エフェクト関連メソッドを別ファイル（quality-effects.ts等）に分離を検討する。
 */

import { THEME } from '@presentation/ui/theme';
import { BaseComponent } from '@shared/components';
import type { MaterialId, Quality } from '@shared/types';
import Phaser from 'phaser';

/**
 * 素材表示用のインターフェース
 */
export interface MaterialDisplay {
  id: MaterialId;
  name: string;
  type: string;
  quality: Quality;
}

/**
 * MaterialSlotUI - 素材スロットコンポーネント
 *
 * 【責務】:
 * - 素材の表示(アイコン、名前、品質)
 * - 品質に応じた視覚効果の適用
 * - 選択可能/不可能状態の管理
 * - クリックイベントの処理
 */
export class MaterialSlotUI extends BaseComponent {
  private border!: Phaser.GameObjects.Graphics;
  private glowGraphics!: Phaser.GameObjects.Graphics;
  private iconText!: Phaser.GameObjects.Text;
  private nameText!: Phaser.GameObjects.Text;
  private qualityBadge!: Phaser.GameObjects.Container;
  private particleEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private glowTween?: Phaser.Tweens.Tween;

  private material: MaterialDisplay | null = null;
  private slotSize = 80;
  private clickCallback?: (material: MaterialDisplay) => void;

  /**
   * コンストラクタ
   *
   * @param scene - Phaserシーン
   * @param x - X座標
   * @param y - Y座標
   * @param onClick - クリック時のコールバック
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    onClick?: (material: MaterialDisplay) => void,
  ) {
    // Issue #137: 親コンテナに追加されるため、シーンには直接追加しない
    super(scene, x, y, { addToScene: false });
    this.clickCallback = onClick;
  }

  /**
   * UIコンポーネントを作成
   */
  create(): void {
    // 光彩用グラフィックス(枠の下に配置)
    this.glowGraphics = new Phaser.GameObjects.Graphics(this.scene);
    this.glowGraphics.setDepth(-1);
    this.container.add(this.glowGraphics);

    // 枠線
    this.border = new Phaser.GameObjects.Graphics(this.scene);
    this.border.lineStyle(2, THEME.colors.disabled, 1);
    this.border.strokeRect(-this.slotSize / 2, -this.slotSize / 2, this.slotSize, this.slotSize);
    this.container.add(this.border);

    // アイコン(絵文字で代用)
    this.iconText = this.scene.make
      .text({
        x: 0,
        y: -10,
        text: '',
        style: { fontSize: '32px' },
        add: false,
      })
      .setOrigin(0.5);
    this.container.add(this.iconText);

    // 素材名（スロット枠からはみ出さないようwordWrapを設定）
    this.nameText = this.scene.make
      .text({
        x: 0,
        y: 15,
        text: '',
        style: {
          fontSize: '12px',
          color: '#333333',
          wordWrap: { width: this.slotSize - 8 },
          align: 'center',
        },
        add: false,
      })
      .setOrigin(0.5);
    this.container.add(this.nameText);

    // 品質バッジ(空のコンテナとして初期化)
    this.qualityBadge = this.scene.make.container({ x: 0, y: 0, add: false });
    this.qualityBadge.name = 'MaterialSlotUI.qualityBadge';
    this.container.add(this.qualityBadge);
  }

  /**
   * 素材を設定して表示
   *
   * @param material - 表示する素材
   */
  setMaterial(material: MaterialDisplay): void {
    this.material = material;

    // アイコン設定(種類に応じた絵文字)
    const icon = this.getMaterialIcon(material.type);
    this.iconText.setText(icon);

    // 名前設定（スロット枠に収まるようフォントサイズを調整）
    this.nameText.setFontSize(12);
    this.nameText.setText(material.name);
    this.adjustNameTextSize();

    // 品質に応じた視覚効果を適用
    this.applyQualityEffect(material.quality);
  }

  /**
   * 空のスロットにする
   */
  setEmpty(): void {
    this.material = null;
    this.iconText.setText('');
    this.nameText.setText('');
    this.clearQualityEffect();

    // 枠線を無効状態にリセット
    this.border.clear();
    this.border.lineStyle(2, THEME.colors.disabled, 1);
    this.border.strokeRect(-this.slotSize / 2, -this.slotSize / 2, this.slotSize, this.slotSize);
  }

  /**
   * インタラクティブ状態を設定
   *
   * @param enabled - 有効/無効
   */
  setInteractive(enabled: boolean): void {
    // リスナーの累積追加を防ぐため、状態変更時は常に既存リスナーを解除する
    this.container.removeAllListeners();

    if (enabled && this.material && this.clickCallback) {
      this.container.setInteractive(
        new Phaser.Geom.Rectangle(
          -this.slotSize / 2,
          -this.slotSize / 2,
          this.slotSize,
          this.slotSize,
        ),
        Phaser.Geom.Rectangle.Contains,
      );

      this.container.on('pointerdown', () => {
        if (this.material && this.clickCallback) {
          this.clickCallback(this.material);
        }
      });

      // ホバーエフェクト
      this.container.on('pointerover', () => {
        this.container.setScale(1.05);
      });

      this.container.on('pointerout', () => {
        this.container.setScale(1.0);
      });
    } else {
      this.container.removeInteractive();
    }
  }

  /**
   * 品質に応じた視覚効果を適用
   *
   * @param quality - 品質(D〜S)
   */
  private applyQualityEffect(quality: Quality): void {
    const color = THEME.qualityColors[quality];
    const glow = THEME.qualityGlow[quality];

    // 枠色の設定
    this.border.clear();
    this.border.lineStyle(3, color, 1);
    this.border.strokeRect(-this.slotSize / 2, -this.slotSize / 2, this.slotSize, this.slotSize);

    // 品質バッジを作成
    this.createQualityBadge(quality);

    // 光彩効果の適用
    if (glow) {
      this.applyGlowEffect(color, glow.intensity);

      // S品質の場合はパーティクルも追加
      if ('particles' in glow && glow.particles) {
        this.createSQualityParticles(color);
      }
    }
  }

  /**
   * 光彩効果を適用
   *
   * @param color - 光彩の色
   * @param intensity - 光彩の強度(0.0〜1.0)
   */
  private applyGlowEffect(color: number, intensity: number): void {
    this.glowGraphics.clear();
    this.glowGraphics.fillStyle(color, intensity * 0.3);
    this.glowGraphics.fillCircle(0, 0, this.slotSize * 0.7);
    this.glowGraphics.setBlendMode(Phaser.BlendModes.ADD);

    // 脈動アニメーション
    this.glowTween = this.scene.tweens.add({
      targets: this.glowGraphics,
      alpha: { from: 0.5, to: 1 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * S品質用パーティクルエフェクトを作成
   *
   * @param color - パーティクルの色
   */
  private createSQualityParticles(color: number): void {
    // パーティクル用のグラフィックスを作成(小さな円)
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('sparkle', 8, 8);
    graphics.destroy();

    // パーティクルエミッターを作成
    const particles = this.scene.add.particles(this.container.x, this.container.y, 'sparkle', {
      speed: { min: 10, max: 30 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      frequency: 200,
      blendMode: Phaser.BlendModes.ADD,
      tint: color,
    });

    // 最初のエミッターを取得
    this.particleEmitter = particles as unknown as Phaser.GameObjects.Particles.ParticleEmitter;
  }

  /**
   * 品質バッジを作成
   *
   * @param quality - 品質(D〜S)
   */
  private createQualityBadge(quality: Quality): void {
    // 既存のバッジをクリア
    this.qualityBadge.removeAll(true);

    const color = THEME.qualityColors[quality];

    // バッジ背景
    const badge = new Phaser.GameObjects.Graphics(this.scene);
    badge.fillStyle(color, 1);
    badge.fillRoundedRect(-15, -15, 30, 20, 5);

    // バッジテキスト
    const text = this.scene.make
      .text({
        x: 0,
        y: -5,
        text: quality,
        style: {
          fontSize: '14px',
          color: quality === 'D' ? '#FFFFFF' : '#000000',
          fontStyle: 'bold',
        },
        add: false,
      })
      .setOrigin(0.5);

    // S品質の場合は特別なスタイル(虹色グラデーション)
    if (quality === 'S') {
      this.scene.tweens.add({
        targets: text,
        tint: { from: 0xff00ff, to: 0x00ffff },
        duration: 2000,
        yoyo: true,
        repeat: -1,
      });
    }

    // バッジを右上に配置
    this.qualityBadge.setPosition(this.slotSize / 2 - 15, -this.slotSize / 2 + 10);
    this.qualityBadge.add([badge, text]);
  }

  /**
   * 品質効果をクリア
   */
  private clearQualityEffect(): void {
    // 光彩をクリア
    this.glowGraphics.clear();
    if (this.glowTween) {
      this.glowTween.stop();
      this.glowTween = undefined;
    }

    // パーティクルを停止
    if (this.particleEmitter) {
      this.particleEmitter.stop();
      this.particleEmitter = undefined;
    }

    // バッジをクリア
    this.qualityBadge.removeAll(true);
  }

  /**
   * 素材名テキストがスロット枠に収まるようフォントサイズを自動縮小する
   *
   * スロット下部の余白を考慮し、テキスト高さが上限を超える場合に
   * フォントサイズを段階的に縮小する。最小フォントサイズは8px。
   */
  private adjustNameTextSize(): void {
    const maxTextHeight = this.slotSize / 2 - 15;
    const minFontSize = 8;
    let currentSize = 12;

    while (this.nameText.height > maxTextHeight && currentSize > minFontSize) {
      currentSize--;
      this.nameText.setFontSize(currentSize);
    }
  }

  /**
   * 素材タイプに応じたアイコン絵文字を取得
   *
   * @param type - 素材タイプ
   * @returns アイコン絵文字
   */
  private getMaterialIcon(type: string): string {
    const iconMap: Record<string, string> = {
      herb: '🌿', // 薬草
      ore: '🪨', // 鉱石
      mushroom: '🍄', // キノコ
      gem: '💎', // 宝石
      bone: '🦴', // 骨
      flower: '🌸', // 花
      water: '💧', // 水
      fire: '🔥', // 火
      ice: '❄️', // 氷
      wood: '🪵', // 木材
    };

    return iconMap[type] || '📦';
  }

  /**
   * コンポーネントを破棄
   */
  destroy(): void {
    this.clearQualityEffect();
    this.container.destroy();
  }
}
