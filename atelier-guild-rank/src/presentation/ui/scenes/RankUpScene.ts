/**
 * RankUpSceneコンポーネント - 昇格試験画面UI管理
 * TASK-0026 昇格試験画面実装 / TASK-0055 RankUpSceneリファクタリング
 */

import type Phaser from 'phaser';
import { BaseComponent } from './components/BaseComponent';
import type { Artifact, RankTest, RankUpReward, TestState } from './components/rankup';
import {
  RankUpHeader,
  RankUpRequirements,
  RankUpRewards,
  RankUpTestPanel,
} from './components/rankup';

// 定数定義
const UI_LAYOUT = {
  COMPONENT_X: 160,
  COMPONENT_Y: 80,
  HEADER_X: 200,
  HEADER_Y: 30,
  REQUIREMENTS_X: 200,
  REQUIREMENTS_Y: 120,
  PANEL_X: 200,
  PANEL_Y: 300,
  REWARDS_X: 200,
  REWARDS_Y: 150,
} as const;

const ERROR_MESSAGES = {
  EVENT_BUS_NOT_AVAILABLE: 'EventBus is not available in scene.data',
  RANK_SERVICE_NOT_AVAILABLE: 'RankService is not available',
  TEST_NOT_AVAILABLE: 'No test is available',
  FAILED_TO_EMIT_EVENT: 'Failed to emit event:',
} as const;

const KEYBOARD_KEYS = {
  START_TEST: 'Enter',
  DECLINE: 'Escape',
  SELECT_1: '1',
  SELECT_2: '2',
  SELECT_3: '3',
} as const;

// 型定義
interface IEventBus {
  emit(event: string, payload?: unknown): void;
  on(event: string, callback: (payload?: unknown) => void): void;
  off(event: string, callback: (payload?: unknown) => void): void;
}

interface IRankService {
  getCurrentTest(): RankTest | null;
  startTest(testId: string): boolean;
  checkProgress(): RankTest;
  completeTest(): RankUpReward;
  failTest(): void;
  selectArtifact(artifactId: string): void;
}

const GameEventType = {
  TEST_STARTED: 'TEST_STARTED',
  TEST_DECLINED: 'TEST_DECLINED',
  TASK_COMPLETED: 'TASK_COMPLETED',
  TEST_CLEARED: 'TEST_CLEARED',
  TEST_FAILED: 'TEST_FAILED',
  ARTIFACT_SELECTED: 'ARTIFACT_SELECTED',
  RANK_UP_COMPLETED: 'RANK_UP_COMPLETED',
} as const;

/**
 * RankUpScene - 昇格試験画面のUIコンポーネント
 */
export class RankUpScene extends BaseComponent {
  private eventBus: IEventBus | null = null;
  private rankService: IRankService | null = null;
  private currentTest: RankTest | null = null;
  private testState: TestState = 'NotStarted';
  private header: RankUpHeader | null = null;
  private requirements: RankUpRequirements | null = null;
  private testPanel: RankUpTestPanel | null = null;
  private rewards: RankUpRewards | null = null;
  private keyboardHandler: ((event: { key: string }) => void) | null = null;
  private taskCompletedHandler: ((payload?: unknown) => void) | null = null;

  constructor(scene: Phaser.Scene) {
    super(scene, UI_LAYOUT.COMPONENT_X, UI_LAYOUT.COMPONENT_Y);
    this.initializeServices();
    this.create();
  }

  private initializeServices(): void {
    this.eventBus = this.scene.data.get('eventBus');
    if (!this.eventBus) console.warn(ERROR_MESSAGES.EVENT_BUS_NOT_AVAILABLE);
    this.rankService = this.scene.data.get('rankService');
    if (!this.rankService) console.warn(ERROR_MESSAGES.RANK_SERVICE_NOT_AVAILABLE);
  }

  public create(): void {
    if (this.rankService) this.currentTest = this.rankService.getCurrentTest();
    if (!this.currentTest) {
      console.error(ERROR_MESSAGES.TEST_NOT_AVAILABLE);
      return;
    }
    this.testState = this.currentTest.state;
    this.initializeSubComponents();
    this.setupKeyboardListener();
    this.subscribeToEvents();
  }

  private initializeSubComponents(): void {
    if (!this.currentTest) return;

    this.header = new RankUpHeader(this.scene, UI_LAYOUT.HEADER_X, UI_LAYOUT.HEADER_Y);
    this.header.create();
    this.header.updateRank(this.currentTest.fromRank, this.currentTest.toRank);
    this.container.add(this.header.getContainer());

    this.testPanel = new RankUpTestPanel(this.scene, UI_LAYOUT.PANEL_X, UI_LAYOUT.PANEL_Y, {
      onStartTest: () => this.onStartTest(),
      onDeclineTest: () => this.onDeclineTest(),
      onToTitle: () => this.onToTitle(),
    });
    this.testPanel.create();
    this.container.add(this.testPanel.getContainer());

    this.updateUIForState();
  }

  private updateUIForState(): void {
    if (!this.currentTest) return;
    this.testPanel?.setState(this.testState);

    switch (this.testState) {
      case 'NotStarted':
      case 'InProgress':
        this.createRequirementsUI();
        break;
      case 'Completed':
        this.createCompletedUI();
        break;
      case 'Failed':
        break;
    }
  }

  private createRequirementsUI(): void {
    if (!this.currentTest) return;
    this.requirements = new RankUpRequirements(
      this.scene,
      UI_LAYOUT.REQUIREMENTS_X,
      UI_LAYOUT.REQUIREMENTS_Y,
    );
    this.requirements.create();
    this.requirements.setTasks(this.currentTest.tasks, this.currentTest.timeLimitDays);
    this.container.add(this.requirements.getContainer());
  }

  private createCompletedUI(): void {
    if (!this.currentTest || !this.rankService) return;
    const reward = this.rankService.completeTest();

    this.rewards = new RankUpRewards(this.scene, UI_LAYOUT.REWARDS_X, UI_LAYOUT.REWARDS_Y, {
      onSelectArtifact: (artifact) => this.onSelectArtifact(artifact),
    });
    this.rewards.create();
    this.rewards.setReward(reward);
    this.container.add(this.rewards.getContainer());

    this.emitEvent(GameEventType.TEST_CLEARED, {
      testId: this.currentTest.testId,
      toRank: this.currentTest.toRank,
    });
  }

  private onStartTest(): void {
    if (!this.currentTest || !this.rankService) return;
    const success = this.rankService.startTest(this.currentTest.testId);
    if (success) {
      this.testState = 'InProgress';
      this.emitEvent(GameEventType.TEST_STARTED, {
        testId: this.currentTest.testId,
        fromRank: this.currentTest.fromRank,
        toRank: this.currentTest.toRank,
      });
      this.setVisible(false);
    }
  }

  private onDeclineTest(): void {
    if (!this.currentTest) return;
    this.emitEvent(GameEventType.TEST_DECLINED, { testId: this.currentTest.testId });
    this.setVisible(false);
  }

  private onSelectArtifact(artifact: Artifact): void {
    if (!this.rankService || !this.currentTest) return;
    this.rankService.selectArtifact(artifact.id);
    this.emitEvent(GameEventType.ARTIFACT_SELECTED, { artifactId: artifact.id });
    this.emitEvent(GameEventType.RANK_UP_COMPLETED, {
      newRank: this.currentTest.toRank,
      artifact: artifact,
    });
    this.setVisible(false);
  }

  private onToTitle(): void {
    this.setVisible(false);
  }

  public updateProgress(): void {
    if (!this.rankService) return;
    this.currentTest = this.rankService.checkProgress();
    if (this.currentTest && this.currentTest.state !== this.testState) {
      this.testState = this.currentTest.state;
      this.destroySubComponents();
      if (this.container) this.container.removeAll(true);
      this.create();
    }
  }

  private setupKeyboardListener(): void {
    this.keyboardHandler = (event: { key: string }) => this.handleKeyboardInput(event);
    if (this.scene?.input?.keyboard) {
      this.scene.input.keyboard.on('keydown', this.keyboardHandler);
    }
  }

  private handleKeyboardInput(event: { key: string }): void {
    const { key } = event;
    switch (this.testState) {
      case 'NotStarted':
        if (key === KEYBOARD_KEYS.START_TEST) this.onStartTest();
        else if (key === KEYBOARD_KEYS.DECLINE) this.onDeclineTest();
        break;
      case 'Completed':
        if (key === KEYBOARD_KEYS.SELECT_1) this.rewards?.selectArtifactByIndex(0);
        else if (key === KEYBOARD_KEYS.SELECT_2) this.rewards?.selectArtifactByIndex(1);
        else if (key === KEYBOARD_KEYS.SELECT_3) this.rewards?.selectArtifactByIndex(2);
        break;
    }
  }

  private subscribeToEvents(): void {
    if (this.eventBus) {
      this.taskCompletedHandler = () => this.updateProgress();
      this.eventBus.on(GameEventType.TASK_COMPLETED, this.taskCompletedHandler);
    }
  }

  private unsubscribeFromEvents(): void {
    if (this.eventBus && this.taskCompletedHandler) {
      this.eventBus.off(GameEventType.TASK_COMPLETED, this.taskCompletedHandler);
      this.taskCompletedHandler = null;
    }
  }

  private emitEvent(eventType: string, payload: unknown): void {
    if (!this.eventBus) return;
    try {
      this.eventBus.emit(eventType, payload);
    } catch (error) {
      console.error(ERROR_MESSAGES.FAILED_TO_EMIT_EVENT, eventType, error);
    }
  }

  private destroySubComponents(): void {
    this.header?.destroy();
    this.header = null;
    this.requirements?.destroy();
    this.requirements = null;
    this.testPanel?.destroy();
    this.testPanel = null;
    this.rewards?.destroy();
    this.rewards = null;
  }

  private removeKeyboardListener(): void {
    if (this.keyboardHandler && this.scene?.input?.keyboard) {
      this.scene.input.keyboard.off('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  public destroy(): void {
    this.destroySubComponents();
    this.removeKeyboardListener();
    this.unsubscribeFromEvents();
    if (this.container) this.container.destroy();
  }
}
