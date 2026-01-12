/// <reference types="vite/client" />

/**
 * Vite環境変数の型定義
 */
interface ImportMetaEnv {
  /** 開発モードかどうか */
  readonly DEV: boolean;
  /** 本番モードかどうか */
  readonly PROD: boolean;
  /** ベースURL */
  readonly BASE_URL: string;
  /** モード（development, production, etc.） */
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
