/**
 * プレイヤー状態エンティティのテスト
 * TASK-0100: プレイヤー状態エンティティ
 *
 * プレイヤーの状態を管理するエンティティをテストする
 */

import { describe, it, expect } from 'vitest';
import {
  PlayerState,
  createPlayerState,
  updatePlayerState,
  addGold,
  subtractGold,
  addPromotionGauge,
  addArtifact,
  removeArtifact,
  useActionPoint,
  resetActionPoints,
  setRank,
  decrementRankDaysRemaining,
} from '../../../../src/domain/player/PlayerState';
import { GuildRank } from '../../../../src/domain/common/types';

describe('PlayerState Entity', () => {
  describe('createPlayerState（プレイヤー状態を生成）', () => {
    it('プレイヤー状態を生成できる', () => {
      const state = createPlayerState();

      expect(state).toBeDefined();
      expect(state.rank).toBeDefined();
      expect(state.gold).toBeDefined();
      expect(state.promotionGauge).toBeDefined();
      expect(state.promotionGaugeMax).toBeDefined();
      expect(state.rankDaysRemaining).toBeDefined();
      expect(state.artifacts).toBeDefined();
      expect(state.actionPoints).toBeDefined();
      expect(state.actionPointsMax).toBeDefined();
    });

    it('デフォルト値で生成される', () => {
      const state = createPlayerState();

      expect(state.rank).toBe(GuildRank.G);
      expect(state.gold).toBe(100);
      expect(state.promotionGauge).toBe(0);
      expect(state.promotionGaugeMax).toBe(100);
      expect(state.rankDaysRemaining).toBe(30);
      expect(state.artifacts).toEqual([]);
      expect(state.actionPoints).toBe(3);
      expect(state.actionPointsMax).toBe(3);
    });

    it('カスタム値で生成できる', () => {
      const state = createPlayerState({
        rank: GuildRank.E,
        gold: 500,
        promotionGauge: 50,
        promotionGaugeMax: 350,
        rankDaysRemaining: 25,
        artifacts: ['artifact_alchemist_glasses'],
        actionPoints: 4,
        actionPointsMax: 4,
      });

      expect(state.rank).toBe(GuildRank.E);
      expect(state.gold).toBe(500);
      expect(state.promotionGauge).toBe(50);
      expect(state.promotionGaugeMax).toBe(350);
      expect(state.rankDaysRemaining).toBe(25);
      expect(state.artifacts).toEqual(['artifact_alchemist_glasses']);
      expect(state.actionPoints).toBe(4);
      expect(state.actionPointsMax).toBe(4);
    });
  });

  describe('現在ランクを取得できる', () => {
    it('現在ランクを取得できる', () => {
      const state = createPlayerState({ rank: GuildRank.C });

      expect(state.rank).toBe(GuildRank.C);
    });

    it('各ランクを正しく扱える', () => {
      const ranks = [
        GuildRank.G,
        GuildRank.F,
        GuildRank.E,
        GuildRank.D,
        GuildRank.C,
        GuildRank.B,
        GuildRank.A,
        GuildRank.S,
      ];

      for (const rank of ranks) {
        const state = createPlayerState({ rank });
        expect(state.rank).toBe(rank);
      }
    });
  });

  describe('所持ゴールドを取得できる', () => {
    it('所持ゴールドを取得できる', () => {
      const state = createPlayerState({ gold: 250 });

      expect(state.gold).toBe(250);
    });

    it('ゴールドは0以上の整数', () => {
      const state = createPlayerState({ gold: 0 });

      expect(state.gold).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(state.gold)).toBe(true);
    });
  });

  describe('昇格ゲージを取得できる', () => {
    it('昇格ゲージを取得できる', () => {
      const state = createPlayerState({
        promotionGauge: 75,
        promotionGaugeMax: 200,
      });

      expect(state.promotionGauge).toBe(75);
      expect(state.promotionGaugeMax).toBe(200);
    });

    it('昇格ゲージは0以上', () => {
      const state = createPlayerState({ promotionGauge: 0 });

      expect(state.promotionGauge).toBeGreaterThanOrEqual(0);
    });

    it('昇格ゲージは最大値を超えない', () => {
      const state = createPlayerState({
        promotionGauge: 100,
        promotionGaugeMax: 100,
      });

      expect(state.promotionGauge).toBeLessThanOrEqual(state.promotionGaugeMax);
    });
  });

  describe('所持アーティファクトを取得できる', () => {
    it('所持アーティファクトを取得できる', () => {
      const artifacts = [
        'artifact_alchemist_glasses',
        'artifact_storage_bag',
      ];
      const state = createPlayerState({ artifacts });

      expect(state.artifacts).toEqual(artifacts);
    });

    it('アーティファクトは配列で管理される', () => {
      const state = createPlayerState();

      expect(Array.isArray(state.artifacts)).toBe(true);
    });

    it('初期状態はアーティファクトなし', () => {
      const state = createPlayerState();

      expect(state.artifacts).toEqual([]);
    });
  });

  describe('行動ポイントを取得できる', () => {
    it('行動ポイントを取得できる', () => {
      const state = createPlayerState({
        actionPoints: 2,
        actionPointsMax: 4,
      });

      expect(state.actionPoints).toBe(2);
      expect(state.actionPointsMax).toBe(4);
    });

    it('行動ポイントは0以上', () => {
      const state = createPlayerState({ actionPoints: 0 });

      expect(state.actionPoints).toBeGreaterThanOrEqual(0);
    });
  });

  describe('updatePlayerState（プレイヤー状態を更新・イミュータブル）', () => {
    it('プレイヤー状態を更新できる（イミュータブル）', () => {
      const original = createPlayerState();

      const updated = updatePlayerState(original, { gold: 500 });

      // 新しいオブジェクトが返される
      expect(updated).not.toBe(original);
      expect(updated.gold).toBe(500);
      // 元のオブジェクトは変更されない
      expect(original.gold).toBe(100);
    });

    it('複数フィールドを同時に更新できる', () => {
      const original = createPlayerState();

      const updated = updatePlayerState(original, {
        rank: GuildRank.F,
        gold: 300,
        promotionGauge: 50,
      });

      expect(updated.rank).toBe(GuildRank.F);
      expect(updated.gold).toBe(300);
      expect(updated.promotionGauge).toBe(50);
    });

    it('未指定フィールドは保持される', () => {
      const original = createPlayerState({
        rank: GuildRank.D,
        gold: 400,
      });

      const updated = updatePlayerState(original, { gold: 500 });

      expect(updated.rank).toBe(GuildRank.D);
      expect(updated.gold).toBe(500);
    });
  });

  describe('addGold（ゴールド加算）', () => {
    it('ゴールドを加算できる', () => {
      const state = createPlayerState({ gold: 100 });

      const next = addGold(state, 50);

      expect(next.gold).toBe(150);
    });

    it('元のstateは変更されない', () => {
      const state = createPlayerState({ gold: 100 });

      addGold(state, 50);

      expect(state.gold).toBe(100);
    });
  });

  describe('subtractGold（ゴールド減算）', () => {
    it('ゴールドを減算できる', () => {
      const state = createPlayerState({ gold: 100 });

      const next = subtractGold(state, 30);

      expect(next.gold).toBe(70);
    });

    it('ゴールドは0未満にならない', () => {
      const state = createPlayerState({ gold: 50 });

      const next = subtractGold(state, 100);

      expect(next.gold).toBe(0);
    });
  });

  describe('addPromotionGauge（昇格ゲージ加算）', () => {
    it('昇格ゲージを加算できる', () => {
      const state = createPlayerState({
        promotionGauge: 50,
        promotionGaugeMax: 100,
      });

      const next = addPromotionGauge(state, 30);

      expect(next.promotionGauge).toBe(80);
    });

    it('昇格ゲージは最大値を超えない', () => {
      const state = createPlayerState({
        promotionGauge: 80,
        promotionGaugeMax: 100,
      });

      const next = addPromotionGauge(state, 50);

      expect(next.promotionGauge).toBe(100);
    });
  });

  describe('addArtifact（アーティファクト追加）', () => {
    it('アーティファクトを追加できる', () => {
      const state = createPlayerState({ artifacts: [] });

      const next = addArtifact(state, 'artifact_alchemist_glasses');

      expect(next.artifacts).toContain('artifact_alchemist_glasses');
    });

    it('既存のアーティファクトは保持される', () => {
      const state = createPlayerState({
        artifacts: ['artifact_storage_bag'],
      });

      const next = addArtifact(state, 'artifact_alchemist_glasses');

      expect(next.artifacts).toContain('artifact_storage_bag');
      expect(next.artifacts).toContain('artifact_alchemist_glasses');
    });

    it('元のstateは変更されない', () => {
      const state = createPlayerState({ artifacts: [] });

      addArtifact(state, 'artifact_alchemist_glasses');

      expect(state.artifacts).toEqual([]);
    });
  });

  describe('removeArtifact（アーティファクト削除）', () => {
    it('アーティファクトを削除できる', () => {
      const state = createPlayerState({
        artifacts: ['artifact_alchemist_glasses', 'artifact_storage_bag'],
      });

      const next = removeArtifact(state, 'artifact_alchemist_glasses');

      expect(next.artifacts).not.toContain('artifact_alchemist_glasses');
      expect(next.artifacts).toContain('artifact_storage_bag');
    });

    it('存在しないアーティファクトを削除しても問題ない', () => {
      const state = createPlayerState({ artifacts: ['artifact_storage_bag'] });

      const next = removeArtifact(state, 'artifact_nonexistent');

      expect(next.artifacts).toEqual(['artifact_storage_bag']);
    });
  });

  describe('useActionPoint（行動ポイント消費）', () => {
    it('行動ポイントを消費できる', () => {
      const state = createPlayerState({ actionPoints: 3 });

      const next = useActionPoint(state, 1);

      expect(next.actionPoints).toBe(2);
    });

    it('行動ポイントは0未満にならない', () => {
      const state = createPlayerState({ actionPoints: 1 });

      const next = useActionPoint(state, 5);

      expect(next.actionPoints).toBe(0);
    });
  });

  describe('resetActionPoints（行動ポイントリセット）', () => {
    it('行動ポイントを最大値にリセットできる', () => {
      const state = createPlayerState({
        actionPoints: 1,
        actionPointsMax: 3,
      });

      const next = resetActionPoints(state);

      expect(next.actionPoints).toBe(3);
    });
  });

  describe('setRank（ランク設定）', () => {
    it('ランクを設定できる', () => {
      const state = createPlayerState({ rank: GuildRank.G });

      const next = setRank(state, GuildRank.F);

      expect(next.rank).toBe(GuildRank.F);
    });
  });

  describe('decrementRankDaysRemaining（残り日数減算）', () => {
    it('ランク残り日数を減らせる', () => {
      const state = createPlayerState({ rankDaysRemaining: 30 });

      const next = decrementRankDaysRemaining(state);

      expect(next.rankDaysRemaining).toBe(29);
    });

    it('残り日数は0未満にならない', () => {
      const state = createPlayerState({ rankDaysRemaining: 0 });

      const next = decrementRankDaysRemaining(state);

      expect(next.rankDaysRemaining).toBe(0);
    });
  });

  describe('不変性', () => {
    it('すべての操作で元のオブジェクトは変更されない', () => {
      const original = createPlayerState({
        rank: GuildRank.G,
        gold: 100,
        promotionGauge: 0,
        promotionGaugeMax: 100,
        rankDaysRemaining: 30,
        artifacts: [],
        actionPoints: 3,
        actionPointsMax: 3,
      });

      // 各種操作を実行
      addGold(original, 100);
      subtractGold(original, 50);
      addPromotionGauge(original, 25);
      addArtifact(original, 'artifact_test');
      useActionPoint(original, 1);
      resetActionPoints(original);
      setRank(original, GuildRank.S);
      decrementRankDaysRemaining(original);
      updatePlayerState(original, { gold: 999 });

      // 元のオブジェクトは変更されていない
      expect(original.rank).toBe(GuildRank.G);
      expect(original.gold).toBe(100);
      expect(original.promotionGauge).toBe(0);
      expect(original.rankDaysRemaining).toBe(30);
      expect(original.artifacts).toEqual([]);
      expect(original.actionPoints).toBe(3);
    });
  });
});
