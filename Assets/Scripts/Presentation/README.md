# Presentation Layer

## 概要
UIとユーザー入力を担当するレイヤー。

## 責務
- UI表示・更新（UIManager）
- 入力処理（InputManager）
- シーン管理（SceneManager）
- 画面トランジション（TransitionManager）

## 依存関係
- Application Layerに依存
- Domain Layerには直接依存しない

## 主要コンポーネント
- `UIManager` - UI表示・更新
- `InputManager` - キーボード/マウス入力処理
- `SceneManager` - シーン遷移管理
- `TransitionManager` - 画面トランジション
- `AudioManager` - サウンド再生

## 注意事項
- ビジネスロジックをこのレイヤーに含めないこと
- Application Layerのサービスを通じてドメインにアクセスすること
