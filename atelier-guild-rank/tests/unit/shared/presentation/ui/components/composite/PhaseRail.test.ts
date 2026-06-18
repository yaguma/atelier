import { PhaseRail } from '@shared/presentation/ui/components/composite/PhaseRail';
import { Colors } from '@shared/theme';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it, type Mock } from 'vitest';
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

  // TASK-0005 テストケース1: アクティブタブが草色 (#7BAE7F) になる
  it('setCurrent で該当タブ背景が brand.primary (#7BAE7F) で塗られる', () => {
    const rail = new PhaseRail(scene, 0, 0);
    rail.create();
    rail.setCurrent('GATHERING');

    // test-helpers の rectangle モックは呼び出しごとに別オブジェクトを返す
    const rectResults = (scene.add.rectangle as unknown as Mock).mock.results;
    const activeStyled = rectResults.some((r) =>
      (r.value.setFillStyle as Mock).mock.calls.some(
        (call) => call[0] === Colors.brand.primary && call[1] === 1,
      ),
    );
    expect(activeStyled).toBe(true);
  });

  it('destroy が例外を投げない', () => {
    const rail = new PhaseRail(scene, 0, 0);
    rail.create();
    expect(() => rail.destroy()).not.toThrow();
  });
});
