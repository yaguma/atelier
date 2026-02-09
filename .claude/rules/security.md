# セキュリティルール

## 基本原則

- すべての外部入力を検証
- 最小権限の原則に従う
- セキュリティは後付けではなく設計段階から考慮

---

## クライアントサイドセキュリティ

### ローカルストレージ

```typescript
// NG: 機密情報を平文で保存
localStorage.setItem('apiKey', apiKey);

// OK: 機密情報はサーバーサイドで管理
// または必要最小限の非機密データのみ保存
localStorage.setItem('settings', JSON.stringify(userSettings));
```

### セーブデータの検証

```typescript
// セーブデータ読み込み時は必ず検証
function loadSaveData(): SaveData | null {
  const raw = localStorage.getItem('saveData');
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);
    // スキーマ検証
    if (!isValidSaveData(data)) {
      console.warn('Invalid save data format');
      return null;
    }
    return data;
  } catch {
    console.warn('Failed to parse save data');
    return null;
  }
}

// 型ガードで検証
function isValidSaveData(data: unknown): data is SaveData {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.version === 'number' &&
    typeof d.gold === 'number' &&
    d.gold >= 0 &&
    Array.isArray(d.inventory)
  );
}
```

---

## 入力検証

### ユーザー入力

```typescript
// 名前入力の例
function validatePlayerName(name: string): string | null {
  // 長さチェック
  if (name.length < 1 || name.length > 20) {
    return null;
  }

  // 危険な文字を除去
  const sanitized = name.replace(/[<>'"&]/g, '');

  // 空になったらエラー
  if (sanitized.length === 0) {
    return null;
  }

  return sanitized;
}
```

### 数値入力

```typescript
// 数値の範囲チェック
function validateQuantity(value: unknown): number {
  const num = Number(value);
  if (Number.isNaN(num) || !Number.isInteger(num)) {
    return 1; // デフォルト値
  }
  return Math.max(1, Math.min(99, num)); // 1-99の範囲に制限
}
```

---

## 機密情報の管理

### 禁止事項

- APIキー、パスワードをハードコードしない
- `.env` ファイルをコミットしない
- ログに機密情報を出力しない
- エラーメッセージでシステム内部情報を露出しない

```typescript
// NG
const API_KEY = 'sk-1234567890abcdef';
console.log('User password:', password);

// OK
const API_KEY = import.meta.env.VITE_API_KEY;
console.log('Login attempt for user:', username);
```

### 環境変数

```
# .env.local（gitignore対象）
VITE_API_URL=https://api.example.com
VITE_DEBUG_MODE=true
```

---

## ゲーム固有のセキュリティ

### チート対策の考え方

ローカルゲームでは完全なチート対策は不可能だが、以下を意識。

```typescript
// 重要な計算はサーバーサイドで行う（オンライン機能がある場合）
// ローカルでは整合性チェックで改ざんを検出

function validateGameState(state: IGameState): boolean {
  // ゴールドが負になっていないか
  if (state.gold < 0) return false;

  // 所持アイテム数が上限を超えていないか
  if (state.inventory.length > MAX_INVENTORY_SIZE) return false;

  // ランクが正しい範囲か
  if (!Object.values(GuildRank).includes(state.currentRank)) return false;

  return true;
}
```

### セーブデータの改ざん検出

```typescript
// 簡易チェックサム
function calculateChecksum(data: SaveData): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

// 保存時
const checksum = calculateChecksum(saveData);
localStorage.setItem('saveData', JSON.stringify({ data: saveData, checksum }));

// 読み込み時
const saved = JSON.parse(localStorage.getItem('saveData') || '{}');
if (calculateChecksum(saved.data) !== saved.checksum) {
  console.warn('Save data may be corrupted');
}
```

---

## 依存関係

### 定期チェック

```bash
# 脆弱性チェック
pnpm audit

# 依存関係の更新確認
pnpm outdated
```

### 新規依存追加時の確認

- ライセンス確認（MIT, Apache 2.0等）
- メンテナンス状況（最終更新日、Issue対応）
- ダウンロード数・スター数
- バンドルサイズ

---

## XSS対策

### テキスト表示

```typescript
// Phaserのテキスト表示は基本的にXSS安全
// ただしHTML要素を使う場合は注意

// NG: innerHTML直接設定
element.innerHTML = userInput;

// OK: テキストノードとして追加
element.textContent = userInput;

// Phaserでは問題なし
this.add.text(x, y, userInput, style);
```

---

## エラーハンドリング

### 情報漏洩防止

```typescript
// NG: スタックトレースをユーザーに表示
catch (error) {
  showMessage(error.stack);
}

// OK: ユーザーには一般的なメッセージ
catch (error) {
  console.error('Internal error:', error);
  showMessage('エラーが発生しました。');
}
```

---

## 禁止事項

- eval()、Function()の使用
- 動的コード生成
- 外部スクリプトの動的読み込み
- 信頼できないURLへのリダイレクト
- 検証なしでのデータ使用
