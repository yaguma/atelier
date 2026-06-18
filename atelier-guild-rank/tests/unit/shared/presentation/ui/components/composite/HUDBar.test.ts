import { HUDBar } from '@shared/presentation/ui/components/composite/HUDBar';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it, type Mock } from 'vitest';
import { createComponentMockScene } from '../test-helpers';

/** make.text は共有モックを返すため、setText の呼び出し履歴を取得する */
const getSharedText = (scene: Phaser.Scene) =>
  (scene as unknown as { make: { text: Mock } }).make.text({ add: false }) as {
    setText: Mock;
  };

/** add.graphics の共有モックを取得する */
const getSharedGraphics = (scene: Phaser.Scene) =>
  (scene as unknown as { add: { graphics: Mock } }).add.graphics() as {
    fillRoundedRect: Mock;
    fillStyle: Mock;
  };

describe('HUDBar', () => {
  let scene: Phaser.Scene;
  beforeEach(() => {
    scene = createComponentMockScene();
  });

  describe('正常系', () => {
    it('生成と create が成功する', () => {
      const hud = new HUDBar(scene, 0, 0, {
        data: {
          gold: 100,
          actionPoints: 2,
          maxActionPoints: 3,
          day: 5,
          rank: 'E',
          contribution: 10,
        },
      });
      expect(() => hud.create()).not.toThrow();
      expect(hud.getData().gold).toBe(100);
    });

    it('update でデータが反映される', () => {
      const hud = new HUDBar(scene, 0, 0);
      hud.create();
      hud.update({ gold: 500, day: 10 });
      expect(hud.getData().gold).toBe(500);
      expect(hud.getData().day).toBe(10);
    });

    // TASK-0002 テストケース1: データ更新で表示が反映される
    it('update({ gold: 500 }) でゴールド表示が 500G になる', () => {
      const hud = new HUDBar(scene, 0, 0);
      hud.create();
      hud.update({ gold: 500 });

      const sharedText = getSharedText(scene);
      expect(sharedText.setText).toHaveBeenCalledWith('500G');
    });

    // ランクは pill 型バッジとして描画される（fillRoundedRect 呼び出し）
    it('ランクバッジが角丸矩形で描画される', () => {
      const hud = new HUDBar(scene, 0, 0, { data: { rank: 'A' } });
      hud.create();

      const graphics = getSharedGraphics(scene);
      expect(graphics.fillRoundedRect).toHaveBeenCalled();
    });
  });

  describe('残り日数の点滅', () => {
    // TASK-0002 テストケース2: 残り日数3日以下で点滅
    it('残り3日で getRemainingDaysBlinking() が true', () => {
      const hud = new HUDBar(scene, 0, 0, { data: { day: 10 } });
      hud.create();
      expect(hud.getRemainingDaysBlinking()).toBe(false);

      hud.update({ remainingDays: 3 });
      expect(hud.getRemainingDaysBlinking()).toBe(true);
    });

    it('残り3日で点滅Tweenが起動する', () => {
      const hud = new HUDBar(scene, 0, 0, { data: { day: 10 } });
      hud.create();
      const tweensAdd = (scene as unknown as { tweens: { add: Mock } }).tweens.add;
      tweensAdd.mockClear();

      hud.update({ remainingDays: 3 });
      expect(tweensAdd).toHaveBeenCalled();
    });
  });

  describe('リソース管理', () => {
    it('destroy が例外を投げない', () => {
      const hud = new HUDBar(scene, 0, 0);
      hud.create();
      expect(() => hud.destroy()).not.toThrow();
    });

    // TASK-0002 テストケース3: destroy() で点滅Tween停止
    it('点滅中に destroy すると Tween が停止される', () => {
      const hud = new HUDBar(scene, 0, 0, { data: { day: 10 } });
      hud.create();
      hud.update({ remainingDays: 3 });

      const tweenResult = (
        scene as unknown as { tweens: { add: Mock } }
      ).tweens.add.mock.results.at(-1)?.value as { stop: Mock };

      hud.destroy();
      expect(tweenResult.stop).toHaveBeenCalled();
    });
  });
});
