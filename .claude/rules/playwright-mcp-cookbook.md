# PlaywrightMCP 状態セットアップ雛形集（Cookbook）

[`playwright-mcp.md`](./playwright-mcp.md) の状態セットアップ雛形集。`mcp__playwright__browser_evaluate` に渡す関数を 1 つずつ独立セクションで掲載する。

全雛形に共通するルール:

- **単一 evaluate にまとめる**（ラウンドトリップ最小化）
- **自己完結アロー関数**（外部クロージャ参照禁止）
- **純 JavaScript** で書く（TS 構文禁止）
- 末尾に **検証用の return** を付ける
- エラーは `try/catch` で `{ ok: false, error: String(e?.message ?? e) }`

---

## 雛形 1: セーブデータリセット

**前提**: いつでも
**副作用**: `localStorage` 全消去、ページ reload

```js
() => {
  try {
    localStorage.clear();
    location.reload();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e?.message ?? e) };
  }
}
```

**検証**: reload 後に TitleScene が表示されるのを `browser_navigate` 再取得で確認。

---

## 雛形 2: 受注 1 件アクティブ化

**前提**: MainScene 遷移済み、DI 初期化済み
**副作用**: `availableQuests` から 1 件を `activeQuests` に移動、`QUEST_ACCEPTED` イベント発火

```js
() => {
  try {
    const main = window.game.scene.getScene('MainScene');
    if (!main) return { ok: false, error: 'MainScene not active' };
    const qs = main.questService;

    // 依頼が無ければランクEで生成
    if (qs.getAvailableQuests().length === 0) {
      qs.generateDailyQuests('E');
    }
    const quests = qs.getAvailableQuests();
    // healing_potion 依頼を優先、無ければ最後の 1 件
    const target = quests.find(q => q.condition?.itemId === 'healing_potion')
      || quests[quests.length - 1];
    if (!target) return { ok: false, error: 'no available quest' };

    const accepted = qs.acceptQuest(target.id);
    return {
      ok: true,
      accepted,
      activeCount: qs.getActiveQuests().length,
      questId: target.id,
      requiredItemId: target.condition?.itemId ?? null,
    };
  } catch (e) {
    return { ok: false, error: String(e?.message ?? e) };
  }
}
```

**検証**: `activeCount >= 1`、`accepted === true`。

---

## 雛形 3: インベントリへアイテム追加

**前提**: MainScene 遷移済み、DI 初期化済み、`itemId` と `quality` を指定
**副作用**: `InventoryService` に `ItemInstance` 1 件追加

```js
async () => {
  try {
    const pickLive = (substr) => performance.getEntriesByType('resource')
      .map(r => r.name)
      .filter(u => u.includes(substr) && u.includes('?t='))
      .pop();

    const containerUrl = pickLive('/di/container.ts');
    const itemUrl = pickLive('/entities/ItemInstance.ts');
    if (!containerUrl || !itemUrl) {
      return { ok: false, error: 'live module URL not found' };
    }

    const diMod = await import(containerUrl);
    const itemMod = await import(itemUrl);
    const c = diMod.Container.getInstance();
    if (!c.has('InventoryService') || !c.has('MasterDataRepository')) {
      return { ok: false, error: 'DI not initialized' };
    }

    const inv = c.resolve('InventoryService');
    const mdr = c.resolve('MasterDataRepository');

    const itemId = 'healing_potion';
    const quality = 'B';
    const master = mdr.getItem
      ? mdr.getItem(itemId)
      : mdr.getAllItems?.().find(i => i.id === itemId);
    if (!master) return { ok: false, error: 'master not found: ' + itemId };

    const inst = new itemMod.ItemInstance('mcp_test_' + Date.now(), master, quality, []);
    inv.addItem(inst);

    return {
      ok: true,
      itemCount: inv.getItems().length,
      firstName: inv.getItems()[0]?.name ?? null,
    };
  } catch (e) {
    return { ok: false, error: String(e?.message ?? e) };
  }
}
```

**検証**: `itemCount >= 1`、`firstName === '回復薬'`。

`itemId` と `quality` を変えたい場合はリテラル部分を書き換えて evaluate し直す。

---

## 雛形 4: 特定フェーズへジャンプ

**前提**: MainScene 遷移済み
**副作用**: `phaseManager._currentVisiblePhase` が変わる、該当フェーズの UI が可視化

```js
(targetPhase) => {
  try {
    // targetPhase: 'QUEST_ACCEPT' | 'GATHERING' | 'ALCHEMY' | 'DELIVERY' | 'DAY_END'
    const phase = targetPhase || 'DELIVERY';
    const main = window.game.scene.getScene('MainScene');
    if (!main) return { ok: false, error: 'MainScene not active' };
    if (!main.phaseManager) return { ok: false, error: 'phaseManager not ready' };

    main.phaseManager.showPhase(phase);

    // DeliveryPhaseUI は遷移時に refreshData() を呼ぶことで最新状態を反映
    const ui = main.phaseManager.phaseUIs.get(phase);
    if (ui && typeof ui.refreshData === 'function') {
      ui.refreshData();
    }

    return {
      ok: true,
      phase: main.phaseManager._currentVisiblePhase,
    };
  } catch (e) {
    return { ok: false, error: String(e?.message ?? e) };
  }
}
```

> 注: `browser_evaluate` は単一引数をサポートしないため、`targetPhase` はリテラルで置き換えて呼ぶか、クロージャ外の値を直接書き込む。

**検証**: `phase === 指定した値`。

---

## 雛形 5: Delivery 選択状態構築（Issue #453 検証実績あり）

**前提**: 雛形 2（受注 1 件）+ 雛形 3（アイテム追加）+ 雛形 4（DELIVERY 遷移）を実行済み
**副作用**: `QuestDeliveryList` と `ItemSelector` に選択状態が入り、`ContributionPreview` が更新、納品ボタンが有効化

```js
() => {
  try {
    const main = window.game.scene.getScene('MainScene');
    const deliveryUI = main.phaseManager.phaseUIs.get('DELIVERY');
    if (!deliveryUI) return { ok: false, error: 'DELIVERY UI not found' };

    deliveryUI.refreshData();

    const ql = deliveryUI.questList;
    const is = deliveryUI.itemSelector;
    if (!ql || !is) return { ok: false, error: 'sub-components not ready' };

    const q = ql.quests[0];
    const it = is.items[0];
    if (!q) return { ok: false, error: 'no accepted quest (run 雛形2 first)' };
    if (!it) return { ok: false, error: 'no item (run 雛形3 first)' };

    // onClick はトグル動作なので直接フィールドをセットしてから select を発火
    ql.selectedQuestId = q.id;
    deliveryUI.onQuestSelect(q);
    is.selectedItemId = it.instanceId;
    deliveryUI.onItemSelect(it);
    deliveryUI.updatePreview();

    return {
      ok: true,
      questCount: ql.quests.length,
      itemCount: is.items.length,
      selectedQuest: q.id,
      selectedItem: it.instanceId,
    };
  } catch (e) {
    return { ok: false, error: String(e?.message ?? e) };
  }
}
```

**検証**: `selectedQuest` と `selectedItem` が埋まっていること。ブラウザ上で貢献度プレビューと緑色の「納品する」ボタンが有効化されて見える。

---

## 雛形 6: DI Container live import ヘルパ

**前提**: dev server 稼働中、どこかで 1 度以上 `container.ts` が読み込まれている
**副作用**: なし（検証のみ）

```js
async () => {
  try {
    const pickLive = (substr) => performance.getEntriesByType('resource')
      .map(r => r.name)
      .filter(u => u.includes(substr) && u.includes('?t='))
      .pop();

    const url = pickLive('/di/container.ts');
    if (!url) return { ok: false, error: 'container.ts not loaded yet' };

    const mod = await import(url);
    const c = mod.Container.getInstance();

    return {
      ok: true,
      url,
      registeredServices: Array.from(c.services?.keys?.() || []),
    };
  } catch (e) {
    return { ok: false, error: String(e?.message ?? e) };
  }
}
```

**検証**: `registeredServices` に `InventoryService` / `QuestService` などが含まれていること。空配列なら初期化前か別モジュールインスタンスを掴んでいる。

---

## 実行順のベストプラクティス

複合的な状態を作りたい場合の典型的な順序:

1. 雛形 1（リセット）※必要な場合のみ
2. `browser_navigate` → 通常フローで TitleScene → MainScene 遷移（`scene.switch` 推奨）
3. 雛形 2（受注）
4. 雛形 3（アイテム追加）
5. 雛形 4（DELIVERY 遷移）
6. 雛形 5（選択状態）
7. `browser_console_messages` でエラー確認
8. `browser_take_screenshot` で目視確認用スクショ（保存先は `.playwright-mcp/` 配下）

各ステップ後に return 値をチェックし、`ok: false` なら中断して原因調査する。
