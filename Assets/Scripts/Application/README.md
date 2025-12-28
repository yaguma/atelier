# Application Layer

## 概要
ユースケースとサービスを担当するレイヤー。

## 責務
- ゲームロジックの調整（GameService）
- 依頼システム管理（QuestService）
- デッキ操作（DeckService）
- 合成処理（SynthesisService）

## 依存関係
- Domain Layerに依存
- Infrastructure Layerにはインターフェース経由で依存

## 主要コンポーネント
- `GameService` - ゲーム進行管理
- `QuestService` - 依頼システム
- `DeckService` - デッキ操作
- `SynthesisService` - 合成処理

## 注意事項
- Presentation Layerのコンポーネントに依存しないこと
- Infrastructure Layerの具象クラスに直接依存しないこと
