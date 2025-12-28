namespace Atelier.Domain.Events
{
    /// <summary>
    /// ゲームが終了した時に発行されるイベント。
    /// リザルト画面表示やステータス保存のトリガーとして使用される。
    /// </summary>
    public class GameOverEvent : IEvent
    {
        /// <summary>
        /// 勝利したかどうか
        /// </summary>
        public bool IsVictory { get; set; }

        /// <summary>
        /// 獲得した合計ゴールド
        /// </summary>
        public int TotalGold { get; set; }

        /// <summary>
        /// 獲得した合計名声
        /// </summary>
        public int TotalFame { get; set; }

        /// <summary>
        /// 達成した依頼の数
        /// </summary>
        public int QuestsCompleted { get; set; }
    }
}
