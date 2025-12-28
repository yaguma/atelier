namespace Atelier.Domain.Entities
{
    /// <summary>
    /// 依頼の進捗状態を管理するクラス。
    /// 現在の調合状態（属性値、安定度、暴発状態）を追跡する。
    /// </summary>
    public class QuestProgress
    {
        /// <summary>現在の属性値</summary>
        public CardAttributes CurrentAttributes { get; set; }

        /// <summary>現在の安定度（負の値は暴発リスク増加）</summary>
        public int CurrentStability { get; set; }

        /// <summary>暴発が発生したかどうか</summary>
        public bool HasExploded { get; set; }

        /// <summary>
        /// 進捗を初期化するコンストラクタ。
        /// </summary>
        public QuestProgress()
        {
            CurrentAttributes = new CardAttributes();
            CurrentStability = 0;
            HasExploded = false;
        }

        /// <summary>
        /// 指定した要件を満たしているかを確認する。
        /// 暴発している場合は常にfalseを返す。
        /// </summary>
        /// <param name="requirements">確認する要件</param>
        /// <returns>要件を満たしていればtrue</returns>
        public bool IsCompleted(QuestRequirements requirements)
        {
            if (HasExploded)
            {
                return false;
            }

            return requirements.IsSatisfiedBy(CurrentAttributes);
        }

        /// <summary>
        /// 属性値を加算する。
        /// </summary>
        /// <param name="attributes">加算する属性値</param>
        public void AddAttributes(CardAttributes attributes)
        {
            CurrentAttributes = CurrentAttributes + attributes;
        }

        /// <summary>
        /// 安定度を加算する。
        /// </summary>
        /// <param name="stability">加算する安定度（負の値で不安定化）</param>
        public void AddStability(int stability)
        {
            CurrentStability += stability;
        }

        /// <summary>
        /// 進捗状態をリセットする。
        /// </summary>
        public void Reset()
        {
            CurrentAttributes = new CardAttributes();
            CurrentStability = 0;
            HasExploded = false;
        }

        public override string ToString()
        {
            return $"Progress: {CurrentAttributes} Stability:{CurrentStability} Exploded:{HasExploded}";
        }
    }
}
