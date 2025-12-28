namespace Atelier.Domain.Entities
{
    /// <summary>
    /// 依頼の達成要件を表す構造体。
    /// 各属性の最低必要値を定義する。
    /// </summary>
    public readonly struct QuestRequirements
    {
        /// <summary>必要火属性値</summary>
        public int Fire { get; }

        /// <summary>必要水属性値</summary>
        public int Water { get; }

        /// <summary>必要土属性値</summary>
        public int Earth { get; }

        /// <summary>必要風属性値</summary>
        public int Wind { get; }

        /// <summary>必要品質値</summary>
        public int Quality { get; }

        /// <summary>
        /// 依頼要件を初期化するコンストラクタ。
        /// </summary>
        /// <param name="fire">必要火属性値</param>
        /// <param name="water">必要水属性値</param>
        /// <param name="earth">必要土属性値</param>
        /// <param name="wind">必要風属性値</param>
        /// <param name="quality">必要品質値</param>
        public QuestRequirements(int fire, int water, int earth, int wind, int quality)
        {
            Fire = fire;
            Water = water;
            Earth = earth;
            Wind = wind;
            Quality = quality;
        }

        /// <summary>
        /// 指定した属性値が要件を満たしているかを確認する。
        /// </summary>
        /// <param name="attributes">確認する属性値</param>
        /// <returns>すべての要件を満たしていればtrue</returns>
        public bool IsSatisfiedBy(CardAttributes attributes)
        {
            return attributes.Fire >= Fire &&
                   attributes.Water >= Water &&
                   attributes.Earth >= Earth &&
                   attributes.Wind >= Wind &&
                   attributes.Quality >= Quality;
        }

        public override string ToString()
        {
            return $"Fire>={Fire} Water>={Water} Earth>={Earth} Wind>={Wind} Quality>={Quality}";
        }
    }
}
