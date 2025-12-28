namespace Atelier.Domain.Entities
{
    /// <summary>
    /// カードの種類を表す列挙型。
    /// </summary>
    public enum CardType
    {
        /// <summary>素材カード</summary>
        Material = 0,

        /// <summary>道具カード</summary>
        Tool = 1,

        /// <summary>技術カード</summary>
        Technique = 2,

        /// <summary>触媒カード</summary>
        Catalyst = 3
    }
}
