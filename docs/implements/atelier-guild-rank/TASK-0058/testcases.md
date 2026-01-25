# TASK-0058 TitleSceneリファクタリング テストケース定義書

## 1. 概要

### 1.1 ドキュメント情報

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0058 |
| タスク名 | TitleSceneリファクタリング |
| 対象ファイル | `src/presentation/scenes/TitleScene.ts` (819行) |
| 目標 | 責務ごとにコンポーネント分割し、カバレッジ80%以上を達成 |
| 作成日 | 2026-01-24 |

### 1.2 テスト対象コンポーネント

| コンポーネント | ファイル | 責務 |
|---------------|----------|------|
| types.ts | `src/presentation/ui/scenes/components/title/types.ts` | 型定義・定数 |
| TitleLogo | `src/presentation/ui/scenes/components/title/TitleLogo.ts` | ロゴ・サブタイトル・バージョン表示 |
| TitleMenu | `src/presentation/ui/scenes/components/title/TitleMenu.ts` | メニューボタン（新規/続き/設定） |
| TitleDialog | `src/presentation/ui/scenes/components/title/TitleDialog.ts` | 確認/設定/エラーダイアログ |
| TitleScene | `src/presentation/scenes/TitleScene.ts` | シーン統合・管理 |

### 1.3 テストファイル構成

```
tests/unit/presentation/ui/scenes/components/title/
├── types.test.ts                     # 型定義・定数テスト
├── TitleLogo.test.ts                 # ロゴコンポーネントテスト
├── TitleMenu.test.ts                 # メニューコンポーネントテスト
├── TitleDialog.test.ts               # ダイアログコンポーネントテスト
└── TitleScene.integration.test.ts    # 統合テスト
```

---

## 2. 共通テストヘルパー

### 2.1 モック定義

既存のShopSceneテストパターンに基づいて、以下のモックを使用する。

```typescript
// モックコンテナを作成
const createMockContainer = () => ({
  setVisible: vi.fn().mockReturnThis(),
  setPosition: vi.fn().mockReturnThis(),
  add: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  removeAll: vi.fn(),
  x: 0,
  y: 0,
});

// モックテキストを作成
const createMockText = () => ({
  setText: vi.fn().mockReturnThis(),
  setOrigin: vi.fn().mockReturnThis(),
  setStyle: vi.fn().mockReturnThis(),
  setColor: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  text: '',
});

// モックグラフィックスを作成
const createMockGraphics = () => ({
  fillStyle: vi.fn().mockReturnThis(),
  fillRoundedRect: vi.fn().mockReturnThis(),
  lineStyle: vi.fn().mockReturnThis(),
  strokeRoundedRect: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
});

// モックRectangleを作成
const createMockRectangle = () => ({
  setInteractive: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  off: vi.fn().mockReturnThis(),
  setAlpha: vi.fn().mockReturnThis(),
  setDepth: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
});

// モックrexUIラベルを作成
const createMockLabel = () => ({
  setInteractive: vi.fn().mockReturnThis(),
  disableInteractive: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  layout: vi.fn().mockReturnThis(),
  setAlpha: vi.fn().mockReturnThis(),
});

// モックrexUIダイアログを作成
const createMockDialog = () => ({
  layout: vi.fn().mockReturnThis(),
  setDepth: vi.fn().mockReturnThis(),
  popUp: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
});

// モックrexUIを作成
const createMockRexUI = () => ({
  add: {
    label: vi.fn().mockReturnValue(createMockLabel()),
    roundRectangle: vi.fn().mockReturnValue({
      setFillStyle: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    }),
    dialog: vi.fn().mockReturnValue(createMockDialog()),
  },
});

// モックシーンを作成
const createMockScene = () => {
  const mockContainer = createMockContainer();
  const mockText = createMockText();
  const mockGraphics = createMockGraphics();
  const mockRectangle = createMockRectangle();
  const mockRexUI = createMockRexUI();

  return {
    scene: {
      add: {
        container: vi.fn().mockReturnValue(mockContainer),
        text: vi.fn().mockReturnValue(mockText),
        graphics: vi.fn().mockReturnValue(mockGraphics),
        rectangle: vi.fn().mockReturnValue(mockRectangle),
      },
      cameras: {
        main: {
          centerX: 640,
          centerY: 360,
          width: 1280,
          height: 720,
          fadeIn: vi.fn(),
          fadeOut: vi.fn(),
          once: vi.fn(),
        },
      },
      rexUI: mockRexUI,
      tweens: { add: vi.fn(), killTweensOf: vi.fn() },
      scene: { start: vi.fn() },
      scale: { width: 1280, height: 720 },
    } as unknown as Phaser.Scene,
    mockContainer,
    mockText,
    mockGraphics,
    mockRectangle,
    mockRexUI,
  };
};

// モックセーブデータリポジトリを作成
const createMockSaveDataRepository = (hasSaveData: boolean = false, isCorrupted: boolean = false) => ({
  exists: vi.fn().mockReturnValue(hasSaveData),
  load: vi.fn().mockImplementation(async () => {
    if (isCorrupted) {
      throw new Error('Save data corrupted');
    }
    return hasSaveData ? { playerName: 'Test', rank: 'G', day: 1 } : null;
  }),
  save: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
});
```

---

## 3. types.ts テストケース

### 3.1 テストスイート概要

| テストケースID | テスト目的 | 信頼性レベル |
|---------------|----------|-------------|
| TC-TY-001 | TITLE_LAYOUT定数の正確性 | 🔵 設計文書準拠 |
| TC-TY-002 | TITLE_STYLES定数の正確性 | 🔵 設計文書準拠 |
| TC-TY-003 | TITLE_SIZES定数の正確性 | 🔵 設計文書準拠 |
| TC-TY-004 | TITLE_TEXT定数の正確性 | 🔵 設計文書準拠 |
| TC-TY-005 | TitleMenuCallbacks型の型安全性 | 🟡 妥当な推測 |
| TC-TY-006 | DialogConfig型の型安全性 | 🟡 妥当な推測 |
| TC-TY-007 | ISaveDataRepository型の正確性 | 🔵 設計文書準拠 |

### 3.2 詳細テストケース

#### TC-TY-001: TITLE_LAYOUT定数の正確性

```typescript
describe('TC-TY-001: TITLE_LAYOUT定数', () => {
  // 【テスト目的】: レイアウト定数が設計文書に基づく正確な値を持つ
  // 【対応要件】: 要件定義4.1（TITLE_LAYOUT）
  // 🔵 信頼性レベル: 設計文書準拠

  it('TC-TY-001a: TITLE_Yが200である', async () => {
    const { TITLE_LAYOUT } = await import('@presentation/ui/scenes/components/title/types');
    expect(TITLE_LAYOUT.TITLE_Y).toBe(200);
  });

  it('TC-TY-001b: SUBTITLE_Yが260である', async () => {
    const { TITLE_LAYOUT } = await import('@presentation/ui/scenes/components/title/types');
    expect(TITLE_LAYOUT.SUBTITLE_Y).toBe(260);
  });

  it('TC-TY-001c: BUTTON_START_Yが400である', async () => {
    const { TITLE_LAYOUT } = await import('@presentation/ui/scenes/components/title/types');
    expect(TITLE_LAYOUT.BUTTON_START_Y).toBe(400);
  });

  it('TC-TY-001d: BUTTON_SPACINGが60である', async () => {
    const { TITLE_LAYOUT } = await import('@presentation/ui/scenes/components/title/types');
    expect(TITLE_LAYOUT.BUTTON_SPACING).toBe(60);
  });

  it('TC-TY-001e: VERSION_OFFSETが20である', async () => {
    const { TITLE_LAYOUT } = await import('@presentation/ui/scenes/components/title/types');
    expect(TITLE_LAYOUT.VERSION_OFFSET).toBe(20);
  });
});
```

#### TC-TY-002: TITLE_STYLES定数の正確性

```typescript
describe('TC-TY-002: TITLE_STYLES定数', () => {
  // 【テスト目的】: スタイル定数が設計文書に基づく正確な値を持つ
  // 【対応要件】: 要件定義4.1（TITLE_STYLES）
  // 🔵 信頼性レベル: 設計文書準拠

  it('TC-TY-002a: TITLE_FONT_SIZEが"48px"である', async () => {
    const { TITLE_STYLES } = await import('@presentation/ui/scenes/components/title/types');
    expect(TITLE_STYLES.TITLE_FONT_SIZE).toBe('48px');
  });

  it('TC-TY-002b: TITLE_COLORが"#8B4513"である', async () => {
    const { TITLE_STYLES } = await import('@presentation/ui/scenes/components/title/types');
    expect(TITLE_STYLES.TITLE_COLOR).toBe('#8B4513');
  });

  it('TC-TY-002c: SUBTITLE_FONT_SIZEが"24px"である', async () => {
    const { TITLE_STYLES } = await import('@presentation/ui/scenes/components/title/types');
    expect(TITLE_STYLES.SUBTITLE_FONT_SIZE).toBe('24px');
  });
});
```

#### TC-TY-003: TITLE_SIZES定数の正確性

```typescript
describe('TC-TY-003: TITLE_SIZES定数', () => {
  // 【テスト目的】: サイズ定数が設計文書に基づく正確な値を持つ
  // 【対応要件】: 要件定義4.1（TITLE_SIZES）
  // 🔵 信頼性レベル: 設計文書準拠

  it('TC-TY-003a: BUTTON_WIDTHが200である', async () => {
    const { TITLE_SIZES } = await import('@presentation/ui/scenes/components/title/types');
    expect(TITLE_SIZES.BUTTON_WIDTH).toBe(200);
  });

  it('TC-TY-003b: BUTTON_HEIGHTが50である', async () => {
    const { TITLE_SIZES } = await import('@presentation/ui/scenes/components/title/types');
    expect(TITLE_SIZES.BUTTON_HEIGHT).toBe(50);
  });

  it('TC-TY-003c: CONFIRM_DIALOG_WIDTHが400である', async () => {
    const { TITLE_SIZES } = await import('@presentation/ui/scenes/components/title/types');
    expect(TITLE_SIZES.CONFIRM_DIALOG_WIDTH).toBe(400);
  });
});
```

#### TC-TY-004: TITLE_TEXT定数の正確性

```typescript
describe('TC-TY-004: TITLE_TEXT定数', () => {
  // 【テスト目的】: テキスト定数が設計文書に基づく正確な値を持つ
  // 【対応要件】: 要件定義4.1（TITLE_TEXT）
  // 🔵 信頼性レベル: 設計文書準拠

  it('TC-TY-004a: TITLEが"ATELIER GUILD"である', async () => {
    const { TITLE_TEXT } = await import('@presentation/ui/scenes/components/title/types');
    expect(TITLE_TEXT.TITLE).toBe('ATELIER GUILD');
  });

  it('TC-TY-004b: SUBTITLEが"錬金術師ギルド"である', async () => {
    const { TITLE_TEXT } = await import('@presentation/ui/scenes/components/title/types');
    expect(TITLE_TEXT.SUBTITLE).toBe('錬金術師ギルド');
  });

  it('TC-TY-004c: NEW_GAMEが"新規ゲーム"である', async () => {
    const { TITLE_TEXT } = await import('@presentation/ui/scenes/components/title/types');
    expect(TITLE_TEXT.NEW_GAME).toBe('新規ゲーム');
  });

  it('TC-TY-004d: CONTINUEが"コンティニュー"である', async () => {
    const { TITLE_TEXT } = await import('@presentation/ui/scenes/components/title/types');
    expect(TITLE_TEXT.CONTINUE).toBe('コンティニュー');
  });

  it('TC-TY-004e: SETTINGSが"設定"である', async () => {
    const { TITLE_TEXT } = await import('@presentation/ui/scenes/components/title/types');
    expect(TITLE_TEXT.SETTINGS).toBe('設定');
  });
});
```

#### TC-TY-005: TitleMenuCallbacks型の型安全性

```typescript
describe('TC-TY-005: TitleMenuCallbacks型', () => {
  // 【テスト目的】: コールバック型の型安全性を確認
  // 【対応要件】: 要件定義4.1（TitleMenuCallbacks）
  // 🟡 信頼性レベル: 妥当な推測

  it('TC-TY-005a: TitleMenuCallbacksが必須プロパティを持つ', async () => {
    const { TitleMenuCallbacks } = await import('@presentation/ui/scenes/components/title/types');

    const callbacks: typeof TitleMenuCallbacks = {
      onNewGame: () => {},
      onContinue: () => {},
      onSettings: () => {},
    };

    expect(callbacks).toBeDefined();
    expect(typeof callbacks.onNewGame).toBe('function');
    expect(typeof callbacks.onContinue).toBe('function');
    expect(typeof callbacks.onSettings).toBe('function');
  });
});
```

#### TC-TY-006: DialogConfig型の型安全性

```typescript
describe('TC-TY-006: DialogConfig型', () => {
  // 【テスト目的】: ダイアログ設定型の型安全性を確認
  // 【対応要件】: 要件定義4.1（DialogConfig）
  // 🟡 信頼性レベル: 妥当な推測

  it('TC-TY-006a: DialogConfigが必須プロパティを持つ', async () => {
    const { DialogConfig, DialogAction } = await import('@presentation/ui/scenes/components/title/types');

    const config: typeof DialogConfig = {
      title: 'テストタイトル',
      content: 'テスト内容',
      width: 400,
      height: 200,
      actions: [
        { text: 'OK', color: 0x8b4513, onClick: () => {} },
      ],
    };

    expect(config).toBeDefined();
    expect(config.title).toBe('テストタイトル');
    expect(config.actions.length).toBe(1);
  });

  it('TC-TY-006b: DialogConfigがオプショナルなbackgroundColorを持てる', async () => {
    const { DialogConfig } = await import('@presentation/ui/scenes/components/title/types');

    const config: typeof DialogConfig = {
      title: 'エラー',
      content: 'エラーメッセージ',
      width: 400,
      height: 150,
      actions: [{ text: 'OK', color: 0x8b4513, onClick: () => {} }],
      backgroundColor: 0x8b0000,
    };

    expect(config.backgroundColor).toBe(0x8b0000);
  });
});
```

#### TC-TY-007: ISaveDataRepository型の正確性

```typescript
describe('TC-TY-007: ISaveDataRepository型', () => {
  // 【テスト目的】: セーブデータリポジトリ型の正確性を確認
  // 【対応要件】: 要件定義4.1（ISaveDataRepository）
  // 🔵 信頼性レベル: 設計文書準拠

  it('TC-TY-007a: ISaveDataRepositoryが必須メソッドを持つ', async () => {
    const { ISaveDataRepository, SaveData } = await import('@presentation/ui/scenes/components/title/types');

    const repo: typeof ISaveDataRepository = {
      exists: () => false,
      load: async () => null,
      save: async (_data: typeof SaveData) => {},
      delete: async () => {},
    };

    expect(repo).toBeDefined();
    expect(typeof repo.exists).toBe('function');
    expect(typeof repo.load).toBe('function');
    expect(typeof repo.save).toBe('function');
    expect(typeof repo.delete).toBe('function');
  });
});
```

---

## 4. TitleLogo.ts テストケース

### 4.1 テストスイート概要

| テストケースID | テスト目的 | 信頼性レベル |
|---------------|----------|-------------|
| TC-TL-001 | コンポーネント初期化 | 🔵 RankUpHeader.test.ts準拠 |
| TC-TL-002 | タイトルロゴ表示 | 🔵 設計文書準拠 |
| TC-TL-003 | サブタイトル表示 | 🔵 設計文書準拠 |
| TC-TL-004 | バージョン情報表示 | 🔵 設計文書準拠 |
| TC-TL-E01 | nullシーンでエラー | 🔵 BaseComponent準拠 |
| TC-TL-E02 | 無効な座標でエラー | 🔵 BaseComponent準拠 |
| TC-TL-D01 | destroy()でリソース解放 | 🔵 NFR-058-010 |

### 4.2 詳細テストケース

#### TC-TL-001: コンポーネント初期化

```typescript
describe('TC-TL-001: 初期化テスト', () => {
  // 【テスト目的】: コンポーネント初期化が正常に動作することを確認
  // 【対応要件】: REQ-058-001
  // 🔵 信頼性レベル: RankUpHeader.test.tsパターン準拠

  it('TC-TL-001a: シーンインスタンスでTitleLogoを初期化するとコンテナが作成される', async () => {
    // Given: シーンインスタンス
    const { scene: mockScene } = createMockScene();

    // When: TitleLogoを初期化
    const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');
    const logo = new TitleLogo(mockScene, 640, 0);

    // Then: コンテナが作成される
    expect(logo).toBeDefined();
    expect(logo.getContainer()).toBeDefined();
  });

  it('TC-TL-001b: create()を呼び出すとUI要素が生成される', async () => {
    // Given: TitleLogoインスタンス
    const { scene: mockScene } = createMockScene();
    const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');
    const logo = new TitleLogo(mockScene, 640, 0);

    // When: create()を呼び出す
    logo.create();

    // Then: add.textが呼び出される
    expect(mockScene.add.text).toHaveBeenCalled();
  });
});
```

#### TC-TL-002: タイトルロゴ表示

```typescript
describe('TC-TL-002: タイトルロゴ表示', () => {
  // 【テスト目的】: タイトルロゴが正しいテキストと位置で表示される
  // 【対応要件】: REQ-058-002
  // 🔵 信頼性レベル: 設計文書準拠

  it('TC-TL-002a: create()でタイトル"ATELIER GUILD"が表示される', async () => {
    // Given: TitleLogoインスタンス
    const { scene: mockScene } = createMockScene();
    const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');
    const logo = new TitleLogo(mockScene, 640, 0);

    // When: create()を呼び出す
    logo.create();

    // Then: "ATELIER GUILD"テキストが作成される
    const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
    const hasTitleText = textCalls.some(
      (call: unknown[]) => call[2] === 'ATELIER GUILD'
    );
    expect(hasTitleText).toBe(true);
  });

  it('TC-TL-002b: タイトルがY座標200に表示される', async () => {
    // Given: TitleLogoインスタンス
    const { scene: mockScene } = createMockScene();
    const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');
    const logo = new TitleLogo(mockScene, 640, 0);

    // When: create()を呼び出す
    logo.create();

    // Then: Y座標200にテキストが作成される
    const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
    const titleCall = textCalls.find(
      (call: unknown[]) => call[2] === 'ATELIER GUILD'
    );
    expect(titleCall).toBeDefined();
    expect(titleCall?.[1]).toBe(200); // Y座標
  });
});
```

#### TC-TL-003: サブタイトル表示

```typescript
describe('TC-TL-003: サブタイトル表示', () => {
  // 【テスト目的】: サブタイトルが正しいテキストと位置で表示される
  // 【対応要件】: REQ-058-002
  // 🔵 信頼性レベル: 設計文書準拠

  it('TC-TL-003a: create()でサブタイトル"錬金術師ギルド"が表示される', async () => {
    // Given: TitleLogoインスタンス
    const { scene: mockScene } = createMockScene();
    const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');
    const logo = new TitleLogo(mockScene, 640, 0);

    // When: create()を呼び出す
    logo.create();

    // Then: "錬金術師ギルド"テキストが作成される
    const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
    const hasSubtitleText = textCalls.some(
      (call: unknown[]) => call[2] === '錬金術師ギルド'
    );
    expect(hasSubtitleText).toBe(true);
  });

  it('TC-TL-003b: サブタイトルがY座標260に表示される', async () => {
    // Given: TitleLogoインスタンス
    const { scene: mockScene } = createMockScene();
    const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');
    const logo = new TitleLogo(mockScene, 640, 0);

    // When: create()を呼び出す
    logo.create();

    // Then: Y座標260にテキストが作成される
    const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
    const subtitleCall = textCalls.find(
      (call: unknown[]) => call[2] === '錬金術師ギルド'
    );
    expect(subtitleCall).toBeDefined();
    expect(subtitleCall?.[1]).toBe(260); // Y座標
  });
});
```

#### TC-TL-004: バージョン情報表示

```typescript
describe('TC-TL-004: バージョン情報表示', () => {
  // 【テスト目的】: バージョン情報が右下に表示される
  // 【対応要件】: REQ-058-002
  // 🔵 信頼性レベル: 設計文書準拠

  it('TC-TL-004a: create()でバージョン"Version 1.0.0"が表示される', async () => {
    // Given: TitleLogoインスタンス
    const { scene: mockScene } = createMockScene();
    const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');
    const logo = new TitleLogo(mockScene, 640, 0);

    // When: create()を呼び出す
    logo.create();

    // Then: "Version 1.0.0"テキストが作成される
    const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
    const hasVersionText = textCalls.some(
      (call: unknown[]) => call[2] === 'Version 1.0.0'
    );
    expect(hasVersionText).toBe(true);
  });

  it('TC-TL-004b: バージョン情報が画面右下（オフセット20）に配置される', async () => {
    // Given: TitleLogoインスタンス
    const { scene: mockScene, mockText } = createMockScene();
    const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');
    const logo = new TitleLogo(mockScene, 640, 0);

    // When: create()を呼び出す
    logo.create();

    // Then: setOrigin(1, 1)が呼び出される（右下揃え）
    expect(mockText.setOrigin).toHaveBeenCalledWith(1, 1);
  });
});
```

#### TC-TL-E01: nullシーンでエラー

```typescript
describe('TC-TL-E01: nullシーンでエラー', () => {
  // 【テスト目的】: 防御的プログラミングの確認
  // 【対応要件】: BaseComponent.tsの実装
  // 🔵 信頼性レベル: BaseComponent.ts準拠

  it('TC-TL-E01: nullシーンでコンストラクタを呼び出すとエラーがスローされる', async () => {
    // Given: nullシーン
    const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');

    // When & Then: エラーがスローされる
    expect(() => new TitleLogo(null as unknown as Phaser.Scene, 0, 0)).toThrow(
      'BaseComponent: scene is required'
    );
  });
});
```

#### TC-TL-E02: 無効な座標でエラー

```typescript
describe('TC-TL-E02: 無効な座標でエラー', () => {
  // 【テスト目的】: 入力値バリデーションの確認
  // 【対応要件】: BaseComponent.tsの実装
  // 🔵 信頼性レベル: BaseComponent.ts準拠

  it('TC-TL-E02: NaN座標でコンストラクタを呼び出すとエラーがスローされる', async () => {
    // Given: 有効なシーンとNaN座標
    const { scene: mockScene } = createMockScene();
    const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');

    // When & Then: エラーがスローされる
    expect(() => new TitleLogo(mockScene, NaN, NaN)).toThrow('Invalid position');
  });
});
```

#### TC-TL-D01: destroy()でリソース解放

```typescript
describe('TC-TL-D01: destroy()でリソース解放', () => {
  // 【テスト目的】: リソース管理の確認
  // 【対応要件】: NFR-058-010（メモリリーク防止）
  // 🔵 信頼性レベル: NFR-058-010準拠

  it('TC-TL-D01a: destroy()が呼び出されるとコンテナが破棄される', async () => {
    // Given: TitleLogoインスタンス
    const { scene: mockScene, mockContainer } = createMockScene();
    const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');
    const logo = new TitleLogo(mockScene, 640, 0);
    logo.create();

    // When: destroy()を呼び出す
    logo.destroy();

    // Then: コンテナが破棄される
    expect(mockContainer.destroy).toHaveBeenCalled();
  });

  it('TC-TL-D01b: destroy()が呼び出されるとテキスト要素が破棄される', async () => {
    // Given: TitleLogoインスタンス
    const { scene: mockScene, mockText } = createMockScene();
    const { TitleLogo } = await import('@presentation/ui/scenes/components/title/TitleLogo');
    const logo = new TitleLogo(mockScene, 640, 0);
    logo.create();

    // When: destroy()を呼び出す
    logo.destroy();

    // Then: テキストが破棄される
    expect(mockText.destroy).toHaveBeenCalled();
  });
});
```

---

## 5. TitleMenu.ts テストケース

### 5.1 テストスイート概要

| テストケースID | テスト目的 | 信頼性レベル |
|---------------|----------|-------------|
| TC-TM-001 | コンポーネント初期化 | 🔵 RankUpTestPanel.test.ts準拠 |
| TC-TM-002 | 新規ゲームボタン表示 | 🔵 設計文書準拠 |
| TC-TM-003 | コンティニューボタン表示 | 🔵 設計文書準拠 |
| TC-TM-004 | 設定ボタン表示 | 🔵 設計文書準拠 |
| TC-TM-005 | 新規ゲームボタンクリック | 🔵 REQ-058-003 |
| TC-TM-006 | コンティニューボタンクリック | 🔵 REQ-058-003 |
| TC-TM-007 | 設定ボタンクリック | 🔵 REQ-058-003 |
| TC-TM-008 | コンティニュー無効化（セーブなし） | 🔵 REQ-058-004 |
| TC-TM-009 | setContinueEnabled()動的更新 | 🟡 妥当な推測 |
| TC-TM-010 | ホバーアニメーション適用 | 🟡 AnimationPresets活用 |
| TC-TM-E01 | nullシーンでエラー | 🔵 BaseComponent準拠 |
| TC-TM-B01 | 座標(0,0)での配置 | 🟡 境界値テスト |
| TC-TM-D01 | destroy()でリソース解放 | 🔵 NFR-058-010 |

### 5.2 詳細テストケース

#### TC-TM-001: コンポーネント初期化

```typescript
describe('TC-TM-001: 初期化テスト', () => {
  // 【テスト目的】: コンポーネント初期化が正常に動作することを確認
  // 【対応要件】: REQ-058-001
  // 🔵 信頼性レベル: RankUpTestPanel.test.tsパターン準拠

  it('TC-TM-001a: シーンインスタンスとコールバックでTitleMenuを初期化するとコンテナが作成される', async () => {
    // Given: シーンインスタンスとコールバック
    const { scene: mockScene } = createMockScene();
    const callbacks = {
      onNewGame: vi.fn(),
      onContinue: vi.fn(),
      onSettings: vi.fn(),
    };

    // When: TitleMenuを初期化
    const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
    const menu = new TitleMenu(mockScene, 640, 0, callbacks);

    // Then: コンテナが作成される
    expect(menu).toBeDefined();
    expect(menu.getContainer()).toBeDefined();
  });

  it('TC-TM-001b: continueEnabledをfalseで初期化するとコンティニューが無効になる', async () => {
    // Given: シーンインスタンスとコールバック（continueEnabled=false）
    const { scene: mockScene } = createMockScene();
    const callbacks = {
      onNewGame: vi.fn(),
      onContinue: vi.fn(),
      onSettings: vi.fn(),
    };

    // When: TitleMenuを初期化（continueEnabled=false）
    const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
    const menu = new TitleMenu(mockScene, 640, 0, callbacks, false);
    menu.create();

    // Then: コンティニューボタンが無効化されている
    expect(menu.isContinueEnabled()).toBe(false);
  });
});
```

#### TC-TM-002: 新規ゲームボタン表示

```typescript
describe('TC-TM-002: 新規ゲームボタン表示', () => {
  // 【テスト目的】: 新規ゲームボタンが正しく表示される
  // 【対応要件】: REQ-058-002
  // 🔵 信頼性レベル: 設計文書準拠

  it('TC-TM-002a: create()で"新規ゲーム"ボタンが作成される', async () => {
    // Given: TitleMenuインスタンス
    const { scene: mockScene, mockRexUI } = createMockScene();
    const callbacks = {
      onNewGame: vi.fn(),
      onContinue: vi.fn(),
      onSettings: vi.fn(),
    };
    const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
    const menu = new TitleMenu(mockScene, 640, 0, callbacks);

    // When: create()を呼び出す
    menu.create();

    // Then: rexUI.add.labelが呼び出される
    expect(mockRexUI.add.label).toHaveBeenCalled();
  });

  it('TC-TM-002b: 新規ゲームボタンがY座標400に配置される', async () => {
    // Given: TitleMenuインスタンス
    const { scene: mockScene, mockRexUI } = createMockScene();
    const callbacks = {
      onNewGame: vi.fn(),
      onContinue: vi.fn(),
      onSettings: vi.fn(),
    };
    const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
    const menu = new TitleMenu(mockScene, 640, 0, callbacks);

    // When: create()を呼び出す
    menu.create();

    // Then: Y座標400にボタンが配置される
    const labelCalls = mockRexUI.add.label.mock.calls;
    expect(labelCalls.length).toBeGreaterThanOrEqual(1);
    // 最初のボタン（新規ゲーム）のY座標を確認
    const firstButtonConfig = labelCalls[0]?.[0];
    expect(firstButtonConfig?.y).toBe(400);
  });
});
```

#### TC-TM-003: コンティニューボタン表示

```typescript
describe('TC-TM-003: コンティニューボタン表示', () => {
  // 【テスト目的】: コンティニューボタンが正しく表示される
  // 【対応要件】: REQ-058-002
  // 🔵 信頼性レベル: 設計文書準拠

  it('TC-TM-003a: create()で"コンティニュー"ボタンが作成される', async () => {
    // Given: TitleMenuインスタンス
    const { scene: mockScene, mockRexUI } = createMockScene();
    const callbacks = {
      onNewGame: vi.fn(),
      onContinue: vi.fn(),
      onSettings: vi.fn(),
    };
    const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
    const menu = new TitleMenu(mockScene, 640, 0, callbacks, true);

    // When: create()を呼び出す
    menu.create();

    // Then: ラベルが複数作成される（3つのボタン）
    expect(mockRexUI.add.label).toHaveBeenCalledTimes(3);
  });

  it('TC-TM-003b: コンティニューボタンがY座標460に配置される', async () => {
    // Given: TitleMenuインスタンス
    const { scene: mockScene, mockRexUI } = createMockScene();
    const callbacks = {
      onNewGame: vi.fn(),
      onContinue: vi.fn(),
      onSettings: vi.fn(),
    };
    const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
    const menu = new TitleMenu(mockScene, 640, 0, callbacks, true);

    // When: create()を呼び出す
    menu.create();

    // Then: Y座標460にボタンが配置される（400 + 60）
    const labelCalls = mockRexUI.add.label.mock.calls;
    const secondButtonConfig = labelCalls[1]?.[0];
    expect(secondButtonConfig?.y).toBe(460);
  });
});
```

#### TC-TM-005: 新規ゲームボタンクリック

```typescript
describe('TC-TM-005: 新規ゲームボタンクリック', () => {
  // 【テスト目的】: 新規ゲームボタンクリックでコールバックが呼ばれる
  // 【対応要件】: REQ-058-003
  // 🔵 信頼性レベル: REQ-058-003準拠

  it('TC-TM-005a: 新規ゲームボタンをクリックするとonNewGameコールバックが呼び出される', async () => {
    // Given: TitleMenuインスタンス
    const { scene: mockScene } = createMockScene();
    const callbacks = {
      onNewGame: vi.fn(),
      onContinue: vi.fn(),
      onSettings: vi.fn(),
    };
    const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
    const menu = new TitleMenu(mockScene, 640, 0, callbacks);
    menu.create();

    // When: 新規ゲームボタンをクリック
    menu.handleNewGameClick();

    // Then: onNewGameコールバックが呼び出される
    expect(callbacks.onNewGame).toHaveBeenCalledTimes(1);
  });
});
```

#### TC-TM-006: コンティニューボタンクリック

```typescript
describe('TC-TM-006: コンティニューボタンクリック', () => {
  // 【テスト目的】: コンティニューボタンクリックでコールバックが呼ばれる
  // 【対応要件】: REQ-058-003
  // 🔵 信頼性レベル: REQ-058-003準拠

  it('TC-TM-006a: 有効なコンティニューボタンをクリックするとonContinueコールバックが呼び出される', async () => {
    // Given: TitleMenuインスタンス（continueEnabled=true）
    const { scene: mockScene } = createMockScene();
    const callbacks = {
      onNewGame: vi.fn(),
      onContinue: vi.fn(),
      onSettings: vi.fn(),
    };
    const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
    const menu = new TitleMenu(mockScene, 640, 0, callbacks, true);
    menu.create();

    // When: コンティニューボタンをクリック
    menu.handleContinueClick();

    // Then: onContinueコールバックが呼び出される
    expect(callbacks.onContinue).toHaveBeenCalledTimes(1);
  });

  it('TC-TM-006b: 無効なコンティニューボタンをクリックしてもonContinueコールバックが呼び出されない', async () => {
    // Given: TitleMenuインスタンス（continueEnabled=false）
    const { scene: mockScene } = createMockScene();
    const callbacks = {
      onNewGame: vi.fn(),
      onContinue: vi.fn(),
      onSettings: vi.fn(),
    };
    const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
    const menu = new TitleMenu(mockScene, 640, 0, callbacks, false);
    menu.create();

    // When: コンティニューボタンをクリック
    menu.handleContinueClick();

    // Then: onContinueコールバックが呼び出されない
    expect(callbacks.onContinue).not.toHaveBeenCalled();
  });
});
```

#### TC-TM-007: 設定ボタンクリック

```typescript
describe('TC-TM-007: 設定ボタンクリック', () => {
  // 【テスト目的】: 設定ボタンクリックでコールバックが呼ばれる
  // 【対応要件】: REQ-058-003
  // 🔵 信頼性レベル: REQ-058-003準拠

  it('TC-TM-007a: 設定ボタンをクリックするとonSettingsコールバックが呼び出される', async () => {
    // Given: TitleMenuインスタンス
    const { scene: mockScene } = createMockScene();
    const callbacks = {
      onNewGame: vi.fn(),
      onContinue: vi.fn(),
      onSettings: vi.fn(),
    };
    const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
    const menu = new TitleMenu(mockScene, 640, 0, callbacks);
    menu.create();

    // When: 設定ボタンをクリック
    menu.handleSettingsClick();

    // Then: onSettingsコールバックが呼び出される
    expect(callbacks.onSettings).toHaveBeenCalledTimes(1);
  });
});
```

#### TC-TM-008: コンティニュー無効化（セーブなし）

```typescript
describe('TC-TM-008: コンティニュー無効化', () => {
  // 【テスト目的】: セーブデータなしでコンティニューが無効化される
  // 【対応要件】: REQ-058-004
  // 🔵 信頼性レベル: REQ-058-004準拠

  it('TC-TM-008a: continueEnabled=falseでボタンのアルファが0.5になる', async () => {
    // Given: TitleMenuインスタンス（continueEnabled=false）
    const { scene: mockScene, mockRexUI } = createMockScene();
    const callbacks = {
      onNewGame: vi.fn(),
      onContinue: vi.fn(),
      onSettings: vi.fn(),
    };
    const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
    const menu = new TitleMenu(mockScene, 640, 0, callbacks, false);

    // When: create()を呼び出す
    menu.create();

    // Then: setAlphaが呼び出される
    const mockLabel = mockRexUI.add.label();
    expect(mockLabel.setAlpha).toHaveBeenCalled();
  });
});
```

#### TC-TM-009: setContinueEnabled()動的更新

```typescript
describe('TC-TM-009: setContinueEnabled()動的更新', () => {
  // 【テスト目的】: 動的にコンティニュー有効/無効を切り替える
  // 【対応要件】: REQ-058-004
  // 🟡 信頼性レベル: 妥当な推測

  it('TC-TM-009a: setContinueEnabled(true)でコンティニューが有効になる', async () => {
    // Given: TitleMenuインスタンス（continueEnabled=false）
    const { scene: mockScene } = createMockScene();
    const callbacks = {
      onNewGame: vi.fn(),
      onContinue: vi.fn(),
      onSettings: vi.fn(),
    };
    const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
    const menu = new TitleMenu(mockScene, 640, 0, callbacks, false);
    menu.create();

    // When: setContinueEnabled(true)を呼び出す
    menu.setContinueEnabled(true);

    // Then: コンティニューが有効になる
    expect(menu.isContinueEnabled()).toBe(true);
  });

  it('TC-TM-009b: setContinueEnabled(false)でコンティニューが無効になる', async () => {
    // Given: TitleMenuインスタンス（continueEnabled=true）
    const { scene: mockScene } = createMockScene();
    const callbacks = {
      onNewGame: vi.fn(),
      onContinue: vi.fn(),
      onSettings: vi.fn(),
    };
    const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
    const menu = new TitleMenu(mockScene, 640, 0, callbacks, true);
    menu.create();

    // When: setContinueEnabled(false)を呼び出す
    menu.setContinueEnabled(false);

    // Then: コンティニューが無効になる
    expect(menu.isContinueEnabled()).toBe(false);
  });
});
```

#### TC-TM-D01: destroy()でリソース解放

```typescript
describe('TC-TM-D01: destroy()でリソース解放', () => {
  // 【テスト目的】: リソース管理の確認
  // 【対応要件】: NFR-058-010（メモリリーク防止）
  // 🔵 信頼性レベル: NFR-058-010準拠

  it('TC-TM-D01a: destroy()が呼び出されるとコンテナが破棄される', async () => {
    // Given: TitleMenuインスタンス
    const { scene: mockScene, mockContainer } = createMockScene();
    const callbacks = {
      onNewGame: vi.fn(),
      onContinue: vi.fn(),
      onSettings: vi.fn(),
    };
    const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
    const menu = new TitleMenu(mockScene, 640, 0, callbacks);
    menu.create();

    // When: destroy()を呼び出す
    menu.destroy();

    // Then: コンテナが破棄される
    expect(mockContainer.destroy).toHaveBeenCalled();
  });

  it('TC-TM-D01b: destroy()が呼び出されると全ボタンが破棄される', async () => {
    // Given: TitleMenuインスタンス
    const { scene: mockScene, mockRexUI } = createMockScene();
    const callbacks = {
      onNewGame: vi.fn(),
      onContinue: vi.fn(),
      onSettings: vi.fn(),
    };
    const { TitleMenu } = await import('@presentation/ui/scenes/components/title/TitleMenu');
    const menu = new TitleMenu(mockScene, 640, 0, callbacks);
    menu.create();

    // When: destroy()を呼び出す
    menu.destroy();

    // Then: ボタンが破棄される
    const mockLabel = mockRexUI.add.label();
    expect(mockLabel.destroy).toHaveBeenCalled();
  });
});
```

---

## 6. TitleDialog.ts テストケース

### 6.1 テストスイート概要

| テストケースID | テスト目的 | 信頼性レベル |
|---------------|----------|-------------|
| TC-TD-001 | コンポーネント初期化 | 🔵 パターン準拠 |
| TC-TD-002 | 確認ダイアログ表示 | 🔵 REQ-058-005 |
| TC-TD-003 | 設定ダイアログ表示 | 🔵 REQ-058-005 |
| TC-TD-004 | エラーダイアログ表示 | 🔵 REQ-058-005 |
| TC-TD-005 | 確認ダイアログ「はい」クリック | 🔵 REQ-058-006 |
| TC-TD-006 | 確認ダイアログ「いいえ」クリック | 🔵 REQ-058-006 |
| TC-TD-007 | 設定ダイアログ「OK」クリック | 🔵 REQ-058-006 |
| TC-TD-008 | オーバーレイ表示 | 🟡 妥当な推測 |
| TC-TD-009 | closeDialog()でダイアログ閉じる | 🟡 妥当な推測 |
| TC-TD-E01 | nullシーンでエラー | 🔵 BaseComponent準拠 |
| TC-TD-D01 | destroy()でリソース解放 | 🔵 NFR-058-010 |

### 6.2 詳細テストケース

#### TC-TD-001: コンポーネント初期化

```typescript
describe('TC-TD-001: 初期化テスト', () => {
  // 【テスト目的】: コンポーネント初期化が正常に動作することを確認
  // 【対応要件】: REQ-058-001
  // 🔵 信頼性レベル: パターン準拠

  it('TC-TD-001a: シーンインスタンスでTitleDialogを初期化するとコンテナが作成される', async () => {
    // Given: シーンインスタンス
    const { scene: mockScene } = createMockScene();

    // When: TitleDialogを初期化
    const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
    const dialog = new TitleDialog(mockScene, 640, 360);

    // Then: コンテナが作成される
    expect(dialog).toBeDefined();
    expect(dialog.getContainer()).toBeDefined();
  });
});
```

#### TC-TD-002: 確認ダイアログ表示

```typescript
describe('TC-TD-002: 確認ダイアログ表示', () => {
  // 【テスト目的】: 確認ダイアログが正しく表示される
  // 【対応要件】: REQ-058-005
  // 🔵 信頼性レベル: REQ-058-005準拠

  it('TC-TD-002a: showConfirmDialog()でダイアログが表示される', async () => {
    // Given: TitleDialogインスタンス
    const { scene: mockScene, mockRexUI } = createMockScene();
    const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
    const dialog = new TitleDialog(mockScene, 640, 360);
    dialog.create();

    // When: showConfirmDialog()を呼び出す
    dialog.showConfirmDialog(vi.fn(), vi.fn());

    // Then: rexUI.add.dialogが呼び出される
    expect(mockRexUI.add.dialog).toHaveBeenCalled();
  });

  it('TC-TD-002b: 確認ダイアログにタイトル"確認"が表示される', async () => {
    // Given: TitleDialogインスタンス
    const { scene: mockScene } = createMockScene();
    const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
    const dialog = new TitleDialog(mockScene, 640, 360);
    dialog.create();

    // When: showConfirmDialog()を呼び出す
    dialog.showConfirmDialog(vi.fn(), vi.fn());

    // Then: タイトル"確認"のテキストが作成される
    const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
    const hasTitleText = textCalls.some(
      (call: unknown[]) => call[2] === '確認'
    );
    expect(hasTitleText).toBe(true);
  });

  it('TC-TD-002c: 確認ダイアログに確認メッセージが表示される', async () => {
    // Given: TitleDialogインスタンス
    const { scene: mockScene } = createMockScene();
    const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
    const dialog = new TitleDialog(mockScene, 640, 360);
    dialog.create();

    // When: showConfirmDialog()を呼び出す
    dialog.showConfirmDialog(vi.fn(), vi.fn());

    // Then: 確認メッセージのテキストが作成される
    const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
    const hasMessageText = textCalls.some(
      (call: unknown[]) => call[2]?.includes('セーブデータを削除')
    );
    expect(hasMessageText).toBe(true);
  });
});
```

#### TC-TD-003: 設定ダイアログ表示

```typescript
describe('TC-TD-003: 設定ダイアログ表示', () => {
  // 【テスト目的】: 設定ダイアログが正しく表示される
  // 【対応要件】: REQ-058-005
  // 🔵 信頼性レベル: REQ-058-005準拠

  it('TC-TD-003a: showSettingsDialog()でダイアログが表示される', async () => {
    // Given: TitleDialogインスタンス
    const { scene: mockScene, mockRexUI } = createMockScene();
    const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
    const dialog = new TitleDialog(mockScene, 640, 360);
    dialog.create();

    // When: showSettingsDialog()を呼び出す
    dialog.showSettingsDialog(vi.fn());

    // Then: rexUI.add.dialogが呼び出される
    expect(mockRexUI.add.dialog).toHaveBeenCalled();
  });

  it('TC-TD-003b: 設定ダイアログにタイトル"設定"が表示される', async () => {
    // Given: TitleDialogインスタンス
    const { scene: mockScene } = createMockScene();
    const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
    const dialog = new TitleDialog(mockScene, 640, 360);
    dialog.create();

    // When: showSettingsDialog()を呼び出す
    dialog.showSettingsDialog(vi.fn());

    // Then: タイトル"設定"のテキストが作成される
    const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
    const hasTitleText = textCalls.some(
      (call: unknown[]) => call[2] === '設定'
    );
    expect(hasTitleText).toBe(true);
  });

  it('TC-TD-003c: 設定ダイアログに"準備中です"メッセージが表示される', async () => {
    // Given: TitleDialogインスタンス
    const { scene: mockScene } = createMockScene();
    const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
    const dialog = new TitleDialog(mockScene, 640, 360);
    dialog.create();

    // When: showSettingsDialog()を呼び出す
    dialog.showSettingsDialog(vi.fn());

    // Then: "準備中です"メッセージが表示される
    const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
    const hasStubText = textCalls.some(
      (call: unknown[]) => call[2] === '準備中です'
    );
    expect(hasStubText).toBe(true);
  });
});
```

#### TC-TD-004: エラーダイアログ表示

```typescript
describe('TC-TD-004: エラーダイアログ表示', () => {
  // 【テスト目的】: エラーダイアログが正しく表示される
  // 【対応要件】: REQ-058-005
  // 🔵 信頼性レベル: REQ-058-005準拠

  it('TC-TD-004a: showErrorDialog()でダイアログが表示される', async () => {
    // Given: TitleDialogインスタンス
    const { scene: mockScene, mockRexUI } = createMockScene();
    const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
    const dialog = new TitleDialog(mockScene, 640, 360);
    dialog.create();

    // When: showErrorDialog()を呼び出す
    dialog.showErrorDialog('エラーメッセージ', vi.fn());

    // Then: rexUI.add.dialogが呼び出される
    expect(mockRexUI.add.dialog).toHaveBeenCalled();
  });

  it('TC-TD-004b: エラーダイアログにタイトル"エラー"が表示される', async () => {
    // Given: TitleDialogインスタンス
    const { scene: mockScene } = createMockScene();
    const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
    const dialog = new TitleDialog(mockScene, 640, 360);
    dialog.create();

    // When: showErrorDialog()を呼び出す
    dialog.showErrorDialog('エラーメッセージ', vi.fn());

    // Then: タイトル"エラー"のテキストが作成される
    const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
    const hasTitleText = textCalls.some(
      (call: unknown[]) => call[2] === 'エラー'
    );
    expect(hasTitleText).toBe(true);
  });

  it('TC-TD-004c: エラーダイアログにカスタムメッセージが表示される', async () => {
    // Given: TitleDialogインスタンス
    const { scene: mockScene } = createMockScene();
    const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
    const dialog = new TitleDialog(mockScene, 640, 360);
    dialog.create();

    // When: showErrorDialog()を呼び出す
    const errorMessage = 'セーブデータの読み込みに失敗しました';
    dialog.showErrorDialog(errorMessage, vi.fn());

    // Then: エラーメッセージが表示される
    const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
    const hasErrorText = textCalls.some(
      (call: unknown[]) => call[2] === errorMessage
    );
    expect(hasErrorText).toBe(true);
  });
});
```

#### TC-TD-005: 確認ダイアログ「はい」クリック

```typescript
describe('TC-TD-005: 確認ダイアログ「はい」クリック', () => {
  // 【テスト目的】: 「はい」クリックでonConfirmコールバックが呼ばれる
  // 【対応要件】: REQ-058-006
  // 🔵 信頼性レベル: REQ-058-006準拠

  it('TC-TD-005a: 「はい」ボタンをクリックするとonConfirmコールバックが呼び出される', async () => {
    // Given: TitleDialogインスタンス
    const { scene: mockScene } = createMockScene();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
    const dialog = new TitleDialog(mockScene, 640, 360);
    dialog.create();
    dialog.showConfirmDialog(onConfirm, onCancel);

    // When: 「はい」ボタンをクリック
    dialog.handleConfirm();

    // Then: onConfirmコールバックが呼び出される
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('TC-TD-005b: 「はい」クリック後にダイアログが閉じる', async () => {
    // Given: TitleDialogインスタンス
    const { scene: mockScene, mockRexUI } = createMockScene();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
    const dialog = new TitleDialog(mockScene, 640, 360);
    dialog.create();
    dialog.showConfirmDialog(onConfirm, onCancel);

    // When: 「はい」ボタンをクリック
    dialog.handleConfirm();

    // Then: ダイアログが破棄される
    const mockDialog = mockRexUI.add.dialog();
    expect(mockDialog.destroy).toHaveBeenCalled();
  });
});
```

#### TC-TD-006: 確認ダイアログ「いいえ」クリック

```typescript
describe('TC-TD-006: 確認ダイアログ「いいえ」クリック', () => {
  // 【テスト目的】: 「いいえ」クリックでonCancelコールバックが呼ばれる
  // 【対応要件】: REQ-058-006
  // 🔵 信頼性レベル: REQ-058-006準拠

  it('TC-TD-006a: 「いいえ」ボタンをクリックするとonCancelコールバックが呼び出される', async () => {
    // Given: TitleDialogインスタンス
    const { scene: mockScene } = createMockScene();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
    const dialog = new TitleDialog(mockScene, 640, 360);
    dialog.create();
    dialog.showConfirmDialog(onConfirm, onCancel);

    // When: 「いいえ」ボタンをクリック
    dialog.handleCancel();

    // Then: onCancelコールバックが呼び出される
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('TC-TD-006b: 「いいえ」クリック後にダイアログが閉じる', async () => {
    // Given: TitleDialogインスタンス
    const { scene: mockScene, mockRexUI } = createMockScene();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
    const dialog = new TitleDialog(mockScene, 640, 360);
    dialog.create();
    dialog.showConfirmDialog(onConfirm, onCancel);

    // When: 「いいえ」ボタンをクリック
    dialog.handleCancel();

    // Then: ダイアログが破棄される
    const mockDialog = mockRexUI.add.dialog();
    expect(mockDialog.destroy).toHaveBeenCalled();
  });
});
```

#### TC-TD-008: オーバーレイ表示

```typescript
describe('TC-TD-008: オーバーレイ表示', () => {
  // 【テスト目的】: ダイアログ表示時にオーバーレイが表示される
  // 【対応要件】: 設計文書
  // 🟡 信頼性レベル: 妥当な推測

  it('TC-TD-008a: ダイアログ表示時にオーバーレイが作成される', async () => {
    // Given: TitleDialogインスタンス
    const { scene: mockScene, mockRectangle } = createMockScene();
    const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
    const dialog = new TitleDialog(mockScene, 640, 360);
    dialog.create();

    // When: showConfirmDialog()を呼び出す
    dialog.showConfirmDialog(vi.fn(), vi.fn());

    // Then: add.rectangleが呼び出される
    expect(mockScene.add.rectangle).toHaveBeenCalled();
  });

  it('TC-TD-008b: オーバーレイのアルファが0.7に設定される', async () => {
    // Given: TitleDialogインスタンス
    const { scene: mockScene, mockRectangle } = createMockScene();
    const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
    const dialog = new TitleDialog(mockScene, 640, 360);
    dialog.create();

    // When: showConfirmDialog()を呼び出す
    dialog.showConfirmDialog(vi.fn(), vi.fn());

    // Then: setAlpha(0.7)が呼び出される
    expect(mockRectangle.setAlpha).toHaveBeenCalledWith(0.7);
  });
});
```

#### TC-TD-009: closeDialog()でダイアログ閉じる

```typescript
describe('TC-TD-009: closeDialog()でダイアログ閉じる', () => {
  // 【テスト目的】: closeDialog()でダイアログとオーバーレイが閉じる
  // 【対応要件】: 設計文書
  // 🟡 信頼性レベル: 妥当な推測

  it('TC-TD-009a: closeDialog()でオーバーレイが破棄される', async () => {
    // Given: TitleDialogインスタンス
    const { scene: mockScene, mockRectangle } = createMockScene();
    const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
    const dialog = new TitleDialog(mockScene, 640, 360);
    dialog.create();
    dialog.showConfirmDialog(vi.fn(), vi.fn());

    // When: closeDialog()を呼び出す
    dialog.closeDialog();

    // Then: オーバーレイが破棄される
    expect(mockRectangle.destroy).toHaveBeenCalled();
  });

  it('TC-TD-009b: closeDialog()でダイアログが破棄される', async () => {
    // Given: TitleDialogインスタンス
    const { scene: mockScene, mockRexUI } = createMockScene();
    const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
    const dialog = new TitleDialog(mockScene, 640, 360);
    dialog.create();
    dialog.showConfirmDialog(vi.fn(), vi.fn());

    // When: closeDialog()を呼び出す
    dialog.closeDialog();

    // Then: ダイアログが破棄される
    const mockDialog = mockRexUI.add.dialog();
    expect(mockDialog.destroy).toHaveBeenCalled();
  });
});
```

#### TC-TD-D01: destroy()でリソース解放

```typescript
describe('TC-TD-D01: destroy()でリソース解放', () => {
  // 【テスト目的】: リソース管理の確認
  // 【対応要件】: NFR-058-010（メモリリーク防止）
  // 🔵 信頼性レベル: NFR-058-010準拠

  it('TC-TD-D01a: destroy()が呼び出されるとコンテナが破棄される', async () => {
    // Given: TitleDialogインスタンス
    const { scene: mockScene, mockContainer } = createMockScene();
    const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
    const dialog = new TitleDialog(mockScene, 640, 360);
    dialog.create();

    // When: destroy()を呼び出す
    dialog.destroy();

    // Then: コンテナが破棄される
    expect(mockContainer.destroy).toHaveBeenCalled();
  });

  it('TC-TD-D01b: ダイアログ表示中にdestroy()が呼び出されるとダイアログも破棄される', async () => {
    // Given: TitleDialogインスタンス（ダイアログ表示中）
    const { scene: mockScene, mockRexUI } = createMockScene();
    const { TitleDialog } = await import('@presentation/ui/scenes/components/title/TitleDialog');
    const dialog = new TitleDialog(mockScene, 640, 360);
    dialog.create();
    dialog.showConfirmDialog(vi.fn(), vi.fn());

    // When: destroy()を呼び出す
    dialog.destroy();

    // Then: ダイアログが破棄される
    const mockDialog = mockRexUI.add.dialog();
    expect(mockDialog.destroy).toHaveBeenCalled();
  });
});
```

---

## 7. TitleScene統合テスト

### 7.1 テストスイート概要

| テストケースID | テスト目的 | 信頼性レベル |
|---------------|----------|-------------|
| TC-INT-001 | シーン初期化 | 🔵 ShopScene.integration.test.ts準拠 |
| TC-INT-002 | コンポーネント連携 | 🔵 REQ-058-010 |
| TC-INT-003 | 新規ゲーム→MainScene遷移 | 🔵 REQ-058-011 |
| TC-INT-004 | コンティニュー→MainScene遷移 | 🔵 REQ-058-011 |
| TC-INT-005 | 設定→ダイアログ表示 | 🔵 REQ-058-011 |
| TC-INT-006 | セーブデータ確認→ダイアログ表示 | 🔵 REQ-058-012 |
| TC-INT-007 | セーブデータ破損チェック | 🔵 REQ-058-013 |
| TC-INT-008 | シャットダウン処理 | 🔵 NFR-058-010 |
| TC-INT-009 | フェードイン/アウトアニメーション | 🟡 TASK-0038 |

### 7.2 詳細テストケース

#### TC-INT-001: シーン初期化

```typescript
describe('TC-INT-001: シーン初期化', () => {
  // 【テスト目的】: シーン初期化で全コンポーネントが作成される
  // 【対応要件】: REQ-058-010
  // 🔵 信頼性レベル: ShopScene.integration.test.ts準拠

  it('TC-INT-001a: create()が呼び出されると3つのコンポーネントが初期化される', async () => {
    // Given: TitleSceneインスタンス
    // モックシーンの設定

    // When: create()を呼び出す

    // Then: TitleLogo、TitleMenu、TitleDialogが作成される
  });
});
```

#### TC-INT-002: コンポーネント連携

```typescript
describe('TC-INT-002: コンポーネント連携', () => {
  // 【テスト目的】: コンポーネント間の連携が正常に動作する
  // 【対応要件】: REQ-058-010
  // 🔵 信頼性レベル: REQ-058-010準拠

  it('TC-INT-002a: TitleMenuのonNewGameがTitleDialogを表示する', async () => {
    // Given: TitleSceneインスタンス（セーブデータあり）

    // When: 新規ゲームボタンをクリック

    // Then: 確認ダイアログが表示される
  });
});
```

#### TC-INT-003: 新規ゲーム→MainScene遷移

```typescript
describe('TC-INT-003: 新規ゲーム→MainScene遷移', () => {
  // 【テスト目的】: 新規ゲームでMainSceneに遷移する
  // 【対応要件】: REQ-058-011
  // 🔵 信頼性レベル: REQ-058-011準拠

  it('TC-INT-003a: セーブデータなしで新規ゲームをクリックするとMainSceneに遷移する', async () => {
    // Given: TitleSceneインスタンス（セーブデータなし）

    // When: 新規ゲームボタンをクリック

    // Then: scene.start('MainScene')が呼び出される
  });

  it('TC-INT-003b: セーブデータありで確認ダイアログ「はい」をクリックするとMainSceneに遷移する', async () => {
    // Given: TitleSceneインスタンス（セーブデータあり）

    // When: 新規ゲームボタン→確認ダイアログ「はい」をクリック

    // Then: scene.start('MainScene')が呼び出される
  });
});
```

#### TC-INT-004: コンティニュー→MainScene遷移

```typescript
describe('TC-INT-004: コンティニュー→MainScene遷移', () => {
  // 【テスト目的】: コンティニューでセーブデータを読み込みMainSceneに遷移する
  // 【対応要件】: REQ-058-011
  // 🔵 信頼性レベル: REQ-058-011準拠

  it('TC-INT-004a: コンティニューボタンをクリックするとセーブデータを読み込んでMainSceneに遷移する', async () => {
    // Given: TitleSceneインスタンス（セーブデータあり）

    // When: コンティニューボタンをクリック

    // Then: saveDataRepository.load()が呼び出され、scene.start('MainScene', { saveData })が呼び出される
  });

  it('TC-INT-004b: セーブデータ読み込みエラーでエラーダイアログが表示される', async () => {
    // Given: TitleSceneインスタンス（セーブデータ破損）

    // When: コンティニューボタンをクリック

    // Then: エラーダイアログが表示される
  });
});
```

#### TC-INT-005: 設定→ダイアログ表示

```typescript
describe('TC-INT-005: 設定→ダイアログ表示', () => {
  // 【テスト目的】: 設定ボタンで設定ダイアログが表示される
  // 【対応要件】: REQ-058-011
  // 🔵 信頼性レベル: REQ-058-011準拠

  it('TC-INT-005a: 設定ボタンをクリックすると設定ダイアログが表示される', async () => {
    // Given: TitleSceneインスタンス

    // When: 設定ボタンをクリック

    // Then: 設定ダイアログが表示される
  });
});
```

#### TC-INT-006: セーブデータ確認→ダイアログ表示

```typescript
describe('TC-INT-006: セーブデータ確認→ダイアログ表示', () => {
  // 【テスト目的】: セーブデータありで新規ゲーム時に確認ダイアログが表示される
  // 【対応要件】: REQ-058-012
  // 🔵 信頼性レベル: REQ-058-012準拠

  it('TC-INT-006a: セーブデータありで新規ゲームをクリックすると確認ダイアログが表示される', async () => {
    // Given: TitleSceneインスタンス（セーブデータあり）

    // When: 新規ゲームボタンをクリック

    // Then: 確認ダイアログが表示される
  });

  it('TC-INT-006b: 確認ダイアログ「いいえ」でダイアログが閉じてシーンが維持される', async () => {
    // Given: TitleSceneインスタンス（確認ダイアログ表示中）

    // When: 確認ダイアログ「いいえ」をクリック

    // Then: ダイアログが閉じ、TitleSceneが維持される
  });
});
```

#### TC-INT-007: セーブデータ破損チェック

```typescript
describe('TC-INT-007: セーブデータ破損チェック', () => {
  // 【テスト目的】: セーブデータ破損時にコンティニューが無効化される
  // 【対応要件】: REQ-058-013
  // 🔵 信頼性レベル: REQ-058-013準拠

  it('TC-INT-007a: セーブデータ破損時にコンティニューボタンが無効化される', async () => {
    // Given: TitleSceneインスタンス（セーブデータ破損）

    // When: create()が呼び出される

    // Then: コンティニューボタンが無効化される
  });
});
```

#### TC-INT-008: シャットダウン処理

```typescript
describe('TC-INT-008: シャットダウン処理', () => {
  // 【テスト目的】: シャットダウンで全コンポーネントが破棄される
  // 【対応要件】: NFR-058-010
  // 🔵 信頼性レベル: NFR-058-010準拠

  it('TC-INT-008a: shutdown()で全コンポーネントが破棄される', async () => {
    // Given: TitleSceneインスタンス

    // When: shutdown()を呼び出す

    // Then: 全コンポーネントが破棄される
  });
});
```

#### TC-INT-009: フェードイン/アウトアニメーション

```typescript
describe('TC-INT-009: フェードイン/アウトアニメーション', () => {
  // 【テスト目的】: アニメーションが正しく動作する
  // 【対応要件】: TASK-0038
  // 🟡 信頼性レベル: TASK-0038準拠

  it('TC-INT-009a: create()でフェードインが開始される', async () => {
    // Given: TitleSceneインスタンス

    // When: create()を呼び出す

    // Then: cameras.main.fadeIn()が呼び出される
  });

  it('TC-INT-009b: シーン遷移時にフェードアウトが実行される', async () => {
    // Given: TitleSceneインスタンス

    // When: 新規ゲームボタンをクリック（セーブデータなし）

    // Then: cameras.main.fadeOut()が呼び出される
  });
});
```

---

## 8. カバレッジ目標

### 8.1 コンポーネント別カバレッジ目標

| コンポーネント | branches | functions | lines | statements |
|---------------|----------|-----------|-------|------------|
| types.ts | 100% | 100% | 100% | 100% |
| TitleLogo.ts | 80%+ | 80%+ | 80%+ | 80%+ |
| TitleMenu.ts | 80%+ | 80%+ | 80%+ | 80%+ |
| TitleDialog.ts | 80%+ | 80%+ | 80%+ | 80%+ |
| TitleScene.ts | 80%+ | 80%+ | 80%+ | 80%+ |

### 8.2 カバレッジ確認コマンド

```bash
pnpm test:coverage tests/unit/presentation/ui/scenes/components/title/
```

---

## 9. テスト実行順序

### 9.1 推奨実行順序

1. **types.test.ts** - 定数・型定義の正確性確認（基盤テスト）
2. **TitleLogo.test.ts** - ロゴコンポーネントの単体テスト
3. **TitleMenu.test.ts** - メニューコンポーネントの単体テスト
4. **TitleDialog.test.ts** - ダイアログコンポーネントの単体テスト
5. **TitleScene.integration.test.ts** - 統合テスト（コンポーネント連携確認）

### 9.2 依存関係

```
types.ts
   ↓
TitleLogo.ts ─┐
TitleMenu.ts ─┼→ TitleScene.ts
TitleDialog.ts┘
```

---

## 10. 既存テスト互換性確認

### 10.1 確認対象

リファクタリング前のTitleScene.tsに対する既存テストがある場合、以下を確認する:

1. 既存テストファイルの検索: `tests/unit/presentation/scenes/title-scene.test.ts`
2. 既存テストが存在しない場合は新規作成のみ
3. 既存テストが存在する場合は互換性を維持

### 10.2 既存機能の非破壊確認

以下の機能が維持されることを統合テストで確認:

- タイトルロゴ「ATELIER GUILD」の表示
- サブタイトル「錬金術師ギルド」の表示
- バージョン情報の表示
- 新規ゲーム/コンティニュー/設定ボタンの表示
- ボタンクリックでの適切な動作
- セーブデータの有無による挙動の違い
- ダイアログの表示と操作
- シーン遷移

---

*作成日時: 2026-01-24*
*タスクID: TASK-0058*
*フェーズ: TDDテストケース作成*
