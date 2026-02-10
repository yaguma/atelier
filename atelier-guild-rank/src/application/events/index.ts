/**
 * Application Events
 * イベントバスの公開エクスポート
 *
 * @deprecated TASK-0066: @shared/services/event-bus からインポートしてください
 */

export type { EventHandler, IBusEvent, IEventBus } from '@shared/services/event-bus';
// 後方互換性のため再エクスポート
export { EventBus } from '@shared/services/event-bus';
