/**
 * QuestPanelConstants単体テスト
 *
 * TASK-0215: QuestPanelテスト
 */

import { describe, it, expect } from 'vitest';
import {
  QuestPanelLayout,
  QuestDifficultyColors,
} from '../../../../../src/game/ui/quest/QuestPanelConstants';

describe('QuestPanelConstants', () => {
  describe('QuestPanelLayout', () => {
    it('パネルサイズが定義されている', () => {
      expect(QuestPanelLayout.WIDTH).toBeGreaterThan(0);
      expect(QuestPanelLayout.HEIGHT).toBeGreaterThan(0);
    });

    it('パディングが定義されている', () => {
      expect(QuestPanelLayout.PADDING).toBeGreaterThan(0);
      expect(QuestPanelLayout.PADDING).toBeLessThan(50);
    });

    it('セクション高さが定義されている', () => {
      expect(QuestPanelLayout.HEADER_HEIGHT).toBeGreaterThan(0);
      expect(QuestPanelLayout.REWARD_HEIGHT).toBeGreaterThan(0);
      expect(QuestPanelLayout.REQUIREMENT_HEIGHT).toBeGreaterThan(0);
      expect(QuestPanelLayout.PROGRESS_HEIGHT).toBeGreaterThan(0);
    });

    it('セクション高さの合計がパネル高さより小さい', () => {
      const totalSectionHeight =
        QuestPanelLayout.HEADER_HEIGHT +
        QuestPanelLayout.REWARD_HEIGHT +
        QuestPanelLayout.REQUIREMENT_HEIGHT +
        QuestPanelLayout.PROGRESS_HEIGHT;
      expect(totalSectionHeight).toBeLessThan(QuestPanelLayout.HEIGHT);
    });

    it('幅が合理的な範囲内', () => {
      expect(QuestPanelLayout.WIDTH).toBeGreaterThanOrEqual(300);
      expect(QuestPanelLayout.WIDTH).toBeLessThanOrEqual(600);
    });

    it('高さが合理的な範囲内', () => {
      expect(QuestPanelLayout.HEIGHT).toBeGreaterThanOrEqual(400);
      expect(QuestPanelLayout.HEIGHT).toBeLessThanOrEqual(700);
    });
  });

  describe('QuestDifficultyColors', () => {
    it('全難易度の色が定義されている', () => {
      const difficulties = ['easy', 'normal', 'hard', 'expert'];
      difficulties.forEach((diff) => {
        expect(QuestDifficultyColors[diff]).toBeTypeOf('number');
      });
    });

    it('各難易度で異なる色が設定されている', () => {
      const colors = Object.values(QuestDifficultyColors);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });

    it('色が有効なHex値である', () => {
      Object.values(QuestDifficultyColors).forEach((color) => {
        expect(color).toBeGreaterThanOrEqual(0x000000);
        expect(color).toBeLessThanOrEqual(0xffffff);
      });
    });

    it('easyが緑系の色である', () => {
      // 緑は0x00ff00なので、緑成分が強い
      const color = QuestDifficultyColors.easy;
      const green = (color >> 8) & 0xff;
      expect(green).toBeGreaterThan(0x80);
    });

    it('expertが赤系の色である', () => {
      // 赤は0xff0000なので、赤成分が強い
      const color = QuestDifficultyColors.expert;
      const red = (color >> 16) & 0xff;
      expect(red).toBeGreaterThan(0x80);
    });
  });
});
