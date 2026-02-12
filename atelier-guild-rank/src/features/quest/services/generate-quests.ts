/**
 * generate-quests.ts - 依頼生成の純粋関数
 *
 * TASK-0081: features/quest/services作成
 *
 * ランクに応じた依頼を生成する純粋関数。
 * シード付き乱数生成器を使用し、同一入力に対して決定的な出力を保証する。
 */

import type { GuildRank, QuestType } from '@shared/types';
import { toQuestId } from '@shared/types';
import type { IClient, IQuest, IQuestCondition, QuestDifficulty } from '@shared/types/quests';

// =============================================================================
// 設定型定義
// =============================================================================

/** 依頼生成設定 */
export interface GenerateQuestsConfig {
  /** 現在のギルドランク */
  rank: GuildRank;
  /** 生成する依頼数 */
  count: number;
  /** 利用可能な依頼者リスト */
  clients: readonly IClient[];
  /** 乱数シード（省略時はDate.now()） */
  seed?: number;
}

/** 依頼生成結果 */
export interface GenerateQuestsResult {
  /** 生成された依頼リスト */
  quests: IQuest[];
}

// =============================================================================
// ランク別定数
// =============================================================================

/** ランク別日次依頼生成数 */
export const DAILY_QUEST_COUNT_BY_RANK: Record<GuildRank, number> = {
  G: 3,
  F: 4,
  E: 4,
  D: 5,
  C: 5,
  B: 6,
  A: 6,
  S: 7,
};

/** ランク別同時受注上限 */
export const QUEST_LIMIT_BY_RANK: Record<GuildRank, number> = {
  G: 2,
  F: 2,
  E: 3,
  D: 3,
  C: 4,
  B: 4,
  A: 5,
  S: 5,
};

/** ランク別依頼者出現数 */
export const CLIENT_COUNT_BY_RANK: Record<GuildRank, number> = {
  G: 2,
  F: 2,
  E: 3,
  D: 3,
  C: 3,
  B: 4,
  A: 4,
  S: 5,
};

/** 難易度ごとの基本報酬テーブル */
const DIFFICULTY_REWARDS: Record<QuestDifficulty, { gold: number; contribution: number }> = {
  easy: { gold: 30, contribution: 30 },
  normal: { gold: 60, contribution: 60 },
  hard: { gold: 100, contribution: 100 },
};

/** 難易度ごとの基本期限 */
const DIFFICULTY_DEADLINES: Record<QuestDifficulty, number> = {
  easy: 7,
  normal: 5,
  hard: 3,
};

/** ランクと難易度の対応（各ランクで出現可能な難易度と重み） */
const RANK_DIFFICULTY_WEIGHTS: Record<
  GuildRank,
  { difficulty: QuestDifficulty; weight: number }[]
> = {
  G: [
    { difficulty: 'easy', weight: 3 },
    { difficulty: 'normal', weight: 1 },
  ],
  F: [
    { difficulty: 'easy', weight: 2 },
    { difficulty: 'normal', weight: 2 },
  ],
  E: [
    { difficulty: 'easy', weight: 1 },
    { difficulty: 'normal', weight: 3 },
  ],
  D: [
    { difficulty: 'easy', weight: 1 },
    { difficulty: 'normal', weight: 2 },
    { difficulty: 'hard', weight: 1 },
  ],
  C: [
    { difficulty: 'normal', weight: 2 },
    { difficulty: 'hard', weight: 2 },
  ],
  B: [
    { difficulty: 'normal', weight: 1 },
    { difficulty: 'hard', weight: 3 },
  ],
  A: [
    { difficulty: 'normal', weight: 1 },
    { difficulty: 'hard', weight: 4 },
  ],
  S: [{ difficulty: 'hard', weight: 1 }],
};

/** 依頼タイプリスト */
const QUEST_TYPES: QuestType[] = ['SPECIFIC', 'CATEGORY', 'QUALITY', 'QUANTITY'];

/** フレーバーテキストテンプレート */
const FLAVOR_TEMPLATES: Record<QuestDifficulty, string[]> = {
  easy: ['簡単な調合品が必要です', 'ちょっとしたお願いです', '初心者向けの依頼です'],
  normal: ['腕前を見せてください', '良い品を期待しています', '頼りにしています'],
  hard: ['最高品質を求めます', '難しい依頼ですが報酬は弾みます', '熟練の技が必要です'],
};

// =============================================================================
// メイン関数
// =============================================================================

/**
 * 依頼を生成する（純粋関数）
 *
 * @param config - 依頼生成設定
 * @returns 生成された依頼リスト
 */
export function generateQuests(config: GenerateQuestsConfig): GenerateQuestsResult {
  const { rank, count, clients, seed } = config;

  if (clients.length === 0) {
    return { quests: [] };
  }

  if (count <= 0) {
    return { quests: [] };
  }

  const random = createSeededRandom(seed);
  const quests: IQuest[] = [];

  for (let i = 0; i < count; i++) {
    const client = selectClient(clients, i, random);
    const quest = createQuestForRank(rank, client, i, random);
    quests.push(quest);
  }

  return { quests };
}

/**
 * デフォルトの依頼数を取得する（純粋関数）
 *
 * @param rank - ギルドランク
 * @returns 依頼数
 */
export function getDefaultQuestCount(rank: GuildRank): number {
  return DAILY_QUEST_COUNT_BY_RANK[rank];
}

/**
 * ランク別の同時受注上限を取得する（純粋関数）
 *
 * @param rank - ギルドランク
 * @returns 同時受注上限
 */
export function getQuestLimitForRank(rank: GuildRank): number {
  return QUEST_LIMIT_BY_RANK[rank];
}

/**
 * デフォルトの依頼者数を取得する（純粋関数）
 *
 * @param rank - ギルドランク
 * @returns 依頼者数
 */
export function getDefaultClientCount(rank: GuildRank): number {
  return CLIENT_COUNT_BY_RANK[rank];
}

// =============================================================================
// ヘルパー関数
// =============================================================================

/**
 * シード付き乱数生成器を作成する（純粋関数）
 *
 * @param seed - 乱数シード（省略時はDate.now()）
 * @returns 0以上1未満の乱数を返す関数
 */
export function createSeededRandom(seed?: number): () => number {
  let state = seed ?? Date.now();
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * 依頼者を選択する（ラウンドロビン + ランダム）
 */
function selectClient(clients: readonly IClient[], index: number, _random: () => number): IClient {
  const clientIndex = index % clients.length;
  return clients[clientIndex] as IClient;
}

/**
 * ランクに応じた難易度を選択する
 */
function selectDifficulty(rank: GuildRank, random: () => number): QuestDifficulty {
  const weights = RANK_DIFFICULTY_WEIGHTS[rank];
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  let roll = random() * totalWeight;

  for (const entry of weights) {
    roll -= entry.weight;
    if (roll <= 0) {
      return entry.difficulty;
    }
  }

  // weights配列は各ランクに対して必ず1つ以上のエントリを持つため、
  // ここに到達した場合は最後のエントリを使用する
  const lastEntry = weights[weights.length - 1];
  return lastEntry ? lastEntry.difficulty : 'normal';
}

/**
 * ランクに応じた依頼を1件作成する
 */
function createQuestForRank(
  rank: GuildRank,
  client: IClient,
  index: number,
  random: () => number,
): IQuest {
  const difficulty = selectDifficulty(rank, random);
  const condition = generateCondition(client, random);
  const baseReward = DIFFICULTY_REWARDS[difficulty];
  const baseDeadline = DIFFICULTY_DEADLINES[difficulty];

  // 依頼者の補正を適用
  const gold = Math.floor(baseReward.gold * client.goldMultiplier);
  const contribution = Math.floor(baseReward.contribution * client.contributionMultiplier);
  const deadline = Math.max(1, baseDeadline + client.deadlineModifier);

  const flavorTexts = FLAVOR_TEMPLATES[difficulty];
  const flavorIndex = Math.floor(random() * flavorTexts.length);
  const flavorText = flavorTexts[flavorIndex] ?? flavorTexts[0] ?? '';

  return {
    id: toQuestId(`quest-${index}-${Math.floor(random() * 10000)}`),
    clientId: client.id,
    condition,
    contribution,
    gold,
    deadline,
    difficulty,
    flavorText,
  };
}

/**
 * 依頼条件を生成する
 */
function generateCondition(client: IClient, random: () => number): IQuestCondition {
  // 依頼者の好む依頼タイプがあればそれを優先
  if (client.preferredQuestTypes.length > 0) {
    const typeIndex = Math.floor(random() * client.preferredQuestTypes.length);
    const questType =
      client.preferredQuestTypes[typeIndex] ?? client.preferredQuestTypes[0] ?? 'QUANTITY';
    return createConditionForType(questType, random);
  }

  // フォールバック: ランダムに依頼タイプを選択
  const typeIndex = Math.floor(random() * QUEST_TYPES.length);
  const questType = QUEST_TYPES[typeIndex] ?? QUEST_TYPES[0] ?? 'QUANTITY';
  return createConditionForType(questType, random);
}

/**
 * 依頼タイプに応じた条件を作成する
 */
function createConditionForType(questType: QuestType, random: () => number): IQuestCondition {
  switch (questType) {
    case 'SPECIFIC':
      return { type: 'SPECIFIC', itemId: `item-${Math.floor(random() * 100)}` };
    case 'CATEGORY':
      return { type: 'CATEGORY', category: selectCategory(random) };
    case 'QUALITY':
      return { type: 'QUALITY', minQuality: selectMinQuality(random) };
    case 'QUANTITY':
      return { type: 'QUANTITY', quantity: 1 + Math.floor(random() * 3) };
    case 'ATTRIBUTE':
      return { type: 'ATTRIBUTE' };
    case 'EFFECT':
      return { type: 'EFFECT' };
    case 'MATERIAL':
      return { type: 'MATERIAL' };
    case 'COMPOUND':
      return {
        type: 'COMPOUND',
        subConditions: [
          { type: 'QUALITY', minQuality: 'C' },
          { type: 'QUANTITY', quantity: 1 },
        ],
      };
    default:
      return { type: 'QUANTITY', quantity: 1 };
  }
}

/**
 * カテゴリをランダムに選択する
 */
function selectCategory(
  random: () => number,
): 'MEDICINE' | 'WEAPON' | 'MAGIC' | 'ADVENTURE' | 'LUXURY' {
  const categories = ['MEDICINE', 'WEAPON', 'MAGIC', 'ADVENTURE', 'LUXURY'] as const;
  const index = Math.floor(random() * categories.length);
  return categories[index] ?? categories[0];
}

/**
 * 最低品質をランダムに選択する
 */
function selectMinQuality(random: () => number): 'D' | 'C' | 'B' | 'A' {
  const qualities = ['D', 'C', 'B', 'A'] as const;
  const index = Math.floor(random() * qualities.length);
  return qualities[index] ?? qualities[0];
}
