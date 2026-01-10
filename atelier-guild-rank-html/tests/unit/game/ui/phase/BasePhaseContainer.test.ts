/**
 * BasePhaseContainer単体テスト
 *
 * TASK-0212: BasePhaseContainer設計のテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GamePhase } from '../../../../../src/domain/common/types';
import { BasePhaseContainer } from '../../../../../src/game/ui/phase/BasePhaseContainer';
import type { PhaseContainerConfig } from '../../../../../src/game/ui/phase/IPhaseContainer';
import { EventBus } from '../../../../../src/game/events/EventBus';

// Phaserをモック（vi.mockはホイスティングされるのでfactory内で定義）
vi.mock('phaser', () => {
  class MockRectangle {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }

    static Contains = () => true;
  }

  return {
    default: {
      Geom: {
        Rectangle: MockRectangle,
      },
    },
    Geom: {
      Rectangle: MockRectangle,
    },
  };
});

/**
 * テスト用の具象クラス
 * 注: TypeScriptのクラスプロパティ初期化はsuper()の後に行われるため、
 * コンストラクタ内でcreateContent()が呼ばれる時点では初期化されている
 */
class TestPhaseContainer extends BasePhaseContainer {
  readonly phase = GamePhase.GATHERING;

  // テスト用フラグ（コンストラクタ前に初期化されるようにdeclareを使わない）
  public createContentCalled: boolean;
  public onEnterCalled: boolean;
  public onExitCalled: boolean;
  public onUpdateCalled: boolean;
  public onEnabledChangeCalled: boolean;
  public lastEnabledState: boolean | null;
  public lastUpdateDelta: number | null;
  public completionResult: unknown;
  public canCompleteValue: boolean;

  constructor(config: PhaseContainerConfig) {
    // フラグをsuper()の前に初期化できないため、
    // super()の後で初期化し直す
    super(config);

    // super()内でcreateContentが呼ばれるので、ここで再設定
    // ただし、createContentが呼ばれたかどうかは後で確認する
    this.onEnterCalled = false;
    this.onExitCalled = false;
    this.onUpdateCalled = false;
    this.onEnabledChangeCalled = false;
    this.lastEnabledState = null;
    this.lastUpdateDelta = null;
    this.completionResult = { test: 'result' };
    this.canCompleteValue = true;
  }

  protected createContent(): void {
    // この時点ではプロパティが未定義の可能性があるので、
    // undefinedチェックを入れる
    (this as any)._createContentCalled = true;
  }

  // createContentが呼ばれたかを取得
  get wasCreateContentCalled(): boolean {
    return (this as any)._createContentCalled === true;
  }

  protected async onEnter(): Promise<void> {
    this.onEnterCalled = true;
  }

  protected async onExit(): Promise<void> {
    this.onExitCalled = true;
  }

  protected onUpdate(delta: number): void {
    this.onUpdateCalled = true;
    this.lastUpdateDelta = delta;
  }

  protected onEnabledChange(enabled: boolean): void {
    this.onEnabledChangeCalled = true;
    this.lastEnabledState = enabled;
  }

  protected getCompletionResult(): unknown {
    return this.completionResult;
  }

  canComplete(): boolean {
    return this.canCompleteValue;
  }

  // テスト用アクセサ
  getIsActive(): boolean {
    return this.isActive;
  }

  getEnabled(): boolean {
    return this.enabled;
  }

  // テスト用UIヘルパーラッパー
  testCreateTitle(title: string): any {
    return this.createTitle(title);
  }

  testCreateDescription(description: string, y: number): any {
    return this.createDescription(description, y);
  }

  testCreateButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    primary: boolean = false,
    enabled: boolean = true
  ): any {
    return this.createButton(x, y, label, onClick, primary, enabled);
  }

  testSetButtonEnabled(button: any, enabled: boolean): void {
    this.setButtonEnabled(button, enabled);
  }

  // テスト用状態管理ラッパー
  testGetState<T>(key: string): T | undefined {
    return this.getState<T>(key);
  }

  testSetState<T>(key: string, value: T): void {
    this.setState<T>(key, value);
  }

  testClearState(): void {
    this.clearState();
  }

  // 状態変更履歴（テスト用）
  public stateChangeHistory: Array<{ key: string; oldValue: unknown; newValue: unknown }> = [];

  protected override onStateChange(key: string, oldValue: unknown, newValue: unknown): void {
    this.stateChangeHistory.push({ key, oldValue, newValue });
  }

  // テスト用ローディングラッパー
  testShowLoading(message: string = '処理中...'): void {
    this.showLoading(message);
  }

  testHideLoading(): void {
    this.hideLoading();
  }

  testIsLoading(): boolean {
    return this.isLoading();
  }

  // テスト用エラー表示ラッパー
  testShowError(message: string, onDismiss?: () => void): void {
    this.showError(message, onDismiss);
  }
}

/**
 * モックPhaserシーン作成
 */
function createMockScene(): Phaser.Scene {
  const mockGraphics = {
    fillStyle: vi.fn().mockReturnThis(),
    fillRoundedRect: vi.fn().mockReturnThis(),
    fillRect: vi.fn().mockReturnThis(),
    lineStyle: vi.fn().mockReturnThis(),
    strokeRoundedRect: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
  };

  const createMockContainer = () => {
    const data: Record<string, unknown> = {};
    return {
      setDepth: vi.fn().mockReturnThis(),
      setVisible: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
      setY: vi.fn().mockReturnThis(),
      add: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
      setData: vi.fn().mockImplementation(function (this: any, key: string, value: unknown) {
        data[key] = value;
        return this;
      }),
      getData: vi.fn().mockImplementation((key: string) => {
        return data[key];
      }),
      setInteractive: vi.fn().mockReturnThis(),
      disableInteractive: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      x: 200,
      y: 150,
    };
  };

  const createMockText = () => ({
    setOrigin: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
  });

  const mockTween = {
    add: vi.fn().mockImplementation((config: any) => {
      // 即座にonCompleteを呼び出す
      if (config.onComplete) {
        config.onComplete();
      }
      return { remove: vi.fn() };
    }),
  };

  return {
    add: {
      container: vi.fn().mockImplementation(() => createMockContainer()),
      graphics: vi.fn().mockReturnValue(mockGraphics),
      text: vi.fn().mockImplementation(() => createMockText()),
    },
    tweens: mockTween,
  } as unknown as Phaser.Scene;
}

describe('BasePhaseContainer', () => {
  let mockScene: Phaser.Scene;
  let eventBus: EventBus;
  let container: TestPhaseContainer;

  beforeEach(() => {
    mockScene = createMockScene();
    EventBus.resetInstance();
    eventBus = EventBus.getInstance();

    const config: PhaseContainerConfig = {
      scene: mockScene,
      eventBus,
      x: 200,
      y: 150,
      width: 800,
      height: 500,
    };

    container = new TestPhaseContainer(config);
  });

  afterEach(() => {
    EventBus.resetInstance();
  });

  describe('コンストラクタ', () => {
    it('コンテナが正しく初期化される', () => {
      expect(container).toBeDefined();
      expect(container.phase).toBe(GamePhase.GATHERING);
      expect(container.container).toBeDefined();
    });

    it('createContentが呼ばれる', () => {
      // wasCreateContentCalledゲッターを使用
      expect(container.wasCreateContentCalled).toBe(true);
    });

    it('コンテナが初期状態で非表示', () => {
      expect(mockScene.add.container).toHaveBeenCalledWith(200, 150);
      expect(container.container.setVisible).toHaveBeenCalledWith(false);
    });

    it('深度が200に設定される', () => {
      expect(container.container.setDepth).toHaveBeenCalledWith(200);
    });
  });

  describe('ライフサイクル: enter', () => {
    it('enter()でonEnterが呼ばれる', async () => {
      await container.enter();
      expect(container.onEnterCalled).toBe(true);
    });

    it('enter()でコンテナが表示される', async () => {
      await container.enter();
      expect(container.container.setVisible).toHaveBeenCalledWith(true);
    });

    it('enter()でisActiveがtrueになる', async () => {
      expect(container.getIsActive()).toBe(false);
      await container.enter();
      expect(container.getIsActive()).toBe(true);
    });

    it('enter()でphase:actionイベントが発火する', async () => {
      const callback = vi.fn();
      eventBus.on('phase:action' as any, callback);

      await container.enter();

      expect(callback).toHaveBeenCalledWith({
        phase: GamePhase.GATHERING,
        action: 'enter',
        data: undefined,
      });
    });
  });

  describe('ライフサイクル: exit', () => {
    it('exit()でonExitが呼ばれる', async () => {
      await container.enter();
      await container.exit();
      expect(container.onExitCalled).toBe(true);
    });

    it('exit()でコンテナが非表示になる', async () => {
      await container.enter();
      await container.exit();
      expect(container.container.setVisible).toHaveBeenLastCalledWith(false);
    });

    it('exit()でisActiveがfalseになる', async () => {
      await container.enter();
      expect(container.getIsActive()).toBe(true);
      await container.exit();
      expect(container.getIsActive()).toBe(false);
    });
  });

  describe('ライフサイクル: update', () => {
    it('アクティブ時にupdate()でonUpdateが呼ばれる', async () => {
      await container.enter();
      container.update(16);
      expect(container.onUpdateCalled).toBe(true);
      expect(container.lastUpdateDelta).toBe(16);
    });

    it('非アクティブ時にupdate()でonUpdateが呼ばれない', () => {
      container.update(16);
      expect(container.onUpdateCalled).toBe(false);
    });

    it('無効時にupdate()でonUpdateが呼ばれない', async () => {
      await container.enter();
      container.setEnabled(false);
      container.onUpdateCalled = false;
      container.update(16);
      expect(container.onUpdateCalled).toBe(false);
    });
  });

  describe('表示制御', () => {
    it('setVisible()でコンテナの表示が切り替わる', () => {
      container.setVisible(true);
      expect(container.container.setVisible).toHaveBeenCalledWith(true);

      container.setVisible(false);
      expect(container.container.setVisible).toHaveBeenCalledWith(false);
    });

    it('setEnabled()でアルファが変わる', () => {
      container.setEnabled(false);
      expect(container.container.setAlpha).toHaveBeenCalledWith(0.5);

      container.setEnabled(true);
      expect(container.container.setAlpha).toHaveBeenCalledWith(1);
    });

    it('setEnabled()でonEnabledChangeが呼ばれる', () => {
      container.setEnabled(false);
      expect(container.onEnabledChangeCalled).toBe(true);
      expect(container.lastEnabledState).toBe(false);
    });
  });

  describe('アクション: complete', () => {
    it('canComplete()がtrueのときcomplete()でイベントが発火する', async () => {
      const callback = vi.fn();
      eventBus.on('phase:complete' as any, callback);

      container.canCompleteValue = true;
      container.complete();

      expect(callback).toHaveBeenCalledWith({
        phase: GamePhase.GATHERING,
        result: { test: 'result' },
      });
    });

    it('canComplete()がfalseのときcomplete()でイベントが発火しない', () => {
      const callback = vi.fn();
      eventBus.on('phase:complete' as any, callback);

      container.canCompleteValue = false;
      container.complete();

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('アクション: cancel', () => {
    it('cancel()でphase:cancelイベントが発火する', () => {
      const callback = vi.fn();
      eventBus.on('phase:cancel' as any, callback);

      container.cancel();

      expect(callback).toHaveBeenCalledWith({
        phase: GamePhase.GATHERING,
      });
    });
  });

  describe('破棄', () => {
    it('destroy()でコンテナが破棄される', () => {
      container.destroy();
      expect(container.container.destroy).toHaveBeenCalled();
    });
  });

  describe('デフォルト設定', () => {
    it('座標・サイズのデフォルト値が適用される', () => {
      const minimalConfig: PhaseContainerConfig = {
        scene: mockScene,
        eventBus,
      };

      const minimalContainer = new TestPhaseContainer(minimalConfig);
      expect(mockScene.add.container).toHaveBeenCalledWith(200, 150);
    });
  });

  describe('UIヘルパー: createTitle', () => {
    it('タイトルテキストを作成できる', () => {
      const titleResult = container.testCreateTitle('テストタイトル');
      expect(mockScene.add.text).toHaveBeenCalled();
      expect(titleResult).toBeDefined();
    });
  });

  describe('UIヘルパー: createDescription', () => {
    it('説明テキストを作成できる', () => {
      const descResult = container.testCreateDescription('テスト説明', 50);
      expect(mockScene.add.text).toHaveBeenCalled();
      expect(descResult).toBeDefined();
    });
  });

  describe('UIヘルパー: createButton', () => {
    it('ボタンを作成できる', () => {
      const onClick = vi.fn();
      const buttonResult = container.testCreateButton(100, 100, 'テストボタン', onClick, true, true);
      expect(mockScene.add.container).toHaveBeenCalled();
      expect(buttonResult).toBeDefined();
    });

    it('無効なボタンを作成できる', () => {
      const onClick = vi.fn();
      const buttonResult = container.testCreateButton(100, 100, 'テストボタン', onClick, false, false);
      expect(buttonResult).toBeDefined();
    });
  });

  describe('UIヘルパー: setButtonEnabled', () => {
    it('ボタンの有効/無効を切り替えられる', () => {
      const onClick = vi.fn();
      const buttonResult = container.testCreateButton(100, 100, 'テストボタン', onClick, true, true);

      container.testSetButtonEnabled(buttonResult, false);
      expect(buttonResult.getData('enabled')).toBe(false);

      container.testSetButtonEnabled(buttonResult, true);
      expect(buttonResult.getData('enabled')).toBe(true);
    });
  });

  describe('状態管理', () => {
    it('状態を設定・取得できる', () => {
      container.testSetState('testKey', 'testValue');
      expect(container.testGetState<string>('testKey')).toBe('testValue');
    });

    it('存在しないキーはundefinedを返す', () => {
      expect(container.testGetState<string>('nonExistent')).toBeUndefined();
    });

    it('状態をクリアできる', () => {
      container.testSetState('key1', 'value1');
      container.testSetState('key2', 'value2');
      container.testClearState();
      expect(container.testGetState<string>('key1')).toBeUndefined();
      expect(container.testGetState<string>('key2')).toBeUndefined();
    });

    it('状態変更コールバックが呼ばれる', () => {
      container.testSetState('testKey', 'newValue');
      expect(container.stateChangeHistory).toContainEqual({
        key: 'testKey',
        oldValue: undefined,
        newValue: 'newValue',
      });
    });
  });

  describe('ローディング表示', () => {
    it('ローディング表示を開始できる', () => {
      container.testShowLoading('読み込み中...');
      expect(container.testIsLoading()).toBe(true);
    });

    it('ローディング表示を終了できる', () => {
      container.testShowLoading('読み込み中...');
      container.testHideLoading();
      expect(container.testIsLoading()).toBe(false);
    });

    it('二重にローディング表示しない', () => {
      container.testShowLoading('読み込み中...');
      container.testShowLoading('二回目');
      // 二回目は無視される
      expect(container.testIsLoading()).toBe(true);
    });
  });

  describe('エラー表示', () => {
    it('エラー表示を行える', () => {
      const onDismiss = vi.fn();
      container.testShowError('テストエラー', onDismiss);
      // エラーコンテナが作成される
      expect(mockScene.add.container).toHaveBeenCalled();
    });
  });
});
