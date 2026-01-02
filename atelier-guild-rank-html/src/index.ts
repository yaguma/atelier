/**
 * アトリエギルドランク - エントリーポイント
 *
 * @description ギルドランク制のデッキ構築型錬金術RPGのメインエントリーポイント
 */

console.log('アトリエギルドランク 起動中...');

/**
 * アプリケーション初期化
 * ゲーム起動時の初期化処理を行う
 */
async function initializeApp(): Promise<void> {
  const appElement = document.getElementById('app');
  if (!appElement) {
    throw new Error('アプリケーションコンテナが見つかりません');
  }

  appElement.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
      <h1>アトリエギルドランク</h1>
      <p>デッキ構築型錬金術RPG</p>
      <p style="color: #888;">開発中...</p>
    </div>
  `;
}

// DOMContentLoaded後にアプリケーションを初期化
document.addEventListener('DOMContentLoaded', () => {
  initializeApp().catch((error) => {
    console.error('アプリケーション初期化エラー:', error);
  });
});
