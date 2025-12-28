namespace Atelier.Domain.Entities
{
    /// <summary>
    /// カードの属性値を表す構造体。
    /// 錬金術の各属性（火、水、土、風、毒）と品質値を保持する。
    /// </summary>
    public readonly struct CardAttributes
    {
        /// <summary>火属性値</summary>
        public int Fire { get; }

        /// <summary>水属性値</summary>
        public int Water { get; }

        /// <summary>土属性値</summary>
        public int Earth { get; }

        /// <summary>風属性値</summary>
        public int Wind { get; }

        /// <summary>毒属性値</summary>
        public int Poison { get; }

        /// <summary>品質値</summary>
        public int Quality { get; }

        /// <summary>
        /// 全属性の合計値（品質を除く）
        /// </summary>
        public int TotalElemental => Fire + Water + Earth + Wind + Poison;

        /// <summary>
        /// 属性値を初期化するコンストラクタ。
        /// </summary>
        /// <param name="fire">火属性値</param>
        /// <param name="water">水属性値</param>
        /// <param name="earth">土属性値</param>
        /// <param name="wind">風属性値</param>
        /// <param name="poison">毒属性値</param>
        /// <param name="quality">品質値</param>
        public CardAttributes(int fire, int water, int earth, int wind, int poison, int quality)
        {
            Fire = fire;
            Water = water;
            Earth = earth;
            Wind = wind;
            Poison = poison;
            Quality = quality;
        }

        /// <summary>
        /// 2つの属性値を加算する。
        /// </summary>
        public static CardAttributes operator +(CardAttributes a, CardAttributes b)
        {
            return new CardAttributes(
                a.Fire + b.Fire,
                a.Water + b.Water,
                a.Earth + b.Earth,
                a.Wind + b.Wind,
                a.Poison + b.Poison,
                a.Quality + b.Quality
            );
        }

        /// <summary>
        /// 属性値を指定の倍率で乗算する。
        /// </summary>
        public CardAttributes Multiply(float multiplier)
        {
            return new CardAttributes(
                (int)(Fire * multiplier),
                (int)(Water * multiplier),
                (int)(Earth * multiplier),
                (int)(Wind * multiplier),
                (int)(Poison * multiplier),
                (int)(Quality * multiplier)
            );
        }

        public override string ToString()
        {
            return $"Fire:{Fire} Water:{Water} Earth:{Earth} Wind:{Wind} Poison:{Poison} Quality:{Quality}";
        }
    }
}
