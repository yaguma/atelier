# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

「Atelier」は錬金術をテーマにしたギルドランク制デッキ構築RPGプロジェクト。

このリポジトリは2つのプロジェクトを含む:
- **atelier-guild-rank/**: Phaser 3 + TypeScript版（メイン開発）
- **Assets/**: Unity 6版（初期プロトタイプ、現在非アクティブ）

---

## Quick Reference

### Development Commands (atelier-guild-rank/)

```bash
cd atelier-guild-rank

# Development
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Build for production

# Testing
pnpm test             # Run unit/integration tests (Vitest)
pnpm test:watch       # Watch mode
pnpm test:coverage    # With coverage report
pnpm test:e2e         # Run E2E tests (Playwright)
pnpm test:e2e:headed  # E2E with browser visible

# Linting
pnpm lint             # Check with Biome
pnpm lint:fix         # Auto-fix issues
pnpm format           # Format code
```

### Running a Single Test

```bash
# Unit test - specific file
pnpm test tests/unit/deck-service.test.ts

# Unit test - by pattern
pnpm test -t "DeckService"

# E2E - specific file
pnpm test:e2e e2e/specs/game-flow.spec.ts
```

---

## Architecture

### Clean Architecture (4層構造)

```
src/
├── domain/          # ビジネスロジック・エンティティ（依存なし）
├── application/     # ゲームフロー制御・状態管理・イベント調整
├── infrastructure/  # データ永続化・外部連携
├── presentation/    # Phaser Scenes・UI Components
└── shared/          # 共通ユーティリティ・型定義
```

**依存方向**: Presentation → Application → Domain → Infrastructure(IF)

### Path Aliases

```typescript
import { Card } from '@domain/entities/Card';
import { DeckService } from '@domain/services/DeckService';
import { StateManager } from '@application/state/StateManager';
import { SaveDataRepository } from '@infrastructure/repositories/SaveDataRepository';
import { MainScene } from '@presentation/scenes/MainScene';
```

### Key Services

| Layer | Service | 責務 |
|-------|---------|------|
| Domain | DeckService | ドロー・シャッフル・捨て札処理 |
| Domain | GatheringService | ドラフト採取・素材獲得 |
| Domain | AlchemyService | 調合計算・品質決定 |
| Domain | QuestService | 依頼生成・期限管理・報酬計算 |
| Application | StateManager | ゲーム状態の一元管理（イミュータブル） |
| Application | EventBus | 層間のイベント駆動通信 |
| Application | GameFlowManager | シーン遷移・ゲームライフサイクル |

### Phaser Scenes

- **BootScene**: アセットロード・サービス初期化
- **TitleScene**: タイトル・セーブスロット選択
- **MainScene**: メインゲーム（4フェーズ: 依頼受注→採取→調合→納品）
- **ShopScene**: カード・アイテム購入
- **RankUpScene**: 昇格試験
- **GameOverScene / GameClearScene**: 結果画面

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Phaser 3.87+ / rexUI |
| Language | TypeScript 5.x |
| Build | Vite 5.x |
| Package Manager | pnpm 9.x |
| Linter/Formatter | Biome 2.x |
| Unit Test | Vitest |
| E2E Test | Playwright |
| Git Hooks | Lefthook |
| CSS | Tailwind CSS 4.x |

---

## Testing

### Test Structure

```
tests/
├── unit/           # ユニットテスト（Domain/Application層）
├── integration/    # 統合テスト（サービス連携）
└── mocks/          # テスト用モック

e2e/
├── specs/          # E2Eテストスペック
├── pages/          # Page Objects
└── fixtures/       # テストデータ
```

### Coverage Target

- Global: 80%+ (branches, functions, lines, statements)
- Domain層: 90%+

---

## Code Style

Biomeで自動適用:
- インデント: 2スペース
- クォート: シングルクォート
- セミコロン: 必須
- 末尾カンマ: 全て

---

## Task Management

タスクドキュメントは `docs/tasks/atelier-guild-rank/` で管理。

- **overview.md**: 全タスク一覧・フェーズ構成
- **phase-N/TASK-XXXX.md**: 個別タスク詳細

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
