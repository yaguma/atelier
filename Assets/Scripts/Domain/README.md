# Domain Layer

## 概要
ビジネスルールとエンティティを担当するレイヤー。

## 責務
- エンティティの定義（Card, Quest, Player）
- 値オブジェクト（CardAttributes, QuestRewards）
- イベント定義（CardPlayedEvent, QuestCompletedEvent）
- ビジネスルールのカプセル化

## 依存関係
- 他のレイヤーに依存しない（純粋なドメインモデル）

## 主要コンポーネント

### Entities
- `Card` - カードエンティティ
- `Quest` - 依頼エンティティ
- `Player` - プレイヤー状態
- `Style` - 錬金術スタイル

### ValueObjects
- `CardAttributes` - カード属性値
- `QuestRequirements` - 依頼達成条件
- `QuestRewards` - 依頼報酬

### Events
- `IEvent` - イベント基底インターフェース
- `CardPlayedEvent` - カードプレイ完了時
- `QuestCompletedEvent` - 依頼達成時
- `TurnStartedEvent` / `TurnEndedEvent` - ターン開始/終了時
- `ExplosionEvent` - 暴発発生時
- `GameOverEvent` - ゲーム終了時

## 注意事項
- Unity依存のコードを含めないこと
- 外部フレームワークに依存しないこと
- ドメインルールはこのレイヤーに集約すること
