/**
 * deck-service.ts - DeckServiceインターフェース
 *
 * TASK-0068: features/deck/types作成
 *
 * @description
 * domain/interfaces/deck-service.interface.tsのIDeckServiceを
 * features/deck/types経由でアクセス可能にする。
 */

// IDeckServiceインターフェース（domain層からの再エクスポート）
export type { IDeckService } from '@domain/interfaces/deck-service.interface';
