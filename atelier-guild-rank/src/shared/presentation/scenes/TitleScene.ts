/**
 * TitleScene.ts - 再エクスポートシム
 * TASK-0096: TitleSceneはsrc/scenes/TitleScene.tsに移行済み
 *
 * 後方互換性のため、@presentation/scenes/TitleSceneからのインポートを維持する。
 */

export type { ISaveDataRepository, SaveData } from '@scenes/TitleScene';
export { TitleScene } from '@scenes/TitleScene';
