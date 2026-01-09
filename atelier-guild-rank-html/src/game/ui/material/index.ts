/**
 * 素材UIコンポーネント
 *
 * 素材表示に関するインターフェース、定数、実装をエクスポートする。
 */

// 定数
export {
  MaterialLayout,
  MaterialQualityColors,
  type MaterialViewMode,
} from './MaterialConstants';

// インターフェース
export {
  type IMaterialView,
  type MaterialViewOptions,
} from './IMaterialView';

// 実装
export { MaterialView } from './MaterialView';
