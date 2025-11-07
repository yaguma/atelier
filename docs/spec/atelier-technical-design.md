# アトリエ錬金術ゲーム 技術設計書

## 概要

本ドキュメントは、錬金術×ローグライク×デッキ構築ゲーム「アトリエ」の技術設計を記載するのだ。
Unity (C#) を使用した実装を前提とし、要件定義書に基づいた具体的な設計を提供するのだ。

**ターゲットプラットフォーム**: Windows 10以降
**開発環境**: Unity 2021.3 LTS以降
**解像度**: 1920x1080 (フルHD固定)
**アートスタイル**: 2Dドット絵

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|----------|
| v1.2 | 2025-11-07 | 設計書を機能別に8つのファイルに分割し、メンテナンス性を向上 |
| v1.1 | 2025-11-07 | レビュー指摘事項を全て反映（入力システム、アンドゥ機能、報酬・商人システム、実験・魔物ノード、オーディオシステム、コード品質改善） |
| v1.0 | 2025-11-07 | 初版作成。要件定義書に基づく基本設計を完了 |

---

## 設計書の構成

本技術設計書は、メンテナンス性と可読性を向上させるため、以下の8つのファイルに分割されているのだ。

### 📁 設計書ファイル一覧

#### [01. システムアーキテクチャ](./design/01-architecture.md)
システム全体の構造設計を記載するのだ。

**内容:**
- レイヤー構造（Clean Architecture）
- コンポーネント図
- データフロー図（ゲーム全体、カードプレイシーケンス）
- Unityシーン構成と遷移

**主な要件カバレッジ:** REQ-001, REQ-002, REQ-003

---

#### [02. コアシステム](./design/02-core-systems.md)
ゲームの基幹となるシステム（カード、クエスト、デッキ）を記載するのだ。

**内容:**
- コアインターフェース定義（ICard, IQuest, IDeckManager, ISaveDataRepository）
- GameManager実装
- CardSystem（Card, CardAttributes, CardEffect）
- QuestSystem（Quest, QuestRequirements, QuestProgress）
- DeckManager（DrawPile, Hand, DiscardPile管理）

**主な要件カバレッジ:** REQ-010, REQ-011, REQ-012, REQ-013, REQ-014, REQ-015, REQ-033, REQ-034, REQ-035

---

#### [03. ゲームシステム](./design/03-game-systems.md)
マップ、メタプログレッション、イベントバスなどのゲームメカニクスを記載するのだ。

**内容:**
- MapSystem（マップ生成、ノード接続、経路探索）
- MetaProgressionSystem（永続アップグレード、実績）
- EventBus（Pub/Subパターン）
- GameStateManager（状態遷移）

**主な要件カバレッジ:** REQ-020, REQ-021, REQ-022, REQ-023, REQ-024, REQ-040, REQ-041, REQ-042, REQ-043, REQ-044

---

#### [04. UI・入力システム](./design/04-ui-input.md)
ユーザーインタラクション、入力処理、アンドゥ機能を記載するのだ。

**内容:**
- InputManager（キーボード・マウス入力）
- CommandManager（アンドゥ・リドゥ機能）
- ICommandインターフェース
- PlayCardCommand実装例

**主な要件カバレッジ:** REQ-005, REQ-047-1

---

#### [05. 商人・実験・魔物システム](./design/05-merchant-experiment.md)
報酬、商人、実験、魔物ノードに関するシステムを記載するのだ。

**内容:**
- RewardSystem（クエスト報酬）
- MerchantSystem（カード購入・強化・削除）
- ExperimentSystem（成功・失敗の実験メカニクス）
- MonsterSystem（4種類の魔物とドロップ）

**主な要件カバレッジ:** REQ-016-1, REQ-016-2, REQ-036, REQ-037

---

#### [06. オーディオシステム](./design/06-audio.md)
BGM・SE管理、フェード機能を記載するのだ。

**内容:**
- AudioManager実装
- BGM管理（フェードイン・フェードアウト）
- SE管理（オブジェクトプール）
- 音量調整機能

**主な要件カバレッジ:** REQ-049, REQ-050

---

#### [07. データスキーマ](./design/07-data-schema.md)
JSON形式のデータ構造とスキーマを記載するのだ。

**内容:**
- CardData.json（カードマスターデータ）
- QuestData.json（クエストマスターデータ）
- AlchemyStyleData.json（錬金スタイルデータ）
- MapGenerationConfig.json（マップ生成設定）

**主な要件カバレッジ:** REQ-011, REQ-012, REQ-013, REQ-014, REQ-020

---

#### [08. インフラストラクチャ](./design/08-infrastructure.md)
セーブデータ、パフォーマンス最適化、エラーハンドリングなどの基盤システムを記載するのだ。

**内容:**
- CardEffect実装例（5種類）
- SaveData構造（SaveData, RunData, DeckData, MapData, SettingsData）
- SaveDataRepository実装
- ObjectPool（パフォーマンス最適化）
- ErrorHandler（エラー管理）
- ユーティリティクラス

**主な要件カバレッジ:** REQ-013, REQ-045, REQ-046, REQ-048

---

## 設計方針

### 1. Clean Architectureの採用
4層構造（Presentation, Application, Domain, Infrastructure）により、関心の分離と保守性を確保するのだ。

### 2. イベント駆動アーキテクチャ
EventBus（Pub/Subパターン）を採用し、コンポーネント間の疎結合を実現するのだ。

### 3. データ駆動設計
ゲームバランス調整を容易にするため、カード・クエスト・マップ生成などはJSON設定ファイルで管理するのだ。

### 4. テスト容易性
インターフェースを活用し、モックやスタブを使用したユニットテストを可能にするのだ。

### 5. パフォーマンス最適化
- オブジェクトプール（カード、UIエレメント、オーディオソース）
- LINQ最適化（事前計算、ToList()の適切な使用）
- コルーチンの適切な管理

### 6. セキュリティ設計
- セーブデータの暗号化（AES-256）
- チート対策（難読化、サーバー検証の準備）
- 入力検証とサニタイズ

---

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| ゲームエンジン | Unity 2021.3 LTS |
| 言語 | C# / .NET Standard 2.1 |
| UI | Unity UI (uGUI) |
| データ形式 | JSON |
| オーディオ | Unity AudioSource |
| ビルド環境 | Windows 10以降 |
| バージョン管理 | Git |

---

## 開発ガイドライン

### コーディング規約
- C# 命名規則に従う（PascalCase for public, camelCase for private）
- コメントは日本語で記載
- 1クラス1ファイル原則
- 最大行数: 500行/ファイル（超える場合は分割）

### ディレクトリ構造
```
Assets/
├── Scripts/
│   ├── Presentation/     # UI・ビュー層
│   ├── Application/      # アプリケーション層
│   ├── Domain/          # ドメイン層
│   └── Infrastructure/  # インフラ層
├── Resources/
│   ├── Data/            # JSONデータ
│   ├── Audio/           # BGM・SE
│   └── Sprites/         # 2Dアセット
├── Scenes/              # Unityシーン
└── Prefabs/             # プレハブ
```

### Git ブランチ戦略
- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `bugfix/*`: バグ修正

---

## 要件カバレッジ

本設計書は、要件定義書（atelier-requirements.md）の全要件をカバーしているのだ。

**カバレッジ概要:**
- 基本機能: 100% (REQ-001 ~ REQ-024)
- カードシステム: 100% (REQ-010 ~ REQ-015)
- クエストシステム: 100% (REQ-033 ~ REQ-038)
- メタプログレッション: 100% (REQ-040 ~ REQ-044)
- システム設定: 100% (REQ-045 ~ REQ-050)

詳細な要件マッピングは各分割ファイルを参照してほしいのだ。

---

## 参考資料

- [要件定義書](./atelier-requirements.md)
- [受け入れ基準](./atelier-acceptance-criteria.md)
- [ユーザーストーリー](./atelier-user-stories.md)

---

## レビュー・承認

| ロール | 氏名 | 日付 | ステータス |
|--------|------|------|-----------|
| 技術リード | - | 2025-11-07 | ✅ レビュー完了 (v1.1) |
| プロジェクトマネージャー | - | - | 承認待ち |

---

## 次のステップ

1. ✅ 技術設計書レビュー完了
2. ✅ レビュー指摘事項の反映完了
3. ✅ 設計書の分割とメンテナンス性向上
4. ⏭️ タスク分割（/kairo-tasks 実行）
5. ⏭️ 実装フェーズ開始

---

**Document Version:** v1.2
**Last Updated:** 2025-11-07
**Author:** Claude (Zundamon)
**Status:** ✅ Review Complete / Ready for Implementation
