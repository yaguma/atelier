namespace Atelier.Domain.Entities
{
    /// <summary>
    /// カードのレアリティを表す列挙型。
    /// </summary>
    public enum CardRarity
    {
        /// <summary>コモン</summary>
        Common = 0,

        /// <summary>アンコモン</summary>
        Uncommon = 1,

        /// <summary>レア</summary>
        Rare = 2,

        /// <summary>エピック</summary>
        Epic = 3,

        /// <summary>レジェンダリー</summary>
        Legendary = 4
    }
}
