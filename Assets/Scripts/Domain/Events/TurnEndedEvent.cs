namespace Atelier.Domain.Events
{
    /// <summary>
    /// ターンが終了した時に発行されるイベント。
    /// ターン終了時の処理やUI更新のトリガーとして使用される。
    /// </summary>
    public class TurnEndedEvent : IEvent
    {
        /// <summary>
        /// 終了したターン番号
        /// </summary>
        public int TurnNumber { get; set; }

        /// <summary>
        /// このターン中にプレイされたカードの枚数
        /// </summary>
        public int CardsPlayed { get; set; }
    }
}
