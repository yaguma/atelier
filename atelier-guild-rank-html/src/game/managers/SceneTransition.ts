/**
 * シーン遷移タイプ定義
 *
 * シーン遷移のタイプ、設定、デフォルト値を定義する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/ui-design/overview.md
 */

import type { SceneKey } from '../config/SceneKeys';

/**
 * 遷移タイプ
 */
export type TransitionType = 'fade' | 'slide' | 'none';

/**
 * スライド方向
 */
export type SlideDirection = 'left' | 'right' | 'up' | 'down';

/**
 * 遷移設定
 */
export interface TransitionConfig {
  /** 遷移タイプ */
  type: TransitionType;
  /** 遷移時間（ミリ秒） */
  duration: number;
  /** スライド方向（type='slide'の場合） */
  direction?: SlideDirection;
  /** イージング関数名 */
  ease?: string;
}

/**
 * デフォルト遷移設定
 */
export const DefaultTransitions = {
  /** 標準遷移（フェード300ms） */
  standard: {
    type: 'fade' as TransitionType,
    duration: 300,
    ease: 'Power2',
  },
  /** 高速遷移（即時） */
  quick: {
    type: 'none' as TransitionType,
    duration: 0,
  },
  /** オーバーレイ遷移（フェード200ms） */
  overlay: {
    type: 'fade' as TransitionType,
    duration: 200,
    ease: 'Power1',
  },
  /** スライド遷移 */
  slideLeft: {
    type: 'slide' as TransitionType,
    duration: 300,
    direction: 'left' as SlideDirection,
    ease: 'Power2',
  },
  slideRight: {
    type: 'slide' as TransitionType,
    duration: 300,
    direction: 'right' as SlideDirection,
    ease: 'Power2',
  },
} as const;

/**
 * シーン遷移データ
 * 履歴管理などに使用
 */
export interface SceneTransitionData {
  /** 遷移元シーン */
  from: SceneKey | null;
  /** 遷移先シーン */
  to: SceneKey;
  /** 使用した遷移設定 */
  transition: TransitionConfig;
  /** 遷移時に渡されたデータ */
  data?: Record<string, unknown>;
  /** 遷移タイムスタンプ */
  timestamp: number;
}

/**
 * デフォルトの遷移設定を取得
 */
export function getDefaultTransition(): TransitionConfig {
  return { ...DefaultTransitions.standard };
}

/**
 * オーバーレイ用のデフォルト遷移設定を取得
 */
export function getOverlayTransition(): TransitionConfig {
  return { ...DefaultTransitions.overlay };
}
