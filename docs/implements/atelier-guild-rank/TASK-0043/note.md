# TASK-0043 開発コンテキストノート

**タスクID**: TASK-0043
**機能名**: 依頼詳細モーダル・受注アニメーション
**作成日**: 2026-01-19

---

## 1. 技術スタック

### フレームワーク・ライブラリ
- **Phaser**: 3.87+ - 2Dゲームエンジン
- **rexUI**: 最新 - Phaser向けUIプラグイン
- **TypeScript**: 5.x - 型安全な開発
- **Vite**: 6.x - 高速ビルド・HMR

### テスト
- **Vitest**: 2.x - ユニットテスト・統合テスト
- **Playwright**: 最新 - E2Eテスト

### 開発ツール
- **Biome**: 2.x - リンター・フォーマッター
- **Lefthook**: 1.x - Git Hooks管理

### 参照元
- docs/design/atelier-guild-rank/architecture-overview.md
- CLAUDE.md

---

## 2. 開発ルール

### Clean Architecture（4層構造）
- **Presentation層**: Phaser Scenes, UI Components（Phaserに依存）
- **Application層**: ゲームフロー制御、状態管理、イベント調整
- **Domain層**: ビジネスロジック、ゲームルール実装（フレームワーク非依存）
- **Infrastructure層**: データ永続化、外部連携、ユーティリティ

**依存方向**: Presentation → Application → Domain → Infrastructure(IF)

### コーディング規約
- インデント: 2スペース
- クォート: シングルクォート
- セミコロン: 必須
- 末尾カンマ: 全て
- Biomeで自動適用

### Path Aliases
```typescript
import { Card } from '@domain/entities/Card';
import { DeckService } from '@domain/services/DeckService';
import { StateManager } from '@application/state/StateManager';
import { SaveDataRepository } from '@infrastructure/repositories/SaveDataRepository';
import { MainScene } from '@presentation/scenes/MainScene';
```

### 参照元
- CLAUDE.md
- docs/design/atelier-guild-rank/architecture-overview.md
- docs/design/atelier-guild-rank/architecture-components.md

---

## 3. 関連実装

### 基底コンポーネント
- **atelier-guild-rank/src/presentation/ui/components/BaseComponent.ts**
  - 全カスタムUIコンポーネントの基底クラス
  - Phaserシーン、コンテナ、rexUIプラグインへのアクセスを提供
  - create()とdestroy()メソッドを実装必須

### モーダル・ダイアログ実装
- **atelier-guild-rank/src/presentation/ui/components/Dialog.ts**
  - モーダルダイアログの基本実装
  - CONFIRM、INFO、CHOICEの3種類のダイアログタイプ
  - オーバーレイ、アニメーション、ボタン処理を提供
  - rexUI Dialogコンポーネントをラップ

- **atelier-guild-rank/src/presentation/ui/components/RewardCardDialog.ts**
  - 報酬カード選択ダイアログの実装例
  - 3枚のカードを表示し、1枚選択またはスキップ
  - カード表示アニメーション（遅延表示）
  - EventEmitter経由でイベント発行

### 依頼受注フェーズUI
- **atelier-guild-rank/src/presentation/ui/phases/QuestAcceptPhaseUI.ts**
  - 依頼受注フェーズ全体のUI管理
  - タイトル、依頼リスト、受注済みリストを表示
  - EventBus経由でQUEST_ACCEPTEDイベントを発行

- **atelier-guild-rank/src/presentation/ui/components/QuestCardUI.ts**
  - 個別依頼をカード形式で表示
  - 依頼者名、セリフ、依頼内容、報酬情報、受注ボタンを表示
  - ホバー時の拡大エフェクト

### テーマ設定
- **atelier-guild-rank/src/presentation/ui/theme.ts**
  - UIコンポーネント共通のテーマ設定
  - カラーパレット、テキストスタイル、ボタンスタイル

### 参照元
- atelier-guild-rank/src/presentation/ui/components/BaseComponent.ts
- atelier-guild-rank/src/presentation/ui/components/Dialog.ts
- atelier-guild-rank/src/presentation/ui/components/RewardCardDialog.ts
- atelier-guild-rank/src/presentation/ui/phases/QuestAcceptPhaseUI.ts
- atelier-guild-rank/src/presentation/ui/components/QuestCardUI.ts

---

## 4. 設計文書

### 要件定義書
- **docs/spec/atelier-guild-rank-requirements.md**
  - ゲーム全体の要件定義
  - 依頼受注フェーズの操作仕様（セクション3.1）
  - 依頼システムの詳細（セクション4.6）

### UI設計文書
- **docs/design/atelier-guild-rank/ui-design/screens/quest-accept.md**
  - 依頼受注フェーズのUI詳細設計
  - ワイヤーフレーム、コンポーネント詳細、状態遷移、イベント詳細、アニメーション詳細
  - **重要**: セクション6「アニメーション詳細」に依頼受注時のアニメーションシーケンスを記載

- **docs/design/atelier-guild-rank/ui-design/screens/common-components.md**
  - 共通UIコンポーネント設計
  - ダイアログ、トースト、ツールチップの実装パターン
  - カラーパレット、テキストスタイル、ボタンスタイル

### アーキテクチャ設計文書
- **docs/design/atelier-guild-rank/architecture-overview.md**
  - システム全体のアーキテクチャ概要
  - レイヤー構造、技術スタック、エラーハンドリング、パフォーマンス最適化

- **docs/design/atelier-guild-rank/architecture-components.md**
  - Application層・Domain層のコンポーネント設計
  - イベントフロー設計、ディレクトリ構造

### 参照元
- docs/spec/atelier-guild-rank-requirements.md
- docs/design/atelier-guild-rank/ui-design/screens/quest-accept.md
- docs/design/atelier-guild-rank/ui-design/screens/common-components.md
- docs/design/atelier-guild-rank/architecture-overview.md
- docs/design/atelier-guild-rank/architecture-components.md

---

## 5. 注意事項

### 技術的制約
- **rexUI依存**: rexUIプラグインの型定義が複雑なため、anyで扱う場合がある
- **テスト環境**: rexUIはテスト環境では動作しないため、モック実装が必要
- **メモリリーク防止**: destroy()メソッドで全てのコンポーネントを確実に破棄

### セキュリティ要件
- ユーザー入力のサニタイズ（該当箇所なし）
- XSS対策（該当箇所なし）

### パフォーマンス要件
- モーダル表示: < 300ms
- アニメーション: 60fps維持
- メモリ使用量: < 10MB（コンポーネント単体）
- オブジェクトプール使用でメモリ最適化

### アニメーション設計
- **表示アニメーション**: alpha: 0→1, scale: 0.8→1, ease: 'Back.Out', duration: 300ms
- **非表示アニメーション**: alpha: 1→0, scale: 1→0.8, ease: 'Quad.In', duration: 200ms
- **受注成功アニメーション**: 成功テキスト表示 → スケールアップ＆フェードアウト → パネル縮小
- **カード移動アニメーション**: 受注後にカードをサイドバーへ移動 (x/y/scale変更, duration: 400ms)

### イベントバス利用
- **イベント名**: `QUEST_ACCEPTED`
- **ペイロード**: `{ quest: Quest }`
- **発行元**: QuestAcceptPhaseUI
- **購読者**: MainScene, QuestPanel

### テストカバレッジ目標
- Domain層: 90%+
- Application層: 80%+
- Presentation層: E2Eテストで主要フロー

### 参照元
- docs/design/atelier-guild-rank/architecture-overview.md
- docs/design/atelier-guild-rank/ui-design/screens/quest-accept.md
- atelier-guild-rank/src/presentation/ui/components/BaseComponent.ts

---

## 6. TASK-0043固有の情報

### タスク概要
依頼カードをクリックした際に詳細情報を表示するモーダルと、依頼受注時のアニメーションを実装する。

### 完了条件
- [ ] 依頼詳細モーダル実装
- [ ] モーダル開閉アニメーション
- [ ] 受注成功アニメーション
- [ ] 受注後のカード移動アニメーション
- [ ] 単体テスト実装

### 信頼性レベル
- 🟡 黄信号: 全項目（要件定義書から妥当な推測）

### 実装ファイル
- **QuestDetailModal**: atelier-guild-rank/src/presentation/ui/components/QuestDetailModal.ts
- **QuestAcceptPhaseUI** (修正): atelier-guild-rank/src/presentation/ui/phases/QuestAcceptPhaseUI.ts

### 参照元
- docs/tasks/atelier-guild-rank/phase-5/TASK-0043.md

---

## まとめ

- **技術スタック**: Phaser 3.87+, rexUI, TypeScript 5.x, Vitest, Playwright
- **アーキテクチャ**: Clean Architecture（4層構造）
- **主要な参考実装**: Dialog.ts, RewardCardDialog.ts, QuestCardUI.ts
- **重要な設計文書**: quest-accept.md, common-components.md
- **注意事項**: rexUI依存、メモリリーク防止、アニメーション設計
