/**
 * プレイヤー状態エンティティ
 * TASK-0100: プレイヤー状態エンティティ
 *
 * プレイヤーの状態を管理するイミュータブルなエンティティ
 */

import { GuildRank } from '@domain/common/types';

/**
 * プレイヤー状態
 */
export interface PlayerState {
  /** 現在のギルドランク */
  readonly rank: GuildRank;
  /** 所持ゴールド */
  readonly gold: number;
  /** 現在の昇格ゲージ（累計貢献度） */
  readonly promotionGauge: number;
  /** 昇格に必要な貢献度（昇格ゲージ最大値） */
  readonly promotionGaugeMax: number;
  /** ランク維持残り日数 */
  readonly rankDaysRemaining: number;
  /** 所持アーティファクトID配列 */
  readonly artifacts: readonly string[];
  /** 残り行動ポイント */
  readonly actionPoints: number;
  /** 行動ポイント最大値 */
  readonly actionPointsMax: number;
}

/**
 * プレイヤー状態生成オプション
 */
export interface PlayerStateOptions {
  rank?: GuildRank;
  gold?: number;
  promotionGauge?: number;
  promotionGaugeMax?: number;
  rankDaysRemaining?: number;
  artifacts?: string[];
  actionPoints?: number;
  actionPointsMax?: number;
}

/**
 * プレイヤー状態を生成する
 * @param options 生成オプション
 * @returns プレイヤー状態
 */
export function createPlayerState(options: PlayerStateOptions = {}): PlayerState {
  return {
    rank: options.rank ?? GuildRank.G,
    gold: options.gold ?? 100,
    promotionGauge: options.promotionGauge ?? 0,
    promotionGaugeMax: options.promotionGaugeMax ?? 100,
    rankDaysRemaining: options.rankDaysRemaining ?? 30,
    artifacts: options.artifacts ?? [],
    actionPoints: options.actionPoints ?? 3,
    actionPointsMax: options.actionPointsMax ?? 3,
  };
}

/**
 * プレイヤー状態を更新する（イミュータブル）
 * @param state 現在の状態
 * @param updates 更新内容
 * @returns 新しいプレイヤー状態
 */
export function updatePlayerState(
  state: PlayerState,
  updates: Partial<PlayerStateOptions>
): PlayerState {
  return {
    rank: updates.rank ?? state.rank,
    gold: updates.gold ?? state.gold,
    promotionGauge: updates.promotionGauge ?? state.promotionGauge,
    promotionGaugeMax: updates.promotionGaugeMax ?? state.promotionGaugeMax,
    rankDaysRemaining: updates.rankDaysRemaining ?? state.rankDaysRemaining,
    artifacts: updates.artifacts ?? [...state.artifacts],
    actionPoints: updates.actionPoints ?? state.actionPoints,
    actionPointsMax: updates.actionPointsMax ?? state.actionPointsMax,
  };
}

/**
 * ゴールドを加算する
 * @param state 現在の状態
 * @param amount 加算量
 * @returns 新しいプレイヤー状態
 */
export function addGold(state: PlayerState, amount: number): PlayerState {
  return updatePlayerState(state, { gold: state.gold + amount });
}

/**
 * ゴールドを減算する（0未満にはならない）
 * @param state 現在の状態
 * @param amount 減算量
 * @returns 新しいプレイヤー状態
 */
export function subtractGold(state: PlayerState, amount: number): PlayerState {
  return updatePlayerState(state, { gold: Math.max(0, state.gold - amount) });
}

/**
 * 昇格ゲージを加算する（最大値を超えない）
 * @param state 現在の状態
 * @param amount 加算量
 * @returns 新しいプレイヤー状態
 */
export function addPromotionGauge(
  state: PlayerState,
  amount: number
): PlayerState {
  return updatePlayerState(state, {
    promotionGauge: Math.min(
      state.promotionGaugeMax,
      state.promotionGauge + amount
    ),
  });
}

/**
 * アーティファクトを追加する
 * @param state 現在の状態
 * @param artifactId アーティファクトID
 * @returns 新しいプレイヤー状態
 */
export function addArtifact(
  state: PlayerState,
  artifactId: string
): PlayerState {
  return updatePlayerState(state, {
    artifacts: [...state.artifacts, artifactId],
  });
}

/**
 * アーティファクトを削除する
 * @param state 現在の状態
 * @param artifactId アーティファクトID
 * @returns 新しいプレイヤー状態
 */
export function removeArtifact(
  state: PlayerState,
  artifactId: string
): PlayerState {
  return updatePlayerState(state, {
    artifacts: state.artifacts.filter((id) => id !== artifactId),
  });
}

/**
 * 行動ポイントを消費する（0未満にはならない）
 * @param state 現在の状態
 * @param amount 消費量
 * @returns 新しいプレイヤー状態
 */
export function useActionPoint(
  state: PlayerState,
  amount: number
): PlayerState {
  return updatePlayerState(state, {
    actionPoints: Math.max(0, state.actionPoints - amount),
  });
}

/**
 * 行動ポイントを最大値にリセットする
 * @param state 現在の状態
 * @returns 新しいプレイヤー状態
 */
export function resetActionPoints(state: PlayerState): PlayerState {
  return updatePlayerState(state, { actionPoints: state.actionPointsMax });
}

/**
 * ランクを設定する
 * @param state 現在の状態
 * @param rank 新しいランク
 * @returns 新しいプレイヤー状態
 */
export function setRank(state: PlayerState, rank: GuildRank): PlayerState {
  return updatePlayerState(state, { rank });
}

/**
 * ランク残り日数を1減らす（0未満にはならない）
 * @param state 現在の状態
 * @returns 新しいプレイヤー状態
 */
export function decrementRankDaysRemaining(state: PlayerState): PlayerState {
  return updatePlayerState(state, {
    rankDaysRemaining: Math.max(0, state.rankDaysRemaining - 1),
  });
}
