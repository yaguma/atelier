# Infrastructure Layer

## 概要
外部システムとの連携を担当するレイヤー。

## 責務
- データ永続化（SaveDataRepository）
- マスターデータ読込（ConfigDataLoader）
- 乱数生成（RandomGenerator）
- 外部サービス連携

## 依存関係
- Domain Layerに依存（エンティティの永続化）
- Application Layerのインターフェースを実装

## 主要コンポーネント

### Repositories
- `SaveDataRepository` - セーブデータの保存/読込
- `IPlayerRepository` - プレイヤーデータリポジトリ

### DataLoaders
- `ConfigDataLoader` - JSONマスターデータ読込
- `ICardDataLoader` - カードデータ読込
- `IQuestDataLoader` - 依頼データ読込
- `IStyleDataLoader` - スタイルデータ読込

## データ保存先
- セーブデータ: `Application.persistentDataPath`
- マスターデータ: `Resources/MasterData/`

## 注意事項
- Application Layerで定義されたインターフェースを実装すること
- 具象クラスはDIコンテナ経由で注入すること
