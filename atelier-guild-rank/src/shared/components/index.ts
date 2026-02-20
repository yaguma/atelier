/**
 * Shared Components Module
 * 共通コンポーネントの公開エクスポート
 *
 * TASK-0067: shared/components作成
 * TASK-0103: 共通UIコンポーネント完全移行
 */

// Base
export type { BaseComponentOptions } from './BaseComponent';
export { BaseComponent } from './BaseComponent';
// Button
export { Button, type ButtonConfig, ButtonType } from './Button';
// Dialog
export { Dialog, type DialogAction, type DialogConfig, DialogType } from './Dialog';
// Footer
export { FooterUI } from './FooterUI';
// Header
export { HeaderUI, type IHeaderUIData } from './HeaderUI';
// PhaseTabUI
export { PhaseTabUI } from './PhaseTabUI';
// RewardCardDialog: Phaser.Events.EventEmitter継承のため、バレルエクスポートから除外
// 直接インポートを使用: import { RewardCardDialog } from '@shared/components/RewardCardDialog';
// Sidebar
export { type ISidebarUIData, type SidebarSectionName, SidebarUI } from './SidebarUI';
// TooltipManager
export { type TooltipConfig, TooltipManager } from './TooltipManager';
