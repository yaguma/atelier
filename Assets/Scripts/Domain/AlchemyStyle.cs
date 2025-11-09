namespace Atelier.Domain
{
    /// <summary>
    /// 錬金スタイルデータクラス
    /// </summary>
    [System.Serializable]
    public class AlchemyStyle
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string[] InitialCards { get; set; }
        public int StartingGold { get; set; }
        public SpecialAbility SpecialAbility { get; set; }
        public string Sprite { get; set; }

        public AlchemyStyle()
        {
            InitialCards = new string[0];
            SpecialAbility = new SpecialAbility();
        }
    }

    /// <summary>
    /// 特殊能力
    /// </summary>
    [System.Serializable]
    public class SpecialAbility
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Effect { get; set; }
    }
}
