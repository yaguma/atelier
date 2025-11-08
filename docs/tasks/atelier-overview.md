# Atelier ゲームプロジェクト - タスク管理オーバービュー

## プロジェクト概要

| 項目 | 内容 |
|------|------|
| プロジェクト名 | アトリエ錬金術ゲーム |
| 要件名 | atelier |
| 技術スタック | Unity/C# |
| 総期間 | 約77日（616時間） |
| 総タスク数 | 約70-80タスク |

---

## フェーズ構成

| Phase | タイトル | 工数 | タスク数 | 主な成果物 | ファイル |
|-------|---------|------|---------|-----------|---------|
| 1 | インフラ基盤 | 40h | 7 | SaveDataRepository, ConfigDataLoader等 | [atelier-phase1.md](atelier-phase1.md) |
| 2 | データ構造とカード/依頼システム | 72h | 7 | Card, Quest, CardSystem | [atelier-phase2.md](atelier-phase2.md) |
| 3 | デッキ/マップ/メタ進行システム | 80h | 5 | DeckManager, MapSystem | [atelier-phase3.md](atelier-phase3.md) |
| 4 | 報酬/商人/実験/魔物システム | 64h | 4 | RewardSystem, MerchantSystem | [atelier-phase4.md](atelier-phase4.md) |
| 5 | アプリケーション層 | 72h | 5 | GameManager, EventBus | [atelier-phase5.md](atelier-phase5.md) |
| 6 | オーディオシステム | 16h | 1 | AudioManager | [atelier-phase6.md](atelier-phase6.md) |
| 7 | 基本シーン | 72h | 4 | Boot/Title/StyleSelectScene | [atelier-phase7.md](atelier-phase7.md) |
| 8 | ゲームプレイシーン Part 1 | 96h | 3 | Map/QuestScene | [atelier-phase8.md](atelier-phase8.md) |
| 9 | ゲームプレイシーン Part 2 | 64h | 3 | Merchant/ResultScene | [atelier-phase9.md](atelier-phase9.md) |
| 10 | 統合テスト & 最終調整 | 40h | 3 | 完成版ゲーム | [atelier-phase10.md](atelier-phase10.md) |

**合計**: 616時間 / 42タスク（概算）

---

## タスク番号管理

### タスク番号フォーマット
```
TASK-0001, TASK-0002, TASK-0003, ...
```
- 4桁の数字でゼロパディング
- 連番で管理

### 使用済みタスク番号
- なし（新規プロジェクト）

### 次回開始番号
- **TASK-0001** から開始

---

## マイルストーン定義

| マイルストーン | 条件 | 完了時期 |
|--------------|------|---------|
| **M1**: インフラ基盤完成 | Phase 1 完了 | 約5日後 |
| **M2**: コアシステム完成 | Phase 4 完了 | 約32日後 |
| **M3**: アプリケーション層完成 | Phase 6 完了 | 約43日後 |
| **M4**: プレゼンテーション層完成 | Phase 9 完了 | 約72日後 |
| **M5**: リリース準備完了 | Phase 10 完了 | 約77日後 |

---

## 全体進捗

### フェーズ完了状況

- [ ] Phase 1: インフラ基盤
- [ ] Phase 2: データ構造とカード/依頼システム
- [ ] Phase 3: デッキ/マップ/メタ進行システム
- [ ] Phase 4: 報酬/商人/実験/魔物システム
- [ ] Phase 5: アプリケーション層
- [ ] Phase 6: オーディオシステム
- [ ] Phase 7: 基本シーン
- [ ] Phase 8: ゲームプレイシーン Part 1
- [ ] Phase 9: ゲームプレイシーン Part 2
- [ ] Phase 10: 統合テスト & 最終調整

### マイルストーン達成状況

- [ ] M1: インフラ基盤完成
- [ ] M2: コアシステム完成
- [ ] M3: アプリケーション層完成
- [ ] M4: プレゼンテーション層完成
- [ ] M5: リリース準備完了

---

## 参照ドキュメント

- [要件定義書](../requirements/atelier-requirements.md)
- [技術設計文書](../design/atelier-design.md)
- 各フェーズのタスクファイル（上記テーブル参照）

---

## 備考

- 各フェーズの詳細タスクは、対応する `atelier-phaseN.md` ファイルを参照
- タスク番号は全フェーズで連番管理
- 実装の進捗に応じてチェックボックスを更新すること
- 工数は目安であり、実際の進捗に応じて調整する可能性あり
