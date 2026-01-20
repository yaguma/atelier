# Atelier Guild Rank - テストドキュメント

このディレクトリには、Atelier Guild Rankプロジェクトのテスト関連ドキュメントが含まれています。

## ドキュメント一覧

### [Playwright Test Plan](./playwright-test-plan.md)

**Playwright Test Agents E2Eテスト計画書**

Playwright Test Agentsを活用した包括的なE2Eテスト計画。Phase 5で実装された7つのUI強化機能と既存のゲームフロー全体を網羅するテストスイートの構築計画が含まれています。

**主要内容**:
- テスト戦略とテストピラミッド
- E2Eテストスイート設計（60ケース計画）
- Page Objects拡張計画（10個のPage Objects）
- Playwright Test Agents活用戦略
- Phase 5 UI強化機能のテストカバレッジ
- 実装ロードマップ（6週間、4フェーズ）
- リソース見積もりとKPI

**テストケース目標**:
- 現状: 17ケース（多数RED）
- 目標: 60ケース（+43ケース、+253%増加）

**優先度順テストカテゴリ**:
1. P0: シーン遷移、ゲームフロー、ドラッグ&ドロップ
2. P1: Phase 5 UI強化（7機能）、4フェーズゲームループ
3. P2: エラーハンドリング、パフォーマンステスト
4. P3: アクセシビリティテスト

## テスト環境

- **E2Eテストツール**: Playwright 1.57.0+
- **単体テストツール**: Vitest 4.0.17+
- **カバレッジ目標**: 80%+
- **CI/CD**: GitHub Actions

## クイックリンク

### テスト実行コマンド

```bash
cd atelier-guild-rank

# E2Eテスト
pnpm test:e2e              # E2Eテスト実行
pnpm test:e2e:headed       # ブラウザ表示付きで実行
pnpm test:e2e:ui           # Playwright UI Mode

# 単体テスト
pnpm test                  # 単体テスト実行
pnpm test:watch            # Watch Mode
pnpm test:coverage         # カバレッジ付き実行
```

### 関連ファイル

- **Playwright設定**: `/atelier-guild-rank/playwright.config.ts`
- **E2Eテスト**: `/atelier-guild-rank/e2e/specs/`
- **Page Objects**: `/atelier-guild-rank/e2e/pages/`
- **Fixtures**: `/atelier-guild-rank/e2e/fixtures/`
- **単体テスト**: `/atelier-guild-rank/tests/unit/`

## 今後の計画

### Phase 1: 基本シーンテスト強化（1週間）
- 既存17ケースをGREEN状態に修正
- BasePage拡張（アニメーション待機、エラーハンドリング）

### Phase 2: Phase 5 UI強化機能テスト（2週間）
- UIComponentPage作成
- 7つのUI強化機能のテスト（14ケース）
- ビジュアルリグレッションテスト基盤構築

### Phase 3: ゲームフローテスト（2週間）
- 4つの新規Page Objects作成
- 4フェーズゲームループのテスト（25ケース）
- クリティカルパステスト（3ケース）

### Phase 4: エッジケース・エラーハンドリング（1週間）
- 境界値テスト、エラーハンドリングテスト
- パフォーマンステスト、アクセシビリティテスト

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-19 | 1.0.0 | テストドキュメント初版作成 |

---

このドキュメントについての質問や提案がある場合は、プロジェクトチームに連絡してください。
