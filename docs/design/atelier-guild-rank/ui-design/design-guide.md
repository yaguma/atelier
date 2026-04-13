# UIデザインガイド — 水彩ファンタジースタイル

**バージョン**: 1.0.0
**作成日**: 2026-04-13
**対象**: Atelier Guild Rank — 錬金術師ギルドランク制デッキ構築RPG

---

## 1. デザインコンセプト

### 1.1 世界観

> 「草花とハーブが香る、明るく居心地のいい錬金術工房」

プレイヤーは駆け出しの錬金術師。穏やかな街で依頼を受け、野原で素材を集め、工房で調合し、依頼者に届ける。
UIは**水彩画のような柔らかさ**と**絵本のような親しみやすさ**で、この世界の温もりを表現する。

### 1.2 デザイン原則

| 原則 | 説明 | 具体例 |
|------|------|--------|
| **柔らかさ** | 硬い直線・鋭角を避け、丸みと優しさを持たせる | 大きめの角丸、パステルカラー、ふんわりした影 |
| **温もり** | 冷たいダーク系ではなく、暖色系の温かみを基調にする | クリーム背景、ゴールドのアクセント、木目調のボーダー |
| **明瞭さ** | 装飾に埋もれず、情報が一目でわかる | 適切なコントラスト、アイコン+テキスト併記、余白の確保 |
| **統一感** | 全フェーズで同じデザイン言語を使う | 共通のカードスタイル、統一されたボタン、一貫した枠線 |

### 1.3 キーワード

`やわらかい` `あたたかい` `絵本的` `水彩にじみ` `草花` `ハーブ` `クリーム紙` `手触り感`

---

## 2. カラーパレット

### 2.1 基本パレット（Surface / 面）

| トークン名 | 用途 | Hex | Phaser値 | 備考 |
|-----------|------|-----|----------|------|
| `surface.base` | 画面全体の背景 | #FFF8F0 | 0xFFF8F0 | 温かみのあるオフホワイト |
| `surface.card` | カード・パネルの背景 | #FFFFFF | 0xFFFFFF | ピュアホワイト（紙の白さ） |
| `surface.elevated` | 浮き上がった要素（モーダル等） | #FFFFFF | 0xFFFFFF | shadow で高さを表現 |
| `surface.sidebar` | サイドバー背景 | #F5EFE6 | 0xF5EFE6 | やや暗めのクリーム |
| `surface.header` | ヘッダー / PhaseRail 背景 | #FDFAF5 | 0xFDFAF5 | 薄いクリーム |
| `surface.footer` | フッター背景 | #F0EBE3 | 0xF0EBE3 | ややトーンダウン |
| `surface.overlay` | オーバーレイ | #000000 alpha 0.3 | — | 半透明黒 |

### 2.2 ブランドカラー

| トークン名 | 用途 | Hex | Phaser値 | 備考 |
|-----------|------|-----|----------|------|
| `brand.primary` | メインアクション（受注・決定） | #7BAE7F | 0x7BAE7F | 草色（錬金術のハーブ） |
| `brand.primaryHover` | ホバー時 | #6A9D6E | 0x6A9D6E | やや暗い草色 |
| `brand.secondary` | 補助アクション | #D4A76A | 0xD4A76A | ゴールデンベージュ（調合の琥珀） |
| `brand.secondaryHover` | ホバー時 | #C49A5C | 0xC49A5C | やや暗いベージュ |
| `brand.accent` | 強調・注目 | #E8A87C | 0xE8A87C | コーラルピーチ |

### 2.3 テキストカラー

| トークン名 | 用途 | Hex | コントラスト比(base上) |
|-----------|------|-----|----------------------|
| `text.primary` | 見出し・重要テキスト | #3D3D3D | 10.2:1 |
| `text.secondary` | 本文・説明 | #5A5A5A | 6.8:1 |
| `text.tertiary` | 補助・ヒント | #8A8A8A | 3.5:1 |
| `text.disabled` | 無効状態 | #B0B0B0 | 2.4:1 |
| `text.onPrimary` | brand.primary 上の白文字 | #FFFFFF | 4.6:1 |
| `text.onSecondary` | brand.secondary 上の文字 | #3D3D3D | 5.2:1 |
| `text.link` | リンク・インタラクティブ | #5B8CB8 | 5.0:1 |

### 2.4 ステータスカラー

| トークン名 | 用途 | Hex | Phaser値 |
|-----------|------|-----|----------|
| `status.success` | 成功・達成 | #6AAF6A | 0x6AAF6A |
| `status.warning` | 警告・注意 | #E0A84B | 0xE0A84B |
| `status.error` | エラー・失敗 | #D46B6B | 0xD46B6B |
| `status.info` | 情報・ヒント | #6B9FCC | 0x6B9FCC |

### 2.5 ボーダーカラー

| トークン名 | 用途 | Hex | Phaser値 |
|-----------|------|-----|----------|
| `border.default` | 標準の枠線 | #D9CFC2 | 0xD9CFC2 |
| `border.subtle` | 薄い区切り線 | #E8E0D6 | 0xE8E0D6 |
| `border.strong` | 強調された枠線 | #B8A99A | 0xB8A99A |
| `border.focus` | フォーカスリング | #7BAE7F | 0x7BAE7F |

### 2.6 品質カラー（従来通り維持）

| 品質 | Hex | 変更なし |
|------|-----|---------|
| D | #A0A0A0 | グレー |
| C | #FFFFFF | 白 |
| B | #6AAF6A | グリーン（brand.primary に寄せる） |
| A | #6B9FCC | ブルー（status.info に寄せる） |
| S | #E0A84B | ゴールド（status.warning に寄せる） |

### 2.7 フェーズカラー（アイコン・インジケーター用）

フェーズごとに**アクセントカラー**を持たせるが、背景やカード枠は共通スタイルを使う。

| フェーズ | アクセント色 | Hex | 用途 |
|---------|------------|-----|------|
| 依頼受注 | ラベンダー | #B8A9D4 | タブアイコン、セクション見出しのアクセント |
| 採取 | リーフグリーン | #8CC084 | 同上 |
| 調合 | アンバー | #D4A76A | 同上 |
| 納品 | コーラル | #E8A87C | 同上 |

---

## 3. タイポグラフィ

### 3.1 フォントファミリー

| 用途 | フォント | 理由 |
|------|---------|------|
| 日本語テキスト全般 | `"M PLUS Rounded 1c"` | 丸ゴシック。水彩・絵本の柔らかい印象に合う |
| 数値・ステータス | `"M PLUS Rounded 1c"` | 統一感を優先 |
| フォールバック | `sans-serif` | — |

### 3.2 サイズスケール

| トークン | サイズ | 用途 | ウェイト |
|---------|--------|------|---------|
| `text.xs` | 12px | キャプション、注釈 | Regular |
| `text.sm` | 14px | 補助テキスト、ラベル | Regular |
| `text.md` | 16px | 本文、カード内テキスト | Regular |
| `text.lg` | 20px | セクション見出し | Bold |
| `text.xl` | 24px | フェーズタイトル | Bold |
| `text.2xl` | 32px | 画面タイトル（タイトルシーン等） | Bold |

### 3.3 行間

- 本文: 1.5倍
- 見出し: 1.2倍
- カード内コンパクト: 1.3倍

---

## 4. シェイプ（形状）

### 4.1 角丸（Radius）

水彩スタイルでは**大きめの角丸**を基本とし、柔らかい印象を与える。

| トークン | 値 | 用途 |
|---------|-----|------|
| `radius.sm` | 6px | 小さなバッジ、タグ |
| `radius.md` | 12px | カード、パネル、入力欄 |
| `radius.lg` | 18px | ボタン、ダイアログ |
| `radius.xl` | 24px | 大きなモーダル、トースト |
| `radius.full` | 9999px | ピル型ボタン、丸アイコン |

### 4.2 ボーダー

| トークン | 値 | 用途 |
|---------|-----|------|
| `border.thin` | 1px | 区切り線、薄い枠 |
| `border.regular` | 2px | カード枠、パネル枠（**標準**） |
| `border.thick` | 3px | フォーカスリング、選択状態 |

### 4.3 シャドウ

Phaser で影を表現する方法: glow / stroke / 透明度付き背景矩形

| トークン | 用途 | 表現方法 |
|---------|------|---------|
| `shadow.sm` | カード（通常） | offsetY: 2, blur: 6, alpha: 0.08 |
| `shadow.md` | カード（ホバー）、モーダル | offsetY: 4, blur: 12, alpha: 0.12 |
| `shadow.lg` | ダイアログ、ドロップダウン | offsetY: 8, blur: 24, alpha: 0.16 |
| `shadow.glow` | フォーカス・選択状態 | blur: 8, color: brand.primary, alpha: 0.3 |

---

## 5. コンポーネントスタイル

### 5.1 カード（全フェーズ共通）

**最重要: 全フェーズのカード/パネルはこの共通スタイルを使う。**

```
┌─────────────────────────────┐
│  ╭───────────────────────╮  │  外枠: border.default (2px), radius.md (12px)
│  │                       │  │  背景: surface.card (#FFFFFF)
│  │  [アイコン] タイトル   │  │  影: shadow.sm
│  │                       │  │
│  │  説明テキスト          │  │  padding: spacing.md (16px)
│  │                       │  │
│  │  ステータス情報        │  │  ホバー時: shadow.md + border.strong
│  │                       │  │  選択時: border.focus (3px) + shadow.glow
│  ╰───────────────────────╯  │
└─────────────────────────────┘
```

| 状態 | 枠線 | 影 | 背景 |
|------|------|-----|------|
| 通常 | `border.default` 2px | `shadow.sm` | `surface.card` |
| ホバー | `border.strong` 2px | `shadow.md` | `surface.card` |
| 選択 | `border.focus` 3px | `shadow.glow` | `surface.card` |
| 無効 | `border.subtle` 1px | なし | `surface.card` alpha 0.6 |

### 5.2 ボタン

#### プライマリボタン（決定・受注・納品）

```
╭──────────────╮
│   ラベル      │  背景: brand.primary, テキスト: text.onPrimary
╰──────────────╯  radius: radius.lg (18px), padding: 12px 24px
```

| 状態 | 背景 | テキスト |
|------|------|---------|
| 通常 | `brand.primary` | `text.onPrimary` |
| ホバー | `brand.primaryHover` | `text.onPrimary` |
| 押下 | `brand.primaryHover` + 内側影 | `text.onPrimary` |
| 無効 | `#D0D0D0` | `text.disabled` |

#### セカンダリボタン（キャンセル・戻る）

| 状態 | 背景 | 枠線 | テキスト |
|------|------|------|---------|
| 通常 | 透明 | `border.default` 2px | `text.primary` |
| ホバー | `surface.sidebar` | `border.strong` 2px | `text.primary` |

#### デンジャーボタン（日終了・破棄）

| 状態 | 背景 | テキスト |
|------|------|---------|
| 通常 | `status.error` | `#FFFFFF` |
| ホバー | やや暗い error | `#FFFFFF` |

### 5.3 フェーズタブ / PhaseRail

```
╭─────╮ ╭─────╮ ╭─────╮ ╭─────╮
│ 依頼 │ │ 採取 │ │ 調合 │ │ 納品 │   背景: surface.header
╰─────╯ ╰─────╯ ╰─────╯ ╰─────╯   radius: radius.lg (18px)
  ^^active
```

| 状態 | 背景 | テキスト | 枠線 |
|------|------|---------|------|
| アクティブ | `brand.primary` | `text.onPrimary` (白) Bold | なし |
| 非アクティブ | 透明 | `text.secondary` | なし |
| ホバー（非アクティブ） | `surface.sidebar` | `text.primary` | なし |
| 無効 | 透明 | `text.disabled` | なし |

### 5.4 サイドバー

| 要素 | スタイル |
|------|---------|
| 背景 | `surface.sidebar` |
| セクション見出し | `text.lg` Bold, `text.primary`, 下線: `border.subtle` |
| アイテムリスト | カード風（`surface.card`, `border.default`, `radius.sm`） |
| ショップボタン | セカンダリボタン スタイル |

### 5.5 HUDBar（ヘッダー）

| 要素 | スタイル |
|------|---------|
| 背景 | `surface.header` + 下線 `border.subtle` |
| ランク表示 | `text.lg` Bold + バッジ（`brand.secondary` 背景） |
| 数値（ゴールド・AP等） | `text.md` Bold, `text.primary` |
| プログレスバー | track: `border.subtle`, fill: `brand.secondary` |

### 5.6 コンテンツエリア（Workspace）

| 要素 | スタイル |
|------|---------|
| 背景 | `surface.base` |
| フェーズタイトル | `text.xl` Bold, フェーズアクセント色 |
| セクション見出し | `text.lg` Bold, `text.primary`, 左にフェーズアクセント色のバー (4px) |
| 空状態テキスト | `text.md`, `text.tertiary`, 中央揃え |

### 5.7 ContextPanel（右パネル）

| 要素 | スタイル |
|------|---------|
| 背景 | `surface.card` + `border.default` 左辺のみ |
| ヘッダー | `text.lg` Bold |
| 内容 | カード風パネルを積み重ね |

### 5.8 フッター

| 要素 | スタイル |
|------|---------|
| 背景 | `surface.footer` + 上線 `border.subtle` |
| 手札スロット | `surface.card`, `border.default`, `radius.md` |
| アクションボタン | プライマリ / デンジャー ボタンスタイル |

### 5.9 モーダル / ダイアログ

| 要素 | スタイル |
|------|---------|
| オーバーレイ | `surface.overlay` (black alpha 0.3) |
| パネル | `surface.elevated`, `radius.xl`, `shadow.lg` |
| タイトル | `text.xl` Bold |
| ボタン | プライマリ + セカンダリ の組み合わせ |

### 5.10 トースト通知

| 要素 | スタイル |
|------|---------|
| 背景 | `surface.card` + 左辺にステータスカラーのバー (4px) |
| テキスト | `text.md`, `text.primary` |
| 影 | `shadow.md` |
| radius | `radius.xl` |

---

## 6. アイコン・装飾

### 6.1 フェーズアイコン

各フェーズに統一的な絵文字アイコンを使う（将来的にSVGアイコンに置き換え可能）。

| フェーズ | アイコン | アクセント色 |
|---------|---------|------------|
| 依頼受注 | 📋 | ラベンダー (#B8A9D4) |
| 採取 | 🌿 | リーフグリーン (#8CC084) |
| 調合 | ⚗️ | アンバー (#D4A76A) |
| 納品 | 📦 | コーラル (#E8A87C) |

### 6.2 セクション見出しのアクセントバー

```
  ┃  本日の依頼        ← 左に4pxのフェーズアクセント色バー
```

フェーズ内のセクション見出しには、そのフェーズのアクセント色で左端にバー（4px幅）を付ける。
これにより、全フェーズで統一されたレイアウトを維持しつつ、フェーズの個性を出す。

### 6.3 装飾は最小限に

- テクスチャ画像は使わない（パフォーマンス配慮）
- 装飾は色・角丸・影のみで表現
- 将来的にアセット（花の枠線、水彩テクスチャ等）を追加する余地を残す

---

## 7. スペーシング

### 7.1 基本スケール（8px ベース）

| トークン | 値 | 用途 |
|---------|-----|------|
| `spacing.xs` | 4px | 極小間隔（アイコンとテキストの間） |
| `spacing.sm` | 8px | 小間隔（カード内要素間） |
| `spacing.md` | 16px | 標準間隔（カード間、セクション内パディング） |
| `spacing.lg` | 24px | 大間隔（セクション間） |
| `spacing.xl` | 32px | 極大間隔（画面レベルの余白） |

### 7.2 カード内のスペーシング

```
╭──── padding: md (16px) ────╮
│                            │
│  [Icon] Title   ← gap: sm │
│                            │
│  Description     ← mt: sm │
│                            │
│  Status          ← mt: md │
│                            │
╰────────────────────────────╯
```

---

## 8. モーション（アニメーション）

### 8.1 タイミング

| トークン | 値 | 用途 |
|---------|-----|------|
| `motion.instant` | 60ms | 即時フィードバック（ボタン押下） |
| `motion.fast` | 150ms | ホバー、フォーカス遷移 |
| `motion.base` | 250ms | カード展開、パネル切替 |
| `motion.slow` | 400ms | モーダル表示、フェーズ遷移 |

### 8.2 イージング

| 用途 | イージング |
|------|----------|
| 表示（入り） | `Cubic.easeOut` |
| 非表示（出） | `Cubic.easeIn` |
| 状態変化 | `Sine.easeInOut` |
| 強調（バウンス） | `Back.easeOut` |

### 8.3 prefers-reduced-motion 対応

`prefersReducedMotion()` が true の場合、全アニメーションを `motion.instant` (60ms) に短縮する。

---

## 9. 現状からの移行指針

### 9.1 変更が大きい箇所

| 箇所 | 現状 | 変更後 |
|------|------|--------|
| サイドバー背景 | ダークネイビー (0x111827) | クリーム (surface.sidebar) |
| HUDBar背景 | ダークネイビー | 薄いクリーム (surface.header) |
| フッター背景 | ダークグレー | クリーム (surface.footer) |
| PhaseRail | ダークネイビー + 青紫タブ | クリーム背景 + 草色アクティブタブ |
| フェーズタブ色 | 青紫 (0x6366f1) | 草色 (brand.primary) |
| ゲーム全体背景 | Beige (#F5F5DC) | オフホワイト (surface.base) |
| ボタン | SaddleBrown / 赤 / 青紫が混在 | brand.primary (草色) 統一 |

### 9.2 変更が小さい箇所

| 箇所 | 備考 |
|------|------|
| タイトルシーン | 茶色系を残しつつ、フォントとボタンを統一 |
| カードタイプ色 | 採取=緑、レシピ=青、強化=紫 は維持 |
| 品質カラー | 微調整（パステル寄りに） |
| フォント | M PLUS Rounded 1c を継続使用 |

### 9.3 移行ステップ（推奨順序）

1. **theme.ts / design-tokens.ts のカラー値を更新** — 影響範囲が大きいが、トークン経由で参照している箇所は一括で変わる
2. **各PhaseUIのハードコード色を DesignTokens 参照に統一** — カード枠・背景をトークン参照に書き換え
3. **サイドバー・HUDBar・フッターの背景色を変更** — レイアウト系composite コンポーネント
4. **PhaseRail / タブのスタイルを変更** — ブランドカラーに合わせる
5. **ボタンスタイルの統一** — プライマリ / セカンダリ / デンジャーの3種に集約

---

## 10. ルール: 実装時の参照規約

### 10.1 色の参照

```typescript
// OK: DesignTokens 経由
import { DesignTokens } from '@shared/theme';
const bg = DesignTokens.colors.background.primary;

// OK: Colors 直接参照
import { Colors } from '@shared/theme';
const border = Colors.border.primary;

// NG: ハードコード
const bg = 0x333333;
const border = 0xffd54f;
```

### 10.2 カード / パネルの作成

```typescript
// OK: 共通スタイルに従う
const card = scene.add.rectangle(x, y, w, h, Colors.background.card);
card.setStrokeStyle(Border.regular, Colors.border.default);
// 角丸は rexUI.roundRectangle を使う場合のみ

// NG: フェーズ独自の色をハードコード
const card = scene.add.rectangle(x, y, w, h, 0xffd54f);
```

### 10.3 ボタンの作成

3種類のバリアントのみ使用する:
- **プライマリ**: 確定アクション（受注・決定・納品）
- **セカンダリ**: キャンセル・戻る・補助
- **デンジャー**: 日終了・破棄・不可逆操作

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-04-13 | 1.0.0 | 初版作成。水彩ファンタジースタイルのデザインガイド |
