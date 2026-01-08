/**
 * UITypes テスト
 *
 * UI型定義の型チェックを行う。
 */

import { describe, it, expect } from 'vitest';
import type {
  UIPosition,
  UISize,
  UIBounds,
  UIPadding,
  UISpace,
  UIBaseStyle,
  ButtonStateStyle,
  ButtonOptions,
  LabelOptions,
  PanelOptions,
  DialogOptions,
  DialogButton,
  ProgressBarOptions,
  ScrollPanelOptions,
  GridItem,
  GridButtonsOptions,
  ToastOptions,
  TooltipOptions,
} from '@game/ui/UITypes';

describe('UITypes', () => {
  describe('基本型', () => {
    it('UIPositionを作成できる', () => {
      const position: UIPosition = { x: 100, y: 200 };
      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
    });

    it('UISizeを作成できる', () => {
      const size: UISize = { width: 300, height: 400 };
      expect(size.width).toBe(300);
      expect(size.height).toBe(400);
    });

    it('UIBoundsを作成できる（位置+サイズ）', () => {
      const bounds: UIBounds = { x: 100, y: 200, width: 300, height: 400 };
      expect(bounds.x).toBe(100);
      expect(bounds.y).toBe(200);
      expect(bounds.width).toBe(300);
      expect(bounds.height).toBe(400);
    });

    it('UIPaddingを作成できる', () => {
      const padding: UIPadding = { top: 10, bottom: 20, left: 15, right: 15 };
      expect(padding.top).toBe(10);
      expect(padding.bottom).toBe(20);
    });

    it('UISpaceを作成できる', () => {
      const space: UISpace = { column: 8, row: 12 };
      expect(space.column).toBe(8);
      expect(space.row).toBe(12);
    });
  });

  describe('スタイル型', () => {
    it('UIBaseStyleを作成できる', () => {
      const style: UIBaseStyle = {
        backgroundColor: 0x333333,
        backgroundAlpha: 0.9,
        borderColor: 0x666666,
        borderWidth: 2,
        cornerRadius: 8,
        padding: 16,
      };
      expect(style.backgroundColor).toBe(0x333333);
      expect(style.cornerRadius).toBe(8);
    });

    it('UIBaseStyleのpaddingはオブジェクトでも指定できる', () => {
      const style: UIBaseStyle = {
        padding: { top: 10, bottom: 10, left: 20, right: 20 },
      };
      expect(style.padding).toEqual({ top: 10, bottom: 10, left: 20, right: 20 });
    });

    it('ButtonStateStyleを作成できる', () => {
      const stateStyle: ButtonStateStyle = {
        normal: 0x3366ff,
        hover: 0x4477ff,
        pressed: 0x2255ee,
        disabled: 0x666666,
      };
      expect(stateStyle.normal).toBe(0x3366ff);
      expect(stateStyle.disabled).toBe(0x666666);
    });
  });

  describe('コンポーネントオプション', () => {
    it('ButtonOptionsを作成できる', () => {
      const options: ButtonOptions = {
        x: 400,
        y: 300,
        text: 'Click Me',
        width: 200,
        height: 50,
        onClick: () => {},
        disabled: false,
      };
      expect(options.text).toBe('Click Me');
      expect(options.width).toBe(200);
    });

    it('LabelOptionsを作成できる', () => {
      const options: LabelOptions = {
        x: 100,
        y: 100,
        text: 'Gold:',
        icon: 'icon-gold',
        iconSize: 24,
        orientation: 'horizontal',
        space: 8,
        align: 'left',
      };
      expect(options.text).toBe('Gold:');
      expect(options.orientation).toBe('horizontal');
    });

    it('PanelOptionsを作成できる', () => {
      const options: PanelOptions = {
        x: 640,
        y: 360,
        width: 800,
        height: 600,
        title: 'Panel Title',
      };
      expect(options.title).toBe('Panel Title');
      expect(options.width).toBe(800);
    });

    it('DialogOptionsを作成できる', () => {
      const button1: DialogButton = {
        text: 'OK',
        onClick: () => {},
        primary: true,
      };
      const button2: DialogButton = {
        text: 'Cancel',
        onClick: () => {},
      };

      const options: DialogOptions = {
        title: 'Confirm',
        content: 'Are you sure?',
        buttons: [button1, button2],
        width: 400,
        modal: true,
        closeOnBackgroundClick: false,
      };
      expect(options.title).toBe('Confirm');
      expect(options.buttons).toHaveLength(2);
    });

    it('ProgressBarOptionsを作成できる', () => {
      const options: ProgressBarOptions = {
        x: 400,
        y: 50,
        width: 200,
        height: 20,
        value: 75,
        maxValue: 100,
        barColor: 0x00ff00,
        showText: true,
        textFormat: (v, m) => `${v}/${m}`,
      };
      expect(options.value).toBe(75);
      expect(options.maxValue).toBe(100);
    });

    it('ScrollPanelOptionsを作成できる', () => {
      const options: ScrollPanelOptions = {
        x: 640,
        y: 360,
        width: 600,
        height: 400,
        content: [] as any,
        scrollMode: 'vertical',
        showScrollbar: true,
      };
      expect(options.scrollMode).toBe('vertical');
      expect(options.showScrollbar).toBe(true);
    });

    it('GridButtonsOptionsを作成できる', () => {
      const item: GridItem = {
        id: 'item-1',
        content: 'Item 1',
        data: { value: 100 },
        selected: false,
        disabled: false,
      };

      const options: GridButtonsOptions = {
        x: 400,
        y: 300,
        items: [item],
        columns: 4,
        cellWidth: 100,
        cellHeight: 100,
        space: { column: 8, row: 8 },
        onItemClick: () => {},
      };
      expect(options.columns).toBe(4);
      expect(options.items).toHaveLength(1);
    });

    it('ToastOptionsを作成できる', () => {
      const options: ToastOptions = {
        message: 'Item acquired!',
        duration: 3000,
        position: 'bottom',
        type: 'success',
      };
      expect(options.message).toBe('Item acquired!');
      expect(options.type).toBe('success');
    });

    it('TooltipOptionsを作成できる', () => {
      const options: TooltipOptions = {
        target: {} as any,
        text: 'This is a tooltip',
        delay: 500,
        position: 'top',
      };
      expect(options.text).toBe('This is a tooltip');
      expect(options.position).toBe('top');
    });
  });
});
