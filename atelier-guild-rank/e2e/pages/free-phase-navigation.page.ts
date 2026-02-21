import type { GameWindow } from '../types/game-window.types';
import { BasePage } from './base.page';

/**
 * フェーズ自由遷移のPage Object
 *
 * @description
 * TASK-0121: E2Eテスト - 総合シナリオ
 * フェーズタブ切り替え、採取2段階化、AP超過、掲示板の操作を提供する。
 *
 * @信頼性レベル 🟡 REQ-001〜REQ-006の推測
 */
export class FreePhaseNavigationPage extends BasePage {
  // =============================================================================
  // 座標定数（PhaseTabUI TAB_LAYOUT より算出）
  // =============================================================================

  /**
   * PhaseTabUIのタブ座標
   * TAB_START_X=16, TAB_WIDTH=100, TAB_SPACING=8, TAB_Y=20
   * PhaseTabUIはMainSceneのコンテンツエリア上部（HeaderUI: y=0〜50付近）の下に配置
   * HeaderUI高さ50 + PhaseTabUI TAB_Y=20 → キャンバス上のY≈70
   * 各タブ中心X: START_X + (WIDTH/2) + index * (WIDTH + SPACING)
   */
  static readonly TAB_COORDS = {
    /** 依頼タブ中心 */
    QUEST_ACCEPT: { x: 66, y: 70 },
    /** 採取タブ中心 */
    GATHERING: { x: 174, y: 70 },
    /** 調合タブ中心 */
    ALCHEMY: { x: 282, y: 70 },
    /** 納品タブ中心 */
    DELIVERY: { x: 390, y: 70 },
    /** 日終了ボタン（タブ行右端） */
    END_DAY: { x: 500, y: 70 },
  } as const;

  /** 待機時間 */
  static readonly WAIT = {
    PHASE_SWITCH: 500,
    SHORT: 200,
    MEDIUM: 500,
    LONG: 1000,
    DAY_ADVANCE: 2000,
  } as const;

  // =============================================================================
  // フェーズ切り替え操作
  // =============================================================================

  /**
   * デバッグツールで指定フェーズに直接切り替える
   *
   * @param phase - 切り替え先のフェーズ名
   */
  async switchPhase(phase: string): Promise<void> {
    await this.page.evaluate((p) => {
      const debug = (window as unknown as GameWindow).debug;
      const action = debug?.switchPhase;
      if (action) {
        action(p);
      } else {
        throw new Error('switchPhase debug action not available');
      }
    }, phase);
    await this.page.waitForTimeout(FreePhaseNavigationPage.WAIT.PHASE_SWITCH);
  }

  /**
   * タブクリックでフェーズを切り替える（キャンバス座標）
   *
   * @param phase - 切り替え先フェーズ
   */
  async clickPhaseTab(phase: 'QUEST_ACCEPT' | 'GATHERING' | 'ALCHEMY' | 'DELIVERY'): Promise<void> {
    const coords = FreePhaseNavigationPage.TAB_COORDS[phase];
    await this.clickCanvas(coords.x, coords.y);
    await this.page.waitForTimeout(FreePhaseNavigationPage.WAIT.PHASE_SWITCH);
  }

  /**
   * 日終了ボタンをクリック
   */
  async clickEndDay(): Promise<void> {
    const coords = FreePhaseNavigationPage.TAB_COORDS.END_DAY;
    await this.clickCanvas(coords.x, coords.y);
    await this.page.waitForTimeout(FreePhaseNavigationPage.WAIT.DAY_ADVANCE);
  }

  /**
   * 現在のフェーズを取得
   */
  async getCurrentPhase(): Promise<string> {
    return await this.getStateProperty('currentPhase', '');
  }

  /**
   * 現在の日数を取得
   */
  async getCurrentDay(): Promise<number> {
    return await this.getStateProperty('currentDay', 1);
  }

  /**
   * 行動ポイントを取得
   */
  async getActionPoints(): Promise<number> {
    return await this.getStateProperty('actionPoints', 0);
  }

  /**
   * AP超過分を取得
   */
  async getApOverflow(): Promise<number> {
    return await this.getStateProperty('apOverflow', 0);
  }

  /**
   * 残り日数を取得
   */
  async getRemainingDays(): Promise<number> {
    return await this.getStateProperty('remainingDays', 0);
  }

  /**
   * 掲示板依頼数を取得
   */
  async getBoardQuestCount(): Promise<number> {
    return await this.getStateProperty('boardQuestCount', 0);
  }

  /**
   * 訪問依頼数を取得
   */
  async getVisitorQuestCount(): Promise<number> {
    return await this.getStateProperty('visitorQuestCount', 0);
  }

  // =============================================================================
  // デバッグ操作ヘルパー
  // =============================================================================

  /**
   * 行動ポイントを設定する（デバッグ用）
   */
  async setActionPoints(ap: number): Promise<void> {
    await this.executeDebugActionWithArg('setActionPoints', ap);
  }

  /**
   * 日を終了する（デバッグツール版）
   */
  async debugEndDay(): Promise<void> {
    await this.executeDebugAction('endDay');
    await this.page.waitForTimeout(FreePhaseNavigationPage.WAIT.DAY_ADVANCE);
  }

  // =============================================================================
  // フェーズ切り替え待機ヘルパー
  // =============================================================================

  /**
   * 指定フェーズになるまで待機
   */
  async waitForPhaseToBe(phase: string, timeout = 5000): Promise<void> {
    await this.page.waitForFunction(
      (p) => {
        const state = (window as unknown as GameWindow).gameState?.();
        return state?.currentPhase === p;
      },
      phase,
      { timeout },
    );
  }

  /**
   * フェーズ切り替えにかかった時間を計測する
   *
   * @param targetPhase - 切り替え先フェーズ
   * @returns 切り替え時間（ミリ秒）
   */
  async measurePhaseSwitchTime(targetPhase: string): Promise<number> {
    const start = Date.now();
    await this.switchPhase(targetPhase);
    await this.waitForPhaseToBe(targetPhase, 5000);
    return Date.now() - start;
  }
}
