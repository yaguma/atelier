# Phase 2: ドメイン層

**フェーズ期間**: 約18日（144時間）
**タスク数**: 18タスク（TASK-0084 〜 TASK-0101）
**目標**: ゲームルールをドメインロジックとして実装
**成果物**: エンティティ、ドメインサービス、ゲーム状態管理

---

## フェーズ概要

ゲームの核となるビジネスロジック（ドメイン層）を実装する。
エンティティ、バリューオブジェクト、ドメインサービスを定義し、
ゲームルールをコードとして表現する。

---

## 週次計画

### Week 1（TASK-0084〜0089）
- **目標**: 全エンティティの実装
- **成果物**:
  - カード、素材、アイテムエンティティ
  - 依頼、ランク、アーティファクトエンティティ

### Week 2（TASK-0090〜0095）
- **目標**: 基本ドメインサービスの実装
- **成果物**:
  - デッキ、インベントリサービス
  - ドラフト採取、調合、品質計算サービス
  - 依頼判定サービス

### Week 3（TASK-0096〜0101）
- **目標**: ゲーム進行関連サービスの実装
- **成果物**:
  - ランク管理、昇格試験サービス
  - ショップサービス
  - ゲーム状態、プレイヤー状態、イベント定義

---

## タスク詳細

### TASK-0084: カードエンティティ 🔵

- [x] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0077
**設計参照**: [interfaces.ts](../design/atelier-guild-rank/interfaces.ts)
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD

#### テストケース

```typescript
describe('Card Entity', () => {
  describe('GatheringCard', () => {
    it('採取地カードを生成できる');
    it('コストを取得できる');
    it('獲得可能素材リストを取得できる');
    it('確率に基づいて素材を決定できる');
  });

  describe('RecipeCard', () => {
    it('レシピカードを生成できる');
    it('必要素材リストを取得できる');
    it('完成アイテムを取得できる');
  });

  describe('EnhancementCard', () => {
    it('強化カードを生成できる');
    it('効果を適用できる');
  });
});
```

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] 3種類のカードエンティティが実装されている
- [ ] 不変オブジェクトとして設計されている

#### 完了条件

- GatheringCard、RecipeCard、EnhancementCardの3種類のエンティティが実装されている
- 各カードは不変オブジェクトとして設計されている
- interfaces.tsの型定義に準拠している
- 全テストケースが通過する

---

### TASK-0085: 素材エンティティ 🔵

- [x] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0078
**設計参照**: [interfaces.ts](../design/atelier-guild-rank/interfaces.ts)
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD

#### テストケース

```typescript
describe('Material Entity', () => {
  it('素材を生成できる');
  it('カテゴリを取得できる');
  it('レアリティを取得できる');
  it('品質を持つ素材を生成できる');
  it('同一素材の比較ができる');
});
```

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] 素材エンティティが実装されている
- [ ] 品質値（S/A/B/C/D）を扱える

#### 完了条件

- Materialエンティティが実装されている
- カテゴリ、レアリティ、品質値の管理ができる
- 品質値（S/A/B/C/D）の変換・比較が正しく動作する
- 全テストケースが通過する

---

### TASK-0086: アイテムエンティティ 🔵

- [x] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0079
**設計参照**: [interfaces.ts](../design/atelier-guild-rank/interfaces.ts)
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD

#### テストケース

```typescript
describe('Item Entity', () => {
  it('アイテムを生成できる');
  it('品質を取得できる');
  it('対応依頼カテゴリを取得できる');
  it('売却価格を計算できる');
  it('品質による効果補正を取得できる');
});
```

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] アイテムエンティティが実装されている
- [ ] 品質に応じた効果・価格計算ができる

#### 完了条件

- Itemエンティティが実装されている
- 品質ランク（S/A/B/C/D）に応じた効果・価格計算ができる
- 対応依頼カテゴリの取得が正しく動作する
- 全テストケースが通過する

---

### TASK-0087: 依頼エンティティ 🔵

- [x] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0080
**設計参照**: [interfaces.ts](../design/atelier-guild-rank/interfaces.ts)
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD

#### テストケース

```typescript
describe('Quest Entity', () => {
  it('依頼を生成できる');
  it('難易度を取得できる');
  it('必要アイテムリストを取得できる');
  it('報酬（ゴールド）を取得できる');
  it('報酬（貢献度）を取得できる');
  it('期限を取得できる');
  it('期限切れ判定ができる');
});
```

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] 依頼エンティティが実装されている
- [ ] 期限管理ができる

#### 完了条件

- Questエンティティが実装されている
- 難易度、必要アイテム、報酬（ゴールド・貢献度）の管理ができる
- 期限管理と期限切れ判定が正しく動作する
- 全テストケースが通過する

---

### TASK-0088: ランクエンティティ 🔵

- [x] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0081
**設計参照**: [interfaces.ts](../design/atelier-guild-rank/interfaces.ts), [core-systems.md](../design/atelier-guild-rank/core-systems.md)
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD

#### テストケース

```typescript
describe('Rank Entity', () => {
  it('ランクを生成できる');
  it('ランク順序を比較できる');
  it('昇格ゲージ最大値を取得できる');
  it('次ランクを取得できる');
  it('最高ランク（S）で次ランクはnull');
  it('昇格試験内容を取得できる');
});
```

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] G〜Sランクが正しく順序付けられている
- [ ] 昇格試験情報を保持できる

#### 完了条件

- Rankエンティティが実装されている
- G→F→E→D→C→B→A→Sの順序比較が正しく動作する
- 各ランクの昇格ゲージ最大値と昇格試験情報を保持できる
- 全テストケースが通過する

---

### TASK-0089: アーティファクトエンティティ 🔵

- [x] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0082
**設計参照**: [interfaces.ts](../design/atelier-guild-rank/interfaces.ts)
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD

#### テストケース

```typescript
describe('Artifact Entity', () => {
  it('アーティファクトを生成できる');
  it('レアリティを取得できる');
  it('パッシブ効果を取得できる');
  it('効果タイプを判定できる');
  it('効果値を取得できる');
});
```

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] アーティファクトエンティティが実装されている
- [ ] パッシブ効果の適用ロジックが準備されている

#### 完了条件

- Artifactエンティティが実装されている
- レアリティとパッシブ効果の管理ができる
- 効果タイプ判定と効果値取得が正しく動作する
- 全テストケースが通過する

---

### TASK-0090: デッキドメインサービス 🔵

- [x] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0084
**設計参照**: [core-systems.md](../design/atelier-guild-rank/core-systems.md)
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD

#### テストケース

```typescript
describe('DeckService', () => {
  it('デッキにカードを追加できる');
  it('デッキからカードを削除できる');
  it('デッキ上限（30枚）を超えると追加できない');
  it('手札にカードをドローできる');
  it('手札からカードを使用できる');
  it('使用済みカードは捨て札に移動する');
  it('捨て札をシャッフルしてデッキに戻せる');
  it('初期デッキを生成できる');
});
```

#### 実装インターフェース

```typescript
interface IDeckService {
  addCard(deck: Deck, card: Card): Result<Deck>;
  removeCard(deck: Deck, cardId: string): Result<Deck>;
  draw(deck: Deck, count: number): Result<[Deck, Card[]]>;
  useCard(deck: Deck, cardId: string): Result<Deck>;
  shuffle(deck: Deck): Deck;
  createInitialDeck(): Deck;
}
```

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] デッキ操作のビジネスルールが正しく実装されている

#### 完了条件

- DeckServiceが実装されている
- カードの追加・削除・ドロー・使用が正しく動作する
- デッキ上限（30枚）チェックが正しく動作する
- 捨て札シャッフルと初期デッキ生成が正しく動作する
- 全テストケースが通過する

---

### TASK-0091: インベントリドメインサービス 🔵

- [x] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0085, TASK-0086
**設計参照**: [core-systems.md](../design/atelier-guild-rank/core-systems.md)
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD

#### テストケース

```typescript
describe('InventoryService', () => {
  it('素材を追加できる');
  it('素材を消費できる');
  it('素材保管上限を超えると追加できない');
  it('アイテムを追加できる');
  it('アイテムを消費できる');
  it('素材の所持数を取得できる');
  it('アイテムの所持数を取得できる');
});
```

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] 素材・アイテムの管理ができる
- [ ] 上限チェックが正しく動作する

#### 完了条件

- InventoryServiceが実装されている
- 素材・アイテムの追加・消費・所持数取得が正しく動作する
- 保管上限チェックが正しく動作する
- 全テストケースが通過する

---

### TASK-0092: ドラフト採取ドメインサービス 🔵

- [x] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0084, TASK-0085
**設計参照**: [game-mechanics.md](../design/atelier-guild-rank/game-mechanics.md)
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD

#### テストケース

```typescript
describe('DraftGatheringService', () => {
  it('ドラフトプールを生成できる');
  it('指定枚数のカードを選択できる');
  it('選択したカードから素材を獲得できる');
  it('確率に基づいて素材の獲得量が変動する');
  it('1ラウンドで選択できるカードは1枚');
  it('ラウンド数が正しくカウントされる');
  it('全ラウンド終了を判定できる');
});
```

#### ドラフトルール（設計書より）

- 1ターンに3ラウンド
- 各ラウンドで3枚のカードから1枚選択
- 選択したカードの素材を獲得
- 未選択カードは次ラウンドに持ち越し（新カード追加）

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] ドラフト採取のゲームルールが正しく実装されている

#### 完了条件

- DraftGatheringServiceが実装されている
- ドラフトプール生成（3枚から1枚選択）が正しく動作する
- ラウンド管理（1ターン3ラウンド）が正しく動作する
- 選択カードからの素材獲得が正しく動作する
- 全テストケースが通過する

---

### TASK-0093: 調合ドメインサービス 🔵

- [x] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0084, TASK-0085, TASK-0086
**設計参照**: [game-mechanics.md](../design/atelier-guild-rank/game-mechanics.md)
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD

#### テストケース

```typescript
describe('AlchemyService', () => {
  it('レシピカードと素材から調合できる');
  it('素材が不足していると調合できない');
  it('調合後に素材が消費される');
  it('品質が計算される');
  it('強化カードの効果が適用される');
  it('調合結果にアイテムが生成される');
});
```

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] 調合のビジネスルールが正しく実装されている

#### 完了条件

- AlchemyServiceが実装されている
- レシピカードと素材からの調合が正しく動作する
- 素材不足チェックと消費処理が正しく動作する
- 強化カード効果の適用が正しく動作する
- 全テストケースが通過する

---

### TASK-0094: 品質計算ドメインサービス 🔵

- [x] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0093
**設計参照**: [game-mechanics.md](../design/atelier-guild-rank/game-mechanics.md), [balance-design.md](../design/atelier-guild-rank/balance-design.md)
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD

#### テストケース

```typescript
describe('QualityCalculationService', () => {
  it('素材の品質平均から基本品質を計算できる');
  it('強化カードによる品質ボーナスを適用できる');
  it('アーティファクトによる品質ボーナスを適用できる');
  it('品質値からランク（S/A/B/C/D）を決定できる');
  it('品質上限（100）を超えない');
  it('品質下限（0）を下回らない');
});
```

#### 品質計算式（設計書より）

```
基本品質 = 素材品質の平均
最終品質 = 基本品質 + 強化ボーナス + アーティファクトボーナス

品質ランク:
  S: 90-100
  A: 70-89
  B: 50-69
  C: 30-49
  D: 0-29
```

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] 品質計算が設計書の仕様通りに動作する

#### 完了条件

- QualityCalculationServiceが実装されている
- 素材品質平均からの基本品質計算が正しく動作する
- 強化カード・アーティファクトによるボーナス適用が正しく動作する
- 品質値から品質ランク（S/A/B/C/D）への変換が正しく動作する
- 全テストケースが通過する

---

### TASK-0095: 依頼判定ドメインサービス 🔵

- [x] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0087, TASK-0086
**設計参照**: [game-mechanics.md](../design/atelier-guild-rank/game-mechanics.md)
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD

#### テストケース

```typescript
describe('QuestJudgmentService', () => {
  it('必要アイテムが揃っていれば納品できる');
  it('必要アイテムが不足していると納品できない');
  it('品質要件を満たしているか判定できる');
  it('納品成功時に報酬を計算できる');
  it('品質ボーナスを計算できる');
  it('期限切れ依頼はペナルティが発生する');
});
```

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] 依頼の納品判定が正しく動作する
- [ ] 報酬計算が正しく動作する

#### 完了条件

- QuestJudgmentServiceが実装されている
- 必要アイテム・品質要件の判定が正しく動作する
- 報酬計算（基本報酬+品質ボーナス）が正しく動作する
- 期限切れペナルティ処理が正しく動作する
- 全テストケースが通過する

---

### TASK-0096: ランク管理ドメインサービス 🔵

- [x] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0088
**設計参照**: [core-systems.md](../design/atelier-guild-rank/core-systems.md)
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD

#### テストケース

```typescript
describe('RankManagementService', () => {
  it('貢献度を加算できる');
  it('昇格ゲージが満タンになると昇格試験が発生する');
  it('ランク維持日数をカウントできる');
  it('ランク維持日数超過でゲームオーバー');
  it('Sランク到達でゲームクリア');
  it('現在ランクで受注可能な依頼を取得できる');
});
```

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] ランク昇格ルールが正しく実装されている
- [ ] ゲームクリア・ゲームオーバー条件が正しい

#### 完了条件

- RankManagementServiceが実装されている
- 貢献度加算と昇格ゲージ管理が正しく動作する
- ランク維持日数カウントとゲームオーバー判定が正しく動作する
- Sランク到達でのゲームクリア判定が正しく動作する
- 全テストケースが通過する

---

### TASK-0097: 昇格試験ドメインサービス 🔵

- [x] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0096
**設計参照**: [core-systems.md](../design/atelier-guild-rank/core-systems.md), [ui-design/screens/rank-up.md](../design/atelier-guild-rank/ui-design/screens/rank-up.md)
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD

#### テストケース

```typescript
describe('PromotionTestService', () => {
  it('昇格試験を開始できる');
  it('試験課題を取得できる');
  it('課題達成を判定できる');
  it('試験日数をカウントできる');
  it('制限日数内に課題達成で合格');
  it('制限日数超過で不合格（ゲームオーバー）');
  it('合格時に報酬（ゴールド、アーティファクト選択）を取得');
});
```

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] 昇格試験のルールが正しく実装されている

#### 完了条件

- PromotionTestServiceが実装されている
- 昇格試験の開始・課題取得・達成判定が正しく動作する
- 試験日数カウントと制限時間判定が正しく動作する
- 合格時報酬（ゴールド、アーティファクト選択）の取得が正しく動作する
- 全テストケースが通過する

---

### TASK-0098: ショップドメインサービス 🔵

- [x] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0084, TASK-0089
**設計参照**: [core-systems.md](../design/atelier-guild-rank/core-systems.md), [ui-design/screens/shop.md](../design/atelier-guild-rank/ui-design/screens/shop.md)
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD

#### テストケース

```typescript
describe('ShopService', () => {
  it('購入可能な商品リストを取得できる');
  it('ランクに応じて商品がフィルタされる');
  it('商品を購入できる');
  it('ゴールド不足で購入できない');
  it('購入時にゴールドが減少する');
  it('カード購入時にデッキに追加される');
  it('アーティファクト購入時にインベントリに追加される');
  it('素材購入時にインベントリに追加される');
});
```

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] ショップのビジネスルールが正しく実装されている

#### 完了条件

- ShopServiceが実装されている
- ランクに応じた商品フィルタリングが正しく動作する
- 購入処理（ゴールド消費、アイテム追加）が正しく動作する
- ゴールド不足チェックが正しく動作する
- 全テストケースが通過する

---

### TASK-0099: ゲーム状態エンティティ 🔵

- [x] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0083
**設計参照**: [data-schema.md](../design/atelier-guild-rank/data-schema.md)
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD

#### テストケース

```typescript
describe('GameState Entity', () => {
  it('ゲーム状態を生成できる');
  it('現在フェーズを取得できる');
  it('現在日数を取得できる');
  it('ゲーム進行状態を取得できる');
  it('ゲーム状態を更新できる（イミュータブル）');
});
```

#### ゲーム状態構造

```typescript
interface GameState {
  currentPhase: GamePhase;
  currentDay: number;
  isInPromotionTest: boolean;
  promotionTestDaysRemaining: number | null;
  gameProgress: GameProgress;
}

type GamePhase = 'QUEST_ACCEPT' | 'GATHERING' | 'ALCHEMY' | 'DELIVERY';
type GameProgress = 'IN_PROGRESS' | 'GAME_CLEAR' | 'GAME_OVER';
```

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] ゲーム状態が正しく管理できる

#### 完了条件

- GameStateエンティティが実装されている
- 現在フェーズ（QUEST_ACCEPT/GATHERING/ALCHEMY/DELIVERY）管理が正しく動作する
- 日数カウントと昇格試験中フラグの管理が正しく動作する
- イミュータブルな状態更新が正しく動作する
- 全テストケースが通過する

---

### TASK-0100: プレイヤー状態エンティティ 🔵

- [x] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0099
**設計参照**: [data-schema.md](../design/atelier-guild-rank/data-schema.md)
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD

#### テストケース

```typescript
describe('PlayerState Entity', () => {
  it('プレイヤー状態を生成できる');
  it('現在ランクを取得できる');
  it('所持ゴールドを取得できる');
  it('昇格ゲージを取得できる');
  it('所持アーティファクトを取得できる');
  it('行動ポイントを取得できる');
  it('プレイヤー状態を更新できる（イミュータブル）');
});
```

#### プレイヤー状態構造

```typescript
interface PlayerState {
  rank: RankId;
  gold: number;
  promotionGauge: number;
  promotionGaugeMax: number;
  rankDaysRemaining: number;
  artifacts: ArtifactId[];
  actionPoints: number;
  actionPointsMax: number;
}
```

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] プレイヤー状態が正しく管理できる

#### 完了条件

- PlayerStateエンティティが実装されている
- ランク、ゴールド、昇格ゲージ、行動ポイントの管理が正しく動作する
- アーティファクト所持管理が正しく動作する
- イミュータブルな状態更新が正しく動作する
- 全テストケースが通過する

---

### TASK-0101: ゲームイベント定義 🔵

- [x] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0099
**設計参照**: [architecture.md](../design/atelier-guild-rank/architecture.md)
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD

#### テストケース

```typescript
describe('GameEvents', () => {
  it('イベントを発行できる');
  it('イベントを購読できる');
  it('イベント購読を解除できる');
  it('複数のリスナーに通知できる');
});
```

#### イベント種類

```typescript
type GameEvent =
  | { type: 'PHASE_CHANGED'; payload: { phase: GamePhase } }
  | { type: 'DAY_ADVANCED'; payload: { day: number } }
  | { type: 'QUEST_ACCEPTED'; payload: { questId: string } }
  | { type: 'QUEST_COMPLETED'; payload: { questId: string; reward: Reward } }
  | { type: 'ITEM_CRAFTED'; payload: { item: Item } }
  | { type: 'RANK_UP_TEST_STARTED'; payload: { fromRank: RankId; toRank: RankId } }
  | { type: 'RANK_UP'; payload: { newRank: RankId } }
  | { type: 'GAME_CLEAR'; payload: {} }
  | { type: 'GAME_OVER'; payload: { reason: string } };
```

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] イベントバス/パブサブパターンが実装されている
- [ ] 型安全なイベント定義がされている

#### 完了条件

- GameEvent型とイベントバスが実装されている
- イベントの発行・購読・購読解除が正しく動作する
- 複数リスナーへの通知が正しく動作する
- 型安全なイベント定義（TypeScript discriminated union）が正しく動作する
- 全テストケースが通過する

---

## フェーズ完了基準

- [ ] 全18タスクが完了している
- [ ] 全テストが通過する
- [ ] カバレッジが80%以上
- [ ] ドメインロジックが設計書に準拠している
- [ ] ドキュメントが更新されている

---

## 次フェーズへの移行条件

1. 全タスクのチェックボックスが完了
2. CIでテストが通過
3. Phase 3の依存タスク（TASK-0090〜TASK-0101）が全て完了

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2026-01-02 | 1.0.0 | 初版作成 |
