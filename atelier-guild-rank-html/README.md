# アトリエギルドランク HTML版

デッキ構築型錬金術RPGのHTML/TypeScript実装版

## 概要

ギルドランク制のデッキ構築型錬金術RPGです。プレイヤーは見習い錬金術師として、採取、調合、納品を繰り返しながらギルドランクを上げていきます。

## ゲームシステム

- **デッキ構築**: 採取地カード、レシピカード、強化カードでデッキを構築
- **ギルドランク**: G〜Sの8段階ランク制度
- **4フェーズ制**: 依頼受注 → 採取 → 調合 → 納品
- **アーティファクト**: パッシブ効果を持つ永続アイテム

## ディレクトリ構成

```
atelier-guild-rank-html/
├── src/                    # ソースコード
│   ├── domain/            # ドメイン層（ビジネスロジック）
│   ├── application/       # アプリケーション層（ユースケース）
│   ├── infrastructure/    # インフラストラクチャ層（外部システム連携）
│   ├── presentation/      # プレゼンテーション層（UI）
│   └── index.ts           # エントリーポイント
├── public/                 # 静的ファイル
│   ├── index.html
│   └── assets/            # アセット（画像、音声など）
├── data/
│   └── master/            # マスターデータJSON
├── tests/                  # テスト
│   ├── unit/              # ユニットテスト
│   ├── integration/       # 統合テスト
│   └── e2e/               # E2Eテスト
├── package.json
├── tsconfig.json
└── README.md
```

## アーキテクチャ

Clean Architectureに準拠した4層構成：

1. **Domain層**: ゲームのビジネスルールとエンティティ
2. **Application層**: ユースケースとアプリケーションロジック
3. **Infrastructure層**: LocalStorage、マスターデータ読み込み
4. **Presentation層**: UI/UXの実装

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# テスト実行
npm run test

# カバレッジ付きテスト
npm run test:coverage

# Lint
npm run lint

# フォーマット
npm run format
```

## 技術スタック

- **言語**: TypeScript 5.x
- **ビルドツール**: Vite
- **テスト**: Vitest
- **Lint/Format**: ESLint + Prettier

## ライセンス

MIT

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2026-01-02 | 0.1.0 | 初版作成 |
