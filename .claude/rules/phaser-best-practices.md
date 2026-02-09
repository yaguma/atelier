# Phaser ベストプラクティス

## シーンライフサイクル

Phaserシーンは以下のライフサイクルメソッドを持つ。適切なタイミングで処理を行うこと。

```typescript
class MyScene extends Phaser.Scene {
  init(data?: object): void    // シーン開始時、データ受け取り
  preload(): void              // アセット読み込み
  create(): void               // 初期化処理、UI作成
  update(time, delta): void    // 毎フレーム更新（必要な場合のみ）
}
```

### 各メソッドの責務

| メソッド | 責務 | 注意点 |
|---------|------|--------|
| `init()` | 前シーンからのデータ受け取り、初期状態設定 | 重い処理は避ける |
| `preload()` | アセットの非同期読み込み | BootSceneで一括ロード推奨 |
| `create()` | GameObjectの作成、イベント登録 | UIコンポーネントはここで初期化 |
| `update()` | ゲームループ処理 | 必要な場合のみ定義（未使用なら省略） |

### シーン間データ受け渡し

```typescript
// 遷移元
this.scene.start('NextScene', { playerId: 123, score: 500 });

// 遷移先
init(data: { playerId: number; score: number }): void {
  this.playerId = data.playerId;
  this.score = data.score;
}
```

## rexUIプラグイン

### 初期化確認

rexUIプラグインは必ず初期化確認を行う。

```typescript
if (!this.scene.rexUI) {
  console.warn('rexUI plugin is not initialized');
  return;
}
```

### 主要コンポーネント

| コンポーネント | 用途 |
|---------------|------|
| `rexUI.add.label()` | ボタン、ラベル |
| `rexUI.add.dialog()` | モーダルダイアログ |
| `rexUI.add.sizer()` | レイアウト管理 |
| `rexUI.add.scrollablePanel()` | スクロール可能パネル |
| `rexUI.add.roundRectangle()` | 角丸背景 |

## アセット管理

### BootSceneでの一括ロード

```typescript
// BootScene.preload()
preload(): void {
  this.load.image('card-bg', 'assets/images/card-bg.png');
  this.load.json('cards', 'assets/data/cards.json');
  this.load.audio('click', 'assets/audio/click.mp3');
}
```

### アセットキーの命名規則

```
<category>-<name>[-<variant>]

例:
- card-bg
- icon-gold
- sfx-click
- bgm-title
```

## パフォーマンス最適化

### オブジェクトプーリング

頻繁に生成・破棄するオブジェクトはプーリングを検討。

```typescript
// グループでプール管理
this.bulletPool = this.add.group({
  classType: Bullet,
  maxSize: 50,
  runChildUpdate: true,
});

// 取得・返却
const bullet = this.bulletPool.get(x, y);
bullet.setActive(true).setVisible(true);

// 返却時
bullet.setActive(false).setVisible(false);
```

### 不要なupdateを避ける

- `update()`は毎フレーム呼ばれるため、必要な場合のみ定義
- イベント駆動で済む処理は`update()`に書かない

### テクスチャアトラス

多数の小さな画像はアトラスにまとめる。

```typescript
this.load.atlas('ui', 'assets/ui.png', 'assets/ui.json');
this.add.image(x, y, 'ui', 'button-normal');
```

## リソース破棄

### シーン終了時のクリーンアップ

```typescript
shutdown(): void {
  // イベントリスナー解除
  this.input.off('pointerdown');
  this.events.off('update');

  // タイマー停止
  this.time.removeAllEvents();

  // Tweenキャンセル
  this.tweens.killAll();
}
```

### GameObjectの破棄

```typescript
// 個別破棄
gameObject.destroy();

// コンテナごと破棄（子も含む）
container.destroy(true);
```

## イベント管理

### Phaserイベント vs EventBus

| 用途 | 使うべきもの |
|------|------------|
| 入力イベント（クリック等） | `this.input.on()` |
| シーンイベント | `this.events.on()` |
| ゲームロジックイベント | `EventBus.on()` |
| UIコンポーネント間通信 | `EventBus.on()` |

### イベントリスナーの解除

登録したリスナーは必ず解除する。

```typescript
// 登録
const handler = () => { /* ... */ };
this.input.on('pointerdown', handler);

// 解除
this.input.off('pointerdown', handler);

// または購読解除関数を保持
const unsubscribe = eventBus.on(GameEventType.PHASE_CHANGED, handler);
// 解除時
unsubscribe();
```

## 禁止事項

- `update()`内での重い処理（オブジェクト生成、DOM操作等）
- シーン終了時のリソース未解放
- グローバル変数でのシーン参照保持
- `this.scene.get()`の多用（依存注入を使う）
