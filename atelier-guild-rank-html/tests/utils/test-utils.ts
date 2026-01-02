/**
 * テストユーティリティ
 * テスト時に使用する共通のヘルパー関数を提供
 */

/**
 * LocalStorageのモック
 * テスト時にLocalStorageの動作をシミュレート
 */
export function createMockLocalStorage(): Storage {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string): string | null => {
      return store[key] || null;
    },
    setItem: (key: string, value: string): void => {
      store[key] = value;
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key: (index: number): string | null => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
}

/**
 * ディープコピー
 * オブジェクトの深いコピーを作成
 */
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

/**
 * 遅延実行
 * 指定したミリ秒後にPromiseを解決
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * ランダム文字列生成
 * テスト用のランダムなID文字列を生成
 */
export function generateRandomId(prefix = 'test'): string {
  const random = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${random}`;
}

/**
 * 日付のモック
 * テスト時に固定の日付を返す関数
 */
export function createMockDate(dateString: string): () => Date {
  return () => new Date(dateString);
}

/**
 * 配列のシャッフル（テスト用）
 * Fisher-Yatesアルゴリズムでシャッフル
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 範囲内の乱数生成（テスト用）
 */
export function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
