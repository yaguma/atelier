# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

「Atelier」は錬金術をテーマにしたギルドランク制デッキ構築RPGプロジェクト。

> ⚠️ **技術スタック移行が決定済み（2026-07-09）**: v7.0コンセプト（調合主軸モデル）の再設計「atelier-alchemy-core」において、技術スタックを **Godot 4.x + GDScript** へ全面移行することが正式に確定しました。詳細・決定経緯は [`docs/design/atelier-alchemy-core/architecture.md`](docs/design/atelier-alchemy-core/architecture.md)（設計）・[`docs/spec/atelier-alchemy-core/requirements.md`](docs/spec/atelier-alchemy-core/requirements.md) NFR-301（要件）・[`docs/design/atelier-alchemy-core/design-interview.md`](docs/design/atelier-alchemy-core/design-interview.md)（ヒアリング記録）を参照してください。
>
> - **現時点ではGodotプロジェクトはまだスキャフォールディングされていません**（設計文書のみ存在）。実装着手はタスク分割フェーズ（`/tsumiki:kairo-tasks atelier-alchemy-core`）以降です。
> - 下記の「atelier-guild-rank/: Phaser 3 + TypeScript版」は**新規機能開発を継続しない凍結状態**です。バグ修正等が必要な場合を除き、新規実装はGodot版に対して行ってください。
> - このセクション・下記のTech Stack表は、Godotプロジェクトのスキャフォールディングが完了し次第、更新が必要です。

- **atelier-guild-rank/**: Phaser 3 + TypeScript版（旧メイン実装。現在は凍結・新規機能開発なし）
- **Assets/**: Unity 6版（初期プロトタイプ、現在非アクティブ）
- **（未作成）atelier-godot/ 等**: Godot 4.x + GDScript版（新メイン開発。2026-07-09決定、実装未着手）

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

本プロジェクトは以下のアーキテクチャパターンを採用（詳細は `.claude/rules/architecture.md`）:

1. **Feature-Based Architecture** - 機能単位でのコード配置
2. **Functional Core, Imperative Shell** - 純粋関数とI/Oの分離
3. **Domain Layer** - ドメインエンティティ・インターフェース・値オブジェクトの分離

### Path Aliases

```typescript
import { Quest } from '@domain/entities';           // shared/domain/
import { IEventBus } from '@domain/interfaces';     // shared/domain/
import { BaseComponent } from '@presentation/ui/components/BaseComponent'; // shared/presentation/
import { generateQuest } from '@features/quest';    // features/
import { EventBus } from '@shared/services';        // shared/
import { MainScene } from '@scenes/MainScene';      // scenes/
```

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

テスト方針の詳細は `.claude/rules/testing.md` を参照。

- テストファイルは `tests/` または `e2e/` に配置（`src/` 内に置かない）
- テストファイルでは `@features/`、`@shared/`、`@domain/`、`@test-mocks/*` 等の絶対パスを使用
- カバレッジ目標: 全体80%+、Functional Core 90%+

---

## Constants Management

| ファイル | 用途 | 判断基準 |
|---------|------|---------|
| `@shared/constants/game-config.ts` | ゲームバランスパラメータ | 変更するとゲームバランスが変わる |
| `@shared/theme/theme.ts` | UI見た目パラメータ | 変更するとUIの見た目が変わる |

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
