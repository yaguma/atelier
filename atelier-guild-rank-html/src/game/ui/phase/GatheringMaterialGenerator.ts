/**
 * GatheringMaterialGenerator 実装
 *
 * TASK-0223: GatheringContainer素材提示実装
 * 採取地カードから素材選択肢を生成する
 */

import { GatheringCard } from '../../../domain/card/CardEntity';
import { Material } from '../../../domain/material/MaterialEntity';
import type { IGatheringMaterial } from '../../../domain/card/Card';
import type { MaterialOption } from '../material/IMaterialOptionView';

/**
 * 素材リポジトリインターフェース
 * 素材IDから素材エンティティを取得するためのインターフェース
 */
export interface IMaterialRepository {
  findById(id: string): Material | undefined;
}

/**
 * 生成された素材情報
 */
export interface GeneratedMaterial {
  /** 素材 */
  material: Material;
  /** 数量 */
  quantity: number;
  /** 出現確率 */
  probability: number;
  /** レア素材かどうか */
  isRare: boolean;
}

/**
 * GatheringMaterialGeneratorクラス
 *
 * 採取地カードに基づいて素材選択肢を生成する。
 * 確率判定、数量計算、レア判定を行う。
 */
export class GatheringMaterialGenerator {
  private randomSeed?: number;
  private materialRepository?: IMaterialRepository;

  /**
   * コンストラクタ
   * @param seed 乱数シード（テスト用）
   * @param materialRepository 素材リポジトリ（オプション）
   */
  constructor(seed?: number, materialRepository?: IMaterialRepository) {
    this.randomSeed = seed;
    this.materialRepository = materialRepository;
  }

  /**
   * 採取地カードから素材選択肢を生成
   * @param card 採取地カード
   * @param materials 素材マスターデータ（IDから素材を引けるMap）
   * @returns 生成された素材選択肢
   */
  generateMaterialOptions(
    card: GatheringCard,
    materials?: Map<string, Material>
  ): MaterialOption[] {
    const cardMaterials = card.getMaterials();
    const options: MaterialOption[] = [];

    cardMaterials.forEach((materialEntry) => {
      // 確率判定で出現するか決定
      if (this.rollProbability(materialEntry.probability)) {
        const quantity = this.calculateQuantity(materialEntry.quantity);
        const material = this.resolveMaterial(materialEntry.materialId, materials);

        if (material) {
          options.push({
            material,
            quantity,
            probability: materialEntry.probability,
          });
        }
      }
    });

    // 最低1つは素材を出現させる
    if (options.length === 0 && cardMaterials.length > 0) {
      const fallback = cardMaterials[0];
      const material = this.resolveMaterial(fallback.materialId, materials);

      if (material) {
        options.push({
          material,
          quantity: 1,
          probability: fallback.probability,
        });
      }
    }

    return options;
  }

  /**
   * 素材IDから素材エンティティを解決
   */
  private resolveMaterial(
    materialId: string,
    materials?: Map<string, Material>
  ): Material | undefined {
    if (materials) {
      return materials.get(materialId);
    }
    if (this.materialRepository) {
      return this.materialRepository.findById(materialId);
    }
    return undefined;
  }

  /**
   * 確率判定
   * @param probability 出現確率（0-1）
   * @returns 出現するかどうか
   */
  private rollProbability(probability: number): boolean {
    const roll = this.random();
    return roll < probability;
  }

  /**
   * 数量計算
   * @param baseQuantity 基本数量
   * @returns 実際の数量
   */
  private calculateQuantity(baseQuantity: number): number {
    // 基本数量±1の範囲でランダム
    const min = Math.max(1, baseQuantity - 1);
    const max = baseQuantity + 1;
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /**
   * 乱数生成（シード対応）
   * @returns 0-1の乱数
   */
  private random(): number {
    if (this.randomSeed !== undefined) {
      // シード付き乱数（Linear Congruential Generator）
      this.randomSeed = (this.randomSeed * 9301 + 49297) % 233280;
      return this.randomSeed / 233280;
    }
    return Math.random();
  }

  /**
   * レア素材判定
   * @param probability 出現確率
   * @returns レア素材かどうか（確率30%未満）
   */
  isRareMaterial(probability: number): boolean {
    return probability < 0.3;
  }

  /**
   * 乱数シードをリセット
   * @param seed 新しいシード
   */
  resetSeed(seed: number): void {
    this.randomSeed = seed;
  }
}
