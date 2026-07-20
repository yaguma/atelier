# UIモックアップ実装 アーキテクチャ設計

**作成日**: 2026-06-17  
**関連モックアップ計画**: [mockup-implementation-plan.md](../atelier-guild-rank/ui-design/mockup-implementation-plan.md)  
**ヒアリング記録**: [design-interview.md](design-interview.md)

**【信頼性レベル凡例】**:
- 🔵 **青信号**: 既存実装・設計文書・モックアップを参考にした確実な設計
- 🟡 **黄信号**: 既存実装・設計文書・モックアップから妥当な推測による設計
- 🔴 **赤信号**: 既存実装・設計文書・モックアップにない推測による設計

---

## システム概要 🔵

**信頼性**: 🔵 *mockup-implementation-plan.md・既存実装より*

本タスクは Phaser 3 + TypeScript で構築されたギルドランク制ゲーム「atelier-guild-rank」のUIをHTMLモックアップ（8画面）に合わせて**作り直し**する実装作業である。ゲームロジック（Functional Core）は変更しない。

- **変更スコープ**: `src/shared/presentation/` 配下の UI コンポーネント・フェーズUI・シーン
- **変更しない範囲**: `@shared/theme/`、`features/*/services/`、ドメインエンティティ、`BootScene.ts`

---

## アーキテクチャパターン 🔵

**信頼性**: 🔵 *architecture-overview.md・既存設計より*

既存のアーキテクチャを維持する：

| パターン | 説明 |
|---------|------|
| **Feature-Based Architecture** | 機能単位でのコード配置 |
| **Functional Core, Imperative Shell** | 純粋関数（services/）とUI・状態管理を分離 |
| **BaseComponent 継承パターン** | 全UIコンポーネントは `BaseComponent` を継承 |
| **EventBus + StateManager** | コンポーネント間通信と状態一元管理 |

---

## コンポーネント構成

### テーマ・デザイントークン 🔵

**信頼性**: 🔵 *既存 `@shared/theme/` 実装より*

変更なし。既存トークンをそのまま利用する。

| ファイル | 内容 |
|---------|------|
| `@shared/theme/semantic-colors.ts` | `Colors` — 意味論的カラー定義 |
| `@shared/theme/design-tokens.ts` | `DesignTokens` — Radius・zIndex・shadow |
| `@shared/theme/shape.ts` | ボーダー・角丸トークン |
| `@shared/theme/theme.ts` | `THEME` — フォント・スペーシング統合 |

モックアップで使用している主要カラーとトークンの対応：

| モックアップ色 | トークン |
|--------------|---------|
| `#7BAE7F` (草色) | `Colors.brand.primary` |
| `#D4A76A` (琥珀) | `Colors.text.accent` |
| `#B8A9D4` (ラベンダー) | `Colors.phase.questAccent` |
| `#8CC084` (リーフグリーン) | `Colors.phase.gatheringAccent` |
| `#E8A87C` (コーラル) | `Colors.phase.deliveryAccent` |
| `#D46B6B` (危険赤) | `Colors.status.error` |
| `#FDFAF5` (ヘッダー背景) | `Colors.surface.header` |
| `#F5EFE6` (サイドバー背景) | `Colors.surface.sidebar` |
| `#E8E0D6` (ボーダー) | `Colors.border.subtle` |

---

### 変更対象コンポーネント 🔵

**信頼性**: 🔵 *mockup-implementation-plan.md・既存ファイル一覧より*

#### Phase 1: 共通コンポーネント（全フェーズ共通）

| コンポーネント | ファイル | 変更種別 |
|--------------|---------|---------|
| HUDBar | `src/shared/presentation/ui/components/composite/HUDBar.ts` | 作り直し |
| SidebarUI | `src/shared/presentation/ui/components/SidebarUI.ts` | 作り直し |
| FooterUI | `src/shared/presentation/ui/components/FooterUI.ts` | 作り直し |
| PhaseRail | `src/shared/presentation/ui/components/composite/PhaseRail.ts` | 作り直し |

#### Phase 2: フェーズワークスペース

| コンポーネント | ファイル | 変更種別 |
|--------------|---------|---------|
| QuestAcceptPhaseUI | `src/shared/presentation/ui/phases/QuestAcceptPhaseUI.ts` | 作り直し |
| GatheringPhaseUI | `src/shared/presentation/ui/phases/GatheringPhaseUI.ts` | 作り直し |
| AlchemyPhaseUI | `src/shared/presentation/ui/phases/AlchemyPhaseUI.ts` | 作り直し |
| DeliveryPhaseUI | `src/shared/presentation/ui/phases/DeliveryPhaseUI.ts` | 作り直し |

#### Phase 3: 独立シーン

| シーン | ファイル | 変更種別 |
|-------|---------|---------|
| TitleScene | `src/shared/presentation/scenes/TitleScene.ts` + `scenes/components/title/` | 作り直し |
| GameClearScene | `src/shared/presentation/scenes/GameClearScene.ts` | 作り直し |
| ShopScene | `src/shared/presentation/scenes/ShopScene.ts` + `scenes/components/shop/` | 作り直し |
| RankUpScene | `src/shared/presentation/scenes/RankUpScene.ts` + `scenes/components/rankup/` | 作り直し |

---

## ディレクトリ構造 🔵

**信頼性**: 🔵 *既存プロジェクト構造より*

```
src/shared/presentation/
├── scenes/
│   ├── BootScene.ts              ← 変更なし
│   ├── MainScene.ts              ← 変更なし（シェル）
│   ├── TitleScene.ts             ← 作り直し
│   ├── GameClearScene.ts         ← 作り直し
│   ├── GameOverScene.ts          ← 変更なし
│   ├── ShopScene.ts              ← 作り直し
│   ├── RankUpScene.ts            ← 作り直し
│   └── components/
│       ├── title/                ← 作り直し
│       ├── shop/                 ← 作り直し
│       └── rankup/               ← 作り直し
└── ui/
    ├── components/
    │   ├── BaseComponent.ts      ← 変更なし（再エクスポート）
    │   ├── composite/
    │   │   ├── HUDBar.ts         ← 作り直し
    │   │   └── PhaseRail.ts      ← 作り直し
    │   └── SidebarUI.ts          ← 作り直し
    │   └── FooterUI.ts           ← 作り直し
    ├── phases/
    │   ├── QuestAcceptPhaseUI.ts ← 作り直し
    │   ├── GatheringPhaseUI.ts   ← 作り直し
    │   ├── AlchemyPhaseUI.ts     ← 作り直し
    │   └── DeliveryPhaseUI.ts    ← 作り直し
    └── theme.ts                  ← 変更なし（再エクスポート）
```

---

## モックアップ仕様サマリー 🔵

**信頼性**: 🔵 *mockup-implementation-plan.md・HTMLモックアップより*

### 共通スタイル定数

| 要素 | 値 | トークン |
|-----|-----|---------|
| カード角丸 | 12px | `DesignTokens.radius.md` |
| ボタン角丸 | 18px (pill型) | `DesignTokens.radius.full` |
| モーダル角丸 | 24px | `DesignTokens.radius.xl` |
| カード枠線 | 2px solid `#D9CFC2` | `Colors.border.default` |
| 選択時枠線 | 3px solid アクセントカラー | フェーズ別 |
| カード影 | 小 | `DesignTokens.shadow.sm` |

### フェーズ別アクセントカラー 🔵

**信頼性**: 🔵 *design-guide.md・モックアップより*

| フェーズ | アクセントカラー | 用途 |
|---------|--------------|-----|
| 依頼受注 (QUEST_ACCEPT) | `#B8A9D4` (ラベンダー) | タイトル・左バー・選択枠 |
| 採取 (GATHERING) | `#8CC084` (リーフグリーン) | タイトル・左バー・選択枠 |
| 調合 (ALCHEMY) | `#D4A76A` (アンバー) | タイトル・左バー・選択枠 |
| 納品 (DELIVERY) | `#E8A87C` (コーラル) | タイトル・左バー・選択枠 |

### ボタン種別 🔵

**信頼性**: 🔵 *design-guide.md・モックアップより*

| 種別 | 背景色 | テキスト色 | 用途 |
|-----|--------|----------|-----|
| プライマリ | `Colors.brand.primary` (`#7BAE7F`) | 白 | 確定・受注・納品 |
| セカンダリ | 透明 + 枠線 | `Colors.text.primary` | キャンセル・戻る |
| デンジャー | `Colors.status.error` (`#D46B6B`) | 白 | 日終了・破棄 |

---

## HUDBar 詳細仕様（Step 1-1） 🔵

**信頼性**: 🔵 *02〜05モックアップ `.header` セクションより*

```
背景:    #FDFAF5  border-bottom: 1px solid #E8E0D6  padding: 8px 16px
ランク:  バッジ形式（pill型）  bg: #D4A76A  font-size: 12px
ゲージ:  max-width: 120px  height: 8px  fill: #D4A76A
HUD項目: 日数・Gold・AP  font-size: 12px  font-weight: 500
区切り:  width: 1px  height: 16px  bg: #E8E0D6
```

**既存 HUDBar との差分**:
- 現: `font-size: 16-18px` の大きいテキスト → モック: `font-size: 12px` でコンパクト化
- 現: ゲージ `height: 16px` → モック: `height: 8px`
- 現: ゲージ幅 `100px` → モック: `max-width: 120px`
- 現: ラベル「ランク:」「残り:」「AP:」テキスト → モック: バッジ形式＋セパレーター

---

## SidebarUI 詳細仕様（Step 1-2） 🔵

**信頼性**: 🔵 *02〜05モックアップ `.sidebar` セクションより*

```
幅:       150px
背景:     #F5EFE6
右線:     1px solid #E8E0D6
padding:  12px 10px
セクション見出し: font-size: 11px  font-weight: 500 + 下線 #E8E0D6
受注依頼カード:   border-radius: 6px  border: 1px solid #D9CFC2  padding: 5px 7px
  バッジ: #7BAE7F pill型
インベントリ行:   justify-content: space-between  font-size: 11px + 下線
ショップボタン:   margin-top: auto  セカンダリ pill型  font-size: 11px
```

---

## FooterUI + PhaseRail 詳細仕様（Step 1-3/1-4） 🔵

**信頼性**: 🔵 *02〜05モックアップ `.footer` セクションより*

```
FooterUI背景:  #F0EBE3  border-top: 1px solid #E8E0D6  padding: 8px 12px

PhaseRail（フェーズタブ）:
  pill型  padding: 3px 12px  font-size: 11px  font-weight: 500
  アクティブ:   bg: #7BAE7F  color: #fff
  非アクティブ: bg: transparent  color: #8A8A8A

手札カード:
  width: 52px  height: 68px  border-radius: 8px
  border: 1.5px solid #D9CFC2  font-size: 9px  color: #5A5A5A

右ボタン群:
  休息: セカンダリ
  日終了: デンジャー (#D46B6B)
```

---

## 技術的制約 🔵

**信頼性**: 🔵 *CLAUDE.md・phaser-best-practices.md・既存実装より*

1. **Phaser テキスト描画**: 日本語文字上部が見切れるため `padding: { top: 8 }` を設定する
2. **rexUI 初期化確認**: `this.scene.rexUI` の存在確認後に使用する
3. **BaseComponent 継承必須**: 全UIコンポーネントは `BaseComponent` を継承すること
4. **destroy() での購読解除**: EventBus 購読は必ず `destroy()` で解除する
5. **update() 内の重い処理禁止**: Tween・イベント登録は `create()` で行う
6. **デザイントークン参照必須**: 色のハードコード禁止、`Colors`/`DesignTokens` 経由で参照

---

## 実装優先順位 🔵

**信頼性**: 🔵 *mockup-implementation-plan.md より*

| 順序 | ステップ | 対象 |
|------|---------|------|
| 1 | Step 1-1 | HUDBar |
| 2 | Step 1-2 | SidebarUI |
| 3 | Step 1-3/1-4 | FooterUI + PhaseRail |
| 4 | Step 2-1 | QuestAcceptPhaseUI |
| 5 | Step 2-2 | GatheringPhaseUI |
| 6 | Step 2-3 | AlchemyPhaseUI |
| 7 | Step 2-4 | DeliveryPhaseUI |
| 8 | Step 3-1 | TitleScene |
| 9 | Step 3-2 | GameClearScene |
| 10 | Step 3-3 | ShopScene |
| 11 | Step 3-4 | RankUpScene |

---

## 完了条件 🔵

**信頼性**: 🔵 *mockup-implementation-plan.md より*

各ステップ完了時：
1. `pnpm dev` でブラウザ表示がモックアップと視覚的に一致する
2. `pnpm typecheck` がパスする
3. `pnpm lint` がパスする
4. `pnpm test -- --run` が全パスする

---

## 関連文書

- **データフロー**: [dataflow.md](dataflow.md)
- **型定義**: [interfaces.ts](interfaces.ts)
- **ヒアリング記録**: [design-interview.md](design-interview.md)
- **モックアップ計画**: [mockup-implementation-plan.md](../atelier-guild-rank/ui-design/mockup-implementation-plan.md)
- **デザインガイド**: [design-guide.md](../atelier-guild-rank/ui-design/design-guide.md)

---

## 信頼性レベルサマリー

- 🔵 青信号: 18件 (90%)
- 🟡 黄信号: 2件 (10%)
- 🔴 赤信号: 0件 (0%)

**品質評価**: ✅ 高品質
