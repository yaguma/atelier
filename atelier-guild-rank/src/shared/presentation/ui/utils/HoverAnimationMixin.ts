/**
 * HoverAnimationMixin
 * ホバーアニメーション適用関数群
 *
 * TASK-0053 Phase 7 共通UIユーティリティ基盤
 */

/** デフォルト設定 */
const DEFAULTS = {
  scaleUp: 1.05,
  duration: 100,
  ease: 'Power2',
} as const;

/**
 * ホバーアニメーション設定
 */
export interface HoverAnimationConfig {
  /** ホバー時のスケール値 (デフォルト: 1.05) */
  scaleUp?: number;
  /** アニメーション時間 (デフォルト: 100ms) */
  duration?: number;
  /** イージング関数 (デフォルト: 'Power2') */
  ease?: string;
  /** グロー色 (オプション) */
  glowColor?: number;
  /** グロー強度 (オプション) */
  glowIntensity?: number;
}

// ホバーハンドラを保存するためのWeakMap
const hoverHandlers = new WeakMap<
  Phaser.GameObjects.GameObject,
  { pointerover: () => void; pointerout: () => void; scene: Phaser.Scene }
>();

/**
 * ゲームオブジェクトにホバーアニメーションを適用する
 * @param gameObject 対象のゲームオブジェクト
 * @param scene Phaserシーン
 * @param config ホバーアニメーション設定（オプション）
 */
export function applyHoverAnimation(
  gameObject: Phaser.GameObjects.GameObject,
  scene: Phaser.Scene,
  config?: HoverAnimationConfig,
): void {
  // nullチェック
  if (!gameObject || !scene) {
    return;
  }

  const scaleUp = config?.scaleUp ?? DEFAULTS.scaleUp;
  const duration = config?.duration ?? DEFAULTS.duration;
  const ease = config?.ease ?? DEFAULTS.ease;

  // pointerover ハンドラ
  const pointeroverHandler = () => {
    scene.tweens.add({
      targets: gameObject,
      scaleX: scaleUp,
      scaleY: scaleUp,
      duration,
      ease,
    });
  };

  // pointerout ハンドラ
  const pointeroutHandler = () => {
    scene.tweens.add({
      targets: gameObject,
      scaleX: 1,
      scaleY: 1,
      duration,
      ease,
    });
  };

  // イベント登録
  gameObject.on('pointerover', pointeroverHandler);
  gameObject.on('pointerout', pointeroutHandler);

  // ハンドラを保存（後で解除できるように）
  hoverHandlers.set(gameObject, {
    pointerover: pointeroverHandler,
    pointerout: pointeroutHandler,
    scene,
  });
}

/**
 * ゲームオブジェクトからホバーアニメーションを解除する
 * @param gameObject 対象のゲームオブジェクト
 */
export function removeHoverAnimation(gameObject: Phaser.GameObjects.GameObject): void {
  // nullチェック
  if (!gameObject) {
    return;
  }

  // 保存されたハンドラを取得して解除
  const handlers = hoverHandlers.get(gameObject);
  if (handlers) {
    gameObject.off('pointerover');
    gameObject.off('pointerout');
    hoverHandlers.delete(gameObject);
  } else {
    // ハンドラが保存されていない場合も解除を試みる
    gameObject.off('pointerover');
    gameObject.off('pointerout');
  }
}
