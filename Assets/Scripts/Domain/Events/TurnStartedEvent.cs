namespace Atelier.Domain.Events
{
    /// <summary>
    /// ターンが開始された時に発行されるイベント。
    /// UI更新やターン開始処理のトリガーとして使用される。
    /// </summary>
    public class TurnStartedEvent : IEvent
    {
        /// <summary>
        /// 開始するターン番号
        /// </summary>
        public int TurnNumber { get; set; }

        /// <summary>
        /// 現在のエネルギー
        /// </summary>
        public int CurrentEnergy { get; set; }

        /// <summary>
        /// 最大エネルギー
        /// </summary>
        public int MaxEnergy { get; set; }
    }
}
