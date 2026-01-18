# TASK-0021: カードUIコンポーネント - TDD Redフェーズ記録

**作成日**: 2026-01-18
**タスクID**: TASK-0021
**要件名**: atelier-guild-rank
**機能名**: カードUIコンポーネント
**フェーズ**: Red（失敗するテスト作成）

---

## 1. Redフェーズ実行結果

### 1.1 実行状況

**実行日時**: 2026-01-18

**重要な注意事項**:
既に実装ファイル（CardUI.ts、HandDisplay.ts）が存在するため、テストは成功しています。
TDDの理想的なRedフェーズでは「失敗するテスト」を作成しますが、本タスクでは実装が先行しているため、
テストは成功する状態でスタートしています。

### 1.2 作成したテストケース

#### CardUI.spec.ts（15テスト）

**既存のテストケース（13個）**:
1. ✅ 正しいデザインでカードが表示される（TC-CARD-UI-001）
2. ✅ cardが指定されていない場合はエラー（TC-CARD-UI-ERR-001）
3. ✅ 採取カードは緑色（TC-CARD-UI-005）
4. ✅ レシピカードはピンク色（TC-CARD-UI-006）
5. ✅ 強化カードは青色（TC-CARD-UI-007）
6. ✅ interactiveがtrueの場合、ホバーイベントが設定される（TC-CARD-UI-008）
7. ✅ interactiveがfalseの場合、ホバーイベントは設定されない（TC-CARD-UI-BOUND-001）
8. ✅ クリック時にコールバックが実行される（TC-CARD-UI-011）
9. ✅ ホバー時にスケールアニメーションが開始される（TC-CARD-UI-009）
10. ✅ カード名が正しく表示される（TC-CARD-UI-002）
11. ✅ カードコストが正しく表示される（TC-CARD-UI-003）
12. ✅ getCard()でカードデータが取得できる（TC-CARD-UI-004）
13. ✅ すべてのGameObjectsが破棄される（TC-CARD-UI-DESTROY-001）

**今回追加したテストケース（2個）**:
14. ✅ **ホバー解除時に元のサイズに戻る**（TC-CARD-UI-010）
    - **テスト内容**: pointeroutイベントでTweenアニメーションが開始されること
    - **期待される動作**: コンテナのscaleX/scaleYが1.0に、100msでアニメーションされる
    - **信頼性レベル**: 🔵（実装ファイルと要件定義書に基づく）

15. ✅ **未知のカードタイプは白色で表示される**（TC-CARD-UI-BOUND-002）
    - **テスト内容**: 定義されていないカードタイプに対してデフォルト色（白）が適用されること
    - **期待される動作**: エラーにならず、0xffffff（白色）で表示される
    - **信頼性レベル**: 🔵（実装ファイルに基づく）

#### HandDisplay.spec.ts（14テスト）

**既存のテストケース（13個）**:
1. ✅ 5枚横並びで表示される（TC-HAND-002, TC-HAND-BOUND-002）
2. ✅ カード配列が空の場合でもエラーにならない（TC-HAND-003, TC-HAND-BOUND-001）
3. ✅ cardsが指定されていない場合はエラー（TC-HAND-ERR-001）
4. ✅ 6枚以上のカードを指定するとエラー（TC-HAND-ERR-002）
5. ✅ 選択したカードが強調表示される（TC-HAND-004）
6. ✅ 選択を解除できる（TC-HAND-007）
7. ✅ 選択したカードを別のカードに変更できる（TC-HAND-006）
8. ✅ getSelectedCard()で選択中のカードが取得できる（TC-HAND-005）
9. ✅ カードクリック時にコールバックが実行される
10. ✅ 手札を更新できる（TC-HAND-008）
11. ✅ updateCards()で選択状態がリセットされる（TC-HAND-009）
12. ✅ updateCards()で6枚以上を指定するとエラー（TC-HAND-ERR-003）
13. ✅ すべてのCardUIが破棄される（TC-HAND-DESTROY-001）

**今回追加したテストケース（1個）**:
14. ✅ **範囲外のインデックスで選択しても安全**（TC-HAND-BOUND-003）
    - **テスト内容**: 存在しないインデックスで選択しても、エラーにならず選択が無効化されること
    - **期待される動作**: エラーにならず、getSelectedCard()がnullを返す
    - **信頼性レベル**: 🟡（実装ファイルから推測）

### 1.3 テスト実行結果

```bash
npm test -- src/presentation/ui/components/CardUI.spec.ts src/presentation/ui/components/HandDisplay.spec.ts
```

**結果**:
```
 ✓ src/presentation/ui/components/CardUI.spec.ts (15 tests) 20ms
 ✓ src/presentation/ui/components/HandDisplay.spec.ts (14 tests) 18ms

 Test Files  2 passed (2)
      Tests  29 passed (29)
   Duration  3.95s
```

**全テストケースが成功**: 既に実装が完了しているため、すべてのテストが成功しています。

---

## 2. 期待される失敗メッセージ（理想的なRedフェーズの場合）

もし実装が存在しない状態でテストを作成した場合、以下のようなエラーが期待されます：

### 2.1 CardUI

#### TC-CARD-UI-010: ホバー解除時に元のサイズに戻る
```
Expected mockTweens.add to be called with object containing {scaleX: 1, scaleY: 1, duration: 100}
Received: Not called
```

**理由**: pointeroutイベントリスナーが未実装のため、Tweenアニメーションが実行されない

#### TC-CARD-UI-BOUND-002: 未知のカードタイプは白色
```
Expected scene.add.rectangle to be called with (0, 0, 120, 160, 0xffffff)
Received: scene.add.rectangle(0, 0, 120, 160, undefined)
```

**理由**: getCardTypeColor()のdefaultケースが未実装のため、undefinedが返される

### 2.2 HandDisplay

#### TC-HAND-BOUND-003: 範囲外のインデックスで選択
```
TypeError: Cannot read property 'getContainer' of undefined
    at highlightCard (HandDisplay.ts:141)
```

**理由**: 範囲外チェックが未実装のため、cardUIs[999]がundefinedでgetContainer()を呼び出してエラー

---

## 3. 実装後の期待（Greenフェーズで実装すべき内容）

既に実装が完了しているため、以下の機能が正しく動作することを確認しました：

### 3.1 CardUI

#### 1. ホバー解除時のアニメーション
```typescript
// setupInteraction()メソッド内
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

**実装のポイント**:
- pointeroutイベントリスナーを登録
- Tweenアニメーションでscaleを1.0に戻す
- ホバー時と同じduration（100ms）とeasing（Power2）を使用

#### 2. 未知のカードタイプのフォールバック
```typescript
// getCardTypeColor()メソッド内
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

**実装のポイント**:
- switch文のdefaultケースで白色（0xffffff）を返す
- エラーをスローせず、安全にフォールバックする

### 3.2 HandDisplay

#### 3. 範囲外インデックスの防御的プログラミング
```typescript
// setSelectedIndex()メソッド内
public setSelectedIndex(index: number | null): void {
  // 以前の選択を解除
  if (this.selectedIndex !== null && this.cardUIs[this.selectedIndex]) {
    this.clearSelection(this.selectedIndex);
  }

  // 新しい選択を適用（範囲外チェック）
  this.selectedIndex = index;
  if (index !== null && this.cardUIs[index]) {
    this.highlightCard(index);
  }
}

// getSelectedCard()メソッド内
public getSelectedCard(): Card | null {
  if (this.selectedIndex === null) {
    return null;
  }
  return this.config.cards[this.selectedIndex] || null;
}
```

**実装のポイント**:
- `this.cardUIs[index]`の存在チェックを追加
- 範囲外の場合はhighlightCard()を呼ばない
- getSelectedCard()では`|| null`でフォールバック

---

## 4. テストケース定義書との対応

### 4.1 実装済みテストケース

| テストケースID | テスト内容 | 対応するテスト名 | 状態 |
|---------------|----------|----------------|------|
| TC-CARD-UI-001 | CardUIの正常生成 | 正しいデザインでカードが表示される | ✅ |
| TC-CARD-UI-002 | カード名の表示 | カード名が正しく表示される | ✅ |
| TC-CARD-UI-003 | カードコストの表示 | カードコストが正しく表示される | ✅ |
| TC-CARD-UI-004 | getCard()メソッド | getCard()でカードデータが取得できる | ✅ |
| TC-CARD-UI-005 | 採取カードは緑色 | 採取カードは緑色 | ✅ |
| TC-CARD-UI-006 | レシピカードはピンク色 | レシピカードはピンク色 | ✅ |
| TC-CARD-UI-007 | 強化カードは青色 | 強化カードは青色 | ✅ |
| TC-CARD-UI-008 | インタラクティブ有効 | interactiveがtrueの場合、ホバーイベントが設定される | ✅ |
| TC-CARD-UI-009 | ホバー時の拡大 | ホバー時にスケールアニメーションが開始される | ✅ |
| TC-CARD-UI-010 | ホバー解除時 | ホバー解除時に元のサイズに戻る | ✅ 🆕 |
| TC-CARD-UI-011 | クリックイベント | クリック時にコールバックが実行される | ✅ |
| TC-CARD-UI-ERR-001 | cardがnull | cardが指定されていない場合はエラー | ✅ |
| TC-CARD-UI-BOUND-001 | インタラクティブ無効 | interactiveがfalseの場合、ホバーイベントは設定されない | ✅ |
| TC-CARD-UI-BOUND-002 | 未知のカードタイプ | 未知のカードタイプは白色で表示される | ✅ 🆕 |
| TC-CARD-UI-DESTROY-001 | destroy()で破棄 | すべてのGameObjectsが破棄される | ✅ |
| TC-HAND-001 | HandDisplay正常生成 | （5枚横並びで表示されるでカバー） | ✅ |
| TC-HAND-002 | 5枚横並び表示 | 5枚横並びで表示される | ✅ |
| TC-HAND-003 | 空の手札 | カード配列が空の場合でもエラーにならない | ✅ |
| TC-HAND-004 | カード選択 | 選択したカードが強調表示される | ✅ |
| TC-HAND-005 | getSelectedCard() | getSelectedCard()で選択中のカードが取得できる | ✅ |
| TC-HAND-006 | 選択を別カードに変更 | 選択したカードを別のカードに変更できる | ✅ |
| TC-HAND-007 | 選択解除 | 選択を解除できる | ✅ |
| TC-HAND-008 | updateCards() | 手札を更新できる | ✅ |
| TC-HAND-009 | 選択リセット | updateCards()で選択状態がリセットされる | ✅ |
| TC-HAND-ERR-001 | cardsがnull | cardsが指定されていない場合はエラー | ✅ |
| TC-HAND-ERR-002 | 6枚以上でエラー | 6枚以上のカードを指定するとエラー | ✅ |
| TC-HAND-ERR-003 | updateCards()で6枚エラー | updateCards()で6枚以上を指定するとエラー | ✅ |
| TC-HAND-BOUND-001 | 手札が0枚 | カード配列が空の場合でもエラーにならない | ✅ |
| TC-HAND-BOUND-002 | 手札が5枚（最大） | 5枚横並びで表示される | ✅ |
| TC-HAND-BOUND-003 | 範囲外インデックス | 範囲外のインデックスで選択しても安全 | ✅ 🆕 |
| TC-HAND-DESTROY-001 | destroy()で破棄 | すべてのCardUIが破棄される | ✅ |

**合計**: 31個のテストケース（テストファイルでは29個のテストとして実装、一部のテストケースは統合されている）

---

## 5. 品質判定結果

### 5.1 品質評価

✅ **高品質**: すべての要件を満たしています

- **テスト実行**: ✅ 成功（29個のテスト全通過）
- **期待値**: ✅ 明確で具体的（各テストで詳細なexpectを記述）
- **アサーション**: ✅ 適切（Phaserモックを使用した検証）
- **実装方針**: ✅ 明確（既に実装済み）
- **信頼性レベル**: ✅ 🔵（青信号）が多い（30/31が青信号、1/31が黄信号）

### 5.2 信頼性レベルの分布

| 信頼性レベル | 件数 | 割合 |
|------------|------|------|
| 🔵 青信号（高信頼性） | 30 | 96.8% |
| 🟡 黄信号（妥当な推測） | 1 | 3.2% |
| 🔴 赤信号（要確認） | 0 | 0% |

**黄信号の項目**:
- TC-HAND-BOUND-003: 範囲外のインデックスで選択（実装ファイルから推測）

### 5.3 カバレッジ

**テストケース定義書のカバレッジ**: 31/31（100%）

**実装されている主要機能**:
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

---

## 6. テストファイル

### 6.1 作成したテストファイル

| ファイルパス | テスト数 | 状態 |
|-------------|---------|------|
| `atelier-guild-rank/src/presentation/ui/components/CardUI.spec.ts` | 15 | ✅ 全通過 |
| `atelier-guild-rank/src/presentation/ui/components/HandDisplay.spec.ts` | 14 | ✅ 全通過 |

### 6.2 テスト実装の特徴

**日本語コメント**:
- すべてのテストに【テスト目的】【テスト内容】【期待される動作】を記載
- 信頼性レベル（🔵🟡🔴）を明示
- Given-When-Thenパターンの各フェーズにコメント

**モックの使用**:
- Phaserシーン、Container、Rectangle、Text、Tweensをモック化
- 実際のゲームエンジンに依存せずテスト実行

**アサーション**:
- モックの呼び出し回数とパラメータを検証
- expect.objectContaining()で柔軟な検証

---

## 7. 次のステップ

### 7.1 Greenフェーズ（最小実装）

**状態**: ✅ 既に実装済み

既に実装ファイル（CardUI.ts、HandDisplay.ts）が存在し、すべてのテストが通過しているため、
Greenフェーズは完了しています。

### 7.2 Refactorフェーズ（品質改善）

次のコマンドでRefactorフェーズを実行:
```bash
/tdd-refactor atelier-guild-rank TASK-0021
```

**改善の候補**:
- コードの可読性向上
- パフォーマンス最適化
- セキュリティレビュー
- エラーハンドリングの強化

---

## 8. 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-18 | 1.0.0 | 初版作成（TDD Redフェーズ完了） |

---

**作成者**: Claude (Zundamon)
**最終更新**: 2026-01-18
