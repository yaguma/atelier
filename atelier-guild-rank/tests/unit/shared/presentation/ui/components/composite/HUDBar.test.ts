import { HUDBar } from '@shared/presentation/ui/components/composite/HUDBar';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it } from 'vitest';
import { createComponentMockScene } from '../test-helpers';

describe('HUDBar', () => {
  let scene: Phaser.Scene;
  beforeEach(() => {
    scene = createComponentMockScene();
  });

  it('生成と create が成功する', () => {
    const hud = new HUDBar(scene, 0, 0, {
      data: { gold: 100, actionPoints: 2, maxActionPoints: 3, day: 5, rank: 'E', contribution: 10 },
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

  it('destroy が例外を投げない', () => {
    const hud = new HUDBar(scene, 0, 0);
    hud.create();
    expect(() => hud.destroy()).not.toThrow();
  });
});
