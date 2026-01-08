/**
 * SceneTransition テスト
 *
 * シーン遷移タイプと設定の型チェックを行う。
 */

import { describe, it, expect } from 'vitest';
import {
  TransitionType,
  SlideDirection,
  TransitionConfig,
  DefaultTransitions,
  SceneTransitionData,
  getDefaultTransition,
  getOverlayTransition,
} from '@game/managers/SceneTransition';
import { SceneKeys } from '@game/config/SceneKeys';

describe('SceneTransition', () => {
  describe('TransitionType', () => {
    it('有効な遷移タイプが定義されている', () => {
      const fadeType: TransitionType = 'fade';
      const slideType: TransitionType = 'slide';
      const noneType: TransitionType = 'none';

      expect(fadeType).toBe('fade');
      expect(slideType).toBe('slide');
      expect(noneType).toBe('none');
    });
  });

  describe('SlideDirection', () => {
    it('有効なスライド方向が定義されている', () => {
      const left: SlideDirection = 'left';
      const right: SlideDirection = 'right';
      const up: SlideDirection = 'up';
      const down: SlideDirection = 'down';

      expect(left).toBe('left');
      expect(right).toBe('right');
      expect(up).toBe('up');
      expect(down).toBe('down');
    });
  });

  describe('TransitionConfig', () => {
    it('基本的な遷移設定を作成できる', () => {
      const config: TransitionConfig = {
        type: 'fade',
        duration: 300,
      };

      expect(config.type).toBe('fade');
      expect(config.duration).toBe(300);
      expect(config.direction).toBeUndefined();
    });

    it('スライド遷移設定を作成できる', () => {
      const config: TransitionConfig = {
        type: 'slide',
        duration: 400,
        direction: 'left',
        ease: 'Power2',
      };

      expect(config.type).toBe('slide');
      expect(config.duration).toBe(400);
      expect(config.direction).toBe('left');
      expect(config.ease).toBe('Power2');
    });

    it('即時遷移設定を作成できる', () => {
      const config: TransitionConfig = {
        type: 'none',
        duration: 0,
      };

      expect(config.type).toBe('none');
      expect(config.duration).toBe(0);
    });
  });

  describe('DefaultTransitions', () => {
    it('standard遷移が定義されている', () => {
      expect(DefaultTransitions.standard.type).toBe('fade');
      expect(DefaultTransitions.standard.duration).toBe(300);
    });

    it('quick遷移が定義されている', () => {
      expect(DefaultTransitions.quick.type).toBe('none');
      expect(DefaultTransitions.quick.duration).toBe(0);
    });

    it('overlay遷移が定義されている', () => {
      expect(DefaultTransitions.overlay.type).toBe('fade');
      expect(DefaultTransitions.overlay.duration).toBe(200);
    });

    it('slideLeft遷移が定義されている', () => {
      expect(DefaultTransitions.slideLeft.type).toBe('slide');
      expect(DefaultTransitions.slideLeft.direction).toBe('left');
    });

    it('slideRight遷移が定義されている', () => {
      expect(DefaultTransitions.slideRight.type).toBe('slide');
      expect(DefaultTransitions.slideRight.direction).toBe('right');
    });
  });

  describe('SceneTransitionData', () => {
    it('遷移データを作成できる', () => {
      const data: SceneTransitionData = {
        from: SceneKeys.TITLE,
        to: SceneKeys.MAIN,
        transition: DefaultTransitions.standard,
        timestamp: Date.now(),
      };

      expect(data.from).toBe(SceneKeys.TITLE);
      expect(data.to).toBe(SceneKeys.MAIN);
      expect(data.transition.type).toBe('fade');
    });

    it('初回遷移（fromがnull）を作成できる', () => {
      const data: SceneTransitionData = {
        from: null,
        to: SceneKeys.BOOT,
        transition: DefaultTransitions.quick,
        timestamp: Date.now(),
      };

      expect(data.from).toBeNull();
      expect(data.to).toBe(SceneKeys.BOOT);
    });

    it('追加データ付きの遷移データを作成できる', () => {
      const data: SceneTransitionData = {
        from: SceneKeys.MAIN,
        to: SceneKeys.SHOP,
        transition: DefaultTransitions.overlay,
        data: {
          selectedItem: 'potion',
          gold: 500,
        },
        timestamp: Date.now(),
      };

      expect(data.data).toBeDefined();
      expect(data.data?.selectedItem).toBe('potion');
      expect(data.data?.gold).toBe(500);
    });
  });

  describe('ユーティリティ関数', () => {
    it('getDefaultTransition()がstandard設定のコピーを返す', () => {
      const transition = getDefaultTransition();

      expect(transition.type).toBe('fade');
      expect(transition.duration).toBe(300);

      // コピーであることを確認（元のオブジェクトと異なる参照）
      expect(transition).not.toBe(DefaultTransitions.standard);
    });

    it('getOverlayTransition()がoverlay設定のコピーを返す', () => {
      const transition = getOverlayTransition();

      expect(transition.type).toBe('fade');
      expect(transition.duration).toBe(200);

      // コピーであることを確認
      expect(transition).not.toBe(DefaultTransitions.overlay);
    });
  });
});
