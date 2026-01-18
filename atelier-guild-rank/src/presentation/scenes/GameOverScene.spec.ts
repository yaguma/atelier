/**
 * GameOverScene.spec.ts - GameOverSceneのテスト
 * TASK-0027: リザルト画面（GameOver/GameClear）
 *
 * テストケース:
 * T-0027-01: ゲームオーバー遷移 - 画面表示
 * T-0027-03: 統計表示 - 正しい値
 * T-0027-04: タイトルへボタン - TitleSceneへ遷移
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameEndStats } from '../../shared/types';
import { GameOverScene } from './GameOverScene';

describe('GameOverScene', () => {
  let scene: GameOverScene;
  let mockRexUI: any;

  beforeEach(() => {
    scene = new GameOverScene();

    // rexUIプラグインのモック
    mockRexUI = {
      add: {
        roundRectangle: vi.fn(() => ({
          setFillStyle: vi.fn().mockReturnThis(),
        })),
        label: vi.fn(() => ({
          setInteractive: vi.fn().mockReturnThis(),
          on: vi.fn().mockReturnThis(),
          layout: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        })),
      },
    };

    (scene as any).rexUI = mockRexUI;

    // Phaserシーンのモック
    (scene as any).cameras = {
      main: {
        centerX: 640,
        centerY: 360,
      },
    };

    (scene as any).scale = {
      width: 1280,
      height: 720,
    };

    (scene as any).add = {
      rectangle: vi.fn().mockReturnThis(),
      text: vi.fn(() => ({
        setOrigin: vi.fn().mockReturnThis(),
      })),
    };

    (scene as any).scene = {
      start: vi.fn(),
    };
  });

  describe('T-0027-01: ゲームオーバー遷移 - 画面表示', () => {
    it('GameOverSceneが正しく初期化される', () => {
      const stats: GameEndStats = {
        finalRank: 'C',
        totalDays: 30,
        totalDeliveries: 45,
        totalGold: 2350,
      };

      scene.init({ stats });
      expect((scene as any).stats).toEqual(stats);
    });

    it('GameOverSceneのcreate()が正しく実行される', () => {
      const stats: GameEndStats = {
        finalRank: 'C',
        totalDays: 30,
        totalDeliveries: 45,
        totalGold: 2350,
      };

      scene.init({ stats });
      scene.create();

      // 背景が作成される
      expect((scene as any).add.rectangle).toHaveBeenCalled();
      // テキストが作成される（タイトル、メッセージ、統計情報4行、ボタンテキスト2つ）
      expect((scene as any).add.text).toHaveBeenCalled();
      // ボタンが作成される（タイトルへ、リトライ）
      expect(mockRexUI.add.label).toHaveBeenCalledTimes(2);
    });
  });

  describe('T-0027-03: 統計表示 - 正しい値', () => {
    it('統計情報が正しく表示される', () => {
      const stats: GameEndStats = {
        finalRank: 'C',
        totalDays: 30,
        totalDeliveries: 45,
        totalGold: 2350,
      };

      scene.init({ stats });
      scene.create();

      const textCalls = (scene as any).add.text.mock.calls;

      // 統計情報のテキストを確認
      const statsTexts = textCalls.slice(2); // タイトルとメッセージをスキップ

      expect(statsTexts.some((call: any) => call[2].includes('最終ランク: C'))).toBe(true);
      expect(statsTexts.some((call: any) => call[2].includes('経過日数: 30日'))).toBe(true);
      expect(statsTexts.some((call: any) => call[2].includes('総納品数: 45'))).toBe(true);
      expect(statsTexts.some((call: any) => call[2].includes('獲得ゴールド: 2,350G'))).toBe(true);
    });
  });

  describe('T-0027-04: タイトルへボタン - TitleSceneへ遷移', () => {
    it('タイトルへボタンをクリックするとTitleSceneへ遷移する', () => {
      const stats: GameEndStats = {
        finalRank: 'C',
        totalDays: 30,
        totalDeliveries: 45,
        totalGold: 2350,
      };

      scene.init({ stats });
      scene.create();

      // ボタンのonイベントを確認
      const buttonElement = mockRexUI.add.label.mock.results[0].value;
      const onHandler = buttonElement.on.mock.calls.find((call: any) => call[0] === 'pointerdown');

      expect(onHandler).toBeDefined();

      // ボタンをクリック
      onHandler[1]();

      // TitleSceneへ遷移することを確認
      expect((scene as any).scene.start).toHaveBeenCalledWith('TitleScene');
    });

    it('リトライボタンをクリックするとMainSceneへ遷移する', () => {
      const stats: GameEndStats = {
        finalRank: 'C',
        totalDays: 30,
        totalDeliveries: 45,
        totalGold: 2350,
      };

      scene.init({ stats });
      scene.create();

      // リトライボタンのクリックハンドラーを取得
      const buttonElement = mockRexUI.add.label.mock.results[1].value;
      const onHandler = buttonElement.on.mock.calls.find((call: any) => call[0] === 'pointerdown');

      expect(onHandler).toBeDefined();

      // ボタンをクリック
      onHandler[1]();

      // MainSceneへ遷移することを確認
      expect((scene as any).scene.start).toHaveBeenCalledWith('MainScene');
    });
  });

  describe('シーンのライフサイクル', () => {
    it('shutdown()でリソースが解放される', () => {
      const stats: GameEndStats = {
        finalRank: 'C',
        totalDays: 30,
        totalDeliveries: 45,
        totalGold: 2350,
      };

      scene.init({ stats });
      scene.create();

      // ボタンを取得
      const buttons = [
        mockRexUI.add.label.mock.results[0].value,
        mockRexUI.add.label.mock.results[1].value,
      ];

      // shutdown実行
      scene.shutdown();

      // 各ボタンのdestroyが呼ばれることを確認
      for (const button of buttons) {
        expect(button.destroy).toHaveBeenCalled();
      }
    });
  });
});
