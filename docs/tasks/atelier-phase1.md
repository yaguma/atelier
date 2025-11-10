# Phase 1: インフラ基盤タスク

**期間**: Week 1-2 (5日間)
**総工数**: 40h
**タスク範囲**: TASK-0001 ~ TASK-0007
**タスクタイプ**: 主にDIRECT

---

## TASK-0001: Unityプロジェクトセットアップ ✅ 完了 (2025-11-09)

**タスクID**: TASK-0001
**GitHub Issue**: [#3](https://github.com/yaguma/atelier/issues/3)
**タスク名**: Unityプロジェクトセットアップ
**推定工数**: 8h
**タスクタイプ**: DIRECT
**要件名**: atelier
**要件リンク**: REQ-001, REQ-002, REQ-003, REQ-006
**完了日**: 2025-11-09

### 依存タスク
なし（初期タスク）

### 実装詳細

#### Unity環境構築
- Unity 6000.2.10f1をインストール 🔵
- プロジェクト名: "Atelier"
- プロジェクトテンプレート: 2D Core
- ターゲットプラットフォーム: Windows Standalone

#### プロジェクト設定
```
Resolution and Presentation:
  - Default Screen Width: 1920
  - Default Screen Height: 1080
  - Fullscreen Mode: Fullscreen Window
  - Run In Background: false

Quality Settings:
  - VSync Count: Every V Blank
  - Anti Aliasing: 2x Multi Sampling

Player Settings:
  - Company Name: [個人開発者名]
  - Product Name: Atelier
  - .NET Profile: .NET Standard 2.1
```

#### Git設定
- .gitignore作成（Unity標準）
- README.md作成
- ライセンス設定（MIT）

#### パッケージインストール
```json
{
  "dependencies": {
    "com.unity.textmeshpro": "3.0.6",
    "com.unity.test-framework": "1.1.31",
    "com.unity.nuget.newtonsoft-json": "3.0.2"
  }
}
```

### 完了条件
- [x] Unity 6000.2.10f1でプロジェクトが起動する 🔵 ✅ 確認済み (2025-11-09)
- [x] 解像度が1920x1080に設定されている 🔵 ✅ 確認済み (2025-11-08)
- [x] .NET Standard 2.1が有効 🔵 ✅ 確認済み (2025-11-08)
- [x] Gitリポジトリが初期化されている 🔵 ✅ 確認済み (2025-11-08)
- [x] TextMeshProが動作する 🔵 ✅ 確認済み (2025-11-09 - Unity 6000.xではuguiに統合)

### テスト要件（DIRECTタスク）
- 空のシーンでプロジェクトが正常にビルドできることを確認
- Unity Editorでエラーが出ないことを確認

---

## TASK-0002: フォルダ構造作成 ✅ 完了 (2025-11-08)

**タスクID**: TASK-0002
**GitHub Issue**: [#4](https://github.com/yaguma/atelier/issues/4)
**タスク名**: フォルダ構造作成
**推定工数**: 4h
**タスクタイプ**: DIRECT
**要件名**: atelier
**要件リンク**: NFR-008
**完了日**: 2025-11-08

### 依存タスク
- TASK-0001: Unityプロジェクトセットアップ

### 実装詳細

#### アセットフォルダ構造
```
Assets/
├── Scenes/
│   ├── BootScene.unity
│   ├── TitleScene.unity
│   ├── StyleSelectScene.unity
│   ├── MapScene.unity
│   ├── QuestScene.unity
│   ├── MerchantScene.unity
│   └── ResultScene.unity
├── Scripts/
│   ├── Core/                 # コアインターフェース
│   ├── Domain/               # ビジネスロジック層
│   ├── Application/          # アプリケーション層
│   ├── Infrastructure/       # インフラ層
│   ├── Presentation/         # UI/View層
│   └── Tests/                # テストコード
│       ├── EditMode/
│       └── PlayMode/
├── Prefabs/
│   ├── UI/
│   └── Cards/
├── Sprites/
│   ├── Cards/
│   ├── UI/
│   ├── Backgrounds/
│   └── Icons/
├── Resources/
│   ├── Config/
│   │   ├── card_config.json
│   │   ├── quest_config.json
│   │   ├── alchemy_style_config.json
│   │   └── map_generation_config.json
│   └── Audio/
│       ├── BGM/
│       └── SE/
├── Materials/
├── Fonts/
└── ThirdParty/
```

#### 設定ファイルのプレースホルダ作成
- card_config.json (空配列)
- quest_config.json (空配列)
- alchemy_style_config.json (空配列)
- map_generation_config.json (デフォルト値)

### 完了条件
- [x] すべてのフォルダが作成されている 🔵 ✅ 完了 (2025-11-08)
- [x] 基本シーンファイルが配置されている 🔵 ✅ 完了 (2025-11-08)
- [x] Resourcesフォルダに設定ファイルが配置されている 🔵 ✅ 完了 (2025-11-08)
- [x] フォルダ構造がレイヤー構造に準拠している 🔵 ✅ 完了 (2025-11-08)

### テスト要件（DIRECTタスク）
- フォルダ構造が設計文書と一致することを目視確認
- Resources.Load()で設定ファイルが読み込めることを確認

---

## TASK-0003: SaveDataRepository実装 ✅ 完了 (2025-11-08)

**GitHub Issue**: [#5](https://github.com/yaguma/atelier/issues/5)
**タスクID**: TASK-0003
**タスク名**: SaveDataRepository実装
**推定工数**: 8h
**タスクタイプ**: DIRECT
**要件名**: atelier
**要件リンク**: REQ-010, REQ-010-1, REQ-011, REQ-012
**完了日**: 2025-11-08

### 依存タスク
- TASK-0002: フォルダ構造作成

### 実装詳細

設計文書 `08-infrastructure.md` の SaveDataRepository 実装を参照 🔵

#### クラス構成
```csharp
namespace Atelier.Infrastructure
{
    // SaveData (ルート構造)
    public class SaveData
    {
        public int Version { get; set; }
        public string SaveDate { get; set; }
        public int SlotIndex { get; set; }
        public RunData CurrentRun { get; set; }
        public MetaProgressionData MetaData { get; set; }
        public SettingsData Settings { get; set; }
    }

    // RunData (1プレイ分)
    public class RunData
    {
        public string StyleId { get; set; }
        public int? Seed { get; set; }
        public int CurrentFloor { get; set; }
        public int Gold { get; set; }
        public DeckData DeckData { get; set; }
        public MapData MapData { get; set; }
    }

    // SaveDataRepository
    public class SaveDataRepository : ISaveDataRepository
    {
        public SaveData LoadSaveData(int slotIndex);
        public void SaveGameData(SaveData data, int slotIndex);
        public bool HasSaveData(int slotIndex);
        public void DeleteSaveData(int slotIndex);
    }
}
```

#### 保存場所
- Application.persistentDataPath/SaveData/save_slot_X.json 🔵

#### エラーハンドリング
- ファイル読み込み失敗時は例外をスロー 🔵
- ディスク容量不足時はエラーメッセージ表示 (EDGE-002) 🔴

### 完了条件
- [x] 3つのセーブスロットが利用可能 (REQ-010-1) 🔵 ✅ 確認済み (2025-11-08)
- [x] JSON形式でセーブ/ロードできる 🔵 ✅ 確認済み (2025-11-08)
- [x] HasSaveData()が正しく動作する 🔵 ✅ 確認済み (2025-11-08)
- [x] DeleteSaveData()が正しく動作する 🔵 ✅ 確認済み (2025-11-08)
- [x] セーブデータが破損していてもクラッシュしない (EDGE-001) 🔴 ✅ 確認済み (2025-11-08)

### テスト要件（DIRECTタスク）
- 各スロットに保存→読み込み→削除のサイクルをテスト
- 破損データを手動作成し、エラーハンドリングを確認
- 3スロット同時保存のテスト

---

**GitHub Issue**: [#6](https://github.com/yaguma/atelier/issues/6)
## TASK-0004: ConfigDataLoader実装 ✅ 完了 (2025-11-09)

**タスクID**: TASK-0004
**タスク名**: ConfigDataLoader実装
**推定工数**: 6h
**タスクタイプ**: DIRECT
**要件名**: atelier
**要件リンク**: NFR-008
**完了日**: 2025-11-09

### 依存タスク
- TASK-0002: フォルダ構造作成

### 実装詳細

設計文書 `08-infrastructure.md` の ConfigDataLoader 実装を参照 🔵

#### クラス構成
```csharp
namespace Atelier.Infrastructure
{
    public static class ConfigDataLoader
    {
        private const string ConfigPath = "Config/";

        public static CardConfig LoadCardConfig();
        public static QuestConfig LoadQuestConfig();
        public static AlchemyStyleConfig LoadAlchemyStyleConfig();
    }

    // 設定データクラス
    public class CardConfig
    {
        public List<Card> Cards;
    }

    public class QuestConfig
    {
        public List<Quest> Quests;
    }

    public class AlchemyStyleConfig
    {
        public List<AlchemyStyle> Styles;
    }
}
```

#### JSONスキーマ
設計文書 `07-data-schema.md` のスキーマに従う 🔵
- card_config.json
- quest_config.json
- alchemy_style_config.json
- map_generation_config.json

#### エラーハンドリング
- ファイルが存在しない場合は空の設定オブジェクトを返す 🟡
- JSON解析エラー時はログ出力してデフォルト値を返す 🔴

### 完了条件
- [x] Resources.Load()で設定ファイルを読み込める 🔵 ✅ 確認済み (2025-11-09)
- [x] JSON解析が正常に動作する 🔵 ✅ 確認済み (2025-11-09)
- [x] ファイル欠損時にエラー処理が動作する 🔴 ✅ 確認済み (2025-11-09)
- [x] 全設定ファイルの読み込みメソッドが実装されている 🔵 ✅ 確認済み (2025-11-09)

### テスト要件（DIRECTタスク）
- サンプルJSONを作成して読み込みテスト
- ファイル欠損時の挙動を確認
- 不正なJSON形式での挙動を確認

**GitHub Issue**: [#7](https://github.com/yaguma/atelier/issues/7)
---

## TASK-0005: RandomGenerator実装 ✅ 完了 (2025-11-09)

**タスクID**: TASK-0005
**タスク名**: RandomGenerator実装
**推定工数**: 4h
**タスクタイプ**: DIRECT
**要件名**: atelier
**要件リンク**: REQ-042
**完了日**: 2025-11-09

### 依存タスク
- TASK-0002: フォルダ構造作成

### 実装詳細

#### クラス構成
```csharp
namespace Atelier.Infrastructure
{
    /// <summary>
    /// シード値管理とランダム生成
    /// </summary>
    public class RandomGenerator
    {
        private System.Random rng;
        private int? currentSeed;

        public RandomGenerator(int? seed = null)
        {
            currentSeed = seed;
            rng = seed.HasValue ? new System.Random(seed.Value) : new System.Random();
        }

        public int Next() => rng.Next();
        public int Next(int maxValue) => rng.Next(maxValue);
        public int Next(int minValue, int maxValue) => rng.Next(minValue, maxValue);
        public double NextDouble() => rng.NextDouble();

        public int? GetCurrentSeed() => currentSeed;

        public void ResetWithSeed(int seed)
        {
            currentSeed = seed;
            rng = new System.Random(seed);
        }
    }
}
```

#### シード値入力機能
- UI入力でシード値を指定可能 (REQ-042) 🔵
- シード値がnullの場合はランダム生成 🟡

### 完了条件
- [x] シード値指定で同じ乱数列が再現される 🔵 ✅ 確認済み (2025-11-09)
- [x] シード値なしでランダム生成される 🔵 ✅ 確認済み (2025-11-09)
- [x] GetCurrentSeed()で現在のシード値を取得できる 🔵 ✅ 確認済み (2025-11-09)

### テスト要件（DIRECTタスク）
- 同じシード値で複数回実行して同じ結果になることを確認
- シード値なしで異なる結果になることを確認

---
**GitHub Issue**: [#8](https://github.com/yaguma/atelier/issues/8)

## TASK-0006: ErrorHandler実装

**タスクID**: TASK-0006
**タスク名**: ErrorHandler実装
**推定工数**: 6h
**タスクタイプ**: DIRECT
**要件名**: atelier
**要件リンク**: EDGE-001, EDGE-002

### 依存タスク
- TASK-0002: フォルダ構造作成

### 実装詳細

設計文書 `08-infrastructure.md` の ErrorHandler 実装を参照 🔵

#### クラス構成
```csharp
namespace Atelier.Infrastructure
{
    public static class ErrorHandler
    {
        public static void HandleSaveError(Exception ex)
        {
            Debug.LogError($"Save Error: {ex.Message}");
            ShowErrorDialog("セーブデータの保存に失敗しました。");
        }

        public static void HandleLoadError(Exception ex)
        {
            Debug.LogError($"Load Error: {ex.Message}");
            ShowErrorDialog("セーブデータが破損しています。");
        }

        public static void HandleConfigLoadError(string configName, Exception ex)
        {
            Debug.LogError($"Config Load Error [{configName}]: {ex.Message}");
        }

        private static void ShowErrorDialog(string message)
        {
            // UIマネージャー経由でエラーダイアログ表示
        }
    }
}
```

#### エラーケース
- EDGE-001: セーブデータ破損時 🔴
- EDGE-002: ディスク容量不足時 🔴

### 完了条件
- [ ] 各種エラーケースに対応したメソッドが実装されている 🔵
- [ ] エラーメッセージが日本語で表示される (NFR-005) 🔵
- [ ] ログ出力が正しく動作する 🔵

### テスト要件（DIRECTタスク）
- 各エラーハンドラーを呼び出してログが出力されることを確認
- エラーダイアログの表示を目視確認
**GitHub Issue**: [#9](https://github.com/yaguma/atelier/issues/9)

---

## TASK-0007: ObjectPool実装

**タスクID**: TASK-0007
**タスク名**: ObjectPool実装
**推定工数**: 4h
**タスクタイプ**: DIRECT
**要件名**: atelier
**要件リンク**: NFR-002, NFR-003

### 依存タスク
- TASK-0002: フォルダ構造作成

### 実装詳細

設計文書 `08-infrastructure.md` の ObjectPool 実装を参照 🔵

#### クラス構成
```csharp
namespace Atelier.Infrastructure
{
    public class ObjectPool<T> where T : Component
    {
        private Queue<T> pool;
        private T prefab;
        private Transform parent;

        public ObjectPool(T prefab, int initialSize, Transform parent = null)
        {
            this.prefab = prefab;
            this.parent = parent;
            pool = new Queue<T>();

            for (int i = 0; i < initialSize; i++)
            {
                var obj = Object.Instantiate(prefab, parent);
                obj.gameObject.SetActive(false);
                pool.Enqueue(obj);
            }
        }

        public T Get()
        {
            if (pool.Count > 0)
            {
                var obj = pool.Dequeue();
                obj.gameObject.SetActive(true);
                return obj;
            }
            else
            {
                var obj = Object.Instantiate(prefab, parent);
                return obj;
            }
        }

        public void Return(T obj)
        {
            obj.gameObject.SetActive(false);
            pool.Enqueue(obj);
        }
    }
}
```

#### 用途
- カードUI表示の最適化 🟡
- パーティクルエフェクトの再利用 🟡

### 完了条件
- [ ] Get()でプールからオブジェクトを取得できる 🔵
- [ ] Return()でオブジェクトをプールに返却できる 🔵
- [ ] プールが空の時に新規生成される 🔵
- [ ] プールサイズが正しく管理される 🔵

### テスト要件（DIRECTタスク）
- ダミープレハブで Get() → Return() のサイクルをテスト
- プールサイズを超えて取得した時の挙動を確認

---

## Phase 1 完了条件

### 全体完了条件
- [ ] すべてのタスク(TASK-0001~0007)が完了している
- [ ] Unityプロジェクトが正常にビルドできる
- [ ] セーブ/ロード機能が基本動作する
- [ ] 設定ファイルの読み込みが動作する
- [ ] エラーハンドリングが実装されている

### 次フェーズへの引き継ぎ事項
- SaveDataRepositoryのインターフェースが確定している
- ConfigDataLoaderで読み込むJSONスキーマが確定している
- RandomGeneratorがシード値管理に使用可能である
- ObjectPoolがUI最適化に使用可能である

---

**信頼性レベル凡例**:
- 🔵 青信号: 設計文書から明確
- 🟡 黄信号: 設計文書から妥当な推測
- 🔴 赤信号: 設計文書にない推測
