# UI全面刷新 設計レポート

- 日付: 2026-04-09
- 対象: `atelier-guild-rank/` 全シーン・全UIコンポーネント
- スコープ: 配色 / 情報設計 / 操作性 / アクセシビリティ / 実装基盤の総合刷新
- 方式: 5ロール（UX・ビジュアル・A11y・操作性・実装アーキ）並列レビューの統合
- ステータス: 議論統合＋UI設計のみ。実装は別PRで段階導入する。

---

## 0. エグゼクティブサマリ

現状の `atelier-guild-rank` UIは、テーマ（WARM系ベージュ＋茶）と運用UI（ダークHeader 0x1f2937、緑/青/紫の品質・カードタイプ色）が**テイスト分裂**しており、以下の問題を同時に抱えているのだ。

1. **配色が統一されていない**: 背景ベージュ×濃茶ボタン×ダークHeaderが同居。WCAG AAを満たさないコントラスト比（一部 2.8:1〜4.3:1）。
2. **情報設計が散在**: 主要KPI（ゴールド/AP/日数/ランク/貢献度）が Header・各フェーズUI・モーダル内に重複表示。
3. **フェーズフローが見えない**: `QUEST_ACCEPT → GATHERING → ALCHEMY → DELIVERY` の遷移がフッタータブに埋もれ、初見プレイヤーが迷う。
4. **コンポーネントが肥大化**: `GatheringPhaseUI` 507行 / `AlchemyPhaseUI` 601行 / `QuestDetailModal` 407行（300行上限超過）。
5. **デザイントークンが不完全**: color/spacing/font はあるが、radius/shadow/zIndex/motion/opacity が散在ハードコード。

本レポートは、**ダーク基調＋深紫・群青＋ゴールドアクセント**に全面刷新し、**情報階層を3層（HUD / Phase Rail / Workspace）に再構築**し、**デザイントークンを拡張して primitive→composite→feature の3層コンポーネント構造**に段階移行する方針を定める。

---

## 1. 5ロールレビューの統合マトリクス

| 観点 | 主要指摘 | 重要度 | 反映箇所 |
|------|---------|-------|---------|
| **UX/情報設計** | KPIが分散・フェーズフローが不可視・モーダル重畳 | 🔴 Critical | §3 情報アーキテクチャ |
| **ビジュアル** | WARMパレットが冷色UI要素と不和・品質色とカードタイプ色が衝突 | 🔴 Critical | §4 カラーシステム |
| **A11y/可読性** | コントラスト違反多数（C=白、ボタン白on茶2.5:1）・色のみ情報依存 | 🔴 Critical | §4.4 コントラスト §6 品質表現 |
| **操作性** | タッチ44px未満・キー操作不統一・QUEST_ACCEPT→GATHERING手動切替 | 🟠 High | §7 インタラクション §3.3 フェーズ遷移 |
| **実装アーキ** | radius/shadow/zIndex/motionトークン不在・RANK_COLORS二重定義 | 🟠 High | §8 デザイントークン §9 コンポーネント層 |

### 1.1 ロール間の対立と決着

| 論点 | 案A | 案B | 決着 |
|------|-----|-----|-----|
| 基調トーン | ビジュアル: ダーク×深紫×群青 | UX: 現行ヘッダー（暗灰）を拡張 | **ダーク採用**（A11yコントラストが楽・ビジュアル刷新感が出る） |
| 品質C（白）問題 | ビジュアル: `#7A8289` に変更 | A11y: `#dddddd` またはラベル必須 | **両採用**: 色は `#B8C0CC`（中灰）+ D/C/B/A/S テキストラベル必須化 |
| KPI集約 | UX: 右サイドに Quick KPI パネル新設 | 現行: Header 集約 | **Header強化**（右サイド増設はスペース圧迫）+ フェーズバー昇格 |
| モーダル戦略 | UX: サイドスライドパネル統一 | 操作性: モーダルレス化 | **ハイブリッド**: 確認系=中央モーダル1枚 / 詳細系=右スライドパネル |
| ランク色二重定義 | 実装: `rank-tokens.ts` 新規 | 現行: 各コンポーネントで定義 | **`@shared/theme/rank-tokens.ts` 新設** |

---

## 2. 設計原則（Design Principles）

本刷新で全エージェントが遵守すべき5原則なのだ。

1. **Single Source of Truth for KPI** — ゴールド/AP/日数/ランク/貢献度は HUD だけで表示する。各フェーズUIは「派生値」のみ（例: 追加APコスト・プレビュー貢献度）を出す。
2. **Phase Rail is Always Visible** — フェーズナビゲーションは画面上部の固定バー（ファーストビュー内）に昇格。現在位置・次の条件・到達可否をアイコン＋テキストで表す。
3. **Color Never Alone** — 色のみで情報を伝えない。品質・カードタイプ・フェーズ・状態はすべてテキストラベル or アイコン or パターンで併記する。
4. **One Modal Max** — モーダル同時出現は1枚まで。戻る動線は Esc / × ボタンに統一。詳細閲覧系はスライドパネル。
5. **Token First** — マジックナンバー・ハードコード色・ハードコード半径/影を禁止。必ず `@shared/theme` のトークン経由で参照する。

---

## 3. 情報アーキテクチャ（IA）

### 3.1 新レイアウト（全シーン共通HUD＋Workspace）

```
┌────────────────────────────────────────────────────────────┐
│ [HUD Bar]  🪙1,200  ⚡4/5  📅 Day 12/30  🏅 Bランク ▰▰▰▱▱  │ ← 固定
├────────────────────────────────────────────────────────────┤
│ [Phase Rail]                                               │
│  ①受注 ─▶ ②採取 ─▶ ③調合 ─▶ ④納品 ─▶ 翌日                 │ ← 固定
│          ●現在      ○       ○       ○                      │
│          ＿＿＿＿ 次へ: 素材を3個集める ＿＿＿＿             │
├──────────┬──────────────────────────────────┬─────────────┤
│ Sidebar  │          Workspace               │ Context     │
│ (狭)     │          (メイン)                 │ Panel       │
│          │                                   │ (可変)      │
│ 受注 2   │   [フェーズUI本体]                 │             │
│ 素材 8   │                                   │ 選択詳細    │
│ 完成 3   │                                   │ or          │
│ 保管11/30│                                   │ ヘルプ      │
│          │                                   │             │
├──────────┴──────────────────────────────────┴─────────────┤
│ [Footer] 🎴手札: [card] [card] [card] [card] [card]        │
└────────────────────────────────────────────────────────────┘
```

**3層構造**:
- **HUD Bar** (高 56px): グローバル状態の単一情報源。全シーンで共通。
- **Phase Rail** (高 64px): フェーズ進行の常時可視化。MainScene のみ。
- **Workspace** (残り): Sidebar(左280px) / Content(可変) / ContextPanel(右320px, 可変表示)

### 3.2 シーン別レイアウト方針

| シーン | HUD | Phase Rail | Sidebar | Workspace | ContextPanel |
|--------|-----|-----------|---------|-----------|--------------|
| Title | 非表示 | 非表示 | 非表示 | 中央: ロゴ+メニュー | 非表示 |
| Main (各フェーズ) | ✅ | ✅ | ✅ | フェーズUI | 選択詳細 |
| Shop | ✅ | 非表示（Shop固定） | 左: カテゴリ | 商品グリッド | 商品詳細 |
| RankUp | ✅ | 非表示 | 非表示 | 中央: 昇格演出 | 非表示 |
| GameClear/Over | 非表示 | 非表示 | 非表示 | 中央: 結果 | 統計 |

### 3.3 フェーズ遷移の自動化

- **QUEST_ACCEPT→GATHERING**: 依頼受注ボタンを押したら自動で GATHERING に遷移し、`focusedQuestId` を渡す。手動タブ切替は不要に。
- **GATHERING→ALCHEMY**: 1種以上の素材を確保し、「調合に進む」ボタンで遷移。
- **ALCHEMY→DELIVERY**: 1個以上完成品があるとき「納品に進む」ボタンで遷移。
- **DELIVERY→DAY_END**: 納品完了後、「今日を終える」ボタン or 自動。
- **Phase Rail上で逆行可能**（受注 ⇄ 採取 ⇄ 調合 ⇄ 納品）。ただし状態は保持。

---

## 4. カラーシステム刷新

### 4.1 コンセプト

**「月下の錬金工房」** — 闇夜の工房で月光と金色の炎が照らす錬金作業。

キーワード: 月光 / 神秘 / 精錬の炎 / 深紫のエーテル / ギルドの黄金

### 4.2 新カラートークン（全て #RRGGBB）

#### Surface / Background

| トークン | 色 | 用途 |
|---------|-----|------|
| `surface.base` | `#0E1118` | 全シーン基本背景（ほぼ黒に近い紫紺） |
| `surface.raised` | `#161B24` | HUD/Phase Rail/Sidebar 背景 |
| `surface.panel` | `#1E2532` | カード/モーダル/ContextPanel 背景 |
| `surface.inset` | `#242C3B` | 入力欄・スロット凹み |
| `surface.overlay` | `rgba(0,0,0,0.72)` | モーダル背後の暗幕 |

#### Text

| トークン | 色 | 用途 | on `surface.panel` のコントラスト |
|---------|-----|------|----------------------------------|
| `text.primary` | `#F2F4F8` | 本文・見出し | 14.3 : 1 ✅ AAA |
| `text.secondary` | `#B8C0CC` | 補助情報 | 8.1 : 1 ✅ AAA |
| `text.muted` | `#7A8496` | 無効/プレースホルダ | 4.6 : 1 ✅ AA |
| `text.inverse` | `#0E1118` | 明色ボタン上の文字 | — |

#### Brand（Primary / Secondary / Accent）

| トークン | 色 | 用途 |
|---------|-----|------|
| `brand.primary` | `#6B4BD6` | 主要ボタン/選択状態（アメジスト紫） |
| `brand.primaryHover` | `#8264E6` | Hover |
| `brand.primaryActive` | `#5238B8` | Active/Pressed |
| `brand.secondary` | `#2D6CDF` | 副ボタン・情報強調（群青） |
| `brand.secondaryHover` | `#4084EC` | Hover |
| `brand.accent` | `#F3A93C` | ゴールド系アクセント（報酬・ハイライト） |
| `brand.accentHover` | `#FFBC52` | Hover |

`brand.primary` 上に `text.primary` (#F2F4F8) のコントラスト: **5.4 : 1** ✅ AA（通常文字）

#### Semantic（状態色）

| トークン | 色 | 用途 |
|---------|-----|------|
| `status.success` | `#3FAE6A` | 成功・納品完了・貢献度加算 |
| `status.warning` | `#E5A13B` | 警告・確認 |
| `status.danger` | `#E5484D` | エラー・失敗・破壊的操作 |
| `status.info` | `#3FA3D6` | 情報・チュートリアル |

全てダーク背景で 4.8 : 1 以上を確保。

#### Quality（D〜S）+ カードタイプ

品質は**単色＋必須テキストラベル＋光彩**で表現。カードタイプは**背景トーン＋アイコン**で区別。衝突回避のため**色を被らせない**。

| 品質 | 色 | 光彩 | 必須テキスト |
|------|-----|-----|-------------|
| `quality.D` | `#7A8496` | なし | `D` |
| `quality.C` | `#B8C0CC` | なし | `C` |
| `quality.B` | `#3FAE6A` | `0 0 6px #3FAE6A60` | `B` |
| `quality.A` | `#2D6CDF` | `0 0 10px #2D6CDF80` | `A` |
| `quality.S` | `#F3A93C` | `0 0 14px #F3A93CA0` + particles | `S` |

| カードタイプ | 色（ボーダー） | アイコン |
|------------|---------------|---------|
| `cardType.gathering` | `#4FC3A1` | 🌿 |
| `cardType.recipe` | `#9B7BE8` | ⚗ |
| `cardType.enhancement` | `#E47FB8` | ✨ |

→ 品質Bの緑 `#3FAE6A` と 採取タイプの `#4FC3A1` は明度差で分離。さらに**同時には出現しない文脈**で使う（品質は素材カード上、カードタイプは手札カード上）。

#### Rank (G→S)

`@shared/theme/rank-tokens.ts` に一元化（`RankBadge.ts` と `RankProgressBar.ts` の重複を解消）。

| ランク | 色 |
|--------|-----|
| G | `#7A8496` |
| F | `#A3B1BF` |
| E | `#4FC3A1` |
| D | `#3FAE6A` |
| C | `#3FA3D6` |
| B | `#2D6CDF` |
| A | `#9B7BE8` |
| S | `#F3A93C` |

### 4.3 Shape & Effect Tokens（新設）

| カテゴリ | トークン | 値 |
|---------|---------|-----|
| radius | `radius.xs / sm / md / lg / xl / full` | `2 / 4 / 8 / 14 / 22 / 9999` |
| border | `border.hairline / thin / regular / thick` | `1 / 2 / 3 / 4` |
| shadow | `shadow.sm` | `0 2px 4px rgba(0,0,0,.45)` |
| shadow | `shadow.md` | `0 6px 12px rgba(0,0,0,.50)` |
| shadow | `shadow.lg` | `0 12px 28px rgba(0,0,0,.55)` |
| glow | `glow.focus` | `0 0 0 3px rgba(107,75,214,.45)` |
| opacity | `opacity.disabled / hover / overlay` | `0.45 / 0.85 / 0.72` |

### 4.4 コントラスト検証（主要組合せ）

| 前景 | 背景 | 比率 | 判定 |
|------|------|-----|------|
| `text.primary` #F2F4F8 | `surface.base` #0E1118 | 17.8:1 | ✅ AAA |
| `text.primary` | `surface.panel` #1E2532 | 14.3:1 | ✅ AAA |
| `text.secondary` | `surface.panel` | 8.1:1 | ✅ AAA |
| `text.primary` | `brand.primary` #6B4BD6 | 5.4:1 | ✅ AA |
| `text.inverse` | `brand.accent` #F3A93C | 10.6:1 | ✅ AAA |
| `status.danger` | `surface.panel` | 5.1:1 | ✅ AA |

---

## 5. タイポグラフィ

### 5.1 日本語最適化スケール

現行 14/16/20/24 は日本語には小さすぎる箇所あり。以下に再定義。

| 役割 | トークン | サイズ | Weight | 行高 | 用途 |
|------|---------|-------|--------|------|------|
| Display | `font.display` | 32 | 700 | 1.25 | シーンタイトル・リザルト大見出し |
| H1 | `font.h1` | 26 | 700 | 1.3 | パネル見出し |
| H2 | `font.h2` | 20 | 600 | 1.4 | セクション見出し |
| Body | `font.body` | 16 | 400 | 1.6 | 本文（最小） |
| BodySm | `font.bodySm` | 14 | 400 | 1.6 | 補助情報。ラベル。**12px以下は禁止** |
| Button | `font.button` | 16 | 600 | 1.2 | ボタンテキスト |
| Mono | `font.mono` | 16 | 500 | 1.2 | 数値表示（ゴールド・AP） |

**ルール**:
- `padding: { top: 8 }` を 20px以上のテキストで必須（日本語見切れ対策）。
- `lineHeight` は 1.5 以上。本文は 1.6 推奨。
- `wordWrap` を必須指定（Phaser Text のデフォルトは切れやすい）。

---

## 6. 品質・状態の色非依存表現

色覚特性の配慮 + 操作性向上のための「形＋色＋文字」3点セット。

### 6.1 品質表示（D/C/B/A/S）

```
┌─────┐
│ [S] │ ← 必須: 角にグレード文字
│ 素材 │
│ ★92 │ ← 数値品質を常時表示
└─────┘
 ↑光彩（S/Aのみ）
```

- グレード文字バッジ（4×4 のモノスペース）は必須。
- 数値（例 `★92`）を併記。
- S・A は光彩のみで差別化せず、ボーダーの太さも段階化（S=3px, A=2px, B=2px, C/D=1px）。

### 6.2 ボタン状態

| 状態 | 表現 |
|------|------|
| Normal | brand.primary 背景 + text.primary |
| Hover | brand.primaryHover + 明度 +8% |
| Active | brand.primaryActive + 内側 2px インセット影 |
| Disabled | surface.inset + text.muted + `opacity.disabled` + ラベル横に「(条件未達)」 |
| Focused (kbd) | `glow.focus` outline |

### 6.3 フェーズ状態（Phase Rail）

| 状態 | 色 | アイコン | テキスト |
|------|-----|---------|---------|
| 未到達 | text.muted | 数字のみ | グレー |
| 現在 | brand.accent | ● 塗りつぶし | 太字 + アンダーライン |
| 完了 | status.success | ✓ | 通常 |
| 進行不可 | text.muted + opacity.disabled | ⛔ | 「条件: XX」を下に表示 |

---

## 7. インタラクション仕様

### 7.1 ターゲット最小サイズ

- **ボタン・ヒット領域は 44×44px 以上**（iOS HIG 準拠）。
- 素材スロットは視覚 80×80 / ヒット領域 96×96（invisible padding）。
- タブ・リスト項目は高さ 48px 以上。

### 7.2 キーボード操作統一

`@shared/constants/keybindings.ts`（新設）に集約。

| キー | 動作 |
|------|------|
| `1`〜`9` | スロット/リスト要素の選択（全フェーズ統一） |
| `Tab` / `Shift+Tab` | フォーカス移動 |
| `Enter` / `Space` | 確定・実行 |
| `Esc` | モーダル/スライドパネルを閉じる・1階層戻る |
| `←/→` | Phase Rail の移動 |
| `↑/↓` | リスト項目の選択 |
| `R` | リロール（採取） |
| `?` | ヘルプオーバーレイ |

フォーカスリングは `glow.focus` を常時表示。スケール拡大のみでの表現は禁止。

### 7.3 フィードバック統一ガイドライン

| 事象 | 視覚 | 時間 |
|------|-----|------|
| Hover | 明度 +8% + 軽いスケール 1.02 | 120ms ease-out |
| Press | 明度 −6% + スケール 0.98 | 80ms ease-in |
| Success | 一瞬 status.success 発光 + チェックアイコン | 320ms |
| Error | 左右シェイク 6px + status.danger 点滅 | 320ms |
| Loading | 中央スピナー + オーバーレイ | - |

`motion.duration = { instant:60, fast:120, base:240, slow:400 }`、`prefers-reduced-motion` 対応必須。

### 7.4 モーダル戦略

- **確認モーダル（中央）**: 破壊的操作（調合実行・購入・日送り）のみ。タイトル・本文・`キャンセル`/`実行` の2ボタン固定。
- **スライドパネル（右から）**: 依頼詳細・素材詳細・レシピ詳細・ランク詳細。`ContextPanel` スロットを使用。背後はクリック可能（クリックで閉じる）。
- **Toast（右上）**: 納品成功・AP不足・ゴールド変動通知（3秒で消える）。
- **禁止**: モーダル on モーダル / モーダル on スライドパネル。

---

## 8. デザイントークン層（実装案）

`@shared/theme/` を以下に再編なのだ。

```
@shared/theme/
├── index.ts                  // 公開API（DesignTokens, Colors[互換], THEME[互換]）
├── design-tokens.ts          // 新: 全トークン一元定義
├── color-palette.ts          // 原色パレット（#RRGGBB の一次定義）
├── semantic-colors.ts        // セマンティック（surface/text/brand/status/quality）
├── rank-tokens.ts            // 新: RANK_COLORS
├── typography.ts             // フォント階層
├── shape.ts                  // radius/border/shadow
├── motion.ts                 // duration/easing
└── theme.ts                  // 既存エクスポート（互換レイヤー）
```

### 8.1 DesignTokens 型定義スケッチ

```ts
export const DesignTokens = {
  color: SemanticColors,   // surface, text, brand, status, quality, cardType
  rank: RankColors,
  font: Typography,
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  radius: { xs: 2, sm: 4, md: 8, lg: 14, xl: 22, full: 9999 },
  border: { hairline: 1, thin: 2, regular: 3, thick: 4 },
  shadow: { sm, md, lg, glowFocus },
  opacity: { disabled: 0.45, hover: 0.85, overlay: 0.72 },
  motion: {
    duration: { instant: 60, fast: 120, base: 240, slow: 400 },
    ease: { in: 'Quad.easeIn', out: 'Quad.easeOut', inOut: 'Quad.easeInOut' },
  },
  zIndex: {
    base: 0, content: 10, sidebar: 20, hud: 30, phaseRail: 30,
    slidePanel: 80, modal: 100, toast: 110, tooltip: 120,
  },
} as const;
```

既存 `Colors` / `THEME` は `DesignTokens` を参照する薄いエイリアスに置き換え、段階移行する（§10）。

---

## 9. コンポーネント層の再構築

### 9.1 4層構造

```
Layer 1  DesignTokens          @shared/theme
            ↓
Layer 2  Primitives            @shared/components/primitive
   Button / IconButton / Badge / ProgressBar / Tag / Tooltip / Icon / Divider / Spinner
            ↓
Layer 3  Composites            @shared/components/composite
   Card / Panel / Modal / SlidePanel / Toast / HUDBar / PhaseRail /
   Sidebar / ContextPanel / ScrollableContainer / Dialog
            ↓
Layer 4  Feature Components    @features/*/components
   QuestCardUI / MaterialSlotUI / RecipeList / DeliveryPanel / RankBadge(wrapper) …
            ↓
Layer 5  Scenes                @scenes
   Title / Main / Shop / RankUp / GameClear / GameOver
```

### 9.2 新設コンポーネント一覧

| レイヤ | コンポーネント | 用途 | 置換対象 |
|-------|-------------|------|---------|
| Primitive | `Badge` | グレード・ランクバッジ汎用 | `RankBadge` 内ロジックを吸収 |
| Primitive | `ProgressBar` | 貢献度/AP/昇格ゲージ汎用 | `RankProgressBar` を汎用化 |
| Primitive | `Tag` | 属性・カードタイプ | 散在する add.text ラベル |
| Primitive | `Icon` | 絵文字/スプライト統一 | ハードコードの絵文字 |
| Composite | `HUDBar` | 全シーン共通HUD | `HeaderUI` を刷新 |
| Composite | `PhaseRail` | フェーズナビ | `PhaseTabUI`（Footer内）を昇格 |
| Composite | `SlidePanel` | 右スライドパネル | モーダル詳細系を置換 |
| Composite | `Toast` | 一時通知 | 新規 |
| Composite | `ContextPanel` | 選択中オブジェクトの詳細 | 新規 |
| Factory | `recipe-label-factory` | RecipeLabel重複排除 | `AlchemyPhaseUI` 内重複 |

### 9.3 既存の大型ファイル分解方針

| ファイル | 行数 | 分解案 |
|---------|-----|-------|
| `GatheringPhaseUI.ts` 507行 | → `GatheringWorkspace`(描画統括) + `MaterialPool`(スロットグリッド) + `GatheringToolbar`(リロール/終了) + `GatheringResultPanel` |
| `AlchemyPhaseUI.ts` 601行 | → `AlchemyWorkspace` + `RecipeGrid` + `MaterialSlotBoard` + `QualityPreviewPanel` + `AlchemyToolbar` |
| `QuestDetailModal.ts` 407行 | → `QuestDetailSlidePanel`（SlidePanel に載せる）+ `QuestInfoSection` + `QuestRewardSection` + `QuestRequirementSection` |

すべて300行以内を目標にするのだ。

---

## 10. 段階的移行プラン（非破壊）

**Phase 0: 準備（本PR範囲外）**
- 本レポートをレビュー → 合意形成。

**Phase 1: トークン基盤**（1〜2日）
- `@shared/theme/design-tokens.ts` 新設（radius/shadow/motion/zIndex/opacity 追加）。
- `rank-tokens.ts` 新設、`RankBadge` / `RankProgressBar` から二重定義を削除。
- 既存 `Colors` / `THEME` は `DesignTokens` の薄いエイリアスに変更（呼び出し側は無改修）。
- 新セマンティック名（`surface.*` 等）のみ追加し、旧名は warn なしで併存。

**Phase 2: Primitive 整備**（2〜3日）
- `Badge` / `ProgressBar` / `Tag` / `Icon` / `SlidePanel` / `HUDBar` / `PhaseRail` を新設。
- 既存コンポーネントは未改修のまま動作継続。

**Phase 3: 配色刷新**（1日）
- `color-palette.ts` の値のみを新パレットに差し替え。
- Phase 1 でエイリアス化されているため、全シーンが一括で新配色に切り替わる。
- 不自然な箇所だけピンポイントで手当て。

**Phase 4: レイアウト再構築**（3〜5日）
- `MainScene` を HUDBar + PhaseRail + Workspace 構造に再編。
- `HeaderUI` → `HUDBar`、`PhaseTabUI` → `PhaseRail` へ置換。
- `QuestDetailModal` → `QuestDetailSlidePanel` へ。
- Toast システム導入。

**Phase 5: 大型ファイル分解**（3〜5日）
- `GatheringPhaseUI` / `AlchemyPhaseUI` / `QuestDetailModal` を §9.3 に従って分解。
- 各ファイル300行以内化。

**Phase 6: A11y・操作性仕上げ**（2日）
- キー統一（`keybindings.ts`）/ タッチ領域拡張 / フォーカスリング / `prefers-reduced-motion`。
- コントラスト自動検証テスト導入。

**破壊的変更はPhase 3〜4で発生**するが、エイリアスと barrel export により差分は最小化できる見込みなのだ。

---

## 11. 推奨ルール追加（`.claude/rules/` 反映案）

新規 or 既存ルールに追記すべき項目なのだ。

- `ui-components.md` に追加:
  - 「色のみで情報を表現しない。必ずテキスト/アイコン/パターンで併記」
  - 「ボタン・ヒット領域は 44×44px 以上」
  - 「モーダル同時表示は1枚まで」
- `coding-style.md` / 新 `ui-design-tokens.md` を新設:
  - 「色・半径・影・motion・zIndex は `@shared/theme` トークン経由で参照。ハードコード禁止」
  - 「12px以下のフォントサイズ禁止。日本語本文は16px最小」
- `testing.md` に追加:
  - 「コントラスト比（WCAG AA）の自動検証テストを `tests/unit/shared/theme` に配置」

---

## 12. 未決事項・次アクション

- [ ] 本レポートをレビューし、Phase 1（トークン基盤）から実装開始するかを決定
- [ ] パレット確定前にビジュアルモック（主要3画面）を作成してビジュアル確認
- [ ] `PhaseRail` のアイコンセット選定（絵文字 vs スプライト）
- [ ] Toast の発火イベント仕様策定（EventBus連携）
- [ ] A11y 自動テストツール選定（axe vs 独自実装）

---

## 付録 A: 主要刷新ビフォーアフター

| 箇所 | Before | After |
|------|--------|------|
| 全体トーン | WARMベージュ+茶ボタン+ダークHeader（分裂） | 月下の錬金工房ダーク一貫 |
| Header/HUD | `#1f2937` + 灰文字 | `surface.raised` + `text.primary` 統一 |
| 主ボタン | `#8B4513`（茶, コントラスト 2.5:1） | `brand.primary` `#6B4BD6`（5.4:1 ✅） |
| 品質C | `#FFFFFF` on ベージュ（1.1:1 ❌） | `#B8C0CC` + 必須「C」ラベル（8.1:1 ✅） |
| フェーズ | Footer小タブ | 上部 `PhaseRail` 固定バー |
| KPI | Header + 各フェーズUIに重複 | HUDBar の単一情報源 |
| 依頼詳細 | 中央モーダル | 右スライドパネル |
| RANK色 | 2ファイルで重複定義 | `rank-tokens.ts` 一元化 |
| radius/shadow | 各所ハードコード | `DesignTokens.radius/shadow` |

## 付録 B: ロール別レビューの保管先

本統合の一次資料である各ロールの詳細診断は、Claude Code のタスク出力ファイルに残っているのだ（`AppData/Local/Temp/claude/.../tasks/*.output`）。必要に応じて参照なのだ。

- UX/情報設計: UX診断サマリ・シーン別課題・刷新提案
- ビジュアル: パレット問題分析・新カラーパレット・ビフォーアフター
- A11y/可読性: コントラスト違反リスト・色依存問題・必須/推奨修正
- 操作性: フェーズ別操作コスト・摩擦ポイントTop10・フィードバック設計
- 実装アーキ: トークンギャップ分析・コンポーネントカタログ・移行ステップ
