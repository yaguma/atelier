import {
  getSelectionIndexFromKey,
  isKeyForAction,
  KEYBINDINGS,
} from '@shared/constants/keybindings';
import { describe, expect, it } from 'vitest';

describe('keybindings', () => {
  describe('KEYBINDINGS定数', () => {
    it('CONFIRMにEnterとSpaceが含まれる', () => {
      expect(KEYBINDINGS.CONFIRM).toContain('Enter');
      expect(KEYBINDINGS.CONFIRM).toContain(' ');
    });

    it('CANCELにEscapeが含まれる', () => {
      expect(KEYBINDINGS.CANCEL).toContain('Escape');
    });

    it('方向キーにArrowKeyとWASDが含まれる', () => {
      expect(KEYBINDINGS.UP).toContain('ArrowUp');
      expect(KEYBINDINGS.UP).toContain('w');
      expect(KEYBINDINGS.DOWN).toContain('ArrowDown');
      expect(KEYBINDINGS.DOWN).toContain('s');
      expect(KEYBINDINGS.LEFT).toContain('ArrowLeft');
      expect(KEYBINDINGS.LEFT).toContain('a');
      expect(KEYBINDINGS.RIGHT).toContain('ArrowRight');
      expect(KEYBINDINGS.RIGHT).toContain('d');
    });

    it('数字キー選択が1-9まで定義されている', () => {
      for (let i = 1; i <= 9; i++) {
        const action = `SELECT_${i}` as keyof typeof KEYBINDINGS;
        expect(KEYBINDINGS[action]).toContain(String(i));
        expect(KEYBINDINGS[action]).toContain(`Numpad${i}`);
      }
    });
  });

  describe('isKeyForAction', () => {
    it('Enterキーは CONFIRM アクションに対応する', () => {
      expect(isKeyForAction('Enter', 'CONFIRM')).toBe(true);
    });

    it('SpaceキーはCONFIRMアクションに対応する', () => {
      expect(isKeyForAction(' ', 'CONFIRM')).toBe(true);
    });

    it('EscapeキーはCANCELアクションに対応する', () => {
      expect(isKeyForAction('Escape', 'CANCEL')).toBe(true);
    });

    it('無関係なキーはfalseを返す', () => {
      expect(isKeyForAction('x', 'CONFIRM')).toBe(false);
      expect(isKeyForAction('Enter', 'CANCEL')).toBe(false);
    });

    it('方向キーが正しく判定される', () => {
      expect(isKeyForAction('ArrowUp', 'UP')).toBe(true);
      expect(isKeyForAction('w', 'UP')).toBe(true);
      expect(isKeyForAction('W', 'UP')).toBe(true);
      expect(isKeyForAction('ArrowDown', 'DOWN')).toBe(true);
    });

    it('NEXT_PHASEアクションにnとNが対応する', () => {
      expect(isKeyForAction('n', 'NEXT_PHASE')).toBe(true);
      expect(isKeyForAction('N', 'NEXT_PHASE')).toBe(true);
    });

    it('DELIVERアクションにd, D, Enterが対応する', () => {
      expect(isKeyForAction('d', 'DELIVER')).toBe(true);
      expect(isKeyForAction('D', 'DELIVER')).toBe(true);
      expect(isKeyForAction('Enter', 'DELIVER')).toBe(true);
    });

    it('END_DAYアクションにeとEが対応する', () => {
      expect(isKeyForAction('e', 'END_DAY')).toBe(true);
      expect(isKeyForAction('E', 'END_DAY')).toBe(true);
    });
  });

  describe('getSelectionIndexFromKey', () => {
    it('数字キー1-9で正しいインデックスを返す', () => {
      for (let i = 1; i <= 9; i++) {
        expect(getSelectionIndexFromKey(String(i))).toBe(i);
      }
    });

    it('テンキー1-9で正しいインデックスを返す', () => {
      for (let i = 1; i <= 9; i++) {
        expect(getSelectionIndexFromKey(`Numpad${i}`)).toBe(i);
      }
    });

    it('無効なキーでnullを返す', () => {
      expect(getSelectionIndexFromKey('0')).toBeNull();
      expect(getSelectionIndexFromKey('a')).toBeNull();
      expect(getSelectionIndexFromKey('Enter')).toBeNull();
      expect(getSelectionIndexFromKey('')).toBeNull();
    });
  });
});
