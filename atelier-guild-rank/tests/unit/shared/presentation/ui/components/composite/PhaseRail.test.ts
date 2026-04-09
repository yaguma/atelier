import { PhaseRail } from '@shared/presentation/ui/components/composite/PhaseRail';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it } from 'vitest';
import { createComponentMockScene } from '../test-helpers';

describe('PhaseRail', () => {
  let scene: Phaser.Scene;
  beforeEach(() => {
    scene = createComponentMockScene();
  });

  it('生成と create が成功する', () => {
    const rail = new PhaseRail(scene, 0, 0);
    expect(() => rail.create()).not.toThrow();
    expect(rail.getCurrent()).toBe('QUEST_ACCEPT');
  });

  it('setCurrent で現在のフェーズが切り替わる', () => {
    const rail = new PhaseRail(scene, 0, 0);
    rail.create();
    rail.setCurrent('ALCHEMY');
    expect(rail.getCurrent()).toBe('ALCHEMY');
  });

  it('destroy が例外を投げない', () => {
    const rail = new PhaseRail(scene, 0, 0);
    rail.create();
    expect(() => rail.destroy()).not.toThrow();
  });
});
