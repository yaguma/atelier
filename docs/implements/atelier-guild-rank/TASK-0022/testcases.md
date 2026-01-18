# TASK-0022: 依頼受注フェーズUI - TDDテストケース定義書

**バージョン**: 1.0.0
**作成日**: 2026-01-18
**タスクID**: TASK-0022
**タスク名**: 依頼受注フェーズUI
**見積時間**: 4時間（半日）
**担当レイヤー**: Presentation

---

## 1. テスト方針

### 1.1 テスト戦略

| テスト種別 | ツール | カバレッジ目標 | 実施内容 |
|-----------|--------|---------------|----------|
| **ユニットテスト** | Vitest | 90%+ | コンポーネント単体テスト |
| **統合テスト** | Vitest | 80%+ | フェーズUI全体のテスト |
| **エッジケーステスト** | Vitest | 100% | エラーハンドリング、境界値テスト |

### 1.2 TDD開発フロー

1. **Red**: 失敗するテストケースを作成
2. **Green**: テストを通す最小限の実装
3. **Refactor**: コード品質改善、リファクタリング

### 1.3 モック戦略

| モック対象 | モック方法 | 理由 |
|-----------|-----------|------|
| **EventBus** | vi.fn()でモック | イベント発行を検証するため |
| **Quest** | テストデータを作成 | 依頼エンティティの実体を用意 |
| **Client** | テストデータを作成 | 依頼者データの実体を用意 |
| **Phaser.Scene** | 最小限のモック | Phaserシーンのメソッドをモック |

---

## 2. QuestCardUIコンポーネント - ユニットテスト

### 2.1 正常系テスト

#### TC-001: カード初期化と表示
**目的**: QuestCardUIが正しく初期化され、依頼情報が表示されること

| 項目 | 内容 |
|------|------|
| **テストID** | TC-001 |
| **優先度** | 高 |
| **信頼性** | 🔵 |
| **テストケース名** | カード初期化と依頼情報表示 |

**前提条件**:
- Phaserシーンモックが準備されている
- 有効なQuest、Clientデータが準備されている

**テスト手順**:
```typescript
// 1. テストデータ準備
const mockScene = createMockScene();
const mockQuest = createMockQuest({
  id: 'Q001',
  clientId: 'C001',
  baseContribution: 50,
  baseGold: 100,
  deadline: 3,
});
const mockClient = createMockClient({
  id: 'C001',
  name: '村人',
  type: ClientType.VILLAGER,
});
const config: QuestCardUIConfig = {
  quest: new Quest(mockQuest, mockClient),
  x: 100,
  y: 200,
  interactive: true,
  onAccept: vi.fn(),
};

// 2. QuestCardUI作成
const questCard = new QuestCardUI(mockScene, config);

// 3. create()メソッド呼び出し
questCard.create();
```

**期待結果**:
- [x] QuestCardUIがエラーなく初期化される
- [x] container.x = 100, container.y = 200 に配置される
- [x] 依頼者名「村人」が表示される
- [x] 報酬情報「50貢献度 / 100G」が表示される
- [x] 期限「3日」が表示される
- [x] 「受注する」ボタンが表示される

**検証方法**:
```typescript
expect(questCard).toBeDefined();
expect(questCard.container).toBeDefined();
expect(questCard.container.x).toBe(100);
expect(questCard.container.y).toBe(200);
expect(mockScene.add.text).toHaveBeenCalledWith(
  expect.any(Number),
  expect.any(Number),
  expect.stringContaining('村人'),
  expect.any(Object)
);
expect(mockScene.add.text).toHaveBeenCalledWith(
  expect.any(Number),
  expect.any(Number),
  expect.stringContaining('50'),
  expect.any(Object)
);
```

---

#### TC-002: 受注ボタンクリック処理
**目的**: 受注ボタンをクリックすると、onAcceptコールバックが呼び出されること

| 項目 | 内容 |
|------|------|
| **テストID** | TC-002 |
| **優先度** | 高 |
| **信頼性** | 🔵 |
| **テストケース名** | 受注ボタンクリック時のコールバック実行 |

**前提条件**:
- QuestCardUIが初期化されている
- onAcceptコールバックがモック化されている

**テスト手順**:
```typescript
// 1. テストデータ準備
const mockOnAccept = vi.fn();
const config: QuestCardUIConfig = {
  quest: mockQuest,
  x: 100,
  y: 200,
  onAccept: mockOnAccept,
};
const questCard = new QuestCardUI(mockScene, config);
questCard.create();

// 2. 受注ボタンを取得
const acceptButton = questCard['acceptButton'];

// 3. クリックイベントをシミュレート
acceptButton.emit('pointerdown');
```

**期待結果**:
- [x] onAcceptコールバックが1回呼び出される
- [x] onAcceptの引数にquestが渡される

**検証方法**:
```typescript
expect(mockOnAccept).toHaveBeenCalledTimes(1);
expect(mockOnAccept).toHaveBeenCalledWith(mockQuest);
```

---

#### TC-003: インタラクティブ動作（ホバー）
**目的**: カードにホバーすると、スケールが1.05倍に拡大されること

| 項目 | 内容 |
|------|------|
| **テストID** | TC-003 |
| **優先度** | 中 |
| **信頼性** | 🟡 |
| **テストケース名** | カードホバー時のスケール変化 |

**前提条件**:
- QuestCardUIが初期化されている
- interactiveオプションがtrueである

**テスト手順**:
```typescript
// 1. テストデータ準備
const config: QuestCardUIConfig = {
  quest: mockQuest,
  x: 100,
  y: 200,
  interactive: true,
};
const questCard = new QuestCardUI(mockScene, config);
questCard.create();

// 2. ホバーイベントをシミュレート
const background = questCard['background'];
background.emit('pointerover');
```

**期待結果**:
- [x] Tweenが作成される
- [x] スケールが1.05倍になるTweenが実行される
- [x] 時間は150ms、イージングはQuad.Out

**検証方法**:
```typescript
expect(mockScene.tweens.add).toHaveBeenCalledWith(
  expect.objectContaining({
    targets: expect.any(Object),
    scale: 1.05,
    duration: 150,
    ease: 'Quad.Out',
  })
);
```

---

#### TC-004: リソース解放
**目的**: destroy()が呼ばれると、すべてのGameObjectsが破棄されること

| 項目 | 内容 |
|------|------|
| **テストID** | TC-004 |
| **優先度** | 高 |
| **信頼性** | 🔵 |
| **テストケース名** | リソース解放とメモリリーク防止 |

**前提条件**:
- QuestCardUIが初期化されている

**テスト手順**:
```typescript
// 1. QuestCardUI作成
const questCard = new QuestCardUI(mockScene, config);
questCard.create();

// 2. destroy()呼び出し
questCard.destroy();
```

**期待結果**:
- [x] container.destroy()が呼ばれる
- [x] すべてのGameObjects（background、text、button等）のdestroy()が呼ばれる
- [x] メモリリークが発生しない

**検証方法**:
```typescript
expect(questCard.container.destroy).toHaveBeenCalledTimes(1);
expect(questCard['background'].destroy).toHaveBeenCalled();
expect(questCard['clientNameText'].destroy).toHaveBeenCalled();
expect(questCard['dialogueText'].destroy).toHaveBeenCalled();
expect(questCard['rewardText'].destroy).toHaveBeenCalled();
expect(questCard['acceptButton'].destroy).toHaveBeenCalled();
```

---

### 2.2 異常系テスト

#### TC-005: 無効なconfig（null）
**目的**: configがnullの場合、エラーがスローされること

| 項目 | 内容 |
|------|------|
| **テストID** | TC-005 |
| **優先度** | 高 |
| **信頼性** | 🔵 |
| **テストケース名** | configがnullの場合のエラー処理 |

**前提条件**:
- Phaserシーンモックが準備されている

**テスト手順**:
```typescript
// 1. nullのconfigを渡す
const invalidConfig: any = null;

// 2. QuestCardUIの作成を試みる
const createCard = () => new QuestCardUI(mockScene, invalidConfig);
```

**期待結果**:
- [x] エラーがスローされる
- [x] エラーメッセージに「config is required」が含まれる

**検証方法**:
```typescript
expect(createCard).toThrow('config is required');
```

---

#### TC-006: 無効なconfig.quest（undefined）
**目的**: config.questがundefinedの場合、エラーがスローされること

| 項目 | 内容 |
|------|------|
| **テストID** | TC-006 |
| **優先度** | 高 |
| **信頼性** | 🔵 |
| **テストケース名** | config.questがundefinedの場合のエラー処理 |

**前提条件**:
- Phaserシーンモックが準備されている

**テスト手順**:
```typescript
// 1. questがundefinedのconfigを渡す
const invalidConfig: any = {
  x: 100,
  y: 200,
  quest: undefined,
};

// 2. QuestCardUIの作成を試みる
const createCard = () => new QuestCardUI(mockScene, invalidConfig);
```

**期待結果**:
- [x] エラーがスローされる
- [x] エラーメッセージに「config.quest is required」が含まれる

**検証方法**:
```typescript
expect(createCard).toThrow('config.quest is required');
```

---

#### TC-007: 無効なonAccept（関数以外）
**目的**: onAcceptが関数でない場合、警告が出るか無視されること

| 項目 | 内容 |
|------|------|
| **テストID** | TC-007 |
| **優先度** | 中 |
| **信頼性** | 🟡 |
| **テストケース名** | onAcceptが関数でない場合の処理 |

**前提条件**:
- Phaserシーンモックが準備されている

**テスト手順**:
```typescript
// 1. onAcceptが文字列のconfigを渡す
const invalidConfig: any = {
  quest: mockQuest,
  x: 100,
  y: 200,
  onAccept: 'not-a-function',
};

// 2. QuestCardUIの作成を試みる
const questCard = new QuestCardUI(mockScene, invalidConfig);
questCard.create();

// 3. 受注ボタンをクリック
const acceptButton = questCard['acceptButton'];
acceptButton.emit('pointerdown');
```

**期待結果**:
- [x] エラーはスローされない
- [x] コンソールに警告が出力される（オプション）
- [x] クリックしても何も起きない

**検証方法**:
```typescript
expect(() => questCard.create()).not.toThrow();
// オプション: console.warn がモックされている場合
// expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('onAccept'));
```

---

### 2.3 境界値テスト

#### TC-008: 長いテキストの依頼内容
**目的**: 依頼内容が長い場合でも、正しく表示されること

| 項目 | 内容 |
|------|------|
| **テストID** | TC-008 |
| **優先度** | 中 |
| **信頼性** | 🟡 |
| **テストケース名** | 長いテキストの依頼内容表示 |

**前提条件**:
- Phaserシーンモックが準備されている

**テスト手順**:
```typescript
// 1. 長いdialogueを持つQuestデータを作成
const longDialogue = 'これは非常に長い依頼のセリフです。'.repeat(10);
const mockQuestLongText = createMockQuest({
  id: 'Q002',
  clientId: 'C001',
  dialogue: longDialogue,
});

// 2. QuestCardUIを作成
const config: QuestCardUIConfig = {
  quest: new Quest(mockQuestLongText, mockClient),
  x: 100,
  y: 200,
};
const questCard = new QuestCardUI(mockScene, config);
questCard.create();
```

**期待結果**:
- [x] エラーなくカードが作成される
- [x] テキストが表示される（wordWrapが有効）
- [x] カードサイズを超えた場合、テキストが折り返される

**検証方法**:
```typescript
expect(questCard).toBeDefined();
expect(mockScene.add.text).toHaveBeenCalledWith(
  expect.any(Number),
  expect.any(Number),
  expect.stringContaining(longDialogue),
  expect.objectContaining({
    wordWrap: { width: expect.any(Number) },
  })
);
```

---

#### TC-009: 空文字列の依頼者名
**目的**: 依頼者名が空文字列の場合、デフォルト値が表示されること

| 項目 | 内容 |
|------|------|
| **テストID** | TC-009 |
| **優先度** | 中 |
| **信頼性** | 🟡 |
| **テストケース名** | 空文字列の依頼者名処理 |

**前提条件**:
- Phaserシーンモックが準備されている

**テスト手順**:
```typescript
// 1. 名前が空文字列のClientデータを作成
const mockClientEmpty = createMockClient({
  id: 'C002',
  name: '',
  type: ClientType.VILLAGER,
});

// 2. QuestCardUIを作成
const config: QuestCardUIConfig = {
  quest: new Quest(mockQuest, mockClientEmpty),
  x: 100,
  y: 200,
};
const questCard = new QuestCardUI(mockScene, config);
questCard.create();
```

**期待結果**:
- [x] エラーなくカードが作成される
- [x] デフォルト値「不明な依頼者」が表示される

**検証方法**:
```typescript
expect(questCard).toBeDefined();
expect(mockScene.add.text).toHaveBeenCalledWith(
  expect.any(Number),
  expect.any(Number),
  '不明な依頼者',
  expect.any(Object)
);
```

---

#### TC-010: 報酬0の依頼
**目的**: 報酬が0の依頼でも正しく表示されること

| 項目 | 内容 |
|------|------|
| **テストID** | TC-010 |
| **優先度** | 低 |
| **信頼性** | 🟡 |
| **テストケース名** | 報酬0の依頼表示 |

**前提条件**:
- Phaserシーンモックが準備されている

**テスト手順**:
```typescript
// 1. 報酬0のQuestデータを作成
const mockQuestNoReward = createMockQuest({
  id: 'Q003',
  clientId: 'C001',
  baseContribution: 0,
  baseGold: 0,
});

// 2. QuestCardUIを作成
const config: QuestCardUIConfig = {
  quest: new Quest(mockQuestNoReward, mockClient),
  x: 100,
  y: 200,
};
const questCard = new QuestCardUI(mockScene, config);
questCard.create();
```

**期待結果**:
- [x] エラーなくカードが作成される
- [x] 報酬情報「0貢献度 / 0G」が表示される

**検証方法**:
```typescript
expect(questCard).toBeDefined();
expect(mockScene.add.text).toHaveBeenCalledWith(
  expect.any(Number),
  expect.any(Number),
  expect.stringContaining('0'),
  expect.any(Object)
);
```

---

## 3. QuestAcceptPhaseUIコンポーネント - ユニットテスト

### 3.1 正常系テスト

#### TC-101: フェーズUI初期化
**目的**: QuestAcceptPhaseUIが正しく初期化され、タイトルと受注済みリストが表示されること

| 項目 | 内容 |
|------|------|
| **テストID** | TC-101 |
| **優先度** | 高 |
| **信頼性** | 🔵 |
| **テストケース名** | フェーズUI初期化と基本表示 |

**前提条件**:
- Phaserシーンモックが準備されている
- EventBusモックがscene.dataに設定されている

**テスト手順**:
```typescript
// 1. テストデータ準備
const mockScene = createMockScene();
const mockEventBus = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
};
mockScene.data.get = vi.fn().mockReturnValue(mockEventBus);

// 2. QuestAcceptPhaseUIを作成
const phaseUI = new QuestAcceptPhaseUI(mockScene);

// 3. create()メソッド呼び出し
phaseUI.create();
```

**期待結果**:
- [x] QuestAcceptPhaseUIがエラーなく初期化される
- [x] container.x = 160, container.y = 80 に配置される
- [x] タイトル「📋 本日の依頼」が表示される
- [x] 受注済みリスト（ScrollablePanel）が作成される

**検証方法**:
```typescript
expect(phaseUI).toBeDefined();
expect(phaseUI.container).toBeDefined();
expect(phaseUI.container.x).toBe(160);
expect(phaseUI.container.y).toBe(80);
expect(mockScene.add.text).toHaveBeenCalledWith(
  expect.any(Number),
  expect.any(Number),
  '📋 本日の依頼',
  expect.any(Object)
);
expect(phaseUI['acceptedList']).toBeDefined();
```

---

#### TC-102: 依頼リスト更新（通常ケース）
**目的**: updateQuests()を呼ぶと、依頼カードが正しく表示されること

| 項目 | 内容 |
|------|------|
| **テストID** | TC-102 |
| **優先度** | 高 |
| **信頼性** | 🔵 |
| **テストケース名** | 依頼リスト更新 |

**前提条件**:
- QuestAcceptPhaseUIが初期化されている

**テスト手順**:
```typescript
// 1. テストデータ準備
const mockQuests = [
  new Quest(createMockQuest({ id: 'Q001' }), createMockClient({ id: 'C001' })),
  new Quest(createMockQuest({ id: 'Q002' }), createMockClient({ id: 'C002' })),
  new Quest(createMockQuest({ id: 'Q003' }), createMockClient({ id: 'C003' })),
];

// 2. updateQuests()呼び出し
phaseUI.updateQuests(mockQuests);
```

**期待結果**:
- [x] 3つのQuestCardUIが作成される
- [x] questCards配列に3つの要素が格納される
- [x] 各カードが正しい位置に配置される
  - Quest 1: (200, 150)
  - Quest 2: (500, 150)
  - Quest 3: (800, 150)

**検証方法**:
```typescript
expect(phaseUI['questCards'].length).toBe(3);
expect(phaseUI['questCards'][0].container.x).toBe(200);
expect(phaseUI['questCards'][0].container.y).toBe(150);
expect(phaseUI['questCards'][1].container.x).toBe(500);
expect(phaseUI['questCards'][1].container.y).toBe(150);
expect(phaseUI['questCards'][2].container.x).toBe(800);
expect(phaseUI['questCards'][2].container.y).toBe(150);
```

---

#### TC-103: 依頼受注処理
**目的**: 依頼を受注すると、QUEST_ACCEPTEDイベントが発行されること

| 項目 | 内容 |
|------|------|
| **テストID** | TC-103 |
| **優先度** | 高 |
| **信頼性** | 🔵 |
| **テストケース名** | 依頼受注イベント発行 |

**前提条件**:
- QuestAcceptPhaseUIが初期化されている
- 依頼リストが更新されている

**テスト手順**:
```typescript
// 1. テストデータ準備
const mockQuest = new Quest(createMockQuest({ id: 'Q001' }), createMockClient({ id: 'C001' }));
phaseUI.updateQuests([mockQuest]);

// 2. 依頼カードの受注ボタンをクリック
const questCard = phaseUI['questCards'][0];
const acceptButton = questCard['acceptButton'];
acceptButton.emit('pointerdown');
```

**期待結果**:
- [x] EventBus.emit()が呼ばれる
- [x] イベント名はGameEventType.QUEST_ACCEPTED
- [x] ペイロードに{ quest: mockQuest }が含まれる

**検証方法**:
```typescript
expect(mockEventBus.emit).toHaveBeenCalledTimes(1);
expect(mockEventBus.emit).toHaveBeenCalledWith(
  GameEventType.QUEST_ACCEPTED,
  { quest: mockQuest }
);
```

---

#### TC-104: リソース解放
**目的**: destroy()が呼ばれると、すべてのQuestCardUIとコンテナが破棄されること

| 項目 | 内容 |
|------|------|
| **テストID** | TC-104 |
| **優先度** | 高 |
| **信頼性** | 🔵 |
| **テストケース名** | リソース解放とメモリリーク防止 |

**前提条件**:
- QuestAcceptPhaseUIが初期化されている
- 依頼リストが更新されている

**テスト手順**:
```typescript
// 1. テストデータ準備
const mockQuests = [
  new Quest(createMockQuest({ id: 'Q001' }), createMockClient({ id: 'C001' })),
  new Quest(createMockQuest({ id: 'Q002' }), createMockClient({ id: 'C002' })),
];
phaseUI.updateQuests(mockQuests);

// 2. destroy()呼び出し
phaseUI.destroy();
```

**期待結果**:
- [x] すべてのQuestCardUIのdestroy()が呼ばれる
- [x] questCards配列が空になる
- [x] container.destroy()が呼ばれる
- [x] acceptedList.destroy()が呼ばれる（存在する場合）

**検証方法**:
```typescript
expect(phaseUI['questCards'][0].destroy).toHaveBeenCalledTimes(1);
expect(phaseUI['questCards'][1].destroy).toHaveBeenCalledTimes(1);
expect(phaseUI['questCards'].length).toBe(0);
expect(phaseUI.container.destroy).toHaveBeenCalledTimes(1);
if (phaseUI['acceptedList']) {
  expect(phaseUI['acceptedList'].destroy).toHaveBeenCalled();
}
```

---

### 3.2 異常系テスト

#### TC-105: EventBus未初期化
**目的**: EventBusがscene.dataに存在しない場合、警告が出ること

| 項目 | 内容 |
|------|------|
| **テストID** | TC-105 |
| **優先度** | 高 |
| **信頼性** | 🔵 |
| **テストケース名** | EventBus未初期化時の警告 |

**前提条件**:
- Phaserシーンモックが準備されている
- scene.data.get('eventBus')がnullを返す

**テスト手順**:
```typescript
// 1. EventBusがないシーンを準備
const mockScene = createMockScene();
mockScene.data.get = vi.fn().mockReturnValue(null);

// 2. console.warnをモック
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

// 3. QuestAcceptPhaseUIを作成
const phaseUI = new QuestAcceptPhaseUI(mockScene);
phaseUI.create();
```

**期待結果**:
- [x] エラーはスローされない
- [x] console.warnが呼ばれる
- [x] 警告メッセージに「EventBus is not available」が含まれる

**検証方法**:
```typescript
expect(consoleWarnSpy).toHaveBeenCalledWith(
  expect.stringContaining('EventBus is not available')
);
consoleWarnSpy.mockRestore();
```

---

#### TC-106: 無効なデータ（null依頼リスト）
**目的**: updateQuests(null)を呼んでもエラーが発生しないこと

| 項目 | 内容 |
|------|------|
| **テストID** | TC-106 |
| **優先度** | 中 |
| **信頼性** | 🟡 |
| **テストケース名** | null依頼リストの処理 |

**前提条件**:
- QuestAcceptPhaseUIが初期化されている

**テスト手順**:
```typescript
// 1. updateQuests(null)を呼び出し
const updateWithNull = () => phaseUI.updateQuests(null as any);
```

**期待結果**:
- [x] エラーはスローされない
- [x] questCards配列は空のまま
- [x] console.warnが呼ばれる（オプション）

**検証方法**:
```typescript
expect(updateWithNull).not.toThrow();
expect(phaseUI['questCards'].length).toBe(0);
```

---

#### TC-107: イベント発行失敗（EventBusエラー）
**目的**: EventBus.emit()でエラーが発生しても、アプリケーションが停止しないこと

| 項目 | 内容 |
|------|------|
| **テストID** | TC-107 |
| **優先度** | 中 |
| **信頼性** | 🟡 |
| **テストケース名** | EventBus.emit()エラー時の処理 |

**前提条件**:
- QuestAcceptPhaseUIが初期化されている
- EventBus.emit()がエラーをスローするようモック

**テスト手順**:
```typescript
// 1. EventBusのemit()をエラーをスローするようモック
const mockEventBus = {
  emit: vi.fn().mockImplementation(() => {
    throw new Error('EventBus error');
  }),
  on: vi.fn(),
  off: vi.fn(),
};
mockScene.data.get = vi.fn().mockReturnValue(mockEventBus);

// 2. 依頼受注処理を実行
const mockQuest = new Quest(createMockQuest({ id: 'Q001' }), createMockClient({ id: 'C001' }));
const acceptQuest = () => phaseUI['onAcceptQuest'](mockQuest);
```

**期待結果**:
- [x] エラーがキャッチされる
- [x] console.errorが呼ばれる
- [x] アプリケーションが停止しない

**検証方法**:
```typescript
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
expect(acceptQuest).not.toThrow();
expect(consoleErrorSpy).toHaveBeenCalledWith(
  expect.stringContaining('EventBus error')
);
consoleErrorSpy.mockRestore();
```

---

### 3.3 境界値テスト

#### TC-108: 依頼0件
**目的**: 依頼が0件の場合でも正しく動作すること

| 項目 | 内容 |
|------|------|
| **テストID** | TC-108 |
| **優先度** | 中 |
| **信頼性** | 🟡 |
| **テストケース名** | 依頼0件の処理 |

**前提条件**:
- QuestAcceptPhaseUIが初期化されている

**テスト手順**:
```typescript
// 1. 空の依頼リストを渡す
phaseUI.updateQuests([]);
```

**期待結果**:
- [x] エラーはスローされない
- [x] questCards配列は空
- [x] UIに「依頼がありません」などのメッセージが表示される（オプション）

**検証方法**:
```typescript
expect(phaseUI['questCards'].length).toBe(0);
```

---

#### TC-109: 依頼最大件数（7件）
**目的**: 依頼が最大件数（7件）の場合でも正しく表示されること

| 項目 | 内容 |
|------|------|
| **テストID** | TC-109 |
| **優先度** | 中 |
| **信頼性** | 🟡 |
| **テストケース名** | 依頼最大件数の処理 |

**前提条件**:
- QuestAcceptPhaseUIが初期化されている

**テスト手順**:
```typescript
// 1. 7件の依頼リストを作成
const mockQuests = Array.from({ length: 7 }, (_, i) =>
  new Quest(
    createMockQuest({ id: `Q00${i + 1}` }),
    createMockClient({ id: `C00${i + 1}` })
  )
);

// 2. updateQuests()呼び出し
phaseUI.updateQuests(mockQuests);
```

**期待結果**:
- [x] 7つのQuestCardUIが作成される
- [x] カードが3列×3行（最後の行は1つ）で配置される
- [x] カードの配置位置が正しい
  - Quest 1-3: y=150
  - Quest 4-6: y=350
  - Quest 7: y=550

**検証方法**:
```typescript
expect(phaseUI['questCards'].length).toBe(7);
expect(phaseUI['questCards'][0].container.x).toBe(200);
expect(phaseUI['questCards'][0].container.y).toBe(150);
expect(phaseUI['questCards'][3].container.x).toBe(200);
expect(phaseUI['questCards'][3].container.y).toBe(350);
expect(phaseUI['questCards'][6].container.x).toBe(200);
expect(phaseUI['questCards'][6].container.y).toBe(550);
```

---

#### TC-110: 依頼リスト更新時の既存カード破棄
**目的**: updateQuests()を2回呼ぶと、既存のカードが破棄され、新しいカードが作成されること

| 項目 | 内容 |
|------|------|
| **テストID** | TC-110 |
| **優先度** | 高 |
| **信頼性** | 🔵 |
| **テストケース名** | 依頼リスト更新時の既存カード破棄 |

**前提条件**:
- QuestAcceptPhaseUIが初期化されている

**テスト手順**:
```typescript
// 1. 最初の依頼リストを設定
const mockQuests1 = [
  new Quest(createMockQuest({ id: 'Q001' }), createMockClient({ id: 'C001' })),
  new Quest(createMockQuest({ id: 'Q002' }), createMockClient({ id: 'C002' })),
];
phaseUI.updateQuests(mockQuests1);
const firstCards = [...phaseUI['questCards']];

// 2. 新しい依頼リストを設定
const mockQuests2 = [
  new Quest(createMockQuest({ id: 'Q003' }), createMockClient({ id: 'C003' })),
];
phaseUI.updateQuests(mockQuests2);
```

**期待結果**:
- [x] 最初のカードのdestroy()が呼ばれる
- [x] questCards配列の要素数が1になる
- [x] 新しいカードが作成される

**検証方法**:
```typescript
expect(firstCards[0].destroy).toHaveBeenCalledTimes(1);
expect(firstCards[1].destroy).toHaveBeenCalledTimes(1);
expect(phaseUI['questCards'].length).toBe(1);
expect(phaseUI['questCards'][0]).not.toBe(firstCards[0]);
```

---

## 4. 統合テスト

### 4.1 T-0022-01: 依頼表示

| 項目 | 内容 |
|------|------|
| **テストID** | T-0022-01 |
| **優先度** | 高 |
| **信頼性** | 🔵 |
| **テストケース名** | 依頼表示統合テスト |

**目的**: QuestAcceptPhaseUIに日次依頼を渡すと、すべての依頼カードが表示される

**前提条件**:
- Phaserシーンモックが準備されている
- QuestServiceから日次依頼が取得できる

**テスト手順**:
```typescript
// 1. テストデータ準備
const mockScene = createMockScene();
const mockEventBus = createMockEventBus();
mockScene.data.get = vi.fn().mockReturnValue(mockEventBus);

// 2. QuestServiceから日次依頼を取得（モック）
const dailyQuests = [
  new Quest(createMockQuest({ id: 'Q001', clientId: 'C001' }), createMockClient({ id: 'C001' })),
  new Quest(createMockQuest({ id: 'Q002', clientId: 'C002' }), createMockClient({ id: 'C002' })),
  new Quest(createMockQuest({ id: 'Q003', clientId: 'C003' }), createMockClient({ id: 'C003' })),
];

// 3. QuestAcceptPhaseUIを作成
const phaseUI = new QuestAcceptPhaseUI(mockScene);
phaseUI.create();

// 4. 依頼リストを更新
phaseUI.updateQuests(dailyQuests);
```

**期待結果**:
- [x] QuestAcceptPhaseUIが正しく初期化される
- [x] 3つのQuestCardUIが作成される
- [x] すべてのカードが正しい位置に配置される
- [x] 各カードに依頼者名、報酬情報、受注ボタンが表示される

**検証方法**:
```typescript
expect(phaseUI).toBeDefined();
expect(phaseUI['questCards'].length).toBe(3);
expect(phaseUI['questCards'][0].container.x).toBe(200);
expect(phaseUI['questCards'][0].container.y).toBe(150);
expect(phaseUI['questCards'][1].container.x).toBe(500);
expect(phaseUI['questCards'][2].container.x).toBe(800);
```

---

### 4.2 T-0022-02: 受注ボタン

| 項目 | 内容 |
|------|------|
| **テストID** | T-0022-02 |
| **優先度** | 高 |
| **信頼性** | 🔵 |
| **テストケース名** | 受注ボタン統合テスト |

**目的**: 依頼カードの「受注する」ボタンをクリックすると、QUEST_ACCEPTEDイベントが発行される

**前提条件**:
- QuestAcceptPhaseUIが初期化されている
- 依頼リストが更新されている

**テスト手順**:
```typescript
// 1. テストデータ準備
const mockQuest = new Quest(
  createMockQuest({ id: 'Q001', clientId: 'C001' }),
  createMockClient({ id: 'C001' })
);
phaseUI.updateQuests([mockQuest]);

// 2. 受注ボタンをクリック
const questCard = phaseUI['questCards'][0];
const acceptButton = questCard['acceptButton'];
acceptButton.emit('pointerdown');
```

**期待結果**:
- [x] EventBus.emit()が呼ばれる
- [x] イベント名はGameEventType.QUEST_ACCEPTED
- [x] ペイロードに{ quest: mockQuest }が含まれる

**検証方法**:
```typescript
expect(mockEventBus.emit).toHaveBeenCalledTimes(1);
expect(mockEventBus.emit).toHaveBeenCalledWith(
  GameEventType.QUEST_ACCEPTED,
  { quest: mockQuest }
);
```

---

### 4.3 T-0022-03: 受注後表示更新

| 項目 | 内容 |
|------|------|
| **テストID** | T-0022-03 |
| **優先度** | 高 |
| **信頼性** | 🔵 |
| **テストケース名** | 受注後表示更新統合テスト |

**目的**: QUEST_ACCEPTEDイベント発行後、受注済みリスト（ScrollablePanel）に依頼が追加される

**前提条件**:
- QuestAcceptPhaseUIが初期化されている
- 依頼リストが更新されている
- EventBusのQUEST_ACCEPTEDイベントを購読している

**テスト手順**:
```typescript
// 1. テストデータ準備
const mockQuest = new Quest(
  createMockQuest({ id: 'Q001', clientId: 'C001', baseContribution: 50, baseGold: 100 }),
  createMockClient({ id: 'C001', name: '村人' })
);
phaseUI.updateQuests([mockQuest]);

// 2. 受注処理を実行
const questCard = phaseUI['questCards'][0];
const acceptButton = questCard['acceptButton'];
acceptButton.emit('pointerdown');

// 3. EventBusのQUEST_ACCEPTEDイベントをトリガー（手動）
// 実際にはEventBusが他のリスナーに通知するが、テストでは手動でトリガー
phaseUI['onQuestAccepted']({ quest: mockQuest });
```

**期待結果**:
- [x] 受注済みリストに依頼が追加される
- [x] 受注済みリストに「村人の依頼」が表示される
- [x] 受注済みリストの件数が1件になる

**検証方法**:
```typescript
const acceptedList = phaseUI['acceptedList'];
expect(acceptedList).toBeDefined();
// ScrollablePanelの子要素を確認
expect(acceptedList.childOuter.length).toBe(1);
```

**Note**: 実際の実装では、受注済みリストの更新はEventBus経由で別のコンポーネント（SidebarUI等）が担当する可能性がある。その場合、このテストではQuestAcceptPhaseUI内部での処理のみをテストする。

---

### 4.4 T-0022-04: スキップ

| 項目 | 内容 |
|------|------|
| **テストID** | T-0022-04 |
| **優先度** | 中 |
| **信頼性** | 🟡 |
| **テストケース名** | 次フェーズへ遷移統合テスト |

**目的**: 「次のフェーズへ」ボタンをクリックすると、PHASE_TRANSITION_REQUESTEDイベントが発行される

**前提条件**:
- QuestAcceptPhaseUIが初期化されている
- 「次のフェーズへ」ボタンが表示されている

**テスト手順**:
```typescript
// 1. テストデータ準備
phaseUI.create();

// 2. 次フェーズボタンを取得（存在する場合）
const nextPhaseButton = phaseUI['nextPhaseButton'];
if (!nextPhaseButton) {
  console.warn('nextPhaseButton is not implemented in QuestAcceptPhaseUI');
  return;
}

// 3. ボタンをクリック
nextPhaseButton.emit('pointerdown');
```

**期待結果**:
- [x] EventBus.emit()が呼ばれる
- [x] イベント名はGameEventType.PHASE_TRANSITION_REQUESTED
- [x] ペイロードに{ from: 'quest_accept', to: 'gathering' }が含まれる

**検証方法**:
```typescript
expect(mockEventBus.emit).toHaveBeenCalledWith(
  GameEventType.PHASE_TRANSITION_REQUESTED,
  { from: 'quest_accept', to: 'gathering' }
);
```

**Note**: 「次のフェーズへ」ボタンがQuestAcceptPhaseUIに実装されていない場合（FooterUIで実装されている場合）、このテストはスキップまたは別のコンポーネントでテストする。

---

## 5. エッジケースとエラーケース

### 5.1 メモリリーク防止

#### TC-201: イベントリスナーのクリーンアップ
**目的**: destroy()時にすべてのイベントリスナーが解除されること

| 項目 | 内容 |
|------|------|
| **テストID** | TC-201 |
| **優先度** | 高 |
| **信頼性** | 🔵 |
| **テストケース名** | イベントリスナーのクリーンアップ |

**前提条件**:
- QuestAcceptPhaseUIが初期化されている
- 依頼カードにイベントリスナーが設定されている

**テスト手順**:
```typescript
// 1. テストデータ準備
const mockQuests = [
  new Quest(createMockQuest({ id: 'Q001' }), createMockClient({ id: 'C001' })),
];
phaseUI.updateQuests(mockQuests);
const questCard = phaseUI['questCards'][0];

// 2. イベントリスナーの数を記録
const initialListenerCount = questCard['acceptButton'].listenerCount('pointerdown');

// 3. destroy()呼び出し
phaseUI.destroy();

// 4. イベントリスナーの数を確認
const finalListenerCount = questCard['acceptButton'].listenerCount('pointerdown');
```

**期待結果**:
- [x] destroy()後にイベントリスナーが解除される
- [x] リスナー数が0になる

**検証方法**:
```typescript
expect(initialListenerCount).toBeGreaterThan(0);
expect(finalListenerCount).toBe(0);
```

---

#### TC-202: GameObjectsの完全破棄
**目的**: destroy()時にすべてのGameObjectsが破棄され、参照が残らないこと

| 項目 | 内容 |
|------|------|
| **テストID** | TC-202 |
| **優先度** | 高 |
| **信頼性** | 🔵 |
| **テストケース名** | GameObjectsの完全破棄 |

**前提条件**:
- QuestAcceptPhaseUIが初期化されている
- 依頼カードが作成されている

**テスト手順**:
```typescript
// 1. テストデータ準備
const mockQuests = [
  new Quest(createMockQuest({ id: 'Q001' }), createMockClient({ id: 'C001' })),
  new Quest(createMockQuest({ id: 'Q002' }), createMockClient({ id: 'C002' })),
];
phaseUI.updateQuests(mockQuests);

// 2. destroy()呼び出し
phaseUI.destroy();
```

**期待結果**:
- [x] すべてのQuestCardUIのdestroy()が呼ばれる
- [x] questCards配列が空になる
- [x] container.destroy()が呼ばれる
- [x] acceptedList.destroy()が呼ばれる
- [x] すべてのGameObjectsの参照がnullまたは削除される

**検証方法**:
```typescript
expect(phaseUI['questCards'].length).toBe(0);
expect(phaseUI.container.active).toBe(false); // 破棄されたGameObjectはactiveがfalseになる
if (phaseUI['acceptedList']) {
  expect(phaseUI['acceptedList'].active).toBe(false);
}
```

---

### 5.2 不正なイベント発行の防止

#### TC-203: 重複イベント発行の防止
**目的**: 同じ依頼に対して複数回受注ボタンをクリックしても、イベントは1回だけ発行されること

| 項目 | 内容 |
|------|------|
| **テストID** | TC-203 |
| **優先度** | 中 |
| **信頼性** | 🟡 |
| **テストケース名** | 重複イベント発行の防止 |

**前提条件**:
- QuestAcceptPhaseUIが初期化されている
- 依頼カードが作成されている

**テスト手順**:
```typescript
// 1. テストデータ準備
const mockQuest = new Quest(
  createMockQuest({ id: 'Q001' }),
  createMockClient({ id: 'C001' })
);
phaseUI.updateQuests([mockQuest]);
const questCard = phaseUI['questCards'][0];
const acceptButton = questCard['acceptButton'];

// 2. 受注ボタンを3回クリック
acceptButton.emit('pointerdown');
acceptButton.emit('pointerdown');
acceptButton.emit('pointerdown');
```

**期待結果**:
- [x] EventBus.emit()が1回だけ呼ばれる
- [x] 2回目以降のクリックは無視される
- [x] 受注ボタンが非活性化される（オプション）

**検証方法**:
```typescript
expect(mockEventBus.emit).toHaveBeenCalledTimes(1);
```

**Note**: 実際の実装では、受注済みの依頼カードは非活性化またはボタンを無効化することで重複クリックを防止する。

---

#### TC-204: 無効なイベントペイロードの防止
**目的**: イベント発行時に、必須のペイロードが含まれていることを確認する

| 項目 | 内容 |
|------|------|
| **テストID** | TC-204 |
| **優先度** | 中 |
| **信頼性** | 🟡 |
| **テストケース名** | 無効なイベントペイロードの防止 |

**前提条件**:
- QuestAcceptPhaseUIが初期化されている

**テスト手順**:
```typescript
// 1. テストデータ準備
const mockQuest = new Quest(
  createMockQuest({ id: 'Q001' }),
  createMockClient({ id: 'C001' })
);

// 2. onAcceptQuest()を直接呼び出し
phaseUI['onAcceptQuest'](mockQuest);
```

**期待結果**:
- [x] EventBus.emit()が呼ばれる
- [x] ペイロードに{ quest }が含まれる
- [x] questがnullまたはundefinedでない

**検証方法**:
```typescript
expect(mockEventBus.emit).toHaveBeenCalledWith(
  GameEventType.QUEST_ACCEPTED,
  expect.objectContaining({
    quest: expect.objectContaining({
      id: 'Q001',
    }),
  })
);
```

---

## 6. パフォーマンステスト

### 6.1 フェーズ初期化時間

#### TC-301: フェーズ初期化パフォーマンス
**目的**: create()メソッドが100ms以内に完了すること

| 項目 | 内容 |
|------|------|
| **テストID** | TC-301 |
| **優先度** | 低 |
| **信頼性** | 🟡 |
| **テストケース名** | フェーズ初期化パフォーマンス |

**前提条件**:
- Phaserシーンモックが準備されている

**テスト手順**:
```typescript
// 1. テストデータ準備
const mockScene = createMockScene();

// 2. 初期化時間を計測
const startTime = performance.now();
const phaseUI = new QuestAcceptPhaseUI(mockScene);
phaseUI.create();
const endTime = performance.now();

const elapsedTime = endTime - startTime;
```

**期待結果**:
- [x] 初期化時間が100ms以内

**検証方法**:
```typescript
expect(elapsedTime).toBeLessThan(100);
```

**Note**: このテストはCI環境では不安定になる可能性があるため、ローカル環境でのみ実行することを推奨。

---

## 7. モックヘルパー関数

### 7.1 createMockScene

```typescript
/**
 * Phaserシーンのモックを作成
 */
function createMockScene(): Phaser.Scene {
  const mockScene = {
    add: {
      container: vi.fn().mockReturnValue({
        add: vi.fn(),
        setDepth: vi.fn(),
        destroy: vi.fn(),
        x: 0,
        y: 0,
        active: true,
      }),
      text: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
        active: true,
      }),
      rectangle: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        off: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
        emit: vi.fn(),
        listenerCount: vi.fn().mockReturnValue(0),
        active: true,
      }),
    },
    tweens: {
      add: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
      }),
    },
    data: {
      get: vi.fn().mockReturnValue(null),
    },
    plugins: {
      get: vi.fn().mockReturnValue({
        add: {
          sizer: vi.fn(),
        },
      }),
    },
  } as any;

  return mockScene;
}
```

---

### 7.2 createMockQuest

```typescript
/**
 * Questモックデータを作成
 */
function createMockQuest(overrides?: Partial<IQuest>): IQuest {
  return {
    id: 'Q001',
    clientId: 'C001',
    type: QuestType.SPECIFIC,
    targetId: 'healing-potion',
    baseContribution: 50,
    baseGold: 100,
    deadline: 3,
    difficulty: QuestDifficulty.EASY,
    dialogue: 'これは依頼のセリフです',
    status: QuestStatus.AVAILABLE,
    ...overrides,
  };
}
```

---

### 7.3 createMockClient

```typescript
/**
 * Clientモックデータを作成
 */
function createMockClient(overrides?: Partial<IClient>): IClient {
  return {
    id: 'C001',
    name: '村人',
    type: ClientType.VILLAGER,
    icon: '👤',
    ...overrides,
  };
}
```

---

### 7.4 createMockEventBus

```typescript
/**
 * EventBusのモックを作成
 */
function createMockEventBus(): IEventBus {
  return {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
  } as any;
}
```

---

## 8. テスト実行コマンド

### 8.1 すべてのテストを実行

```bash
npm run test
```

### 8.2 特定のファイルのテストを実行

```bash
npm run test -- QuestCardUI.test.ts
npm run test -- QuestAcceptPhaseUI.test.ts
```

### 8.3 カバレッジレポート生成

```bash
npm run test:coverage
```

### 8.4 ウォッチモード

```bash
npm run test:watch
```

---

## 9. テスト実行チェックリスト

### 9.1 QuestCardUIコンポーネント

- [ ] TC-001: カード初期化と表示
- [ ] TC-002: 受注ボタンクリック処理
- [ ] TC-003: インタラクティブ動作（ホバー）
- [ ] TC-004: リソース解放
- [ ] TC-005: 無効なconfig（null）
- [ ] TC-006: 無効なconfig.quest（undefined）
- [ ] TC-007: 無効なonAccept（関数以外）
- [ ] TC-008: 長いテキストの依頼内容
- [ ] TC-009: 空文字列の依頼者名
- [ ] TC-010: 報酬0の依頼

### 9.2 QuestAcceptPhaseUIコンポーネント

- [ ] TC-101: フェーズUI初期化
- [ ] TC-102: 依頼リスト更新（通常ケース）
- [ ] TC-103: 依頼受注処理
- [ ] TC-104: リソース解放
- [ ] TC-105: EventBus未初期化
- [ ] TC-106: 無効なデータ（null依頼リスト）
- [ ] TC-107: イベント発行失敗（EventBusエラー）
- [ ] TC-108: 依頼0件
- [ ] TC-109: 依頼最大件数（7件）
- [ ] TC-110: 依頼リスト更新時の既存カード破棄

### 9.3 統合テスト

- [ ] T-0022-01: 依頼表示
- [ ] T-0022-02: 受注ボタン
- [ ] T-0022-03: 受注後表示更新
- [ ] T-0022-04: スキップ

### 9.4 エッジケースとエラーケース

- [ ] TC-201: イベントリスナーのクリーンアップ
- [ ] TC-202: GameObjectsの完全破棄
- [ ] TC-203: 重複イベント発行の防止
- [ ] TC-204: 無効なイベントペイロードの防止

### 9.5 パフォーマンステスト

- [ ] TC-301: フェーズ初期化パフォーマンス

---

## 10. テストカバレッジ目標

| カテゴリ | 目標カバレッジ | 現在のカバレッジ |
|---------|---------------|-----------------|
| **QuestCardUI** | 90%+ | - |
| **QuestAcceptPhaseUI** | 90%+ | - |
| **統合テスト** | 80%+ | - |
| **全体** | 85%+ | - |

---

## 11. 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-18 | 1.0.0 | 初版作成 |
