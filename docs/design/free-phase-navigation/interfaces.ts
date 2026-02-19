/**
 * フェーズ自由遷移システム 型定義
 *
 * 作成日: 2026-02-19
 * 関連設計: architecture.md
 *
 * 信頼性レベル:
 * - 🔵 青信号: EARS要件定義書・設計文書・既存実装を参考にした確実な型定義
 * - 🟡 黄信号: EARS要件定義書・設計文書・既存実装から妥当な推測による型定義
 * - 🔴 赤信号: EARS要件定義書・設計文書・既存実装にない推測による型定義
 */

// ========================================
// 1. フェーズ遷移関連
// ========================================

/**
 * ゲームフェーズ（既存・変更なし）
 * 🔵 信頼性: 既存 src/shared/types/common.ts より
 */
export enum GamePhase {
  QUEST_ACCEPT = 'QUEST_ACCEPT',
  GATHERING = 'GATHERING',
  ALCHEMY = 'ALCHEMY',
  DELIVERY = 'DELIVERY',
}

/**
 * フェーズ遷移マップ（変更: 全フェーズ間の遷移を許可）
 * 🔵 信頼性: REQ-001・ヒアリングQ1「完全自由切り替え」より
 */
export type PhaseTransitionMap = Record<GamePhase, GamePhase[]>;

/**
 * 新しいVALID_PHASE_TRANSITIONS定義
 * 🔵 信頼性: REQ-001-01「どのフェーズからでも他の任意のフェーズへ即座に遷移」より
 */
export const VALID_PHASE_TRANSITIONS: PhaseTransitionMap = {
  [GamePhase.QUEST_ACCEPT]: [GamePhase.GATHERING, GamePhase.ALCHEMY, GamePhase.DELIVERY],
  [GamePhase.GATHERING]: [GamePhase.QUEST_ACCEPT, GamePhase.ALCHEMY, GamePhase.DELIVERY],
  [GamePhase.ALCHEMY]: [GamePhase.QUEST_ACCEPT, GamePhase.GATHERING, GamePhase.DELIVERY],
  [GamePhase.DELIVERY]: [GamePhase.QUEST_ACCEPT, GamePhase.GATHERING, GamePhase.ALCHEMY],
};

/**
 * フェーズ切り替えリクエスト
 * 🟡 信頼性: REQ-001-02・REQ-001-03から妥当な推測
 */
export interface IPhaseSwitchRequest {
  /** 遷移先フェーズ */
  readonly targetPhase: GamePhase;
  /** 進行中の操作を強制中断するか */
  readonly forceAbort?: boolean;
}

/**
 * フェーズ切り替え結果
 * 🟡 信頼性: REQ-001-02・REQ-001-03から妥当な推測
 */
export interface IPhaseSwitchResult {
  /** 切り替え成功したか */
  readonly success: boolean;
  /** 切り替え前のフェーズ */
  readonly previousPhase: GamePhase;
  /** 切り替え後のフェーズ */
  readonly newPhase: GamePhase;
  /** 失敗理由（成功時はundefined） */
  readonly failureReason?: PhaseSwitchFailureReason;
}

/**
 * フェーズ切り替え失敗理由
 * 🟡 信頼性: EDGE-001・REQ-001-03から妥当な推測
 */
export enum PhaseSwitchFailureReason {
  /** ユーザーがキャンセルした */
  USER_CANCELLED = 'USER_CANCELLED',
  /** 採取セッション中断を拒否 */
  SESSION_ABORT_REJECTED = 'SESSION_ABORT_REJECTED',
}

// ========================================
// 2. AP超過・自動日進行関連
// ========================================

/**
 * AP超過計算結果（純粋関数の出力）
 * 🔵 信頼性: REQ-003・REQ-003-01・ヒアリングQ5より
 */
export interface IAPOverflowResult {
  /** AP超過が発生するか */
  readonly hasOverflow: boolean;
  /** 超過APポイント数 */
  readonly overflowAP: number;
  /** 消費する日数 */
  readonly daysConsumed: number;
  /** 翌日開始時のAP */
  readonly nextDayAP: number;
  /** 行動後の残りAP（超過なしの場合のみ意味あり） */
  readonly remainingAP: number;
}

/**
 * AP超過計算入力
 * 🔵 信頼性: REQ-003-05・REQ-003-06・既存GatheringService.calculateGatheringCost()より
 */
export interface IAPConsumptionInput {
  /** 現在のAP残量 */
  readonly currentAP: number;
  /** 消費するAP */
  readonly consumeAP: number;
  /** AP上限（デフォルト: MAX_ACTION_POINTS = 3） */
  readonly maxAP?: number;
}

/**
 * 自動日進行処理結果
 * 🔵 信頼性: REQ-003-02・REQ-003-04・ヒアリングQ10「既存処理を維持」より
 */
export interface IAutoAdvanceDayResult {
  /** 消費した日数 */
  readonly daysAdvanced: number;
  /** 新しい現在日 */
  readonly newCurrentDay: number;
  /** 新しい残り日数 */
  readonly newRemainingDays: number;
  /** 新しいAP */
  readonly newActionPoints: number;
  /** ゲームオーバーになったか */
  readonly isGameOver: boolean;
}

/**
 * AP超過プレビュー表示データ
 * 🟡 信頼性: NFR-102から妥当な推測
 */
export interface IAPOverflowPreviewData {
  /** 消費するAP */
  readonly consumeAP: number;
  /** 現在のAP */
  readonly currentAP: number;
  /** 超過AP */
  readonly overflowAP: number;
  /** 消費する日数 */
  readonly daysConsumed: number;
  /** 翌日のAP */
  readonly nextDayAP: number;
  /** 行動名（例: 「近くの森で採取」「回復薬を調合」） */
  readonly actionName: string;
}

// ========================================
// 3. 採取2段階化関連
// ========================================

/**
 * 採取場所情報
 * 🔵 信頼性: REQ-002-01〜REQ-002-04・ヒアリングQ4より
 */
export interface IGatheringLocation {
  /** 採取地カードID */
  readonly cardId: string;
  /** 採取地名 */
  readonly name: string;
  /** 移動APコスト（基本コスト） */
  readonly movementAPCost: number;
  /** 採取可能素材のプレビュー（素材名リスト） */
  readonly availableMaterials: readonly IMaterialPreview[];
  /** 手札に該当カードがあるか（選択可能フラグ） */
  readonly isSelectable: boolean;
  /** マップ上のX座標 */
  readonly mapX: number;
  /** マップ上のY座標 */
  readonly mapY: number;
}

/**
 * 素材プレビュー（場所選択画面用）
 * 🔵 信頼性: REQ-002-03・ヒアリングQ4「採取可能素材のプレビュー」より
 */
export interface IMaterialPreview {
  /** 素材名 */
  readonly name: string;
  /** レアリティ */
  readonly rarity: string;
  /** 出現確率（表示用） */
  readonly dropRate: 'high' | 'medium' | 'low';
}

/**
 * 採取フェーズの状態
 * 🔵 信頼性: REQ-002・既存設計 gathering.md より
 */
export enum GatheringStage {
  /** 場所選択（新規追加） */
  LOCATION_SELECT = 'LOCATION_SELECT',
  /** 場所詳細（新規追加） */
  LOCATION_DETAIL = 'LOCATION_DETAIL',
  /** ドラフト採取セッション（既存） */
  DRAFT_SESSION = 'DRAFT_SESSION',
  /** 採取結果（既存） */
  GATHER_RESULT = 'GATHER_RESULT',
}

/**
 * 場所選択結果
 * 🔵 信頼性: REQ-002-04・REQ-002-05より
 */
export interface ILocationSelectResult {
  /** 選択した採取地カードID */
  readonly cardId: string;
  /** 採取地名 */
  readonly locationName: string;
  /** 移動APコスト */
  readonly movementAPCost: number;
}

// ========================================
// 4. 依頼掲示板関連
// ========================================

/**
 * 依頼の出所
 * 🔵 信頼性: REQ-005・ヒアリングQ6「訪問+掲示板の両方」より
 */
export enum QuestSource {
  /** 掲示板（累積、期限切れで消える） */
  BOARD = 'BOARD',
  /** 訪問（数日で更新） */
  VISITOR = 'VISITOR',
}

/**
 * 掲示板管理状態
 * 🟡 信頼性: REQ-005-01〜REQ-005-03から妥当な推測
 */
export interface IQuestBoardState {
  /** 掲示板の依頼リスト */
  readonly boardQuests: readonly IBoardQuest[];
  /** 訪問者の依頼リスト */
  readonly visitorQuests: readonly IVisitorQuest[];
  /** 訪問依頼の最終更新日 */
  readonly lastVisitorUpdateDay: number;
}

/**
 * 掲示板依頼
 * 🔵 信頼性: REQ-005-01「掲示板には依頼が累積的に掲載」より
 */
export interface IBoardQuest {
  /** 依頼ID */
  readonly questId: string;
  /** 掲示日 */
  readonly postedDay: number;
  /** 掲示期限（この日を過ぎると消える） */
  readonly expiryDay: number;
}

/**
 * 訪問依頼
 * 🔵 信頼性: REQ-005-02「訪問依頼は数日ごとに更新」より
 */
export interface IVisitorQuest {
  /** 依頼ID */
  readonly questId: string;
  /** 訪問開始日 */
  readonly visitStartDay: number;
  /** 訪問終了日（次回更新日） */
  readonly visitEndDay: number;
}

/**
 * 掲示板更新入力
 * 🟡 信頼性: REQ-005-03から妥当な推測
 */
export interface IQuestBoardUpdateInput {
  /** 現在の日 */
  readonly currentDay: number;
  /** 現在のギルドランク */
  readonly currentRank: string;
  /** 現在の掲示板状態 */
  readonly currentBoard: IQuestBoardState;
}

/**
 * 掲示板更新結果
 * 🟡 信頼性: REQ-005-01〜REQ-005-03から妥当な推測
 */
export interface IQuestBoardUpdateResult {
  /** 更新後の掲示板状態 */
  readonly newBoard: IQuestBoardState;
  /** 期限切れで削除された依頼ID */
  readonly expiredQuestIds: readonly string[];
  /** 新しく追加された掲示板依頼 */
  readonly newBoardQuests: readonly IBoardQuest[];
  /** 訪問依頼が更新されたか */
  readonly visitorQuestsUpdated: boolean;
}

// ========================================
// 5. タブUI関連
// ========================================

/**
 * タブ定義
 * 🔵 信頼性: REQ-006-01「依頼・採取・調合・納品の4つ」より
 */
export interface IPhaseTab {
  /** 対応フェーズ */
  readonly phase: GamePhase;
  /** 表示ラベル */
  readonly label: string;
  /** タブの色 */
  readonly color: number;
  /** アイコンキー（テクスチャアトラス内） */
  readonly iconKey?: string;
}

/**
 * タブ状態
 * 🔵 信頼性: REQ-006-02「現在アクティブなフェーズのタブは視覚的に強調表示」より
 */
export enum PhaseTabState {
  /** 非アクティブ */
  INACTIVE = 'INACTIVE',
  /** アクティブ（現在のフェーズ） */
  ACTIVE = 'ACTIVE',
}

/**
 * タブクリックイベントペイロード
 * 🔵 信頼性: REQ-006-03「タブをクリックすることで即座にフェーズを切り替え」より
 */
export interface IPhaseTabClickPayload {
  /** クリックされたフェーズ */
  readonly phase: GamePhase;
}

// ========================================
// 6. IGameState拡張フィールド
// ========================================

/**
 * IGameStateに追加するフィールド
 * 🟡 信頼性: 要件から妥当な推測（フィールド名は推測）
 */
export interface IGameStateExtension {
  /** 前日のAP超過分（翌日AP回復時に差し引き） */
  readonly apOverflow: number;
  /** 掲示板状態 */
  readonly questBoard: IQuestBoardState;
}

// ========================================
// 7. サービスインターフェース
// ========================================

/**
 * AP超過計算サービス（純粋関数）
 * 🔵 信頼性: REQ-003・architecture.md設計より
 */
export interface IAPOverflowService {
  /**
   * AP超過を計算する
   * @param input AP消費入力
   * @returns AP超過計算結果
   */
  calculateOverflow(input: IAPConsumptionInput): IAPOverflowResult;
}

/**
 * GameFlowManager の拡張メソッド
 * 🔵 信頼性: REQ-001・REQ-003・REQ-004・architecture.md設計より
 */
export interface IGameFlowManagerExtension {
  /**
   * フェーズを切り替える（自由遷移）
   * @param request 切り替えリクエスト
   * @returns 切り替え結果
   */
  switchPhase(request: IPhaseSwitchRequest): Promise<IPhaseSwitchResult>;

  /**
   * AP超過による自動日進行を処理する
   * @param overflowResult AP超過計算結果
   * @returns 自動日進行結果
   */
  processAPOverflow(overflowResult: IAPOverflowResult): Promise<IAutoAdvanceDayResult>;

  /**
   * 明示的に日を終了する
   */
  requestEndDay(): Promise<void>;
}

/**
 * 掲示板管理サービス
 * 🟡 信頼性: REQ-005から妥当な推測
 */
export interface IQuestBoardService {
  /**
   * 掲示板を更新する（日開始時に呼ばれる）
   * @param input 更新入力
   * @returns 更新結果
   */
  updateBoard(input: IQuestBoardUpdateInput): IQuestBoardUpdateResult;

  /**
   * 掲示板から依頼を受注する
   * @param questId 依頼ID
   * @returns 受注成功したか
   */
  acceptBoardQuest(questId: string): boolean;

  /**
   * 訪問依頼を受注する
   * @param questId 依頼ID
   * @returns 受注成功したか
   */
  acceptVisitorQuest(questId: string): boolean;
}

// ========================================
// 8. イベントペイロード拡張
// ========================================

/**
 * AP超過イベントペイロード
 * 🟡 信頼性: NFR-101・NFR-102から妥当な推測
 */
export interface IAPOverflowEventPayload {
  /** 超過計算結果 */
  readonly overflowResult: IAPOverflowResult;
  /** 行動名 */
  readonly actionName: string;
}

/**
 * 自動日進行イベントペイロード
 * 🟡 信頼性: NFR-101「自動日進行時はプレイヤーに視覚的に通知」から妥当な推測
 */
export interface IAutoAdvanceDayEventPayload {
  /** 進行した日数 */
  readonly daysAdvanced: number;
  /** 新しい日 */
  readonly newDay: number;
  /** 新しいAP */
  readonly newAP: number;
  /** 原因（採取/調合） */
  readonly cause: 'gathering' | 'alchemy';
}

// ========================================
// 信頼性レベルサマリー
// ========================================
/**
 * - 🔵 青信号: 28件 (70%)
 * - 🟡 黄信号: 12件 (30%)
 * - 🔴 赤信号: 0件 (0%)
 *
 * 品質評価: ✅ 高品質
 *
 * 🟡の主な項目:
 * - フェーズ切り替えリクエスト/結果の具体的なフィールド構成
 * - AP超過プレビュー表示データの具体的なフィールド
 * - 掲示板管理状態の具体的なフィールド構成
 * - IGameState拡張フィールドの具体的な命名
 * - イベントペイロードの具体的なフィールド構成
 */
