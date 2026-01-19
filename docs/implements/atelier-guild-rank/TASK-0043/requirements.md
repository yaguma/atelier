# TDD要件定義書: 依頼詳細モーダル・受注アニメーション

**タスクID**: TASK-0043
**作成日**: 2026-01-20
**要件名**: atelier-guild-rank
**信頼性レベル**: 🟡 黄信号（TASK-0022の推奨条件より）
**フェーズ**: Phase 5 - UI強化・ポリッシュ

---

## 1. 機能概要

依頼カードをクリックした際に詳細情報を表示するモーダルと、依頼受注時のアニメーションを実装する。ユーザーが依頼内容を十分に理解してから受注できるようにする。モーダル表示中は背景の操作を無効化し、ESCキーでモーダルを閉じられるようにする。

---

## 2. 完了条件

- [ ] 依頼詳細モーダル実装
- [ ] モーダル開閉アニメーション
- [ ] 受注成功アニメーション
- [ ] 受注後のカード移動アニメーション
- [ ] 単体テスト実装

---

## 3. 機能要件

### FR-001: 依頼詳細モーダル表示

**EARS記法**: EVENT-DRIVEN

**信頼性**: 🟡

**説明**: 依頼カードをクリックすると、依頼の詳細情報を表示するモーダルを表示する。

**トリガー**: ユーザーが依頼カード（QuestCardUI）をクリック

**入力**:
- quest: Quest - 表示する依頼エンティティ
- onAccept: (quest: Quest) => void - 受注時のコールバック
- onClose: () => void - モーダルを閉じる時のコールバック

**出力**:
- モーダルUIの表示

**制約**:
- モーダルは画面中央に表示すること
- 依頼者情報（アイコン + 名前）を表示すること
- 依頼内容（アイテム名 ×数量 (品質以上)）を表示すること
- 期限（〜日以内）を表示すること
- 報酬詳細（ゴールド / 貢献度）を表示すること
- 難易度表示（星）を表示すること
- 「受注する」ボタンと「閉じる」ボタンを表示すること

---

### FR-002: モーダルオーバーレイ

**EARS記法**: EVENT-DRIVEN

**信頼性**: 🟡

**説明**: モーダル表示時に半透明のオーバーレイを表示し、背景の操作を無効化する。

**トリガー**: QuestDetailModalのcreate()呼び出し

**入力**:
- なし

**出力**:
- 半透明オーバーレイの表示
- 背景インタラクションの無効化

**制約**:
- オーバーレイ色: 黒（0x000000）、alpha: 0.7
- オーバーレイは画面全体を覆うこと
- オーバーレイクリックでモーダルを閉じられること
- depth値はモーダルパネルより低くすること（depth: 900推奨）

---

### FR-003: モーダル開くアニメーション

**EARS記法**: EVENT-DRIVEN

**信頼性**: 🟡

**説明**: モーダルを開く際にスムーズなアニメーションを再生する。

**トリガー**: QuestDetailModal.create()呼び出し後

**入力**:
- なし

**出力**:
- オーバーレイのフェードインアニメーション
- パネルのスケールインアニメーション

**制約**:
- オーバーレイフェードイン: alpha 0→0.7, duration: 200ms
- パネルスケールイン: scale 0.8→1, alpha 0→1, duration: 300ms, ease: Back.easeOut
- アニメーション中は重複クリックを防止すること

---

### FR-004: モーダル閉じるアニメーション

**EARS記法**: EVENT-DRIVEN

**信頼性**: 🟡

**説明**: モーダルを閉じる際にスムーズなアニメーションを再生する。

**トリガー**: 「閉じる」ボタンクリック、オーバーレイクリック、またはESCキー押下

**入力**:
- なし

**出力**:
- パネルのスケールアウトアニメーション
- オーバーレイのフェードアウトアニメーション
- アニメーション完了後にモーダルを破棄

**制約**:
- パネルスケールアウト: scale 1→0.8, alpha 1→0, duration: 200ms, ease: Power2
- オーバーレイフェードアウト: alpha 0.7→0, duration: 200ms
- アニメーション完了後にonCloseコールバックを実行すること
- アニメーション中は重複クリックを防止すること

---

### FR-005: ESCキーでモーダルを閉じる

**EARS記法**: EVENT-DRIVEN

**信頼性**: 🟡

**説明**: ESCキーを押すとモーダルを閉じる。

**トリガー**: ESCキー押下（モーダル表示中）

**入力**:
- キーボードイベント（keyCode: Phaser.Input.Keyboard.KeyCodes.ESC）

**出力**:
- モーダル閉じるアニメーション開始

**制約**:
- モーダル表示中のみESCキーを受け付けること
- キーボードイベントリスナーはdestroy()時に解除すること
- 他のキーボード入力とコンフリクトしないこと

---

### FR-006: 受注成功アニメーション

**EARS記法**: EVENT-DRIVEN

**信頼性**: 🟡

**説明**: 「受注する」ボタンをクリックすると、受注成功を示すアニメーションを再生する。

**トリガー**: 「受注する」ボタンクリック

**入力**:
- quest: Quest - 受注する依頼

**出力**:
- 「受注完了！」テキスト表示アニメーション
- パネル縮小消失アニメーション
- onAcceptコールバック実行

**制約**:
- 「受注完了！」テキスト: fontSize 32px, color #00FF00 (緑), fontStyle bold
- テキストアニメーション: scale 1→1.5, alpha 1→0, y: -50, duration: 500ms
- パネル縮小: scale 1→0, alpha 1→0, duration: 300ms, delay: 200ms
- アニメーション完了後にonAcceptコールバックを実行すること
- アニメーション中は重複クリックを防止すること

---

### FR-007: 受注後のカード移動アニメーション

**EARS記法**: EVENT-DRIVEN

**信頼性**: 🟡

**説明**: 依頼受注後、依頼カードがサイドバーへ移動するアニメーションを再生する。

**トリガー**: 受注成功アニメーション完了後（QUEST_ACCEPTEDイベント発行後）

**入力**:
- card: QuestCardUI - 移動するカード
- targetY: number - サイドバーでの配置Y座標

**出力**:
- カードがサイドバー位置へ移動
- カードがスケールダウン

**制約**:
- サイドバーX座標: 80px
- スケール: 1.0→0.6
- duration: 400ms
- ease: Power2
- アニメーション完了後にサイドバーリストを更新すること

---

### FR-008: アニメーション中の重複クリック防止

**EARS記法**: STATE

**信頼性**: 🟡

**説明**: アニメーション再生中は、ボタンやオーバーレイのクリックを無効化する。

**状態**: isAnimating: boolean

**入力**:
- クリックイベント

**出力**:
- isAnimating === true の場合、クリックイベントを無視

**制約**:
- アニメーション開始時に isAnimating = true に設定
- アニメーション完了時に isAnimating = false に設定
- すべてのインタラクティブ要素でisAnimating状態をチェックすること

---

### FR-009: 難易度表示

**EARS記法**: UBIQUITOUS

**信頼性**: 🟡

**説明**: 依頼の難易度を星の数で表示する。

**入力**:
- difficulty: QuestDifficulty (1-5)

**出力**:
- 星の表示（例: ★★★☆☆ for difficulty 3）

**制約**:
- 星の最大数: 5
- 塗りつぶし星: ★（色: #FFD700 ゴールド）
- 空白星: ☆（色: #CCCCCC グレー）
- フォントサイズ: 16px

---

### FR-010: リソース破棄

**EARS記法**: EVENT-DRIVEN

**信頼性**: 🟡

**説明**: QuestDetailModalのリソースを解放する。

**トリガー**: destroy()呼び出し

**入力**:
- なし

**出力**:
- すべてのGameObjectsの破棄
- イベントリスナーの解除
- タイマーのキャンセル

**制約**:
- オーバーレイ、パネル、テキスト、ボタンをすべて破棄
- ESCキーイベントリスナーを解除
- 進行中のTweenをキャンセル
- メモリリークを発生させないこと

---

## 4. 非機能要件

### NFR-001: パフォーマンス

**カテゴリ**: パフォーマンス

**説明**: モーダルの表示・非表示はゲームのフレームレートに影響を与えない。

**基準**:
- モーダル表示処理は1フレーム（16ms）以内に完了
- アニメーション中も60fps維持
- メモリリークを発生させない

---

### NFR-002: 深度管理

**カテゴリ**: 表示優先度

**説明**: モーダルとオーバーレイは他のUI要素より前面に表示される。

**基準**:
- オーバーレイdepth: 900
- パネルdepth: 1000
- 「受注完了！」テキストdepth: 1100（最前面）
- 他のUI要素（HeaderUI, SidebarUI等）より上に表示されること

---

### NFR-003: 保守性

**カテゴリ**: 保守性

**説明**: コードはClean Architectureに従い、presentation層に配置される。

**基準**:
- ファイル配置: `src/presentation/ui/components/QuestDetailModal.ts`
- BaseComponentを継承
- 他層への依存なし（Domain/Applicationに依存しない）
- アニメーション定数は定数として定義

---

### NFR-004: テスタビリティ

**カテゴリ**: テスト容易性

**説明**: 単体テストで十分にテスト可能な設計とする。

**基準**:
- Phaserモックとの互換性
- アニメーションのモックテスト可能
- カバレッジ80%以上

---

### NFR-005: ユーザビリティ

**カテゴリ**: ユーザビリティ

**説明**: ユーザーが直感的に操作できるUIを提供する。

**基準**:
- モーダル外クリックで閉じられること
- ESCキーで閉じられること
- ボタンはホバー時にカーソルが変化すること
- アニメーションがスムーズであること

---

## 5. インターフェース定義

### 入力インターフェース

```typescript
/**
 * 依頼詳細モーダル設定
 */
export interface QuestDetailModalConfig {
  /** 表示する依頼 */
  quest: Quest;
  /** 受注時のコールバック */
  onAccept: (quest: Quest) => void;
  /** モーダルを閉じる時のコールバック */
  onClose: () => void;
}
```

### 出力インターフェース

```typescript
/**
 * QuestDetailModal クラス
 * 依頼詳細表示とモーダル制御を担当
 */
export class QuestDetailModal extends BaseComponent {
  /**
   * コンストラクタ
   * @param scene - Phaserシーン
   * @param config - モーダル設定
   */
  constructor(scene: Phaser.Scene, config: QuestDetailModalConfig);

  /**
   * UIコンポーネント初期化
   * オーバーレイ、パネル、コンテンツ、ボタンを作成し、開くアニメーションを再生
   */
  create(): void;

  /**
   * モーダルを閉じる
   * 閉じるアニメーションを再生し、完了後に破棄
   */
  close(): void;

  /**
   * リソースを破棄
   * すべてのGameObjectsとイベントリスナーを解放
   */
  destroy(): void;

  /**
   * アニメーション中かどうか
   */
  isAnimating(): boolean;
}
```

### 内部メソッド

```typescript
/**
 * オーバーレイ作成
 */
private createOverlay(): void;

/**
 * パネル作成
 */
private createPanel(): void;

/**
 * コンテンツ作成（依頼者情報、依頼内容、期限、報酬、難易度）
 */
private createContent(): void;

/**
 * ボタン作成（受注ボタン、閉じるボタン）
 */
private createButtons(): void;

/**
 * 開くアニメーション再生
 */
private playOpenAnimation(): void;

/**
 * 閉じるアニメーション再生
 * @param callback - アニメーション完了後のコールバック
 */
private playCloseAnimation(callback: () => void): void;

/**
 * 受注成功アニメーション再生
 * @param callback - アニメーション完了後のコールバック
 */
private playAcceptAnimation(callback: () => void): void;

/**
 * ESCキーイベントの設定
 */
private setupKeyboardEvents(): void;

/**
 * 難易度を星表示にフォーマット
 * @param difficulty - 難易度（1-5）
 * @returns 星の文字列（例: ★★★☆☆）
 */
private formatDifficulty(difficulty: number): string;

/**
 * 依頼内容をフォーマット
 * @param quest - 依頼エンティティ
 * @returns フォーマットされた依頼内容文字列
 */
private formatQuestRequirements(quest: Quest): string;
```

---

## 6. エラーケース

| エラーコード | 条件 | 処理 |
|------------|------|------|
| ERR-001 | configがnull/undefined | Errorをスロー |
| ERR-002 | config.questがnull/undefined | Errorをスロー |
| ERR-003 | config.onAcceptが関数でない | Errorをスロー |
| ERR-004 | config.onCloseが関数でない | Errorをスロー |
| ERR-005 | sceneがnull/undefined | BaseComponentでErrorをスロー |
| ERR-006 | アニメーション中にクリック | イベントを無視（エラーなし） |
| ERR-007 | 既に閉じているモーダルでclose()呼び出し | 何もしない（エラーなし） |

---

## 7. 依存関係

### 外部依存

- **Phaser 3** (3.87+): ゲームエンジン本体
  - Phaser.Scene: シーン管理
  - Phaser.GameObjects.Container: UIコンテナ
  - Phaser.GameObjects.Rectangle: オーバーレイ、パネル背景
  - Phaser.GameObjects.Text: テキスト表示
  - Phaser.Input.Keyboard: キーボードイベント
  - Phaser.Tweens: アニメーション

### 内部依存

- **BaseComponent**: `@presentation/ui/components/BaseComponent` - 基底クラス
- **Quest**: `@domain/entities/Quest` - 依頼エンティティ（型のみ）
- **QuestCardUI**: `@presentation/ui/components/QuestCardUI` - カード移動アニメーション連携

### 参照（依存ではない）

- `src/presentation/ui/theme.ts`: カラーパレット・スタイル定義

---

## 8. テスト戦略

### テスト対象

1. **モーダル初期化**
   - 正常なconfigでモーダルが作成される
   - 無効なconfigでエラーがスローされる

2. **モーダル表示**
   - create()でオーバーレイとパネルが作成される
   - 依頼情報が正しく表示される
   - 難易度が正しく星表示される

3. **アニメーション**
   - 開くアニメーションが正しく再生される
   - 閉じるアニメーションが正しく再生される
   - 受注成功アニメーションが正しく再生される

4. **インタラクション**
   - 「受注する」ボタンクリックでonAcceptが呼ばれる
   - 「閉じる」ボタンクリックでモーダルが閉じる
   - オーバーレイクリックでモーダルが閉じる
   - ESCキーでモーダルが閉じる

5. **重複クリック防止**
   - アニメーション中のクリックが無視される

6. **リソース管理**
   - destroy()でリソースが解放される
   - イベントリスナーが解除される

### テスト除外

- **実際のPhaser描画**: Phaserの内部レンダリング処理はテスト対象外
- **実際のTweenアニメーション**: Tweenの内部処理はモックでテスト

### モック対象

- **Phaser.Scene**: シーンのモック
- **Phaser.GameObjects.Container**: コンテナのモック
- **Phaser.GameObjects.Rectangle**: 背景のモック
- **Phaser.GameObjects.Text**: テキストのモック
- **Phaser.Tweens.Tween**: Tweenのモック
- **Phaser.Input.Keyboard.KeyboardManager**: キーボードのモック

---

## 9. 設計上の注意点

### 9.1 アニメーション定数の管理

```typescript
// アニメーション定数
private static readonly OVERLAY_FADE_DURATION = 200;
private static readonly PANEL_SCALE_DURATION = 300;
private static readonly SUCCESS_TEXT_DURATION = 500;
private static readonly CARD_MOVE_DURATION = 400;
private static readonly OVERLAY_ALPHA = 0.7;
private static readonly PANEL_INITIAL_SCALE = 0.8;
```

### 9.2 depth管理

- オーバーレイ: depth 900
- パネル: depth 1000
- 「受注完了！」テキスト: depth 1100

### 9.3 アニメーション状態管理

```typescript
private _isAnimating = false;

public isAnimating(): boolean {
  return this._isAnimating;
}

private setAnimating(value: boolean): void {
  this._isAnimating = value;
}
```

### 9.4 イベントリスナーのクリーンアップ

```typescript
private escKey?: Phaser.Input.Keyboard.Key;

private setupKeyboardEvents(): void {
  this.escKey = this.scene.input.keyboard?.addKey(
    Phaser.Input.Keyboard.KeyCodes.ESC
  );
  this.escKey?.on('down', this.handleEscKey, this);
}

destroy(): void {
  this.escKey?.off('down', this.handleEscKey, this);
  // ...
}
```

### 9.5 QuestCardUIとの連携

QuestCardUIの`onAccept`コールバックの代わりに、カードクリック時にモーダルを開き、モーダル内の「受注する」ボタンで受注処理を行う。

```typescript
// QuestAcceptPhaseUIでの使用例
const card = new QuestCardUI(this.scene, {
  quest,
  x,
  y,
  interactive: true,
  onCardClick: (quest) => this.openQuestDetailModal(quest),
  onAccept: (quest) => this.onAcceptQuest(quest),
});
```

---

## 10. 受け入れ基準

### AC-001: モーダル表示

**Given**: 依頼カードが表示されている
**When**: 依頼カードをクリックする
**Then**: 依頼詳細モーダルがアニメーション付きで表示される

---

### AC-002: モーダル内容表示

**Given**: 依頼詳細モーダルが表示されている
**When**: モーダルの内容を確認する
**Then**: 依頼者名、依頼内容、期限、報酬、難易度が正しく表示されている

---

### AC-003: 受注ボタンクリック

**Given**: 依頼詳細モーダルが表示されている
**When**: 「受注する」ボタンをクリックする
**Then**: 受注成功アニメーションが再生され、onAcceptコールバックが呼ばれる

---

### AC-004: 閉じるボタンクリック

**Given**: 依頼詳細モーダルが表示されている
**When**: 「閉じる」ボタンをクリックする
**Then**: モーダルがアニメーション付きで閉じ、onCloseコールバックが呼ばれる

---

### AC-005: オーバーレイクリック

**Given**: 依頼詳細モーダルが表示されている
**When**: オーバーレイ部分をクリックする
**Then**: モーダルがアニメーション付きで閉じる

---

### AC-006: ESCキーで閉じる

**Given**: 依頼詳細モーダルが表示されている
**When**: ESCキーを押す
**Then**: モーダルがアニメーション付きで閉じる

---

### AC-007: アニメーション中の重複クリック防止

**Given**: モーダルが開くアニメーション中
**When**: 「閉じる」ボタンをクリックする
**Then**: クリックは無視され、アニメーションが完了するまで待機

---

### AC-008: カード移動アニメーション

**Given**: 依頼を受注した
**When**: 受注成功アニメーションが完了する
**Then**: 依頼カードがサイドバーへ移動するアニメーションが再生される

---

### AC-009: リソース解放

**Given**: 依頼詳細モーダルが表示されている
**When**: destroy()を呼び出す
**Then**: すべてのGameObjectsが破棄され、イベントリスナーが解除される

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-20 | 1.0.0 | 初版作成 |
