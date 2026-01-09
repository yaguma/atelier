/**
 * HeaderUIユーティリティ関数
 *
 * ヘッダーUIで使用するユーティリティ関数を定義する。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0201.md
 */

import { GuildRank } from '@domain/common/types';
import { RankColors } from './HeaderConstants';

/**
 * ランクに対応する色を取得する
 * @param rank ギルドランク
 * @returns カラーコード
 */
export const getRankColor = (rank: GuildRank): number => {
  return RankColors[rank] ?? RankColors[GuildRank.G];
};

/**
 * ゴールドを表示用にフォーマットする
 * @param gold ゴールド量
 * @returns フォーマットされた文字列
 */
export const formatGold = (gold: number): string => {
  if (gold >= 1000000) {
    return `${(gold / 1000000).toFixed(1)}M`;
  }
  if (gold >= 10000) {
    return `${(gold / 1000).toFixed(1)}K`;
  }
  return gold.toLocaleString();
};

/**
 * 日数を表示用にフォーマットする
 * @param current 現在の日数
 * @param max 最大日数
 * @returns フォーマットされた文字列
 */
export const formatDay = (current: number, max: number): string => {
  return `Day ${current}/${max}`;
};

/**
 * APを表示用にフォーマットする
 * @param current 現在のAP
 * @param max 最大AP
 * @returns フォーマットされた文字列
 */
export const formatAP = (current: number, max: number): string => {
  return `AP ${current}/${max}`;
};

/**
 * 経験値を表示用にフォーマットする
 * @param current 現在の経験値
 * @param required 必要経験値
 * @returns フォーマットされた文字列
 */
export const formatExp = (current: number, required: number): string => {
  return `${current}/${required}`;
};

/**
 * ランク名を取得する
 * @param rank ギルドランク
 * @returns ランク名（例: "ランク G"）
 */
export const getRankName = (rank: GuildRank): string => {
  return `ランク ${rank}`;
};
