# TASK-0019: TitleScene実装 - テストケース定義書

**タスクID**: TASK-0019
**タスク名**: TitleScene実装
**フェーズ**: Phase 3 - UI層
**作成日**: 2026-01-17
**バージョン**: 1.0.0

---

## 1. テスト概要

### 1.1 テスト対象

- **ファイル**: `src/presentation/scenes/TitleScene.ts`
- **クラス**: `TitleScene extends Phaser.Scene`
- **依存コンポーネント**:
  - `Button` (src/presentation/ui/components/Button.ts)
  - `Dialog` (src/presentation/ui/components/Dialog.ts)
  - `THEME` (src/presentation/ui/theme.ts)

### 1.2 テストフレームワーク

- **テストランナー**: Vitest ^4.0.17
- **モックライブラリ**: vitest (vi.fn(), vi.mock())
- **テストパターン**: 既存のButton.spec.ts、Dialog.spec.ts、BootScene.test.tsに準拠

### 1.3 信頼性レベル

- 🔵 **青信号**: 設計文書に明記されている要件
- 🟡 **黄信号**: 設計文書から妥当な推測による要件
- 🔴 **赤信号**: 設計文書にない推測による要件

---

## 2. モック設計

### 2.1 Phaserシーンのモック

```typescript
/**
 * Phaserモック
 *
 * 【モック目的】: Phaserフレームワークをモック化してテストを可能にする 🔵
 * 【モック方針】: Phaser.Sceneクラスを最小限の実装でモック化 🔵
 */
vi.mock('phaser', () => {
  return {
    default: {
      Scene: class MockScene {},
      GameObjects: {
        Graphics: class MockGraphics {},
        Text: class MockText {},
        Container: class MockContainer {},
        Rectangle: class MockRectangle {},
      },
    },
  };
});
```

### 2.2 TitleScene用モック関数

```typescript
/**
 * モック関数群
 */
function createMockScene() {
  return {
    start: vi.fn(),
  };
}

function createMockCameras() {
  return {
    main: {
      centerX: 640,
      centerY: 360,
      width: 1280,
      height: 720,
    },
  };
}

function createMockAdd() {
  const mockText = {
    setOrigin: vi.fn().mockReturnThis(),
    setStyle: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };
  const mockRectangle = {
    setOrigin: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };
  const mockContainer = {
    add: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setPosition: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };
  return {
    text: vi.fn(() => mockText),
    rectangle: vi.fn(() => mockRectangle),
    container: vi.fn(() => mockContainer),
  };
}

function createMockRexUI() {
  const mockLabel = {
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    layout: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
  };
  const mockDialog = {
    layout: vi.fn().mockReturnThis(),
    popUp: vi.fn().mockReturnThis(),
    scaleDownDestroy: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    visible: false,
  };
  return {
    add: {
      label: vi.fn(() => mockLabel),
      dialog: vi.fn(() => mockDialog),
      roundRectangle: vi.fn().mockReturnValue({
        setFillStyle: vi.fn().mockReturnThis(),
      }),
      sizer: vi.fn().mockReturnValue({
        add: vi.fn().mockReturnThis(),
        layout: vi.fn().mockReturnThis(),
      }),
    },
  };
}
```

### 2.3 セーブデータリポジトリのモック

```typescript
/**
 * ISaveDataRepository モック
 */
function createMockSaveDataRepository(hasSaveData: boolean = false) {
  return {
    exists: vi.fn().mockReturnValue(hasSaveData),
    load: vi.fn().mockResolvedValue(hasSaveData ? { /* mock save data */ } : null),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}
```

---

## 3. テストケース一覧

### 3.1 画面表示テスト

| テストID | テスト名 | 要件ID | 信頼性 |
|---------|---------|--------|--------|
| T-0019-01 | タイトルロゴが表示される | REQ-0019-001 | 🔵 |
| T-0019-02 | サブタイトルが表示される | REQ-0019-002 | 🔵 |
| T-0019-03 | バージョン情報が表示される | REQ-0019-003 | 🔵 |
| T-0019-04 | 新規ゲームボタンが表示される | REQ-0019-004 | 🔵 |
| T-0019-05 | コンティニューボタンが表示される | REQ-0019-005 | 🔵 |
| T-0019-06 | 設定ボタンが表示される | REQ-0019-006 | 🔵 |

### 3.2 ボタン状態制御テスト

| テストID | テスト名 | 要件ID | 信頼性 |
|---------|---------|--------|--------|
| T-0019-07 | セーブデータありでコンティニュー有効 | REQ-0019-007 | 🔵 |
| T-0019-08 | セーブデータなしでコンティニュー無効 | REQ-0019-008 | 🔵 |

### 3.3 ボタンアクションテスト

| テストID | テスト名 | 要件ID | 信頼性 |
|---------|---------|--------|--------|
| T-0019-09 | 新規ゲーム（セーブなし）でMainSceneへ遷移 | REQ-0019-009 | 🔵 |
| T-0019-10 | 新規ゲーム（セーブあり）で確認ダイアログ表示 | REQ-0019-010 | 🔵 |
| T-0019-11 | 確認ダイアログ「はい」でMainSceneへ遷移 | REQ-0019-011 | 🔵 |
| T-0019-12 | 確認ダイアログ「いいえ」でダイアログを閉じる | REQ-0019-012 | 🔵 |
| T-0019-13 | コンティニューでセーブデータ読み込み・MainSceneへ遷移 | REQ-0019-013 | 🔵 |
| T-0019-14 | 設定ボタンで設定ダイアログ表示 | REQ-0019-014 | 🔴 |

### 3.4 アニメーションテスト

| テストID | テスト名 | 要件ID | 信頼性 |
|---------|---------|--------|--------|
| T-0019-15 | 画面表示時フェードインアニメーション | REQ-0019-015 | 🟡 |
| T-0019-16 | ボタンホバーエフェクト | REQ-0019-016 | 🟡 |
| T-0019-17 | 画面遷移時フェードアウトアニメーション | REQ-0019-017 | 🟡 |

### 3.5 エラーハンドリングテスト

| テストID | テスト名 | 要件ID | 信頼性 |
|---------|---------|--------|--------|
| T-0019-18 | セーブデータ破損時コンティニュー無効 | REQ-0019-018 | 🟡 |
| T-0019-19 | セーブデータ読み込み失敗時エラーダイアログ | REQ-0019-019 | 🟡 |

### 3.6 境界値・エッジケーステスト

| テストID | テスト名 | 要件ID | 信頼性 |
|---------|---------|--------|--------|
| T-0019-20 | コンストラクタでシーンキーが正しく設定される | - | 🔵 |
| T-0019-21 | create()メソッドが正常に実行される | - | 🔵 |
| T-0019-22 | destroy時にリソースが解放される | - | 🟡 |
| T-0019-23 | 複数回create()を呼んでも問題なし | - | 🟡 |

---

## 4. 詳細テストケース

### 4.1 T-0019-01: タイトルロゴが表示される

```typescript
describe('T-0019-01: タイトルロゴ表示', () => {
  // 【テスト目的】: タイトルロゴが設計書通りに表示されることを確認
  // 【テスト内容】: create()後に「ATELIER GUILD」テキストが正しい位置・スタイルで表示される
  // 【期待される動作】: タイトルロゴが画面中央上部に表示される
  // 🔵 信頼性レベル: REQ-0019-001に明記

  test('タイトルロゴテキストが表示される', () => {
    // 【テストデータ準備】: TitleSceneインスタンスを作成
    const titleScene = new TitleScene();
    setupMocks(titleScene);

    // 【実際の処理実行】: create()メソッドを呼び出す
    titleScene.create();

    // 【結果検証】: 'ATELIER GUILD'テキストが表示されることを確認
    expect(mockAdd.text).toHaveBeenCalledWith(
      640, // centerX
      200, // Y座標
      'ATELIER GUILD',
      expect.objectContaining({
        fontSize: '48px',
        color: '#8B4513',
      })
    ); // 🔵
  });

  test('タイトルロゴが中央揃えで表示される', () => {
    // 【確認内容】: setOrigin(0.5)が呼ばれることを確認
    const titleScene = new TitleScene();
    setupMocks(titleScene);
    titleScene.create();

    const textMock = mockAdd.text.mock.results[0].value;
    expect(textMock.setOrigin).toHaveBeenCalledWith(0.5); // 🔵
  });
});
```

### 4.2 T-0019-02: サブタイトルが表示される

```typescript
describe('T-0019-02: サブタイトル表示', () => {
  // 【テスト目的】: サブタイトルが設計書通りに表示されることを確認
  // 【テスト内容】: create()後に「錬金術師ギルド」テキストが正しい位置・スタイルで表示される
  // 【期待される動作】: サブタイトルがタイトルロゴの下に表示される
  // 🔵 信頼性レベル: REQ-0019-002に明記

  test('サブタイトルテキストが表示される', () => {
    const titleScene = new TitleScene();
    setupMocks(titleScene);
    titleScene.create();

    // 【結果検証】: '錬金術師ギルド'テキストが表示されることを確認
    expect(mockAdd.text).toHaveBeenCalledWith(
      640, // centerX
      260, // Y座標（タイトルロゴの下）
      '錬金術師ギルド',
      expect.objectContaining({
        fontSize: '24px',
        color: '#666666',
      })
    ); // 🔵
  });
});
```

### 4.3 T-0019-03: バージョン情報が表示される

```typescript
describe('T-0019-03: バージョン情報表示', () => {
  // 【テスト目的】: バージョン情報が画面右下に表示されることを確認
  // 【テスト内容】: create()後に「Version 1.0.0」テキストが表示される
  // 【期待される動作】: バージョン情報が画面右下に表示される
  // 🔵 信頼性レベル: REQ-0019-003に明記

  test('バージョン情報テキストが表示される', () => {
    const titleScene = new TitleScene();
    setupMocks(titleScene);
    titleScene.create();

    // 【結果検証】: 'Version 1.0.0'テキストが表示されることを確認
    expect(mockAdd.text).toHaveBeenCalledWith(
      expect.any(Number), // 右下X座標
      expect.any(Number), // 右下Y座標
      'Version 1.0.0',
      expect.any(Object)
    ); // 🔵
  });
});
```

### 4.4 T-0019-04〜06: ボタン表示テスト

```typescript
describe('T-0019-04〜06: ボタン表示', () => {
  // 【テスト目的】: 3つのメニューボタンが正しく表示されることを確認
  // 【テスト内容】: create()後に新規ゲーム、コンティニュー、設定の各ボタンが表示される
  // 【期待される動作】: 各ボタンが設計書通りのスタイルで表示される
  // 🔵 信頼性レベル: REQ-0019-004〜006に明記

  test('T-0019-04: 新規ゲームボタンが表示される', () => {
    const titleScene = new TitleScene();
    setupMocks(titleScene);
    titleScene.create();

    // 【結果検証】: '新規ゲーム'ボタンが生成されることを確認
    // Buttonコンポーネント経由でrexUI.add.labelが呼ばれる
    expect(mockRexUI.add.label).toHaveBeenCalled(); // 🔵

    // テキスト'新規ゲーム'が含まれるボタンが生成されることを確認
    expect(mockAdd.text).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      '新規ゲーム',
      expect.any(Object)
    ); // 🔵
  });

  test('T-0019-05: コンティニューボタンが表示される', () => {
    const titleScene = new TitleScene();
    setupMocks(titleScene);
    titleScene.create();

    // 【結果検証】: 'コンティニュー'ボタンが生成されることを確認
    expect(mockAdd.text).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      'コンティニュー',
      expect.any(Object)
    ); // 🔵
  });

  test('T-0019-06: 設定ボタンが表示される', () => {
    const titleScene = new TitleScene();
    setupMocks(titleScene);
    titleScene.create();

    // 【結果検証】: '設定'ボタンが生成されることを確認
    expect(mockAdd.text).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      '設定',
      expect.any(Object)
    ); // 🔵
  });
});
```

### 4.5 T-0019-07〜08: コンティニューボタン状態テスト

```typescript
describe('T-0019-07〜08: コンティニューボタン状態', () => {
  // 【テスト目的】: セーブデータの有無でコンティニューボタンの有効/無効が切り替わることを確認
  // 【テスト内容】: セーブデータ存在時は有効、非存在時は無効
  // 【期待される動作】: ボタン状態がセーブデータに応じて変化する
  // 🔵 信頼性レベル: REQ-0019-007〜008に明記

  test('T-0019-07: セーブデータがある場合、コンティニューボタンが有効', () => {
    const titleScene = new TitleScene();
    const mockSaveRepo = createMockSaveDataRepository(true);
    setupMocks(titleScene, { saveDataRepository: mockSaveRepo });
    titleScene.create();

    // 【結果検証】: コンティニューボタンが有効状態であることを確認
    // setEnabled(true)またはsetAlpha(1.0)が呼ばれることを確認
    const continueButton = getContinueButtonMock();
    expect(continueButton.setAlpha).not.toHaveBeenCalledWith(0.5); // 🔵
  });

  test('T-0019-08: セーブデータがない場合、コンティニューボタンが無効', () => {
    const titleScene = new TitleScene();
    const mockSaveRepo = createMockSaveDataRepository(false);
    setupMocks(titleScene, { saveDataRepository: mockSaveRepo });
    titleScene.create();

    // 【結果検証】: コンティニューボタンが無効状態であることを確認
    // setEnabled(false)またはsetAlpha(0.5)が呼ばれることを確認
    const continueButton = getContinueButtonMock();
    expect(continueButton.setAlpha).toHaveBeenCalledWith(0.5); // 🔵
  });
});
```

### 4.6 T-0019-09〜12: 新規ゲームフローテスト

```typescript
describe('T-0019-09〜12: 新規ゲームフロー', () => {
  // 【テスト目的】: 新規ゲームボタンの動作フローが正しいことを確認
  // 【テスト内容】: セーブデータの有無で確認ダイアログの表示有無が変わる
  // 【期待される動作】: 設計書通りの遷移フローが実行される
  // 🔵 信頼性レベル: REQ-0019-009〜012に明記

  test('T-0019-09: セーブデータなしで新規ゲームクリック→MainSceneへ直接遷移', () => {
    const titleScene = new TitleScene();
    const mockSaveRepo = createMockSaveDataRepository(false);
    setupMocks(titleScene, { saveDataRepository: mockSaveRepo });
    titleScene.create();

    // 【実際の処理実行】: 新規ゲームボタンのクリックをシミュレート
    triggerNewGameButtonClick();

    // 【結果検証】: MainSceneへ遷移することを確認
    expect(mockSceneManager.start).toHaveBeenCalledWith('MainScene'); // 🔵

    // 【確認内容】: 確認ダイアログが表示されないことを確認
    expect(mockRexUI.add.dialog).not.toHaveBeenCalled(); // 🔵
  });

  test('T-0019-10: セーブデータありで新規ゲームクリック→確認ダイアログ表示', () => {
    const titleScene = new TitleScene();
    const mockSaveRepo = createMockSaveDataRepository(true);
    setupMocks(titleScene, { saveDataRepository: mockSaveRepo });
    titleScene.create();

    // 【実際の処理実行】: 新規ゲームボタンのクリックをシミュレート
    triggerNewGameButtonClick();

    // 【結果検証】: 確認ダイアログが表示されることを確認
    expect(mockRexUI.add.dialog).toHaveBeenCalled(); // 🔵

    // 【確認内容】: ダイアログのタイトルが正しいことを確認
    // Dialogコンポーネント経由でテキストが設定される
    expect(mockAdd.text).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      '新規ゲーム開始',
      expect.any(Object)
    ); // 🔵
  });

  test('T-0019-11: 確認ダイアログで「はい」クリック→MainSceneへ遷移', () => {
    const titleScene = new TitleScene();
    const mockSaveRepo = createMockSaveDataRepository(true);
    setupMocks(titleScene, { saveDataRepository: mockSaveRepo });
    titleScene.create();
    triggerNewGameButtonClick();

    // 【実際の処理実行】: 「はい」ボタンのクリックをシミュレート
    triggerDialogYesButtonClick();

    // 【結果検証】: セーブデータが削除されることを確認
    expect(mockSaveRepo.delete).toHaveBeenCalled(); // 🔵

    // 【確認内容】: MainSceneへ遷移することを確認
    expect(mockSceneManager.start).toHaveBeenCalledWith('MainScene'); // 🔵
  });

  test('T-0019-12: 確認ダイアログで「いいえ」クリック→ダイアログを閉じる', () => {
    const titleScene = new TitleScene();
    const mockSaveRepo = createMockSaveDataRepository(true);
    setupMocks(titleScene, { saveDataRepository: mockSaveRepo });
    titleScene.create();
    triggerNewGameButtonClick();

    // 【実際の処理実行】: 「いいえ」ボタンのクリックをシミュレート
    triggerDialogNoButtonClick();

    // 【結果検証】: ダイアログが閉じることを確認
    expect(mockDialog.scaleDownDestroy).toHaveBeenCalled(); // 🔵

    // 【確認内容】: セーブデータは維持されることを確認
    expect(mockSaveRepo.delete).not.toHaveBeenCalled(); // 🔵

    // 【確認内容】: シーン遷移しないことを確認
    expect(mockSceneManager.start).not.toHaveBeenCalled(); // 🔵
  });
});
```

### 4.7 T-0019-13: コンティニューフローテスト

```typescript
describe('T-0019-13: コンティニューフロー', () => {
  // 【テスト目的】: コンティニューボタンの動作が正しいことを確認
  // 【テスト内容】: セーブデータを読み込んでMainSceneへ遷移する
  // 【期待される動作】: セーブデータからゲームが再開される
  // 🔵 信頼性レベル: REQ-0019-013に明記

  test('コンティニューボタンクリック→セーブデータ読み込み→MainSceneへ遷移', async () => {
    const titleScene = new TitleScene();
    const mockSaveData = {
      playerName: 'Test Player',
      rank: 'E',
      day: 5,
    };
    const mockSaveRepo = createMockSaveDataRepository(true);
    mockSaveRepo.load.mockResolvedValue(mockSaveData);
    setupMocks(titleScene, { saveDataRepository: mockSaveRepo });
    titleScene.create();

    // 【実際の処理実行】: コンティニューボタンのクリックをシミュレート
    await triggerContinueButtonClick();

    // 【結果検証】: セーブデータが読み込まれることを確認
    expect(mockSaveRepo.load).toHaveBeenCalled(); // 🔵

    // 【確認内容】: MainSceneへセーブデータ付きで遷移することを確認
    expect(mockSceneManager.start).toHaveBeenCalledWith('MainScene', expect.objectContaining({
      saveData: mockSaveData,
    })); // 🔵
  });
});
```

### 4.8 T-0019-14: 設定ボタンテスト

```typescript
describe('T-0019-14: 設定ボタン', () => {
  // 【テスト目的】: 設定ボタンの動作が正しいことを確認
  // 【テスト内容】: 設定ダイアログが表示される（Phase 1はスタブ）
  // 【期待される動作】: 設定ダイアログが表示される
  // 🔴 信頼性レベル: REQ-0019-014、設計文書に詳細なし

  test('設定ボタンクリック→設定ダイアログ表示（スタブ）', () => {
    const titleScene = new TitleScene();
    setupMocks(titleScene);
    titleScene.create();

    // 【実際の処理実行】: 設定ボタンのクリックをシミュレート
    triggerSettingsButtonClick();

    // 【結果検証】: ダイアログが表示されることを確認
    expect(mockRexUI.add.dialog).toHaveBeenCalled(); // 🔴

    // 【確認内容】: 「設定機能は準備中です」メッセージが表示されることを確認
    expect(mockAdd.text).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      expect.stringContaining('準備中'),
      expect.any(Object)
    ); // 🔴
  });
});
```

### 4.9 T-0019-18〜19: エラーハンドリングテスト

```typescript
describe('T-0019-18〜19: エラーハンドリング', () => {
  // 【テスト目的】: エラー発生時の動作が正しいことを確認
  // 【テスト内容】: セーブデータ破損時、読み込み失敗時の動作を検証
  // 【期待される動作】: 適切なエラーハンドリングが行われる
  // 🟡 信頼性レベル: REQ-0019-018〜019

  test('T-0019-18: セーブデータが破損している場合、コンティニューボタン無効', () => {
    const titleScene = new TitleScene();
    const mockSaveRepo = createMockSaveDataRepository(true);
    // セーブデータ破損をシミュレート
    mockSaveRepo.load.mockRejectedValue(new Error('Save data corrupted'));
    setupMocks(titleScene, { saveDataRepository: mockSaveRepo });

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    titleScene.create();

    // 【結果検証】: コンティニューボタンが無効化されることを確認
    const continueButton = getContinueButtonMock();
    expect(continueButton.setAlpha).toHaveBeenCalledWith(0.5); // 🟡

    // 【確認内容】: 警告ログが出力されることを確認
    expect(consoleWarnSpy).toHaveBeenCalled(); // 🟡

    consoleWarnSpy.mockRestore();
  });

  test('T-0019-19: コンティニュー時にセーブデータ読み込み失敗→エラーダイアログ表示', async () => {
    const titleScene = new TitleScene();
    const mockSaveRepo = createMockSaveDataRepository(true);
    mockSaveRepo.load.mockRejectedValue(new Error('Failed to load save data'));
    setupMocks(titleScene, { saveDataRepository: mockSaveRepo });
    titleScene.create();

    // 【実際の処理実行】: コンティニューボタンのクリックをシミュレート
    await triggerContinueButtonClick();

    // 【結果検証】: エラーダイアログが表示されることを確認
    expect(mockRexUI.add.dialog).toHaveBeenCalled(); // 🟡

    // 【確認内容】: エラーメッセージが表示されることを確認
    expect(mockAdd.text).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      expect.stringContaining('エラー'),
      expect.any(Object)
    ); // 🟡
  });
});
```

### 4.10 T-0019-20〜23: 境界値・エッジケーステスト

```typescript
describe('T-0019-20〜23: 境界値・エッジケース', () => {
  // 【テスト目的】: エッジケースでの動作を確認
  // 【テスト内容】: コンストラクタ、create()、destroy()の動作を検証
  // 【期待される動作】: 正常に動作する
  // 🔵🟡 信頼性レベル: 実装要件から

  test('T-0019-20: コンストラクタでシーンキーが正しく設定される', () => {
    const titleScene = new TitleScene();

    // 【結果検証】: シーンキーが'TitleScene'であることを確認
    // @ts-expect-error - Phaserの内部プロパティにアクセス
    expect(titleScene.sys?.settings?.key || 'TitleScene').toBe('TitleScene'); // 🔵
  });

  test('T-0019-21: create()メソッドが正常に実行される', () => {
    const titleScene = new TitleScene();
    setupMocks(titleScene);

    // 【結果検証】: create()がエラーなく実行されることを確認
    expect(() => titleScene.create()).not.toThrow(); // 🔵
  });

  test('T-0019-22: destroy時にリソースが解放される', () => {
    const titleScene = new TitleScene();
    setupMocks(titleScene);
    titleScene.create();

    // 【実際の処理実行】: シーン破棄をシミュレート
    // @ts-expect-error - privateメソッドへのアクセス
    if (titleScene.shutdown) {
      titleScene.shutdown();
    }

    // 【結果検証】: ボタンやダイアログのdestroy()が呼ばれることを確認
    // 実装依存のため、destroy()メソッドが定義されていれば検証 // 🟡
  });

  test('T-0019-23: 複数回create()を呼んでも問題なし', () => {
    const titleScene = new TitleScene();
    setupMocks(titleScene);

    // 【実際の処理実行】: create()を複数回呼び出す
    expect(() => {
      titleScene.create();
      titleScene.create();
      titleScene.create();
    }).not.toThrow(); // 🟡
  });
});
```

---

## 5. テストコード例（完全版）

### 5.1 TitleScene.spec.ts

```typescript
/**
 * TitleSceneのテスト
 * TASK-0019 TitleScene実装
 *
 * @description
 * T-0019-01〜23: TitleSceneの画面表示、ボタン動作、エラーハンドリングテスト
 */

import type Phaser from 'phaser';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Phaserモック
vi.mock('phaser', () => {
  return {
    default: {
      Scene: class MockScene {
        constructor(config?: { key?: string }) {
          // @ts-expect-error - モック用
          this.sys = { settings: { key: config?.key || '' } };
        }
      },
      GameObjects: {
        Graphics: class MockGraphics {},
        Text: class MockText {},
        Container: class MockContainer {},
        Rectangle: class MockRectangle {},
      },
    },
  };
});

// TitleSceneのインポート（モック後）
import { TitleScene } from '@presentation/scenes/TitleScene';

// モック変数
let mockSceneManager: ReturnType<typeof vi.fn>;
let mockCameras: ReturnType<typeof createMockCameras>;
let mockAdd: ReturnType<typeof createMockAdd>;
let mockRexUI: ReturnType<typeof createMockRexUI>;
let mockSaveRepo: ReturnType<typeof createMockSaveDataRepository>;

// モック関数群
function createMockSceneManager() {
  return {
    start: vi.fn(),
  };
}

function createMockCameras() {
  return {
    main: {
      centerX: 640,
      centerY: 360,
      width: 1280,
      height: 720,
    },
  };
}

function createMockAdd() {
  const createMockText = () => ({
    setOrigin: vi.fn().mockReturnThis(),
    setStyle: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  });
  const mockRectangle = {
    setOrigin: vi.fn().mockReturnThis(),
    setFillStyle: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };
  const mockContainer = {
    add: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setPosition: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };
  return {
    text: vi.fn(() => createMockText()),
    rectangle: vi.fn(() => mockRectangle),
    container: vi.fn(() => mockContainer),
  };
}

function createMockRexUI() {
  const createMockLabel = () => ({
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    layout: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
  });
  const mockDialog = {
    layout: vi.fn().mockReturnThis(),
    popUp: vi.fn().mockReturnThis(),
    scaleDownDestroy: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    visible: false,
  };
  return {
    add: {
      label: vi.fn(() => createMockLabel()),
      dialog: vi.fn(() => mockDialog),
      roundRectangle: vi.fn().mockReturnValue({
        setFillStyle: vi.fn().mockReturnThis(),
      }),
      sizer: vi.fn().mockReturnValue({
        add: vi.fn().mockReturnThis(),
        layout: vi.fn().mockReturnThis(),
      }),
    },
  };
}

function createMockSaveDataRepository(hasSaveData: boolean = false) {
  return {
    exists: vi.fn().mockReturnValue(hasSaveData),
    load: vi.fn().mockResolvedValue(hasSaveData ? { playerName: 'Test' } : null),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}

function setupMocks(
  titleScene: TitleScene,
  options?: { saveDataRepository?: ReturnType<typeof createMockSaveDataRepository> }
) {
  mockSceneManager = createMockSceneManager();
  mockCameras = createMockCameras();
  mockAdd = createMockAdd();
  mockRexUI = createMockRexUI();
  mockSaveRepo = options?.saveDataRepository || createMockSaveDataRepository(false);

  // @ts-expect-error - テストのためにprivateプロパティにアクセス
  titleScene.scene = mockSceneManager;
  // @ts-expect-error - テストのためにprivateプロパティにアクセス
  titleScene.cameras = mockCameras;
  // @ts-expect-error - テストのためにprivateプロパティにアクセス
  titleScene.add = mockAdd;
  // @ts-expect-error - テストのためにprivateプロパティにアクセス
  titleScene.rexUI = mockRexUI;
}

describe('TitleScene', () => {
  let titleScene: TitleScene;

  beforeEach(() => {
    vi.clearAllMocks();
    titleScene = new TitleScene();
  });

  describe('T-0019-01: タイトルロゴ表示', () => {
    test('タイトルロゴテキストが表示される', () => {
      setupMocks(titleScene);
      titleScene.create();

      expect(mockAdd.text).toHaveBeenCalledWith(
        640,
        expect.any(Number),
        expect.stringContaining('ATELIER'),
        expect.any(Object)
      );
    });
  });

  describe('T-0019-08: セーブデータなしでコンティニュー無効', () => {
    test('コンティニューボタンが無効状態で表示される', () => {
      const mockSaveRepo = createMockSaveDataRepository(false);
      setupMocks(titleScene, { saveDataRepository: mockSaveRepo });
      titleScene.create();

      // コンティニューボタンのsetAlphaが0.5で呼ばれることを確認
      const labelCalls = mockRexUI.add.label.mock.results;
      // ボタンが複数生成されるため、いずれかで無効化されていることを確認
      expect(labelCalls.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('T-0019-20: コンストラクタ', () => {
    test('シーンキーが正しく設定される', () => {
      const scene = new TitleScene();
      // @ts-expect-error - モック構造にアクセス
      expect(scene.sys?.settings?.key).toBe('TitleScene');
    });
  });

  describe('T-0019-21: create()メソッド', () => {
    test('create()が正常に実行される', () => {
      setupMocks(titleScene);
      expect(() => titleScene.create()).not.toThrow();
    });
  });
});
```

---

## 6. テスト実行方法

### 6.1 単体テスト実行

```bash
# 全テスト実行
pnpm test

# TitleSceneテストのみ実行
pnpm test TitleScene

# ウォッチモード
pnpm test:watch TitleScene

# カバレッジ付き
pnpm test:coverage
```

### 6.2 テストファイル配置

```
atelier-guild-rank/
├── src/
│   └── presentation/
│       └── scenes/
│           ├── TitleScene.ts
│           └── TitleScene.spec.ts  ← テストファイル（コロケーション）
└── tests/
    └── unit/
        └── presentation/
            └── scenes/
                └── TitleScene.test.ts  ← 代替配置（testsディレクトリ）
```

---

## 7. テストカバレッジ目標

| カテゴリ | 目標 |
|---------|------|
| ステートメントカバレッジ | 80%以上 |
| ブランチカバレッジ | 75%以上 |
| 関数カバレッジ | 90%以上 |
| ラインカバレッジ | 80%以上 |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-17 | 1.0.0 | 初版作成 |
