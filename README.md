# Atelier

錬金術をテーマにしたデッキ構築型ローグライトゲーム

## 概要

「Atelier」は、錬金術をテーマにしたデッキ構築型ローグライトゲームです。プレイヤーは錬金術師として、カードを組み合わせてアイテムを生成し、ダンジョンを攻略していきます。

## 主な特徴

- **3つの錬金スタイル**: 素材重視、触媒重視、バランス型から選択可能
- **カード組み合わせシステム**: 素材カードと触媒カードを組み合わせてアイテムを生成
- **ローグライトマップ**: ランダムに生成されるマップで毎回異なる冒険を楽しめる
- **シード値対応**: 同じマップを再プレイ可能

## 技術スタック

- **Unity**: 6000.2.10f1 (Unity 6)
- **Platform**: Windows Standalone
- **Resolution**: 1920x1080
- **.NET**: Standard 2.1
- **Scripting Backend**: Mono

## 必要なパッケージ

- Unity Test Framework: 1.6.0
- Newtonsoft Json: 3.2.1
- Unity UI (uGUI): 2.0.0 (TextMeshPro統合)

## セットアップ手順

### 前提条件

- Unity 6000.2.10f1 のインストール
- Unity Hub のインストール

### プロジェクトを開く

1. Unity Hub を起動
2. 「Add」ボタンをクリック
3. このプロジェクトのルートディレクトリを選択
4. Unity 6000.2.10f1 を選択してプロジェクトを開く

### 初回起動時の設定

プロジェクトを初めて開いた後、以下の手順を実行してください:

1. **プロジェクト設定の確認**
   - `Edit > Project Settings` を開く
   - 以下の設定を確認:
     - Player > Resolution: 1920x1080
     - Player > Other Settings > API Compatibility Level: .NET Standard 2.1
     - Quality > VSync Count: Every V Blank
     - Quality > Anti Aliasing: 2x Multi Sampling

### ビルド方法

1. `File > Build Settings` を開く
2. Platform を `Windows Standalone` に設定
3. `Build` ボタンをクリック
4. ビルド出力先を指定して実行

## 完了した機能

### TASK-0001: Unityプロジェクトセットアップ ✅

- **実装日**: 2025-11-09
- **概要**: Unity 6000.2.10f1 プロジェクトの初期設定
- **設定内容**:
  - 解像度: 1920x1080 (Fullscreen Window)
  - .NET API Compatibility Level: .NET Standard 2.1
  - Scripting Backend: Mono
  - VSync: Every V Blank
  - Anti Aliasing: 2x Multi Sampling
- **インストール済みパッケージ**:
  - Unity Test Framework 1.6.0
  - Newtonsoft Json 3.2.1
  - Unity UI (uGUI) 2.0.0 (TextMeshPro統合)
- **動作確認**: Unity Editorでの動作確認完了 ✅

詳細は `docs/implements/atelier/TASK-0001/` を参照してください。

### TASK-0002: フォルダ構造作成

- **実装日**: 2025-11-08
- **概要**: Unityプロジェクトのフォルダ構造とアセット配置
- **作成内容**:
  - 27個のディレクトリを作成
  - レイヤー構造準拠のScriptsフォルダ構成 (Core/Domain/Application/Infrastructure/Presentation/Tests)
  - 7つの基本シーンファイル (Boot/Title/StyleSelect/Map/Quest/Merchant/Result)
  - 4つの設定ファイル (card_config.json, quest_config.json, alchemy_style_config.json, map_generation_config.json)
- **フォルダ構造**:
  - `Assets/Scenes/`: ゲームシーン格納
  - `Assets/Scripts/`: レイヤー構造でスクリプト管理
  - `Assets/Prefabs/`: UI/Cardsのプレハブ格納
  - `Assets/Sprites/`: 画像アセット格納
  - `Assets/Resources/Config/`: 設定ファイル格納
  - `Assets/Resources/Audio/`: BGM/SE格納
- **動作確認**: フォルダ構造、シーンファイル、設定ファイルの配置を検証完了

詳細は `/home/syagu/work/atelier/docs/implements/atelier/TASK-0002/` を参照してください。

### TASK-0004: ConfigDataLoader実装

- **実装日**: 2025-11-09
- **概要**: Resources.Load()を使用した設定データローダーの実装
- **実装内容**:
  - ConfigDataLoaderクラスの実装 (Infrastructure層)
  - Domain層クラスの追加 (Card.cs, Quest.cs, AlchemyStyle.cs)
  - JSON設定ファイルの更新 (サンプルデータ追加)
  - 合計13ファイル (新規9ファイル、更新4ファイル)
- **主な機能**:
  - `LoadCardConfig()`: カード設定の読み込み
  - `LoadQuestConfig()`: クエスト設定の読み込み
  - `LoadAlchemyStyleConfig()`: 錬金スタイル設定の読み込み
  - `LoadMapGenerationConfig()`: マップ生成設定の読み込み
- **エラーハンドリング**:
  - ファイルが存在しない場合は空の設定オブジェクトを返す
  - JSON解析エラー時はログ出力してデフォルト値を返す
- **動作確認**: C#コンパイル、JSON構文チェック完了 ✅

詳細は `docs/implements/atelier/TASK-0004/` を参照してください。

### TASK-0005: RandomGenerator実装

- **実装日**: 2025-11-09
- **概要**: シード値管理とランダム生成クラスの実装
- **実装内容**:
  - RandomGeneratorクラスの実装 (Infrastructure層)
  - System.Randomを使用した乱数生成
  - シード値による再現可能な乱数列
  - 合計1ファイル (新規1ファイル)
- **主な機能**:
  - コンストラクタ: シード値をnullable引数で受け取る
  - `Next()`: 0以上int.MaxValue未満のランダム整数
  - `Next(int maxValue)`: 0以上maxValue未満のランダム整数
  - `Next(int minValue, int maxValue)`: minValue以上maxValue未満のランダム整数
  - `NextDouble()`: 0.0以上1.0未満のランダム浮動小数点数
  - `GetCurrentSeed()`: 現在のシード値を取得
  - `ResetWithSeed(int seed)`: 新しいシード値でリセット
- **特徴**:
  - シード値指定で同じ乱数列が再現される
  - シード値nullでランダムシードを使用
  - マップ生成などで同じシード値を使用することで再現可能なゲームプレイを実現
- **動作確認**: C#コンパイル、コード品質チェック完了 ✅

詳細は `docs/implements/atelier/TASK-0005/` を参照してください。

### TASK-0006: ErrorHandler実装 ✅

- **実装日**: 2025-11-10
- **概要**: エラーハンドリングシステムの実装
- **実装内容**:
  - ErrorHandlerクラスの実装 (Infrastructure層)
  - エラーハンドリングメソッド (静的クラス)
  - EditModeテストコードの作成
  - 合計2ファイル (新規2ファイル)
- **主な機能**:
  - `HandleSaveError(Exception ex)`: セーブエラーハンドリング (EDGE-002: ディスク容量不足)
  - `HandleLoadError(Exception ex)`: ロードエラーハンドリング (EDGE-001: セーブデータ破損)
  - `HandleConfigLoadError(string configName, Exception ex)`: 設定ファイル読み込みエラー
  - `HandleGeneralError(string message, Exception ex)`: 一般的なエラーハンドリング
  - `ShowErrorDialog(string message)`: エラーダイアログ表示 (Unity Editor対応)
- **エラー対応**:
  - EDGE-001: セーブデータ破損時 - "セーブデータが破損しています。新規ゲームとして開始します。"
  - EDGE-002: ディスク容量不足時 - "セーブデータの保存に失敗しました。ディスク容量を確認してください。"
- **特徴**:
  - 日本語エラーメッセージ (NFR-005)
  - Debug.LogError/LogWarning によるログ出力
  - Unity Editor でのダイアログ表示 (#if UNITY_EDITOR)
  - Phase 2 でのUI統合準備完了
- **動作確認**: C#コンパイル、テストコード実装完了 ✅

詳細は `docs/implements/atelier/TASK-0006/` を参照してください。

## 開発状況

現在Phase 1（インフラ基盤構築）を進行中

- [x] TASK-0001: Unityプロジェクトセットアップ ✅ 完了 (2025-11-09)
- [x] TASK-0002: フォルダ構造作成 ✅ 完了 (2025-11-08)
- [x] TASK-0003: SaveDataRepository実装 ✅ 完了 (2025-11-08)
- [x] TASK-0004: ConfigDataLoader実装 ✅ 完了 (2025-11-09)
- [x] TASK-0005: RandomGenerator実装 ✅ 完了 (2025-11-09)
- [x] TASK-0006: ErrorHandler実装 ✅ 完了 (2025-11-10)
- [ ] TASK-0007: ObjectPool実装

## トラブルシューティング

### WSL環境での注意事項

WSL (Windows Subsystem for Linux) 環境では、Unity Editor を直接実行できません。
以下の方法で Unity Editor にアクセスしてください:

1. **Windows 側で Unity Editor を実行**
   - Unity Hub を Windows 側で起動
   - WSL パス (例: `\\wsl$\Ubuntu\home\syagu\work\atelier`) を開く

2. **VS Code Remote WSL を使用**
   - VS Code の Remote WSL 拡張機能を使用して WSL 内のプロジェクトを編集
   - Unity Editor は Windows 側で実行

## 参考資料

- [Unity 公式ドキュメント](https://docs.unity3d.com/)
- [Unity 2021.3 LTS リリースノート](https://unity.com/releases/editor/whats-new/2021.3.0)
- [TextMeshPro ドキュメント](https://docs.unity3d.com/Packages/com.unity.textmeshpro@3.0/manual/index.html)

## ライセンス

MIT License