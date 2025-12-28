namespace Atelier.Domain.Entities
{
    /// <summary>
    /// スタイルのパッシブボーナスを表す構造体。
    /// 各属性への倍率を定義する。
    /// </summary>
    public readonly struct StylePassiveBonus
    {
        /// <summary>火属性倍率</summary>
        public float FireMultiplier { get; }

        /// <summary>水属性倍率</summary>
        public float WaterMultiplier { get; }

        /// <summary>土属性倍率</summary>
        public float EarthMultiplier { get; }

        /// <summary>風属性倍率</summary>
        public float WindMultiplier { get; }

        /// <summary>毒属性倍率</summary>
        public float PoisonMultiplier { get; }

        /// <summary>デフォルトボーナス（全て1倍）</summary>
        public static StylePassiveBonus Default => new StylePassiveBonus(1.0f, 1.0f, 1.0f, 1.0f, 1.0f);

        /// <summary>
        /// パッシブボーナスを初期化するコンストラクタ。
        /// </summary>
        /// <param name="fire">火属性倍率</param>
        /// <param name="water">水属性倍率</param>
        /// <param name="earth">土属性倍率</param>
        /// <param name="wind">風属性倍率</param>
        /// <param name="poison">毒属性倍率</param>
        public StylePassiveBonus(float fire, float water, float earth, float wind, float poison)
        {
            FireMultiplier = fire;
            WaterMultiplier = water;
            EarthMultiplier = earth;
            WindMultiplier = wind;
            PoisonMultiplier = poison;
        }

        /// <summary>
        /// 属性値にボーナスを適用する。
        /// </summary>
        /// <param name="attributes">元の属性値</param>
        /// <returns>ボーナス適用後の属性値</returns>
        public CardAttributes Apply(CardAttributes attributes)
        {
            return new CardAttributes(
                (int)(attributes.Fire * FireMultiplier),
                (int)(attributes.Water * WaterMultiplier),
                (int)(attributes.Earth * EarthMultiplier),
                (int)(attributes.Wind * WindMultiplier),
                (int)(attributes.Poison * PoisonMultiplier),
                attributes.Quality // 品質はボーナス対象外
            );
        }

        public override string ToString()
        {
            return $"Fire:{FireMultiplier:F1}x Water:{WaterMultiplier:F1}x Earth:{EarthMultiplier:F1}x Wind:{WindMultiplier:F1}x Poison:{PoisonMultiplier:F1}x";
        }
    }
}
