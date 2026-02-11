/**
 * service-interfaces.ts - サービスインターフェース定義
 *
 * TASK-0084: features/inventory/types作成
 *
 * domain/interfacesのIInventoryService, IMaterialServiceを
 * 再エクスポートし、features/inventory経由でアクセスできるようにする。
 */

export type { IInventoryService } from '@domain/interfaces/inventory-service.interface';
export type { IMaterialService } from '@domain/interfaces/material-service.interface';
