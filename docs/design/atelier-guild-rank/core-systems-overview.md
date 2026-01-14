# コアシステム設計書

**バージョン**: 1.4.0
**作成日**: 2026-01-01
**更新日**: 2026-01-14
**対象**: アトリエ錬金術ゲーム（ギルドランク制）HTML版・Phaser版

---

## 概要

本ドキュメントは、ゲームの核となるシステム（サービス）の詳細設計を定義する。
ドメインレイヤーのサービスはHTML版・Phaser版で共通であり、Phaser版固有のGame層とイベント連携も含める。

### 信頼性レベル凡例

- 🔵 **青信号**: 要件定義書に詳細記載
- 🟡 **黄信号**: 要件定義書から妥当な推測
- 🔴 **赤信号**: 要件定義書にない推測

---

## 1. システム構成概要

### 1.1 レイヤー構成

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (Phaser Scenes, UI Components, EventBus) / (React/HTML)    │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                         │
│  (GameFlowManager, PhaseManager, UseCases, StateManager)    │
├─────────────────────────────────────────────────────────────┤
│                      Domain Layer                            │
│  (DeckService, GatheringService, AlchemyService, etc.)      │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                       │
│  (MasterDataLoader, SaveDataRepository, RandomGenerator)    │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 システム一覧

| システム名 | 責務 | レイヤー | Phaser連携 | 依存システム |
|-----------|------|---------|-----------|-------------|
| **Phaser固有** |||||
| SceneManager | シーン遷移管理 | Presentation | ○ | - |
| EventBus | イベント配信 | Presentation | ○ | - |
| UIFactory | UIコンポーネント生成 | Presentation | ○ | - |
| **Application** |||||
| GameFlowManager | ゲーム進行制御 | Application | EventBus経由 | PhaseManager, StateManager |
| PhaseManager | フェーズ遷移制御 | Application | EventBus経由 | DeckService, GatheringService, AlchemyService |
| StateManager | ゲーム状態管理 | Application | EventBus経由 | - |
| **Domain（共通）** |||||
| DeckService | デッキ操作・管理 | Domain | - | RandomGenerator |
| GatheringService | 採取処理 | Domain | - | DeckService, MaterialService, InventoryService, ArtifactService |
| AlchemyService | 調合処理 | Domain | - | DeckService, MaterialService, InventoryService, ArtifactService |
| QuestService | 依頼管理 | Domain | - | InventoryService, ContributionCalculator |
| ContributionCalculator | 貢献度計算 | Domain | - | ArtifactService |
| RankService | ランク管理 | Domain | - | QuestService |
| ShopService | ショップ機能 | Domain | - | DeckService, InventoryService |
| ArtifactService | アーティファクト管理 | Domain | - | MasterDataLoader |
| MaterialService | 素材の品質・属性計算 | Domain | - | MasterDataLoader, RandomGenerator |
| InventoryService | インベントリ管理 | Domain | - | ArtifactService |

---


## 関連文書

- [インフラストラクチャシステム](core-systems-infrastructure.md)
- [コアサービス](core-systems-core-services.md)
- [サポートサービス](core-systems-support-services.md)
- [データスキーマ設計](data-schema.md)
- [アーキテクチャ設計](architecture.md)
