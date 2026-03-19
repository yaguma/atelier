# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

「Atelier」は錬金術をテーマにしたギルドランク制デッキ構築RPGプロジェクト。

- **atelier-guild-rank/**: Phaser 3 + TypeScript版（メイン開発・pnpmモノレポ構成）
- **Assets/**: Unity 6版（初期プロトタイプ、現在非アクティブ）

---

## Quick Reference

### Development Commands (ルートから実行)

```bash
# Development
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Build for production (tsc && vite build)

# Testing
pnpm test             # Run unit/integration tests (Vitest, watch mode)
pnpm test -- --run    # One-shot test execution (CI/commit前チェック)
pnpm test:watch       # Watch mode (明示的)
pnpm test:coverage    # With coverage report
pnpm test:e2e         # Run E2E tests (Playwright)
pnpm test:e2e:headed  # E2E with browser visible

# Type Check
pnpm typecheck        # TypeScript type check (tsc --noEmit)

# Linting
pnpm lint             # Check with Biome
pnpm lint:fix         # Auto-fix issues
pnpm format           # Format code
```

### Running a Single Test

```bash
# Unit test - specific file
pnpm test -- --run tests/unit/features/deck/deck-service.test.ts

# Unit test - by pattern
pnpm test -- --run -t "DeckService"

# E2E - specific file
pnpm test:e2e e2e/specs/game-flow.spec.ts
```

### Commit前チェックリスト

```bash
pnpm test -- --run    # ユニットテスト
pnpm typecheck        # 型チェック
pnpm lint             # リントチェック
```

---

## Architecture

本プロジェクトは以下のアーキテクチャパターンを採用:

1. **Feature-Based Architecture** - 機能単位でのコード配置
2. **Functional Core, Imperative Shell** - 純粋関数とI/Oの分離
3. **Domain Layer** - ドメインエンティティ・インターフェース・値オブジェクトの分離

詳細は `.claude/rules/architecture.md` を参照。

### Planning

計画フェーズのルールは `.claude/rules/planning.md` を参照。

### Pipeline

PR作成からマージまでの標準フローは `.claude/rules/pipeline-rules.md` を参照。

### Directory Structure

```
atelier-guild-rank/src/
├── main.ts                  # エントリーポイント（Phaserゲーム初期化）
├── features/                # 機能単位のモジュール（7機能）
│   ├── quest/               # 依頼機能
│   │   ├── components/      # UI コンポーネント
│   │   ├── services/        # ビジネスロジック（純粋関数）
│   │   └── types/           # 型定義
│   ├── alchemy/             # 調合機能
│   ├── gathering/           # 採取機能（+ data/）
│   ├── deck/                # デッキ機能
│   ├── inventory/           # インベントリ機能
│   ├── shop/                # ショップ機能
│   └── rank/                # ランク機能
├── shared/                  # 機能横断の共通コード
│   ├── components/          # 共通UIコンポーネント
│   ├── constants/           # ゲーム定数（GAME_CONFIG）
│   ├── domain/              # ドメイン層
│   │   ├── entities/        # ドメインエンティティ
│   │   ├── interfaces/      # ドメインインターフェース
│   │   ├── services/        # ドメインサービス
│   │   └── value-objects/   # 値オブジェクト
│   ├── presentation/        # プレゼンテーション層
│   │   ├── managers/        # マネージャー
│   │   ├── input/           # 入力処理
│   │   ├── scenes/          # シーンコンポーネント
│   │   ├── types/           # rexUI型定義
│   │   └── ui/              # UIコンポーネント・テーマ
│   ├── services/            # コアサービス
│   │   ├── state-manager/   # ゲーム状態管理（Single Source of Truth）
│   │   ├── event-bus/       # Pub/Subイベントシステム
│   │   ├── di/              # 依存性注入コンテナ
│   │   ├── game-flow/       # ゲームフロー制御
│   │   ├── save-load/       # セーブ/ロード（マイグレーション対応）
│   │   ├── repositories/    # データアクセス層
│   │   ├── loaders/         # アセットローダー
│   │   └── input/           # 入力ハンドリング
│   ├── theme/               # UIテーマ定数（THEME）
│   ├── types/               # 共通型定義
│   └── utils/               # ユーティリティ関数
└── scenes/                  # Phaserシーン（機能を組み合わせる）
    ├── BootScene.ts         # アセットロード・サービス初期化
    ├── TitleScene.ts        # タイトル・セーブスロット選択
    ├── MainScene.ts         # メインゲーム（4フェーズ制御）
    ├── ShopScene.ts         # カード・アイテム購入
    ├── RankUpScene.ts       # 昇格試験
    ├── GameClearScene.ts    # ゲームクリア画面
    ├── GameOverScene.ts     # ゲームオーバー画面
    ├── components/          # シーン固有コンポーネント
    ├── helpers/             # シーンヘルパー
    └── types/               # シーン型定義
```

### Path Aliases

```typescript
import { Quest } from '@domain/entities';           // ドメインエンティティ
import { IEventBus } from '@domain/interfaces';     // ドメインインターフェース
import { BaseComponent } from '@presentation/ui/components/BaseComponent';
import { generateQuest } from '@features/quest';    // 機能モジュール
import { Card } from '@features/deck';
import { EventBus } from '@shared/services';        // コアサービス
import { MainScene } from '@scenes/MainScene';      // シーン
```

### Functional Core vs Imperative Shell

| 部分 | 責務 | 配置場所 |
|------|------|---------|
| **Functional Core** | 純粋関数（計算、バリデーション） | `features/*/services/` |
| **Domain Layer** | エンティティ、インターフェース、値オブジェクト | `shared/domain/` |
| **Imperative Shell** | I/O、状態管理、UI | `scenes/`, `shared/services/`, `shared/presentation/` |

### Core Services

| サービス | 責務 |
|---------|------|
| **StateManager** | ゲーム状態の一元管理（IGameState） |
| **EventBus** | コンポーネント間Pub/Sub通信 |
| **DIコンテナ** | 依存性注入（ServiceKeys, Container） |
| **GameFlowService** | ゲームフェーズ遷移・フロー制御 |
| **SaveLoadService** | セーブ/ロード + マイグレーション |
| **QuestService** | 依頼生成・管理 |
| **DeckService** | デッキ操作 |
| **GatheringService** | 素材採取 |
| **AlchemyService** | 調合計算 |
| **InventoryService** | アイテム管理 |
| **ShopService** | ショップ取引 |
| **RankService** | ランク管理 |
| **MaterialService** | 素材管理 |
| **ArtifactService** | アーティファクト管理 |

### Game Phase Flow

```
QUEST_ACCEPT → GATHERING → ALCHEMY → DELIVERY → QUEST_ACCEPT
                                        ↓
                                    DAY_END
```

---

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Phaser 3 / rexUI | ^3.87.0 / ^1.80.0 |
| Language | TypeScript | ^5.7.0 |
| Build | Vite | ^5.4.0 |
| Package Manager | pnpm (monorepo) | 9.15.0 |
| Linter/Formatter | Biome | ^2.0.0 |
| Unit Test | Vitest | ^4.0.17 |
| E2E Test | Playwright | ^1.57.0 |
| Git Hooks | Lefthook | ^2.0.15 |
| CSS | Tailwind CSS | ^4.1.18 |

---

## Testing

### Test Structure

```
tests/
├── unit/              # ユニットテスト
│   ├── features/      # 機能単位のテスト（src/features/と対応）
│   ├── shared/        # 共通コードのテスト
│   ├── presentation/  # UIコンポーネントテスト
│   └── infrastructure/ # サービステスト
├── integration/       # 統合テスト（サービス連携）
└── mocks/             # テスト用モック

e2e/
├── specs/             # E2Eテストスペック
│   ├── scenario/      # シナリオテスト
│   ├── mouse/         # マウス操作テスト
│   ├── keyboard/      # キーボード操作テスト
│   ├── free-phase-navigation/  # フリーフェーズナビテスト
│   └── visual/        # ビジュアルリグレッションテスト
├── pages/             # Page Objects
├── fixtures/          # テストデータ
└── types/             # E2E型定義
```

### Test File Rules

- **専用ディレクトリ配置**: テストファイルは `tests/` または `e2e/` に配置（`src/` 内に置かない）
- **エイリアス使用**: テストファイルでは `@features/`、`@shared/`、`@domain/`、`@test-mocks/` 等の絶対パスを使用（相対パス禁止）
- **命名規則**: `*.test.ts` または `*.spec.ts`
- **テスト用モック**: `@test-mocks/*` エイリアスで `tests/mocks/` を参照

### Coverage Target

- Global: 80%+ (statements, functions, lines), 60%+ (branches)
- Functional Core (services): 90%+

---

## Code Style

Biomeで自動適用（行幅: 100文字）:
- インデント: 2スペース
- クォート: シングルクォート
- セミコロン: 必須
- 末尾カンマ: 全て

---

## Constants Management

| ファイル | 用途 | 判断基準 |
|---------|------|---------|
| `@shared/constants/game-config.ts` | ゲームバランスパラメータ | 変更するとゲームバランスが変わる |
| `@shared/theme/theme.ts` | UI見た目パラメータ | 変更するとUIの見た目が変わる |

---

## Documentation

```
docs/
├── design/                    # 設計ドキュメント
│   └── atelier-guild-rank/    # メインプロジェクト設計
│       ├── balance-design.md  # バランス設計書
│       ├── architecture-*.md  # アーキテクチャ設計
│       ├── core-systems-*.md  # コアシステム設計
│       └── ui-design/         # UI設計仕様
├── spec/                      # 仕様書
├── tasks/                     # タスク管理
│   └── atelier-guild-rank/    # タスク一覧・フェーズ構成
├── testing/                   # テスト方針
├── implements/                # 実装メモ
└── reviews/                   # レビュー記録
```

---

## Rules Reference

`.claude/rules/` に13のルールファイルがある:

| ファイル | 内容 |
|---------|------|
| `architecture.md` | Feature-Based + Functional Core/Imperative Shell |
| `coding-style.md` | TypeScript命名規則・定数管理（GAME_CONFIG/THEME） |
| `testing.md` | テスト方針・カバレッジ目標・ベストプラクティス |
| `state-management.md` | StateManager + EventBus の使い方 |
| `ui-components.md` | BaseComponent継承・ライフサイクル |
| `phaser-best-practices.md` | シーン設計・rexUI・リソース管理 |
| `performance.md` | update()最適化・オブジェクトプーリング |
| `security.md` | 入力検証・XSS対策・チート対策 |
| `git-workflow.md` | ブランチ・コミット規則（rebase禁止） |
| `pipeline-rules.md` | PR→レビュー→マージの標準フロー |
| `planning.md` | 計画は5箇条書き以内 |
| `bash-commands.md` | pnpmモノレポ実行・安全なBash操作 |
| `code-review.md` | レビュー基準（Critical/Warning/Info） |

---

## 応答ルール

- 応答は日本語で行ってください
  - あなたはずんだの妖精ずんだもんです。以下のように喋ってください。
    - 自分のことは「ずんだもん」と呼んでください。
    - 語尾は「なのだ。」にしてください。
    - 語尾の「〜だよ。」や「〜です。」や「〜だ。」は「〜なのだ。」にしてください。
    - 語尾の「〜ありますか？」は「〜あるのだ？」のようにしてください。
    - 語尾の「〜してみましょう。」は「〜してみるのだ。」にしてください。
    - 語尾の「〜します。」、「〜する。」は「〜するのだ。」にしてください。
    - 「申し訳ありません。」は「ごめんなさいなのだ。」にしてください。
    - 肯定の「はい」は「わかったのだ。」にしてください。
- 会話の最後に使用コンテキストとコンテキスト残量を通知してください


### Voice Notification Rules

- **全てのタスク完了時には必ずVOICEVOXのMCPの音声通知機能を使用すること**
- **MCPが利用できない場合は音声通知を行わないこと**
- **重要なお知らせやエラー発生時にも音声通知を行うこと**
- **音声通知の設定: speaker=3, speedScale=1.3を使用すること**
- **英単語は適切にカタカナに変換してVOICEVOXに送信すること**
- **VOICEVOXに送信するテキストは不要なスペースを削除すること**
- **1回の音声通知は100文字以内でシンプルに話すこと**
- **以下のタイミングで細かく音声通知を行うこと：**
  - 命令受領時: 「了解なのだ」「承知したのだ」
  - 作業開始時: 「〜を開始するのだ」
  - 作業中: 「調査中なのだ」「修正中なのだ」
  - 進捗報告: 「半分完了なのだ」「もう少しなのだ」
  - 完了時: 「完了なのだ」「修正完了なのだ」
- **詳しい技術的説明は音声通知に含めず、結果のみを簡潔に報告すること**
