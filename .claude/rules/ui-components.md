# UIコンポーネント設計ルール

## 概要

UIコンポーネントは`BaseComponent`を継承し、一貫したライフサイクルとAPI設計に従う。

## BaseComponent継承

すべてのカスタムUIコンポーネントは`BaseComponent`を継承する。

```typescript
import { BaseComponent } from '@presentation/ui/components/BaseComponent';

export class MyComponent extends BaseComponent {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
  }

  create(): void {
    // UIの初期化処理
  }

  destroy(): void {
    // リソース解放処理
  }
}
```

### BaseComponentが提供する機能

| プロパティ/メソッド | 説明 |
|-------------------|------|
| `this.scene` | Phaserシーンへの参照 |
| `this.container` | UIを格納するコンテナ |
| `this.rexUI` | rexUIプラグインへの参照 |
| `setVisible(visible)` | 可視性設定（メソッドチェーン対応） |
| `setPosition(x, y)` | 位置設定（メソッドチェーン対応） |
| `getContainer()` | コンテナ取得 |

### コンストラクタオプション

```typescript
// シーンに直接追加（デフォルト）
new MyComponent(scene, x, y);

// 親コンテナに追加する場合（シーンに直接追加しない）
new MyComponent(scene, x, y, { addToScene: false });
parentContainer.add(component.getContainer());
```

## create()メソッドの実装

`create()`ではUIの初期化処理を行う。

```typescript
create(): void {
  // 背景
  const bg = this.scene.add.rectangle(0, 0, 200, 100, 0x333333);
  this.container.add(bg);

  // テキスト
  this.titleText = this.scene.add.text(0, -30, 'Title', {
    fontSize: '24px',
    color: '#ffffff',
  });
  this.titleText.setOrigin(0.5);
  this.container.add(this.titleText);

  // rexUIコンポーネント
  if (this.rexUI) {
    this.button = this.rexUI.add.label({
      width: 100,
      height: 40,
      background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 8, 0x4a90d9),
      text: this.scene.add.text(0, 0, 'OK'),
      space: { left: 10, right: 10 },
    });
    this.container.add(this.button);
  }

  // イベント登録
  this.setupEvents();
}
```

## destroy()メソッドの実装

`destroy()`ではすべてのリソースを確実に解放する。

```typescript
destroy(): void {
  // イベントリスナー解除
  this.unsubscribeEvents?.();

  // Tweenキャンセル
  if (this.activeTween) {
    this.activeTween.stop();
  }

  // タイマー停止
  if (this.timer) {
    this.timer.remove();
  }

  // コンテナ破棄（子も含む）
  this.container.destroy(true);
}
```

### 破棄チェックリスト

- [ ] EventBusの購読解除
- [ ] Phaserイベントリスナー解除
- [ ] Tweenの停止
- [ ] タイマーの削除
- [ ] コンテナの破棄

## テーマ（THEME）の活用

色やサイズは`THEME`定数を使用し、ハードコーディングを避ける。

```typescript
import { THEME } from '@presentation/ui/theme';

// 色
const bgColor = THEME.colors.background;
const primaryColor = THEME.colors.primary;
const textColor = THEME.colors.text;

// フォント
const fontSize = THEME.font.size.medium;
const fontFamily = THEME.font.family;

// スペーシング
const padding = THEME.spacing.medium;
const margin = THEME.spacing.large;
```

## コンポーネントの構成パターン

### 単純なコンポーネント

```typescript
export class GoldDisplay extends BaseComponent {
  private goldText!: Phaser.GameObjects.Text;

  create(): void {
    this.goldText = this.scene.add.text(0, 0, '0 G');
    this.container.add(this.goldText);
  }

  updateGold(amount: number): void {
    this.goldText.setText(`${amount.toLocaleString()} G`);
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
```

### 状態監視するコンポーネント

```typescript
export class PhaseIndicator extends BaseComponent {
  private unsubscribe?: () => void;
  private phaseText!: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private eventBus: IEventBus,
    private stateManager: IStateManager,
  ) {
    super(scene, x, y);
  }

  create(): void {
    this.phaseText = this.scene.add.text(0, 0, '');
    this.container.add(this.phaseText);

    // 初期表示
    this.updatePhase(this.stateManager.getState().currentPhase);

    // 変更監視
    this.unsubscribe = this.eventBus.on(GameEventType.PHASE_CHANGED, (e) => {
      this.updatePhase(e.payload.newPhase);
    });
  }

  private updatePhase(phase: GamePhase): void {
    this.phaseText.setText(phase);
  }

  destroy(): void {
    this.unsubscribe?.();
    this.container.destroy(true);
  }
}
```

### 子コンポーネントを持つコンポーネント

```typescript
export class CardList extends BaseComponent {
  private cards: CardUI[] = [];

  create(): void {
    // 子コンポーネントはaddToScene: falseで作成
    for (let i = 0; i < 5; i++) {
      const card = new CardUI(this.scene, i * 120, 0, { addToScene: false });
      card.create();
      this.container.add(card.getContainer());
      this.cards.push(card);
    }
  }

  destroy(): void {
    // 子コンポーネントも明示的に破棄
    for (const card of this.cards) {
      card.destroy();
    }
    this.cards = [];
    this.container.destroy(true);
  }
}
```

## アニメーション

### Tweenの使用

```typescript
// フェードイン
this.scene.tweens.add({
  targets: this.container,
  alpha: { from: 0, to: 1 },
  duration: 300,
  ease: 'Power2',
});

// スケールアニメーション
this.activeTween = this.scene.tweens.add({
  targets: this.container,
  scaleX: 1.1,
  scaleY: 1.1,
  duration: 200,
  yoyo: true,
});
```

### アニメーション完了待ち

```typescript
async show(): Promise<void> {
  return new Promise((resolve) => {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 300,
      onComplete: () => resolve(),
    });
  });
}
```

## インタラクション

### クリックイベント

```typescript
// GameObjectに直接
this.button.setInteractive();
this.button.on('pointerdown', () => this.handleClick());
this.button.on('pointerover', () => this.handleHover());
this.button.on('pointerout', () => this.handleOut());

// 破棄時に解除
destroy(): void {
  this.button.off('pointerdown');
  this.button.off('pointerover');
  this.button.off('pointerout');
  this.container.destroy(true);
}
```

### ホバーエフェクト

```typescript
private setupHover(): void {
  this.container.setInteractive(
    new Phaser.Geom.Rectangle(0, 0, width, height),
    Phaser.Geom.Rectangle.Contains,
  );

  this.container.on('pointerover', () => {
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 100,
    });
  });

  this.container.on('pointerout', () => {
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1,
      scaleY: 1,
      duration: 100,
    });
  });
}
```

## 禁止事項

- `create()`を呼ばずにコンポーネントを使用
- `destroy()`でリソースを解放しない
- THEMEを使わずに色をハードコーディング
- 子コンポーネントの破棄忘れ
- イベントリスナーの解除忘れ
- コンテナ外でGameObjectを作成して管理しない
