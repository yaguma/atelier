# TASK-0021: カードUIコンポーネント - TDD要件定義書

**作成日**: 2026-01-18
**タスクID**: TASK-0021
**要件名**: atelier-guild-rank
**機能名**: カードUIコンポーネント
**信頼性評価**: 🔵 高信頼性（設計文書・実装ファイルに基づく）

---

## 重要な注意事項

**すべてのファイルパスは、プロジェクトルートを基準とした相対パスで記載しています。**
**絶対パス（/Users/... や C:\\... など）は使用していません。**

---

## 1. 機能の概要

### 1.1 機能の目的

- 🔵 **何をする機能か**: ゲーム内で使用されるカードの視覚的表現を提供するUIコンポーネント
- 🔵 **どのような問題を解決するか**: プレイヤーが手札のカードを視覚的に識別し、インタラクティブに操作できるようにする
- 🔵 **想定されるユーザー**: プレイヤー（メインゲーム画面、採取・調合・納品フェーズで使用）
- 🔵 **システム内での位置づけ**: Presentation層のUIコンポーネント（MainSceneのフッターUIで使用）

**参照したEARS要件**:
- 要件定義書 4.1 カード系統（3系統）: 採取地カード、レシピカード、強化カード
- 要件定義書 3.5 共通操作: 手札を確認する

**参照した設計文書**:
- `docs/design/atelier-guild-rank/architecture-phaser.md`: 6.2 カスタムUIコンポーネント（CardView）
- `docs/design/atelier-guild-rank/ui-design/screens/common-components.md`: 5.3.2 手札表示エリア（hand-display）
- `docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md`: 2.2 CardUIコンポーネント

---

## 2. 入力・出力の仕様

### 2.1 CardUIコンポーネント

#### 入力パラメータ

🔵 **CardUIConfig型定義**（実装ファイルに基づく）

```typescript
interface CardUIConfig {
  card: Card;              // 🔵 表示するカードエンティティ（必須）
  x: number;               // 🔵 X座標（必須）
  y: number;               // 🔵 Y座標（必須）
  interactive?: boolean;   // 🟡 インタラクティブにするか（デフォルト: false）
  onClick?: (card: Card) => void;  // 🟡 クリック時のコールバック
}
```

**パラメータ詳細**:

| パラメータ | 型 | 必須 | 制約 | デフォルト | 信頼性 |
|-----------|-----|------|------|----------|--------|
| `card` | Card | ✅ | Cardエンティティ | - | 🔵 |
| `x` | number | ✅ | - | - | 🔵 |
| `y` | number | ✅ | - | - | 🔵 |
| `interactive` | boolean | ❌ | - | false | 🟡 |
| `onClick` | function | ❌ | (card: Card) => void | undefined | 🟡 |

**参照した設計文書**:
- `atelier-guild-rank/src/presentation/ui/components/CardUI.ts`: 行14-28（CardUIConfig定義）
- `docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md`: 2.2 CardUIコンポーネント

#### 出力値

🔵 **CardUIインスタンス**

| メソッド | 戻り値の型 | 説明 | 信頼性 |
|---------|----------|------|--------|
| `getCard()` | Card | カードエンティティを取得 | 🔵 |
| `getContainer()` | Phaser.GameObjects.Container | Phaserコンテナを取得 | 🔵 |
| `destroy()` | void | コンポーネントを破棄 | 🔵 |

**参照した設計文書**:
- `atelier-guild-rank/src/presentation/ui/components/CardUI.ts`: 行270-287（公開メソッド）

#### 表示内容

🔵 **カードの視覚的構成要素**

| 要素 | 説明 | データソース | 信頼性 |
|------|------|-------------|--------|
| **背景** | カードタイプ別の色分け（採取=緑、調合=ピンク、強化=青） | `card.type` | 🔵 |
| **アイコン** | 80x80pxのプレースホルダー | 固定値 | 🔵 |
| **名前** | カード名（14px Bold） | `card.name` | 🔵 |
| **コスト** | "⚡ 1" 形式（12px） | `card.cost` | 🔵 |
| **効果** | 効果説明（10px） | カードタイプに応じて生成 | 🔵 |

**カードタイプ別の背景色**:

```typescript
// 🔵 カードタイプごとの背景色（実装ファイルに基づく）
GATHERING: 0x90ee90,    // LightGreen - 採取カード
RECIPE: 0xffb6c1,       // LightPink - レシピカード
ENHANCEMENT: 0xadd8e6,  // LightBlue - 強化カード
```

**参照した設計文書**:
- `atelier-guild-rank/src/presentation/ui/components/CardUI.ts`: 行100-111（getCardTypeColor）
- `docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md`: 2.1 カードデザイン

### 2.2 HandDisplayコンポーネント

#### 入力パラメータ

🔵 **HandDisplayConfig型定義**（実装ファイルに基づく）

```typescript
interface HandDisplayConfig {
  x: number;               // 🔵 X座標（必須）
  y: number;               // 🔵 Y座標（必須）
  cards: Card[];           // 🔵 手札のカード配列（必須）
  onCardClick?: (card: Card, index: number) => void;  // 🟡 クリック時のコールバック
}
```

**パラメータ詳細**:

| パラメータ | 型 | 必須 | 制約 | デフォルト | 信頼性 |
|-----------|-----|------|------|----------|--------|
| `x` | number | ✅ | - | - | 🔵 |
| `y` | number | ✅ | - | - | 🔵 |
| `cards` | Card[] | ✅ | 最大5枚まで | - | 🔵 |
| `onCardClick` | function | ❌ | (card: Card, index: number) => void | undefined | 🟡 |

**参照した設計文書**:
- `atelier-guild-rank/src/presentation/ui/components/HandDisplay.ts`: 行15-27（HandDisplayConfig定義）

#### 出力値

🔵 **HandDisplayインスタンス**

| メソッド | 戻り値の型 | 説明 | 信頼性 |
|---------|----------|------|--------|
| `setSelectedIndex(index)` | void | 選択中のカードインデックスを設定 | 🔵 |
| `getSelectedIndex()` | number \| null | 選択中のカードインデックスを取得 | 🔵 |
| `getSelectedCard()` | Card \| null | 選択中のカードを取得 | 🔵 |
| `updateCards(cards)` | void | 手札のカード配列を更新 | 🔵 |
| `getCardCount()` | number | 手札のカード枚数を取得 | 🔵 |
| `destroy()` | void | コンポーネントを破棄 | 🔵 |

**参照した設計文書**:
- `atelier-guild-rank/src/presentation/ui/components/HandDisplay.ts`: 行118-245（公開メソッド）

#### レイアウト仕様

🔵 **手札の配置**

```
[カード1] [カード2] [カード3] [カード4] [カード5]
   ↑140px↑    ↑140px↑    ↑140px↑    ↑140px↑
```

| 要素 | 値 | 信頼性 |
|------|-----|--------|
| カード間スペーシング | 140px | 🔵 |
| 最大手札枚数 | 5枚 | 🔵 |
| 配置基準 | 中央揃え | 🔵 |
| 選択時の移動 | Y座標 -20px | 🔵 |

**参照した設計文書**:
- `atelier-guild-rank/src/presentation/ui/components/HandDisplay.ts`: 行43-44（定数定義）
- `docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md`: 2.3 手札表示コンポーネント

### 2.3 データフロー

🔵 **CardUIコンポーネントのデータフロー**

```
Card (Domain Entity)
  ↓
CardUIConfig
  ↓
CardUI.create()
  ↓ (カードタイプに応じた色分け)
  ├── Background (Rectangle)
  ├── Icon (Placeholder)
  ├── NameText (Text)
  ├── CostText (Text)
  └── EffectText (Text)
  ↓ (インタラクティブモード)
  ├── Hover (Scale 1.1倍)
  └── Click (onClickコールバック実行)
```

🔵 **HandDisplayコンポーネントのデータフロー**

```
Card[] (手札配列)
  ↓
HandDisplayConfig
  ↓
HandDisplay.createCardUIs()
  ↓ (各カードにCardUIを生成)
  ├── CardUI [0] (x: -280)
  ├── CardUI [1] (x: -140)
  ├── CardUI [2] (x: 0)
  ├── CardUI [3] (x: 140)
  └── CardUI [4] (x: 280)
  ↓ (カード選択時)
  ├── setSelectedIndex(index)
  ├── highlightCard(index) (Y座標 -20px)
  └── onCardClickコールバック実行
```

**参照した設計文書**:
- `docs/design/atelier-guild-rank/architecture-phaser.md`: 8.1 連携パターン

---

## 3. 制約条件

### 3.1 アーキテクチャ制約

🔵 **Phaserフレームワーク制約**

| 項目 | 制約内容 | 理由 | 信頼性 |
|------|---------|------|--------|
| **DOM要素** | 使用不可 | `dom.createContainer: false` | 🔵 |
| **描画方式** | Canvas/WebGLのみ | Phaserネイティブ描画 | 🔵 |
| **UIライブラリ** | rexUIプラグインに依存 | 共通UI構築のため | 🔵 |
| **継承** | BaseComponentを継承 | 共通ライフサイクル管理 | 🔵 |

**参照した設計文書**:
- `docs/design/atelier-guild-rank/architecture-phaser.md`: 5.1 基本設定（dom.createContainer: false）
- `docs/implements/atelier-guild-rank/TASK-0021/note.md`: 2.2 プロジェクト固有のルール

🔵 **コンポーネント制約**

| 項目 | 制約内容 | 理由 | 信頼性 |
|------|---------|------|--------|
| **基底クラス** | BaseComponent継承必須 | create()とdestroy()の実装義務 | 🔵 |
| **レイヤー深度** | Content レイヤー (depth: 100) | 描画順序の管理 | 🔵 |
| **メモリ管理** | destroy()で全GameObjectsを破棄 | メモリリーク防止 | 🔵 |

**参照した設計文書**:
- `docs/implements/atelier-guild-rank/TASK-0021/note.md`: 2.2.1 BaseComponentの継承
- `docs/implements/atelier-guild-rank/TASK-0021/note.md`: 2.2.2 UIレイヤー構成

### 3.2 パフォーマンス要件

🔵 **レンダリング最適化**

| 項目 | 要件 | 信頼性 |
|------|------|--------|
| **更新頻度** | 値変更時のみ更新 | 🔵 |
| **アニメーション** | Tweenを使用（滑らかな動き） | 🔵 |
| **オブジェクトプール** | 大量表示時に検討 | 🟡 |

**参照した設計文書**:
- `docs/implements/atelier-guild-rank/TASK-0021/note.md`: 5.2.2 レンダリング最適化

🔵 **メモリ管理要件**

```typescript
// 🔵 destroy()メソッドで必須の破棄処理
public destroy(): void {
  // すべてのGameObjectsを破棄
  this.background?.destroy();
  this.iconPlaceholder?.destroy();
  this.nameText?.destroy();
  this.costText?.destroy();
  this.effectText?.destroy();

  // イベントリスナーを削除
  this.background?.off('pointerover');
  this.background?.off('pointerout');
  this.background?.off('pointerdown');

  // コンテナを破棄
  this.container?.destroy();
}
```

**参照した設計文書**:
- `atelier-guild-rank/src/presentation/ui/components/CardUI.ts`: 行246-268（destroy実装）
- `docs/implements/atelier-guild-rank/TASK-0021/note.md`: 5.2.1 メモリ管理

### 3.3 デザイン制約

🔵 **カードの寸法**

| 要素 | サイズ | 信頼性 |
|------|--------|--------|
| カード全体 | 120px × 160px | 🔵 |
| アイコンエリア | 80px × 80px | 🔵 |
| パディング | 8px | 🔵 |
| 枠線 | 2px（#333333） | 🔵 |

**参照した設計文書**:
- `atelier-guild-rank/src/presentation/ui/components/CardUI.ts`: 行49-52（定数定義）
- `docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md`: 2.1 カードデザイン

🔵 **手札の制約**

| 項目 | 値 | 信頼性 |
|------|-----|--------|
| 最大手札枚数 | 5枚 | 🔵 |
| カード間スペーシング | 140px | 🔵 |
| 選択時の移動量 | Y座標 -20px | 🔵 |

**参照した設計文書**:
- `atelier-guild-rank/src/presentation/ui/components/HandDisplay.ts`: 行43-44
- `docs/spec/atelier-guild-rank-requirements.md`: 5.1 初期パラメータ（手札上限: 7枚 ※表示は5枚まで）

### 3.4 データベース制約

🟡 **Cardエンティティとの連携**

| 項目 | 制約内容 | 信頼性 |
|------|---------|--------|
| **カードデータ** | Cardエンティティ経由でのみアクセス | 🔵 |
| **カードマスター** | `card.master`経由で静的データにアクセス | 🔵 |
| **カードタイプ** | `card.type` で 'GATHERING' \| 'RECIPE' \| 'ENHANCEMENT' | 🔵 |

**参照した設計文書**:
- `atelier-guild-rank/src/domain/entities/Card.ts`: 行29-142（Cardエンティティ）
- `docs/implements/atelier-guild-rank/TASK-0021/note.md`: 5.1.2 カードエンティティとの連携

---

## 4. 想定される使用例

### 4.1 基本的な使用パターン

🔵 **CardUIの基本使用**

```typescript
// カードエンティティを取得
const card = new Card('card-001', gatheringCardMaster);

// CardUIを生成
const cardUI = new CardUI(scene, {
  card: card,
  x: 100,
  y: 200,
  interactive: true,
  onClick: (clickedCard) => {
    console.log('カードがクリックされました:', clickedCard.name);
  },
});

// カードUIをシーンに追加
scene.add.existing(cardUI.getContainer());

// 不要になったら破棄
cardUI.destroy();
```

**参照した設計文書**:
- `atelier-guild-rank/src/presentation/ui/components/CardUI.ts`: 行54-70（コンストラクタ）

🔵 **HandDisplayの基本使用**

```typescript
// 手札のカード配列を用意
const handCards = [
  new Card('card-001', gatheringCardMaster1),
  new Card('card-002', recipeCardMaster1),
  new Card('card-003', enhancementCardMaster1),
];

// HandDisplayを生成
const handDisplay = new HandDisplay(scene, {
  x: 640,  // 画面中央
  y: 600,
  cards: handCards,
  onCardClick: (card, index) => {
    console.log(`カード ${index} がクリックされました:`, card.name);
    handDisplay.setSelectedIndex(index);
  },
});

// シーンに追加
scene.add.existing(handDisplay.container);

// 選択中のカードを取得
const selectedCard = handDisplay.getSelectedCard();

// 不要になったら破棄
handDisplay.destroy();
```

**参照した設計文書**:
- `atelier-guild-rank/src/presentation/ui/components/HandDisplay.ts`: 行46-65（コンストラクタ）

### 4.2 エッジケース

🔵 **E-001: カードが指定されていない**

```typescript
// ❌ 不正なケース
const cardUI = new CardUI(scene, {
  card: null,  // cardが必須
  x: 100,
  y: 200,
});
// 期待される結果: Error('CardUI: card is required')
```

**参照した設計文書**:
- `atelier-guild-rank/src/presentation/ui/components/CardUI.ts`: 行57-60（バリデーション）

🔵 **E-002: 手札枚数が上限を超える**

```typescript
// ❌ 不正なケース
const handDisplay = new HandDisplay(scene, {
  x: 640,
  y: 600,
  cards: [card1, card2, card3, card4, card5, card6],  // 6枚（上限5枚）
});
// 期待される結果: Error('HandDisplay: cards array exceeds maximum size of 5')
```

**参照した設計文書**:
- `atelier-guild-rank/src/presentation/ui/components/HandDisplay.ts`: 行55-59（バリデーション）

🔵 **E-003: 手札の更新時に上限を超える**

```typescript
const handDisplay = new HandDisplay(scene, config);

// ❌ 不正なケース
handDisplay.updateCards([card1, card2, card3, card4, card5, card6]);
// 期待される結果: Error('HandDisplay: cards array exceeds maximum size of 5')
```

**参照した設計文書**:
- `atelier-guild-rank/src/presentation/ui/components/HandDisplay.ts`: 行198-203（updateCards バリデーション）

🟡 **E-004: インタラクティブでないカードをクリック**

```typescript
const cardUI = new CardUI(scene, {
  card: card,
  x: 100,
  y: 200,
  interactive: false,  // インタラクティブ無効
  onClick: (clickedCard) => {
    console.log('この処理は実行されない');
  },
});

// ユーザーがカードをクリック
// 期待される結果: 何も起こらない（onClickは呼ばれない）
```

**参照した設計文書**:
- `atelier-guild-rank/src/presentation/ui/components/CardUI.ts`: 行210-241（setupInteraction）

### 4.3 エラーケース

🔵 **ER-001: destroy後の操作**

```typescript
const cardUI = new CardUI(scene, config);
cardUI.destroy();

// ❌ 破棄後の操作
const card = cardUI.getCard();  // 期待される結果: 不正な参照エラー
```

**参照した設計文書**:
- `atelier-guild-rank/src/presentation/ui/components/CardUI.ts`: 行246-268（destroy実装）

🔵 **ER-002: 手札配列が空**

```typescript
// ⚠️ 警告ケース（エラーではないが、空の手札表示）
const handDisplay = new HandDisplay(scene, {
  x: 640,
  y: 600,
  cards: [],  // 空の配列
});
// 期待される結果: 正常に動作するが、カードは表示されない
```

**参照した設計文書**:
- `atelier-guild-rank/src/presentation/ui/components/HandDisplay.ts`: 行46-65（空配列の許容）

🟡 **ER-003: カードタイプが未知の値**

```typescript
const card = new Card('card-999', {
  type: 'UNKNOWN',  // 未知のタイプ
  name: 'テストカード',
  cost: 1,
});

const cardUI = new CardUI(scene, {
  card: card,
  x: 100,
  y: 200,
});

// 期待される結果: 白色（0xffffff）の背景で表示される
```

**参照した設計文書**:
- `atelier-guild-rank/src/presentation/ui/components/CardUI.ts`: 行100-111（getCardTypeColor のデフォルト処理）

### 4.4 アニメーションケース

🔵 **A-001: ホバー時の拡大**

```typescript
const cardUI = new CardUI(scene, {
  card: card,
  x: 100,
  y: 200,
  interactive: true,
});

// ユーザーがカードにマウスオーバー
// 期待される結果: カードが1.1倍に拡大（100ms、Power2イージング）
```

**参照した設計文書**:
- `atelier-guild-rank/src/presentation/ui/components/CardUI.ts`: 行216-224（pointerover イベント）

🔵 **A-002: カード選択時の移動**

```typescript
const handDisplay = new HandDisplay(scene, config);

// カード選択
handDisplay.setSelectedIndex(2);

// 期待される結果: カード[2]がY座標 -20px に移動（150ms、Power2イージング）
```

**参照した設計文書**:
- `atelier-guild-rank/src/presentation/ui/components/HandDisplay.ts`: 行145-151（highlightCard）

🔵 **A-003: 選択解除時の復帰**

```typescript
const handDisplay = new HandDisplay(scene, config);

// カード選択 → 別のカードを選択
handDisplay.setSelectedIndex(2);
handDisplay.setSelectedIndex(3);

// 期待される結果:
// - カード[2]がY座標 0 に戻る（150ms、Power2イージング）
// - カード[3]がY座標 -20px に移動（150ms、Power2イージング）
```

**参照した設計文書**:
- `atelier-guild-rank/src/presentation/ui/components/HandDisplay.ts`: 行122-133（setSelectedIndex）

---

## 5. EARS要件・設計文書との対応関係

### 5.1 参照したユーザストーリー

🔵 **該当するユーザストーリー**:
- プレイヤーは手札のカードを視覚的に確認したい
- プレイヤーはカードをクリックして選択したい
- プレイヤーはカードの種類（採取・レシピ・強化）を色で識別したい

**参照元**:
- `docs/spec/atelier-guild-rank-requirements.md`: 3.5 共通操作（手札を確認する）

### 5.2 参照した機能要件

🔵 **該当する機能要件**:
- REQ-UI-001: カードは120x160pxのサイズで表示される
- REQ-UI-002: カードタイプごとに背景色が異なる（採取=緑、調合=ピンク、強化=青）
- REQ-UI-003: カードにはアイコン、名前、コスト、効果が表示される
- REQ-UI-004: インタラクティブモードでは、カードのホバー時に1.1倍に拡大される
- REQ-UI-005: 手札は最大5枚まで横並びで表示される
- REQ-UI-006: 選択中のカードは上に20px移動して強調表示される

**参照元**:
- `docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md`: 2.2 CardUIコンポーネント
- `docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md`: 2.3 手札表示コンポーネント

### 5.3 参照した非機能要件

🔵 **該当する非機能要件**:
- NFR-PERF-001: カードUIの更新は値変更時のみ行う
- NFR-PERF-002: アニメーションはTweenを使用して滑らかに実行する
- NFR-MEM-001: destroy()メソッドで必ずすべてのGameObjectsを破棄する
- NFR-ARCH-001: すべてのUIコンポーネントはBaseComponentを継承する

**参照元**:
- `docs/implements/atelier-guild-rank/TASK-0021/note.md`: 5.2 パフォーマンス要件
- `docs/implements/atelier-guild-rank/TASK-0021/note.md`: 2.2.1 BaseComponentの継承

### 5.4 参照したEdgeケース

🔵 **該当するEdgeケース**:
- EDGE-UI-001: cardがnullまたはundefinedの場合、エラーをスローする
- EDGE-UI-002: 手札枚数が5枚を超える場合、エラーをスローする
- EDGE-UI-003: interactiveがfalseの場合、クリックイベントは発火しない
- EDGE-UI-004: 未知のカードタイプの場合、白色の背景で表示する

**参照元**:
- `atelier-guild-rank/src/presentation/ui/components/CardUI.ts`: 行57-60（バリデーション）
- `atelier-guild-rank/src/presentation/ui/components/HandDisplay.ts`: 行55-59（バリデーション）

### 5.5 参照した受け入れ基準

🔵 **該当する受け入れ基準**:
- ✅ カードが正しく表示される
- ✅ カードタイプで色が異なる（採取=緑、調合=ピンク、強化=青）
- ✅ クリックでコールバック実行
- ✅ 手札が横並びで表示される
- ✅ 選択中のカードが強調表示される
- ✅ ホバー時にカードが拡大される

**参照元**:
- `docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md`: 3.1 必須条件

### 5.6 参照した設計文書

#### アーキテクチャ

🔵 **参照したアーキテクチャ設計**:
- `docs/design/atelier-guild-rank/architecture-phaser.md`: 6.2 カスタムUIコンポーネント
- `docs/design/atelier-guild-rank/architecture-phaser.md`: 5.1 基本設定（Phaser設定）

#### データフロー

🔵 **参照したデータフロー**:
- `docs/design/atelier-guild-rank/architecture-phaser.md`: 8.1 連携パターン（EventBusとの連携）

#### 型定義

🔵 **参照した型定義**:
- `atelier-guild-rank/src/presentation/ui/components/CardUI.ts`: CardUIConfig
- `atelier-guild-rank/src/presentation/ui/components/HandDisplay.ts`: HandDisplayConfig
- `atelier-guild-rank/src/domain/entities/Card.ts`: Card エンティティ

#### UI設計

🔵 **参照したUI設計**:
- `docs/design/atelier-guild-rank/ui-design/screens/common-components.md`: 5.3.2 手札表示エリア
- `docs/implements/atelier-guild-rank/TASK-0021/note.md`: 4.1 カードデザイン仕様
- `docs/implements/atelier-guild-rank/TASK-0021/note.md`: 4.4 インタラクション設計

---

## 6. テストケース対応表

### 6.1 統合テスト（タスクファイルに記載）

| テストID | テスト内容 | 期待結果 | 対応する要件 | 信頼性 |
|---------|----------|----------|-------------|--------|
| T-0021-01 | カード表示 | 正しいデザインで表示される | REQ-UI-001, REQ-UI-003 | 🔵 |
| T-0021-02 | タイプ別色 | 採取=緑、調合=ピンク、強化=青 | REQ-UI-002 | 🔵 |
| T-0021-03 | 手札表示 | 5枚横並びで表示される | REQ-UI-005 | 🔵 |
| T-0021-04 | カード選択 | 選択中カードが強調表示される | REQ-UI-006 | 🔵 |

**参照元**:
- `docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md`: 4.1 統合テスト

### 6.2 実装済みテストケース（推奨）

🟡 **今後作成すべきテストケース**:

| テストID | テスト内容 | 期待結果 | 対応する要件 | 信頼性 |
|---------|----------|----------|-------------|--------|
| T-CARD-UI-001 | CardUI生成 | 正常に生成される | REQ-UI-001 | 🟡 |
| T-CARD-UI-002 | カードがnull | エラーをスロー | EDGE-UI-001 | 🟡 |
| T-CARD-UI-003 | 採取カードの色 | 緑色(0x90ee90) | REQ-UI-002 | 🟡 |
| T-CARD-UI-004 | レシピカードの色 | ピンク色(0xffb6c1) | REQ-UI-002 | 🟡 |
| T-CARD-UI-005 | 強化カードの色 | 青色(0xadd8e6) | REQ-UI-002 | 🟡 |
| T-CARD-UI-006 | 未知のカードタイプ | 白色(0xffffff) | EDGE-UI-004 | 🟡 |
| T-CARD-UI-007 | インタラクティブ有効 | ホバー時に拡大 | REQ-UI-004 | 🟡 |
| T-CARD-UI-008 | インタラクティブ無効 | ホバー時に何も起こらない | EDGE-UI-003 | 🟡 |
| T-CARD-UI-009 | クリックイベント | onClickが実行される | REQ-UI-004 | 🟡 |
| T-CARD-UI-010 | destroy呼び出し | 全GameObjectsが破棄される | NFR-MEM-001 | 🟡 |
| T-HAND-001 | HandDisplay生成 | 正常に生成される | REQ-UI-005 | 🟡 |
| T-HAND-002 | 手札が空 | 空の手札が表示される | ER-002 | 🟡 |
| T-HAND-003 | 手札が5枚 | 5枚横並びで表示される | REQ-UI-005 | 🟡 |
| T-HAND-004 | 手札が6枚 | エラーをスロー | EDGE-UI-002 | 🟡 |
| T-HAND-005 | カード選択 | 選択中カードが上に移動 | REQ-UI-006 | 🟡 |
| T-HAND-006 | 選択解除 | カードが元の位置に戻る | REQ-UI-006 | 🟡 |
| T-HAND-007 | updateCards | 手札が更新される | - | 🟡 |
| T-HAND-008 | destroy呼び出し | 全CardUIが破棄される | NFR-MEM-001 | 🟡 |

---

## 7. 実装ファイル

### 7.1 対象ファイル

| ファイルパス | 説明 | 信頼性 |
|-------------|------|--------|
| `atelier-guild-rank/src/presentation/ui/components/CardUI.ts` | CardUIコンポーネント（実装済み） | 🔵 |
| `atelier-guild-rank/src/presentation/ui/components/HandDisplay.ts` | HandDisplayコンポーネント（実装済み） | 🔵 |
| `atelier-guild-rank/src/presentation/ui/components/BaseComponent.ts` | 基底クラス（実装済み） | 🔵 |
| `atelier-guild-rank/src/domain/entities/Card.ts` | Cardエンティティ（実装済み） | 🔵 |
| `atelier-guild-rank/src/presentation/ui/theme.ts` | テーマ定義（実装済み） | 🔵 |

### 7.2 テストファイル（推奨）

| ファイルパス | 説明 | 信頼性 |
|-------------|------|--------|
| `atelier-guild-rank/src/presentation/ui/components/CardUI.spec.ts` | CardUIのユニットテスト（未作成） | 🟡 |
| `atelier-guild-rank/src/presentation/ui/components/HandDisplay.spec.ts` | HandDisplayのユニットテスト（未作成） | 🟡 |

---

## 8. 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-18 | 1.0.0 | 初版作成（TDD要件整理） |

---

**作成者**: Claude (Zundamon)
**最終更新**: 2026-01-18
