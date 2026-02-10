/**
 * shuffle.ts - デッキシャッフル純粋関数
 *
 * TASK-0069: features/deck/services作成（DeckService純粋関数化）
 *
 * @description
 * Fisher-Yatesアルゴリズムを使用した純粋関数によるシャッフル。
 * シード値を指定することでテストの再現性を確保。
 *
 * @example
 * ```typescript
 * // 通常のシャッフル
 * const shuffled = shuffle(deck);
 *
 * // シード値指定でテスト用
 * const shuffled = shuffle(deck, 12345);
 * ```
 */

/**
 * シード付き乱数生成器を作成する
 *
 * Mulberry32アルゴリズムを使用した決定的な乱数生成
 *
 * @param seed - 乱数シード
 * @returns 0以上1未満の乱数を返す関数
 */
export function createSeededRandom(seed: number): () => number {
  // Mulberry32: 32ビット状態の高品質PRNG
  let state = seed;
  return () => {
    // Mulberry32の更新式
    state += 0x6d2b79f5;
    let z = state;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    // 正規化して0-1の範囲に
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * デッキをシャッフルする純粋関数
 *
 * Fisher-Yatesアルゴリズムを使用。
 * 入力配列を変更せず、新しい配列を返す。
 *
 * @template T - カードの型
 * @param deck - シャッフル対象のデッキ（readonly）
 * @param seed - 乱数シード（オプション、テスト用）
 * @returns シャッフルされた新しいデッキ
 *
 * @example
 * ```typescript
 * const shuffled = shuffle(deck, 12345);
 * // 同じシードで同じ結果が得られる
 * const shuffled2 = shuffle(deck, 12345);
 * // shuffled と shuffled2 は同じ順序
 * ```
 */
export function shuffle<T>(deck: readonly T[], seed?: number): T[] {
  // 空配列の場合は空配列を返す
  if (deck.length === 0) {
    return [];
  }

  // 入力配列をコピー（イミュータブル）
  const result = [...deck];

  // シード指定時は決定的乱数、なければMath.random
  const random = seed !== undefined ? createSeededRandom(seed) : Math.random;

  // Fisher-Yatesアルゴリズム
  // 配列の末尾から順に、ランダムな位置の要素と交換
  for (let i = result.length - 1; i > 0; i--) {
    // 0からiまでのランダムなインデックス
    const j = Math.floor(random() * (i + 1));

    // 要素を交換（配列インデックスアクセスは範囲内が保証されている）
    const temp = result[i] as T;
    result[i] = result[j] as T;
    result[j] = temp;
  }

  return result;
}
