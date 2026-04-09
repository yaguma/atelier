# PlaywrightMCP 操作ルール

PlaywrightMCP（`mcp__playwright__*` ツール群）で atelier-guild-rank の Phaser ゲームを直接操作するときの運用ルール。調査・手動検証・バグ再現を安全かつ高速に回すことを目的とする。

状態セットアップの具体コードは [`playwright-mcp-cookbook.md`](./playwright-mcp-cookbook.md) を参照。

## 基本原則

- **MCP は調査・再現・手動検証専用**。回帰テストは必ず `e2e/`（Playwright CLI + Page Object）で書く
- MCP 操作後のゲーム状態は壊れている前提で扱う（継続利用しない、セッション終了時に破棄）
- MCP で再現した不具合は **必ず E2E テストに昇格** を検討する
- セッション終了時は必ず `mcp__playwright__browser_close` を呼ぶ
- **CI で MCP ツール呼び出し禁止**（CI は CLI 一択）

---

## MCP vs E2E CLI の判断フロー

| 用途 | MCP | CLI（`e2e/`） |
|------|-----|---------------|
| バグ 1 回の再現・snapshot 撮影 | ○ | × |
| ランダム探索・状態の直接注入 | ○ | △ |
| 回帰テスト・再発防止 | × | ○ |
| CI 実行 | **禁止** | ○ |
| 本番ブラウザで Lighthouse 測定 | × | △（chrome-devtools MCP） |
| 手動動作確認（目視） | ○ | △ |

判断の優先順:

1. 既に `e2e/pages/*.page.ts` に Page Object があれば CLI を優先する
2. Page Object が無く調査用に 1 回だけ触りたい場合は MCP
3. 調査で得た再現手順は Page Object 化して CLI に移植する

---

## 事前準備とブラウザライフサイクル

### dev server 起動確認

```bash
# 起動していなければバックグラウンドで起動（port 3000）
pnpm dev  # run_in_background: true
```

起動済みかどうかは `mcp__playwright__browser_navigate` が成功するかで判断する。

### 初回 navigate

```
mcp__playwright__browser_navigate  url=http://localhost:3000
```

### ライフサイクル規約

- 原則 **単一タブ** で作業する。複数開いたら即 `browser_close`
- **10 分以上の放置は禁止**。長時間作業は段階ごとに分割
- セッション終了時は必ず `browser_close`
- `browser_tabs` で複数タブを扱う必要がある場合は明示的に理由をコメントに残す

### 復旧手順

"Target page, context or browser has been closed" が出たら:

1. `mcp__playwright__browser_close`（空でも構わない、クリーンアップ用）
2. `mcp__playwright__browser_navigate` で再起動
3. 再 navigate 後はゲーム状態がリセットされるので、状態構築は evaluate でやり直す

---

## window グローバルと状態スナップショット

読み取りは `window.gameState()` を第一選択にする。`src/main.ts` で公開されている。

| グローバル | 用途 | 定義箇所 |
|---|---|---|
| `window.game` | Phaser.Game インスタンス | `src/main.ts` |
| `window.gameState()` | 現在のゲーム状態スナップショット（読み取り専用関数） | `src/main.ts` |
| `window.debug` | DebugTools | `src/debug.ts` |

### 禁止

- `window.game.xxx = ...` のようなグローバルへの直接書き込み
- 返り値に Phaser オブジェクトをそのまま含める（シリアライズ不可で evaluate 自体が失敗する）

---

## Phaser シーン遷移の作法

本セッションで発覚した主要な罠。外部 evaluate からシーン遷移するときは呼び元シーンの扱いに注意する。

```js
// ❌ NG: TitleScene が stop されず MainScene と重なって描画される
window.game.scene.start('MainScene');

// ✅ OK: 明示的に stop してから start
window.game.scene.stop('TitleScene');
window.game.scene.start('MainScene');

// ✅ OK: switch を使う
window.game.scene.switch('TitleScene', 'MainScene');
```

理由: Phaser の `Scene.prototype.start`（シーン内の `this.scene.start`）は呼び元を暗黙に stop するが、外部からの `SceneManager.start(key)` は対象シーンを起動するだけで呼び元を stop しない。

### 推奨

- 通常フローを再現したい場合は **TitleScene のボタンを canvas 座標でクリック** する方が安全（`e2e/pages/title.page.ts` の座標を流用）
- シーン内 UI フェーズ（`QUEST_ACCEPT` / `GATHERING` / `ALCHEMY` / `DELIVERY`）の遷移は `main.phaseManager.showPhase(phase)` を使う。これは Phaser Scene ではないので混同しない

---

## 入力エミュレーション

| 目的 | 使うツール | 備考 |
|---|---|---|
| ボタン遷移の確認 | `browser_click` + canvas 座標 | Page Object 定数を共有 |
| 内部ロジック検証 | `browser_evaluate` 直呼び | MainScene フィールド・DI 経由 |
| ドラッグ操作 | `browser_drag` | 座標ハードコード禁止 |
| キー入力 | `browser_press_key` | `Escape` / `Enter` 等 |
| スクロール | `browser_evaluate` + `scene.cameras` | canvas はネイティブスクロール不可 |

座標は原則 Page Object の定数を参照する。ハードコードしたい場合は理由をコメントに残す。

---

## `browser_evaluate` 記述規約

- **自己完結アロー関数** で書く。外部クロージャ参照は不可
- **純 JavaScript** で書く（`as any` / 型注釈などの TS 構文は "not well-serializable" エラーになる）
- 返り値は **JSON シリアライズ可能** に限定。Phaser オブジェクトを直返ししない
- 1 evaluate に関連操作を集約し、ラウンドトリップを最小化する
- エラーは `try/catch` で `{ ok: false, error: e.message }` の形にして返す

### 雛形

```js
() => {
  try {
    const main = window.game.scene.getScene('MainScene');
    if (!main) return { ok: false, error: 'MainScene not active' };
    // ... 操作
    return { ok: true, result: { /* シリアライズ可能な値 */ } };
  } catch (e) {
    return { ok: false, error: String(e?.message ?? e) };
  }
}
```

---

## DI Container / モジュールインスタンス問題

動的 `import('/src/...')` で取得した `Container.getInstance()` は **起動時に登録されたサービスが見えない** ことがある。Vite が別モジュールインスタンスを返すためで、以下の手順で回避する。

### 取得順（優先度順）

1. **`scene.data.get('inventoryService')` 等アダプタ経由**（`src/shared/services/delivery-phase-adapters.ts`）
2. **`main.questService` 等 MainScene フィールド** を直接参照
3. **動的 import + `?t=timestamp` 付きの既ロード URL** を使う

### 3 の live import ヘルパ

```js
async () => {
  const pickLive = (substr) => performance.getEntriesByType('resource')
    .map(r => r.name)
    .filter(u => u.includes(substr) && u.includes('?t='))
    .pop();
  const mod = await import(pickLive('/di/container.ts'));
  const c = mod.Container.getInstance();
  if (!c.has('InventoryService')) {
    return { ok: false, error: 'Container not initialized' };
  }
  const inv = c.resolve('InventoryService');
  return { ok: true, items: inv.getItems().length };
}
```

`c.has('X')` で事前検証してから `resolve` する。無ければエラー返却して中断する。

---

## 状態セットアップ雛形集

よく使う状態構築（セーブリセット・受注・フェーズジャンプ等）は [`playwright-mcp-cookbook.md`](./playwright-mcp-cookbook.md) にまとめる。

- 雛形 1: セーブデータリセット
- 雛形 2: 受注 1 件アクティブ化
- 雛形 3: インベントリへアイテム追加
- 雛形 4: 特定フェーズへジャンプ
- 雛形 5: Delivery 選択状態構築
- 雛形 6: DI Container live import ヘルパ

各雛形は **単一 evaluate にまとめる** ことを原則とする。

---

## コンソール検証フロー

各 evaluate 後に `mcp__playwright__browser_console_messages` を呼び、エラーが増えていないか確認する。

### 無視可ホワイトリスト

- `Failed to load resource: favicon.ico` 404
- Vite HMR info（`[vite] connected.` 等）
- `Download the React DevTools...`

### 対応ルール

- ホワイトリスト外のエラーを検出したら **即座に操作を中断** し原因調査する
- **スクリーンショット撮影前に必ずコンソールを確認** する（不具合の取りこぼしを防ぐ）

---

## アーティファクト管理

### 出力ディレクトリは MCP サーバー起動引数で固定

本リポジトリには `.mcp.json` を配置し、`@playwright/mcp` を `--output-dir ./atelier-guild-rank/.playwright-mcp` で起動するよう設定してある。これにより `browser_take_screenshot` の `filename` に **ディレクトリなしの相対名** を渡すだけで、常に `atelier-guild-rank/.playwright-mcp/` 配下に出力される。

```json
// .mcp.json（リポジトリルート）
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--output-dir", "./atelier-guild-rank/.playwright-mcp"]
    }
  }
}
```

> `.mcp.json` を新規追加・変更した場合は **Claude Code の再起動が必要** なのだ。MCP サーバーは起動時の引数でしか `--output-dir` を受け取れない。

### 保存先

```
atelier-guild-rank/.playwright-mcp/<YYYYMMDD-HHmm>-<topic>/
```

### 命名規則

```
<scene>-<state>-<seq>.png

例:
delivery-empty-01.png
delivery-quest-selected-02.png
delivery-item-selected-03.png
```

### 禁止

- **リポジトリルート直下に `debug-*.png` を撒く**
- 調査用 PNG のコミット（`.gitignore` 対象）
- 長期保持（セッション終了時 or 翌日に手動クリーンアップ）

### 共有したい 1 枚

ドキュメントに貼りたい場合のみ `docs/screenshots/` に明示的に移動してコミットする。

### `.gitignore` で除外するパターン

```
atelier-guild-rank/.playwright-mcp/
atelier-guild-rank/.visual-check/
debug-*.png
```

---

## chrome-devtools MCP との棲み分け

| 用途 | 使う MCP |
|------|---------|
| Phaser 状態操作・シーン制御 | Playwright MCP |
| Lighthouse / performance trace / memory snapshot | chrome-devtools MCP |
| 汎用 DOM 操作 | Playwright MCP |
| コンソールログ取得 | どちらでも可（統一推奨） |

**両 MCP の同時起動は禁止**（ブラウザインスタンス競合が起きる）。

---

## 禁止事項とレビュー観点

### 禁止

- 本番サイト / 認証情報を含むページでの `browser_evaluate` 実行
- `window.game` への直接書き込み
- 10 分以上のブラウザ放置
- `debug-*.png` や `.playwright-mcp/` 配下のコミット
- **CI での MCP ツール呼び出し**（CI は CLI のみ）

### PR レビュー観点

- MCP で見つけたバグが E2E テストに昇格されているか
- 調査用スクリーンショットがコミットに混入していないか
- `.claude/rules/playwright-mcp.md` に未カバーの罠が見つかったら本ファイルに追記する

---

## Appendix A: トラブルシュート早見表

| 症状 | 原因 | 対処 |
|------|------|------|
| TitleScene が残って MainScene と重なる | 外部 evaluate からの `scene.start()` | `scene.switch()` or `stop` → `start` |
| `Container.resolve` で `Service not found` | 動的 import が別モジュールインスタンスを返した | `?t=` 付き URL を `performance.getEntriesByType` から取得 |
| `not well-serializable` エラー | evaluate の関数に TS 構文 / 外部クロージャ | 純 JS の自己完結アロー関数に書き直す |
| `Target page, context or browser has been closed` | ブラウザが閉じられた | `browser_close` → `browser_navigate` で再起動 |
| 返り値が `undefined` だけ返る | Phaser オブジェクトを直返ししている | JSON シリアライズ可能な値に変換 |
| `rexUI is not initialized` | Scene の create() 前に触っている | `scene.events.once('create', ...)` で待つ |

---

## Appendix B: 既存ルールとの cross-reference

- [`testing.md`](./testing.md) — E2E テストの Page Object パターン規定（回帰テストはこちら）
- [`phaser-best-practices.md`](./phaser-best-practices.md) — シーンライフサイクル / rexUI 初期化
- [`bash-commands.md`](./bash-commands.md) — `run_in_background` を使った dev server 起動
- [`code-review.md`](./code-review.md) — PR レビュー基準（MCP 由来のバグの扱い）
