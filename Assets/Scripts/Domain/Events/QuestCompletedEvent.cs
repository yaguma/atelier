namespace Atelier.Domain.Events
{
    /// <summary>
    /// 依頼が達成された時に発行されるイベント。
    /// 報酬付与やUI更新のトリガーとして使用される。
    /// </summary>
    public class QuestCompletedEvent : IEvent
    {
        /// <summary>
        /// 達成された依頼のID
        /// </summary>
        public string QuestId { get; set; }

        /// <summary>
        /// 達成された依頼の名前
        /// </summary>
        public string QuestName { get; set; }

        /// <summary>
        /// ゴールド報酬
        /// </summary>
        public int GoldReward { get; set; }

        /// <summary>
        /// 名声報酬
        /// </summary>
        public int FameReward { get; set; }
    }
}
