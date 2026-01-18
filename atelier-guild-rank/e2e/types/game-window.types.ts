/**
 * E2Eテスト用の共通型定義
 *
 * @description
 * window.gameState()およびwindow.debugで使用される型定義を提供する。
 * ページオブジェクト間で共有することで型定義の重複を排除する。
 */

/**
 * ゲーム状態の型定義（window.gameState()から取得）
 *
 * @description
 * StateManagerから公開される状態を表す。
 * 各シーンで必要なプロパティを含む。
 */
export interface GameState {
	/** 現在のシーン名（TitleScene, MainScene, ResultScene等） */
	currentScene?: string;
	/** 現在のフェーズ（Morning, Expedition等） */
	currentPhase?: string;
	/** 残り日数（1-30） */
	remainingDays?: number;
	/** 所持金 */
	gold?: number;
	/** 現在のギルドランク（G-S） */
	currentRank?: string;
	/** 行動ポイント */
	actionPoints?: number;
	/** セーブデータの存在有無 */
	hasSaveData?: boolean;
	/** ゲームクリア状態 */
	isGameClear?: boolean;
	/** ゲームオーバー状態 */
	isGameOver?: boolean;
}

/**
 * デバッグツールの型定義
 *
 * @description
 * 開発環境でのみ利用可能なデバッグ機能。
 * window.debugとして公開される。
 */
export interface DebugTools {
	/** ギルドランクを設定 */
	setRank?: (rank: string) => void;
	/** ゴールドを追加（負の値で減少） */
	addGold?: (amount: number) => void;
	/** 指定日にスキップ */
	skipToDay?: (day: number) => void;
	/** 全カードを解放 */
	unlockAllCards?: () => void;
	/** 現在の状態をコンソールに出力 */
	logState?: () => void;
	/** 行動ポイントを設定 */
	setActionPoints?: (ap: number) => void;
	/** セーブデータを削除 */
	clearSaveData?: () => void;
	/** フェーズをスキップ */
	skipPhase?: () => void;
	/** 日を終了 */
	endDay?: () => void;
	/** タイトルに戻る */
	returnToTitle?: () => void;
	/** 新規ゲームを開始 */
	clickNewGame?: () => void;
	/** コンティニュー */
	clickContinue?: () => void;
}

/**
 * グローバルウィンドウの拡張型
 *
 * @description
 * ゲームアプリケーションによって拡張されたwindowオブジェクトの型。
 */
export interface GameWindow {
	/** ゲーム状態を取得する関数 */
	gameState?: () => GameState;
	/** デバッグツール（開発環境のみ） */
	debug?: DebugTools;
}
