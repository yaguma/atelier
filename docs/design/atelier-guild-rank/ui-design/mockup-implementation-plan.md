# UIモックアップ実装計画書

**作成日**: 2026-06-17  
**対象モックアップ**: `docs/design/atelier-guild-rank/ui-design/mockups/01〜08`  
**目的**: 8画面のHTMLモックアップをPhaser3実装に反映する

---

## 方針

- モックアップのレイアウト・色・フォントサイズ・余白を実装の正（ソース・オブ・トゥルース）とする
- 既存コンポーネントを**作り直し**（置き換え）する。インクリメンタルパッチではない
- デザイントークン（`@shared/theme`）は既存のまま流用する
- 実装順は **共通コンポーネント → フェーズUI → 独立シーン** の順とする
- 1フェーズずつIssueを作成してPRを出す（一括マージしない）

---

## 事前確認事項（実装前に決定が必要）

| # | 項目 | 現状 | 決定が必要な理由 |
|---|------|------|----------------|
| A | ゲームクリア統計項目 | result.md と06モックで相違 | モックの項目セットで仕様書を更新するか |
| B | 「もう一度挑戦」ボタン | 06モックにあり、result.mdになし | 機能として実装するか |
| C | 設定ボタンスタイル | 01モックで第3スタイル使用 | デザインガイドに第3スタイルを追加するかセカンダリに統一するか |

---

## 実装ステップ一覧

### Phase 1: 共通コンポーネント（全画面で使用）

#### Step 1-1: HUDBar（ヘッダー）
**対象ファイル**: `src/shared/presentation/ui/components/composite/HUDBar.ts`

モックアップ仕様（02〜05共通 `.header`）:
- 背景: `#FDFAF5` / 下線: `1px solid #E8E0D6` / padding: `8px 16px`
- ランクバッジ: `#D4A76A` 背景 + pill型 (radius.full) + `font-size: 12px`
- 昇格ゲージ: `max-width: 120px` + `height: 8px` + fill色 `#D4A76A`
- HUDアイテム: 日数・Gold・AP を `font-size: 12px font-weight: 500` で表示
- セパレーター: `width:1px height:16px background:#E8E0D6`

#### Step 1-2: SidebarUI（サイドバー）
**対象ファイル**: `src/shared/presentation/ui/components/SidebarUI.ts`

モックアップ仕様（02〜05共通 `.sidebar`）:
- 幅: `150px` / 背景: `#F5EFE6` / 右線: `1px solid #E8E0D6` / padding: `12px 10px`
- セクション見出し: `font-size: 11px font-weight: 500` + 下線 `#E8E0D6`
- 受注依頼カード: `border-radius: 6px border: 1px solid #D9CFC2 padding: 5px 7px`
  - バッジ: `#7BAE7F` pill型 (brand.primary)
- インベントリ行: `justify-content: space-between font-size: 11px` + 下線
- ショップボタン: `margin-top: auto` セカンダリスタイル pill型 `font-size: 11px`

#### Step 1-3: FooterUI（フッター）
**対象ファイル**: `src/shared/presentation/ui/components/FooterUI.ts`

モックアップ仕様（02〜05共通 `.footer`）:
- 背景: `#F0EBE3` / 上線: `1px solid #E8E0D6` / padding: `8px 12px`
- フェーズタブ（PhaseRail）: 上段に配置、`margin-bottom: 8px`
  - アクティブタブ: `#7BAE7F` / 非アクティブ: `color: #8A8A8A` / radius.full
- 手札カード: `width: 52px height: 68px border-radius: 8px border: 1.5px solid #D9CFC2`
  - `font-size: 9px color: #5A5A5A`
- 右ボタン群: 休息(セカンダリ) + 日終了(デンジャー `#D46B6B`)

#### Step 1-4: PhaseRail（フェーズタブ）
**対象ファイル**: `src/shared/presentation/ui/components/composite/PhaseRail.ts`

モックアップ仕様（`.phase-tabs .ptab`）:
- pill型 `padding: 3px 12px font-size: 11px font-weight: 500`
- アクティブ: `background: #7BAE7F color: #fff`
- 非アクティブ: `background: transparent color: #8A8A8A`

---

### Phase 2: フェーズワークスペース

#### Step 2-1: QuestAcceptPhaseUI（依頼受注）
**対象ファイル**: `src/shared/presentation/ui/phases/QuestAcceptPhaseUI.ts`  
**モックアップ**: `02-quest-accept.html`

実装内容:
- フェーズタイトル: `color: #B8A9D4` + 左バー `4px #B8A9D4`
- 依頼元タブ: pill型 / アクティブ `#7BAE7F` / 非アクティブ `#E8E0D6`
- 依頼カードグリッド: 3列 / gap: 12px
  - カード: `border: 2px solid #D9CFC2 border-radius: 12px padding: 12px`
  - 選択時: `border-color: #7BAE7F border-width: 3px` + チェックマーク (pill `#7BAE7F`)
  - セリフ: `font-size: 11px color: #8A8A8A font-style: italic`
  - 依頼条件: `color: #D4A76A font-size: 11px font-weight: 500`
  - 報酬: `font-size: 11px color: #5A5A5A`
  - 期限: `font-size: 10px color: #8A8A8A`
- 詳細パネル: `background: #FFFDE7 border: 2px solid #D4A76A border-radius: 12px`
- 受注数カウント: `font-size: 12px color: #5A5A5A text-align: right`

#### Step 2-2: GatheringPhaseUI（採取）
**対象ファイル**: `src/shared/presentation/ui/phases/GatheringPhaseUI.ts`  
**モックアップ**: `03-gathering.html`

実装内容:
- フェーズタイトル: `color: #8CC084` + 左バー `4px #8CC084`
- 採取地カード: `border: 2px solid #8CC084 border-radius: 12px`
  - 素材プレビューリスト: `background: #F5EFE6 border-radius: 8px`
  - レアタグ: `border-color: #E0A84B color: #795548 background: #FFFDE7`
- ラウンドヘッダー: `background: #FDFAF5 border: 1px solid #E8E0D6 border-radius: 8px`
  - 選択バッジ: `#8CC084` pill型
- ドラフトカードグリッド: 3列
  - カード: `border: 2px solid #D9CFC2 border-radius: 12px padding: 16px 10px text-align: center`
  - 選択時: `border-color: #8CC084 border-width: 3px background: #F0FAF0`
  - 品質バッジ C: `background: #F5F5F5 color: #888` / B: `background: #E8F5E8 color: #4A8A4A`

#### Step 2-3: AlchemyPhaseUI（調合）
**対象ファイル**: `src/shared/presentation/ui/phases/AlchemyPhaseUI.ts`  
**モックアップ**: `04-alchemy.html`

実装内容:
- フェーズタイトル: `color: #D4A76A` + 左バー `4px #D4A76A`
- 2カラムレイアウト (左: レシピ+素材, 右: 品質プレビュー+調合ボタン)
- レシピカード: `border: 2px solid #D4A76A border-radius: 12px`
  - レシピアイコン: pill型 `background: #FFF8E7 border: 2px solid #D4A76A`
  - 素材スロット: `width: 72px border: 1.5px dashed #D9CFC2 border-radius: 8px`
  - 素材セット済: `border: 2px solid #7BAE7F background: #F0FAF0`
- 強化カード行: `background: #F5EFE6 border: 1.5px solid #D9CFC2 border-radius: 10px`
  - 強化アイコン: `background: #EDE5FA border: 1.5px solid #B8A9D4`
  - 使用ボタン: `border: 1.5px solid #B8A9D4 color: #795548`
- 品質プレビューカード: `border: 1.5px solid #D9CFC2 border-radius: 12px`
  - ヘッダー左バー: `3px solid #D4A76A`
  - グレード表示: `font-size: 36px`

#### Step 2-4: DeliveryPhaseUI（納品）
**対象ファイル**: `src/shared/presentation/ui/phases/DeliveryPhaseUI.ts`  
**モックアップ**: `05-delivery.html`

実装内容:
- フェーズタイトル: `color: #E8A87C` + 左バー `4px #E8A87C`
- 2カラムレイアウト (左: 依頼リスト+アイテム選択, 右: 貢献度プレビュー+ボタン)
- 依頼カード: `border: 2px solid #D9CFC2 border-radius: 12px`
  - 選択時: `border-color: #E8A87C border-width: 3px`
  - ヘッダー部: `background: #FFF8F0 border-bottom: 1px solid #E8E0D6`
  - 依頼人アイコン: pill型 `background: #EDE5FA`
  - 期限警告: `color: #D46B6B`
- アイテムチップ: `border: 1.5px solid #D9CFC2 border-radius: 8px`
  - 選択時: `border-color: #E8A87C background: #FFF3EB color: #7A4A2A`
  - 空: `border-style: dashed color: #B0B0B0`
- 報酬表示: Gold `color: #D4A76A` / 貢献度 `color: #7BAE7F`
- セクション見出し左バー: `3px solid #E8A87C`
- 貢献度プレビュー:
  - ゲージ: height `12px` / fill `#D4A76A` / 追加分 `#7BAE7F`
  - マーカー: `2px background: #E0A84B`
- 納品ボタン: プライマリ `#7BAE7F` pill型 `padding: 12px`

---

### Phase 3: 独立シーン

#### Step 3-1: TitleScene（タイトル）
**対象ファイル**: `src/shared/presentation/scenes/TitleScene.ts` + `scenes/components/title/`  
**モックアップ**: `01-title.html`

実装内容:
- 画面サイズ: `640x520`
- 背景: `#FFF8F0 border-radius: 12px border: 1px solid #D9CFC2`
- 装飾円: 3つ (緑 `#7BAE7F`, 琥珀 `#D4A76A`, ラベンダー `#B8A9D4`) / opacity: 0.06
- 装飾アイコン: 3つ / opacity: 0.18
- エンブレム: pill型二重円 + フラスコアイコン `color: #D4A76A font-size: 28px`
- タイトルカード: `background: #fff border: 2px solid #D4A76A border-radius: 16px padding: 24px 48px`
  - サブタイトル: `font-size: 12px color: #8A8A8A letter-spacing: 3px`
  - メインタイトル: `font-size: 28px font-weight: 500`
  - アクセント: `color: #D4A76A`
  - ディバイダー: `width: 48px height: 2px background: #D4A76A`
  - JP副題: `font-size: 14px color: #5A5A5A letter-spacing: 2px`
- ボタンリスト: 幅 `220px` / gap `10px`
  - 新規ゲーム: プライマリ pill型 `width: 100% padding: 12px font-size: 14px`
  - コンティニュー: セカンダリ `border: 2px solid #D9CFC2` pill型
  - 設定: 薄セカンダリ `border: 1.5px solid #E8E0D6 color: #8A8A8A font-size: 13px`
- バージョン表示: `position: absolute bottom: 12px right: 16px font-size: 11px color: #B0B0B0`

#### Step 3-2: GameClearScene（ゲームクリア）
**対象ファイル**: `src/shared/presentation/scenes/GameClearScene.ts`  
**モックアップ**: `06-game-clear.html`

実装内容:
- 装飾円: 2つ (琥珀 `#D4A76A`, 草色 `#7BAE7F`) / opacity: 0.06
- CLEARバッジ: `background: #FFFDE7 border: 2px solid #E0A84B` pill型 / `color: #795548 letter-spacing: 2px`
- ランク表示パネル: `border: 3px solid #E0A84B border-radius: 20px padding: 20px 40px`
  - ランク文字: `font-size: 64px font-weight: 500 color: #E0A84B`
  - ディバイダー: `width: 40px height: 2px background: #E0A84B`
  - サブ説明: `font-size: 13px color: #5A5A5A`
  - 称号: `font-size: 20px font-weight: 500`
- 統計パネル: `border: 1.5px solid #D9CFC2 border-radius: 14px padding: 16px 20px`
  - ヘッダー左バー: `3px solid #D4A76A`
  - 統計グリッド（3列）: 総プレイ日数・達成依頼数・総獲得G
    - stat-card: `background: #FFF8F0 border-radius: 10px padding: 10px text-align: center`
    - 数値: `font-size: 22px font-weight: 500`
  - 統計行（リスト）: 調合回数・採取素材数・S品質作成数・最終貢献度
    - `display: flex justify-content: space-between padding: 6px 0 border-bottom: 1px solid #F0EBE3`
- ボタン行: タイトルへ(セカンダリ) + もう一度挑戦(プライマリ) / flex gap: 10px

※統計項目は事前確認事項Bを踏まえ、モックアップ仕様（上記6項目）で実装する

#### Step 3-3: ShopScene（ショップ）
**対象ファイル**: `src/shared/presentation/scenes/ShopScene.ts` + `scenes/components/shop/`  
**モックアップ**: `07-shop.html`

実装内容:
- ヘッダー: `background: #FDFAF5 border-bottom: 1px solid #E8E0D6 padding: 10px 16px`
  - タイトル: ショッピングバッグアイコン + `font-size: 16px`
  - Gold表示: `color: #D4A76A font-size: 14px font-weight: 500`
  - 閉じるボタン: セカンダリ pill型 `font-size: 12px`
- カテゴリサイドバー: `width: 140px background: #F5EFE6 border-right: 1px solid #E8E0D6`
  - カテゴリ行: `border-radius: 10px padding: 8px 10px font-size: 12px`
  - アクティブ: `background: #fff border: 1px solid #D9CFC2 font-weight: 500`
- 商品グリッド: 3列
  - 商品カード: `border: 1.5px solid #D9CFC2 border-radius: 10px padding: 12px text-align: center`
  - 選択時: `border: 2px solid #D4A76A background: #FFF8E7`
  - アイコン: pill型 `width: 44px height: 44px`
  - 価格: `color: #D4A76A font-size: 13px font-weight: 500`
  - タグ NEW: `background: #E8F5E8 color: #4A8A4A` / 人気: `background: #FFF3EB color: #C05020`
- 詳細バー（下固定）: `background: #FDFAF5 border-top: 1px solid #E8E0D6 padding: 12px 16px`
  - 購入ボタン: プライマリ pill型 `padding: 10px 28px`
  - 購入不可時: `background: #C5D9C6 cursor: not-allowed`

#### Step 3-4: RankUpScene（ランク昇格試験）
**対象ファイル**: `src/shared/presentation/scenes/RankUpScene.ts` + `scenes/components/rankup/`  
**モックアップ**: `08-rank-up.html`

実装内容:
- 装飾円: 2つ (琥珀, 草色) / opacity: 0.06
- ヘッダー: `background: linear-gradient(135deg, #FFF8E7, #FFF8F0)` + 下線
  - 試験バッジ: `background: #FFFDE7 border: 2px solid #E0A84B` pill型 `color: #795548`
  - ランク遷移表示: 現在ランク(amber) → 次ランク(green) チップ + 矢印
- スタッフメッセージ: アバター(pill型) + 吹き出し(`border-radius: 12px border-top-left-radius: 4px`)
- 進捗セクション: `border: 1.5px solid #D9CFC2 border-radius: 12px`
  - ヘッダー左バー: `3px solid #D4A76A`
  - 貢献度ゲージ: `height: 14px` gradient fill `#D4A76A → #E0A84B`
  - チェックリスト: 完了(緑 `#F0FAF0`) / 失敗(赤 `#FFF5F5`) / 待機(灰 `#F5F5F5`)
    - アイコン: `width: 20px height: 20px` pill型
- 結果通知: `background: #FFFDE7 border: 1.5px solid #E0A84B border-radius: 10px`
- ボタン行: セカンダリ + プライマリ / flex gap: 10px

---

## ファイル構成（変更・新規）

```
src/shared/presentation/
├── ui/
│   ├── components/
│   │   ├── composite/
│   │   │   ├── HUDBar.ts          ← 作り直し
│   │   │   └── PhaseRail.ts       ← 作り直し
│   │   ├── SidebarUI.ts           ← 作り直し
│   │   └── FooterUI.ts            ← 作り直し
│   └── phases/
│       ├── QuestAcceptPhaseUI.ts  ← 作り直し
│       ├── GatheringPhaseUI.ts    ← 作り直し
│       ├── AlchemyPhaseUI.ts      ← 作り直し
│       └── DeliveryPhaseUI.ts     ← 作り直し
└── scenes/
    ├── TitleScene.ts              ← 作り直し
    ├── GameClearScene.ts          ← 作り直し
    ├── ShopScene.ts               ← 作り直し
    └── RankUpScene.ts             ← 作り直し
```

---

## 実装優先順位

| 順序 | ステップ | 理由 |
|------|---------|------|
| 1 | Step 1-1 HUDBar | 全フェーズ画面で必要 |
| 2 | Step 1-2 SidebarUI | 全フェーズ画面で必要 |
| 3 | Step 1-3/1-4 FooterUI + PhaseRail | 全フェーズ画面で必要 |
| 4 | Step 2-1 QuestAcceptPhaseUI | ゲーム開始直後のフェーズ |
| 5 | Step 2-2 GatheringPhaseUI | —  |
| 6 | Step 2-3 AlchemyPhaseUI | — |
| 7 | Step 2-4 DeliveryPhaseUI | — |
| 8 | Step 3-1 TitleScene | 独立画面 |
| 9 | Step 3-2 GameClearScene | 独立画面 |
| 10 | Step 3-3 ShopScene | 独立画面 |
| 11 | Step 3-4 RankUpScene | 独立画面 |

---

## 変更しないもの

- `@shared/theme/` 配下のデザイントークン（既存値を流用）
- Functional Core（`features/*/services/`）
- ドメインエンティティ・インターフェース
- `BootScene.ts`
- テストコード（UIテストは別途追加を検討）

---

## 完了条件

各ステップの完了条件：
1. `pnpm dev` でブラウザ表示がモックアップと視覚的に一致する
2. `pnpm typecheck` がパスする
3. `pnpm lint` がパスする
4. 既存のユニットテストが全てパスする（`pnpm test -- --run`）
