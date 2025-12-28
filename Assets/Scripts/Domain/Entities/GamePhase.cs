namespace Atelier.Domain.Entities
{
    /// <summary>
    /// ゲームのフェーズを表す列挙型。
    /// 各フェーズはゲームの進行状態を表す。
    /// </summary>
    public enum GamePhase
    {
        /// <summary>
        /// タイトル画面
        /// </summary>
        Title,

        /// <summary>
        /// スタイル選択画面
        /// </summary>
        StyleSelect,

        /// <summary>
        /// マップ画面
        /// </summary>
        Map,

        /// <summary>
        /// 依頼（調合）画面
        /// </summary>
        Quest,

        /// <summary>
        /// 商人画面
        /// </summary>
        Merchant,

        /// <summary>
        /// リザルト画面
        /// </summary>
        Result
    }
}
