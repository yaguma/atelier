namespace Atelier.Domain.Events
{
    /// <summary>
    /// カードがプレイされた時に発行されるイベント。
    /// UI更新やサウンド再生のトリガーとして使用される。
    /// </summary>
    public class CardPlayedEvent : IEvent
    {
        /// <summary>
        /// プレイされたカードのID
        /// </summary>
        public string CardId { get; set; }

        /// <summary>
        /// プレイされたカードの名前
        /// </summary>
        public string CardName { get; set; }

        /// <summary>
        /// カードをプレイしたプレイヤーのID
        /// </summary>
        public string PlayerId { get; set; }

        /// <summary>
        /// カードがプレイされた依頼のID
        /// </summary>
        public string QuestId { get; set; }
    }
}
