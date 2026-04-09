/**
 * QuestDetailModal.spec.ts - 依頼詳細モーダルコンポーネントのテスト
 * TASK-0043 依頼詳細モーダル・受注アニメーション
 *
 * @description
 * TC-001 ~ TC-011: 正常系テストケース（モーダル初期化・表示）
 * TC-101 ~ TC-106: アニメーションテストケース
 * TC-201 ~ TC-207: インタラクションテストケース
 * TC-301 ~ TC-304: リソース管理テストケース
 * TC-401 ~ TC-405: 異常系テストケース
 * TC-501 ~ TC-503: 境界値テストケース
 */

import type { Quest } from '@domain/entities/Quest';
import {
  QuestDetailModal,
  type QuestDetailModalConfig,
} from '@presentation/ui/components/QuestDetailModal';
import type { ClientType, QuestType } from '@shared/types';
import { toClientId, toQuestId } from '@shared/types/ids';
import type { IClient, IQuest, QuestDifficulty } from '@shared/types/quests';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// =============================================================================
// モックヘルパー関数
// =============================================================================

/**
 * Phaserシーンのモックを作成
 */
function createMockScene(): Phaser.Scene {
  const mockTween = {
    on: vi.fn().mockReturnThis(),
    stop: vi.fn(),
  };

  const mockScene = {
    add: {
      // Issue #470: SlidePanel 合成版 QuestDetailModal は container.setVisible も使うので追加
      container: vi.fn().mockReturnValue({
        add: vi.fn(),
        remove: vi.fn().mockReturnThis(),
        setDepth: vi.fn().mockReturnThis(),
        setScale: vi.fn().mockReturnThis(),
        setAlpha: vi.fn().mockReturnThis(),
        setVisible: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
        x: 0,
        y: 0,
        active: true,
      }),
      text: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setDepth: vi.fn().mockReturnThis(),
        setScale: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
        active: true,
      }),
      // Issue #470: SlidePanel が setStrokeStyle を呼ぶため追加
      rectangle: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setStrokeStyle: vi.fn().mockReturnThis(),
        setFillStyle: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        setDepth: vi.fn().mockReturnThis(),
        setAlpha: vi.fn().mockReturnThis(),
        setVisible: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        off: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
        emit: vi.fn(),
        listenerCount: vi.fn().mockReturnValue(0),
        active: true,
      }),
    },
    tweens: {
      add: vi.fn().mockReturnValue(mockTween),
      killTweensOf: vi.fn(),
    },
    input: {
      keyboard: {
        addKey: vi.fn().mockReturnValue({
          on: vi.fn().mockReturnThis(),
          off: vi.fn().mockReturnThis(),
        }),
        removeKey: vi.fn(),
      },
    },
    data: {
      get: vi.fn().mockReturnValue(null),
    },
    plugins: {
      get: vi.fn().mockReturnValue({
        add: {
          sizer: vi.fn(),
        },
      }),
    },
    cameras: {
      main: {
        width: 1280,
        height: 720,
      },
    },
    // biome-ignore lint/suspicious/noExplicitAny: テストでPhaserシーンをモック化するために必要
  } as any;

  return mockScene;
}

/**
 * Questモックデータを作成
 */
function createMockQuest(overrides?: Partial<IQuest>): IQuest {
  return {
    id: toQuestId('Q001'),
    clientId: toClientId('C001'),
    condition: {
      type: 'SPECIFIC' as QuestType,
      itemId: 'healing-potion',
      quantity: 3,
      minQuality: 'C',
    },
    contribution: 50,
    gold: 100,
    deadline: 3,
    difficulty: 'easy' as QuestDifficulty,
    flavorText: 'これは依頼のセリフです',
    ...overrides,
  };
}

/**
 * Clientモックデータを作成
 */
// biome-ignore lint/suspicious/noExplicitAny: テストで柔軟なオーバーライドを許可するために必要
function createMockClient(overrides?: any): IClient {
  const converted = overrides
    ? {
        ...overrides,
        id: overrides.id ? toClientId(overrides.id) : undefined,
      }
    : {};

  return {
    id: toClientId('C001'),
    name: '村人',
    type: 'VILLAGER' as ClientType,
    contributionMultiplier: 1.0,
    goldMultiplier: 1.0,
    deadlineModifier: 0,
    preferredQuestTypes: [],
    // biome-ignore lint/suspicious/noExplicitAny: テストでRank型をモック化するために必要
    unlockRank: 'bronze-5' as any,
    ...converted,
  };
}

/**
 * Questエンティティのモックを作成
 */
// biome-ignore lint/suspicious/noExplicitAny: テストで柔軟なオーバーライドを許可するために必要
function createMockQuestEntity(questData?: any, clientData?: any): Quest {
  const convertedQuestData = questData
    ? {
        ...questData,
        id: questData.id ? toQuestId(questData.id) : undefined,
        clientId: questData.clientId ? toClientId(questData.clientId) : undefined,
      }
    : undefined;

  const convertedClientData = clientData
    ? {
        ...clientData,
        id: clientData.id ? toClientId(clientData.id) : undefined,
      }
    : undefined;

  const mockQuestData = createMockQuest(convertedQuestData as Partial<IQuest>);
  const mockClientData = createMockClient(convertedClientData as Partial<IClient>);
  return {
    data: mockQuestData,
    client: mockClientData,
    id: mockQuestData.id,
    clientId: mockQuestData.clientId,
    condition: mockQuestData.condition,
    baseContribution: mockQuestData.contribution,
    baseGold: mockQuestData.gold,
    deadline: mockQuestData.deadline,
    difficulty: mockQuestData.difficulty,
    flavorText: mockQuestData.flavorText,
  } as Quest;
}

// =============================================================================
// テストスイート
// =============================================================================

describe('QuestDetailModal', () => {
  let mockScene: Phaser.Scene;
  let mockQuest: Quest;
  let mockOnAccept: (quest: Quest) => void;
  let mockOnClose: () => void;

  beforeEach(() => {
    // 各テスト実行前にモックを初期化
    mockScene = createMockScene();
    mockQuest = createMockQuestEntity();
    mockOnAccept = vi.fn() as unknown as (quest: Quest) => void;
    mockOnClose = vi.fn() as unknown as () => void;
  });

  // =============================================================================
  // 1. 正常系テストケース
  // =============================================================================

  describe('1.1 正常系テストケース', () => {
    describe('TC-001: モーダル初期化', () => {
      // 【テスト目的】: 正常なconfigでQuestDetailModalが初期化されることを確認
      // 【対応要件】: FR-001, AC-001
      // 🔵 信頼性レベル: requirements.md セクション3 FR-001に明記

      test('正常なconfigでモーダルが初期化される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);

        expect(modal).toBeDefined();
        expect(modal).toBeInstanceOf(QuestDetailModal);
      });
    });

    describe('TC-002: モーダルUI作成', () => {
      // 【テスト目的】: create()でオーバーレイとパネルが正しく作成されることを確認
      // 【対応要件】: FR-001, FR-002, NFR-002
      // 🔵 信頼性レベル: requirements.md セクション3 FR-001, FR-002に明記

      test('create()でオーバーレイとパネルが作成される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();

        // オーバーレイ（depth: 900）とパネル（depth: 1000）が作成されることを確認
        expect(mockScene.add.rectangle).toHaveBeenCalled();
        expect(mockScene.add.container).toHaveBeenCalled();
      });
    });

    describe('TC-003: 依頼者情報表示', () => {
      // 【テスト目的】: 依頼者名が正しく表示されることを確認
      // 【対応要件】: FR-001, AC-002
      // 🔵 信頼性レベル: requirements.md セクション3 FR-001に明記

      test('依頼者名が正しく表示される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();

        // 「村人」が表示されることを確認
        expect(mockScene.add.text).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Number),
          expect.stringContaining('村人'),
          expect.any(Object),
        );
      });
    });

    describe('TC-004: 依頼内容表示', () => {
      // 【テスト目的】: 依頼内容が正しく表示されることを確認
      // 【対応要件】: FR-001, AC-002
      // 🔵 信頼性レベル: requirements.md セクション3 FR-001に明記

      test('依頼内容（アイテム名×数量）が正しく表示される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();

        // 依頼条件が表示されることを確認
        expect(mockScene.add.text).toHaveBeenCalled();
      });
    });

    describe('TC-005: 期限表示', () => {
      // 【テスト目的】: 期限が「〜日以内」の形式で表示されることを確認
      // 【対応要件】: FR-001, AC-002
      // 🔵 信頼性レベル: requirements.md セクション3 FR-001に明記

      test('期限が「〜日以内」の形式で表示される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();

        // 「3日以内」が表示されることを確認
        expect(mockScene.add.text).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Number),
          expect.stringContaining('3'),
          expect.any(Object),
        );
      });
    });

    describe('TC-006: 報酬詳細表示', () => {
      // 【テスト目的】: 報酬（ゴールド / 貢献度）が正しく表示されることを確認
      // 【対応要件】: FR-001, AC-002
      // 🔵 信頼性レベル: requirements.md セクション3 FR-001に明記

      test('報酬（ゴールド / 貢献度）が正しく表示される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();

        // 「100G」「50貢献度」が表示されることを確認
        expect(mockScene.add.text).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Number),
          expect.stringContaining('100'),
          expect.any(Object),
        );
      });
    });

    describe('TC-007: 難易度表示（星5）', () => {
      // 【テスト目的】: 難易度5で★★★★★が表示されることを確認
      // 【対応要件】: FR-009
      // 🟡 信頼性レベル: requirements.md セクション3 FR-009に明記

      test('難易度5で★★★★★が表示される', () => {
        const hardQuest = createMockQuestEntity({ difficulty: 'hard' });
        const config: QuestDetailModalConfig = {
          quest: hardQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        const result = modal.formatDifficulty(5);

        expect(result).toBe('★★★★★');
      });
    });

    describe('TC-008: 難易度表示（星3）', () => {
      // 【テスト目的】: 難易度3で★★★☆☆が表示されることを確認
      // 【対応要件】: FR-009
      // 🟡 信頼性レベル: requirements.md セクション3 FR-009に明記

      test('難易度3で★★★☆☆が表示される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        const result = modal.formatDifficulty(3);

        expect(result).toBe('★★★☆☆');
      });
    });

    describe('TC-009: 難易度表示（星1）', () => {
      // 【テスト目的】: 難易度1で★☆☆☆☆が表示されることを確認
      // 【対応要件】: FR-009
      // 🟡 信頼性レベル: requirements.md セクション3 FR-009に明記

      test('難易度1で★☆☆☆☆が表示される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        const result = modal.formatDifficulty(1);

        expect(result).toBe('★☆☆☆☆');
      });
    });

    describe('TC-010: 「受注する」ボタン表示', () => {
      // 【テスト目的】: 「受注する」ボタンが表示されることを確認
      // 【対応要件】: FR-001
      // 🔵 信頼性レベル: requirements.md セクション3 FR-001に明記

      test('「受注する」ボタンが表示される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();

        // 「受注する」ボタンが表示されることを確認
        expect(mockScene.add.text).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Number),
          expect.stringContaining('受注'),
          expect.any(Object),
        );
      });
    });

    describe('TC-011: 「閉じる」ボタン表示', () => {
      // 【テスト目的】: 「閉じる」ボタンが表示されることを確認
      // 【対応要件】: FR-001
      // 🔵 信頼性レベル: requirements.md セクション3 FR-001に明記

      test('「閉じる」ボタンが表示される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();

        // 「閉じる」ボタンが表示されることを確認
        expect(mockScene.add.text).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Number),
          expect.stringContaining('閉じる'),
          expect.any(Object),
        );
      });
    });
  });

  // =============================================================================
  // 1.2 アニメーションテストケース
  // =============================================================================

  describe('1.2 アニメーションテストケース', () => {
    describe('TC-101: モーダル開くアニメーション', () => {
      // 【テスト目的】: create()で開くアニメーションが再生されることを確認
      // 【対応要件】: FR-003
      // 🔵 信頼性レベル: requirements.md セクション3 FR-003に明記

      test('create()で開くアニメーションが再生される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();

        // オーバーレイのフェードイン（alpha 0→0.7, 200ms）とパネルのスケールイン（scale 0.8→1, 300ms）が再生される
        expect(mockScene.tweens.add).toHaveBeenCalled();
      });
    });

    describe('TC-102: モーダル閉じるアニメーション（閉じるボタン）', () => {
      // 【テスト目的】: 「閉じる」ボタンクリックで閉じるアニメーションが再生されることを確認
      // 【対応要件】: FR-004, AC-004
      // 🔵 信頼性レベル: requirements.md セクション3 FR-004に明記

      test('「閉じる」ボタンクリックで閉じるアニメーションが再生される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();
        modal.close();

        // 閉じるアニメーションが再生され、onCloseコールバックが呼ばれることを確認
        expect(mockScene.tweens.add).toHaveBeenCalled();
      });
    });

    describe('TC-103: モーダル閉じるアニメーション（オーバーレイクリック）', () => {
      // 【テスト目的】: オーバーレイクリックで閉じるアニメーションが再生されることを確認
      // 【対応要件】: FR-002, FR-004, AC-005
      // 🔵 信頼性レベル: requirements.md セクション3 FR-002, FR-004に明記

      test('オーバーレイクリックで閉じるアニメーションが再生される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();

        // オーバーレイにpointerdownイベントが設定されていることを確認
        expect(mockScene.add.rectangle).toHaveBeenCalled();
      });
    });

    describe('TC-104: ESCキーでモーダルを閉じる', () => {
      // 【テスト目的】: ESCキー押下で閉じるアニメーションが再生されることを確認
      // 【対応要件】: FR-005, AC-006
      // 🔵 信頼性レベル: requirements.md セクション3 FR-005に明記

      test('ESCキー押下で閉じるアニメーションが再生される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();

        // ESCキーイベントリスナーが設定されていることを確認
        expect(mockScene.input.keyboard?.addKey).toHaveBeenCalled();
      });
    });

    describe('TC-105: 受注成功アニメーション', () => {
      // 【テスト目的】: 「受注する」ボタンクリックで受注成功アニメーションが再生されることを確認
      // 【対応要件】: FR-006, AC-003
      // 🔵 信頼性レベル: requirements.md セクション3 FR-006に明記

      test('「受注する」ボタンクリックで受注成功アニメーションが再生される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();
        modal.playAcceptAnimation();

        // 「受注完了！」テキスト表示とアニメーションが再生されることを確認
        expect(mockScene.tweens.add).toHaveBeenCalled();
      });
    });

    describe('TC-106: 受注完了テキストのdepth', () => {
      // 【テスト目的】: 「受注完了！」テキストがdepth 1100で表示されることを確認
      // 【対応要件】: NFR-002
      // 🟡 信頼性レベル: requirements.md セクション4 NFR-002に明記

      test('「受注完了！」テキストがdepth 1100で表示される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();
        modal.playAcceptAnimation();

        // テキストのdepthが1100に設定されていることを確認
        expect(mockScene.add.text).toHaveBeenCalled();
      });
    });
  });

  // =============================================================================
  // 1.3 インタラクションテストケース
  // =============================================================================

  describe('1.3 インタラクションテストケース', () => {
    describe('TC-201: 受注ボタンクリックでonAcceptコールバック', () => {
      // 【テスト目的】: 「受注する」ボタンクリックでonAcceptが呼ばれることを確認
      // 【対応要件】: AC-003
      // 🔵 信頼性レベル: requirements.md セクション5 AC-003に明記

      test('「受注する」ボタンクリックでonAcceptが呼ばれる', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();

        // 受注ボタンをシミュレートして onAccept が呼ばれることを確認
        // （実装がないため、このテストは失敗する）
        modal.handleAccept();

        expect(mockOnAccept).toHaveBeenCalledTimes(1);
        expect(mockOnAccept).toHaveBeenCalledWith(mockQuest);
      });
    });

    describe('TC-202: 閉じるボタンクリックでonCloseコールバック', () => {
      // 【テスト目的】: 「閉じる」ボタンクリックでonCloseが呼ばれることを確認
      // 【対応要件】: AC-004
      // 🔵 信頼性レベル: requirements.md セクション5 AC-004に明記

      test('「閉じる」ボタンクリックでonCloseが呼ばれる', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();

        // 閉じるボタンをシミュレートして onClose が呼ばれることを確認
        modal.close();

        // アニメーション完了後に呼ばれるはず（モックでは即時呼び出し）
        // 実装がないため、このテストは失敗する
      });
    });

    describe('TC-203: アニメーション中の重複クリック防止（受注ボタン）', () => {
      // 【テスト目的】: アニメーション中の「受注する」ボタンクリックが無視されることを確認
      // 【対応要件】: FR-008, AC-007
      // 🔵 信頼性レベル: requirements.md セクション3 FR-008に明記

      test('アニメーション中の「受注する」ボタンクリックは無視される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();

        // アニメーション中にする
        modal.setAnimating(true);

        // 受注ボタンをクリック
        modal.handleAccept();

        // onAcceptは呼ばれないはず
        expect(mockOnAccept).not.toHaveBeenCalled();
      });
    });

    describe('TC-204: アニメーション中の重複クリック防止（閉じるボタン）', () => {
      // 【テスト目的】: アニメーション中の「閉じる」ボタンクリックが無視されることを確認
      // 【対応要件】: FR-008
      // 🔵 信頼性レベル: requirements.md セクション3 FR-008に明記

      test('アニメーション中の「閉じる」ボタンクリックは無視される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();

        // アニメーション中にする
        modal.setAnimating(true);

        // 閉じるボタンをクリック
        modal.close();

        // アニメーションが1回のみ実行されることを確認
        // 実装がないため、このテストは失敗する
      });
    });

    describe('TC-205: アニメーション中の重複クリック防止（オーバーレイ）', () => {
      // 【テスト目的】: アニメーション中のオーバーレイクリックが無視されることを確認
      // 【対応要件】: FR-008
      // 🟡 信頼性レベル: requirements.md セクション3 FR-008に明記

      test('アニメーション中のオーバーレイクリックは無視される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();

        // アニメーション中にする
        modal.setAnimating(true);

        // isAnimating()がtrueを返すことを確認
        expect(modal.isAnimating()).toBe(true);
      });
    });

    describe('TC-206: アニメーション中のESCキー無視', () => {
      // 【テスト目的】: アニメーション中のESCキー押下が無視されることを確認
      // 【対応要件】: FR-008
      // 🟡 信頼性レベル: requirements.md セクション3 FR-008に明記

      test('アニメーション中のESCキー押下は無視される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();

        // アニメーション中にする
        modal.setAnimating(true);

        // ESCキーを押す
        modal.handleEscKey();

        // close()が呼ばれないことを確認
        // 実装がないため、このテストは失敗する
      });
    });

    describe('TC-207: アニメーション完了後のisAnimating状態', () => {
      // 【テスト目的】: アニメーション完了後にisAnimatingがfalseになることを確認
      // 【対応要件】: FR-008
      // 🟡 信頼性レベル: requirements.md セクション3 FR-008に明記

      test('アニメーション完了後にisAnimatingがfalseになる', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();

        // アニメーション開始
        modal.setAnimating(true);
        expect(modal.isAnimating()).toBe(true);

        // アニメーション完了
        modal.setAnimating(false);
        expect(modal.isAnimating()).toBe(false);
      });
    });
  });

  // =============================================================================
  // 1.4 リソース管理テストケース
  // =============================================================================

  describe('1.4 リソース管理テストケース', () => {
    describe('TC-301: destroy()でGameObjects破棄', () => {
      // 【テスト目的】: destroy()ですべてのGameObjectsが破棄されることを確認
      // 【対応要件】: FR-010, AC-009
      // 🔵 信頼性レベル: requirements.md セクション3 FR-010に明記

      test('destroy()ですべてのGameObjectsが破棄される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();
        modal.destroy();

        // すべてのdestroy()が呼ばれることを確認
        // 実装がないため、このテストは失敗する
      });
    });

    describe('TC-302: destroy()でESCキーリスナー解除', () => {
      // 【テスト目的】: destroy()でESCキーイベントリスナーが解除されることを確認
      // 【対応要件】: FR-010
      // 🔵 信頼性レベル: requirements.md セクション3 FR-010に明記

      test('destroy()でESCキーイベントリスナーが解除される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();
        modal.destroy();

        // ESCキーの'down'イベントリスナーがoffされることを確認
        // 実装がないため、このテストは失敗する
      });
    });

    describe('TC-303: destroy()でTweenキャンセル', () => {
      // 【テスト目的】: destroy()で進行中のTweenがキャンセルされることを確認
      // 【対応要件】: FR-010
      // 🟡 信頼性レベル: requirements.md セクション3 FR-010に明記

      test('destroy()で進行中のTweenがキャンセルされる', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();
        modal.playAcceptAnimation();
        modal.destroy();

        // 進行中のTweenがキャンセルされることを確認
        expect(mockScene.tweens.killTweensOf).toHaveBeenCalled();
      });
    });

    describe('TC-304: 既に閉じているモーダルでclose()呼び出し', () => {
      // 【テスト目的】: 既に閉じているモーダルでclose()を呼び出してもエラーにならないことを確認
      // 【対応要件】: ERR-007
      // 🟡 信頼性レベル: requirements.md セクション6 ERR-007に明記

      test('既に閉じているモーダルでclose()を呼び出してもエラーにならない', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();
        modal.destroy();

        // 既にdestroy()されている状態でclose()を呼び出す
        expect(() => modal.close()).not.toThrow();
      });
    });
  });

  // =============================================================================
  // 1.5 異常系テストケース
  // =============================================================================

  describe('1.5 異常系テストケース', () => {
    describe('TC-401: configがnullの場合', () => {
      // 【テスト目的】: configがnullの場合にエラーがスローされることを確認
      // 【対応要件】: ERR-001
      // 🔵 信頼性レベル: requirements.md セクション6 ERR-001に明記

      test('configがnullの場合にエラーがスローされる', () => {
        expect(() => {
          // biome-ignore lint/suspicious/noExplicitAny: 異常系テストでnull入力をテストするために必要
          new QuestDetailModal(mockScene, null as any);
        }).toThrow();
      });

      test('エラーメッセージに「config」が含まれる', () => {
        expect(() => {
          // biome-ignore lint/suspicious/noExplicitAny: 異常系テストでnull入力をテストするために必要
          new QuestDetailModal(mockScene, null as any);
        }).toThrow(/config/i);
      });
    });

    describe('TC-402: config.questがnullの場合', () => {
      // 【テスト目的】: config.questがnullの場合にエラーがスローされることを確認
      // 【対応要件】: ERR-002
      // 🔵 信頼性レベル: requirements.md セクション6 ERR-002に明記

      test('config.questがnullの場合にエラーがスローされる', () => {
        // biome-ignore lint/suspicious/noExplicitAny: 異常系テストで不正な型入力をテストするために必要
        const config: any = {
          quest: null,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        expect(() => {
          new QuestDetailModal(mockScene, config);
        }).toThrow();
      });

      test('エラーメッセージに「quest」が含まれる', () => {
        // biome-ignore lint/suspicious/noExplicitAny: 異常系テストで不正な型入力をテストするために必要
        const config: any = {
          quest: null,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        expect(() => {
          new QuestDetailModal(mockScene, config);
        }).toThrow(/quest/i);
      });
    });

    describe('TC-403: config.onAcceptが関数でない場合', () => {
      // 【テスト目的】: config.onAcceptが関数でない場合にエラーがスローされることを確認
      // 【対応要件】: ERR-003
      // 🔵 信頼性レベル: requirements.md セクション6 ERR-003に明記

      test('config.onAcceptが関数でない場合にエラーがスローされる', () => {
        // biome-ignore lint/suspicious/noExplicitAny: 異常系テストで不正な型入力をテストするために必要
        const config: any = {
          quest: mockQuest,
          onAccept: 'string',
          onClose: mockOnClose,
        };

        expect(() => {
          new QuestDetailModal(mockScene, config);
        }).toThrow();
      });

      test('エラーメッセージに「onAccept」が含まれる', () => {
        // biome-ignore lint/suspicious/noExplicitAny: 異常系テストで不正な型入力をテストするために必要
        const config: any = {
          quest: mockQuest,
          onAccept: 'string',
          onClose: mockOnClose,
        };

        expect(() => {
          new QuestDetailModal(mockScene, config);
        }).toThrow(/onAccept/i);
      });
    });

    describe('TC-404: config.onCloseが関数でない場合', () => {
      // 【テスト目的】: config.onCloseが関数でない場合にエラーがスローされることを確認
      // 【対応要件】: ERR-004
      // 🔵 信頼性レベル: requirements.md セクション6 ERR-004に明記

      test('config.onCloseが関数でない場合にエラーがスローされる', () => {
        // biome-ignore lint/suspicious/noExplicitAny: 異常系テストで不正な型入力をテストするために必要
        const config: any = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: 123,
        };

        expect(() => {
          new QuestDetailModal(mockScene, config);
        }).toThrow();
      });

      test('エラーメッセージに「onClose」が含まれる', () => {
        // biome-ignore lint/suspicious/noExplicitAny: 異常系テストで不正な型入力をテストするために必要
        const config: any = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: 123,
        };

        expect(() => {
          new QuestDetailModal(mockScene, config);
        }).toThrow(/onClose/i);
      });
    });

    describe('TC-405: sceneがnullの場合', () => {
      // 【テスト目的】: sceneがnullの場合にエラーがスローされることを確認
      // 【対応要件】: ERR-005
      // 🔵 信頼性レベル: requirements.md セクション6 ERR-005に明記

      test('sceneがnullの場合にエラーがスローされる', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        expect(() => {
          // biome-ignore lint/suspicious/noExplicitAny: 異常系テストでnull入力をテストするために必要
          new QuestDetailModal(null as any, config);
        }).toThrow();
      });

      test('エラーメッセージに「scene」が含まれる', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        expect(() => {
          // biome-ignore lint/suspicious/noExplicitAny: 異常系テストでnull入力をテストするために必要
          new QuestDetailModal(null as any, config);
        }).toThrow(/scene/i);
      });
    });
  });

  // =============================================================================
  // 1.6 境界値テストケース
  // =============================================================================

  describe('1.6 境界値テストケース', () => {
    describe('TC-501: 難易度0の場合', () => {
      // 【テスト目的】: difficulty=0で☆☆☆☆☆が表示されることを確認
      // 【対応要件】: FR-009
      // 🟠 信頼性レベル: requirements.md セクション3 FR-009に明記

      test('difficulty=0で☆☆☆☆☆が表示される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        const result = modal.formatDifficulty(0);

        // 0の場合は☆☆☆☆☆または最小値1に丸められる
        expect(result).toMatch(/[★☆]{5}/);
      });
    });

    describe('TC-502: 難易度6の場合（上限超過）', () => {
      // 【テスト目的】: difficulty=6で★★★★★が表示されることを確認（上限5）
      // 【対応要件】: FR-009
      // 🟠 信頼性レベル: requirements.md セクション3 FR-009に明記

      test('difficulty=6で★★★★★が表示される（上限5）', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        const result = modal.formatDifficulty(6);

        // 6の場合は最大値5に丸められて★★★★★
        expect(result).toBe('★★★★★');
      });
    });

    describe('TC-503: 長いflavorTextの依頼', () => {
      // 【テスト目的】: 長いflavorTextでもエラーなく表示されることを確認
      // 【対応要件】: FR-001
      // 🟠 信頼性レベル: requirements.md セクション3 FR-001に明記

      test('長いflavorTextでもエラーなく表示される', () => {
        const longText = 'これは非常に長いフレーバーテキストです。'.repeat(30);
        const longQuest = createMockQuestEntity({ flavorText: longText });

        const config: QuestDetailModalConfig = {
          quest: longQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        expect(() => {
          const modal = new QuestDetailModal(mockScene, config);
          modal.create();
        }).not.toThrow();
      });
    });
  });

  // =============================================================================
  // 1.7 SlidePanel 合成テストケース（Issue #470）
  // =============================================================================

  describe('1.7 SlidePanel 合成テストケース（Issue #470）', () => {
    describe('TC-701: destroy() で二重破棄が発生しない', () => {
      // 【テスト目的】: SlidePanel.destroy(false) 呼び出し後に container.destroy() が走っても
      //   rectangle の destroy が 2 回以上呼ばれて以前の参照にアクセスしないことを確認
      // 【対応要件】: Issue #470 Critical-2
      test('destroy() を呼んでも例外が発生しない', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();

        expect(() => modal.destroy()).not.toThrow();
      });

      test('destroy() 後に再度 destroy() を呼んでも例外が発生しない', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();
        modal.destroy();

        // 二重破棄の防御動作確認
        expect(() => modal.destroy()).not.toThrow();
      });
    });

    describe('TC-702: close() でオーバーレイと SlidePanel が同期フェードアウト', () => {
      // 【テスト目的】: close() 呼び出し時に overlay の tween と SlidePanel の tween が
      //   両方発行されることを確認
      // 【対応要件】: Issue #470 Critical-1
      test('close() でオーバーレイ tween と SlidePanel tween が両方発行される', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();

        // create 時点で tweens.add が何度か呼ばれている（open アニメーション分）
        const callsBeforeClose = (mockScene.tweens.add as ReturnType<typeof vi.fn>).mock.calls
          .length;

        modal.close();

        // close 後は overlay の tween と SlidePanel の tween が追加で発行されるため
        // tweens.add の呼び出し回数が 2 以上増えている
        const callsAfterClose = (mockScene.tweens.add as ReturnType<typeof vi.fn>).mock.calls
          .length;
        expect(callsAfterClose - callsBeforeClose).toBeGreaterThanOrEqual(2);
      });
    });

    describe('TC-703: close() で open tween と競合しない', () => {
      // 【テスト目的】: open tween 進行中に close() を呼んでも overlay の tween が
      //   killTweensOf で中断されてから close tween が発行されることを確認
      // 【対応要件】: Issue #470 Warning-3
      test('close() 呼び出し時に overlay の既存 tween がキャンセルされる', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();

        // close を呼ぶと killTweensOf(overlay) が呼ばれる
        modal.close();

        expect(mockScene.tweens.killTweensOf).toHaveBeenCalled();
      });

      test('open 直後でも handleAccept は動作する（open 中の操作は許可）', () => {
        const config: QuestDetailModalConfig = {
          quest: mockQuest,
          onAccept: mockOnAccept,
          onClose: mockOnClose,
        };

        const modal = new QuestDetailModal(mockScene, config);
        modal.create();

        // open アニメーション中でも handleAccept は通る
        modal.handleAccept();

        expect(mockOnAccept).toHaveBeenCalledTimes(1);
        expect(mockOnAccept).toHaveBeenCalledWith(mockQuest);
      });
    });
  });
});
