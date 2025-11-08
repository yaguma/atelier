# Issue作業開始コマンド

指定したIssue番号に対応するタスクの作業を開始します。

## コミット時のIssue番号記載方法

コミットメッセージにIssue番号を含めることで、GitHubで自動的にリンクされます。

### 基本フォーマット

```
<type>: <subject> #<issue-number>

<body>
```

### 例

```
feat: CardSystemクラス実装 #15

- ICardインターフェースの実装
- カードデータベース管理機能
- カード進化機能の追加

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Issueをクローズする場合

```
fix: セーブデータ読み込み処理の修正

Closes #5

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

## Issue番号とタスクIDの対応

| Issue | タスクID | タスク名 |
|-------|---------|---------|
| #3-#9 | TASK-0001~0007 | Phase 1: インフラ基盤 |
| #10-#16 | TASK-0008~0014 | Phase 2: データ構造とカード/依頼 |
| #17-#21 | TASK-0015~0019 | Phase 3: デッキ/マップ/メタ進行 |
| #22-#25 | TASK-0020~0023 | Phase 4: 報酬/商人/実験/魔物 |
| #26-#30 | TASK-0024~0028 | Phase 5: アプリケーション層 |
| #31 | TASK-0029 | Phase 6: オーディオシステム |
| #32-#35 | TASK-0030~0033 | Phase 7: 基本シーン |
| #36-#38 | TASK-0034~0036 | Phase 8: ゲームプレイPart1 |
| #39-#41 | TASK-0037~0039 | Phase 9: ゲームプレイPart2 |
| #42-#44 | TASK-0040~0042 | Phase 10: 統合テスト |
