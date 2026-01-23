# TASK-0053 タスクノート: 共通UIユーティリティ基盤作成

**作成日**: 2026-01-23
**タスクID**: TASK-0053
**フェーズ**: Phase 7 - Presentation層リファクタリング

---

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Phaser 3.87+ |
| UIプラグイン | rexUI |
| 言語 | TypeScript 5.x |
| テストフレームワーク | Vitest |
| アーキテクチャ | Clean Architecture（4層） |

---

## 開発ルール

- **コーディング規約**: Biome 2.xで自動適用（シングルクォート、セミコロン必須、末尾カンマ全て）
- **テストカバレッジ目標**: 80%以上
- **パスエイリアス**: `@presentation/` → `src/presentation/`

---

## コードベース調査結果

### 1. 背景パネル作成パターンの重複

**重複箇所（6ファイル以上）**:
- `HeaderUI.ts` - 昇格ゲージ背景
- `MaterialSlotUI.ts` - 品質バッジ
- `QuestDetailModal.ts` - パネル背景
- `Dialog.ts` - ダイアログ背景
- `AlchemyPhaseUI.ts` - レシピリスト
- `SidebarUI.ts` - セクション背景

**共通パターン**:
```typescript
graphics.fillStyle(color, alpha);
graphics.fillRoundedRect(x, y, width, height, radius);
```

### 2. ホバーエフェクトパターンの重複

**重複箇所（10ファイル以上）**:
- `Button.ts` - ボタンホバー
- `QuestCardUI.ts` - 依頼カードホバー
- `CardUI.ts` - カードホバー
- `MaterialSlotUI.ts` - 素材スロットホバー
- `SidebarUI.ts` - セクションヘッダーホバー
- `ShopScene.ts` - ショップカードホバー
- `RankUpScene.ts` - ランクアップカードホバー
- `ItemInventoryUI.ts` - アイテムホバー
- `FooterUI.ts` - ボタンホバー

**問題点**:
- スケール値が不統一: 1.05 vs 1.1
- アニメーション時間が不統一: 100ms vs 150ms vs 200ms
- イージング関数が不統一: 'Power2' vs 'Quad.Out'

### 3. ボーダーライン生成パターンの重複

**重複箇所（12ファイル以上）**:
- `QuestCardUI.ts`, `CardUI.ts`, `MaterialSlotUI.ts`
- `RewardCardDialog.ts`, `ItemInventoryUI.ts`, `DeliveryQuestPanel.ts`
- `FooterUI.ts`, `ShopScene.ts`, `RankUpScene.ts`
- `DeliveryPhaseUI.ts`, `DropZoneManager.ts`

**パターン**:
```typescript
// パターン1
rectangle.setStrokeStyle(width, color);

// パターン2
graphics.lineStyle(width, color, alpha);
graphics.strokeRoundedRect(x, y, width, height, radius);
```

---

## 実装ファイル構成

```
src/presentation/ui/utils/
├── index.ts                    # エクスポート集約
├── UIBackgroundBuilder.ts      # 背景パネル生成Builder
├── HoverAnimationMixin.ts      # ホバーエフェクト適用関数
└── BorderLineFactory.ts        # ボーダーライン生成Factory
```

---

## 関連実装参考

### 既存のtheme.ts構造

```typescript
// src/presentation/ui/theme.ts
export const THEME = {
  colors: {
    primary: 0x8b4513,
    secondary: 0x6b4423,
    // ...
  },
  fonts: { /* ... */ },
  spacing: { /* ... */ },
  // animationsは未定義
};
```

### 既存のBaseComponent

```typescript
// src/presentation/ui/components/BaseComponent.ts
export abstract class BaseComponent {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;
  // 基本的なコンテナ管理機能
}
```

---

## 注意事項

1. **後方互換性**: 既存UIコンポーネントを壊さないよう、段階的に移行可能な設計とする
2. **Phaser 3 API**: Graphics APIとの互換性を保つ
3. **rexUI併用**: rexUIプラグインとの併用を考慮する
4. **テスト環境**: Phaserモックを使用したユニットテストが必要

---

## 設計方針

### UIBackgroundBuilder（Builderパターン）
- メソッドチェーンで設定
- `build()`でGraphicsオブジェクト生成
- デフォルト値を提供

### HoverAnimationMixin（関数型アプローチ）
- `applyHoverAnimation()`: ホバーエフェクト適用
- `removeHoverAnimation()`: ホバーエフェクト解除
- 設定はConfigオブジェクトで渡す

### BorderLineFactory（Staticファクトリパターン）
- `createHorizontalLine()`: 水平線生成
- `createVerticalLine()`: 垂直線生成
- `createRoundedBorder()`: 角丸ボーダー生成

---

## テスト戦略

- Phaserシーンのモック使用
- 各メソッドの戻り値型の検証
- 設定パラメータの反映検証
- エッジケース（0値、負値、未定義）の検証
