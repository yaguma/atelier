namespace Atelier.Domain.Entities
{
    /// <summary>
    /// プレイヤーの状態を管理するエンティティクラス。
    /// ゴールド、名声、知識ポイントなどのリソースを保持する。
    /// </summary>
    public class Player
    {
        /// <summary>所持ゴールド</summary>
        public int Gold { get; set; }

        /// <summary>名声</summary>
        public int Fame { get; set; }

        /// <summary>知識ポイント（メタ進行用）</summary>
        public int KnowledgePoints { get; set; }

        /// <summary>
        /// プレイヤーを初期化するコンストラクタ。
        /// </summary>
        public Player()
        {
            Gold = 0;
            Fame = 0;
            KnowledgePoints = 0;
        }

        /// <summary>
        /// ゴールドを加算する。
        /// </summary>
        /// <param name="amount">加算量（負の値で減算）</param>
        public void AddGold(int amount)
        {
            Gold += amount;
        }

        /// <summary>
        /// 名声を加算する。
        /// </summary>
        /// <param name="amount">加算量</param>
        public void AddFame(int amount)
        {
            Fame += amount;
        }

        /// <summary>
        /// 知識ポイントを加算する。
        /// </summary>
        /// <param name="amount">加算量</param>
        public void AddKnowledgePoints(int amount)
        {
            KnowledgePoints += amount;
        }

        /// <summary>
        /// 指定コストを支払えるかを確認する。
        /// </summary>
        /// <param name="cost">確認するコスト</param>
        /// <returns>支払える場合はtrue</returns>
        public bool CanAfford(int cost)
        {
            return Gold >= cost;
        }

        /// <summary>
        /// 指定コストの支払いを試みる。
        /// </summary>
        /// <param name="cost">支払うコスト</param>
        /// <returns>支払いに成功した場合はtrue</returns>
        public bool TrySpend(int cost)
        {
            if (!CanAfford(cost))
            {
                return false;
            }

            Gold -= cost;
            return true;
        }

        public override string ToString()
        {
            return $"Player: Gold={Gold} Fame={Fame} KP={KnowledgePoints}";
        }
    }
}
