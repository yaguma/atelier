# TASK-0055 タスクノート: RankUpSceneリファクタリング

**作成日**: 2026-01-23
**タスクID**: TASK-0055
**タスクタイプ**: TDD

---

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Phaser 3.87+ / rexUI |
| 言語 | TypeScript 5.x |
| ビルドツール | Vite 5.x |
| テストフレームワーク | Vitest |
| アーキテクチャ | Clean Architecture（4層） |

---

## 開発ルール

### コーディング規約
- インデント: 2スペース
- クォート: シングルクォート
- セミコロン: 必須
- 末尾カンマ: 全て

### 型チェック
- any型使用禁止（rexUIプラグイン以外）
- 適切なインターフェース定義必須

### テスト要件
- テストカバレッジ目標: 80%以上
- Domain層: 90%以上

---

## 関連実装

### リファクタリング対象ファイル
- `src/presentation/ui/scenes/RankUpScene.ts` - 1,011行（リファクタリング対象）

### 依存サービス・型定義（既存）
```typescript
// 型定義
interface IEventBus { ... }
interface IRankService { ... }
type Quality = 'C' | 'B' | 'A' | 'S';
type Rank = 'G' | 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
type TestState = 'NotStarted' | 'InProgress' | 'Completed' | 'Failed';
interface RankTestTask { ... }
interface RankTest { ... }
interface Artifact { ... }
interface RankUpReward { ... }
```

### 共通ユーティリティ（TASK-0053）
- `UIBackgroundBuilder` - 背景パネル生成（Builderパターン）
- `applyHoverAnimation` / `removeHoverAnimation` - ホバーアニメーション適用/解除
- `BorderLineFactory` - ボーダーライン生成

### テーマ定数（TASK-0054）
- `Colors` - 統一カラーパレット
  - `Colors.background.primary` (0x2a2a3d)
  - `Colors.border.primary` (0x4a4a5d)
  - `Colors.text.primary` (0xffffff)
  - `Colors.text.accent` (0xffd700)
  - `Colors.text.success` (0x44ff44)
- `AnimationPresets` - アニメーションプリセット
  - `AnimationPresets.button.hover`
  - `AnimationPresets.scale.hoverLarge`
  - `AnimationPresets.fade.in` / `AnimationPresets.fade.out`

---

## 設計文書

### コンポーネント分割計画

| コンポーネント | 責務 | 推定行数 |
|---------------|------|---------|
| RankUpScene.ts | シーン管理・コンポーネント統合 | 200行 |
| RankUpHeader.ts | ヘッダー表示（現在ランク・目標） | 150行 |
| RankUpRequirements.ts | 昇格条件一覧表示 | 200行 |
| RankUpTestPanel.ts | 試験開始・結果表示 | 200行 |
| RankUpRewards.ts | 報酬プレビュー表示 | 150行 |

### ディレクトリ構造
```
src/presentation/ui/scenes/
├── RankUpScene.ts           # メインシーン（統合・管理）
└── components/
    └── rankup/
        ├── RankUpHeader.ts       # ヘッダーコンポーネント
        ├── RankUpRequirements.ts # 昇格条件コンポーネント
        ├── RankUpTestPanel.ts    # 試験パネルコンポーネント
        ├── RankUpRewards.ts      # 報酬コンポーネント
        └── index.ts              # バレルエクスポート
```

### 現在の構造分析

1. **定数定義（〜120行）**
   - UI_LAYOUT, ERROR_MESSAGES, UI_TEXT, UI_STYLES, KEYBOARD_KEYS

2. **型定義（〜100行）**
   - IEventBus, Quality, Rank, TestState, RankTestTask, RankTest, Artifact, RankUpReward, IRankService, Button, ArtifactCardUI, GameEventType

3. **BaseComponentクラス（〜30行）**

4. **RankUpSceneクラス（〜750行）**
   - 初期化・サービス取得
   - UI作成（タイトル、ランク表示、課題パネル、ボタン）
   - 画面状態管理（NotStarted, InProgress, Completed, Failed）
   - イベント処理（試験開始、辞退、アーティファクト選択）
   - キーボード対応
   - リソース解放

---

## 注意事項

### 技術的制約
1. 既存の動作を壊さないよう、段階的にリファクタリングする
2. コンポーネント分割後もシーン間の遷移が正常に動作することを確認
3. rexUIプラグインとの互換性を維持する

### セキュリティ要件
- 特になし（クライアントサイドのみ）

### パフォーマンス要件
- コンポーネント分割によりメモリ使用量が大幅に増加しないこと
- イベントリスナーの適切な解除

### any型置き換え対象
現在の`any`型使用箇所（置き換え対象）:
- `startButton: any` → `Button`インターフェース使用
- `declineButton: any` → `Button`インターフェース使用
- rexUIプラグイン関連は型定義が複雑なため、TASK-0059で対応

---

## 参照文書

- [TASK-0055.md](../../../docs/tasks/atelier-guild-rank/phase-7/TASK-0055.md)
- [TASK-0053.md](../../../docs/tasks/atelier-guild-rank/phase-7/TASK-0053.md) - 共通UIユーティリティ
- [TASK-0054.md](../../../docs/tasks/atelier-guild-rank/phase-7/TASK-0054.md) - テーマ定数統一
- [architecture-overview.md](../../../docs/design/atelier-guild-rank/architecture-overview.md)
