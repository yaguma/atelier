/**
 * Card エンティティ テストケース
 * TASK-0009 カードエンティティ・DeckService実装
 *
 * @description
 * T-CARD-01 〜 T-CARD-08 を実装
 */

import { Card } from '@domain/entities/Card';
import type { CardMaster } from '@shared/types';
import { CardType, GuildRank, Rarity, toCardId } from '@shared/types';
import { describe, expect, it } from 'vitest';

// モックカードマスターデータ
const mockGatheringCardMaster: CardMaster = {
  id: toCardId('gathering_backyard'),
  name: '裏庭',
  type: 'GATHERING',
  baseCost: 0,
  presentationCount: 2,
  rareRate: 0,
  materialPool: ['weed', 'water'],
  rarity: Rarity.COMMON,
  unlockRank: GuildRank.G,
  description: 'いつでも使える',
};

const mockRecipeCardMaster: CardMaster = {
  id: toCardId('recipe_healing_potion'),
  name: '回復薬',
  type: 'RECIPE',
  cost: 1,
  requiredMaterials: [
    { materialId: 'herb', quantity: 2 },
    { materialId: 'pure_water', quantity: 1 },
  ],
  outputItemId: 'healing_potion',
  category: 'MEDICINE',
  rarity: Rarity.COMMON,
  unlockRank: GuildRank.G,
  description: '医療系の基本',
};

const mockEnhancementCardMaster: CardMaster = {
  id: toCardId('enhance_sage_catalyst'),
  name: '賢者の触媒',
  type: 'ENHANCEMENT',
  cost: 0,
  effect: { type: 'QUALITY_UP', value: 1 },
  targetAction: 'ALCHEMY',
  rarity: Rarity.COMMON,
  unlockRank: GuildRank.G,
  description: '調合品質+1ランク',
};

describe('Card', () => {
  // =============================================================================
  // T-CARD-01: コンストラクタでCardインスタンスを生成
  // =============================================================================

  describe('コンストラクタ', () => {
    it('T-CARD-01: コンストラクタでCardインスタンスを生成', () => {
      // 【テスト目的】: Cardクラスのコンストラクタが正しくインスタンスを生成できること
      // 【テスト内容】: id、masterを指定してCardインスタンスが作成され、プロパティとして保持される
      // 【期待される動作】: id、masterを指定してCardインスタンスが作成され、プロパティとして保持される
      // 🔵 信頼性レベル: 設計文書・タスクノートに明記

      // 【テストデータ準備】: 最もシンプルな採取地カードのマスターデータを使用し、基本的なインスタンス生成を確認
      // 【初期条件設定】: テストに必要な最小限のデータを用意
      const cardId = toCardId('gathering_backyard');
      const master = mockGatheringCardMaster;

      // 【実際の処理実行】: Cardコンストラクタを呼び出してインスタンスを生成
      // 【処理内容】: idとmasterを渡してCardインスタンスを作成
      const card = new Card(cardId, master);

      // 【結果検証】: インスタンスが正しく生成され、プロパティが保持されていることを確認
      // 【期待値確認】: コンストラクタで渡した値が、そのままプロパティとして保持されることを確認
      expect(card.id).toBe(cardId); // 【確認内容】: idプロパティがコンストラクタで渡した値と一致 🔵
      expect(card.master).toBe(master); // 【確認内容】: masterプロパティがコンストラクタで渡した値と一致 🔵
    });
  });

  // =============================================================================
  // T-CARD-02: get name()でカード名を取得
  // =============================================================================

  describe('get name()', () => {
    it('T-CARD-02: get name()でカード名を取得', () => {
      // 【テスト目的】: nameゲッターがmaster.nameを正しく返すこと
      // 【テスト内容】: カードマスターの名前がゲッターを通じて取得できる
      // 【期待される動作】: カードマスターの名前がゲッターを通じて取得できる
      // 🔵 信頼性レベル: 設計文書・タスクノートに明記

      // 【テストデータ準備】: 日本語のカード名が正しく取得できることを確認
      // 【初期条件設定】: 日本語のカード名を持つマスターデータを使用
      const card = new Card(toCardId('gathering_backyard'), mockGatheringCardMaster);

      // 【実際の処理実行】: nameゲッターを呼び出し
      // 【処理内容】: card.nameでmaster.nameを取得
      const name = card.name;

      // 【結果検証】: ゲッターがmaster.nameをそのまま返すことを確認
      // 【期待値確認】: ゲッターがmaster.nameをそのまま返すことを確認
      expect(name).toBe('裏庭'); // 【確認内容】: master.nameが正しく取得できる 🔵
    });
  });

  // =============================================================================
  // T-CARD-03: get type()でカード種別を取得
  // =============================================================================

  describe('get type()', () => {
    it('T-CARD-03: get type()でカード種別を取得', () => {
      // 【テスト目的】: typeゲッターがmaster.typeを正しく返すこと
      // 【テスト内容】: カード種別（GATHERING, RECIPE, ENHANCEMENT）が取得できる
      // 【期待される動作】: カード種別（GATHERING, RECIPE, ENHANCEMENT）が取得できる
      // 🔵 信頼性レベル: 設計文書・タスクノートに明記

      // 【テストデータ準備】: 採取地カードの種別を確認
      // 【初期条件設定】: GATHERINGタイプのマスターデータを使用
      const card = new Card(toCardId('gathering_backyard'), mockGatheringCardMaster);

      // 【実際の処理実行】: typeゲッターを呼び出し
      // 【処理内容】: card.typeでmaster.typeを取得
      const type = card.type;

      // 【結果検証】: ゲッターがmaster.typeをそのまま返すことを確認
      // 【期待値確認】: ゲッターがmaster.typeをそのまま返すことを確認
      expect(type).toBe(CardType.GATHERING); // 【確認内容】: master.typeが正しく取得できる 🔵
    });
  });

  // =============================================================================
  // T-CARD-04: get cost()でコストを取得
  // =============================================================================

  describe('get cost()', () => {
    it('T-CARD-04: get cost()でコストを取得', () => {
      // 【テスト目的】: costゲッターがmaster.costを正しく返すこと
      // 【テスト内容】: カードのコスト値が取得できる
      // 【期待される動作】: カードのコスト値が取得できる
      // 🔵 信頼性レベル: 設計文書・タスクノートに明記

      // 【テストデータ準備】: 一般的なコスト値を持つカードで確認
      // 【初期条件設定】: コストが1のレシピカードマスターデータを使用
      const card = new Card(toCardId('recipe_healing_potion'), mockRecipeCardMaster);

      // 【実際の処理実行】: costゲッターを呼び出し
      // 【処理内容】: card.costでmaster.costを取得
      const cost = card.cost;

      // 【結果検証】: ゲッターがmaster.costをそのまま返すことを確認
      // 【期待値確認】: ゲッターがmaster.costをそのまま返すことを確認
      expect(cost).toBe(1); // 【確認内容】: master.costが正しく取得できる 🔵
    });
  });

  // =============================================================================
  // T-CARD-05: isGatheringCard()で採取地カード判定
  // =============================================================================

  describe('isGatheringCard()', () => {
    it('T-CARD-05: isGatheringCard()で採取地カード判定', () => {
      // 【テスト目的】: 型ガードメソッドが採取地カードを正しく判定すること
      // 【テスト内容】: typeがGATHERINGの場合にtrueを返し、型がナローイングされる
      // 【期待される動作】: typeがGATHERINGの場合にtrueを返し、型がナローイングされる
      // 🔵 信頼性レベル: 設計文書・タスクノートに明記

      // 【テストデータ準備】: 採取地カードのマスターデータを使用
      // 【初期条件設定】: GATHERINGタイプのマスターデータを使用
      const card = new Card(toCardId('gathering_backyard'), mockGatheringCardMaster);

      // 【実際の処理実行】: isGatheringCard()を呼び出し
      // 【処理内容】: 型ガードメソッドで採取地カードかどうかを判定
      const isGathering = card.isGatheringCard();

      // 【結果検証】: 採取地カードのみtrueを返すことを確認
      // 【期待値確認】: TypeScriptの型ガードが正しく機能し、採取地カード固有のプロパティにアクセス可能になる
      expect(isGathering).toBe(true); // 【確認内容】: 採取地カードの場合trueを返す 🔵

      // 【追加検証】: 型ナローイングが機能することを確認
      if (card.isGatheringCard()) {
        // TypeScriptの型チェックで、card.master.materialPoolにアクセスできるはず
        expect(card.master.materialPool).toBeDefined(); // 【確認内容】: 型ナローイング後、採取地カード固有のプロパティにアクセス可能 🔵
      }
    });
  });

  // =============================================================================
  // T-CARD-06: isRecipeCard()でレシピカード判定
  // =============================================================================

  describe('isRecipeCard()', () => {
    it('T-CARD-06: isRecipeCard()でレシピカード判定', () => {
      // 【テスト目的】: 型ガードメソッドがレシピカードを正しく判定すること
      // 【テスト内容】: typeがRECIPEの場合にtrueを返し、型がナローイングされる
      // 【期待される動作】: typeがRECIPEの場合にtrueを返し、型がナローイングされる
      // 🔵 信頼性レベル: 設計文書・タスクノートに明記

      // 【テストデータ準備】: レシピカードのマスターデータを使用
      // 【初期条件設定】: RECIPEタイプのマスターデータを使用
      const card = new Card(toCardId('recipe_healing_potion'), mockRecipeCardMaster);

      // 【実際の処理実行】: isRecipeCard()を呼び出し
      // 【処理内容】: 型ガードメソッドでレシピカードかどうかを判定
      const isRecipe = card.isRecipeCard();

      // 【結果検証】: レシピカードのみtrueを返すことを確認
      // 【期待値確認】: TypeScriptの型ガードが正しく機能し、レシピカード固有のプロパティにアクセス可能になる
      expect(isRecipe).toBe(true); // 【確認内容】: レシピカードの場合trueを返す 🔵

      // 【追加検証】: 型ナローイングが機能することを確認
      if (card.isRecipeCard()) {
        // TypeScriptの型チェックで、card.master.requiredMaterialsにアクセスできるはず
        expect(card.master.requiredMaterials).toBeDefined(); // 【確認内容】: 型ナローイング後、レシピカード固有のプロパティにアクセス可能 🔵
      }
    });
  });

  // =============================================================================
  // T-CARD-07: isEnhancementCard()で強化カード判定
  // =============================================================================

  describe('isEnhancementCard()', () => {
    it('T-CARD-07: isEnhancementCard()で強化カード判定', () => {
      // 【テスト目的】: 型ガードメソッドが強化カードを正しく判定すること
      // 【テスト内容】: typeがENHANCEMENTの場合にtrueを返し、型がナローイングされる
      // 【期待される動作】: typeがENHANCEMENTの場合にtrueを返し、型がナローイングされる
      // 🔵 信頼性レベル: 設計文書・タスクノートに明記

      // 【テストデータ準備】: 強化カードのマスターデータを使用
      // 【初期条件設定】: ENHANCEMENTタイプのマスターデータを使用
      const card = new Card(toCardId('enhance_sage_catalyst'), mockEnhancementCardMaster);

      // 【実際の処理実行】: isEnhancementCard()を呼び出し
      // 【処理内容】: 型ガードメソッドで強化カードかどうかを判定
      const isEnhancement = card.isEnhancementCard();

      // 【結果検証】: 強化カードのみtrueを返すことを確認
      // 【期待値確認】: TypeScriptの型ガードが正しく機能し、強化カード固有のプロパティにアクセス可能になる
      expect(isEnhancement).toBe(true); // 【確認内容】: 強化カードの場合trueを返す 🔵

      // 【追加検証】: 型ナローイングが機能することを確認
      if (card.isEnhancementCard()) {
        // TypeScriptの型チェックで、card.master.effectにアクセスできるはず
        expect(card.master.effect).toBeDefined(); // 【確認内容】: 型ナローイング後、強化カード固有のプロパティにアクセス可能 🔵
      }
    });
  });

  // =============================================================================
  // T-CARD-08: 異なる種別のカードでは型ガードがfalseを返す
  // =============================================================================

  describe('型ガードの除外判定', () => {
    it('T-CARD-08: 異なる種別のカードでは型ガードがfalseを返す', () => {
      // 【テスト目的】: 型ガードが正しく除外判定を行うこと
      // 【テスト内容】: 採取地カードに対してisRecipeCard()を呼ぶなど、異なる種別の判定を行う
      // 【期待される動作】: 異なる種別の場合、型ガードがfalseを返す
      // 🔵 信頼性レベル: 設計文書・タスクノートから推測

      // 【テストデータ準備】: GATHERINGタイプのカードに対して、RECIPEとENHANCEMENTの判定を実行
      // 【初期条件設定】: 採取地カードを準備
      const card = new Card(toCardId('gathering_backyard'), mockGatheringCardMaster);

      // 【実際の処理実行】: 異なる種別の型ガードメソッドを呼び出し
      // 【処理内容】: isRecipeCard()とisEnhancementCard()を呼び出す
      const isRecipe = card.isRecipeCard();
      const isEnhancement = card.isEnhancementCard();

      // 【結果検証】: 型ガードが正しく除外判定を行うことを確認
      // 【期待値確認】: 異なる種別の場合、falseを返す
      expect(isRecipe).toBe(false); // 【確認内容】: 採取地カードに対してisRecipeCard()はfalseを返す 🔵
      expect(isEnhancement).toBe(false); // 【確認内容】: 採取地カードに対してisEnhancementCard()はfalseを返す 🔵
    });
  });
});
