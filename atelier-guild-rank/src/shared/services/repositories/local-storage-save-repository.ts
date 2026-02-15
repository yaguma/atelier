/**
 * local-storage-save-repository.ts - LocalStorageセーブデータリポジトリ実装
 *
 * TASK-0007: セーブデータリポジトリ実装
 * LocalStorageを使用したセーブデータの永続化機能
 */

import type { ISaveDataRepository } from '@domain/interfaces';
import type { ISaveData } from '@shared/types';
import { ApplicationError, ErrorCodes } from '@shared/types';

/**
 * 【機能概要】: LocalStorageを使用したセーブデータリポジトリ実装
 * 【実装方針】: Clean Architecture - Infrastructure層のRepository Pattern実装
 * 【セキュリティ】: QuotaExceededError対応、破損データの安全なハンドリング
 * 【パフォーマンス】: O(1)アクセス、非同期API（将来のIndexedDB対応）
 * 【テスト対応】: T-0007-01〜T-0007-12のテストケースを通すための実装
 * 🔵 信頼性レベル: タスク定義書とnote.mdに基づく実装
 *
 * @example
 * ```typescript
 * const repository = new LocalStorageSaveRepository();
 * await repository.save(saveData);
 * const loaded = await repository.load();
 * ```
 */
export class LocalStorageSaveRepository implements ISaveDataRepository {
  /** 【ストレージキー】: localStorageに保存する際のキー名 */
  private readonly STORAGE_KEY = 'atelier-guild-rank-save';

  /**
   * 【現在のバージョン】: セーブデータのバージョン番号
   * 【将来対応】: Phase 2以降でセマンティックバージョニング比較機能を実装予定
   * 🔵 信頼性レベル: 要件定義書に明記されたバージョン管理
   */
  private readonly CURRENT_VERSION = '1.0.0';

  /**
   * 【機能概要】: コンストラクタ - localStorage対応チェック
   * 【実装方針】: localStorageが存在しない場合はエラーを投げる
   * 【セキュリティ】: 非対応環境での早期エラー検出（フェイルファスト原則）
   * 【ユースケース】: Safari プライベートモード、古いブラウザでの起動時チェック
   * 【テスト対応】: T-0007-09（localStorage非対応ブラウザ）に対応
   * 🟡 信頼性レベル: エラーコードSTORAGE_NOT_SUPPORTEDは未定義のため、SAVE_FAILEDで代用
   */
  constructor() {
    // 【入力値検証】: localStorageの存在確認
    // 【セキュリティ】: 非対応環境でアプリケーション起動を防止
    // 【エラー処理】: 非対応ブラウザでは起動時にエラー
    // 【ユーザビリティ】: 「対応ブラウザを使用してください」と明示
    if (typeof localStorage === 'undefined') {
      throw new ApplicationError(
        ErrorCodes.SAVE_FAILED,
        'お使いのブラウザはセーブ機能に対応していません',
      );
    }
  }

  /**
   * 【機能概要】: セーブデータを保存する
   * 【実装方針】: JSON.stringify()でシリアライズし、localStorage.setItem()で保存
   * 【セキュリティ】: QuotaExceededErrorを捕捉し、ユーザーフレンドリーなエラーメッセージに変換
   * 【パフォーマンス】: 同期APIだが、将来のIndexedDB対応のため非同期Promise返却
   * 【エラーハンドリング】: 容量超過時はApplicationErrorをthrow、その他のエラーは再throw
   * 【テスト対応】: T-0007-01（セーブ→ロード）、T-0007-08（容量超過）に対応
   * 🔵 信頼性レベル: 要件定義書に基づく実装
   *
   * @param data 保存するセーブデータ
   * @throws {ApplicationError} 保存失敗時（ErrorCodes.SAVE_FAILED）
   */
  async save(data: ISaveData): Promise<void> {
    try {
      // 【データ処理開始】: セーブデータをJSON文字列に変換
      // 【処理方針】: JSON.stringify()でシリアライズ
      // 【パフォーマンス】: O(n) ※nはデータサイズ、localStorageの性質上避けられない
      const json = JSON.stringify(data);

      // 【実処理実行】: localStorageに保存
      // 【処理内容】: localStorage.setItem()で永続化
      // 【容量制限】: ブラウザごとに5-10MBの制限あり（要件: 1MB以内）
      localStorage.setItem(this.STORAGE_KEY, json);
    } catch (error) {
      // 【エラー捕捉】: localStorage書き込みエラーをハンドリング
      // 【セキュリティ】: ユーザーに適切なエラーメッセージを提供
      // 【テスト要件対応】: QuotaExceededErrorを適切にハンドリング
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        // 【ユーザビリティ】: 容量不足を明示し、対処方法を示唆
        throw new ApplicationError(ErrorCodes.SAVE_FAILED, 'ストレージ容量が不足しています');
      }
      // 【予期しないエラー】: そのまま再throw（開発者向けのデバッグ情報保持）
      throw error;
    }
  }

  /**
   * 【機能概要】: セーブデータを読み込む
   * 【実装方針】: localStorage.getItem()で取得し、JSON.parse()でデシリアライズ
   * 【セキュリティ】: バージョンチェックによるデータ破損防止、JSON.parseエラーの安全な処理
   * 【パフォーマンス】: O(n) ※nはデータサイズ、キャッシングなし（毎回パース）
   * 【エラーハンドリング】: 破損データ・バージョン不一致時はnullを返却（ゲーム起動は継続可能）
   * 【テスト対応】: T-0007-01（セーブ→ロード）、T-0007-05（破損データ）、T-0007-10（バージョン不一致）に対応
   * 🔵 信頼性レベル: 要件定義書に基づく実装
   *
   * @returns セーブデータ（存在しない場合null）
   */
  async load(): Promise<ISaveData | null> {
    // 【実処理実行】: localStorageからデータを取得
    // 【処理内容】: localStorage.getItem()で文字列を取得
    // 【パフォーマンス】: O(1)アクセス
    const json = localStorage.getItem(this.STORAGE_KEY);

    // 【入力値検証】: データが存在しない場合はnullを返す
    // 【ユースケース】: 初回起動時、セーブデータ削除後
    if (!json) {
      return null;
    }

    try {
      // 【データ処理開始】: JSON文字列をパース
      // 【処理方針】: JSON.parse()でデシリアライズ
      // 【パフォーマンス】: O(n) ※nはデータサイズ
      const data = JSON.parse(json) as ISaveData;

      // 【バージョンチェック】: セーブデータのバージョンを検証
      // 【セキュリティ】: 古いバージョンのデータ読み込みを防止
      // 【処理方針】: Phase 1ではCURRENT_VERSIONとの完全一致チェック
      // 【テスト要件対応】: T-0007-10（バージョン不一致）に対応
      if (!this.isValidVersion(data.version)) {
        // 【エラー処理】: バージョン不一致の場合はnullを返す（互換性なし）
        // 【ユーザビリティ】: 新規ゲーム扱いとし、ゲーム起動を妨げない
        console.warn('Invalid save version:', data.version);
        return null;
      }

      // 【結果返却】: 正常なセーブデータを返す
      return data;
    } catch (error) {
      // 【エラー捕捉】: JSON.parseエラーをハンドリング
      // 【セキュリティ】: 破損データでもゲーム起動は可能にする（堅牢性）
      // 【テスト要件対応】: 破損データの場合はnullを返す（例外を飲み込む）
      // 【デバッグ支援】: コンソールにエラー詳細を出力
      console.error('Failed to parse save data', error);
      return null;
    }
  }

  /**
   * 【機能概要】: セーブデータの存在をチェックする
   * 【実装方針】: localStorage.getItem()の結果がnullでないかを判定
   * 【パフォーマンス】: O(1)アクセス、軽量な存在チェック
   * 【ユースケース】: UI側で「続きから開始」ボタンの表示判定に使用
   * 【テスト対応】: T-0007-02（存在時）、T-0007-03（未存在時）に対応
   * 🔵 信頼性レベル: 要件定義書に基づく実装
   *
   * @returns 存在する場合true
   */
  exists(): boolean {
    // 【実処理実行】: localStorageのデータ存在チェック
    // 【処理内容】: localStorage.getItem() !== null で判定
    // 【パフォーマンス】: JSON.parseを実行せず、存在のみを高速確認
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }

  /**
   * 【機能概要】: セーブデータを削除する
   * 【実装方針】: localStorage.removeItem()でデータを削除
   * 【セキュリティ】: 物理削除により、データが完全に消去される
   * 【ユースケース】: 「最初からやり直す」機能、デバッグ時のデータクリア
   * 【テスト対応】: T-0007-04（削除）に対応
   * 🔵 信頼性レベル: 要件定義書に基づく実装
   *
   * @throws {ApplicationError} 削除失敗時
   */
  async delete(): Promise<void> {
    // 【実処理実行】: localStorageからデータを削除
    // 【処理内容】: localStorage.removeItem()で物理削除
    // 【パフォーマンス】: O(1)削除、同期実行
    // 【エラー処理】: removeItem()は例外を投げないため、エラーハンドリング不要
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * 【機能概要】: 最終保存日時を取得する
   * 【実装方針】: セーブデータのlastSavedフィールドをDate型に変換
   * 【パフォーマンス】: 毎回JSON.parseを実行（キャッシングなし）
   * 【最適化余地】: 頻繁に呼び出す場合、lastSavedTimeのキャッシングを検討
   * 【ユースケース】: UI側で「最終セーブ: 2026/01/16 12:00」のような表示に使用
   * 【テスト対応】: T-0007-06（最終保存日時）、T-0007-07（未存在時）に対応
   * 🔵 信頼性レベル: 要件定義書に基づく実装
   *
   * @returns 最終保存日時（存在しない場合null）
   */
  getLastSavedTime(): Date | null {
    // 【実処理実行】: localStorageからデータを取得
    // 【パフォーマンス】: O(1)アクセス
    const json = localStorage.getItem(this.STORAGE_KEY);

    // 【入力値検証】: データが存在しない場合はnullを返す
    // 【ユースケース】: 初回起動時、セーブデータ削除後
    if (!json) {
      return null;
    }

    try {
      // 【データ処理開始】: JSON文字列をパース
      // 【パフォーマンス】: O(n) ※nはデータサイズ、最適化余地あり
      const data = JSON.parse(json) as ISaveData;

      // 【結果返却】: lastSavedフィールドをDate型に変換
      // 【処理内容】: ISO8601文字列をnew Date()で変換
      // 【データ形式】: '2026-01-16T12:00:00.000Z' → Date型
      return new Date(data.lastSaved);
    } catch (_error) {
      // 【エラー捕捉】: パースエラーの場合はnullを返す
      // 【セキュリティ】: 破損データでもアプリケーションは継続可能
      return null;
    }
  }

  /**
   * 【機能概要】: セーブデータのバージョンを検証する
   * 【実装方針】: Phase 1では現在バージョンとの完全一致チェック
   * 【将来拡張】: Phase 2以降でセマンティックバージョニング比較（メジャー・マイナー・パッチ）を実装予定
   * 【セキュリティ】: バージョン不一致データの読み込みを防止し、データ破損リスクを低減
   * 【テスト対応】: T-0007-10（バージョン不一致）に対応
   * 🟡 信頼性レベル: Phase 1では簡易実装、Phase 2以降でマイグレーション機能実装予定
   *
   * @param version バージョン文字列
   * @returns 有効な場合true
   */
  private isValidVersion(version: string): boolean {
    // 【実装詳細】: CURRENT_VERSION定数との完全一致チェック
    // 【Phase 1仕様】: '1.0.0' のみを有効とする
    // 【Phase 2拡張予定】: セマンティックバージョニング比較関数を実装
    //   - メジャーバージョン変更時: マイグレーション実行
    //   - マイナーバージョン変更時: 後方互換性を保証
    //   - パッチバージョン変更時: そのまま読み込み可能
    return version === this.CURRENT_VERSION;
  }
}
