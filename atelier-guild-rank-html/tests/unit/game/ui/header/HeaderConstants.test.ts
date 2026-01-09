/**
 * HeaderConstants テスト
 *
 * ヘッダーUI定数のテスト
 */

import { describe, it, expect } from 'vitest';
import {
  HeaderLayout,
  HeaderColors,
  RankColors,
} from '../../../../../src/game/ui/header/HeaderConstants';
import { GuildRank } from '../../../../../src/domain/common/types';

describe('HeaderConstants', () => {
  describe('HeaderLayout', () => {
    it('基本レイアウト定数が定義されている', () => {
      expect(HeaderLayout.X).toBeTypeOf('number');
      expect(HeaderLayout.Y).toBeTypeOf('number');
      expect(HeaderLayout.WIDTH).toBeTypeOf('number');
      expect(HeaderLayout.HEIGHT).toBeTypeOf('number');
    });

    it('幅が正の数', () => {
      expect(HeaderLayout.WIDTH).toBeGreaterThan(0);
    });

    it('高さが正の数', () => {
      expect(HeaderLayout.HEIGHT).toBeGreaterThan(0);
    });

    it('パディングが定義されている', () => {
      expect(HeaderLayout.PADDING_X).toBeGreaterThanOrEqual(0);
      expect(HeaderLayout.PADDING_Y).toBeGreaterThanOrEqual(0);
    });

    it('ランク表示エリアが定義されている', () => {
      expect(HeaderLayout.RANK_X).toBeTypeOf('number');
      expect(HeaderLayout.RANK_WIDTH).toBeGreaterThan(0);
    });

    it('経験値ゲージが定義されている', () => {
      expect(HeaderLayout.EXP_GAUGE_X).toBeTypeOf('number');
      expect(HeaderLayout.EXP_GAUGE_WIDTH).toBeGreaterThan(0);
      expect(HeaderLayout.EXP_GAUGE_HEIGHT).toBeGreaterThan(0);
    });

    it('各表示エリアのX座標が定義されている', () => {
      expect(HeaderLayout.DAY_X).toBeTypeOf('number');
      expect(HeaderLayout.GOLD_X).toBeTypeOf('number');
      expect(HeaderLayout.AP_X).toBeTypeOf('number');
      expect(HeaderLayout.MENU_X).toBeTypeOf('number');
    });

    it('APゲージが定義されている', () => {
      expect(HeaderLayout.AP_GAUGE_WIDTH).toBeGreaterThan(0);
      expect(HeaderLayout.AP_GAUGE_HEIGHT).toBeGreaterThan(0);
    });

    it('表示エリアが左から右に順番に配置されている', () => {
      expect(HeaderLayout.RANK_X).toBeLessThan(HeaderLayout.EXP_GAUGE_X);
      expect(HeaderLayout.EXP_GAUGE_X).toBeLessThan(HeaderLayout.DAY_X);
      expect(HeaderLayout.DAY_X).toBeLessThan(HeaderLayout.GOLD_X);
      expect(HeaderLayout.GOLD_X).toBeLessThan(HeaderLayout.AP_X);
      expect(HeaderLayout.AP_X).toBeLessThan(HeaderLayout.MENU_X);
    });
  });

  describe('HeaderColors', () => {
    it('背景色が定義されている', () => {
      expect(HeaderColors.BACKGROUND).toBeTypeOf('number');
      expect(HeaderColors.BACKGROUND_ALPHA).toBeTypeOf('number');
      expect(HeaderColors.BORDER).toBeTypeOf('number');
    });

    it('アルファ値が0-1の範囲', () => {
      expect(HeaderColors.BACKGROUND_ALPHA).toBeGreaterThan(0);
      expect(HeaderColors.BACKGROUND_ALPHA).toBeLessThanOrEqual(1);
    });

    it('ゲージ色が定義されている', () => {
      expect(HeaderColors.GAUGE_BACKGROUND).toBeTypeOf('number');
      expect(HeaderColors.GAUGE_EXP).toBeTypeOf('number');
      expect(HeaderColors.GAUGE_AP).toBeTypeOf('number');
      expect(HeaderColors.GAUGE_AP_LOW).toBeTypeOf('number');
      expect(HeaderColors.GAUGE_AP_EMPTY).toBeTypeOf('number');
    });
  });

  describe('RankColors', () => {
    it('全てのギルドランクに色が定義されている', () => {
      expect(RankColors[GuildRank.G]).toBeTypeOf('number');
      expect(RankColors[GuildRank.F]).toBeTypeOf('number');
      expect(RankColors[GuildRank.E]).toBeTypeOf('number');
      expect(RankColors[GuildRank.D]).toBeTypeOf('number');
      expect(RankColors[GuildRank.C]).toBeTypeOf('number');
      expect(RankColors[GuildRank.B]).toBeTypeOf('number');
      expect(RankColors[GuildRank.A]).toBeTypeOf('number');
      expect(RankColors[GuildRank.S]).toBeTypeOf('number');
    });

    it('各ランクで異なる色が設定されている', () => {
      const colors = Object.values(RankColors);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });

    it('Sランクは特別な色（ルビー赤）', () => {
      expect(RankColors[GuildRank.S]).toBe(0xff4500);
    });

    it('Gランクはグレー', () => {
      expect(RankColors[GuildRank.G]).toBe(0x808080);
    });
  });
});
