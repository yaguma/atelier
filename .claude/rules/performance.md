# パフォーマンスルール

## 基本原則

- 推測ではなく計測に基づいて最適化
- 初期段階から拡張性を考慮
- 過度な最適化は避け、読みやすさとのバランスを取る

---

## Phaser固有の最適化

### update()メソッド

`update()`は毎フレーム（60fps = 毎秒60回）呼ばれる。

```typescript
// NG: update()内での重い処理
update(): void {
  const items = this.inventory.filter(i => i.category === 'material'); // 毎フレーム配列生成
  this.checkCollisions(); // 必要ない場合も実行
}

// OK: イベント駆動で必要時のみ処理
update(): void {
  // 必要な場合のみ定義
  // または軽量な処理のみ
}
```

### update()に書くべきでない処理

- オブジェクトの生成・破棄
- DOM操作
- 重い計算（経路探索、大量データ処理等）
- ネットワーク通信

### 必要な場合のみupdateを定義

```typescript
// update()が不要なシーンでは定義しない
class MenuScene extends Phaser.Scene {
  create(): void {
    // UIの初期化のみ
  }
  // update()は定義しない
}
```

---

## オブジェクトプーリング

頻繁に生成・破棄するオブジェクトはプーリングを使用。

```typescript
// カードプール
this.cardPool = this.add.group({
  classType: CardSprite,
  maxSize: 20,
  runChildUpdate: false,
});

// 取得
const card = this.cardPool.get(x, y);
if (card) {
  card.setActive(true).setVisible(true);
  card.setup(cardData);
}

// 返却
card.setActive(false).setVisible(false);
```

### プーリング対象の目安

- カードUI
- パーティクル
- 一時的なエフェクト
- 繰り返し表示するUI要素

---

## テクスチャ最適化

### テクスチャアトラス

多数の小さな画像はアトラスにまとめる。

```typescript
// 個別画像の読み込み（非推奨）
this.load.image('icon-gold', 'assets/icons/gold.png');
this.load.image('icon-ap', 'assets/icons/ap.png');

// アトラスで一括読み込み（推奨）
this.load.atlas('icons', 'assets/icons.png', 'assets/icons.json');
this.add.image(x, y, 'icons', 'gold');
```

### 画像サイズ

- 2の累乗サイズを推奨（64, 128, 256, 512, 1024）
- 必要以上に大きな画像を避ける
- WebP形式で圧縮を検討

---

## メモリ管理

### リソース破棄

シーン終了時は確実にリソースを解放。

```typescript
shutdown(): void {
  // イベントリスナー解除
  this.input.off('pointerdown');
  this.eventBus.offAll();

  // タイマー停止
  this.time.removeAllEvents();

  // Tweenキャンセル
  this.tweens.killAll();

  // コンポーネント破棄
  this.components.forEach(c => c.destroy());
  this.components = [];
}
```

### 参照の解放

```typescript
// グローバル参照を避ける
// NG
window.gameState = this.state;

// OK: StateManager経由
this.stateManager.getState();
```

---

## 状態管理の最適化

### イミュータブル更新

```typescript
// NG: 直接変更（リアクティブ検知できない）
state.inventory.push(item);

// OK: 新しいオブジェクトで置き換え
updateState({
  inventory: [...state.inventory, item],
});
```

### 必要な部分のみ更新

```typescript
// NG: 全体を再計算
const newState = recalculateAll(state);

// OK: 変更部分のみ
updateState({ gold: state.gold + reward });
```

---

## レンダリング最適化

### 可視性管理

画面外のオブジェクトは非表示に。

```typescript
// スクロールパネル外のカードを非表示
cards.forEach((card, index) => {
  const isVisible = index >= startIndex && index < endIndex;
  card.setVisible(isVisible);
  card.setActive(isVisible);
});
```

### バッチ処理

複数のUI更新はまとめて実行。

```typescript
// NG: 1つずつ更新
items.forEach(item => {
  this.updateItemUI(item);
  this.scene.render(); // 暗黙の再描画
});

// OK: まとめて更新
items.forEach(item => this.updateItemUI(item));
// Phaserが自動的に次フレームでまとめて描画
```

---

## 計測ツール

### Chrome DevTools

- Performance タブでフレームレート確認
- Memory タブでメモリリーク検出

### Phaser内蔵

```typescript
// FPS表示（開発時のみ）
this.game.config.fps = { forceSetTimeOut: true, target: 60 };
console.log('FPS:', this.game.loop.actualFps);
```

---

## 禁止事項

- `console.log` を本番環境に残さない
- 同期的な重い処理をメインスレッドで実行しない
- 無限ループの可能性があるコードを書かない
- update()内でオブジェクト生成しない
- 未使用のリソースを解放しない
