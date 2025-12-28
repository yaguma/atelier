namespace Atelier.Presentation.Scenes
{
    /// <summary>
    /// ゲームのシーンを表す列挙型。
    /// UI設計書に記載された全画面に対応する。
    /// </summary>
    public enum GameScene
    {
        /// <summary>
        /// ブートストラップシーン（初期化用）
        /// </summary>
        Boot,

        /// <summary>
        /// タイトル画面 (SCR-001)
        /// ゲーム起動時の初期画面
        /// </summary>
        Title,

        /// <summary>
        /// スタイル選択画面 (SCR-002)
        /// 錬金スタイルを選択する画面
        /// </summary>
        StyleSelect,

        /// <summary>
        /// マップ画面 (SCR-003)
        /// ノード進行型マップを表示する画面
        /// </summary>
        Map,

        /// <summary>
        /// 依頼画面 (SCR-004)
        /// 依頼達成（調合）を行う画面
        /// </summary>
        Quest,

        /// <summary>
        /// 商人画面 (SCR-005)
        /// カード購入・強化・削除を行う画面
        /// </summary>
        Merchant,

        /// <summary>
        /// リザルト画面 (SCR-006)
        /// ゲーム終了時の結果表示画面
        /// </summary>
        Result
    }
}
