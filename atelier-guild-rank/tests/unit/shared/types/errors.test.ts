/**
 * errors.ts テストケース
 * エラー関連型の型安全性テスト
 *
 * @description
 * TC-ERR-001 〜 TC-ERR-025 を実装
 */

// 型インポート（TDD Red: これらの型はまだ存在しない）
import type { ErrorCode } from '@shared/types';
// クラス・定数インポート
import { ApplicationError, DomainError, ErrorCodes } from '@shared/types';
import { describe, expect, it } from 'vitest';

// =============================================================================
// 10.1 DomainErrorクラス
// =============================================================================

describe('errors.ts', () => {
  describe('DomainErrorクラス', () => {
    // TC-ERR-001
    it('DomainErrorクラスがインポート可能', () => {
      expect(DomainError).toBeDefined();
    });

    // TC-ERR-002
    it('DomainErrorがErrorを継承している', () => {
      const error = new DomainError('TEST_CODE', 'test message');
      expect(error instanceof Error).toBe(true);
    });

    // TC-ERR-003
    it('DomainError.codeプロパティがアクセス可能', () => {
      const error = new DomainError('TEST_CODE', 'test message');
      expect(error.code).toBe('TEST_CODE');
    });

    // TC-ERR-004
    it('DomainError.messageプロパティがアクセス可能', () => {
      const error = new DomainError('TEST_CODE', 'test message');
      expect(error.message).toBe('test message');
    });

    // TC-ERR-005
    it('DomainError.detailsプロパティがアクセス可能', () => {
      const error = new DomainError('TEST_CODE', 'test message', { key: 'value' });
      expect(error.details).toEqual({ key: 'value' });
    });

    // TC-ERR-006
    it("new DomainError('CODE', 'message')でインスタンス生成可能", () => {
      const error = new DomainError('CODE', 'message');
      expect(error).toBeInstanceOf(DomainError);
      expect(error.code).toBe('CODE');
      expect(error.message).toBe('message');
    });

    // TC-ERR-007
    it("new DomainError('CODE', 'message', {detail: 'value'})でdetails付きインスタンス生成可能", () => {
      const error = new DomainError('CODE', 'message', { detail: 'value' });
      expect(error.details).toEqual({ detail: 'value' });
    });
  });

  // =============================================================================
  // 10.2 ApplicationErrorクラス
  // =============================================================================

  describe('ApplicationErrorクラス', () => {
    // TC-ERR-008
    it('ApplicationErrorクラスがインポート可能', () => {
      expect(ApplicationError).toBeDefined();
    });

    // TC-ERR-009
    it('ApplicationErrorがErrorを継承している', () => {
      const error = new ApplicationError('TEST_CODE', 'user-facing message');
      expect(error instanceof Error).toBe(true);
    });

    // TC-ERR-010
    it('ApplicationError.userMessageプロパティがアクセス可能', () => {
      const error = new ApplicationError('TEST_CODE', 'user-facing message');
      expect(error.userMessage).toBe('user-facing message');
    });

    // TC-ERR-011
    it('ApplicationError.originalErrorプロパティがアクセス可能', () => {
      const originalError = new Error('original error');
      const error = new ApplicationError('TEST_CODE', 'user-facing message', originalError);
      expect(error.originalError).toBe(originalError);
    });

    // TC-ERR-012
    it("new ApplicationError('code', 'userMessage')でインスタンス生成可能", () => {
      const error = new ApplicationError('TEST_CODE', 'userMessage');
      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.code).toBe('TEST_CODE');
      expect(error.userMessage).toBe('userMessage');
    });

    // TC-ERR-013
    it("new ApplicationError('code', 'userMessage', originalError)でoriginalError付きインスタンス生成可能", () => {
      const originalError = new Error('original');
      const error = new ApplicationError('TEST_CODE', 'userMessage', originalError);
      expect(error.originalError).toBe(originalError);
    });
  });

  // =============================================================================
  // 10.3 ErrorCodes定数
  // =============================================================================

  describe('ErrorCodes定数', () => {
    // TC-ERR-014
    it('ErrorCodes定数がインポート可能', () => {
      expect(ErrorCodes).toBeDefined();
    });

    // TC-ERR-015
    it('ErrorCodes.DECK_EMPTYが存在する', () => {
      expect(ErrorCodes.DECK_EMPTY).toBeDefined();
      expect(typeof ErrorCodes.DECK_EMPTY).toBe('string');
    });

    // TC-ERR-016
    it('ErrorCodes.CARD_NOT_IN_HANDが存在する', () => {
      expect(ErrorCodes.CARD_NOT_IN_HAND).toBeDefined();
      expect(typeof ErrorCodes.CARD_NOT_IN_HAND).toBe('string');
    });

    // TC-ERR-017
    it('ErrorCodes.INSUFFICIENT_ACTION_POINTSが存在する', () => {
      expect(ErrorCodes.INSUFFICIENT_ACTION_POINTS).toBeDefined();
      expect(typeof ErrorCodes.INSUFFICIENT_ACTION_POINTS).toBe('string');
    });

    // TC-ERR-018
    it('ErrorCodes.INSUFFICIENT_MATERIALSが存在する', () => {
      expect(ErrorCodes.INSUFFICIENT_MATERIALS).toBeDefined();
      expect(typeof ErrorCodes.INSUFFICIENT_MATERIALS).toBe('string');
    });

    // TC-ERR-019
    it('ErrorCodes.QUEST_NOT_FOUNDが存在する', () => {
      expect(ErrorCodes.QUEST_NOT_FOUND).toBeDefined();
      expect(typeof ErrorCodes.QUEST_NOT_FOUND).toBe('string');
    });

    // TC-ERR-020
    it('ErrorCodes.INSUFFICIENT_GOLDが存在する', () => {
      expect(ErrorCodes.INSUFFICIENT_GOLD).toBeDefined();
      expect(typeof ErrorCodes.INSUFFICIENT_GOLD).toBe('string');
    });

    // TC-ERR-021
    it('ErrorCodes.SAVE_FAILEDが存在する', () => {
      expect(ErrorCodes.SAVE_FAILED).toBeDefined();
      expect(typeof ErrorCodes.SAVE_FAILED).toBe('string');
    });

    // TC-ERR-022
    it('ErrorCodes.INVALID_PHASE_TRANSITIONが存在する', () => {
      expect(ErrorCodes.INVALID_PHASE_TRANSITION).toBeDefined();
      expect(typeof ErrorCodes.INVALID_PHASE_TRANSITION).toBe('string');
    });
  });

  // =============================================================================
  // 10.4 ErrorCode型
  // =============================================================================

  describe('ErrorCode型', () => {
    // TC-ERR-023
    it('ErrorCode型がインポート可能', () => {
      const errorCode: ErrorCode = ErrorCodes.DECK_EMPTY;
      expect(errorCode).toBeDefined();
    });

    // TC-ERR-024
    it('ErrorCodesの値がErrorCode型に代入可能', () => {
      const code1: ErrorCode = ErrorCodes.DECK_EMPTY;
      const code2: ErrorCode = ErrorCodes.INSUFFICIENT_GOLD;
      const code3: ErrorCode = ErrorCodes.SAVE_FAILED;
      expect(code1).toBe(ErrorCodes.DECK_EMPTY);
      expect(code2).toBe(ErrorCodes.INSUFFICIENT_GOLD);
      expect(code3).toBe(ErrorCodes.SAVE_FAILED);
    });

    // TC-ERR-025
    it('任意の文字列がErrorCode型に代入できない', () => {
      // @ts-expect-error - 任意の文字列は代入不可
      const invalidCode: ErrorCode = 'RANDOM_STRING';
      expect(invalidCode).toBeDefined();
    });
  });
});
