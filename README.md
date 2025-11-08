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

- **Unity**: 2021.3 LTS以降
- **Platform**: Windows Standalone
- **Resolution**: 1920x1080
- **.NET**: Standard 2.1

## 必要なパッケージ

- TextMeshPro: 3.0.6
- Unity Test Framework: 1.1.31
- Newtonsoft Json: 3.0.2

## セットアップ手順

### 前提条件

- Unity 2021.3 LTS以降のインストール
- Unity Hub のインストール

### プロジェクトを開く

1. Unity Hub を起動
2. 「Add」ボタンをクリック
3. このプロジェクトのルートディレクトリ (`/home/syagu/work/atelier`) を選択
4. Unity 2021.3 LTS 以降のバージョンを選択してプロジェクトを開く

### 初回起動時の設定

プロジェクトを初めて開いた後、以下の手順を実行してください:

1. **TextMeshPro のセットアップ**
   - Unity Editor で `Window > TextMeshPro > Import TMP Essential Resources` を実行
   - TMP Essential Resources が自動的にインポートされます

2. **プロジェクト設定の確認**
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

### TASK-0001: Unityプロジェクトセットアップ

- **実装日**: 2025-11-08
- **概要**: Unity 2021.3 LTS プロジェクトの初期設定
- **設定内容**:
  - 解像度: 1920x1080 (Fullscreen Window)
  - .NET API Compatibility Level: .NET Standard 2.1
  - VSync: Every V Blank
  - Anti Aliasing: 2x Multi Sampling
- **インストール済みパッケージ**:
  - TextMeshPro 3.0.6
  - Unity Test Framework 1.1.31
  - Newtonsoft Json 3.0.2
- **動作確認**: ファイルベースでの設定完了 (Unity Editorでの動作確認が必要)

詳細は `/home/syagu/work/atelier/docs/implements/atelier/TASK-0001/` を参照してください。

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

## 開発状況

現在Phase 1（インフラ基盤構築）を進行中

- [x] TASK-0001: Unityプロジェクトセットアップ (ファイルベース完了、Unity Editorでの確認待ち)
- [x] TASK-0002: フォルダ構造作成 (完了)
- [ ] TASK-0003: SaveDataRepository実装
- [ ] TASK-0004: ConfigDataLoader実装
- [ ] TASK-0005: RandomGenerator実装
- [ ] TASK-0006: ErrorHandler実装
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