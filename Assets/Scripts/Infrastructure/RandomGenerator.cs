using System;

namespace Atelier.Infrastructure
{
    /// <summary>
    /// シード値管理とランダム生成
    /// シード値を指定することで再現可能な乱数列を生成できる
    /// </summary>
    public class RandomGenerator
    {
        private Random rng;
        private int? currentSeed;

        /// <summary>
        /// コンストラクタ
        /// </summary>
        /// <param name="seed">シード値（nullの場合はランダムシード）</param>
        public RandomGenerator(int? seed = null)
        {
            currentSeed = seed;
            rng = seed.HasValue ? new Random(seed.Value) : new Random();
        }

        /// <summary>
        /// 0以上int.MaxValue未満のランダムな整数を返す
        /// </summary>
        /// <returns>ランダムな整数</returns>
        public int Next() => rng.Next();

        /// <summary>
        /// 0以上maxValue未満のランダムな整数を返す
        /// </summary>
        /// <param name="maxValue">最大値（含まない）</param>
        /// <returns>ランダムな整数</returns>
        public int Next(int maxValue) => rng.Next(maxValue);

        /// <summary>
        /// minValue以上maxValue未満のランダムな整数を返す
        /// </summary>
        /// <param name="minValue">最小値（含む）</param>
        /// <param name="maxValue">最大値（含まない）</param>
        /// <returns>ランダムな整数</returns>
        public int Next(int minValue, int maxValue) => rng.Next(minValue, maxValue);

        /// <summary>
        /// 0.0以上1.0未満のランダムな浮動小数点数を返す
        /// </summary>
        /// <returns>ランダムな浮動小数点数</returns>
        public double NextDouble() => rng.NextDouble();

        /// <summary>
        /// 現在のシード値を取得する
        /// </summary>
        /// <returns>シード値（nullの場合はランダムシード）</returns>
        public int? GetCurrentSeed() => currentSeed;

        /// <summary>
        /// 新しいシード値でリセットする
        /// </summary>
        /// <param name="seed">新しいシード値</param>
        public void ResetWithSeed(int seed)
        {
            currentSeed = seed;
            rng = new Random(seed);
        }
    }
}
