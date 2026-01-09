/**
 * カード定義テスト
 *
 * CardView関連の定数、状態、オプションのテスト
 */

import { describe, it, expect } from 'vitest';
import {
  CardSize,
  CardLayout,
  CardSizeType,
  getCardScale,
  getCardSize,
} from '../../../../../src/game/ui/card/CardConstants';
import {
  CardState,
  CardStateStyles,
  getCardStateStyle,
  isCardInteractive,
} from '../../../../../src/game/ui/card/CardState';
import {
  getCardTypeDisplayOption,
  getAllCardTypeDisplayOptions,
} from '../../../../../src/game/ui/card/CardTypeOptions';
import { CardType } from '../../../../../src/domain/common/types';
import { CardTypeColors } from '../../../../../src/game/config/ColorPalette';

describe('CardConstants', () => {
  describe('CardSize', () => {
    it('STANDARDサイズが定義されている', () => {
      expect(CardSize.STANDARD).toEqual({ width: 120, height: 160 });
    });

    it('SMALLサイズが定義されている', () => {
      expect(CardSize.SMALL).toEqual({ width: 90, height: 120 });
    });

    it('LARGEサイズが定義されている', () => {
      expect(CardSize.LARGE).toEqual({ width: 150, height: 200 });
    });
  });

  describe('CardLayout', () => {
    it('レイアウト定数が定義されている', () => {
      expect(CardLayout.ICON_Y).toBe(45);
      expect(CardLayout.ICON_SIZE).toBe(48);
      expect(CardLayout.NAME_Y).toBe(85);
      expect(CardLayout.COST_X).toBe(100);
      expect(CardLayout.COST_Y).toBe(15);
      expect(CardLayout.DESCRIPTION_Y).toBe(110);
      expect(CardLayout.DESCRIPTION_WIDTH).toBe(100);
      expect(CardLayout.CORNER_RADIUS).toBe(8);
      expect(CardLayout.PADDING).toBe(8);
      expect(CardLayout.BORDER_WIDTH).toBe(2);
    });
  });

  describe('getCardScale', () => {
    it('STANDARDのスケールは1.0', () => {
      expect(getCardScale('STANDARD')).toBe(1);
    });

    it('SMALLのスケールは0.75', () => {
      expect(getCardScale('SMALL')).toBe(0.75);
    });

    it('LARGEのスケールは1.25', () => {
      expect(getCardScale('LARGE')).toBe(1.25);
    });
  });

  describe('getCardSize', () => {
    it('指定したサイズを取得できる', () => {
      const size = getCardSize('STANDARD');
      expect(size).toEqual({ width: 120, height: 160 });
    });

    it('元のオブジェクトのコピーを返す', () => {
      const size1 = getCardSize('STANDARD');
      const size2 = getCardSize('STANDARD');
      expect(size1).not.toBe(size2);
      expect(size1).toEqual(size2);
    });
  });
});

describe('CardState', () => {
  describe('CardStateStyles', () => {
    const states: CardState[] = ['normal', 'selected', 'disabled', 'hover', 'used'];

    states.forEach((state) => {
      it(`${state}状態のスタイルが定義されている`, () => {
        const style = CardStateStyles[state];
        expect(style).toBeDefined();
        expect(typeof style.backgroundColor).toBe('number');
        expect(typeof style.borderColor).toBe('number');
        expect(typeof style.borderWidth).toBe('number');
        expect(typeof style.alpha).toBe('number');
        expect(typeof style.scale).toBe('number');
      });
    });

    it('normal状態は標準スケール', () => {
      expect(CardStateStyles.normal.scale).toBe(1);
      expect(CardStateStyles.normal.alpha).toBe(1);
    });

    it('selected状態は拡大される', () => {
      expect(CardStateStyles.selected.scale).toBeGreaterThan(1);
    });

    it('disabled状態は半透明', () => {
      expect(CardStateStyles.disabled.alpha).toBeLessThan(1);
    });

    it('used状態は暗く縮小', () => {
      expect(CardStateStyles.used.alpha).toBeLessThan(1);
      expect(CardStateStyles.used.scale).toBeLessThan(1);
    });
  });

  describe('getCardStateStyle', () => {
    it('指定した状態のスタイルを取得できる', () => {
      const style = getCardStateStyle('normal');
      expect(style).toEqual(CardStateStyles.normal);
    });

    it('元のオブジェクトのコピーを返す', () => {
      const style1 = getCardStateStyle('selected');
      const style2 = getCardStateStyle('selected');
      expect(style1).not.toBe(style2);
      expect(style1).toEqual(style2);
    });
  });

  describe('isCardInteractive', () => {
    it('normal状態は操作可能', () => {
      expect(isCardInteractive('normal')).toBe(true);
    });

    it('selected状態は操作可能', () => {
      expect(isCardInteractive('selected')).toBe(true);
    });

    it('hover状態は操作可能', () => {
      expect(isCardInteractive('hover')).toBe(true);
    });

    it('disabled状態は操作不可', () => {
      expect(isCardInteractive('disabled')).toBe(false);
    });

    it('used状態は操作不可', () => {
      expect(isCardInteractive('used')).toBe(false);
    });
  });
});

describe('CardTypeOptions', () => {
  describe('getCardTypeDisplayOption', () => {
    it('採取地カードの表示オプションが返される', () => {
      const option = getCardTypeDisplayOption(CardType.GATHERING);

      expect(option.backgroundColor).toBe(CardTypeColors.gathering.background);
      expect(option.borderColor).toBe(CardTypeColors.gathering.border);
      expect(option.iconKey).toBe('icon-card-gathering');
      expect(option.labelColor).toBe(CardTypeColors.gathering.text);
      expect(option.accentColor).toBe(CardTypeColors.gathering.accent);
      expect(option.typeName).toBe('採取地');
    });

    it('レシピカードの表示オプションが返される', () => {
      const option = getCardTypeDisplayOption(CardType.RECIPE);

      expect(option.backgroundColor).toBe(CardTypeColors.recipe.background);
      expect(option.borderColor).toBe(CardTypeColors.recipe.border);
      expect(option.iconKey).toBe('icon-card-recipe');
      expect(option.labelColor).toBe(CardTypeColors.recipe.text);
      expect(option.accentColor).toBe(CardTypeColors.recipe.accent);
      expect(option.typeName).toBe('レシピ');
    });

    it('強化カードの表示オプションが返される', () => {
      const option = getCardTypeDisplayOption(CardType.ENHANCEMENT);

      expect(option.backgroundColor).toBe(CardTypeColors.enhancement.background);
      expect(option.borderColor).toBe(CardTypeColors.enhancement.border);
      expect(option.iconKey).toBe('icon-card-enhancement');
      expect(option.labelColor).toBe(CardTypeColors.enhancement.text);
      expect(option.accentColor).toBe(CardTypeColors.enhancement.accent);
      expect(option.typeName).toBe('強化');
    });
  });

  describe('getAllCardTypeDisplayOptions', () => {
    it('すべてのカード種別の表示オプションが返される', () => {
      const options = getAllCardTypeDisplayOptions();

      expect(options[CardType.GATHERING]).toBeDefined();
      expect(options[CardType.RECIPE]).toBeDefined();
      expect(options[CardType.ENHANCEMENT]).toBeDefined();
    });

    it('各種別のオプションが正しい', () => {
      const options = getAllCardTypeDisplayOptions();

      expect(options[CardType.GATHERING].typeName).toBe('採取地');
      expect(options[CardType.RECIPE].typeName).toBe('レシピ');
      expect(options[CardType.ENHANCEMENT].typeName).toBe('強化');
    });
  });
});
