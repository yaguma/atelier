/**
 * PhaseIndicator定数
 *
 * フェーズインジケーターUIのレイアウト・色定義
 */

import { GamePhase } from '../../../domain/common/types';

/**
 * レイアウト定数
 */
export const PhaseIndicatorLayout = {
  // 位置
  X: 200,
  Y: 100,

  // サイズ
  ITEM_WIDTH: 150,
  ITEM_HEIGHT: 50,
  ITEM_SPACING: 10,

  // コネクタ（フェーズ間の線）
  CONNECTOR_WIDTH: 30,
  CONNECTOR_HEIGHT: 4,
} as const;

/**
 * フェーズ情報
 */
export const PhaseInfo: Record<GamePhase, { label: string; icon: string }> = {
  [GamePhase.QUEST_ACCEPT]: { label: '依頼受注', icon: '📋' },
  [GamePhase.GATHERING]: { label: '採取', icon: '🌿' },
  [GamePhase.ALCHEMY]: { label: '調合', icon: '⚗️' },
  [GamePhase.DELIVERY]: { label: '納品', icon: '📦' },
};

/**
 * 色定数
 */
export const PhaseColors = {
  ACTIVE_BG: 0x4a8a4a,
  ACTIVE_BORDER: 0x6aaa6a,
  INACTIVE_BG: 0x3a3a5a,
  INACTIVE_BORDER: 0x4a4a6a,
  COMPLETED_BG: 0x2a5a2a,
  CONNECTOR_ACTIVE: 0x6aaa6a,
  CONNECTOR_INACTIVE: 0x4a4a6a,
} as const;
