# TASK-0021: カードUIコンポーネント - TDD Greenフェーズ記録

**作成日**: 2026-01-18
**タスクID**: TASK-0021
**要件名**: atelier-guild-rank
**機能名**: カードUIコンポーネント
**フェーズ**: Green（最小実装）

---

## 1. Greenフェーズ実行結果

### 1.1 実行状況

**実行日時**: 2026-01-18

**重要な注意事項**:
既に実装ファイル（CardUI.ts、HandDisplay.ts）が存在し、すべての機能が実装済みです。
TDDの理想的なGreenフェーズでは「失敗するテストを通す最小限の実装」を行いますが、
本タスクでは実装が先行しているため、Greenフェーズは実装の確認と品質評価を中心に行いました。

### 1.2 テスト実行結果

```bash
npm test -- src/presentation/ui/components/CardUI.spec.ts src/presentation/ui/components/HandDisplay.spec.ts
```

**結果**:
```
 ✓ src/presentation/ui/components/CardUI.spec.ts (15 tests) 21ms
 ✓ src/presentation/ui/components/HandDisplay.spec.ts (14 tests) 21ms

 Test Files  2 passed (2)
      Tests  29 passed (29)
   Duration  4.15s
```

**全テストケースが成功**: 実装が完了しており、すべてのテストが成功しています。

---

## 2. 実装内容

### 2.1 CardUIコンポーネント

**ファイル**: `atelier-guild-rank/src/presentation/ui/components/CardUI.ts`（289行）

#### 主要機能

1. **カードの視覚的表現**
   - 120x160pxのカードサイズ
   - カードタイプ別の背景色（採取=緑、レシピ=ピンク、強化=青）
   - アイコンプレースホルダー（80x80px）
   - カード名、コスト、効果テキストの表示

2. **インタラクティブ機能**
   - ホバー時の拡大エフェクト（1.1倍、100ms）
   - ホバー解除時の縮小エフェクト（1.0倍、100ms）
   - クリックイベントのコールバック

3. **メモリ管理**
   - destroy()メソッドによる適切なリソース解放
   - すべてのGameObjectsとコンテナの破棄

#### 実装のポイント

**カードタイプ別の色分け** (100-111行):
```typescript
private getCardTypeColor(): number {
  switch (this.card.type) {
    case 'GATHERING':
      return 0x90ee90; // LightGreen
    case 'RECIPE':
      return 0xffb6c1; // LightPink
    case 'ENHANCEMENT':
      return 0xadd8e6; // LightBlue
    default:
      return 0xffffff; // White (フォールバック)
  }
}
```
- 🔵 **信頼性レベル**: 高（要件定義書とタスクファイルに明記）
- **設計判断**: switch文のdefaultケースで白色を返し、未知のカードタイプでもエラーにならない安全設計

**ホバーアニメーション** (216-235行):
```typescript
// ホバー時の拡大エフェクト
this.background.on('pointerover', () => {
  this.scene.tweens.add({
    targets: this.container,
    scaleX: 1.1,
    scaleY: 1.1,
    duration: 100,
    ease: 'Power2',
  });
});

// ホバー解除時に元のサイズに戻す
this.background.on('pointerout', () => {
  this.scene.tweens.add({
    targets: this.container,
    scaleX: 1,
    scaleY: 1,
    duration: 100,
    ease: 'Power2',
  });
});
```
- 🔵 **信頼性レベル**: 高（要件定義書に明記）
- **設計判断**: Power2イージングで滑らかなアニメーションを実現

**エラーハンドリング** (57-60行):
```typescript
// バリデーション: cardが必須
if (!config.card) {
  throw new Error('CardUI: card is required');
}
```
- 🔵 **信頼性レベル**: 高（要件定義書に明記）
- **設計判断**: フェイルファストの原則に従い、不正な入力を早期検出

### 2.2 HandDisplayコンポーネント

**ファイル**: `atelier-guild-rank/src/presentation/ui/components/HandDisplay.ts`（246行）

#### 主要機能

1. **手札の横並び表示**
   - 最大5枚のカード表示
   - カード間スペーシング: 140px
   - 中央揃えのレイアウト

2. **カード選択管理**
   - 選択中のカードを20px上に移動して強調表示
   - 選択の解除と変更
   - getSelectedCard()でカードエンティティを取得

3. **手札の動的更新**
   - updateCards()で手札配列を更新
   - 既存のCardUIを破棄して再生成
   - 選択状態のリセット

4. **メモリ管理**
   - destroy()メソッドですべてのCardUIを破棄
   - コンテナの破棄

#### 実装のポイント

**手札のレイアウト計算** (77-100行):
```typescript
private createCardUIs(): void {
  const cardCount = this.config.cards.length;

  // カード配列の中央を基準に左右に配置するためのオフセット計算
  const totalWidth = (cardCount - 1) * HandDisplay.CARD_SPACING;
  const startX = -totalWidth / 2;

  this.config.cards.forEach((card, index) => {
    const cardX = startX + index * HandDisplay.CARD_SPACING;

    // CardUIを生成
    const cardUI = new CardUI(this.scene, {
      card,
      x: cardX,
      y: 0,
      interactive: true,
      onClick: (clickedCard) => this.handleCardClick(clickedCard, index),
    });

    // コンテナに追加
    this.container.add(cardUI.getContainer());

    this.cardUIs.push(cardUI);
  });
}
```
- 🔵 **信頼性レベル**: 高（要件定義書に明記）
- **設計判断**: 中央揃えの計算により、カード枚数に関わらず視覚的にバランスの取れた配置を実現

**カード選択の強調表示** (122-151行):
```typescript
public setSelectedIndex(index: number | null): void {
  // 以前の選択を解除
  if (this.selectedIndex !== null && this.cardUIs[this.selectedIndex]) {
    this.clearSelection(this.selectedIndex);
  }

  // 新しい選択を適用
  this.selectedIndex = index;
  if (index !== null && this.cardUIs[index]) {
    this.highlightCard(index);
  }
}

private highlightCard(index: number): void {
  const cardUI = this.cardUIs[index];
  if (!cardUI) return;

  // 選択中のカードを少し上に移動
  this.scene.tweens.add({
    targets: cardUI.getContainer(),
    y: -20,
    duration: 150,
    ease: 'Power2',
  });
}
```
- 🔵 **信頼性レベル**: 高（要件定義書に明記）
- **設計判断**: 範囲外のインデックスでもエラーにならない防御的プログラミング

**エラーハンドリング** (49-59行):
```typescript
// バリデーション: cardsが必須
if (!config.cards) {
  throw new Error('HandDisplay: cards array is required');
}

// バリデーション: 手札枚数チェック
if (config.cards.length > HandDisplay.MAX_HAND_SIZE) {
  throw new Error(
    `HandDisplay: cards array exceeds maximum size of ${HandDisplay.MAX_HAND_SIZE}`,
  );
}
```
- 🔵 **信頼性レベル**: 高（要件定義書に明記）
- **設計判断**: 手札の最大枚数制限を実装コードでも保証

---

## 3. 実装方針と判断理由

### 3.1 BaseComponentの継承

**判断理由**:
- すべてのUIコンポーネントで共通のライフサイクル管理を実現
- create()とdestroy()の実装を強制し、メモリリーク防止

**参照元**: `docs/implements/atelier-guild-rank/TASK-0021/note.md` 2.2.1 BaseComponentの継承

### 3.2 Tweenアニメーションの使用

**判断理由**:
- Phaserの標準機能を使用した滑らかなアニメーション
- イージング関数（Power2）による自然な動き
- パフォーマンス最適化（GPUアクセラレーション）

**参照元**: `docs/implements/atelier-guild-rank/TASK-0021/note.md` 5.2.2 レンダリング最適化

### 3.3 防御的プログラミング

**判断理由**:
- 範囲外のインデックスや未知のカードタイプでもエラーにならない
- フェイルファストとフェイルセーフのバランス
- ユーザー体験を損なわない堅牢性

**参照元**: `docs/implements/atelier-guild-rank/TASK-0021/card-ui-requirements.md` 4.2 エッジケース

### 3.4 定数の定義

**判断理由**:
- マジックナンバーを避け、可読性と保守性を向上
- カードサイズ、スペーシング、最大枚数などを定数化
- 変更時の影響範囲を最小化

**実装例**:
```typescript
// CardUI.ts
private static readonly CARD_WIDTH = 120;
private static readonly CARD_HEIGHT = 160;
private static readonly ICON_SIZE = 80;
private static readonly PADDING = 8;

// HandDisplay.ts
private static readonly CARD_SPACING = 140;
private static readonly MAX_HAND_SIZE = 5;
```

---

## 4. テストケース対応表

### 4.1 実装済みテストケース

| テストケースID | テスト内容 | 実装箇所 | 状態 |
|---------------|----------|---------|------|
| TC-CARD-UI-001 | CardUIの正常生成 | CardUI.ts 75-82行 | ✅ |
| TC-CARD-UI-002 | カード名の表示 | CardUI.ts 133-147行 | ✅ |
| TC-CARD-UI-003 | カードコストの表示 | CardUI.ts 149-162行 | ✅ |
| TC-CARD-UI-004 | getCard()メソッド | CardUI.ts 275-277行 | ✅ |
| TC-CARD-UI-005 | 採取カードは緑色 | CardUI.ts 100-111行 | ✅ |
| TC-CARD-UI-006 | レシピカードはピンク色 | CardUI.ts 100-111行 | ✅ |
| TC-CARD-UI-007 | 強化カードは青色 | CardUI.ts 100-111行 | ✅ |
| TC-CARD-UI-008 | インタラクティブ有効 | CardUI.ts 210-241行 | ✅ |
| TC-CARD-UI-009 | ホバー時の拡大 | CardUI.ts 216-224行 | ✅ |
| TC-CARD-UI-010 | ホバー解除時 | CardUI.ts 227-235行 | ✅ |
| TC-CARD-UI-011 | クリックイベント | CardUI.ts 238-240行 | ✅ |
| TC-CARD-UI-ERR-001 | cardがnull | CardUI.ts 57-60行 | ✅ |
| TC-CARD-UI-BOUND-001 | インタラクティブ無効 | CardUI.ts 210-211行 | ✅ |
| TC-CARD-UI-BOUND-002 | 未知のカードタイプ | CardUI.ts 108-109行 | ✅ |
| TC-CARD-UI-DESTROY-001 | destroy()で破棄 | CardUI.ts 246-268行 | ✅ |
| TC-HAND-001 | HandDisplay正常生成 | HandDisplay.ts 70-72行 | ✅ |
| TC-HAND-002 | 5枚横並び表示 | HandDisplay.ts 77-100行 | ✅ |
| TC-HAND-003 | 空の手札 | HandDisplay.ts 77-100行 | ✅ |
| TC-HAND-004 | カード選択 | HandDisplay.ts 122-151行 | ✅ |
| TC-HAND-005 | getSelectedCard() | HandDisplay.ts 185-190行 | ✅ |
| TC-HAND-006 | 選択を別カードに変更 | HandDisplay.ts 122-133行 | ✅ |
| TC-HAND-007 | 選択解除 | HandDisplay.ts 122-133行 | ✅ |
| TC-HAND-008 | updateCards() | HandDisplay.ts 197-219行 | ✅ |
| TC-HAND-009 | 選択リセット | HandDisplay.ts 212行 | ✅ |
| TC-HAND-ERR-001 | cardsがnull | HandDisplay.ts 49-52行 | ✅ |
| TC-HAND-ERR-002 | 6枚以上でエラー | HandDisplay.ts 55-59行 | ✅ |
| TC-HAND-ERR-003 | updateCards()で6枚エラー | HandDisplay.ts 199-203行 | ✅ |
| TC-HAND-BOUND-001 | 手札が0枚 | HandDisplay.ts 77-100行 | ✅ |
| TC-HAND-BOUND-002 | 手札が5枚（最大） | HandDisplay.ts 77-100行 | ✅ |
| TC-HAND-BOUND-003 | 範囲外インデックス | HandDisplay.ts 124, 130, 189行 | ✅ |
| TC-HAND-DESTROY-001 | destroy()で破棄 | HandDisplay.ts 224-235行 | ✅ |

**合計**: 31個のテストケース（テストファイルでは29個のテストとして実装、一部のテストケースは統合されている）

---

## 5. 品質判定結果

### 5.1 品質評価

✅ **高品質**: すべての要件を満たしています

- **テスト実行**: ✅ 成功（29個のテスト全通過）
- **実装品質**: ✅ シンプルかつ動作する
- **リファクタ箇所**: ✅ 明確に特定可能（後述）
- **機能的問題**: ✅ なし
- **コンパイルエラー**: ✅ なし
- **ファイルサイズ**: ✅ CardUI.ts: 289行、HandDisplay.ts: 246行（800行制限内）
- **モック使用**: ✅ 実装コードにモック・スタブは含まれていない

### 5.2 実装されている主要機能

- ✅ カードの視覚的表現（背景、アイコン、テキスト）
- ✅ カードタイプ別の色分け（採取=緑、レシピ=ピンク、強化=青）
- ✅ インタラクティブ機能（ホバー拡大、クリックイベント）
- ✅ アニメーション（ホバー時の拡大、解除時の縮小）
- ✅ 手札の横並び表示（最大5枚）
- ✅ カード選択管理（選択、解除、変更）
- ✅ 手札の動的更新
- ✅ メモリ管理（destroy()による適切なリソース解放）
- ✅ エラーハンドリング（nullチェック、枚数制限）
- ✅ 境界値の安全処理（範囲外インデックス、未知のカードタイプ）

### 5.3 信頼性レベルの分布

| 信頼性レベル | 件数 | 割合 |
|------------|------|------|
| 🔵 青信号（高信頼性） | 30 | 96.8% |
| 🟡 黄信号（妥当な推測） | 1 | 3.2% |
| 🔴 赤信号（要確認） | 0 | 0% |

**黄信号の項目**:
- TC-HAND-BOUND-003: 範囲外のインデックスで選択（実装ファイルから推測）

---

## 6. 課題・改善点（Refactorフェーズで対応）

### 6.1 CardUI.ts

1. **getEffectDescription()の詳細化**
   - 現在: 簡易版の効果説明（「素材を3種類採取」など）
   - 改善: カードマスターデータから詳細な効果を生成
   - 優先度: 中

2. **アイコンプレースホルダーの置き換え**
   - 現在: 80x80pxの灰色の矩形
   - 改善: 実際のカード画像または生成されたアイコンに置き換え
   - 優先度: 低（将来的な拡張）

3. **マジックナンバーの定数化**
   - 現在: nameY、costY、effectYの計算で数値がハードコーディング
   - 改善: レイアウト関連の数値を定数として定義
   - 優先度: 低

### 6.2 HandDisplay.ts

1. **レイアウトの動的調整**
   - 現在: 固定のカード間スペーシング（140px）
   - 改善: 画面サイズに応じてスペーシングを調整
   - 優先度: 低（現在の実装で問題なし）

2. **アニメーション設定の統一**
   - 現在: highlightCard()とclearSelection()で個別にTweenを設定
   - 改善: アニメーション設定を共通化
   - 優先度: 低

3. **マジックナンバーの定数化**
   - 現在: 選択時の移動量（-20）、アニメーション時間（150ms）がハードコーディング
   - 改善: 定数として定義
   - 優先度: 低

### 6.3 両ファイル共通

1. **日本語コメントの追加**
   - 現在: 主要メソッドにはコメントあり
   - 改善: アニメーション関連のコメントを追加
   - 優先度: 中

2. **エラーメッセージの国際化対応**
   - 現在: 英語のエラーメッセージ
   - 改善: 多言語対応の仕組み
   - 優先度: 低（将来的な拡張）

---

## 7. 次のステップ

### 7.1 Refactorフェーズ（品質改善）

次のコマンドでRefactorフェーズを実行:
```bash
/tdd-refactor atelier-guild-rank TASK-0021
```

**改善の候補**:
- コードの可読性向上（マジックナンバーの定数化）
- コメントの充実化
- アニメーション設定の統一
- 効果説明の詳細化

### 7.2 統合テスト

**今後のテスト**:
- Phaserシーン内での実際の表示確認
- DeckServiceとの連携確認
- EventBusとの連携確認

---

## 8. 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-18 | 1.0.0 | 初版作成（TDD Greenフェーズ完了） |

---

**作成者**: Claude (Zundamon)
**最終更新**: 2026-01-18
