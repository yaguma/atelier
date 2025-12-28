namespace Atelier.Domain.Events
{
    /// <summary>
    /// 暴発が発生した時に発行されるイベント。
    /// 依頼失敗処理やUI更新、サウンド再生のトリガーとして使用される。
    /// </summary>
    public class ExplosionEvent : IEvent
    {
        /// <summary>
        /// 暴発が発生した依頼のID
        /// </summary>
        public string QuestId { get; set; }

        /// <summary>
        /// 暴発前の安定値
        /// </summary>
        public int StabilityBefore { get; set; }

        /// <summary>
        /// 暴発後の安定値
        /// </summary>
        public int StabilityAfter { get; set; }

        /// <summary>
        /// 暴発を引き起こしたカードのID
        /// </summary>
        public string TriggerCardId { get; set; }
    }
}
