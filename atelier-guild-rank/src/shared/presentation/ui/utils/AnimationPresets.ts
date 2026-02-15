/**
 * AnimationPresets
 * アニメーション設定の統一プリセット
 *
 * TASK-0054 Phase 7 テーマ定数統一（カラー・アニメーション）
 *
 * @description
 * 各UIコンポーネントで重複していたアニメーション設定を統一。
 * フェード、スケール、スライド、カード、ボタンのアニメーションプリセットを提供。
 *
 * 🟡 信頼性レベル: コードベース調査から妥当な推測
 */

/**
 * アニメーションプリセット
 *
 * 各コンポーネントで使用するアニメーション設定を一元管理。
 * Phaser.tweens.add() に渡す設定オブジェクトとして使用可能。
 */
export const AnimationPresets = {
  /**
   * フェードアニメーション
   * 表示/非表示の切り替えに使用
   */
  fade: {
    /** フェードイン */
    in: { alpha: { from: 0, to: 1 }, duration: 300, ease: 'Power2' },
    /** フェードアウト */
    out: { alpha: { from: 1, to: 0 }, duration: 300, ease: 'Power2' },
    /** クイックフェード（150ms） */
    quick: { duration: 150 },
    /** スローフェード（500ms） */
    slow: { duration: 500 },
  },

  /**
   * スケールアニメーション
   * ホバー、プレス、ポップ効果に使用
   */
  scale: {
    /** ポップイン効果（出現時） */
    pop: { scale: { from: 0.8, to: 1 }, duration: 200, ease: 'Back.easeOut' },
    /** ホバー時の拡大（1.05倍）- QuestCardUI準拠 */
    hover: { scale: 1.05, duration: 150, ease: 'Quad.Out' },
    /** ホバー時の拡大（1.1倍）- CardUI準拠 */
    hoverLarge: { scaleX: 1.1, scaleY: 1.1, duration: 100, ease: 'Power2' },
    /** プレス時の縮小 */
    press: { scale: 0.95, duration: 100, ease: 'Power2' },
    /** バウンス効果 */
    bounce: { scale: { from: 0.5, to: 1 }, duration: 400, ease: 'Bounce.easeOut' },
    /** 通常状態に戻す */
    reset: { scale: 1.0, duration: 100, ease: 'Power2' },
    /** 通常状態に戻す（scaleX/Y形式） */
    resetXY: { scaleX: 1, scaleY: 1, duration: 100, ease: 'Power2' },
  },

  /**
   * スライドアニメーション
   * 移動効果に使用
   */
  slide: {
    /** 左へスライド */
    left: { x: '-=100', duration: 300, ease: 'Power2' },
    /** 右へスライド */
    right: { x: '+=100', duration: 300, ease: 'Power2' },
    /** 上へスライド */
    up: { y: '-=100', duration: 300, ease: 'Power2' },
    /** 下へスライド */
    down: { y: '+=100', duration: 300, ease: 'Power2' },
  },

  /**
   * カードアニメーション
   * カードの表示/非表示、選択に使用
   */
  card: {
    /** カードドロー（上から出現） */
    draw: { y: '-=50', alpha: { from: 0, to: 1 }, duration: 300, ease: 'Power2' },
    /** カード捨て（下へ消える） */
    discard: { y: '+=50', alpha: { from: 1, to: 0 }, duration: 200, ease: 'Power2' },
    /** カードフリップ */
    flip: { scaleX: { from: 1, to: 0 }, duration: 150 },
    /** カード選択時の拡大 */
    select: { scale: 1.1, duration: 150, ease: 'Back.easeOut' },
  },

  /**
   * ボタンアニメーション
   * ボタンのインタラクションに使用
   */
  button: {
    /** ホバー時の拡大 */
    hover: { scale: 1.05, duration: 100, ease: 'Power2' },
    /** クリック時の縮小 */
    click: { scale: 0.95, duration: 50, ease: 'Power2' },
    /** リリース時の復帰 */
    release: { scale: 1, duration: 100, ease: 'Power2' },
  },

  /**
   * サイドバーアニメーション
   * サイドバーへの移動に使用（QuestAcceptPhaseUI準拠）
   */
  sidebar: {
    /** サイドバーへ移動 */
    moveToSidebar: { scale: 0.6, duration: 400, ease: 'Power2' },
  },

  /**
   * タイミング定数
   * アニメーション時間の基準値
   */
  timing: {
    /** 即時（0ms） */
    instant: 0,
    /** 高速（100ms） */
    fast: 100,
    /** 標準（200ms） */
    normal: 200,
    /** 低速（400ms） */
    slow: 400,
    /** 超低速（800ms） */
    verySlow: 800,
  },

  /**
   * イージング関数
   * よく使用するイージング関数の定数
   */
  easing: {
    /** Power2（標準） */
    power2: 'Power2',
    /** Quad.Out（QuestCardUI準拠） */
    quadOut: 'Quad.Out',
    /** Back.easeOut（ポップ効果用） */
    backOut: 'Back.easeOut',
    /** Bounce.easeOut（バウンス効果用） */
    bounceOut: 'Bounce.easeOut',
  },
} as const;

/** アニメーションプリセットキーの型定義 */
export type AnimationPresetKey = keyof typeof AnimationPresets;

/** フェードアニメーションキーの型定義 */
export type FadeAnimationKey = keyof typeof AnimationPresets.fade;

/** スケールアニメーションキーの型定義 */
export type ScaleAnimationKey = keyof typeof AnimationPresets.scale;

/** スライドアニメーションキーの型定義 */
export type SlideAnimationKey = keyof typeof AnimationPresets.slide;

/** カードアニメーションキーの型定義 */
export type CardAnimationKey = keyof typeof AnimationPresets.card;

/** ボタンアニメーションキーの型定義 */
export type ButtonAnimationKey = keyof typeof AnimationPresets.button;

/** タイミング定数キーの型定義 */
export type TimingKey = keyof typeof AnimationPresets.timing;

/** イージング関数キーの型定義 */
export type EasingKey = keyof typeof AnimationPresets.easing;
