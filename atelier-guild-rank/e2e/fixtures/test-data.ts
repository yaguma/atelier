/**
 * E2Eテスト用の共通テストデータ
 *
 * @description
 * テストシナリオで使用する共通データを定義する。
 * ゲーム状態のセットアップや、テストケースで使用する
 * フィクスチャデータを提供する。
 */

import { GuildRank } from '@shared/types';

// =============================================================================
// ゲーム状態テストシナリオ
// =============================================================================

/**
 * テストシナリオの型定義
 */
export interface TestScenario {
	/** シナリオ名 */
	name: string;
	/** 初期ゲーム状態 */
	initialState: {
		/** ギルドランク */
		rank: GuildRank;
		/** 所持金 */
		gold: number;
		/** 残り日数 */
		days: number;
		/** 行動ポイント */
		actionPoints: number;
		/** 貢献度（オプション） */
		contribution?: number;
	};
	/** シナリオの説明 */
	description: string;
}

/**
 * テストシナリオ定義
 *
 * @description
 * 各種テストケースで使用する標準的なゲーム状態のセットアップデータ。
 */
export const TEST_SCENARIOS = {
	/**
	 * 新規ゲーム開始シナリオ
	 *
	 * @description
	 * ゲーム開始時の初期状態。Gランク、30日、100ゴールド。
	 */
	newGame: {
		name: '新規ゲーム',
		initialState: {
			rank: GuildRank.G,
			gold: 100,
			days: 30,
			actionPoints: 3,
		},
		description: 'ゲーム開始時の初期状態',
	} as TestScenario,

	/**
	 * 中盤プレイシナリオ
	 *
	 * @description
	 * ゲーム中盤の状態。Cランク、15日、500ゴールド。
	 */
	midGame: {
		name: '中盤プレイ',
		initialState: {
			rank: GuildRank.C,
			gold: 500,
			days: 15,
			actionPoints: 3,
		},
		description: 'ゲーム中盤の標準的な進行状態',
	} as TestScenario,

	/**
	 * Sランク到達直前シナリオ
	 *
	 * @description
	 * Aランクで貢献度がSランク昇格直前の状態。
	 */
	nearGameClear: {
		name: 'Sランク到達直前',
		initialState: {
			rank: GuildRank.A,
			gold: 10000,
			days: 5,
			actionPoints: 3,
			contribution: 9500, // Sランク昇格まであと少し
		},
		description: 'Sランク昇格直前の状態（ゲームクリア間近）',
	} as TestScenario,

	/**
	 * ゲームオーバー直前シナリオ
	 *
	 * @description
	 * 残り1日でGランクの状態。翌日にゲームオーバー。
	 */
	nearGameOver: {
		name: 'ゲームオーバー直前',
		initialState: {
			rank: GuildRank.G,
			gold: 0,
			days: 1,
			actionPoints: 3,
			contribution: 0,
		},
		description: '残り1日でGランク（ゲームオーバー直前）',
	} as TestScenario,

	/**
	 * リッチプレイヤーシナリオ
	 *
	 * @description
	 * 潤沢な資金を持つ状態。ショップテストなどに使用。
	 */
	richPlayer: {
		name: 'リッチプレイヤー',
		initialState: {
			rank: GuildRank.B,
			gold: 99999,
			days: 20,
			actionPoints: 3,
		},
		description: '潤沢な資金を持つ状態（ショップテスト用）',
	} as TestScenario,

	/**
	 * 貧乏プレイヤーシナリオ
	 *
	 * @description
	 * 資金が枯渇した状態。エラーハンドリングテストに使用。
	 */
	poorPlayer: {
		name: '貧乏プレイヤー',
		initialState: {
			rank: GuildRank.G,
			gold: 0,
			days: 10,
			actionPoints: 3,
		},
		description: '資金が枯渇した状態（エラーハンドリングテスト用）',
	} as TestScenario,
} as const;

// =============================================================================
// Phase 5 UI強化機能テスト用データ
// =============================================================================

/**
 * ボタンテストデータ
 */
export const BUTTON_TEST_DATA = {
	/** テスト対象ボタンのテキスト */
	buttons: [
		'新規ゲーム',
		'コンティニュー',
		'設定',
		'閉じる',
	],
	/** ホバーエフェクトの期待値 */
	hoverEffect: {
		scaleIncrease: 0.05, // スケール1.0→1.05
		duration: 100, // 100ms
	},
} as const;

/**
 * ツールチップテストデータ
 */
export const TOOLTIP_TEST_DATA = {
	/** ツールチップ表示遅延（ミリ秒） */
	displayDelay: 500,
	/** ツールチップ最大幅 */
	maxWidth: 300,
	/** テスト対象要素のセレクター */
	testElements: [
		'.card-element',
		'.quest-card',
		'.material-slot',
		'.item-icon',
	],
} as const;

/**
 * サイドバーテストデータ
 */
export const SIDEBAR_TEST_DATA = {
	/** セクション名 */
	sections: ['quests', 'materials', 'items'],
	/** 折りたたみアニメーション時間（ミリ秒） */
	animationDuration: 200,
	/** アイコン回転角度 */
	iconRotation: 90, // 90度回転（▼→▶）
} as const;

/**
 * アニメーションテストデータ
 */
export const ANIMATION_TEST_DATA = {
	/** フェードイン/アウト時間（ミリ秒） */
	fadeDuration: 500,
	/** モーダルアニメーション時間（ミリ秒） */
	modalDuration: 300,
	/** ドラッグ&ドロップアニメーション時間（ミリ秒） */
	dragDropDuration: 200,
} as const;

/**
 * 品質テストデータ
 */
export const QUALITY_TEST_DATA = {
	/** 品質レベル */
	qualities: ['D', 'C', 'B', 'A', 'S'] as const,
	/** 品質ごとの枠色（期待値） */
	borderColors: {
		D: '#9CA3AF', // グレー
		C: '#10B981', // 緑
		B: '#3B82F6', // 青
		A: '#F59E0B', // ゴールド
		S: '#EC4899', // マゼンタ
	},
	/** 光彩エフェクトが有効な品質 */
	glowQualities: ['B', 'A', 'S'],
	/** パーティクルエフェクトが有効な品質 */
	particleQualities: ['S'],
} as const;

// =============================================================================
// カードテストデータ
// =============================================================================

/**
 * カードテストデータ
 */
export const CARD_TEST_DATA = {
	/** テスト用カードID */
	testCardIds: [
		'card-001',
		'card-002',
		'card-003',
	],
	/** ドラッグ可能なカードのセレクター */
	draggableCardSelector: '.draggable-card',
	/** ドロップゾーンのセレクター */
	dropZoneSelector: '.drop-zone',
	/** ドラッグ中の視覚効果 */
	dragEffect: {
		scale: 1.1, // スケール1.1倍
		opacity: 0.8, // 透明度80%
		depth: 100, // 深度100
	},
} as const;

// =============================================================================
// 依頼テストデータ
// =============================================================================

/**
 * 依頼テストデータ
 */
export const QUEST_TEST_DATA = {
	/** テスト用依頼ID */
	testQuestIds: [
		'quest-001',
		'quest-002',
		'quest-003',
	],
	/** 依頼難易度 */
	difficulties: [1, 5, 10],
	/** 依頼報酬範囲 */
	rewardRange: {
		min: 100,
		max: 10000,
	},
} as const;

// =============================================================================
// タイムアウト設定
// =============================================================================

/**
 * テストタイムアウト設定
 */
export const TEST_TIMEOUTS = {
	/** キャンバス読み込みタイムアウト */
	canvasLoad: 10000,
	/** シーン遷移タイムアウト */
	sceneTransition: 5000,
	/** アニメーション完了タイムアウト */
	animationComplete: 3000,
	/** ツールチップ表示タイムアウト */
	tooltipDisplay: 1000,
	/** モーダル開閉タイムアウト */
	modalToggle: 1000,
} as const;

// =============================================================================
// エクスポート
// =============================================================================

/**
 * 全テストデータのエクスポート
 */
export const TEST_DATA = {
	scenarios: TEST_SCENARIOS,
	button: BUTTON_TEST_DATA,
	tooltip: TOOLTIP_TEST_DATA,
	sidebar: SIDEBAR_TEST_DATA,
	animation: ANIMATION_TEST_DATA,
	quality: QUALITY_TEST_DATA,
	card: CARD_TEST_DATA,
	quest: QUEST_TEST_DATA,
	timeouts: TEST_TIMEOUTS,
} as const;
