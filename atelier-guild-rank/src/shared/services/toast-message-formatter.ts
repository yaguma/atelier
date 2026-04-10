/**
 * toast-message-formatter.ts - Toast通知メッセージの生成（純粋関数）
 * Issue #472: Toast通知導入
 */

/**
 * 納品成功メッセージを生成する
 */
export function formatDeliverySuccessMessage(gold: number, contribution: number): string {
  return `納品成功！ +${gold}G 貢献度+${contribution}`;
}

/**
 * ゴールド変動メッセージを生成する
 * @returns メッセージ文字列。delta=0の場合はnull
 */
export function formatGoldChangedMessage(delta: number): string | null {
  if (delta === 0) return null;
  return delta > 0 ? `+${delta}G` : `${delta}G`;
}

/**
 * AP不足メッセージを生成する
 */
export function formatApInsufficientMessage(): string {
  return 'APが不足しています';
}
