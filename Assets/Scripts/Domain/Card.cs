using System.Collections.Generic;

namespace Atelier.Domain
{
    /// <summary>
    /// カードデータクラス
    /// </summary>
    [System.Serializable]
    public class Card
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public CardType Type { get; set; }
        public int Cost { get; set; }
        public CardAttributes Attributes { get; set; }
        public int Stability { get; set; }
        public string Description { get; set; }
        public int Level { get; set; }
        public List<CardEffect> Effects { get; set; }
        public Rarity Rarity { get; set; }
        public string Sprite { get; set; }

        public Card()
        {
            Attributes = new CardAttributes();
            Effects = new List<CardEffect>();
        }
    }

    /// <summary>
    /// カード属性
    /// </summary>
    [System.Serializable]
    public class CardAttributes
    {
        public int Fire { get; set; }
        public int Water { get; set; }
        public int Earth { get; set; }
        public int Wind { get; set; }
        public int Poison { get; set; }
        public int Quality { get; set; }
    }

    /// <summary>
    /// カードタイプ
    /// </summary>
    public enum CardType
    {
        Material,   // 素材
        Catalyst,   // 触媒
        Operation   // 操作
    }

    /// <summary>
    /// レアリティ
    /// </summary>
    public enum Rarity
    {
        Common,
        Uncommon,
        Rare,
        Epic,
        Legendary
    }

    /// <summary>
    /// カードエフェクト基底クラス
    /// </summary>
    [System.Serializable]
    public class CardEffect
    {
        public string Type { get; set; }
        public string Target { get; set; }
        public float Multiplier { get; set; }
    }
}
