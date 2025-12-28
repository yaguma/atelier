namespace Atelier.Domain.Entities
{
    /// <summary>
    /// 錬金術カードを表すエンティティクラス。
    /// 不変オブジェクトとして設計されている。
    /// </summary>
    public sealed class Card
    {
        /// <summary>カードID</summary>
        public string CardId { get; }

        /// <summary>カード名</summary>
        public string Name { get; }

        /// <summary>カードタイプ</summary>
        public CardType Type { get; }

        /// <summary>レアリティ</summary>
        public CardRarity Rarity { get; }

        /// <summary>使用コスト（エネルギー）</summary>
        public int Cost { get; }

        /// <summary>属性値</summary>
        public CardAttributes Attributes { get; }

        /// <summary>安定度（負の値は不安定、暴発リスクに影響）</summary>
        public int Stability { get; }

        /// <summary>カードの説明文</summary>
        public string Description { get; }

        /// <summary>
        /// カードを生成する。
        /// </summary>
        /// <param name="cardId">カードID</param>
        /// <param name="name">カード名</param>
        /// <param name="type">カードタイプ</param>
        /// <param name="rarity">レアリティ</param>
        /// <param name="cost">使用コスト</param>
        /// <param name="attributes">属性値</param>
        /// <param name="stability">安定度</param>
        /// <param name="description">説明文</param>
        public Card(
            string cardId,
            string name,
            CardType type,
            CardRarity rarity,
            int cost,
            CardAttributes attributes,
            int stability,
            string description)
        {
            CardId = cardId ?? string.Empty;
            Name = name ?? string.Empty;
            Type = type;
            Rarity = rarity;
            Cost = cost;
            Attributes = attributes;
            Stability = stability;
            Description = description ?? string.Empty;
        }

        /// <summary>
        /// カードが素材かどうか
        /// </summary>
        public bool IsMaterial => Type == CardType.Material;

        /// <summary>
        /// カードが道具かどうか
        /// </summary>
        public bool IsTool => Type == CardType.Tool;

        /// <summary>
        /// カードが技術かどうか
        /// </summary>
        public bool IsTechnique => Type == CardType.Technique;

        /// <summary>
        /// カードが触媒かどうか
        /// </summary>
        public bool IsCatalyst => Type == CardType.Catalyst;

        public override string ToString()
        {
            return $"[{CardId}] {Name} ({Type}/{Rarity}) Cost:{Cost}";
        }
    }
}
