namespace Atelier.Domain.Entities
{
    /// <summary>
    /// 依頼（クエスト）を表すエンティティクラス。
    /// プレイヤーが達成すべき目標と報酬を定義する。
    /// </summary>
    public sealed class Quest
    {
        /// <summary>依頼ID</summary>
        public string QuestId { get; }

        /// <summary>依頼名（作成する薬品名など）</summary>
        public string Name { get; }

        /// <summary>依頼人の名前</summary>
        public string Customer { get; }

        /// <summary>難易度（1-5）</summary>
        public int Difficulty { get; }

        /// <summary>達成要件</summary>
        public QuestRequirements Requirements { get; }

        /// <summary>達成報酬</summary>
        public QuestRewards Rewards { get; }

        /// <summary>
        /// 依頼を生成する。
        /// </summary>
        /// <param name="questId">依頼ID</param>
        /// <param name="name">依頼名</param>
        /// <param name="customer">依頼人</param>
        /// <param name="difficulty">難易度</param>
        /// <param name="requirements">達成要件</param>
        /// <param name="rewards">達成報酬</param>
        public Quest(
            string questId,
            string name,
            string customer,
            int difficulty,
            QuestRequirements requirements,
            QuestRewards rewards)
        {
            QuestId = questId ?? string.Empty;
            Name = name ?? string.Empty;
            Customer = customer ?? string.Empty;
            Difficulty = difficulty;
            Requirements = requirements;
            Rewards = rewards;
        }

        public override string ToString()
        {
            return $"[{QuestId}] {Name} (難易度:{Difficulty}) from {Customer}";
        }
    }
}
