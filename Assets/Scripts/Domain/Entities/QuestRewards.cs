namespace Atelier.Domain.Entities
{
    /// <summary>
    /// 依頼達成時の報酬を表す構造体。
    /// </summary>
    public readonly struct QuestRewards
    {
        /// <summary>獲得ゴールド</summary>
        public int Gold { get; }

        /// <summary>獲得名声</summary>
        public int Fame { get; }

        /// <summary>
        /// 報酬を初期化するコンストラクタ。
        /// </summary>
        /// <param name="gold">獲得ゴールド</param>
        /// <param name="fame">獲得名声</param>
        public QuestRewards(int gold, int fame)
        {
            Gold = gold;
            Fame = fame;
        }

        public override string ToString()
        {
            return $"Gold:{Gold} Fame:{Fame}";
        }
    }
}
