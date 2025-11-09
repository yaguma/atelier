namespace Atelier.Domain
{
    /// <summary>
    /// 依頼データクラス
    /// </summary>
    [System.Serializable]
    public class Quest
    {
        public string Id { get; set; }
        public string CustomerName { get; set; }
        public CustomerType CustomerType { get; set; }
        public int Difficulty { get; set; }
        public QuestRequirements Requirements { get; set; }
        public QuestRewards Rewards { get; set; }
        public string Description { get; set; }
        public string Sprite { get; set; }

        public Quest()
        {
            Requirements = new QuestRequirements();
            Rewards = new QuestRewards();
        }
    }

    /// <summary>
    /// 顧客タイプ
    /// </summary>
    public enum CustomerType
    {
        Villager,
        Noble,
        Merchant,
        Scholar,
        Adventurer
    }

    /// <summary>
    /// 依頼要件
    /// </summary>
    [System.Serializable]
    public class QuestRequirements
    {
        public CardAttributes RequiredAttributes { get; set; }
        public int MinQuality { get; set; }
        public int MinStability { get; set; }

        public QuestRequirements()
        {
            RequiredAttributes = new CardAttributes();
        }
    }

    /// <summary>
    /// 依頼報酬
    /// </summary>
    [System.Serializable]
    public class QuestRewards
    {
        public int Gold { get; set; }
        public int Fame { get; set; }
        public string[] CardChoices { get; set; }

        public QuestRewards()
        {
            CardChoices = new string[0];
        }
    }
}
