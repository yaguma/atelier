/**
 * DraggableCardUIコンポーネント
 * TASK-0042 カードドラッグ＆ドロップ機能
 * TASK-0070 features/deck/components作成
 *
 * @description
 * カードUIコンポーネントにドラッグ＆ドロップ機能を追加したコンポーネント。
 * 手札からプレイエリアへのカード移動、調合画面での素材配置などで使用する。
 */

import type { Card } from '@domain/entities/Card';
import type { DropZone } from '@presentation/ui/components/DropZone';
import { DropZoneManager } from '@presentation/ui/components/DropZoneManager';
import type Phaser from 'phaser';
import { CardUI, type CardUIConfig } from './CardUI';

/**
 * ドラッグ可能カードUIの設定
 */
export interface DraggableCardConfig extends CardUIConfig {
  /** ドラッグ開始時のコールバック */
  onDragStart?: (card: Card) => void;

  /** ドラッグ中のコールバック */
  onDrag?: (card: Card, x: number, y: number) => void;

  /** ドロップ時のコールバック */
  onDrop?: (card: Card, zone: DropZone | null) => void;
}

/**
 * ドラッグ可能カードUIコンポーネント
 *
 * CardUIを継承し、ドラッグ＆ドロップ機能を追加する。
 * ドラッグ中は視覚的フィードバック（スケール、透明度、深度）を提供し、
 * ドロップ時にはDropZoneManagerと連携してドロップ先を判定する。
 */
export class DraggableCardUI extends CardUI {
  /** ドラッグ可能カード用設定 */
  private draggableConfig: DraggableCardConfig;

  /** ドラッグ中フラグ */
  private isDragging = false;

  /** ドラッグ開始位置 */
  private startPosition: { x: number; y: number } = { x: 0, y: 0 };

  /** ドラッグオフセット（ポインター位置とカード位置の差分） */
  private dragOffset: { x: number; y: number } = { x: 0, y: 0 };

  /** 初期深度（復元用） */
  private originalDepth = 0;

  /** ドラッグイベントハンドラのバインド済み参照 */
  private boundOnDragStart: (
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject,
  ) => void;
  private boundOnDrag: (
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject,
    dragX: number,
    dragY: number,
  ) => void;
  private boundOnDragEnd: (
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject,
  ) => void;

  /**
   * 【ドラッグ中の視覚効果定数】
   * 🔵 信頼性レベル: TASK-0042設計書に基づく
   */
  private static readonly DRAG_SCALE = 1.1; // ドラッグ中のスケール
  private static readonly DRAG_ALPHA = 0.8; // ドラッグ中の透明度
  private static readonly DRAG_DEPTH = 100; // ドラッグ中の深度

  /**
   * 【アニメーション定数】
   * 🔵 信頼性レベル: TASK-0042設計書に基づく
   */
  private static readonly RETURN_ANIMATION_DURATION = 200; // 元の位置に戻るアニメーション時間
  private static readonly RETURN_ANIMATION_EASE = 'Power2'; // イージング関数

  constructor(scene: Phaser.Scene, config: DraggableCardConfig) {
    super(scene, config);
    this.draggableConfig = config;

    // イベントハンドラをバインド
    this.boundOnDragStart = this.onDragStart.bind(this);
    this.boundOnDrag = this.onDrag.bind(this);
    this.boundOnDragEnd = this.onDragEnd.bind(this);

    // ドラッグイベントの設定
    this.setupDragInteraction();
  }

  /**
   * ドラッグインタラクションを設定
   */
  private setupDragInteraction(): void {
    if (!this.draggableConfig.interactive) return;

    // backgroundをドラッグ可能に設定
    const background = this.getBackground();
    if (background) {
      background.setInteractive({ draggable: true });
    }

    // シーンレベルでドラッグイベントを購読
    this.scene.input.on('dragstart', this.boundOnDragStart, this);
    this.scene.input.on('drag', this.boundOnDrag, this);
    this.scene.input.on('dragend', this.boundOnDragEnd, this);
  }

  /**
   * ドラッグ開始時の処理
   */
  private onDragStart(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject,
  ): void {
    // 自分のbackgroundでない場合は無視
    if (gameObject !== this.getBackground()) return;

    this.isDragging = true;

    // 開始位置を保存
    this.startPosition = {
      x: this.container.x,
      y: this.container.y,
    };

    // ドラッグオフセットを計算
    this.dragOffset = {
      x: this.container.x - pointer.x,
      y: this.container.y - pointer.y,
    };

    // 初期深度を保存
    this.originalDepth = this.container.depth;

    // 視覚効果を適用
    this.container.setScale(DraggableCardUI.DRAG_SCALE);
    this.container.setAlpha(DraggableCardUI.DRAG_ALPHA);
    this.container.setDepth(DraggableCardUI.DRAG_DEPTH);

    // 有効なドロップゾーンをハイライト
    const manager = DropZoneManager.getInstance();
    manager.highlightValidZones(this.getCard());

    // コールバックを実行
    this.draggableConfig.onDragStart?.(this.getCard());
  }

  /**
   * ドラッグ中の処理
   */
  private onDrag(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject,
    _dragX: number,
    _dragY: number,
  ): void {
    // 自分のbackgroundでない場合、またはドラッグ中でない場合は無視
    if (gameObject !== this.getBackground() || !this.isDragging) return;

    // カードの位置を更新
    const newX = pointer.x + this.dragOffset.x;
    const newY = pointer.y + this.dragOffset.y;
    this.container.setPosition(newX, newY);

    // コールバックを実行
    this.draggableConfig.onDrag?.(this.getCard(), newX, newY);
  }

  /**
   * ドラッグ終了時の処理
   */
  private onDragEnd(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject,
  ): void {
    // 自分のbackgroundでない場合、またはドラッグ中でない場合は無視
    if (gameObject !== this.getBackground() || !this.isDragging) return;

    this.isDragging = false;

    // 視覚効果をリセット
    this.container.setScale(1);
    this.container.setAlpha(1);
    this.container.setDepth(this.originalDepth);

    // ハイライトをクリア
    const manager = DropZoneManager.getInstance();
    manager.clearHighlights();

    // ドロップゾーンを検索
    const zone = manager.findZoneAt(pointer.x, pointer.y);

    if (zone?.accepts(this.getCard())) {
      // ドロップ成功
      zone.onDrop(this.getCard());
      this.draggableConfig.onDrop?.(this.getCard(), zone);
    } else {
      // ドロップ失敗 - 元の位置に戻す
      this.returnToStartPosition();
      this.draggableConfig.onDrop?.(this.getCard(), null);
    }
  }

  /**
   * 元の位置にアニメーションで戻す
   */
  private returnToStartPosition(): void {
    this.scene.tweens.add({
      targets: this.container,
      x: this.startPosition.x,
      y: this.startPosition.y,
      duration: DraggableCardUI.RETURN_ANIMATION_DURATION,
      ease: DraggableCardUI.RETURN_ANIMATION_EASE,
    });
  }

  /**
   * backgroundを取得（CardUIの内部プロパティにアクセス）
   * @returns 背景のRectangle
   */
  private getBackground(): Phaser.GameObjects.Rectangle | null {
    // CardUIのbackgroundはprivateなので、コンテナの最初の子要素を取得
    const children = this.container.list;
    if (children && children.length > 0) {
      return children[0] as Phaser.GameObjects.Rectangle;
    }
    return null;
  }

  /**
   * コンポーネントを破棄する
   */
  public override destroy(): void {
    // ドラッグイベントリスナーを削除
    this.scene.input.off('dragstart', this.boundOnDragStart, this);
    this.scene.input.off('drag', this.boundOnDrag, this);
    this.scene.input.off('dragend', this.boundOnDragEnd, this);

    // 親クラスのdestroyを呼び出す
    super.destroy();
  }
}
