/**
 * DropZoneManagerクラス
 * TASK-0042 カードドラッグ＆ドロップ機能
 *
 * @description
 * ドロップゾーンの登録、解除、検索を一元管理するシングルトンクラス。
 * カードのドラッグ＆ドロップ操作において、ドロップ先の判定に使用される。
 */

import type { Card } from '../../../domain/entities/Card';
import type { DropZone } from './DropZone';

/**
 * ドロップゾーン管理クラス
 *
 * シングルトンパターンで実装され、アプリケーション全体で
 * 一貫したドロップゾーン管理を提供する。
 */
export class DropZoneManager {
  /** シングルトンインスタンス */
  private static instance: DropZoneManager | null = null;

  /** 登録されたドロップゾーンのMap */
  private zones: Map<string, DropZone> = new Map();

  /**
   * プライベートコンストラクタ（シングルトン）
   */
  private constructor() {}

  /**
   * シングルトンインスタンスを取得
   * @returns DropZoneManagerのインスタンス
   */
  public static getInstance(): DropZoneManager {
    if (!DropZoneManager.instance) {
      DropZoneManager.instance = new DropZoneManager();
    }
    return DropZoneManager.instance;
  }

  /**
   * シングルトンインスタンスをリセット（テスト用）
   */
  public static resetInstance(): void {
    if (DropZoneManager.instance) {
      DropZoneManager.instance.clearAllZones();
    }
    DropZoneManager.instance = null;
  }

  /**
   * ドロップゾーンを登録
   *
   * @param zone - 登録するドロップゾーン
   */
  public registerZone(zone: DropZone): void {
    // 既存のIDで登録しようとした場合は警告
    if (this.zones.has(zone.id)) {
      console.warn(`DropZoneManager: Zone with id '${zone.id}' already exists. Overwriting.`);
    }
    this.zones.set(zone.id, zone);
  }

  /**
   * ドロップゾーンを解除
   *
   * @param id - 解除するゾーンのID
   */
  public unregisterZone(id: string): void {
    this.zones.delete(id);
  }

  /**
   * 指定座標にあるドロップゾーンを検索
   *
   * @param x - X座標
   * @param y - Y座標
   * @returns 見つかったドロップゾーン、見つからない場合はnull
   */
  public findZoneAt(x: number, y: number): DropZone | null {
    for (const zone of this.zones.values()) {
      if (zone.bounds.contains(x, y)) {
        return zone;
      }
    }
    return null;
  }

  /**
   * カードが受け入れ可能なゾーンをハイライト表示
   *
   * @param card - 判定対象のカード
   */
  public highlightValidZones(card: Card): void {
    for (const zone of this.zones.values()) {
      if (zone.highlight) {
        if (zone.accepts(card)) {
          // 受け入れ可能: 緑色のハイライト
          zone.highlight.setVisible(true);
          zone.highlight.clear();
          zone.highlight.lineStyle(3, 0x00ff00);
          zone.highlight.strokeRect(
            zone.bounds.x,
            zone.bounds.y,
            zone.bounds.width,
            zone.bounds.height,
          );
        } else {
          // 受け入れ不可: 赤色のハイライト
          zone.highlight.setVisible(true);
          zone.highlight.clear();
          zone.highlight.lineStyle(3, 0xff0000);
          zone.highlight.strokeRect(
            zone.bounds.x,
            zone.bounds.y,
            zone.bounds.width,
            zone.bounds.height,
          );
        }
      }
    }
  }

  /**
   * すべてのゾーンのハイライトを消す
   */
  public clearHighlights(): void {
    for (const zone of this.zones.values()) {
      if (zone.highlight) {
        zone.highlight.setVisible(false);
        zone.highlight.clear();
      }
    }
  }

  /**
   * すべてのゾーンを削除
   */
  public clearAllZones(): void {
    this.clearHighlights();
    this.zones.clear();
  }

  /**
   * 登録されているゾーンの数を取得
   * @returns ゾーンの数
   */
  public getZoneCount(): number {
    return this.zones.size;
  }
}
